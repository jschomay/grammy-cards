drawing = require "../drawing"

module.exports = (availableImages) ->

  drawing.renderMessage "Loading..."

  loader = new PxLoader()

  toImagePath = (image) ->
    "assets/#{image}.jpg"

  loadAssets = R.forEach R.compose(loader.addImage.bind(loader), toImagePath)

  loadAssets availableImages

  loader.start()

  Kefir.fromCallback(loader.addCompletionListener)
    .map ->
      ["assetsReady", availableImages]
