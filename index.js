'use strict';

//# add :: Number -> Number -> Number
//.
//. > add(2)(2)
//. 4
var add = function(x) {
  return function(y) {
    return x + y;
  };
};

//# inc :: Number -> Number
//.
//. > inc(2)
//. 3
var inc = add(1);

//# reduce :: (a -> b -> a) -> a -> Array b -> a
//.
//. > reduce(add)(0)([1, 2, 3, 4, 5])
//. 15
var reduce = function(f) {
  return function(initial) {
    return function(xs) {
      var result = initial;
      for (var idx = 0; idx < xs.length; idx += 1) {
        result = f(result)(xs[idx]);
      }
      return result;
    };
  };
};

//# sum :: Array Number -> Number
//.
//. > sum([1, 2, 3, 4, 5])
//. 15
var sum = reduce(add)(0);

//# prepend :: a -> Array a -> Array a
//.
//. > prepend(1)([2, 3, 4])
//. [1, 2, 3, 4]
var prepend = function(x) {
  return function(xs) {
    return [x].concat(xs);
  };
};

//# flip :: (a -> b -> c) -> b -> a -> c
//.
//. > flip(concat)('bar')('foo')
//. 'foobar'
var flip = function(f) {
  return function(y) {
    return function(x) {
      return f(x)(y);
    };
  };
};

//# reverse :: Array a -> Array a
//.
//. > reverse([1, 2, 3])
//. [3, 2, 1]
var reverse = reduce(flip(prepend))([]);

//# map :: (a -> b) -> Array a -> Array b
//.
//. > map(add(10))([1, 2, 3])
//. [11, 12, 13]
var map = function(f) {
  return function(xs) {
    //  We'd like to use xs.map(f) here but Array#map is not lawful:
    //  it applies the function to three arguments rather than one.
    return xs.map(function(x) { return f(x); });
  };
};

//# compose :: (b -> c) -> (a -> b) -> a -> c
//.
//. > compose(Math.sqrt)(sum)([1, 2, 3, 4, 5, 6, 7, 8])
//. 6
var compose = function(f) {
  return function(g) {
    return function(x) {
      return f(g(x));
    };
  };
};

//# toUpper :: String -> String
//.
//. > toUpper('foo')
//. 'FOO'
var toUpper = function(s) { return s.toUpperCase(); };

//# concat :: String -> String -> String
//.
//. > concat('foo')('bar')
//. 'foobar'
var concat = function(s1) {
  return function(s2) {
    return s1 + s2;
  };
};

//# shout :: String -> String
//.
//. > shout('hey')
//. 'HEY!'
var shout = compose(function(s) { return concat(s)('!'); })(toUpper);

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
