export function getInitEventState() {
  return Object.freeze({
    esc: false,
    up: false,
    down: false,
    left: false,
    right: false,
    fire: false,
    enemy: true,
  })
}

let __SCOPE__eventState = { up: false, down: false, left: false, right: false, esc: false, fire: false, enemy: true }
export function addEventListener() {
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      __SCOPE__eventState.esc = true
    }
    if (e.key === 'ArrowUp') {
      __SCOPE__eventState.up = true
    }
    if (e.key === 'ArrowDown') {
      __SCOPE__eventState.down = true
    }
    if (e.key === 'ArrowLeft') {
      __SCOPE__eventState.left = true
    }
    if (e.key === 'ArrowRight') {
      __SCOPE__eventState.right = true
    }
    if (e.key === ' ') {
      __SCOPE__eventState.fire = true
    }
  })
  window.addEventListener('keyup', e => {
    if (e.key === 'Escape') {
      __SCOPE__eventState.esc = false
    }
    if (e.key === 'ArrowUp') {
      __SCOPE__eventState.up = false
    }
    if (e.key === 'ArrowDown') {
      __SCOPE__eventState.down = false
    }
    if (e.key === 'ArrowLeft') {
      __SCOPE__eventState.left = false
    }
    if (e.key === 'ArrowRight') {
      __SCOPE__eventState.right = false
    }
    if (e.key === ' ') {
      __SCOPE__eventState.fire = false
    }
  })
}

export function getEventState() {
  return Object.freeze({ ...__SCOPE__eventState })
}
