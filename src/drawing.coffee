cardTemplate = (i, image) ->
  "<div id='card-#{i}' class='card face-down #{image}'>#{image}</div>"

renderCard = (card, i) ->
  Zepto(cardTemplate(i, card.image))

renderDeck = (deck) ->
  placeInDOM = (card) -> Zepto("#cards").append card
  $cards = R.mapIndexed R.compose(placeInDOM, renderCard), deck

module.exports = {
  renderDeck
}
