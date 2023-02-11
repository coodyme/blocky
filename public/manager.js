import player from './player.js'

export default function manager() {
  let players = []

  function registerPlayer(id, name, position) {
    state.players.push({
      id,
      name,
      position
    })
  }

  return {
    players,
    registerPlayer
  }
}