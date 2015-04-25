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
(function() {
  var WebSocket = window.WebSocket || window.MozWebSocket;
  var br = window.brunch = (window.brunch || {});
  var ar = br['auto-reload'] = (br['auto-reload'] || {});
  if (!WebSocket || ar.disabled) return;

  var cacheBuster = function(url){
    var date = Math.round(Date.now() / 1000).toString();
    url = url.replace(/(\&|\\?)cacheBuster=\d*/, '');
    return url + (url.indexOf('?') >= 0 ? '&' : '?') +'cacheBuster=' + date;
  };

  var browser = navigator.userAgent.toLowerCase();
  var forceRepaint = ar.forceRepaint || browser.indexOf('chrome') > -1;

  var reloaders = {
    page: function(){
      window.location.reload(true);
    },

    stylesheet: function(){
      [].slice
        .call(document.querySelectorAll('link[rel="stylesheet"][href]:not([data-autoreload="false"]'))
        .forEach(function(link) {
          link.href = cacheBuster(link.href);
        });

      // Hack to force page repaint after 25ms.
      if (forceRepaint) setTimeout(function() { document.body.offsetHeight; }, 25);
    }
  };
  var port = ar.port || 9485;
  var host = br.server || window.location.hostname || 'localhost';

  var connect = function(){
    var connection = new WebSocket('ws://' + host + ':' + port);
    connection.onmessage = function(event){
      if (ar.disabled) return;
      var message = event.data;
      var reloader = reloaders[message] || reloaders.page;
      reloader();
    };
    connection.onerror = function(){
      if (connection.readyState) connection.close();
    };
    connection.onclose = function(){
      window.setTimeout(connect, 1000);
    };
  };
  connect();
})();

/*! Kefir.js v2.0.0
 *  https://github.com/pozadi/kefir
 */
;(function(global){
  "use strict";

  var Kefir = {};


function and() {
  for (var i = 0; i < arguments.length; i++) {
    if (!arguments[i]) {
      return arguments[i];
    }
  }
  return arguments[i - 1];
}

function or() {
  for (var i = 0; i < arguments.length; i++) {
    if (arguments[i]) {
      return arguments[i];
    }
  }
  return arguments[i - 1];
}

function not(x) {
  return !x;
}

function concat(a, b) {
  var result, length, i, j;
  if (a.length === 0) {
    return b;
  }
  if (b.length === 0) {
    return a;
  }
  j = 0;
  result = new Array(a.length + b.length);
  length = a.length;
  for (i = 0; i < length; i++, j++) {
    result[j] = a[i];
  }
  length = b.length;
  for (i = 0; i < length; i++, j++) {
    result[j] = b[i];
  }
  return result;
}

function circleShift(arr, distance) {
  var length = arr.length
    , result = new Array(length)
    , i;
  for (i = 0; i < length; i++) {
    result[(i + distance) % length] = arr[i];
  }
  return result;
}

function find(arr, value) {
  var length = arr.length
    , i;
  for (i = 0; i < length; i++) {
    if (arr[i] === value) {
      return i;
    }
  }
  return -1;
}

function findByPred(arr, pred) {
  var length = arr.length
    , i;
  for (i = 0; i < length; i++) {
    if (pred(arr[i])) {
      return i;
    }
  }
  return -1;
}

function cloneArray(input) {
  var length = input.length
    , result = new Array(length)
    , i;
  for (i = 0; i < length; i++) {
    result[i] = input[i];
  }
  return result;
}

function remove(input, index) {
  var length = input.length
    , result, i, j;
  if (index >= 0 && index < length) {
    if (length === 1) {
      return [];
    } else {
      result = new Array(length - 1);
      for (i = 0, j = 0; i < length; i++) {
        if (i !== index) {
          result[j] = input[i];
          j++;
        }
      }
      return result;
    }
  } else {
    return input;
  }
}

function removeByPred(input, pred) {
  return remove(input, findByPred(input, pred));
}

function map(input, fn) {
  var length = input.length
    , result = new Array(length)
    , i;
  for (i = 0; i < length; i++) {
    result[i] = fn(input[i]);
  }
  return result;
}

function forEach(arr, fn) {
  var length = arr.length
    , i;
  for (i = 0; i < length; i++) {
    fn(arr[i]);
  }
}

function fillArray(arr, value) {
  var length = arr.length
    , i;
  for (i = 0; i < length; i++) {
    arr[i] = value;
  }
}

function contains(arr, value) {
  return find(arr, value) !== -1;
}

function rest(arr, start, onEmpty) {
  if (arr.length > start) {
    return Array.prototype.slice.call(arr, start);
  }
  return onEmpty;
}

function slide(cur, next, max) {
  var length = Math.min(max, cur.length + 1),
      offset = cur.length - length + 1,
      result = new Array(length),
      i;
  for (i = offset; i < length; i++) {
    result[i - offset] = cur[i];
  }
  result[length - 1] = next;
  return result;
}

function isEqualArrays(a, b) {
  var length, i;
  if (a == null && b == null) {
    return true;
  }
  if (a == null || b == null) {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }
  for (i = 0, length = a.length; i < length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

function spread(fn, length) {
  switch(length) {
    case 0: return function(a) {return fn();};
    case 1: return function(a) {return fn(a[0]);};
    case 2: return function(a) {return fn(a[0], a[1]);};
    case 3: return function(a) {return fn(a[0], a[1], a[2]);};
    case 4: return function(a) {return fn(a[0], a[1], a[2], a[3]);};
    default: return function(a) {return fn.apply(null, a);};
  }
}

function apply(fn, c, a) {
  var aLength = a ? a.length : 0;
  if (c == null) {
    switch (aLength) {
      case 0: return fn();
      case 1: return fn(a[0]);
      case 2: return fn(a[0], a[1]);
      case 3: return fn(a[0], a[1], a[2]);
      case 4: return fn(a[0], a[1], a[2], a[3]);
      default: return fn.apply(null, a);
    }
  } else {
    switch (aLength) {
      case 0: return fn.call(c);
      default: return fn.apply(c, a);
    }
  }
}

function get(map, key, notFound) {
  if (map && key in map) {
    return map[key];
  } else {
    return notFound;
  }
}

function own(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

function createObj(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F();
}

function extend(target /*, mixin1, mixin2...*/) {
  var length = arguments.length
    , i, prop;
  for (i = 1; i < length; i++) {
    for (prop in arguments[i]) {
      target[prop] = arguments[i][prop];
    }
  }
  return target;
}

function inherit(Child, Parent /*, mixin1, mixin2...*/) {
  var length = arguments.length
    , i;
  Child.prototype = createObj(Parent.prototype);
  Child.prototype.constructor = Child;
  for (i = 2; i < length; i++) {
    extend(Child.prototype, arguments[i]);
  }
  return Child;
}

var NOTHING = ['<nothing>'];
var END = 'end';
var VALUE = 'value';
var ERROR = 'error';
var ANY = 'any';

function noop() {}

function id(x) {
  return x;
}

function id2(_, x) {
  return x;
}

function strictEqual(a, b) {
  return a === b;
}

function defaultDiff(a, b) {
  return [a, b];
}

function returnsFalse() {
  return false;
}

function returnsTrue() {
  return true;
}

var now = Date.now ?
  function() {
    return Date.now();
  } :
  function() {
    return new Date().getTime();
  };

var log = ((typeof console !== undefined) && isFn(console.log)) ?
  function(m) {
    console.log(m);
  } : noop;



Kefir.DEPRECATION_WARNINGS = true;
function deprecated(name, alt, fn) {
  var message = 'Method `' + name + '` is deprecated, and to be removed in v3.0.0.';
  if (alt) {
    message += '\nUse `' + alt + '` instead.';
  }
  message += '\nTo disable all warnings like this set `Kefir.DEPRECATION_WARNINGS = false`.';
  return function() {
    if (Kefir.DEPRECATION_WARNINGS) {
      log(message);
    }
    return fn.apply(this, arguments);
  };
}

function isFn(fn) {
  return typeof fn === 'function';
}

function isUndefined(x) {
  return typeof x === 'undefined';
}

function isArrayLike(xs) {
  return isArray(xs) || isArguments(xs);
}

var isArray = Array.isArray || function(xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

var isArguments = function(xs) {
  return Object.prototype.toString.call(xs) === '[object Arguments]';
};

// For IE
if (!isArguments(arguments)) {
  isArguments = function(obj) {
    return !!(obj && own(obj, 'callee'));
  };
}

function withInterval(name, mixin) {

  function AnonymousStream(wait, args) {
    Stream.call(this);
    this._wait = wait;
    this._intervalId = null;
    var $ = this;
    this._$onTick = function() {
      $._onTick();
    };
    this._init(args);
  }

  inherit(AnonymousStream, Stream, {

    _name: name,

    _init: function(args) {},
    _free: function() {},

    _onTick: function() {},

    _onActivation: function() {
      this._intervalId = setInterval(this._$onTick, this._wait);
    },
    _onDeactivation: function() {
      if (this._intervalId !== null) {
        clearInterval(this._intervalId);
        this._intervalId = null;
      }
    },

    _clear: function() {
      Stream.prototype._clear.call(this);
      this._$onTick = null;
      this._free();
    }

  }, mixin);

  Kefir[name] = function(wait) {
    return new AnonymousStream(wait, rest(arguments, 1, []));
  };
}

function withOneSource(name, mixin, options) {


  options = extend({
    streamMethod: function(StreamClass, PropertyClass) {
      return function() {
        return new StreamClass(this, arguments);
      };
    },
    propertyMethod: function(StreamClass, PropertyClass) {
      return function() {
        return new PropertyClass(this, arguments);
      };
    }
  }, options || {});



  mixin = extend({
    _init: function(args) {},
    _free: function() {},

    _handleValue: function(x, isCurrent) {
      this._send(VALUE, x, isCurrent);
    },
    _handleError: function(x, isCurrent) {
      this._send(ERROR, x, isCurrent);
    },
    _handleEnd: function(__, isCurrent) {
      this._send(END, null, isCurrent);
    },

    _handleAny: function(event) {
      switch (event.type) {
        case VALUE: this._handleValue(event.value, event.current); break;
        case ERROR: this._handleError(event.value, event.current); break;
        case END: this._handleEnd(event.value, event.current); break;
      }
    },

    _onActivation: function() {
      this._source.onAny(this._$handleAny);
    },
    _onDeactivation: function() {
      this._source.offAny(this._$handleAny);
    }
  }, mixin || {});



  function buildClass(BaseClass) {
    function AnonymousObservable(source, args) {
      BaseClass.call(this);
      this._source = source;
      this._name = source._name + '.' + name;
      this._init(args);
      var $ = this;
      this._$handleAny = function(event) {
        $._handleAny(event);
      };
    }

    inherit(AnonymousObservable, BaseClass, {
      _clear: function() {
        BaseClass.prototype._clear.call(this);
        this._source = null;
        this._$handleAny = null;
        this._free();
      }
    }, mixin);

    return AnonymousObservable;
  }


  var AnonymousStream = buildClass(Stream);
  var AnonymousProperty = buildClass(Property);

  if (options.streamMethod) {
    Stream.prototype[name] = options.streamMethod(AnonymousStream, AnonymousProperty);
  }

  if (options.propertyMethod) {
    Property.prototype[name] = options.propertyMethod(AnonymousStream, AnonymousProperty);
  }

}

function withTwoSources(name, mixin /*, options*/) {

  mixin = extend({
    _init: function(args) {},
    _free: function() {},

    _handlePrimaryValue: function(x, isCurrent) {
      this._send(VALUE, x, isCurrent);
    },
    _handlePrimaryError: function(x, isCurrent) {
      this._send(ERROR, x, isCurrent);
    },
    _handlePrimaryEnd: function(__, isCurrent) {
      this._send(END, null, isCurrent);
    },

    _handleSecondaryValue: function(x, isCurrent) {
      this._lastSecondary = x;
    },
    _handleSecondaryError: function(x, isCurrent) {
      this._send(ERROR, x, isCurrent);
    },
    _handleSecondaryEnd: function(__, isCurrent) {},

    _handlePrimaryAny: function(event) {
      switch (event.type) {
        case VALUE:
          this._handlePrimaryValue(event.value, event.current);
          break;
        case ERROR:
          this._handlePrimaryError(event.value, event.current);
          break;
        case END:
          this._handlePrimaryEnd(event.value, event.current);
          break;
      }
    },
    _handleSecondaryAny: function(event) {
      switch (event.type) {
        case VALUE:
          this._handleSecondaryValue(event.value, event.current);
          break;
        case ERROR:
          this._handleSecondaryError(event.value, event.current);
          break;
        case END:
          this._handleSecondaryEnd(event.value, event.current);
          this._removeSecondary();
          break;
      }
    },

    _removeSecondary: function() {
      if (this._secondary !== null) {
        this._secondary.offAny(this._$handleSecondaryAny);
        this._$handleSecondaryAny = null;
        this._secondary = null;
      }
    },

    _onActivation: function() {
      if (this._secondary !== null) {
        this._secondary.onAny(this._$handleSecondaryAny);
      }
      if (this._alive) {
        this._primary.onAny(this._$handlePrimaryAny);
      }
    },
    _onDeactivation: function() {
      if (this._secondary !== null) {
        this._secondary.offAny(this._$handleSecondaryAny);
      }
      this._primary.offAny(this._$handlePrimaryAny);
    }
  }, mixin || {});



  function buildClass(BaseClass) {
    function AnonymousObservable(primary, secondary, args) {
      BaseClass.call(this);
      this._primary = primary;
      this._secondary = secondary;
      this._name = primary._name + '.' + name;
      this._lastSecondary = NOTHING;
      var $ = this;
      this._$handleSecondaryAny = function(event) {
        $._handleSecondaryAny(event);
      };
      this._$handlePrimaryAny = function(event) {
        $._handlePrimaryAny(event);
      };
      this._init(args);
    }

    inherit(AnonymousObservable, BaseClass, {
      _clear: function() {
        BaseClass.prototype._clear.call(this);
        this._primary = null;
        this._secondary = null;
        this._lastSecondary = null;
        this._$handleSecondaryAny = null;
        this._$handlePrimaryAny = null;
        this._free();
      }
    }, mixin);

    return AnonymousObservable;
  }


  var AnonymousStream = buildClass(Stream);
  var AnonymousProperty = buildClass(Property);

  Stream.prototype[name] = function(secondary) {
    return new AnonymousStream(this, secondary, rest(arguments, 1, []));
  };

  Property.prototype[name] = function(secondary) {
    return new AnonymousProperty(this, secondary, rest(arguments, 1, []));
  };

}

// Dispatcher

function callSubscriber(sType, sFn, event) {
  if (sType === ANY) {
    sFn(event);
  } else if (sType === event.type) {
    if (sType === VALUE || sType === ERROR) {
      sFn(event.value);
    } else {
      sFn();
    }
  }
}

function Dispatcher() {
  this._items = [];
}

extend(Dispatcher.prototype, {
  add: function(type, fn) {
    this._items = concat(this._items, [{
      type: type,
      fn: fn
    }]);
    return this._items.length;
  },
  remove: function(type, fn) {
    this._items = removeByPred(this._items, function(fnData) {
      return fnData.type === type && fnData.fn === fn;
    });
    return this._items.length;
  },
  dispatch: function(event) {
    var items = this._items;
    for (var i = 0; i < items.length; i++) {
      callSubscriber(items[i].type, items[i].fn, event);
    }
  }
});








// Events

function Event(type, value, current) {
  return {type: type, value: value, current: !!current};
}

var CURRENT_END = Event(END, undefined, true);





// Observable

function Observable() {
  this._dispatcher = new Dispatcher();
  this._active = false;
  this._alive = true;
}
Kefir.Observable = Observable;

extend(Observable.prototype, {

  _name: 'observable',

  _onActivation: function() {},
  _onDeactivation: function() {},

  _setActive: function(active) {
    if (this._active !== active) {
      this._active = active;
      if (active) {
        this._onActivation();
      } else {
        this._onDeactivation();
      }
    }
  },

  _clear: function() {
    this._setActive(false);
    this._alive = false;
    this._dispatcher = null;
  },

  _send: function(type, x, isCurrent) {
    if (this._alive) {
      this._dispatcher.dispatch(Event(type, x, isCurrent));
      if (type === END) {
        this._clear();
      }
    }
  },

  _on: function(type, fn) {
    if (this._alive) {
      this._dispatcher.add(type, fn);
      this._setActive(true);
    } else {
      callSubscriber(type, fn, CURRENT_END);
    }
    return this;
  },

  _off: function(type, fn) {
    if (this._alive) {
      var count = this._dispatcher.remove(type, fn);
      if (count === 0) {
        this._setActive(false);
      }
    }
    return this;
  },

  onValue: function(fn) {
    return this._on(VALUE, fn);
  },
  onError: function(fn) {
    return this._on(ERROR, fn);
  },
  onEnd: function(fn) {
    return this._on(END, fn);
  },
  onAny: function(fn) {
    return this._on(ANY, fn);
  },

  offValue: function(fn) {
    return this._off(VALUE, fn);
  },
  offError: function(fn) {
    return this._off(ERROR, fn);
  },
  offEnd: function(fn) {
    return this._off(END, fn);
  },
  offAny: function(fn) {
    return this._off(ANY, fn);
  }

});


// extend() can't handle `toString` in IE8
Observable.prototype.toString = function() {
  return '[' + this._name + ']';
};









// Stream

function Stream() {
  Observable.call(this);
}
Kefir.Stream = Stream;

inherit(Stream, Observable, {

  _name: 'stream'

});







// Property

function Property() {
  Observable.call(this);
  this._currentEvent = null;
}
Kefir.Property = Property;

inherit(Property, Observable, {

  _name: 'property',

  _send: function(type, x, isCurrent) {
    if (this._alive) {
      if (!isCurrent) {
        this._dispatcher.dispatch(Event(type, x));
      }
      if (type === VALUE || type === ERROR) {
        this._currentEvent = Event(type, x, true);
      }
      if (type === END) {
        this._clear();
      }
    }
  },

  _on: function(type, fn) {
    if (this._alive) {
      this._dispatcher.add(type, fn);
      this._setActive(true);
    }
    if (this._currentEvent !== null) {
      callSubscriber(type, fn, this._currentEvent);
    }
    if (!this._alive) {
      callSubscriber(type, fn, CURRENT_END);
    }
    return this;
  }

});






// Log

Observable.prototype.log = function(name) {
  name = name || this.toString();

  var handler = function(event) {
    var typeStr = '<' + event.type + (event.current ? ':current' : '') + '>';
    if (event.type === VALUE || event.type === ERROR) {
      console.log(name, typeStr, event.value);
    } else {
      console.log(name, typeStr);
    }
  };

  if (!this.__logHandlers) {
    this.__logHandlers = [];
  }
  this.__logHandlers.push({name: name, handler: handler});

  this.onAny(handler);
  return this;
};

Observable.prototype.offLog = function(name) {
  name = name || this.toString();

  if (this.__logHandlers) {
    var handlerIndex = findByPred(this.__logHandlers, function(obj) {
      return obj.name === name;
    });
    if (handlerIndex !== -1) {
      var handler = this.__logHandlers[handlerIndex].handler;
      this.__logHandlers.splice(handlerIndex, 1);
      this.offAny(handler);
    }
  }

  return this;
};



// Kefir.withInterval()

withInterval('withInterval', {
  _init: function(args) {
    this._fn = args[0];
    var $ = this;
    this._emitter = {
      emit: function(x) {
        $._send(VALUE, x);
      },
      error: function(x) {
        $._send(ERROR, x);
      },
      end: function() {
        $._send(END);
      },
      emitEvent: function(e) {
        $._send(e.type, e.value);
      }
    };
  },
  _free: function() {
    this._fn = null;
    this._emitter = null;
  },
  _onTick: function() {
    this._fn(this._emitter);
  }
});





// Kefir.fromPoll()

withInterval('fromPoll', {
  _init: function(args) {
    this._fn = args[0];
  },
  _free: function() {
    this._fn = null;
  },
  _onTick: function() {
    this._send(VALUE, this._fn());
  }
});





// Kefir.interval()

withInterval('interval', {
  _init: function(args) {
    this._x = args[0];
  },
  _free: function() {
    this._x = null;
  },
  _onTick: function() {
    this._send(VALUE, this._x);
  }
});




// Kefir.sequentially()

withInterval('sequentially', {
  _init: function(args) {
    this._xs = cloneArray(args[0]);
    if (this._xs.length === 0) {
      this._send(END);
    }
  },
  _free: function() {
    this._xs = null;
  },
  _onTick: function() {
    switch (this._xs.length) {
      case 1:
        this._send(VALUE, this._xs[0]);
        this._send(END);
        break;
      default:
        this._send(VALUE, this._xs.shift());
    }
  }
});




// Kefir.repeatedly()

withInterval('repeatedly', {
  _init: function(args) {
    this._xs = cloneArray(args[0]);
    this._i = -1;
  },
  _onTick: function() {
    if (this._xs.length > 0) {
      this._i = (this._i + 1) % this._xs.length;
      this._send(VALUE, this._xs[this._i]);
    }
  }
});

Kefir.repeatedly = deprecated(
  'Kefir.repeatedly()',
  'Kefir.repeat(() => Kefir.sequentially(...)})',
  Kefir.repeatedly
);





// Kefir.later()

withInterval('later', {
  _init: function(args) {
    this._x = args[0];
  },
  _free: function() {
    this._x = null;
  },
  _onTick: function() {
    this._send(VALUE, this._x);
    this._send(END);
  }
});

function _AbstractPool(options) {
  Stream.call(this);

  this._queueLim = get(options, 'queueLim', 0);
  this._concurLim = get(options, 'concurLim', -1);
  this._drop = get(options, 'drop', 'new');
  if (this._concurLim === 0) {
    throw new Error('options.concurLim can\'t be 0');
  }

  var $ = this;
  this._$handleSubAny = function(event) {
    $._handleSubAny(event);
  };

  this._queue = [];
  this._curSources = [];
  this._activating = false;

  this._bindedEndHandlers = [];
}

inherit(_AbstractPool, Stream, {

  _name: 'abstractPool',

  _add: function(obj, toObs) {
    toObs = toObs || id;
    if (this._concurLim === -1 || this._curSources.length < this._concurLim) {
      this._addToCur(toObs(obj));
    } else {
      if (this._queueLim === -1 || this._queue.length < this._queueLim) {
        this._addToQueue(toObs(obj));
      } else if (this._drop === 'old') {
        this._removeOldest();
        this._add(toObs(obj));
      }
    }
  },
  _addAll: function(obss) {
    var $ = this;
    forEach(obss, function(obs) {
      $._add(obs);
    });
  },
  _remove: function(obs) {
    if (this._removeCur(obs) === -1) {
      this._removeQueue(obs);
    }
  },

  _addToQueue: function(obs) {
    this._queue = concat(this._queue, [obs]);
  },
  _addToCur: function(obs) {
    this._curSources = concat(this._curSources, [obs]);
    if (this._active) {
      this._subscribe(obs);
    }
  },
  _subscribe: function(obs) {
    var $ = this;

    var onEnd = function() {
      $._removeCur(obs);
    };

    this._bindedEndHandlers.push({obs: obs, handler: onEnd});

    obs.onAny(this._$handleSubAny);
    obs.onEnd(onEnd);
  },
  _unsubscribe: function(obs) {
    obs.offAny(this._$handleSubAny);

    var onEndI = findByPred(this._bindedEndHandlers, function(obj) {
      return obj.obs === obs;
    });
    if (onEndI !== -1) {
      var onEnd = this._bindedEndHandlers[onEndI].handler;
      this._bindedEndHandlers.splice(onEndI, 1);
      obs.offEnd(onEnd);
    }
  },
  _handleSubAny: function(event) {
    if (event.type === VALUE || event.type === ERROR) {
      this._send(event.type, event.value, event.current && this._activating);
    }
  },

  _removeQueue: function(obs) {
    var index = find(this._queue, obs);
    this._queue = remove(this._queue, index);
    return index;
  },
  _removeCur: function(obs) {
    if (this._active) {
      this._unsubscribe(obs);
    }
    var index = find(this._curSources, obs);
    this._curSources = remove(this._curSources, index);
    if (index !== -1) {
      if (this._queue.length !== 0) {
        this._pullQueue();
      } else if (this._curSources.length === 0) {
        this._onEmpty();
      }
    }
    return index;
  },
  _removeOldest: function() {
    this._removeCur(this._curSources[0]);
  },

  _pullQueue: function() {
    if (this._queue.length !== 0) {
      this._queue = cloneArray(this._queue);
      this._addToCur(this._queue.shift());
    }
  },

  _onActivation: function() {
    var sources = this._curSources
      , i;
    this._activating = true;
    for (i = 0; i < sources.length; i++) {
      if (this._active) {
        this._subscribe(sources[i]);
      }
    }
    this._activating = false;
  },
  _onDeactivation: function() {
    var sources = this._curSources
      , i;
    for (i = 0; i < sources.length; i++) {
      this._unsubscribe(sources[i]);
    }
  },

  _isEmpty: function() {
    return this._curSources.length === 0;
  },
  _onEmpty: function() {},

  _clear: function() {
    Stream.prototype._clear.call(this);
    this._queue = null;
    this._curSources = null;
    this._$handleSubAny = null;
    this._bindedEndHandlers = null;
  }

});





// .merge()

var MergeLike = {
  _onEmpty: function() {
    if (this._initialised) {
      this._send(END, null, this._activating);
    }
  }
};

function Merge(sources) {
  _AbstractPool.call(this);
  if (sources.length === 0) {
    this._send(END);
  } else {
    this._addAll(sources);
  }
  this._initialised = true;
}

inherit(Merge, _AbstractPool, extend({_name: 'merge'}, MergeLike));

Kefir.merge = function(obss) {
  return new Merge(obss);
};

Observable.prototype.merge = function(other) {
  return Kefir.merge([this, other]);
};




// .concat()

function Concat(sources) {
  _AbstractPool.call(this, {concurLim: 1, queueLim: -1});
  if (sources.length === 0) {
    this._send(END);
  } else {
    this._addAll(sources);
  }
  this._initialised = true;
}

inherit(Concat, _AbstractPool, extend({_name: 'concat'}, MergeLike));

Kefir.concat = function(obss) {
  return new Concat(obss);
};

Observable.prototype.concat = function(other) {
  return Kefir.concat([this, other]);
};






// .pool()

function Pool() {
  _AbstractPool.call(this);
}
Kefir.Pool = Pool;

inherit(Pool, _AbstractPool, {

  _name: 'pool',

  plug: function(obs) {
    this._add(obs);
    return this;
  },
  unplug: function(obs) {
    this._remove(obs);
    return this;
  }

});

Kefir.pool = function() {
  return new Pool();
};





// .bus()

function Bus() {
  _AbstractPool.call(this);
}
Kefir.Bus = Bus;

inherit(Bus, _AbstractPool, {

  _name: 'bus',

  plug: function(obs) {
    this._add(obs);
    return this;
  },
  unplug: function(obs) {
    this._remove(obs);
    return this;
  },

  emit: function(x) {
    this._send(VALUE, x);
    return this;
  },
  error: function(x) {
    this._send(ERROR, x);
    return this;
  },
  end: function() {
    this._send(END);
    return this;
  },
  emitEvent: function(event) {
    this._send(event.type, event.value);
  }

});

Kefir.bus = deprecated('Kefir.bus()', 'Kefir.pool() or Kefir.stream()', function() {
  return new Bus();
});





// .flatMap()

function FlatMap(source, fn, options) {
  _AbstractPool.call(this, options);
  this._source = source;
  this._fn = fn || id;
  this._mainEnded = false;
  this._lastCurrent = null;

  var $ = this;
  this._$handleMainSource = function(event) {
    $._handleMainSource(event);
  };
}

inherit(FlatMap, _AbstractPool, {

  _onActivation: function() {
    _AbstractPool.prototype._onActivation.call(this);
    if (this._active) {
      this._activating = true;
      this._source.onAny(this._$handleMainSource);
      this._activating = false;
    }
  },
  _onDeactivation: function() {
    _AbstractPool.prototype._onDeactivation.call(this);
    this._source.offAny(this._$handleMainSource);
  },

  _handleMainSource: function(event) {
    if (event.type === VALUE) {
      if (!event.current || this._lastCurrent !== event.value) {
        this._add(event.value, this._fn);
      }
      this._lastCurrent = event.value;
    }
    if (event.type === ERROR) {
      this._send(ERROR, event.value, event.current);
    }
    if (event.type === END) {
      if (this._isEmpty()) {
        this._send(END, null, event.current);
      } else {
        this._mainEnded = true;
      }
    }
  },

  _onEmpty: function() {
    if (this._mainEnded) {
      this._send(END);
    }
  },

  _clear: function() {
    _AbstractPool.prototype._clear.call(this);
    this._source = null;
    this._lastCurrent = null;
    this._$handleMainSource = null;
  }

});

Observable.prototype.flatMap = function(fn) {
  return new FlatMap(this, fn)
    .setName(this, 'flatMap');
};

Observable.prototype.flatMapLatest = function(fn) {
  return new FlatMap(this, fn, {concurLim: 1, drop: 'old'})
    .setName(this, 'flatMapLatest');
};

Observable.prototype.flatMapFirst = function(fn) {
  return new FlatMap(this, fn, {concurLim: 1})
    .setName(this, 'flatMapFirst');
};

Observable.prototype.flatMapConcat = function(fn) {
  return new FlatMap(this, fn, {queueLim: -1, concurLim: 1})
    .setName(this, 'flatMapConcat');
};

Observable.prototype.flatMapConcurLimit = function(fn, limit) {
  var result;
  if (limit === 0) {
    result = Kefir.never();
  } else {
    if (limit < 0) {
      limit = -1;
    }
    result = new FlatMap(this, fn, {queueLim: -1, concurLim: limit});
  }
  return result.setName(this, 'flatMapConcurLimit');
};






// .zip()

function Zip(sources, combinator) {
  Stream.call(this);
  if (sources.length === 0) {
    this._send(END);
  } else {
    this._buffers = map(sources, function(source) {
      return isArray(source) ? cloneArray(source) : [];
    });
    this._sources = map(sources, function(source) {
      return isArray(source) ? Kefir.never() : source;
    });
    this._combinator = combinator ? spread(combinator, this._sources.length) : id;
    this._aliveCount = 0;

    this._bindedHandlers = Array(this._sources.length);
    for (var i = 0; i < this._sources.length; i++) {
      this._bindedHandlers[i] = this._bindHandleAny(i);
    }

  }
}


inherit(Zip, Stream, {

  _name: 'zip',

  _onActivation: function() {
    var i, length = this._sources.length;
    this._drainArrays();
    this._aliveCount = length;
    for (i = 0; i < length; i++) {
      if (this._active) {
        this._sources[i].onAny(this._bindedHandlers[i]);
      }
    }
  },

  _onDeactivation: function() {
    for (var i = 0; i < this._sources.length; i++) {
      this._sources[i].offAny(this._bindedHandlers[i]);
    }
  },

  _emit: function(isCurrent) {
    var values = new Array(this._buffers.length);
    for (var i = 0; i < this._buffers.length; i++) {
      values[i] = this._buffers[i].shift();
    }
    this._send(VALUE, this._combinator(values), isCurrent);
  },

  _isFull: function() {
    for (var i = 0; i < this._buffers.length; i++) {
      if (this._buffers[i].length === 0) {
        return false;
      }
    }
    return true;
  },

  _emitIfFull: function(isCurrent) {
    if (this._isFull()) {
      this._emit(isCurrent);
    }
  },

  _drainArrays: function() {
    while (this._isFull()) {
      this._emit(true);
    }
  },

  _bindHandleAny: function(i) {
    var $ = this;
    return function(event) {
      $._handleAny(i, event);
    };
  },

  _handleAny: function(i, event) {
    if (event.type === VALUE) {
      this._buffers[i].push(event.value);
      this._emitIfFull(event.current);
    }
    if (event.type === ERROR) {
      this._send(ERROR, event.value, event.current);
    }
    if (event.type === END) {
      this._aliveCount--;
      if (this._aliveCount === 0) {
        this._send(END, null, event.current);
      }
    }
  },

  _clear: function() {
    Stream.prototype._clear.call(this);
    this._sources = null;
    this._buffers = null;
    this._combinator = null;
    this._bindedHandlers = null;
  }

});

Kefir.zip = function(sources, combinator) {
  return new Zip(sources, combinator);
};

Observable.prototype.zip = function(other, combinator) {
  return new Zip([this, other], combinator);
};






// .combine()

function defaultErrorsCombinator(errors) {
  var latestError;
  for (var i = 0; i < errors.length; i++) {
    if (errors[i] !== undefined) {
      if (latestError === undefined || latestError.index < errors[i].index) {
        latestError = errors[i];
      }
    }
  }
  return latestError.error;
}

function Combine(active, passive, combinator) {
  Stream.call(this);
  if (active.length === 0) {
    this._send(END);
  } else {
    this._activeCount = active.length;
    this._sources = concat(active, passive);
    this._combinator = combinator ? spread(combinator, this._sources.length) : id;
    this._aliveCount = 0;
    this._latestValues = new Array(this._sources.length);
    this._latestErrors = new Array(this._sources.length);
    fillArray(this._latestValues, NOTHING);
    this._activating = false;
    this._emitAfterActivation = false;
    this._endAfterActivation = false;
    this._latestErrorIndex = 0;

    this._bindedHandlers = Array(this._sources.length);
    for (var i = 0; i < this._sources.length; i++) {
      this._bindedHandlers[i] = this._bindHandleAny(i);
    }

  }
}


inherit(Combine, Stream, {

  _name: 'combine',

  _onActivation: function() {
    var length = this._sources.length,
        i;
    this._aliveCount = this._activeCount;
    this._activating = true;
    for (i = 0; i < length; i++) {
      this._sources[i].onAny(this._bindedHandlers[i]);
    }
    this._activating = false;
    if (this._emitAfterActivation) {
      this._emitAfterActivation = false;
      this._emitIfFull(true);
    }
    if (this._endAfterActivation) {
      this._send(END, null, true);
    }
  },

  _onDeactivation: function() {
    var length = this._sources.length,
        i;
    for (i = 0; i < length; i++) {
      this._sources[i].offAny(this._bindedHandlers[i]);
    }
  },

  _emitIfFull: function(isCurrent) {
    var hasAllValues = true;
    var hasErrors = false;
    var length = this._latestValues.length;
    var valuesCopy = new Array(length);
    var errorsCopy = new Array(length);;

    for (var i = 0; i < length; i++) {
      valuesCopy[i] = this._latestValues[i];
      errorsCopy[i] = this._latestErrors[i];

      if (valuesCopy[i] === NOTHING) {
        hasAllValues = false;
      }

      if (errorsCopy[i] !== undefined) {
        hasErrors = true;
      }
    }

    if (hasAllValues) {
      this._send(VALUE, this._combinator(valuesCopy), isCurrent);
    }
    if (hasErrors) {
      this._send(ERROR, defaultErrorsCombinator(errorsCopy), isCurrent);
    }
  },

  _bindHandleAny: function(i) {
    var $ = this;
    return function(event) {
      $._handleAny(i, event);
    };
  },

  _handleAny: function(i, event) {

    if (event.type === VALUE || event.type === ERROR) {

      if (event.type === VALUE) {
        this._latestValues[i] = event.value;
        this._latestErrors[i] = undefined;
      }
      if (event.type === ERROR) {
        this._latestValues[i] = NOTHING;
        this._latestErrors[i] = {
          index: this._latestErrorIndex++,
          error: event.value
        };
      }

      if (i < this._activeCount) {
        if (this._activating) {
          this._emitAfterActivation = true;
        } else {
          this._emitIfFull(event.current);
        }
      }

    } else { // END

      if (i < this._activeCount) {
        this._aliveCount--;
        if (this._aliveCount === 0) {
          if (this._activating) {
            this._endAfterActivation = true;
          } else {
            this._send(END, null, event.current);
          }
        }
      }

    }
  },

  _clear: function() {
    Stream.prototype._clear.call(this);
    this._sources = null;
    this._latestValues = null;
    this._latestErrors = null;
    this._combinator = null;
    this._bindedHandlers = null;
  }

});

Kefir.combine = function(active, passive, combinator) {
  if (isFn(passive)) {
    combinator = passive;
    passive = null;
  }
  return new Combine(active, passive || [], combinator);
};

Observable.prototype.combine = function(other, combinator) {
  return Kefir.combine([this, other], combinator);
};






// .sampledBy()
Kefir.sampledBy = deprecated(
  'Kefir.sampledBy()',
  'Kefir.combine(active, passive, combinator)',
  function(passive, active, combinator) {

    // we need to flip `passive` and `active` in combinator function
    var _combinator = combinator;
    if (passive.length > 0) {
      var passiveLength = passive.length;
      _combinator = function() {
        var args = circleShift(arguments, passiveLength);
        return combinator ? apply(combinator, null, args) : args;
      };
    }

    return new Combine(active, passive, _combinator).setName('sampledBy');
  }
);

Observable.prototype.sampledBy = function(other, combinator) {
  var _combinator;
  if (combinator) {
    _combinator = function(active, passive) {
      return combinator(passive, active);
    };
  }
  return new Combine([other], [this], _combinator || id2).setName(this, 'sampledBy');
};

function produceStream(StreamClass, PropertyClass) {
  return function() {
    return new StreamClass(this, arguments);
  };
}
function produceProperty(StreamClass, PropertyClass) {
  return function() {
    return new PropertyClass(this, arguments);
  };
}



// .toProperty()

withOneSource('toProperty', {

  _init: function(args) {
    if (args[0] !== undefined) {
      if (isFn(args[0])) {
        this._getInitialCurrent = args[0];
      } else {
        throw new TypeError('The .toProperty method must be called with no args or with a function as an argument');
      }
    } else {
      this._getInitialCurrent = null;
    }
  },

  // redefining `_onActivation` from `withOneSource`
  _onActivation: function() {
    if (this._getInitialCurrent !== null) {
      var fn = this._getInitialCurrent;
      this._send(VALUE, fn(), true);
    }
    this._source.onAny(this._$handleAny); // copied from `withOneSource` impl of `_onActivation`
  }

}, {propertyMethod: produceProperty, streamMethod: produceProperty});





// .changes()

withOneSource('changes', {
  _handleValue: function(x, isCurrent) {
    if (!isCurrent) {
      this._send(VALUE, x);
    }
  },
  _handleError: function(x, isCurrent) {
    if (!isCurrent) {
      this._send(ERROR, x);
    }
  }
}, {
  streamMethod: produceStream,
  propertyMethod: produceStream
});




// .withHandler()

withOneSource('withHandler', {
  _init: function(args) {
    this._handler = args[0];
    this._forcedCurrent = false;
    var $ = this;
    this._emitter = {
      emit: function(x) {
        $._send(VALUE, x, $._forcedCurrent);
      },
      error: function(x) {
        $._send(ERROR, x, $._forcedCurrent);
      },
      end: function() {
        $._send(END, null, $._forcedCurrent);
      },
      emitEvent: function(e) {
        $._send(e.type, e.value, $._forcedCurrent);
      }
    };
  },
  _free: function() {
    this._handler = null;
    this._emitter = null;
  },
  _handleAny: function(event) {
    this._forcedCurrent = event.current;
    this._handler(this._emitter, event);
    this._forcedCurrent = false;
  }
});




// .flatten(fn)

withOneSource('flatten', {
  _init: function(args) {
    this._fn = args[0] ? args[0] : id;
  },
  _free: function() {
    this._fn = null;
  },
  _handleValue: function(x, isCurrent) {
    var xs = this._fn(x);
    for (var i = 0; i < xs.length; i++) {
      this._send(VALUE, xs[i], isCurrent);
    }
  }
});







// .transduce(transducer)

function xformForObs(obs) {
  return {
    '@@transducer/step': function(res, input) {
      obs._send(VALUE, input, obs._forcedCurrent);
      return null;
    },
    '@@transducer/result': function(res) {
      obs._send(END, null, obs._forcedCurrent);
      return null;
    }
  };
}

withOneSource('transduce', {
  _init: function(args) {
    this._xform = args[0](xformForObs(this));
  },
  _free: function() {
    this._xform = null;
  },
  _handleValue: function(x, isCurrent) {
    this._forcedCurrent = isCurrent;
    if (this._xform['@@transducer/step'](null, x) !== null) {
      this._xform['@@transducer/result'](null);
    }
    this._forcedCurrent = false;
  },
  _handleEnd: function(__, isCurrent) {
    this._forcedCurrent = isCurrent;
    this._xform['@@transducer/result'](null);
    this._forcedCurrent = false;
  }
});








// .map(fn)

withOneSource('map', {
  _init: function(args) {
    this._fn = args[0] || id;
  },
  _free: function() {
    this._fn = null;
  },
  _handleValue: function(x, isCurrent) {
    this._send(VALUE, this._fn(x), isCurrent);
  }
});




// .mapErrors(fn)

withOneSource('mapErrors', {
  _init: function(args) {
    this._fn = args[0] || id;
  },
  _free: function() {
    this._fn = null;
  },
  _handleError: function(x, isCurrent) {
    this._send(ERROR, this._fn(x), isCurrent);
  }
});



// .errorsToValues(fn)

function defaultErrorsToValuesHandler(x) {
  return {
    convert: true,
    value: x
  };
}

withOneSource('errorsToValues', {
  _init: function(args) {
    this._fn = args[0] || defaultErrorsToValuesHandler;
  },
  _free: function() {
    this._fn = null;
  },
  _handleError: function(x, isCurrent) {
    var result = this._fn(x);
    var type = result.convert ? VALUE : ERROR;
    var newX = result.convert ? result.value : x;
    this._send(type, newX, isCurrent);
  }
});



// .valuesToErrors(fn)

function defaultValuesToErrorsHandler(x) {
  return {
    convert: true,
    error: x
  };
}

withOneSource('valuesToErrors', {
  _init: function(args) {
    this._fn = args[0] || defaultValuesToErrorsHandler;
  },
  _free: function() {
    this._fn = null;
  },
  _handleValue: function(x, isCurrent) {
    var result = this._fn(x);
    var type = result.convert ? ERROR : VALUE;
    var newX = result.convert ? result.error : x;
    this._send(type, newX, isCurrent);
  }
});




// .filter(fn)

withOneSource('filter', {
  _init: function(args) {
    this._fn = args[0] || id;
  },
  _free: function() {
    this._fn = null;
  },
  _handleValue: function(x, isCurrent) {
    if (this._fn(x)) {
      this._send(VALUE, x, isCurrent);
    }
  }
});




// .filterErrors(fn)

withOneSource('filterErrors', {
  _init: function(args) {
    this._fn = args[0] || id;
  },
  _free: function() {
    this._fn = null;
  },
  _handleError: function(x, isCurrent) {
    if (this._fn(x)) {
      this._send(ERROR, x, isCurrent);
    }
  }
});




// .takeWhile(fn)

withOneSource('takeWhile', {
  _init: function(args) {
    this._fn = args[0] || id;
  },
  _free: function() {
    this._fn = null;
  },
  _handleValue: function(x, isCurrent) {
    if (this._fn(x)) {
      this._send(VALUE, x, isCurrent);
    } else {
      this._send(END, null, isCurrent);
    }
  }
});





// .take(n)

withOneSource('take', {
  _init: function(args) {
    this._n = args[0];
    if (this._n <= 0) {
      this._send(END);
    }
  },
  _handleValue: function(x, isCurrent) {
    this._n--;
    this._send(VALUE, x, isCurrent);
    if (this._n === 0) {
      this._send(END, null, isCurrent);
    }
  }
});





// .skip(n)

withOneSource('skip', {
  _init: function(args) {
    this._n = Math.max(0, args[0]);
  },
  _handleValue: function(x, isCurrent) {
    if (this._n === 0) {
      this._send(VALUE, x, isCurrent);
    } else {
      this._n--;
    }
  }
});




// .skipDuplicates([fn])

withOneSource('skipDuplicates', {
  _init: function(args) {
    this._fn = args[0] || strictEqual;
    this._prev = NOTHING;
  },
  _free: function() {
    this._fn = null;
    this._prev = null;
  },
  _handleValue: function(x, isCurrent) {
    if (this._prev === NOTHING || !this._fn(this._prev, x)) {
      this._prev = x;
      this._send(VALUE, x, isCurrent);
    }
  }
});





// .skipWhile(fn)

withOneSource('skipWhile', {
  _init: function(args) {
    this._fn = args[0] || id;
    this._skip = true;
  },
  _free: function() {
    this._fn = null;
  },
  _handleValue: function(x, isCurrent) {
    if (!this._skip) {
      this._send(VALUE, x, isCurrent);
      return;
    }
    if (!this._fn(x)) {
      this._skip = false;
      this._fn = null;
      this._send(VALUE, x, isCurrent);
    }
  }
});





// .diff(fn, seed)

withOneSource('diff', {
  _init: function(args) {
    this._fn = args[0] || defaultDiff;
    this._prev = args.length > 1 ? args[1] : NOTHING;
  },
  _free: function() {
    this._prev = null;
    this._fn = null;
  },
  _handleValue: function(x, isCurrent) {
    if (this._prev !== NOTHING) {
      this._send(VALUE, this._fn(this._prev, x), isCurrent);
    }
    this._prev = x;
  }
});





// .scan(fn, seed)

withOneSource('scan', {
  _init: function(args) {
    this._fn = args[0];
    if (args.length > 1) {
      this._send(VALUE, args[1], true);
    }
  },
  _free: function() {
    this._fn = null;
  },
  _handleValue: function(x, isCurrent) {
    if (this._currentEvent !== null && this._currentEvent.type !== ERROR) {
      x = this._fn(this._currentEvent.value, x);
    }
    this._send(VALUE, x, isCurrent);
  }
}, {streamMethod: produceProperty});





// .reduce(fn, seed)

withOneSource('reduce', {
  _init: function(args) {
    this._fn = args[0];
    this._result = args.length > 1 ? args[1] : NOTHING;
  },
  _free: function() {
    this._fn = null;
    this._result = null;
  },
  _handleValue: function(x) {
    this._result = (this._result === NOTHING) ? x : this._fn(this._result, x);
  },
  _handleEnd: function(__, isCurrent) {
    if (this._result !== NOTHING) {
      this._send(VALUE, this._result, isCurrent);
    }
    this._send(END, null, isCurrent);
  }
});




// .beforeEnd(fn)

withOneSource('beforeEnd', {
  _init: function(args) {
    this._fn = args[0];
  },
  _free: function() {
    this._fn = null;
  },
  _handleEnd: function(__, isCurrent) {
    this._send(VALUE, this._fn(), isCurrent);
    this._send(END, null, isCurrent);
  }
});




// .skipValue()

withOneSource('skipValues', {
  _handleValue: function() {}
});



// .skipError()

withOneSource('skipErrors', {
  _handleError: function() {}
});



// .skipEnd()

withOneSource('skipEnd', {
  _handleEnd: function() {}
});



// .endOnError()

withOneSource('endOnError', {
  _handleError: function(x, isCurrent) {
    this._send(ERROR, x, isCurrent);
    this._send(END, null, isCurrent);
  }
});



// .slidingWindow(max[, min])

withOneSource('slidingWindow', {
  _init: function(args) {
    this._max = args[0];
    this._min = args[1] || 0;
    this._buff = [];
  },
  _free: function() {
    this._buff = null;
  },
  _handleValue: function(x, isCurrent) {
    this._buff = slide(this._buff, x, this._max);
    if (this._buff.length >= this._min) {
      this._send(VALUE, this._buff, isCurrent);
    }
  }
});




// .bufferWhile([predicate], [options])

withOneSource('bufferWhile', {
  _init: function(args) {
    this._fn = args[0] || id;
    this._flushOnEnd = get(args[1], 'flushOnEnd', true);
    this._buff = [];
  },
  _free: function() {
    this._buff = null;
  },
  _flush: function(isCurrent) {
    if (this._buff !== null && this._buff.length !== 0) {
      this._send(VALUE, this._buff, isCurrent);
      this._buff = [];
    }
  },
  _handleValue: function(x, isCurrent) {
    this._buff.push(x);
    if (!this._fn(x)) {
      this._flush(isCurrent);
    }
  },
  _handleEnd: function(x, isCurrent) {
    if (this._flushOnEnd) {
      this._flush(isCurrent);
    }
    this._send(END, null, isCurrent);
  }
});





// .debounce(wait, {immediate})

withOneSource('debounce', {
  _init: function(args) {
    this._wait = Math.max(0, args[0]);
    this._immediate = get(args[1], 'immediate', false);
    this._lastAttempt = 0;
    this._timeoutId = null;
    this._laterValue = null;
    this._endLater = false;
    var $ = this;
    this._$later = function() {
      $._later();
    };
  },
  _free: function() {
    this._laterValue = null;
    this._$later = null;
  },
  _handleValue: function(x, isCurrent) {
    if (isCurrent) {
      this._send(VALUE, x, isCurrent);
    } else {
      this._lastAttempt = now();
      if (this._immediate && !this._timeoutId) {
        this._send(VALUE, x);
      }
      if (!this._timeoutId) {
        this._timeoutId = setTimeout(this._$later, this._wait);
      }
      if (!this._immediate) {
        this._laterValue = x;
      }
    }
  },
  _handleEnd: function(__, isCurrent) {
    if (isCurrent) {
      this._send(END, null, isCurrent);
    } else {
      if (this._timeoutId && !this._immediate) {
        this._endLater = true;
      } else {
        this._send(END);
      }
    }
  },
  _later: function() {
    var last = now() - this._lastAttempt;
    if (last < this._wait && last >= 0) {
      this._timeoutId = setTimeout(this._$later, this._wait - last);
    } else {
      this._timeoutId = null;
      if (!this._immediate) {
        this._send(VALUE, this._laterValue);
        this._laterValue = null;
      }
      if (this._endLater) {
        this._send(END);
      }
    }
  }
});





// .throttle(wait, {leading, trailing})

withOneSource('throttle', {
  _init: function(args) {
    this._wait = Math.max(0, args[0]);
    this._leading = get(args[1], 'leading', true);
    this._trailing = get(args[1], 'trailing', true);
    this._trailingValue = null;
    this._timeoutId = null;
    this._endLater = false;
    this._lastCallTime = 0;
    var $ = this;
    this._$trailingCall = function() {
      $._trailingCall();
    };
  },
  _free: function() {
    this._trailingValue = null;
    this._$trailingCall = null;
  },
  _handleValue: function(x, isCurrent) {
    if (isCurrent) {
      this._send(VALUE, x, isCurrent);
    } else {
      var curTime = now();
      if (this._lastCallTime === 0 && !this._leading) {
        this._lastCallTime = curTime;
      }
      var remaining = this._wait - (curTime - this._lastCallTime);
      if (remaining <= 0) {
        this._cancelTraling();
        this._lastCallTime = curTime;
        this._send(VALUE, x);
      } else if (this._trailing) {
        this._cancelTraling();
        this._trailingValue = x;
        this._timeoutId = setTimeout(this._$trailingCall, remaining);
      }
    }
  },
  _handleEnd: function(__, isCurrent) {
    if (isCurrent) {
      this._send(END, null, isCurrent);
    } else {
      if (this._timeoutId) {
        this._endLater = true;
      } else {
        this._send(END);
      }
    }
  },
  _cancelTraling: function() {
    if (this._timeoutId !== null) {
      clearTimeout(this._timeoutId);
      this._timeoutId = null;
    }
  },
  _trailingCall: function() {
    this._send(VALUE, this._trailingValue);
    this._timeoutId = null;
    this._trailingValue = null;
    this._lastCallTime = !this._leading ? 0 : now();
    if (this._endLater) {
      this._send(END);
    }
  }
});





// .delay()

withOneSource('delay', {
  _init: function(args) {
    this._wait = Math.max(0, args[0]);
    this._buff = [];
    var $ = this;
    this._$shiftBuff = function() {
      $._send(VALUE, $._buff.shift());
    };
  },
  _free: function() {
    this._buff = null;
    this._$shiftBuff = null;
  },
  _handleValue: function(x, isCurrent) {
    if (isCurrent) {
      this._send(VALUE, x, isCurrent);
    } else {
      this._buff.push(x);
      setTimeout(this._$shiftBuff, this._wait);
    }
  },
  _handleEnd: function(__, isCurrent) {
    if (isCurrent) {
      this._send(END, null, isCurrent);
    } else {
      var $ = this;
      setTimeout(function() {
        $._send(END);
      }, this._wait);
    }
  }
});

// Kefir.stream(fn)

function StreamStream(fn) {
  Stream.call(this);
  this._fn = fn;
  this._unsubscribe = null;
}

inherit(StreamStream, Stream, {

  _name: 'stream',

  _onActivation: function() {
    var $ = this
      , isCurrent = true
      , emitter = {
        emit: function(x) {
          $._send(VALUE, x, isCurrent);
        },
        error: function(x) {
          $._send(ERROR, x, isCurrent);
        },
        end: function() {
          $._send(END, null, isCurrent);
        },
        emitEvent: function(e) {
          $._send(e.type, e.value, isCurrent);
        }
      };
    this._unsubscribe = this._fn(emitter) || null;

    // fix https://github.com/pozadi/kefir/issues/35
    if (!this._active && this._unsubscribe !== null) {
      this._unsubscribe();
      this._unsubscribe = null;
    }

    isCurrent = false;
  },
  _onDeactivation: function() {
    if (this._unsubscribe !== null) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
  },

  _clear: function() {
    Stream.prototype._clear.call(this);
    this._fn = null;
  }

});

Kefir.stream = function(fn) {
  return new StreamStream(fn);
};






// Kefir.emitter()

function Emitter() {
  Stream.call(this);
}

inherit(Emitter, Stream, {
  _name: 'emitter',
  emit: function(x) {
    this._send(VALUE, x);
    return this;
  },
  error: function(x) {
    this._send(ERROR, x);
    return this;
  },
  end: function() {
    this._send(END);
    return this;
  },
  emitEvent: function(event) {
    this._send(event.type, event.value);
  }
});

Kefir.emitter = deprecated('Kefir.emitter()', 'Kefir.stream()', function() {
  return new Emitter();
});

Kefir.Emitter = Emitter;







// Kefir.never()

var neverObj = new Stream();
neverObj._send(END);
neverObj._name = 'never';
Kefir.never = function() {
  return neverObj;
};





// Kefir.constant(x)

function Constant(x) {
  Property.call(this);
  this._send(VALUE, x);
  this._send(END);
}

inherit(Constant, Property, {
  _name: 'constant'
});

Kefir.constant = function(x) {
  return new Constant(x);
};




// Kefir.constantError(x)

function ConstantError(x) {
  Property.call(this);
  this._send(ERROR, x);
  this._send(END);
}

inherit(ConstantError, Property, {
  _name: 'constantError'
});

Kefir.constantError = function(x) {
  return new ConstantError(x);
};




// Kefir.repeat(generator)

function Repeat(generator) {
  Stream.call(this);
  this._generator = generator;
  this._source = null;
  this._inLoop = false;
  this._activating = false;
  this._iteration = 0;

  var $ = this;
  this._$handleAny = function(event) {
    $._handleAny(event);
  };
}

inherit(Repeat, Stream, {

  _name: 'repeat',

  _handleAny: function(event) {
    if (event.type === END) {
      this._source = null;
      this._startLoop();
    } else {
      this._send(event.type, event.value, this._activating);
    }
  },

  _startLoop: function() {
    if (!this._inLoop) {
      this._inLoop = true;
      while (this._source === null && this._alive && this._active) {
        this._source = this._generator(this._iteration++);
        if (this._source) {
          this._source.onAny(this._$handleAny);
        } else {
          this._send(END);
        }
      }
      this._inLoop = false;
    }
  },

  _onActivation: function() {
    this._activating = true;
    if (this._source) {
      this._source.onAny(this._$handleAny);
    } else {
      this._startLoop();
    }
    this._activating = false;
  },

  _onDeactivation: function() {
    if (this._source) {
      this._source.offAny(this._$handleAny);
    }
  },

  _clear: function() {
    Stream.prototype._clear.call(this);
    this._generator = null;
    this._source = null;
    this._$handleAny = null;
  }

});

Kefir.repeat = function(generator) {
  return new Repeat(generator);
};



// .setName

Observable.prototype.setName = function(sourceObs, selfName /* or just selfName */) {
  this._name = selfName ? sourceObs._name + '.' + selfName : sourceObs;
  return this;
};



// .mapTo

Observable.prototype.mapTo = deprecated(
  '.mapTo()',
  '.map(() => value)',
  function(value) {
    return this.map(function() {
      return value;
    }).setName(this, 'mapTo');
  }
);



// .pluck

Observable.prototype.pluck = deprecated(
  '.pluck()',
  '.map((v) => v.prop)',
  function(propertyName) {
    return this.map(function(x) {
      return x[propertyName];
    }).setName(this, 'pluck');
  }
);



// .invoke

Observable.prototype.invoke = deprecated(
  '.invoke()',
  '.map((v) => v.method())',
  function(methodName /*, arg1, arg2... */) {
    var args = rest(arguments, 1);
    return this.map(args ?
      function(x) {
        return apply(x[methodName], x, args);
      } :
      function(x) {
        return x[methodName]();
      }
    ).setName(this, 'invoke');
  }
);




// .timestamp

Observable.prototype.timestamp = deprecated(
  '.timestamp()',
  '.map((v) => {value: v, time: (new Date).getTime()})',
  function() {
    return this.map(function(x) {
      return {value: x, time: now()};
    }).setName(this, 'timestamp');
  }
);




// .tap

Observable.prototype.tap = deprecated(
  '.tap()',
  '.map((v) => {fn(v); return v})',
  function(fn) {
    return this.map(function(x) {
      fn(x);
      return x;
    }).setName(this, 'tap');
  }
);




// .and

Kefir.and = deprecated(
  'Kefir.and()',
  'Kefir.combine([a, b], (a, b) => a && b)',
  function(observables) {
    return Kefir.combine(observables, and).setName('and');
  }
);

Observable.prototype.and = deprecated(
  '.and()',
  '.combine(other, (a, b) => a && b)',
  function(other) {
    return this.combine(other, and).setName('and');
  }
);



// .or

Kefir.or = deprecated(
  'Kefir.or()',
  'Kefir.combine([a, b], (a, b) => a || b)',
  function(observables) {
    return Kefir.combine(observables, or).setName('or');
  }
);

Observable.prototype.or = deprecated(
  '.or()',
  '.combine(other, (a, b) => a || b)',
  function(other) {
    return this.combine(other, or).setName('or');
  }
);



// .not

Observable.prototype.not = deprecated(
  '.not()',
  '.map(v => !v)',
  function() {
    return this.map(not).setName(this, 'not');
  }
);



// .awaiting

Observable.prototype.awaiting = function(other) {
  return Kefir.merge([
    this.map(returnsTrue),
    other.map(returnsFalse)
  ]).skipDuplicates().toProperty(returnsFalse).setName(this, 'awaiting');
};




// .fromCallback

Kefir.fromCallback = function(callbackConsumer) {
  var called = false;
  return Kefir.stream(function(emitter) {
    if (!called) {
      callbackConsumer(function(x) {
        emitter.emit(x);
        emitter.end();
      });
      called = true;
    }
  }).setName('fromCallback');
};




// .fromNodeCallback

Kefir.fromNodeCallback = function(callbackConsumer) {
  var called = false;
  return Kefir.stream(function(emitter) {
    if (!called) {
      callbackConsumer(function(error, x) {
        if (error) {
          emitter.error(error);
        } else {
          emitter.emit(x);
        }
        emitter.end();
      });
      called = true;
    }
  }).setName('fromNodeCallback');
};




// .fromPromise

Kefir.fromPromise = function(promise) {
  var called = false;
  return Kefir.stream(function(emitter) {
    if (!called) {
      var onValue = function(x) {
        emitter.emit(x);
        emitter.end();
      };
      var onError = function(x) {
        emitter.error(x);
        emitter.end();
      };
      var _promise = promise.then(onValue, onError);

      // prevent promise/A+ libraries like Q to swallow exceptions
      if (_promise && isFn(_promise.done)) {
        _promise.done();
      }

      called = true;
    }
  }).toProperty().setName('fromPromise');
};






// .fromSubUnsub

function fromSubUnsub(sub, unsub, transformer) {
  return Kefir.stream(function(emitter) {
    var handler = transformer ? function() {
      emitter.emit(apply(transformer, this, arguments));
    } : emitter.emit;
    sub(handler);
    return function() {
      unsub(handler);
    };
  });
}

Kefir.fromSubUnsub = deprecated('.fromSubUnsub()', 'Kefir.stream()', fromSubUnsub);




// .fromEvents

var subUnsubPairs = [
  ['addEventListener', 'removeEventListener'],
  ['addListener', 'removeListener'],
  ['on', 'off']
];

Kefir.fromEvents = function(target, eventName, transformer) {
  var pair, sub, unsub;

  for (var i = 0; i < subUnsubPairs.length; i++) {
    pair = subUnsubPairs[i];
    if (isFn(target[pair[0]]) && isFn(target[pair[1]])) {
      sub = pair[0];
      unsub = pair[1];
      break;
    }
  }

  if (sub === undefined) {
    throw new Error('target don\'t support any of ' +
      'addEventListener/removeEventListener, addListener/removeListener, on/off method pair');
  }

  return fromSubUnsub(
    function(handler) {
      target[sub](eventName, handler);
    },
    function(handler) {
      target[unsub](eventName, handler);
    },
    transformer
  ).setName('fromEvents');
};

var withTwoSourcesAndBufferMixin = {
  _init: function(args) {
    this._buff = [];
    this._flushOnEnd = get(args[0], 'flushOnEnd', true);
  },
  _free: function() {
    this._buff = null;
  },
  _flush: function(isCurrent) {
    if (this._buff !== null && this._buff.length !== 0) {
      this._send(VALUE, this._buff, isCurrent);
      this._buff = [];
    }
  },

  _handlePrimaryEnd: function(__, isCurrent) {
    if (this._flushOnEnd) {
      this._flush(isCurrent);
    }
    this._send(END, null, isCurrent);
  }
};



withTwoSources('bufferBy', extend({

  _onActivation: function() {
    this._primary.onAny(this._$handlePrimaryAny);
    if (this._alive && this._secondary !== null) {
      this._secondary.onAny(this._$handleSecondaryAny);
    }
  },

  _handlePrimaryValue: function(x, isCurrent) {
    this._buff.push(x);
  },

  _handleSecondaryValue: function(x, isCurrent) {
    this._flush(isCurrent);
  },

  _handleSecondaryEnd: function(x, isCurrent) {
    if (!this._flushOnEnd) {
      this._send(END, null, isCurrent);
    }
  }

}, withTwoSourcesAndBufferMixin));




withTwoSources('bufferWhileBy', extend({

  _handlePrimaryValue: function(x, isCurrent) {
    this._buff.push(x);
    if (this._lastSecondary !== NOTHING && !this._lastSecondary) {
      this._flush(isCurrent);
    }
  },

  _handleSecondaryEnd: function(x, isCurrent) {
    if (!this._flushOnEnd && (this._lastSecondary === NOTHING || this._lastSecondary)) {
      this._send(END, null, isCurrent);
    }
  }

}, withTwoSourcesAndBufferMixin));





withTwoSources('filterBy', {

  _handlePrimaryValue: function(x, isCurrent) {
    if (this._lastSecondary !== NOTHING && this._lastSecondary) {
      this._send(VALUE, x, isCurrent);
    }
  },

  _handleSecondaryEnd: function(__, isCurrent) {
    if (this._lastSecondary === NOTHING || !this._lastSecondary) {
      this._send(END, null, isCurrent);
    }
  }

});



withTwoSources('skipUntilBy', {

  _handlePrimaryValue: function(x, isCurrent) {
    if (this._lastSecondary !== NOTHING) {
      this._send(VALUE, x, isCurrent);
    }
  },

  _handleSecondaryEnd: function(__, isCurrent) {
    if (this._lastSecondary === NOTHING) {
      this._send(END, null, isCurrent);
    }
  }

});



withTwoSources('takeUntilBy', {

  _handleSecondaryValue: function(x, isCurrent) {
    this._send(END, null, isCurrent);
  }

});



withTwoSources('takeWhileBy', {

  _handlePrimaryValue: function(x, isCurrent) {
    if (this._lastSecondary !== NOTHING) {
      this._send(VALUE, x, isCurrent);
    }
  },

  _handleSecondaryValue: function(x, isCurrent) {
    this._lastSecondary = x;
    if (!this._lastSecondary) {
      this._send(END, null, isCurrent);
    }
  },

  _handleSecondaryEnd: function(__, isCurrent) {
    if (this._lastSecondary === NOTHING) {
      this._send(END, null, isCurrent);
    }
  }

});




withTwoSources('skipWhileBy', {

  _init: function() {
    this._hasFalseyFromSecondary = false;
  },

  _handlePrimaryValue: function(x, isCurrent) {
    if (this._hasFalseyFromSecondary) {
      this._send(VALUE, x, isCurrent);
    }
  },

  _handleSecondaryValue: function(x, isCurrent) {
    this._hasFalseyFromSecondary = this._hasFalseyFromSecondary || !x;
  },

  _handleSecondaryEnd: function(__, isCurrent) {
    if (!this._hasFalseyFromSecondary) {
      this._send(END, null, isCurrent);
    }
  }

});


  if (typeof define === 'function' && define.amd) {
    define([], function() {
      return Kefir;
    });
    global.Kefir = Kefir;
  } else if (typeof module === "object" && typeof exports === "object") {
    module.exports = Kefir;
    Kefir.Kefir = Kefir;
  } else {
    global.Kefir = Kefir;
  }

}(this));
/* Zepto v1.1.6 - zepto event ajax form ie - zeptojs.com/license */

var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    },
    isArray = Array.isArray ||
      function(object){ return object instanceof Array }

  zepto.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    dom.__proto__ = $.fn
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (isDocument(element) && isSimple && maybeID) ?
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
      slice.call(
        isSimple && !maybeID ?
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = document.documentElement.contains ?
    function(parent, node) {
      return parent !== node && parent.contains(node)
    } :
    function(parent, node) {
      while (node && (node = node.parentNode))
        if (node === parent) return true
      return false
    }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className || '',
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          +value + "" == value ? +value :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result, $this = this
      if (!selector) result = $()
      else if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
    closest: function(selector, context){
      var node = this[0], collection = false
      if (typeof selector == 'object') collection = $(selector)
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
        node = node !== context && !isDocument(node) && node.parentNode
      return $(node)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    contents: function() {
      return this.map(function() { return slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return 0 in arguments ?
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        }) :
        (0 in this ? this[0].innerHTML : null)
    },
    text: function(text){
      return 0 in arguments ?
        this.each(function(idx){
          var newText = funcArg(this, text, idx, this.textContent)
          this.textContent = newText == null ? '' : ''+newText
        }) :
        (0 in this ? this[0].textContent : null)
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && !(1 in arguments)) ?
        (!this.length || this[0].nodeType !== 1 ? undefined :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && name.split(' ').forEach(function(attribute){
        setAttribute(this, attribute)
      }, this)})
    },
    prop: function(name, value){
      name = propMap[name] || name
      return (1 in arguments) ?
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        }) :
        (this[0] && this[0][name])
    },
    data: function(name, value){
      var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

      var data = (1 in arguments) ?
        this.attr(attrName, value) :
        this.attr(attrName)

      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      return 0 in arguments ?
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        }) :
        (this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
           this[0].value)
        )
    },
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (!this.length) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2) {
        var computedStyle, element = this[0]
        if(!element) return
        computedStyle = getComputedStyle(element, '')
        if (typeof property == 'string')
          return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
        else if (isArray(property)) {
          var props = {}
          $.each(property, function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (!name) return false
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        if (!('className' in this)) return
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (!('className' in this)) return
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value){
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })

    $.fn[dimension] = function(value){
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var i = 0, len = node.childNodes.length; i < len; i++)
      traverseNode(node.childNodes[i], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            argType = type(arg)
            return argType == "object" || argType == "array" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        var parentInDocument = $.contains(document.documentElement, parent)

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          parent.insertBefore(node, target)
          if (parentInDocument) traverseNode(node, function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src)
              window['eval'].call(window, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

window.Zepto = Zepto
window.$ === undefined && (window.$ = Zepto)

;(function($){
  var _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj){ return typeof obj == 'string' },
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function(event){
      if (event == 'ready') return $(document).ready(fn)
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    var args = (2 in arguments) && slice.call(arguments, 2)
    if (isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      if (args) {
        args.unshift(fn[context], fn)
        return $.proxy.apply(null, args)
      } else {
        return $.proxy(fn[context], fn)
      }
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, data, callback){
    return this.on(event, data, callback)
  }
  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  $.fn.one = function(event, selector, data, callback){
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function(selector, event, callback){
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, data, callback, one){
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (isFunction(data) || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(_, element){
      if (one) autoRemove = function(e){
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function(e){
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // handle focus(), blur() by calling them directly
      if (event.type in focus && typeof this[event.type] == "function") this[event.type]()
      // items in the collection might not be DOM elements
      else if ('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout focus blur load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return (0 in arguments) ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  $.Event = function(type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto)

;(function($){
  var jsonpID = 0,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/,
      originAnchor = document.createElement('a')

  originAnchor.href = window.location.href

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options, deferred){
    if (!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = { abort: abort }, abortTimeout

    if (deferred) deferred.promise(xhr)

    $(script).on('load error', function(e, errorType){
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }

    window[callbackName] = function(){
      responseData = arguments
    }

    script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
    document.head.appendChild(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data), options.data = undefined
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred(),
        urlAnchor
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) {
      urlAnchor = document.createElement('a')
      urlAnchor.href = settings.url
      urlAnchor.href = urlAnchor.href
      settings.crossDomain = (originAnchor.protocol + '//' + originAnchor.host) !== (urlAnchor.protocol + '//' + urlAnchor.host)
    }

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)

    var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url)
    if (hasPlaceholder) dataType = 'jsonp'

    if (settings.cache === false || (
         (!options || options.cache !== true) &&
         ('script' == dataType || 'jsonp' == dataType)
        ))
      settings.url = appendQuery(settings.url, '_=' + Date.now())

    if ('jsonp' == dataType) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings, deferred)
    }

    var mime = settings.accepts[dataType],
        headers = { },
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout

    if (deferred) deferred.promise(xhr)

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings, deferred)
          else ajaxSuccess(result, xhr, settings, deferred)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    if ($.isFunction(data)) dataType = success, success = data, data = undefined
    if (!$.isFunction(success)) dataType = success, success = undefined
    return {
      url: url
    , data: data
    , success: success
    , dataType: dataType
    }
  }

  $.get = function(/* url, data, success, dataType */){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(/* url, data, success, dataType */){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(/* url, data, success */){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response){
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(key, value) {
      if ($.isFunction(value)) value = value()
      if (value == null) value = ""
      this.push(escape(key) + '=' + escape(value))
    }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)

;(function($){
  $.fn.serializeArray = function() {
    var name, type, result = [],
      add = function(value) {
        if (value.forEach) return value.forEach(add)
        result.push({ name: name, value: value })
      }
    if (this[0]) $.each(this[0].elements, function(_, field){
      type = field.type, name = field.name
      if (name && field.nodeName.toLowerCase() != 'fieldset' &&
        !field.disabled && type != 'submit' && type != 'reset' && type != 'button' && type != 'file' &&
        ((type != 'radio' && type != 'checkbox') || field.checked))
          add($(field).val())
    })
    return result
  }

  $.fn.serialize = function(){
    var result = []
    this.serializeArray().forEach(function(elm){
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }

  $.fn.submit = function(callback) {
    if (0 in arguments) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.isDefaultPrevented()) this.get(0).submit()
    }
    return this
  }

})(Zepto)

;(function($){
  // __proto__ doesn't exist on IE<11, so redefine
  // the Z function to use object extension instead
  if (!('__proto__' in {})) {
    $.extend($.zepto, {
      Z: function(dom, selector){
        dom = dom || []
        $.extend(dom, $.fn)
        dom.selector = selector || ''
        dom.__Z = true
        return dom
      },
      // this is a kludge but works
      isZ: function(object){
        return $.type(object) === 'array' && '__Z' in object
      }
    })
  }

  // getComputedStyle shouldn't freak out when called
  // without a valid element as argument
  try {
    getComputedStyle(undefined)
  } catch(e) {
    var nativeGetComputedStyle = getComputedStyle;
    window.getComputedStyle = function(element){
      try {
        return nativeGetComputedStyle(element)
      } catch(e) {
        return null
      }
    }
  }
})(Zepto)

;