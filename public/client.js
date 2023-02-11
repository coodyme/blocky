import manager from './manager.js'

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const chatMessage = document.getElementById('chat-message');

const playersUl = document.getElementById('players');

const PREFIX = '[LORBY CLIENT]';

const socket = io()

const gameManager = manager()

socket.on('connect', () => {
  const playerId = socket.id
  console.log(`${PREFIX} Player connected on Client with id: ${playerId}`)
  //playersUl.innerHTML = gameManager.players.map(player => {player.name}).join('')
  gameManager.players.push(playerId)
  document.title = playerId
})

chatMessage.addEventListener('keyup', event => { 
  if (event.key === 'Enter' || event.keyCode === 13) {
    let message = {
      author: socket.id,
      content: chatMessage.value
    }
    socket.emit('sendMessage', message)
    chatMessage.value = ''
  }
 })