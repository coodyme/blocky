import manager from './manager.js'
import { 
  PREFIX_CLIENT,
  EVENT_CONNECT,
  EVENT_UPDATE_PLAYERS,
  EVENT_SEND_MESSAGE,
  EVENT_SEND_MESSAGE_GLOBAL,
  EVENT_PREVIOUS_MESSAGES,
  EVENT_RECEIVE_MESSAGE
 } from './constants.js'
import { toggleElement } from './utils.js'

const canvas = document.getElementsByClassName('canvas')[0];
const context = canvas.getContext('2d');
const userInput = document.getElementById('user-input');
const playButton = document.getElementById('play-button');
const roomButton = document.getElementById('room-button');

const chatMessages = document.getElementById('chat-messages');
const chatMessageInput = document.getElementById('chat-message-input');
const chatMessageButton = document.getElementById('chat-message-button');

const statusPlayersList = document.getElementById('status-players-list');

const socket = io()
const gameManager = manager()

const skins = ['lorbi', 'milos', 'lorbiroto', 'lorbilove']

userInput.addEventListener('click', event => {
  if (userInput.value) {
    userInput.value = ''
  }
})

playButton.addEventListener('click', () => {
  window.alert('keep calm, lorby is coming soon')
  return
  toggleElement('menu-page')
  toggleElement('game-page')
})

roomButton.addEventListener('click', () => {
  const user = userInput.value
  if (!user) {
    userInput.value = 'Please enter a name'
    return
  }
  toggleElement('menu-page')
  toggleElement('chat-page')
})


canvas.width = window.innerWidth
canvas.height = window.innerHeight

context.font = "48px serif";
context.fillStyle = "red";
context.fillText("Welcome to Lorbiroto Place", 150, 150);

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
  gameManager.players.push(playerId)
  document.title = playerId
})

socket.on(EVENT_UPDATE_PLAYERS, players => {
  statusPlayersList.innerHTML = ''
  for (let player of players) {
    let li = document.createElement('li')
    li.innerHTML = player.id
    statusPlayersList.appendChild(li)
  }

  console.log(players)

  for(let player in gameManager.players) {
    let img = document.createElement('img')
    let skin = skins[Math.floor(Math.random() * skins.length)]
    img.src = `./assets/${skin}.png`
    let x = Math.floor(Math.random() * canvas.width)
    let y = Math.floor(Math.random() * canvas.height)
    img.onload = () => {
      context.drawImage(img, x, y, 50, 50)
    }
  }
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