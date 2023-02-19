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

const PLAYERS = []
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKINS = fs.readdirSync(`${__dirname}/../public/assets/images`)

socketServer.on('connect', (socket) => {
  console.log(`Player connected with id: ${ socket.id}`)

  socket.emit('setup', MAP)

  PLAYERS.push({
    id: socket.id,
    name: `player_${SKINS[Math.floor(Math.random() * SKINS.length)]}`,
    skin: `assets/images/${SKINS[Math.floor(Math.random() * SKINS.length)]}`,
    position: { x: Math.floor(Math.random() * 100), y: 0},
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
    player.position.y = player.velocity.y
  }  

  socketServer.emit('players', PLAYERS)
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