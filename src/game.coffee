cards = require "./cards"
frpfsm = require("../src/fsm");
preloadGameState = require "./states/preload"
selectGameState = require "./states/select"
playGameState = require "./states/play"
endGameState = require "./states/end"

# on document ready
Zepto ->

  frpfsm.loadState
    name: "Preload"
    state: preloadGameState
    transitions:
      "assetsReady": selectGameState

  frpfsm.loadState
    name: "Select"
    state: selectGameState
    transitions:
      "play": playGameState

  frpfsm.loadState
    name: "Play"
    state: playGameState
    transitions:
      "youWin": endGameState

  frpfsm.loadState
    name: "End"
    state: endGameState
    transitions:
      "startOver": selectGameState


  availableCards = [
    "camping"
    "candy"
    "menorah"
    "painting"
    "park"
    "bath"
  ]
  debug = true;
  currentState = frpfsm.start(preloadGameState, availableCards, debug)
