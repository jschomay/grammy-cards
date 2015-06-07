cards = require "./cards"
frpfsm = require("../src/fsm");
selectGameState = require "./states/select"
playGameState = require "./states/play"
endGameState = require "./states/end"

# on document ready
Zepto ->

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

  debug = true;
  currentState = frpfsm.start(selectGameState, null, debug)
