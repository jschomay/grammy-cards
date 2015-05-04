CARD_STATES =
  FACE_DOWN: 0
  FACE_UP: 1
  MATCHED: 2

availableCards = [
  "apples-and-honey"
  "bath"
  "biking"
  "camping"
  "candy"
  "challah"
  "chanukah"
  "chicken-soup"
  "cruise"
  "deli"
  "dessing-up"
  "dreydel"
  "flowers"
  "hamantashen"
  "hebrew"
  "ice-cream"
  "lifting-weights"
  "menorah"
  "painting"
  "park"
  "pictures"
  "presents"
  "reading"
  "shabbos"
  "shopping"
  "singing"
  "skiing"
  "sleeping"
  "snowman"
  "sukkah"
  "swimming"
  "tzadaka"
]

selectedCards = [
  "camping"
  "candy"
  "menorah"
  "painting"
  "park"
  "bath"
]
getCardSet = -> selectedCards

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
