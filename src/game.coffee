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

Flip stream:
- you can't flip the same card twice in a row if the round hasn't changed

Match stream:
- buffer card status until round end (every 2 flips)
- do the images match?

Update cards stream:
- pass match value on after a 2 second delay

Card value:
- start face down
- respond to matching flip stream once, turning face up
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

# takes object id: $card
# returns array of click streams for each $card
# (each click passes the id of its associated card)
makeClickStreams = R.pipe R.toPairs, R.map (elem) ->
  id = elem[0]
  $card = elem[1]
  Kefir.fromEvents($card, "click", R.always id)


# on document ready
Zepto ->
  $cards = drawing.renderDeck deck
  cardClicks = makeClickStreams $cards

  validFlip = Kefir.merge(cardClicks)
    .scan (acc, event) ->
      if acc.faceUps.length is 2
        # first flip (always valid)
        {faceUps: [event], valid: true}
      else
        # second flip (must be a different card)
        if R.contains event, acc.faceUps
          R.merge acc, {valid: false}
        else
          faceUps = R.append event, acc.faceUps
          {faceUps: faceUps, valid: true}
    , {faceUps: [], valid: false}
    .map R.prop "valid"

  # stores valid first and second flips
  faceUps = Kefir.merge(cardClicks)
    .filterBy validFlip
    .scan (faceUps, event) ->
      if faceUps.length is 2
        [event]
      else
        R.append event, faceUps
    , []

  match = faceUps
    .filter R.compose R.eq(2), R.length
    .map (pair) ->
      # ids are the card type followed by a 1 or 2, so we can
      # find a match by comparing just the card type portion
      ignoreDigits = (string) -> string.replace(/\d/, "")
      match = R.compose(R.apply(R.eq), R.map(ignoreDigits)) pair
      affectedCards: pair
      action: if match then 2 else 0

  # card values respond a follows:
  # - on faceUp go to face up
  # - 1300 ms after match go to face down or matched
  # faceup ----[a1]------[a1,b1]-----[a1]---[a1,a2]-----
  # reset  ----------------------f-------------------t--
  # carda1 -----u----------------d----u--------------m--
  # cardb1 ------------------u---d----------------------
  # carda2 -------------------------------------u----m--
  #
  reset = match.delay(1000)

  getCardStream = (card) ->
    mapFaceUps = (faceUps) ->
      affectedCards: [R.last(faceUps)]
      action: 1
    Kefir.merge [faceUps.map(mapFaceUps), reset]
      .filter R.compose(R.contains(card.id), R.prop("affectedCards"))
      .scan (card, e) ->
        R.merge card, {status: e.action}
      , card
      .log('-----' + card.id)

  cards = Kefir.merge R.map getCardStream, deck

  cards.onValue (card) ->
    if card.status is 1
      $cards[card.id].removeClass "face-down"
      $cards[card.id].addClass "face-up"
    else if card.status is 0
      $cards[card.id].removeClass "face-up"
      $cards[card.id].addClass "face-down"
    else if card.status is 2
      $cards[card.id].css("color", "green")
