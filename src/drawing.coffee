cardTemplate = (id, image) ->
  "<div id='#{id}' class='card face-down #{image}'>#{image}</div>"

renderCard = (card) ->
  Zepto(cardTemplate(card.id, card.image))

# Note, Zepto wont be ready when this function is defined, so
# it cant be partially appplied here
placeInDOM = ($card) ->
  $card.appendTo Zepto("#cards")

renderDeck = R.reduce (acc, card) ->
  $card = R.compose(placeInDOM, renderCard) card
  R.assoc card.id, $card, acc
, {}

module.exports = {
  # takes an array of card definitions (deck)
  # returns object of id: $card for all cards
  renderDeck
}
