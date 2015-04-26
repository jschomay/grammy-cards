cards = require "./cards"
drawing = require "./drawing"

deck = cards.getDeck()

buildCardStreams = R.mapIndexed ($card, i) ->
  # add ref to view for easy updating
  card = R.merge deck[i], {view: $card}
  Kefir.fromEvents($card, "click", R.always card)


isEven = (n) -> n % 2


# on document ready
Zepto ->
  $cards = drawing.renderDeck deck
  flipStream = Kefir.merge(buildCardStreams $cards)

  flipCountStream = flipStream.scan(R.add(1), 0)

  firstCardStream = flipStream.filterBy(flipCountStream.map(isEven))
  secondCardStream = flipStream.filterBy(flipCountStream.map(R.compose(R.not, isEven)))

  pairsStream = Kefir.zip([firstCardStream, secondCardStream])

  matchStream = pairsStream.map(R.apply(R.eqProps("image")))

  roundCountStream = firstCardStream.scan(R.add(1), 0)

  roundCountStream.skip(1).log("Round:")
  firstCardStream.map(R.prop("image")).log("First card:")
  secondCardStream.map(R.prop("image")).log("Second card:")
  matchStream.log("IsMatch?:")


