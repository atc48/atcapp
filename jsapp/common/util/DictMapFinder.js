(function (pkg, fac) {
  pkg.DictMapFinder = fac(_, __);
})(atcapp, function (_, __) {

  var DEBUG = false;
  var END_CHAR = "$"

  function DictMapFinder(dictMap) {
    this.dictMap = dictMap;
  }

  DictMapFinder.prototype.findAll = function (opt_prefix) {
    var prefix = opt_prefix || "";
    __.assert(_.isString(prefix) && prefix.indexOf(END_CHAR) < 0);

    var mapTail = this.dictMap;
    _.each(prefix, function (chr) {
      if (!mapTail) { return; }
      mapTail = mapTail[chr];
    });

    if (!mapTail) {
      return [];
    }

    var childWords = __findAllChildWords(mapTail);
    var words = _.map(childWords, function (cWord) { return prefix + cWord; });

    return words;
  };

  function __findAllChildWords(mapTop) {
    var words = [];
    _.each(mapTop, function (obj, chr) {
      if (chr == END_CHAR) {
	words.push( "" );
	return;
      }
      var childWords = __findAllChildWords( obj );
      words = _.union( words, _.map(childWords, function (cWord) {
	return chr + cWord;
      }) );
    });
    return words;
  }

  function __test() {
    var map = {'Y':{'O':{'M':{'I':{'$':0}}},'A':{'M':{'I':{'$':0,'N':{'O':{'$':0}}}}}}};
    var finder = new DictMapFinder(map);
   
    _.each([
      ["",       ["YOMI", "YAMI", "YAMINO"]],
      ["Y",      ["YOMI", "YAMI", "YAMINO"]],
      ["YO",     ["YOMI"]],
      ["YA",     ["YAMI", "YAMINO"]],
      ["YAMI",   ["YAMI", "YAMINO"]],
      ["YAMIN",  ["YAMINO"]],
      ["YAMINO", ["YAMINO"]],
      ["YOMI",   ["YOMI"]]
    ], function (r) {
      var input = r[0], expect = r[1];
      __.assert( _.isEqual(finder.findAll(input), expect), input);
    });

    __.log("DictMapFinder.__test(): ok!");
  }

  if (DEBUG) {
    __test();
  }

  return DictMapFinder;
});
