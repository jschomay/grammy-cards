drawing = require "../drawing"
startTemplate = require "../templates/start"

module.exports = () ->

  drawing.setMode "start"
  drawing.renderContent startTemplate

  twoPairs = Kefir.fromEvents($('#two-pairs'), 'click')
    .map -> 2
  threePairs = Kefir.fromEvents($('#three-pairs'), 'click')
    .map -> 3
  fourPairs = Kefir.fromEvents($('#four-pairs'), 'click')
    .map -> 4

  Kefir.merge [twoPairs, threePairs, fourPairs]
    .take(1)
    .map (numberOfPairs) ->
      ["begin", numberOfPairs]
    .onValue ->
      drawing.clearTable()
