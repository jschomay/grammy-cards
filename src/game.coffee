cards = require "./cards"
drawing = require "./drawing"

deck = cards.getDeck()

buildCardStreams = R.mapIndexed ($card, i) ->
  # add ref to view for easy updating
  card = R.merge deck[i], {view: $card}
  Kefir.fromEvents($card, "click", R.always card)


# on document ready
Zepto ->
  $cards = drawing.renderDeck deck
  flipStream = Kefir.merge(buildCardStreams $cards)

  flipStream.log("card flipped:")
