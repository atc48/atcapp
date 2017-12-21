(function (pkg, factory) {
  pkg.ExternalInitializer = factory(createjs, pkg);
})(atcapp, function(createjs, app) {

  function ExternalInitializer($fixSearch) {
    this.fixSearchBox = new app.CodeSearchBox( $fixSearch );
  }

  ExternalInitializer.prototype.init = function (codeFinder) {
    this.fixSearchBox.init( new _SearchDelegate(codeFinder) );
  };

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

  return ExternalInitializer;

});
