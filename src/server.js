import express from 'express'
import http from 'http'
import { Server } from 'socket.io'

const PORT = process.env.PORT || 3333

const app = express()
const httpServer = http.createServer(app)
const socketServer = new Server(httpServer)

app.use(express.static('public'))

socketServer.on('connect', (socket) => {
  console.log(`Player connect with id: ${ socket.id}`)

  socket.on('disconnect', (reason) => {
    console.log(`Player disconnect with reason: ${reason}`)
  })
})

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})