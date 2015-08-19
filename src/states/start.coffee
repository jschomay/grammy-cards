drawing = require "../drawing"
startTemplate = require "../templates/start"

module.exports = () ->

  drawing.setMode "start"
  drawing.renderContent startTemplate

  twoPairs = Kefir.fromEvents($('#2-pairs'), 'click')
    .map -> 2
  threePairs = Kefir.fromEvents($('#3-pairs'), 'click')
    .map -> 3
  fourPairs = Kefir.fromEvents($('#4-pairs'), 'click')
    .map -> 4

  Kefir.merge [twoPairs, threePairs, fourPairs]
    .take(1)
    .map (numberOfPairs) ->
      ["begin", numberOfPairs]
    .onValue ->
      drawing.clearTable()
