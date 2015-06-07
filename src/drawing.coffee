{CARD_STATES} = require "./cards"
classMap = {}
classMap[CARD_STATES.FACE_DOWN] = "face-down"
classMap[CARD_STATES.FACE_UP] = "face-up"

cardTemplate = (id, image, status) ->
  "<div id='#{id}' class='card #{classMap[status]} #{image}'></div>"

renderCard = (card) ->
  Zepto(cardTemplate(card.id, card.image, card.status))

# Note, Zepto wont be ready when this function is defined, so
# it cant be partially appplied here
placeInDOM = ($card) ->
  $card.appendTo Zepto("#cards")

renderDeck = R.reduce (acc, card) ->
  $card = R.compose(placeInDOM, renderCard) card
  R.assoc card.id, $card, acc
, {}

clearTable = ->
  Zepto("#cards").empty()
  Zepto("#message").hide()

renderMessage = (message) ->
  Zepto("#message").show().text message


module.exports = {
  # takes an array of card definitions (deck)
  # returns object of id: $card for all cards
  renderDeck
  clearTable
  renderMessage
}
