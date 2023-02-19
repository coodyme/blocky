export default function createManager() {
  let players = []
  let messages = []

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