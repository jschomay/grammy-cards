drawing = require "../drawing"
winTemplate = require "../templates/win"

module.exports = (winningCards) ->

  # deck = cards.getDeck winningCards
  # $cards = drawing.renderDeck deck

  drawing.setMode "end"
  drawing.renderContent winTemplate

  # animate granny card
  Kefir.later(500)
    .onValue ->
      $('#end-page-card').addClass('appear')

  Kefir.fromEvents($('#play-again'), 'click')
    .take(1)
    .map -> ["startOver"]
    .onValue -> drawing.clearTable()
