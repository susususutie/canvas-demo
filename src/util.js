export function pseudoRandom(seed, timestamp) {
  // 定义 LCG 的参数
  const a = 1664525 // 乘数
  const c = 1013904223 // 增量
  const m = 2 ** 32 // 模数

  // 使用种子和时间戳生成初始值
  let x = (seed ^ timestamp) % m

  // 生成下一个随机数
  x = (a * x + c) % m

  // 返回生成的随机数
  return x
}

// 限制数值范围
export function clamp(value, max, min = 0) {
  return Math.min(Math.max(value, min), max)
}

export function isRectColliding(rect1, rect2) {
  // 检查水平方向是否有重叠
  const isOverlappingX = rect1.x < rect2.x + rect2.w && rect1.x + rect1.w > rect2.x

  // 检查垂直方向是否有重叠
  const isOverlappingY = rect1.y < rect2.y + rect2.h && rect1.y + rect1.h > rect2.y

  // 如果两个方向都有重叠，则发生碰撞
  return isOverlappingX && isOverlappingY
}

/**
 * 计算 AABB 包围盒尺寸，得到的是一个与坐标轴平行的包围盒尺寸
 */
export function calculateAABB(vertices) {
  let minX = Infinity,
    minY = Infinity
  let maxX = -Infinity,
    maxY = -Infinity

  vertices.forEach(vertex => {
    if (vertex.x < minX) minX = vertex.x
    if (vertex.y < minY) minY = vertex.y
    if (vertex.x > maxX) maxX = vertex.x
    if (vertex.y > maxY) maxY = vertex.y
  })

  return { minX, minY, maxX, maxY }
}

/**
 * 计算边界球，传入点集合坐标，计算点集合的边界球中心点、半径
 */
export function calculateBoundingSphere(vertices) {
  let center = { x: 0, y: 0 }
  let maxDistance = 0

  vertices.forEach(vertex => {
    center.x += vertex.x
    center.y += vertex.y
  })

  center.x /= vertices.length
  center.y /= vertices.length

  vertices.forEach(vertex => {
    let distance = Math.sqrt((vertex.x - center.x) ** 2 + (vertex.y - center.y) ** 2)
    if (distance > maxDistance) maxDistance = distance
  })

  return { center, radius: maxDistance }
}

/**
 * 两个 AABB 的碰撞检测
 */
export function intersectsAABB(aabb1, aabb2) {
  return !(aabb1.maxX < aabb2.minX || aabb1.minX > aabb2.maxX || aabb1.maxY < aabb2.minY || aabb1.minY > aabb2.maxY)
}

/**
 * 两个边界球的碰撞检测
 */
export function intersectsBoundingSphere(sphere1, sphere2) {
  let distance = Math.sqrt((sphere1.center.x - sphere2.center.x) ** 2 + (sphere1.center.y - sphere2.center.y) ** 2)
  return distance < sphere1.radius + sphere2.radius
}

/**
 * AABB 与边界球
 */
export function intersectsAABBSphere(aabb, sphere) {
  let closestX = Math.clamp(sphere.center.x, aabb.minX, aabb.maxX)
  let closestY = Math.clamp(sphere.center.y, aabb.minY, aabb.maxY)

  let distance = Math.sqrt((closestX - sphere.center.x) ** 2 + (closestY - sphere.center.y) ** 2)
  return distance < sphere.radius
}

function sampleOutline(points, precision) {
  const sampledPoints = []
  const n = points.length

  // Step 1: 计算每个点的局部密度
  const densities = new Array(n).fill(0)
  for (let i = 0; i < n; i++) {
    let density = 0
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        const dx = points[i].x - points[j].x
        const dy = points[i].y - points[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)
        density += 1 / (distance + 1e-6) // 避免除零
      }
    }
    densities[i] = density
  }

  // Step 2: 选择采样点
  const selected = new Array(n).fill(false)
  for (let i = 0; i < n; i++) {
    if (!selected[i]) {
      // 检查当前点与已选择的采样点的距离
      let isSampled = true
      for (let j = 0; j < sampledPoints.length; j++) {
        const dx = points[i].x - sampledPoints[j].x
        const dy = points[i].y - sampledPoints[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < precision) {
          isSampled = false
          break
        }
      }

      if (isSampled) {
        sampledPoints.push(points[i])
        selected[i] = true
      }
    }
  }

  return sampledPoints
}

/**
 * 计算图形的轮廓点
 */
export function calcContourPoints(canvas, precision) {
  // Step 1: 获取 Canvas 上的图像数据
  const ctx = canvas.getContext('2d')
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  // Step 2: 进行边缘检测
  const threshold = 10 // 颜色差异阈值，可根据需要调整
  const edges = new Uint8Array(Math.ceil((canvas.width * canvas.height) / 8)) // 总像素点个数/
  console.log('edges', edges.length)

  for (let i = 0; i < data.length; i += 4) {
    const pIndex = i / 4 // 第x个像素点
    const x = pIndex % canvas.width
    const y = Math.floor(pIndex / canvas.width)
    if (x === 0 || y === 0 || x === canvas.width || y === canvas.height) continue

    // 当前像素的 RGBA 值
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]

    if (a === 0) continue

    // 检查相邻像素，x为当前像素，o为相邻像素
    // o o o
    // o x o
    // o o o
    let isEdge = false
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue // 跳过当前像素

        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || nx > canvas.width || ny < 0 || ny > canvas.height) continue // 跳过画布外的相邻像素

        const index = (ny * canvas.width + nx) * 4
        const nr = data[index]
        const ng = data[index + 1]
        const nb = data[index + 2]
        const na = data[index + 3]

        // 计算颜色差异
        const diff = Math.abs(r - nr) + Math.abs(g - ng) + Math.abs(b - nb) + Math.abs(a - na)
        if (diff > threshold) {
          isEdge = true
          break
        }
      }
      if (isEdge) break
    }

    // 如果是边缘点，标记为1
    if (isEdge) {
      // edges 每一项为 8位二进制数，可以存8个像素点的信息
      const edgeIndex = Math.floor(pIndex / 8)
      const groupValue = edges[edgeIndex].toString(2).padStart(8, '0').split('')
      groupValue[pIndex % 8] = 1
      edges[edgeIndex] = parseInt(groupValue.join(''), 2)
    }
  }

  // Step 3: 提取轮廓点坐标
  const points = []
  edges.forEach((value, index) => {
    if (!value) {
      return
    }
    const groupValue = value.toString(2).padStart(8, '0').split('')
    groupValue.forEach((p, i) => {
      if (+p) {
        const pIndex = index * 8 + i
        const x = pIndex % canvas.width
        const y = Math.floor(pIndex / canvas.width)
        points.push({ x, y })
      }
    })
  })
  console.log('points', points.length)

  // Step 4: 基于局部密度的采样
  const sampledPoints = sampleOutline(points, precision)
  console.log('sampledPoints', sampledPoints.length)

  return sampledPoints
}
