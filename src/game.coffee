cards = require "./cards"
frpfsm = require("../src/fsm");
preloadGameState = require "./states/preload"
startGameState = require "./states/start"
selectGameState = require "./states/select"
playGameState = require "./states/play"
endGameState = require "./states/end"

availableCards = [
  "bath"
  "dressing-up"
  "ice-cream"
  "painting"
  "park"
  "reading"
  "camping"
  "candy"
]

# on document ready
Zepto ->

  FastClick.attach(document.body)

  frpfsm.loadState
    name: "Preload"
    fn: preloadGameState
    transitions:
      "assetsReady": "Start"

  frpfsm.loadState
    name: "Start"
    fn: startGameState
    transitions:
      "begin": "Select"

  frpfsm.loadState
    name: "Select"
    fn: selectGameState.bind null, availableCards
    transitions:
      "play": "Play"

  frpfsm.loadState
    name: "Play"
    fn: playGameState
    transitions:
      "youWin": "End"

  frpfsm.loadState
    name: "End"
    fn: endGameState
    transitions:
      "startOver": "Start"

  # start!
  debug = true;
  currentState = frpfsm.start("Preload", availableCards, debug)
