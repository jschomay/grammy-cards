CARD_STATES =
  HIDDEN: 0
  FLIPPED: 1
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

buildCard = R.map (cardType) ->
  image: cardType
  status: CARD_STATES.HIDDEN

makePair = R.chain (item) -> [item, R.clone item]
buildDeck = R.compose(makePair, buildCard)

randomOrderComparator = -> Math.floor(Math.random() * 3) - 1
shuffleDeck = R.sort randomOrderComparator

getDeck = R.compose(shuffleDeck, buildDeck, getCardSet)



module.exports = {
  CARD_STATES
  getDeck
}
