cards = require "../cards"
drawing = require "../drawing"

module.exports = (selectedCards) ->

  deck = cards.getDeck selectedCards

  $cards = drawing.renderDeck deck

  # takes object id: $card
  # returns array of click streams for each $card
  # (each click passes the id of its associated card)
  makeClickStreams = R.pipe R.toPairs, R.map (elem) ->
    id = elem[0]
    $card = elem[1]
    Kefir.fromEvents($card, "click", R.always id)

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
      # need to keep a reference to which cards are affected
      affectedCards: pair
      match: match

  reset = match.delay(1500)

  # card values respond a follows:
  # - on faceUp go to face up
  # - 1500 ms after match go to face down or matched
  # faceup ----[a1]------[a1,b1]-----[a1]---[a1,a2]-----
  # reset  ----------------------f-------------------t--
  # carda1 -----u----------------d----u--------------m--
  # cardb1 ------------------u---d----------------------
  # carda2 -------------------------------------u----m--
  getCardStream = (card) ->
    faceUpToAction = (faceUps) ->
      # (only the last of the faceUps array is new)
      affectedCards: [R.last(faceUps)]
      status: cards.CARD_STATES.FACE_UP
    resetToAction = (reset) ->
      affectedCards: reset.affectedCards
      status: if reset.match then cards.CARD_STATES.MATCHED else cards.CARD_STATES.FACE_DOWN

    Kefir.merge [faceUps.map(faceUpToAction), reset.map(resetToAction)]
      .filter R.compose(R.contains(card.id), R.prop("affectedCards"))
      .scan (card, action) ->
        R.merge card, {status: action.status}
      , card

  cardStreams = Kefir.merge R.map getCardStream, deck

  updateTable = (card) ->
    if card.status is cards.CARD_STATES.FACE_UP
      $cards[card.id].removeClass "face-down"
      $cards[card.id].addClass "face-up selected"
    else if card.status is cards.CARD_STATES.FACE_DOWN
      $cards[card.id].removeClass "face-up selected"
      $cards[card.id].addClass "face-down"
    else if card.status is cards.CARD_STATES.MATCHED
      $cards[card.id].addClass "matched"
      # by turning the card invisible, it not only gives visual
      # feedback, but also removes the view's click stream
      # (feels kind of hacky and is a side-effect, but works)
      # $cards[card.id].css("visibility", "hidden")

  cardStreams.onValue updateTable

  completedCards = match
    .filter R.prop("match")
    .scan (matchesSoFar, {affectedCards}) ->
      R.concat affectedCards, matchesSoFar
    , []

  finish = completedCards
    .filter R.compose(R.eq(deck.length), R.length)
    .take 1
    .delay 3000
    .onValue ->
      cardStreams.offValue updateTable
      drawing.clearTable()
    .map (completedCards) -> ["youWin", completedCards]
