'use strict';

var $ = require('sanctuary-def');

//# _ :: Placeholder
var _ = {'@@functional/placeholder': true};

//# Chain :: TypeClass
var Chain = $.TypeClass(
  'got-lambda/Semigroup',
  function(x) { return x != null && typeof x.chain === 'function'; }
);

//# Semigroup :: TypeClass
var Semigroup = $.TypeClass(
  'got-lambda/Semigroup',
  function(x) { return x != null && typeof x.concat === 'function'; }
);

//  a :: Type
var a = $.TypeVariable('a');

//  b :: Type
var b = $.TypeVariable('b');

//  c :: Type
var c = $.TypeVariable('c');

//  f :: Type -> Type
var f = $.UnaryTypeVariable('f');

//  Fn :: (Type, Type) -> Type
var Fn = function(inputType, outputType) {
  return $.Function([inputType, outputType]);
};

//# Maybe :: Type -> Type
var Maybe = $.UnaryType(
  'got-lambda/Maybe',
  function(x) { return x != null && x['@@type'] === 'got-lambda/Maybe'; },
  function(maybe) { return maybe.isJust ? [maybe.value] : []; }
);

//# Nothing :: Maybe a
var Nothing = {
  '@@type': 'got-lambda/Maybe',
  isNothing: true,
  isJust: false,
  map: function(f) { return this; },
  chain: function(f) { return this; },
  toString: function() { return 'Nothing'; }
};

//# Just :: a -> Maybe a
var Just = function Just(x) {
  return {
    '@@type': 'got-lambda/Maybe',
    isNothing: false,
    isJust: true,
    value: x,
    map: function(f) { return Just(f(x)); },
    chain: function(f) { return f(x); },
    toString: function() { return 'Just(' + x + ')'; }
  };
};

var def = $.create({checkTypes: true, env: $.env.concat([Maybe])});

//# add :: Number -> Number -> Number
//.
//. > add(2, 2)
//. 4
var add =
def('add',
    {},
    [$.Number, $.Number, $.Number],
    function(x, y) { return x + y; });

//# inc :: Number -> Number
//.
//. > inc(2)
//. 3
var inc =
def('inc',
    {},
    [$.Number, $.Number],
    add(1));

//# reduce :: (a -> b -> a) -> a -> Array b -> a
//.
//. > reduce(add, 0, [1, 2, 3, 4, 5])
//. 15
var reduce =
def('reduce',
    {},
    [Fn(a, Fn(b, a)), a, $.Array(b), a],
    function(f, initial, xs) {
      var result = initial;
      for (var idx = 0; idx < xs.length; idx += 1) {
        result = f(result)(xs[idx]);
      }
      return result;
    });

//# sum :: Array Number -> Number
//.
//. > sum([1, 2, 3, 4, 5])
//. 15
var sum =
def('sum',
    {},
    [$.Array($.Number), $.Number],
    reduce(add, 0));

//# prepend :: a -> Array a -> Array a
//.
//. > prepend(1, [2, 3, 4])
//. [1, 2, 3, 4]
var prepend =
def('prepend',
    {},
    [a, $.Array(a), $.Array(a)],
    function(x, xs) { return [x].concat(xs); });

//# flip :: (a -> b -> c) -> b -> a -> c
//.
//. > flip(concat, 'bar', 'foo')
//. 'foobar'
var flip =
def('flip',
    {},
    [Fn(a, Fn(b, c)), b, a, c],
    function(f, y, x) { return f(x)(y); });

//# reverse :: Array a -> Array a
//.
//. > reverse([1, 2, 3])
//. [3, 2, 1]
var reverse =
def('reverse',
    {},
    [$.Array(a), $.Array(a)],
    reduce(flip(prepend), []));

//# map :: Functor f => (a -> b) -> f a -> f b
//.
//. > map(add(10), [1, 2, 3])
//. [11, 12, 13]
//.
//. > map(add(10), Just(6))
//. Just(16)
//.
//. > map(add(10), Nothing)
//. Nothing
var map =
def('map',
    {},
    [Fn(a, b), f(a), f(b)],
    function(f, functor) {
      //  We'd like to use functor.map(f) here but Array#map is not lawful:
      //  it applies the function to three arguments rather than one.
      return functor.map(function(x) { return f(x); });
    });

//# chain :: Chain f => (a -> f b) -> f a -> f b
//.
//. > chain(head, Just(['foo', 'bar', 'baz']))
//. Just('foo')
//.
//. > chain(head, Just([]))
//. Nothing
//.
//. > chain(head, Nothing)
//. Nothing
var chain =
def('chain',
    {f: [Chain]},
    [Fn(a, f(b)), f(a), f(b)],
    function(f, chain) { return chain.chain(f); });

//# compose :: (b -> c) -> (a -> b) -> a -> c
//.
//. > compose(Math.sqrt, sum, [1, 2, 3, 4, 5, 6, 7, 8])
//. 6
var compose =
def('compose',
    {},
    [Fn(b, c), Fn(a, b), a, c],
    function(f, g, x) { return f(g(x)); });

//# toUpper :: String -> String
//.
//. > toUpper('foo')
//. 'FOO'
var toUpper =
def('toUpper',
    {},
    [$.String, $.String],
    function(s) { return s.toUpperCase(); });

//# concat :: Semigroup a => a -> a -> a
//.
//. > concat('foo', 'bar')
//. 'foobar'
//.
//. > concat([1, 2, 3], [4, 5, 6])
//. [1, 2, 3, 4, 5, 6]
var concat =
def('concat',
    {a: [Semigroup]},
    [a, a, a],
    function(s1, s2) { return s1.concat(s2); });

//# shout :: String -> String
//.
//. > shout('hey')
//. 'HEY!'
var shout =
def('shout',
    {},
    [$.String, $.String],
    compose(concat(_, '!'), toUpper));

//# head :: Array a -> Maybe a
//.
//. > head(['foo', 'bar', 'baz'])
//. Just('foo')
//.
//. > head([])
//. Nothing
var head =
def('head',
    {},
    [$.Array(a), Maybe(a)],
    function(xs) { return xs.length === 0 ? Nothing : Just(xs[0]); });

//# parseInt_ :: PositiveInteger -> String -> Maybe Integer
//.
//. > parseInt_(10, '42')
//. Just(42)
//.
//. > parseInt_(16, 'FF')
//. Just(255)
//.
//. > parseInt_(16, 'GG')
//. Nothing
var parseInt_ =
def('parseInt_',
    {},
    [$.PositiveInteger, $.String, Maybe($.Integer)],
    function(base, s) {
      var n = parseInt(s, base);
      return isNaN(n) ? Nothing : Just(n);
    });

//  Suppress ESLint errors.
Just; Nothing; chain; head; inc; map; parseInt_; reverse; shout; sum;
