import { addEventListener, getEventState, getInitEventState } from './event-state'
import { getInitState, calcCurrentState } from './state'
import renderCanvas from './render-canvas'
import { calcContourPoints } from './util'

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
canvas.width = canvas.clientWidth * 2
canvas.height = canvas.clientHeight * 2

const ctx = canvas.getContext('2d')
ctx.clearRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = '#eee'
ctx.fillRect(20, 20, canvas.width / 3, (canvas.height * 2) / 3)

ctx.fillStyle = '#ccc'
ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 4, 0, Math.PI * 2)
ctx.fill()

ctx.fillStyle = '#aaa'
ctx.beginPath()
ctx.moveTo((canvas.width * 3) / 4, 100)
ctx.lineTo(canvas.width / 2, (canvas.height * 3) / 4)
ctx.lineTo(canvas.width - 20, canvas.height - 20)
ctx.closePath() // 闭合路径
ctx.fill() // 填充三角形

const points = calcContourPoints(canvas, 8)
ctx.clearRect(0, 0, canvas.width, canvas.height)
points.forEach(point => {
  ctx.beginPath()
  ctx.moveTo(point.x, point.y)
  ctx.arc(point.x, point.y, 1, 0, Math.PI * 2)
  ctx.fill()
})

const cvs = document.querySelector('#preview').getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
cvs.putImageData(imageData, 0, 0)
