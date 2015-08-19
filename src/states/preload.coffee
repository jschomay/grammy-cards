drawing = require "../drawing"

module.exports = (availableImages) ->

  drawing.renderMessage "Loading..."

  loader = new PxLoader()

  toImagePath = (image) ->
    "assets/#{image}.jpg"

  loadAssets = R.forEach R.compose(loader.addImage.bind(loader), toImagePath)

  loadAssets availableImages

  loader.addImage "assets/grammy.jpg"

  loader.start()

  Kefir.fromCallback(loader.addCompletionListener)
    .take(1)
    .map ->
      ["assetsReady"]
    .onValue ->
      drawing.clearTable()
