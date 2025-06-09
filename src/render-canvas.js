/**
 * @param {HTMLCanvasElement} canvas
 * @param {{user:{x:number,y:number,w:number,h:number}}} state
 */
export default function renderCanvas(canvas, config, state) {
  const context = canvas.getContext('2d')

  // clear
  context.clearRect(0, 0, canvas.width, canvas.height)

  // background
  context.fillStyle = 'white'
  context.fillRect(0, 0, canvas.width, canvas.height)

  // draw user
  context.strokeStyle = 'black'
  // console.log(
  //   state.user.x - state.user.w / 2,
  //   state.user.y,
  //   state.user.w,
  //   state.user.h
  // )
  context.strokeRect(state.user.x - state.user.w / 2, state.user.y, state.user.w, state.user.h)

  // draw bullets
  context.fillStyle = 'black'
  // console.log(state.bullets.map(bullet => `(${bullet.x},${bullet.y})`).join('|'))
  for (const bullet of state.bullets) {
    context.fillRect(bullet.x - bullet.w / 2, bullet.y, bullet.w, bullet.h)
  }

  // draw enemies
  // console.log(state.enemies.length, state.enemies.map(enemy => `(${enemy.x})`).join('|'))
  context.fillStyle = '#eee'
  for (const enemy of state.enemies) {
    context.fillRect(enemy.x - enemy.w / 2, enemy.y, enemy.w, enemy.h)
  }
}
