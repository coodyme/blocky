import express from 'express'
import http from 'http'
import fs from 'fs'
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io'
import { setInterval } from 'timers'

const PORT = process.env.PORT || 3333
const GRAVITY = 0.0981
const TICK_RATE = 60

const app = express()
const httpServer = http.createServer(app)
const socketServer = new Server(httpServer)

app.use(express.static('public'))

const MAP = [
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1],
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

const inputMap = {}
const socketMap = {}
const ipMap = {}

socketServer.on('connect', (socket) => {
  const ip = 
    socket.handshake.headers['x-forwarded-for'] || 
    socket.handshake.headers['x-real-ip'] ||
    socket.handshake.address
  
  if (ipMap[ip]) {
    socket.disconnect()
    console.log(`Player disconnected: ${ socket.id} (max connections per ip reached)`)
    return
  }

  console.log(`Player connected with id: ${ socket.id}`)

  ipMap[ip] = true

  socket.emit('setup', MAP)

  PLAYERS.push({
    id: socket.id,
    name: `player_${socket.id}`,
    color: 'primary',
    position: { x: Math.floor(Math.random() * 500), y: 0},
    velocity: { x: 0, y: 0},
    size: { x: 32, y: 32 },
  })

  socket.on('disconnect', (reason) => {
    delete ipMap[ip]
    const index = PLAYERS.findIndex(player => player.id === socket.id)
    
    if (index !== -1) {
      const player = PLAYERS.splice(index, 1)[0]
      
      if (player) {
        console.log(`Player: ${player.name} disconnected with reason: ${reason}`)
      }
    }
    
  })

  socket.on('inputs', (inputs) => {
    inputMap[socket.id] = inputs
  })
})

const PLAYER_SPEED = 8

const loop = (deltaTime) => {
  for (let player of PLAYERS) {
    const inputs = inputMap[player.id] || { }

    if (inputs['ArrowUp']) {
      player.position.y -= PLAYER_SPEED * 3
    }

    if (inputs['ArrowLeft']) {
      player.position.x -= PLAYER_SPEED
      if (isColliding(player, colliders)) {
        player.position.x += PLAYER_SPEED
      }

    } else if (inputs['ArrowRight']) {
      player.position.x += PLAYER_SPEED
      if (isColliding(player, colliders)) {
        player.position.x -= PLAYER_SPEED
      }
    } 

    player.velocity.y += GRAVITY * deltaTime
    player.position.y += player.velocity.y

    if (isColliding(player, colliders)) {
      player.position.y -= player.velocity.y
      player.velocity.y = 0
    }
    
    socketServer.emit('players', PLAYERS)
  }
}

function isOverlapping(a, b) {
  return (
    a.position.x < b.position.x + b.size.x &&
    a.position.x + a.size.x > b.position.x &&
    a.position.y < b.position.y + b.size.y &&
    a.size.y + a.position.y > b.position.y
  )
}

function isColliding(player, colliders) {
  for (let collider of colliders) {
    if (isOverlapping(player, collider)) {
      return true
    }
  }
  return false
}

let lastTime = Date.now()
setInterval(() => {
  let now = Date.now()
  let deltaTime = now - lastTime
  loop(deltaTime) 
  lastTime = Date.now()
}, 1000 / TICK_RATE)

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})