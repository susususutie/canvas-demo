import { pseudoRandom, clamp, isRectColliding } from './util'

export function getInitState(config) {
  return Object.freeze({
    dirty: true,
    // originPoint:{x,y} 对象原点，点在画布上的位置就是对象位置。
    // vertices: {x,y}[] 边界点，基于 originPoint定位
    user: {
      x: Math.floor(config.width * 0.5),
      y: config.height - 50,
      w: 26,
      h: 40,
      s: 100,
    },
    lastFire: undefined,
    bullets: [], // {x,y,w,h,s,isHit}
    lastGenerateEnemy: undefined,
    enemies: [], // {x,y,w,h,s,createTimestamp,deadTimestamp}
    lastTime: Date.now(),
  })
}

export function calcCurrentState(prevState, timestamp, eventState, config) {
  const newState = { ...prevState, dirty: false, user: { ...prevState.user }, lastTime: timestamp }
  const deltaTime = timestamp - prevState.lastTime
  const flashId = pseudoRandom(config.seed, timestamp)

  // bullets
  {
    newState.bullets = prevState.bullets
      .map(bullet => ({ ...bullet, y: bullet.y - (deltaTime * bullet.s) / 1000 }))
      .filter(bullet => bullet.y + bullet.h > 0)
    if (eventState.fire && (!prevState.lastFire || timestamp - prevState.lastFire > 200)) {
      newState.lastFire = timestamp
      newState.bullets.push({
        x: newState.user.x,
        y: newState.user.y,
        w: 8,
        h: 20,
        s: 140,
      })
    }
    if (newState.bullets.length > 0) {
      newState.dirty = true
    }
  }

  // enemies
  {
    // 清除死亡超过2秒的敌人
    newState.enemies = prevState.enemies.filter(enemy => !enemy.deadTimestamp || timestamp - enemy.deadTimestamp < 2000)
    // 更新敌人状态，已死亡的不再更新位置
    newState.enemies = newState.enemies.map(enemy => {
      if (!enemy.deadTimestamp) {
        const isProtect = timestamp - enemy.createTimestamp < 3000
        if (!isProtect) {
          for (let index = 0; index < newState.bullets.length; index++) {
            const bullet = newState.bullets[index]
            if (!bullet.isHit && isRectColliding(bullet, enemy)) {
              enemy.deadTimestamp = timestamp
              bullet.isHit = true
            }
          }
        }
        return { ...enemy, y: enemy.y + (deltaTime * enemy.s) / 1000 }
      }
      if (timestamp > enemy.deadTimestamp) {
        return { ...enemy }
      }
    })

    if (eventState.enemy && (!prevState.lastGenerateEnemy || timestamp - prevState.lastGenerateEnemy > 800)) {
      newState.lastGenerateEnemy = timestamp
      newState.enemies.push({
        x: Math.floor(((flashId % 555) / 555) * config.width),
        y: Math.floor(((flashId % 7) / 7) * -20),
        w: Math.floor(flashId % 13) + 5,
        h: Math.floor(flashId % 21) + 5,
        s: Math.floor(flashId % 21) + 60,
        createTimestamp: timestamp,
        deadTimestamp: undefined,
      })
    }
    // 清除屏幕外的敌人
    newState.enemies = newState.enemies.filter(enemy => enemy.y < config.height)
    if (newState.enemies.length > 0) {
      newState.dirty = true
    }
  }

  // user
  {
    let verticalSpeed
    let horizontalSpeed
    if ((eventState.up && eventState.down) || (!eventState.up && !eventState.down)) {
      verticalSpeed = 0
    } else {
      verticalSpeed = eventState.up ? -1 : 1
    }
    if ((eventState.left && eventState.right) || (!eventState.left && !eventState.right)) {
      horizontalSpeed = 0
    } else {
      horizontalSpeed = eventState.left ? -1 : 1
    }

    if (horizontalSpeed !== 0 && verticalSpeed !== 0) {
      newState.user.x = clamp(newState.user.x + (deltaTime * newState.user.s * Math.cos(1) * horizontalSpeed) / 1000, config.width)
      newState.user.y = clamp(newState.user.y + (deltaTime * newState.user.s * Math.cos(1) * verticalSpeed) / 1000, config.width)
      newState.dirty = true
    } else if (!horizontalSpeed && !verticalSpeed) {
      // do nothing
    } else {
      newState.dirty = true
      newState.user.x = clamp(newState.user.x + (deltaTime * newState.user.s * horizontalSpeed) / 1000, config.width)
      console.log(newState.user.x)
      newState.user.y = clamp(newState.user.y +(deltaTime * newState.user.s * verticalSpeed) / 1000, config.height)
    }
  }

  return Object.freeze(newState)
}
