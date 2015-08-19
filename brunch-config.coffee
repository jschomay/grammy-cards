exports.config =
  # See http://brunch.io/#documentation for docs.
  paths:
    public: './'
    watched: ['src', 'vendor']
  files:
    javascripts:
      joinTo:
        'scripts/game.js': /^src/
        'scripts/vendor.js': /^vendor/
    templates:
      joinTo:
        'scripts/game.js': /^src\/templates/
    stylesheets:
        joinTo: 'css/style.css'
  sourceMaps: false
  plugins:
    postcss:
      processors: [
        require('autoprefixer')(['last 8 versions']),
      ]
