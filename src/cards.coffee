CARD_STATES =
  FACE_DOWN: 0
  FACE_UP: 1
  MATCHED: 2

availableCards = [
  "eating"
  "playing"
  "cleaning"
  "cooking"
  "reading"
  "walking"
]

# could be modified as a filter for specific sets of cards
# currently returns all available cards
cardFilter = -> R.T
getCardSet = -> R.filter cardFilter, availableCards

# assumes pairs will be ordered together
buildCard = R.mapIndexed (cardType, i) ->
  id: cardType + (1 + i % 2) # eg. eating1 / eating2
  image: cardType
  status: CARD_STATES.FACE_DOWN

makePairs = R.chain (cardType) -> [cardType, cardType]
buildDeck = R.compose(buildCard, makePairs)

randomOrderComparator = -> Math.floor(Math.random() * 3) - 1
shuffleDeck = R.sort randomOrderComparator

getDeck = R.compose(shuffleDeck, buildDeck, getCardSet)



module.exports = {
  CARD_STATES
  getDeck
}
