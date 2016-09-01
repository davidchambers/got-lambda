'use strict';

//# _ :: Placeholder
var _ = {'@@functional/placeholder': true};

//# isPlaceholder :: a -> Boolean
//.
//. > isPlaceholder(_)
//. true
//.
//. > isPlaceholder(null)
//. false
var isPlaceholder = function(x) {
  return x != null && x['@@functional/placeholder'] === true;
};

//# repr :: a -> String
//.
//. > repr(true)
//. 'Boolean'
var repr = function(x) {
  return Object.prototype.toString.call(x).slice('[object '.length,
                                                 -']'.length);
};

//# typeName :: TypeRep a -> String
//.
//. > typeName(String)
//. 'String'
var typeName = function(typeRep) {
  return /^function ([$_A-Za-z][$_A-Za-z0-9]*)/.exec(typeRep)[1];
};

//# Any :: TypeRep a
var Any = function Any() {};

//# checkArgumentType :: (String, TypeRep a, b, String) -> Undefined
var checkArgumentType = function(name, X, x, position) {
  var expectedTypeName = typeName(X);
  if (expectedTypeName !== 'Any' && repr(x) !== expectedTypeName) {
    throw new TypeError(
      '‘' + name + '’ requires a value of type ' + typeName(X) +
      ' as its ' + position + ' argument; received ' + x
    );
  }
};

//# curry1 :: (String, TypeRep a, a -> b) -> (a -> b)
var curry1 = function(name, X, f) {
  return function(x) {
    switch (arguments.length) {
      case 1:
        checkArgumentType(name, X, x, 'first');
        return f(x);
    }
  };
};

//# curry2 :: (String, TypeRep a, TypeRep b, (a, b) -> c) -> (a -> b -> c)
var curry2 = function(name, X, Y, f) {
  return function(x, y) {
    switch (true) {
      case arguments.length === 1:
        return curry1(name, Y, function(y) { return f(x, y); });
      case arguments.length === 2 && isPlaceholder(x):
        return curry1(name, X, function(x) { return f(x, y); });
      case arguments.length === 2:
        checkArgumentType(name, X, x, 'first');
        checkArgumentType(name, Y, y, 'second');
        return f(x, y);
    }
  };
};

//# curry3 :: (String, TypeRep a, TypeRep b, TypeRep c, (a, b, c) -> d) -> (a -> b -> c -> d)
var curry3 = function(name, X, Y, Z, f) {
  return function(x, y, z) {
    switch (true) {
      case arguments.length === 1:
        return curry2(name, Y, Z, function(y, z) { return f(x, y, z); });
      case arguments.length === 2 && isPlaceholder(x):
        return curry2(name, X, Z, function(x, z) { return f(x, y, z); });
      case arguments.length === 2:
        return curry1(name, Z, function(z) { return f(x, y, z); });
      case arguments.length === 3 && isPlaceholder(x) && isPlaceholder(y):
        return curry2(name, X, Y, function(x, y) { return f(x, y, z); });
      case arguments.length === 3 && isPlaceholder(x):
        return curry1(name, X, function(x) { return f(x, y, z); });
      case arguments.length === 3 && isPlaceholder(y):
        return curry1(name, Y, function(y) { return f(x, y, z); });
      case arguments.length === 3:
        checkArgumentType(name, X, x, 'first');
        checkArgumentType(name, Y, y, 'second');
        checkArgumentType(name, Z, z, 'third');
        return f(x, y, z);
    }
  };
};

//# add :: Number -> Number -> Number
//.
//. > add(2, 2)
//. 4
//.
//. > add('foo', 'bar')
//. ! TypeError: ‘add’ requires a value of type Number as its first argument; received foo
var add =
curry2('add',
       Number,
       Number,
       function(x, y) { return x + y; });

//# inc :: Number -> Number
//.
//. > inc(2)
//. 3
var inc =
curry1('inc',
       Number,
       add(1));

//# reduce :: (a -> b -> a) -> a -> Array b -> a
//.
//. > reduce(add, 0, [1, 2, 3, 4, 5])
//. 15
var reduce =
curry3('reduce',
       Function,
       Any,
       Array,
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
curry1('sum',
       Array,
       reduce(add, 0));

//# prepend :: a -> Array a -> Array a
//.
//. > prepend(1, [2, 3, 4])
//. [1, 2, 3, 4]
var prepend =
curry2('prepend',
       Any,
       Array,
       function(x, xs) { return [x].concat(xs); });

//# flip :: (a -> b -> c) -> b -> a -> c
//.
//. > flip(concat, 'bar', 'foo')
//. 'foobar'
var flip =
curry3('flip',
       Function,
       Any,
       Any,
       function(f, y, x) { return f(x)(y); });

//# reverse :: Array a -> Array a
//.
//. > reverse([1, 2, 3])
//. [3, 2, 1]
var reverse =
curry1('reverse',
       Array,
       reduce(flip(prepend), []));

//# map :: (a -> b) -> Array a -> Array b
//.
//. > map(add(10), [1, 2, 3])
//. [11, 12, 13]
var map =
curry2('map',
       Function,
       Array,
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
curry3('compose',
       Function,
       Function,
       Any,
       function(f, g, x) { return f(g(x)); });

//# toUpper :: String -> String
//.
//. > toUpper('foo')
//. 'FOO'
var toUpper =
curry1('toUpper',
       String,
       function(s) { return s.toUpperCase(); });

//# concat :: String -> String -> String
//.
//. > concat('foo', 'bar')
//. 'foobar'
var concat =
curry2('concat',
       String,
       String,
       function(s1, s2) { return s1 + s2; });

//# shout :: String -> String
//.
//. > shout('hey')
//. 'HEY!'
var shout =
curry1('shout',
       String,
       compose(concat(_, '!'), toUpper));

//# head :: Array a -> a
//.
//. > head(['foo', 'bar', 'baz'])
//. 'foo'
//.
//. > head([])
//. ! Error: ‘head’ applied to []
var head =
curry1('head',
       Array,
       function(xs) {
         if (xs.length === 0) throw new Error('‘head’ applied to []');
         return xs[0];
       });

//  Suppress ESLint errors.
head; inc; map; reverse; shout; sum;
