cards = require "./cards"
drawing = require "./drawing"
startPlayGameState = require "./states/play"

# on document ready
Zepto ->
  # set up board to play
  # TODO - pass in the selectd cards
  deck = cards.getDeck()
  # TODO - reset view
  $cards = drawing.renderDeck deck
  cardStreams = startPlayGameState deck, $cards
