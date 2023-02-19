const clientSocket = io()

const canvas = document.getElementById('canvas')
const primaryColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--primary')
const secondaryColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--secondary')
const foregroundColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--foreground')

const context = canvas.getContext('2d')

const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight

canvas.width = WIDTH
canvas.height = HEIGHT 

let lastTimestamp = 0


function update(delta) {

}

function draw() {
  context.fillStyle = foregroundColor
  context.clearRect(0, 0, WIDTH, HEIGHT)
  context.fillRect(50, 50, 30, 30)
}

function loop(timestamp) {
  const delta = timestamp - lastTimestamp

  update(delta)
  draw()

  lastTimestamp = timestamp
  window.requestAnimationFrame(loop)
}

window.requestAnimationFrame(loop)