import express from 'express';
import http from 'http'
import localtunnel from 'localtunnel';

const PORT = 3333;
const SUBDOMAIN = 'lorby';
const PREFIX = '[LORBY]';

const app = express()
const server = http.createServer(app)
const tunnel = localtunnel(PORT, { subdomain: SUBDOMAIN}, (err, tunnel) => {
  console.log(`${PREFIX} Tunnel is running on ${tunnel.url}`)
})

app.use(express.static('public'))

server.listen(3333, () => {
  console.log(`${PREFIX} Server is running on port ${PORT}`)
})

tunnel.on('close', () => {
  console.log(`${PREFIX} Tunnel is closed`)
})
