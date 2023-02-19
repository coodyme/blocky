import express from 'express';
import http from 'http'
//import localtunnel from 'localtunnel';
import { Server } from 'socket.io'

import {
  PORT,
  SUBDOMAIN,
  PREFIX_SERVER,
  EVENT_CONNECTION,
  EVENT_DISCONNECT,
  EVENT_SEND_MESSAGE,
  EVENT_SEND_MESSAGE_GLOBAL,
  EVENT_PREVIOUS_MESSAGES,
  EVENT_UPDATE_PLAYERS,
  EVENT_RECEIVE_MESSAGE,
  EVENT_DISCONNECTED_PLAYER,
  EVENT_NEW_PLAYER
} from './public/constants.js'
import createManager from './public/manager.js';

const app = express()
const httpServer = http.createServer(app)
const socketServer = new Server(httpServer)
const manager = createManager()


/* const tunnel = localtunnel(PORT, { subdomain: SUBDOMAIN}, (err, tunnel) => {
  console.log(`${PREFIX_SERVER} Tunnel is running on ${tunnel.url}`)
  if (err) {
    console.log(`${PREFIX_SERVER} Error: ${err}`)
  }
})
 */

app.use(express.static('public'))

let messages = []

socketServer.on(EVENT_CONNECTION, (socket) => {
  const player = {
    id: socket.id,
    name:`player_${socket.id}}`,
    x: 250,
    y: 250,
  }

  manager.players.push(player)

  socket.emit(EVENT_UPDATE_PLAYERS, manager.players)
  socket.broadcast.emit(EVENT_NEW_PLAYER, player)

  socket.emit(EVENT_PREVIOUS_MESSAGES, messages)
  
  console.log(`${PREFIX_SERVER} Connected: ${socket.id}`)

  socket.on(EVENT_SEND_MESSAGE, (message) => {
    console.log(message)
    messages.push(message)
    socket.broadcast.emit(EVENT_RECEIVE_MESSAGE, message)
  })

  socket.on(EVENT_DISCONNECT, () => {
/*     const disconnectedPlayerIndex = manager.players.findIndex(player => player.id === socket.id)
    
    if (disconnectedPlayerIndex !== -1) {
      const disconnectedPlayer = manager.players.splice(disconnectedPlayerIndex, 1)[0]
      
      if (disconnectedPlayer) {
        socket.broadcast.emit(EVENT_DISCONNECTED_PLAYER, disconnectedPlayer)
        socket.broadcast.emit(EVENT_UPDATE_PLAYERS, manager.players)
        
        console.log(`${PREFIX_SERVER} Disconnected: ${socket.id}`)
      }
    } */
  })

})

httpServer.listen(PORT, () => {
  console.log(`${PREFIX_SERVER} Server is running on port ${PORT}`)
})

/* tunnel.on('close', () => {
  console.log(`${PREFIX_SERVER} Tunnel is closed`)
})
 */