import express from 'express'
import http from 'http'
import fs from 'fs'
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io'
import { setInterval } from 'timers'

const PORT = process.env.PORT || 3333
const GRAVITY = 0.00981
const TICK_RATE = 50

const app = express()
const httpServer = http.createServer(app)
const socketServer = new Server(httpServer)

app.use(express.static('public'))

const MAP = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]

const colliders = []
for (let row = 0; row < MAP.length; row++) {
  for (let col = 0; col < MAP[row].length; col++) {
    let tile = MAP[row][col]
    if (tile === 1) {
      colliders.push({
        position: { x: col * 64, y: row * 64 },
        size: { x: 64, y: 64 },
      })
    }
  }
}

const PLAYERS = []
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKINS = fs.readdirSync(`${__dirname}/../public/assets/images`)

socketServer.on('connect', (socket) => {
  console.log(`Player connected with id: ${ socket.id}`)

  socket.emit('setup', MAP)

  PLAYERS.push({
    id: socket.id,
    name: `player_${socket.id}`,
    skin: `assets/images/${SKINS[Math.floor(Math.random() * SKINS.length)]}`,
    position: { x: Math.floor(Math.random() * 200), y: 0},
    velocity: { x: 0, y: 0},
    size: { x: 64, y: 64 },
  })

  socket.on('disconnect', (reason) => {
    const index = PLAYERS.findIndex(player => player.id === socket.id)
    
    if (index !== -1) {
      const player = PLAYERS.splice(index, 1)[0]
      
      if (player) {
        console.log(`Player: ${player.name} disconnected with reason: ${reason}`)
      }
    }
    
  })
})

const loop = (deltaTime) => {
  for (let player of PLAYERS) {
    player.velocity.y += GRAVITY * deltaTime
    player.position.y += player.velocity.y

    for (let collider of colliders) {
      if (isOverlapping(player, collider)) {
        player.position.y -= player.velocity.y
        player.velocity.y = 0
      }
    }
  }  

  socketServer.emit('players', PLAYERS)
}

function isOverlapping(a, b) {
  return (
    a.position.x < b.position.x + b.size.x &&
    a.position.x + a.size.x > b.position.x &&
    a.position.y < b.position.y + b.size.y &&
    a.size.y + a.position.y > b.position.y
  )
}

let lastTime = performance.now()
setInterval(() => {
  let now = performance.now()
  let deltaTime = now - lastTime
  loop(deltaTime) 
  lastTime = performance.now()
}, 1000 / TICK_RATE)

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})