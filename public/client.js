const clientSocket = io()

const canvas = document.getElementById('canvas')
const primaryColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--primary')
const secondaryColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--secondary')
  const backgroundColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--background')
  const foregroundColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--foreground')

const context = canvas.getContext('2d')

const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const TILE_SIZE = 64
const PLAYER_SIZE = 64

canvas.width = WIDTH
canvas.height = HEIGHT 

let clientMap = []
let clientPlayers = []

const SKINS = ['lorbiroto', 'lorbirinha', 'milos', 'lorbiman', 'lorbipresso']

const inputs = {
  'ArrowUp': false,
  'ArrowDown': false,
  'ArrowLeft': false,
  'ArrowRight': false,
}


clientSocket.on('setup', (map) => {
  clientMap = map
})

clientSocket.on('players', (players) => {
  clientPlayers = players
})
 
document.addEventListener('keydown', (event) => {
  if (event.key in inputs) {
    inputs[event.key] = true
  }
  console.log(inputs)
})

document.addEventListener('keyup', (event) => {
  if (event.key in inputs) {
    inputs[event.key] = false
  }
})


function update(delta) {
  clientSocket.emit('inputs', inputs)
}

function draw() {
  context.clearRect(0, 0, WIDTH, HEIGHT)
  
    context.fillStyle = foregroundColor
    for (let row = 0; row < clientMap.length; row++) {
      for (let col = 0; col < clientMap[row].length; col++) {
        const tile = clientMap[row][col]

        if (tile === 1) {
          context.fillRect(
            col * TILE_SIZE,
            row * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE
          )
        }
      }
    }

    for (let player of clientPlayers) {
      let skin = new Image()
      skin.src = player.skin
      context.drawImage(
        skin,
        player.position.x,
        player.position.y,
        PLAYER_SIZE,
        PLAYER_SIZE
      )

      context.fillText(player.name, player.position.x / 1.5, player.position.y - 10 )
    }
}

let deltaTime = 0
let time = 0
let fps = 0

function loop(timestamp) {
  deltaTime = (timestamp - time) / 1000
  time = timestamp

  fps = Math.round(1 / deltaTime)
  
  update(deltaTime)
  draw()

  console.log(fps, deltaTime)
  window.requestAnimationFrame(loop)
}

window.requestAnimationFrame(loop)
