import express from 'express';
import http from 'http'
//import localtunnel from 'localtunnel';
import { Server } from 'socket.io'

import manager from './public/manager.js'
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
  EVENT_RECEIVE_MESSAGE
} from './public/constants.js'


const app = express()
const httpServer = http.createServer(app)
const socketServer = new Server(httpServer)

const gameManager = manager()

const inputsMap = {};

const SPEED = 5;

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
  gameManager.players.push({
    id: socket.id,
    name:`player_${socket.id}}`,
    x: 400,
    y: 400
  })

  console.log(gameManager.players.length)

  socket.emit(EVENT_UPDATE_PLAYERS, gameManager.players)
  socket.emit(EVENT_PREVIOUS_MESSAGES, messages)
  
  console.log(`${PREFIX_SERVER} New connection: ${socket.id}`)

  socket.on(EVENT_SEND_MESSAGE, (message) => {
    console.log(message)
    messages.push(message)
    socket.broadcast.emit(EVENT_RECEIVE_MESSAGE, message)
  })

  socket.on(EVENT_DISCONNECT, () => {
    const oldPlayerIndex = gameManager.players.findIndex(player => player.id === socket.id)
    
    if (oldPlayerIndex !== -1) {
      const oldPlayer = gameManager.players.splice(oldPlayerIndex, 1)[0]
      
      if (oldPlayer) {
        socket.broadcast.emit(EVENT_SEND_MESSAGE_GLOBAL, {
          author: PREFIX_SERVER,
          content: `${oldPlayer.name} has left the game.`
        })
        
        socket.emit(EVENT_UPDATE_PLAYERS, gameManager.players)
        
        console.log(`${PREFIX_SERVER} Disconnected: ${socket.id}`)
      }
    }
  })
  
  inputsMap[socket.id] = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  socket.on("inputs", (inputs) => {
    inputsMap[socket.id] = inputs;
  });
})

httpServer.listen(PORT, () => {
  console.log(`${PREFIX_SERVER} Server is running on port ${PORT}`)
})

/* tunnel.on('close', () => {
  console.log(`${PREFIX_SERVER} Tunnel is closed`)
})
 */