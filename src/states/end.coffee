drawing = require "../drawing"

module.exports = (winningCards) ->

  # deck = cards.getDeck winningCards
  # $cards = drawing.renderDeck deck

  drawing.renderMessage "YOU WIN!"

  Kefir
    .later 2000, ["startOver"]
    .onValue -> drawing.clearTable()
