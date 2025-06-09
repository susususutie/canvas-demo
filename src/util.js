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
