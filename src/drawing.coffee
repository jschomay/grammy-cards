cardTemplate = (i, image) ->
  "<div id='card-#{i}' class='card face-down #{image}'>#{image}</div>"

renderCard = (card, i) ->
  Zepto(cardTemplate(i, card.image))

# Note, Zepto wont be ready when this function is defined, so
# it cant be partially appplied here
placeInDOM = ($card) ->
  $card.appendTo Zepto("#cards")

renderDeck = R.mapIndexed R.compose(placeInDOM, renderCard)

module.exports = {
  # takes an array of card definitions (deck)
  # returns array of card views in same order
  renderDeck
}
