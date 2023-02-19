import { 
  PREFIX_CLIENT,
  EVENT_CONNECT,
  EVENT_UPDATE_PLAYERS,
  EVENT_SEND_MESSAGE,
  EVENT_SEND_MESSAGE_GLOBAL,
  EVENT_PREVIOUS_MESSAGES,
  EVENT_RECEIVE_MESSAGE,
  EVENT_NEW_PLAYER
 } from './constants.js'
import { toggleElement } from '../public/utils.js'
import createManager from '../public/manager.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const userInput = document.getElementById('user-input');
const playButton = document.getElementById('play-button');
//const roomButton = document.getElementById('room-button');

const chatMessages = document.getElementById('chat-messages');
const chatMessageInput = document.getElementById('chat-message-input');
const chatMessageButton = document.getElementById('chat-message-button');

const statusPlayersList = document.getElementById('status-players-list');

const socket = io()
const manager = createManager()

let playing = false

userInput.onclick = () => {
  if (!playing) {
    playing = true
    const audio = new Audio('assets/audio/lorbiroto.mp3')
    audio.play()
  }
}

userInput.addEventListener('click', event => {
  if (userInput.value) {
    userInput.value = ''
  }
})

playButton.addEventListener('click', () => {
  const user = userInput.value
  if (user === 'Please enter a name') {
    userInput.value = ''
    userInput.focus()
    return 
  }
  else if (!user) {
    userInput.value = 'Please enter a name'
    return
  }

  const a = document.getElementById('menu-page').style.display = 'none'
  const b = document.getElementById('room-page').style.display = 'block'
})

canvas.width = window.innerWidth
canvas.height = window.innerHeight

function drawMessage(message) {
  let p = document.createElement('p')
  p.innerHTML = `${message.author}: ${message.content}`
  chatMessages.appendChild(p)
  chatMessages.scrollTop = chatMessages.scrollHeight
  
}

function drawGlobalMessage(message) {
  let p = document.createElement('p')
  p.innerHTML = `${message.author}: ${message.content}`
  chatMessages.appendChild(p)
  chatMessages.scrollTop = chatMessages.scrollHeight
}

socket.on(EVENT_CONNECT, () => {
  const playerId = socket.id
  console.log(`${PREFIX_CLIENT} Player connected on Client with id: ${playerId}`)


  console.log('asd', manager.players)

  for (const player in manager.players) {
    let x = Math.floor(Math.random() * (100))
    let y = Math.floor(Math.random() * (100))
    context.fillStyle = ['red', 'blue', 'green', 'yellow', 'purple'][Math.floor(Math.random() * 5)]
    context.fillRect(x, y, 100, 100)
    if (player.id === playerId) {
      let lorbiroto = new Image();
      lorbiroto.src = "assets/lorbiroto.png";
      context.drawImage(lorbiroto, player.x, player.y, 100, 100)
    } else {
      let lorbiroto = new Image();
      lorbiroto.src = "assets/lorbirinha.png";
      context.drawImage(lorbiroto, player.x, 100, 100, 100)
    }
  }
})

socket.on(EVENT_NEW_PLAYER, player => {
})

socket.on(EVENT_UPDATE_PLAYERS, players => {
  manager.players = players
})

socket.on(EVENT_PREVIOUS_MESSAGES, messages => {
  for (let message of messages) {
    drawMessage(message)
  }
})


socket.on(EVENT_RECEIVE_MESSAGE, message => {
  drawMessage(message)
})

socket.on(EVENT_SEND_MESSAGE_GLOBAL, message => {
  drawGlobalMessage(message)
})

chatMessageInput.addEventListener('keyup', event => { 
  if (event.key === 'Enter' || event.keyCode === 13) {
    let message = {
      author: socket.id,
      content: chatMessageInput.value
    }
    socket.emit(EVENT_SEND_MESSAGE, message)
    chatMessageInput.value = ''
    drawMessage(message)
  }
 })
