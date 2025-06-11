import { addEventListener, getEventState, getInitEventState } from './event-state'
import { getInitState, calcCurrentState } from './state'
import renderCanvas from './render-canvas'
import { calcContourPoints } from './util'
import flight from './flight.png'

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

const img = new Image()
img.src = flight
img.onload = () => {
  const canvas = document.querySelector('#preview')
  canvas.width = img.width / 3 + 10
  canvas.height = img.height / 3 + 10
  canvas.style.height = '300px'
  canvas.style.width = (canvas.width * 300) / canvas.height + 'px'
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 5, 5, canvas.width - 10, canvas.height - 10)

  const points = calcContourPoints(canvas, 6)
  console.log('points', points.flatMap(point => [point.x, point.y]))
  const cvs = document.querySelector('#cvs')
  cvs.style.width = canvas.clientWidth + 'px'
  cvs.style.height = canvas.clientHeight + 'px'
  cvs.width = canvas.width - 10
  cvs.height = canvas.height - 10
  const context = cvs.getContext('2d')
  points.forEach((point, index) => {
    context.beginPath()
    context.arc(point.x - 5, point.y - 5, 1, 0, Math.PI * 2)
    context.fill()
    if (index > 0) {
      context.beginPath()
      context.moveTo(points[index - 1].x, points[index - 1].y)
      context.lineTo(point.x, point.y)
    }
  })
}
