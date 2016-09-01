'use strict';

//# curry2 :: ((a, b) -> c) -> (a -> b -> c)
var curry2 = function(f) {
  return function(x, y) {
    switch (arguments.length) {
      case 1: return function(y) { return f(x, y); };
      case 2: return f(x, y);
    }
  };
};

//# curry3 :: ((a, b, c) -> d) -> (a -> b -> c -> d)
var curry3 = function(f) {
  return function(x, y, z) {
    switch (arguments.length) {
      case 1: return curry2(function(y, z) { return f(x, y, z); });
      case 2: return function(z) { return f(x, y, z); };
      case 3: return f(x, y, z);
    }
  };
};

//# add :: Number -> Number -> Number
//.
//. > add(2, 2)
//. 4
var add = curry2(function(x, y) { return x + y; });

//# inc :: Number -> Number
//.
//. > inc(2)
//. 3
var inc = add(1);

//# reduce :: (a -> b -> a) -> a -> Array b -> a
//.
//. > reduce(add, 0, [1, 2, 3, 4, 5])
//. 15
var reduce = curry3(function(f, initial, xs) {
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
var sum = reduce(add, 0);

//# prepend :: a -> Array a -> Array a
//.
//. > prepend(1, [2, 3, 4])
//. [1, 2, 3, 4]
var prepend = curry2(function(x, xs) { return [x].concat(xs); });

//# flip :: (a -> b -> c) -> b -> a -> c
//.
//. > flip(concat, 'bar', 'foo')
//. 'foobar'
var flip = curry3(function(f, y, x) { return f(x)(y); });

//# reverse :: Array a -> Array a
//.
//. > reverse([1, 2, 3])
//. [3, 2, 1]
var reverse = reduce(flip(prepend), []);

//# map :: (a -> b) -> Array a -> Array b
//.
//. > map(add(10), [1, 2, 3])
//. [11, 12, 13]
var map = curry2(function(f, xs) {
  //  We'd like to use xs.map(f) here but Array#map is not lawful:
  //  it applies the function to three arguments rather than one.
  return xs.map(function(x) { return f(x); });
});

//# compose :: (b -> c) -> (a -> b) -> a -> c
//.
//. > compose(Math.sqrt, sum, [1, 2, 3, 4, 5, 6, 7, 8])
//. 6
var compose = curry3(function(f, g, x) { return f(g(x)); });

//# toUpper :: String -> String
//.
//. > toUpper('foo')
//. 'FOO'
var toUpper = function(s) { return s.toUpperCase(); };

//# concat :: String -> String -> String
//.
//. > concat('foo', 'bar')
//. 'foobar'
var concat = curry2(function(s1, s2) { return s1 + s2; });

//# shout :: String -> String
//.
//. > shout('hey')
//. 'HEY!'
var shout = compose(function(s) { return concat(s, '!'); }, toUpper);

//# head :: Array a -> a
//.
//. > head(['foo', 'bar', 'baz'])
//. 'foo'
//.
//. > head([])
//. ! Error: ‘head’ applied to []
var head = function(xs) {
  if (xs.length === 0) throw new Error('‘head’ applied to []');
  return xs[0];
};

//  Suppress ESLint errors.
head; inc; map; reverse; shout; sum;
