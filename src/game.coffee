cards = require "./cards"
drawing = require "./drawing"

deck = cards.getDeck()
console.log deck

# on document ready
Zepto ->
  drawing.renderDeck deck
