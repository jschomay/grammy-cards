(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("src/cards", function(exports, require, module) {
var CARD_STATES, availableCards, buildCard, buildDeck, getCards, getDeck, makePairs, randomOrderComparator, shuffleDeck;

CARD_STATES = {
  FACE_DOWN: 0,
  FACE_UP: 1,
  MATCHED: 2,
  SELECTED: 3
};

availableCards = ["apples-and-honey", "bath", "biking", "camping", "candy", "challah", "chanukah", "chicken-soup", "cruise", "deli", "dessing-up", "dreydel", "flowers", "hamantashen", "hebrew", "ice-cream", "lifting-weights", "menorah", "painting", "park", "pictures", "presents", "reading", "shabbos", "shopping", "singing", "skiing", "sleeping", "snowman", "sukkah", "swimming", "tzadaka"];

buildCard = R.mapIndexed(function(cardType, i) {
  return {
    id: cardType + (1 + i % 2),
    image: cardType,
    status: CARD_STATES.FACE_DOWN
  };
});

makePairs = R.chain(function(cardType) {
  return [cardType, cardType];
});

buildDeck = R.compose(buildCard, makePairs);

randomOrderComparator = function() {
  return Math.floor(Math.random() * 3) - 1;
};

shuffleDeck = R.sort(randomOrderComparator);

getDeck = R.compose(shuffleDeck, buildDeck);

getCards = R.map(function(cardType) {
  return {
    id: cardType,
    image: cardType,
    status: CARD_STATES.FACE_UP
  };
});

module.exports = {
  CARD_STATES: CARD_STATES,
  getDeck: getDeck,
  getCards: getCards
};

});

require.register("src/drawing", function(exports, require, module) {
var CARD_STATES, cardTemplate, classMap, clearTable, placeInDOM, renderCard, renderContent, renderDeck, renderMessage, setMode;

CARD_STATES = require("./cards").CARD_STATES;

classMap = {};

classMap[CARD_STATES.FACE_DOWN] = "face-down";

classMap[CARD_STATES.FACE_UP] = "face-up";

cardTemplate = function(id, image, status) {
  return "<div id='" + id + "' class='card " + classMap[status] + " " + image + "'></div>";
};

renderCard = function(card) {
  return Zepto(cardTemplate(card.id, card.image, card.status));
};

placeInDOM = function($card) {
  return $card.appendTo(Zepto("#cards"));
};

renderDeck = R.reduce(function(acc, card) {
  var $card;
  $card = R.compose(placeInDOM, renderCard)(card);
  return R.assoc(card.id, $card, acc);
}, {});

clearTable = function() {
  Zepto("#game").removeClass();
  Zepto("#cards").empty();
  Zepto("#content").empty();
  return Zepto("#message").empty().hide();
};

renderMessage = function(message) {
  return Zepto("#message").show().text(message);
};

renderContent = function(template, context) {
  return Zepto("#content").html(template(context));
};

setMode = function(mode) {
  return Zepto("#game").addClass(mode);
};

module.exports = {
  renderDeck: renderDeck,
  clearTable: clearTable,
  renderContent: renderContent,
  renderMessage: renderMessage,
  setMode: setMode
};

});

require.register("src/fsm", function(exports, require, module) {
var STATES, enterState;

STATES = {};

enterState = function(debug, _arg) {
  var initialData, requestedState, stateName;
  stateName = _arg[0], initialData = _arg[1];
  requestedState = STATES[stateName];
  if (debug) {
    console.debug("Enter " + (stateName.toUpperCase()) + " with initial data " + initialData);
  }
  return requestedState.fn(initialData).take(1).map((function(_this) {
    return function(_arg1) {
      var exitData, nextState, transition;
      transition = _arg1[0], exitData = _arg1[1];
      if (debug) {
        console.debug("Exit " + (stateName.toUpperCase()) + " with transition \"" + transition + "\" and exit data " + exitData);
      }
      nextState = requestedState.transitions[transition];
      return [nextState, exitData];
    };
  })(this)).flatMap(enterState.bind(this, debug)).toProperty(function() {
    return [stateName, initialData];
  });
};

module.exports = {
  loadState: function(stateConfig) {
    return STATES[stateConfig.name] = {
      fn: stateConfig.fn,
      transitions: stateConfig.transitions
    };
  },
  start: function(stateName, initialData, debug) {
    var currentState;
    if (debug == null) {
      debug = false;
    }
    currentState = enterState(debug, [stateName, initialData]);
    return currentState.onAny(function() {});
  }
};

});

require.register("src/game", function(exports, require, module) {
var availableCards, cards, endGameState, frpfsm, playGameState, preloadGameState, selectGameState, startGameState;

cards = require("./cards");

frpfsm = require("../src/fsm");

preloadGameState = require("./states/preload");

startGameState = require("./states/start");

selectGameState = require("./states/select");

playGameState = require("./states/play");

endGameState = require("./states/end");

availableCards = ["bath", "dressing-up", "ice-cream", "painting", "park", "reading", "camping", "candy"];

Zepto(function() {
  var currentState, debug;
  FastClick.attach(document.body);
  frpfsm.loadState({
    name: "Preload",
    fn: preloadGameState,
    transitions: {
      "assetsReady": "Start"
    }
  });
  frpfsm.loadState({
    name: "Start",
    fn: startGameState,
    transitions: {
      "begin": "Select"
    }
  });
  frpfsm.loadState({
    name: "Select",
    fn: selectGameState.bind(null, availableCards),
    transitions: {
      "play": "Play"
    }
  });
  frpfsm.loadState({
    name: "Play",
    fn: playGameState,
    transitions: {
      "youWin": "End"
    }
  });
  frpfsm.loadState({
    name: "End",
    fn: endGameState,
    transitions: {
      "startOver": "Start"
    }
  });
  debug = true;
  return currentState = frpfsm.start("Preload", availableCards, debug);
});

});

require.register("src/states/end", function(exports, require, module) {
var drawing, winTemplate;

drawing = require("../drawing");

winTemplate = require("../templates/win");

module.exports = function(winningCards) {
  drawing.setMode("end");
  drawing.renderContent(winTemplate);
  Kefir.later(500).onValue(function() {
    return $('#end-page-card').addClass('appear');
  });
  return Kefir.fromEvents($('#play-again'), 'click').take(1).map(function() {
    return ["startOver"];
  }).onValue(function() {
    return drawing.clearTable();
  });
};

});

require.register("src/states/play", function(exports, require, module) {
var cards, drawing;

cards = require("../cards");

drawing = require("../drawing");

module.exports = function(selectedCards) {
  var $cards, cardClicks, cardStreams, completedCards, deck, faceUps, finish, getCardStream, makeClickStreams, match, numPairs, reset, updateTable, validFlip;
  deck = cards.getDeck(selectedCards);
  numPairs = (function() {
    switch (selectedCards.length) {
      case 2:
        return "two";
      case 3:
        return "three";
      case 4:
        return "four";
    }
  })();
  drawing.setMode("play " + numPairs + "-pairs");
  $cards = drawing.renderDeck(deck);
  makeClickStreams = R.pipe(R.toPairs, R.map(function(elem) {
    var $card, id;
    id = elem[0];
    $card = elem[1];
    return Kefir.fromEvents($card, "click", R.always(id));
  }));
  cardClicks = makeClickStreams($cards);
  validFlip = Kefir.merge(cardClicks).scan(function(acc, event) {
    var faceUps;
    if (acc.faceUps.length === 2) {
      return {
        faceUps: [event],
        valid: true
      };
    } else {
      if (R.contains(event, acc.faceUps)) {
        return R.merge(acc, {
          valid: false
        });
      } else {
        faceUps = R.append(event, acc.faceUps);
        return {
          faceUps: faceUps,
          valid: true
        };
      }
    }
  }, {
    faceUps: [],
    valid: false
  }).map(R.prop("valid"));
  faceUps = Kefir.merge(cardClicks).filterBy(validFlip).scan(function(faceUps, event) {
    if (faceUps.length === 2) {
      return [event];
    } else {
      return R.append(event, faceUps);
    }
  }, []);
  match = faceUps.filter(R.compose(R.eq(2), R.length)).map(function(pair) {
    var ignoreDigits;
    ignoreDigits = function(string) {
      return string.replace(/\d/, "");
    };
    match = R.compose(R.apply(R.eq), R.map(ignoreDigits))(pair);
    return {
      affectedCards: pair,
      match: match
    };
  });
  reset = match.flatMap(function(pair) {
    if (pair.match) {
      return Kefir.later(500, pair);
    } else {
      return Kefir.later(1500, pair);
    }
  });
  getCardStream = function(card) {
    var faceUpToAction, resetToAction;
    faceUpToAction = function(faceUps) {
      return {
        affectedCards: [R.last(faceUps)],
        status: cards.CARD_STATES.FACE_UP
      };
    };
    resetToAction = function(reset) {
      return {
        affectedCards: reset.affectedCards,
        status: reset.match ? cards.CARD_STATES.MATCHED : cards.CARD_STATES.FACE_DOWN
      };
    };
    return Kefir.merge([faceUps.map(faceUpToAction), reset.map(resetToAction)]).filter(R.compose(R.contains(card.id), R.prop("affectedCards"))).scan(function(card, action) {
      return R.merge(card, {
        status: action.status
      });
    }, card);
  };
  cardStreams = Kefir.merge(R.map(getCardStream, deck));
  updateTable = function(card) {
    if (card.status === cards.CARD_STATES.FACE_UP) {
      $cards[card.id].removeClass("face-down");
      return $cards[card.id].addClass("face-up selected");
    } else if (card.status === cards.CARD_STATES.FACE_DOWN) {
      $cards[card.id].removeClass("face-up selected");
      return $cards[card.id].addClass("face-down");
    } else if (card.status === cards.CARD_STATES.MATCHED) {
      return $cards[card.id].addClass("matched");
    }
  };
  cardStreams.onValue(updateTable);
  completedCards = match.filter(R.prop("match")).scan(function(matchesSoFar, _arg) {
    var affectedCards;
    affectedCards = _arg.affectedCards;
    return R.concat(affectedCards, matchesSoFar);
  }, []);
  return finish = completedCards.filter(R.compose(R.eq(deck.length), R.length)).take(1).delay(2000).onValue(function() {
    return cardStreams.offValue(updateTable);
  }).map(function(completedCards) {
    return ["youWin", completedCards];
  });
};

});

require.register("src/states/preload", function(exports, require, module) {
var drawing;

drawing = require("../drawing");

module.exports = function(availableImages) {
  var loadAssets, loader, toImagePath;
  drawing.renderMessage("Loading...");
  loader = new PxLoader();
  toImagePath = function(image) {
    return "assets/" + image + ".jpg";
  };
  loadAssets = R.forEach(R.compose(loader.addImage.bind(loader), toImagePath));
  loadAssets(availableImages);
  loader.addImage("assets/grammy.jpg");
  loader.start();
  return Kefir.fromCallback(loader.addCompletionListener).take(1).map(function() {
    return ["assetsReady"];
  }).onValue(function() {
    return drawing.clearTable();
  });
};

});

require.register("src/states/select", function(exports, require, module) {
var cards, drawing,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

cards = require("../cards");

drawing = require("../drawing");

module.exports = function(availableImages, numberOfCardsInPlay) {
  var $cards, cardClicks, deck, finished, highlight, makeClickStreams, selectedCards;
  deck = cards.getCards(availableImages);
  $cards = drawing.renderDeck(deck);
  drawing.renderMessage("Pick " + numberOfCardsInPlay + " cards to play with:");
  drawing.setMode("select");
  highlight = function(selected) {
    var card, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = selected.length; _i < _len; _i++) {
      card = selected[_i];
      _results.push($cards[card].addClass("selected"));
    }
    return _results;
  };
  makeClickStreams = R.pipe(R.toPairs, R.map(function(elem) {
    var $card, id;
    id = elem[0];
    $card = elem[1];
    return Kefir.fromEvents($card, "click", R.always(id));
  }));
  cardClicks = makeClickStreams($cards);
  selectedCards = Kefir.merge(cardClicks).scan(function(prev, next) {
    if (__indexOf.call(prev, next) >= 0) {
      return prev;
    } else {
      return R.append(next, prev);
    }
  }, []).onValue(highlight);
  return finished = selectedCards.skipWhile(R.compose(R.gt(numberOfCardsInPlay), R.length)).take(1).delay(1000).map(function(selectedCards) {
    return ["play", selectedCards];
  }).onValue(function() {
    selectedCards.offValue(highlight);
    return drawing.clearTable();
  });
};

});

require.register("src/states/start", function(exports, require, module) {
var drawing, startTemplate;

drawing = require("../drawing");

startTemplate = require("../templates/start");

module.exports = function() {
  var fourPairs, threePairs, twoPairs;
  drawing.setMode("start");
  drawing.renderContent(startTemplate);
  twoPairs = Kefir.fromEvents($('#two-pairs'), 'click').map(function() {
    return 2;
  });
  threePairs = Kefir.fromEvents($('#three-pairs'), 'click').map(function() {
    return 3;
  });
  fourPairs = Kefir.fromEvents($('#four-pairs'), 'click').map(function() {
    return 4;
  });
  return Kefir.merge([twoPairs, threePairs, fourPairs]).take(1).map(function(numberOfPairs) {
    return ["begin", numberOfPairs];
  }).onValue(function() {
    return drawing.clearTable();
  });
};

});

require.register("src/templates/start", function(exports, require, module) {
var __templateData = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<h1 id=\"title\">Grammy Cards</h1>\n<h2 id=\"subtitle\">\"A memory development game for early childhood\"</h2>\n<div id=\"title-page-card\" class=\"card face-down\"></div>\n<div id=\"select-mode\">\n  <div class=\"button\" id=\"two-pairs\">- Play with 2 pairs</div>\n  <div class=\"button\" id=\"three-pairs\">- Play with 3 pairs</div>\n  <div class=\"button\" id=\"four-pairs\">- Play with 4 pairs</div>\n</div>\n";
  },"useData":true});
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("src/templates/win", function(exports, require, module) {
var __templateData = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<h1 id=\"title\">Yay!! You Win!</h1>\n<div id=\"end-page-card\" class=\"card face-down\"></div>\n<div id=\"play-again\" class=\"button\">Play again</div>\n";
  },"useData":true});
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;