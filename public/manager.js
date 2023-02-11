import player from './player.js'

export default function manager() {
  const state = {
    players: [],
  }

  function registerPlayer(id, name, position) {
    let newPlayer = player()
    newPlayer.state = {
      id,
      name,
      position
    }
    state.players.push(newPlayer)
  }

  return {
    state,
    registerPlayer
  }
}