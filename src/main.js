import { addEventListener, getEventState, getInitEventState } from './event-state'
import { getInitState, calcCurrentState } from './state'
import renderCanvas from './render-canvas'
import { getOutlinePoints } from './util'

let mockNow = 0
function getMockNow() {
  return 1749459346106 + mockNow++ * 16
}

function main(canvas, cfg) {
  const config = Object.freeze({
    seed: cfg?.seed || Math.floor(Math.random() * 10 ** 6),
    width: cfg?.width || 800,
    height: cfg?.height || 600,
  })
  let eventState = getInitEventState()
  let state = getInitState(config)
  let loopTimer = null
  addEventListener()
  renderCanvas(canvas, config, state)

  function runLoop() {
    const now = getMockNow() // Date.now()

    eventState = getEventState(eventState)
    if (eventState.esc) {
      cancelAnimationFrame(loopTimer)
      return
    }

    // update
    state = calcCurrentState(state, now, eventState, config)

    // render
    // renderLog(state)
    if (state.dirty) {
      renderCanvas(canvas, config, state)
    }

    loopTimer = requestAnimationFrame(runLoop)
  }
  runLoop()
}

// main(document.querySelector('#cvs'), { seed: 833235 })

const canvas = document.querySelector('#cvs')
const ctx = canvas.getContext('2d')
ctx.fillStyle = '#ccc'

ctx.clearRect(0, 0, canvas.width, canvas.height)
ctx.arc(50, 50, 40, 0, Math.PI * 2)
ctx.fill()

ctx.beginPath()
ctx.moveTo(50, 100)
ctx.lineTo(10, 260)
ctx.lineTo(90, 260)
ctx.closePath() // 闭合路径
ctx.fill() // 填充三角形

ctx.fillRect(120, 40, 100, 150)
ctx.fillRect(120, 120, 200, 150)

const points = getOutlinePoints(canvas, 4)
ctx.clearRect(0, 0, canvas.width, canvas.height)
points.forEach(point => {
  ctx.beginPath()
  ctx.moveTo(point.x, point.y)
  ctx.arc(point.x, point.y, 1, 0, Math.PI * 2)
  ctx.fill()
})
