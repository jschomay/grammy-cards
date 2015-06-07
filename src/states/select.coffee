cards = require "../cards"
drawing = require "../drawing"

module.exports = ->

  deck = cards.getAvailableCards()
  $cards = drawing.renderDeck deck

  drawing.renderMessage "Pick the cards you want to play with:"

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
    .map (selectedCards) ->
      ["play", selectedCards]
    .onValue ->
      selectedCards.offValue highlight
      drawing.clearTable()
