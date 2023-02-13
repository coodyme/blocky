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
const gameManager = manager()

const skins = ['lorbi', 'milos', 'lorbiroto', 'lorbilove', 'lorbipresso']

const lorbiroto = new Image();
lorbiroto.src = "assets/lorbiroto.png";

userInput.addEventListener('click', event => {
  if (userInput.value) {
    userInput.value = ''
  }
})

playButton.addEventListener('click', () => {
  const user = userInput.value
  if (!user) {
    userInput.value = 'Please enter a name'
    return
  }
  toggleElement('menu-page')
  toggleElement('chat-page')
})

/* roomButton.addEventListener('click', () => {
  const user = userInput.value
  if (!user) {
    userInput.value = 'Please enter a name'
    return
  }
  toggleElement('menu-page')
  toggleElement('chat-page')
}) */


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
  document.title = playerId
})

socket.on(EVENT_UPDATE_PLAYERS, players => {
  statusPlayersList.innerHTML = ''
  for (let player of players) {
    let li = document.createElement('li')
    li.innerHTML = player.id
    statusPlayersList.appendChild(li)
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

 const inputs = {
  up: false,
  down: false,
  left: false,
  right: false,
};

 window.addEventListener("keydown", (e) => {
  if (e.key === "w") {
    inputs["up"] = true;
  } else if (e.key === "s") {
    inputs["down"] = true;
  } else if (e.key === "d") {
    inputs["right"] = true;
  } else if (e.key === "a") {
    inputs["left"] = true;
  }
  
  socket.emit("inputs", inputs);
});

window.addEventListener("keyup", (e) => {
  if (e.key === "w") {
    inputs["up"] = false;
  } else if (e.key === "s") {
    inputs["down"] = false;
  } else if (e.key === "d") {
    inputs["right"] = false;
  } else if (e.key === "a") {
    inputs["left"] = false;
  }
  if (["a", "s", "w", "d"].includes(e.key)) {

  }
  socket.emit("inputs", inputs);
});

function update() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  for(const player in gameManager.players) {
    const inputs = inputsMap[player.id];
    const previousY = player.y;
    const previousX = player.x;

    if (inputs.up) {
      player.y -= SPEED;
    } else if (inputs.down) {
      player.y += SPEED;
    }

    if (inputs.left) {
      player.x -= SPEED;
    } else if (inputs.right) {
      player.x += SPEED;
    }
    context.drawImage(lorbiroto, player.x, player.y);
    console.log(player)
  }
  window.requestAnimationFrame(update)
}

window.requestAnimationFrame(update)