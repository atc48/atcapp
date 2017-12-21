(function (pkg, factory) {
  pkg.SearchBoxManager = factory(createjs, pkg);
})(atcapp, function(createjs, app) {

  function SearchBoxManager(fixSearchBox, codeFinder) {
    this.fixSearchBox = fixSearchBox;
    this.fixSearchBox.init( new _SearchDelegate(codeFinder) );    
  }

  function _SearchDelegate(codeFinder) {
    this.findCompletionCodes = function (lastWord, wordsFinished) {
      var codes = codeFinder.findFixCodes( lastWord );
      return codes;
    };
    this.onWordsUpdated = function ( words ) {
      __.log( words );
      // TODO: something
    };
  }

  return SearchBoxManager;

});
