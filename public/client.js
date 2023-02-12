import manager from './manager.js'

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const chatMessage = document.getElementById('chat-message');
const chatContent = document.getElementById('chat-content');

const playersUl = document.getElementById('players');

const PREFIX = '[LORBY CLIENT]';

const socket = io()

const gameManager = manager()

const skins = ['lorbi', 'milos', 'lorbiroto', 'lorbilove']

function drawMessage(message) {
  let p = document.createElement('p')
  p.innerHTML = `${message.author}: ${message.content}`
  chatContent.appendChild(p)
}

socket.on('connect', () => {
  const playerId = socket.id
  console.log(`${PREFIX} Player connected on Client with id: ${playerId}`)
  //playersUl.innerHTML = gameManager.players.map(player => {player.name}).join('')
  gameManager.players.push(playerId)
  document.title = playerId

  // Draw Player
  for(let player in gameManager.players) {
    let img = document.createElement('img')
    let skin = skins[Math.floor(Math.random() * skins.length)]
    img.src = `./assets/${skin}.png`
    img.onload = () => {
      context.drawImage(img, Math.random(10,50), Math.random(10,50), 50, 50)
    }
  }
})

socket.on('previousMessages', messages => {
  for (let message of messages) {
    drawMessage(message)
  }
})


socket.on('receivedMessage', message => {
  drawMessage(message)
})

chatMessage.addEventListener('keyup', event => { 
  if (event.key === 'Enter' || event.keyCode === 13) {
    let message = {
      author: socket.id,
      content: chatMessage.value
    }
    socket.emit('sendMessage', message)
    chatMessage.value = ''
    drawMessage(message)
  }
 })