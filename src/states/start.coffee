drawing = require "../drawing"

module.exports = () ->

  drawing.renderMessage "Grammy cards!  How many cards do you want to play with...?"
  drawing.setMode "start"

  Kefir.later(2000)
    .map ->
      numberOfCardsInPlay = 4
      ["begin", numberOfCardsInPlay]
