import manager from './manager.js'

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const playersUl = document.getElementById('players');

const PREFIX = '[LORBY CLIENT]';

const socket = io()

const gameManager = manager()

socket.on('connect', () => {
  const playerId = socket.id
  console.log(`${PREFIX} Player connected on Client with id: ${playerId}`)
})

if (gameManager.state.players.length > 0) {
  playersUl.innerHTML = gameManager.players.map(player => {player.name}).join('')
}

console.log(gameManager.players)

context.fillRect(0,0, 150, 75)