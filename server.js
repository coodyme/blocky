import express from 'express';
import http from 'http'
//import localtunnel from 'localtunnel';
import { Server } from 'socket.io'

import manager from './public/manager.js'

const PORT = 3333;
const SUBDOMAIN = 'lorby';
const PREFIX = '[LORBY SERVER]';

const app = express()
const server = http.createServer(app)
const socket = new Server(server)

const gameManager = manager()

/* const tunnel = localtunnel(PORT, { subdomain: SUBDOMAIN}, (err, tunnel) => {
  console.log(`${PREFIX} Tunnel is running on ${tunnel.url}`)
  if (err) {
    console.log(`${PREFIX} Error: ${err}`)
  }
})
 */
app.use(express.static('public'))

socket.on('connection', (socket) => {
  console.log(`${PREFIX} New connection: ${socket.id}`)

  gameManager.registerPlayer(
    socket.id,
    `player_${socket.id}}`,
    [Math.random(500), Math.random(500)]
  )

  socket.on('message', (data) => {
    console.log(`${PREFIX} Message received: ${data}`)
    socket.broadcast.emit('message', data)
  })
})

server.listen(3333, () => {
  console.log(`${PREFIX} Server is running on port ${PORT}`)
})

/* tunnel.on('close', () => {
  console.log(`${PREFIX} Tunnel is closed`)
})
 */