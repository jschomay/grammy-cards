cards = require "./cards"
startPlayGameState = require "./states/play"

# on document ready
Zepto ->

  # TODO - generate this async through stream
  selectedCards = [
    "camping"
    "candy"
    "menorah"
    "painting"
    "park"
    "bath"
  ]

  cardStreams = startPlayGameState selectedCards
