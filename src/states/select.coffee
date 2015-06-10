cards = require "../cards"
drawing = require "../drawing"

module.exports = (availableImages) ->

  deck = cards.getCards availableImages
  $cards = drawing.renderDeck deck

  drawing.renderMessage "Pick 4 cards to play with:"

  drawing.setMode "select"

  highlight = (selected) ->
    for card in selected
      $cards[card].addClass "selected"

  makeClickStreams = R.pipe R.toPairs, R.map (elem) ->
    id = elem[0]
    $card = elem[1]
    Kefir
      .fromEvents($card, "click", R.always id)

  cardClicks = makeClickStreams $cards

  selectedCards = Kefir
    .merge cardClicks
    .scan (prev, next) ->
      if next in prev
        prev
      else
        R.append next, prev
    , []
    .onValue highlight

  finished = selectedCards
    .skipWhile R.compose(R.gt(4), R.length)
    .take(1)
    .delay 1000
    .map (selectedCards) ->
      ["play", selectedCards]
    .onValue ->
      selectedCards.offValue highlight
      drawing.clearTable()
