import { addEventListener, getEventState, getInitEventState } from './event-state'
import { getInitState, calcCurrentState } from './state'
import renderCanvas from './render-canvas'

let mockNow = 0
function getMockNow() {
  return 1749459346106 + (mockNow++ * 16)
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

main(document.querySelector('#cvs'), { seed: 833235 })
