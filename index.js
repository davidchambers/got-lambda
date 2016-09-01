'use strict';

var $ = require('sanctuary-def');

var def = $.create({checkTypes: true, env: $.env});

//# _ :: Placeholder
var _ = {'@@functional/placeholder': true};

//  a :: Type
var a = $.TypeVariable('a');

//  b :: Type
var b = $.TypeVariable('b');

//  c :: Type
var c = $.TypeVariable('c');

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
    [$.AnyFunction, a, $.Array(b), a],
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
    [$.AnyFunction, b, a, c],
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

//# map :: (a -> b) -> Array a -> Array b
//.
//. > map(add(10), [1, 2, 3])
//. [11, 12, 13]
var map =
def('map',
    {},
    [$.AnyFunction, $.Array(a), $.Array(b)],
    function(f, xs) {
      //  We'd like to use xs.map(f) here but Array#map is not lawful:
      //  it applies the function to three arguments rather than one.
      return xs.map(function(x) { return f(x); });
    });

//# compose :: (b -> c) -> (a -> b) -> a -> c
//.
//. > compose(Math.sqrt, sum, [1, 2, 3, 4, 5, 6, 7, 8])
//. 6
var compose =
def('compose',
    {},
    [$.AnyFunction, $.AnyFunction, a, c],
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

//# concat :: String -> String -> String
//.
//. > concat('foo', 'bar')
//. 'foobar'
var concat =
def('concat',
    {},
    [$.String, $.String, $.String],
    function(s1, s2) { return s1 + s2; });

//# shout :: String -> String
//.
//. > shout('hey')
//. 'HEY!'
var shout =
def('shout',
    {},
    [$.String, $.String],
    compose(concat(_, '!'), toUpper));

//# head :: Array a -> a
//.
//. > head(['foo', 'bar', 'baz'])
//. 'foo'
//.
//. > head([])
//. ! Error: ‘head’ applied to []
var head =
def('head',
    {},
    [$.Array(a), a],
    function(xs) {
      if (xs.length === 0) throw new Error('‘head’ applied to []');
      return xs[0];
    });

//  Suppress ESLint errors.
head; inc; map; reverse; shout; sum;
