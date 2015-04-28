###
GAME FLOW

Streams (cards 2 and 3 match)
card1 clicks   ---1----------------------
card2 clicks   ------2-------------2-----
card3 clicks   ------------3--3----------
flips          0--1--2-----3-------4-----
rounds         0--1--------2-------------
match          ------f-------------t-----
update cards   f-------f-------------t---
card1 status   d--u----d-----------------
card2 status   d-----u-d-----------u-m---
card3 status   d-----------u---------m---

Card status:
d = face down
u = face up
m = matched

Stream rules / definitions:

Match stream:
- buffer card status until round end (every 2 flips)
- do the images match?

Update cards stream:
- pass match value on after a 2 second delay

Card value:
- start face down
- respond to matching card click stream once, turning face up
- after turning face up, respond to update cards stream - go face down if false, matched if true
- after turning face down, listen to matching card click stream again
- only respond do clicks when play is active (between "update cards" and "match" events)

Side effects from each card value stream:
- on a card going face up, render card's image
- on a card going face down, render card's back
- on a card going matched, remove from grid

###
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


