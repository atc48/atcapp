(function (pkg, factory) {
  pkg.SearchBoxManager = factory(createjs, pkg);
})(atcapp, function(createjs, app) {

  function SearchBoxManager(fixSearchBox, codeFinder, mapItemCommand) {
    this.mapItemCommand = mapItemCommand;
    this.fixSearchBox = fixSearchBox.init(
      new _SearchDelegate(codeFinder, mapItemCommand)
    );
  }

  function _SearchDelegate(codeFinder, mapItemCommand) {
    this.findCompletionCodes = function (lastWord, wordsFinished) {
      var codes = codeFinder.findFixCodes( lastWord );
      return codes;
    };
    this.onWordsUpdated = function ( codes ) {
      mapItemCommand.fire("activate", codes);
    };
    this.filterWords = function ( codes ) {
      return app.MapItemCommand.filterCodes(codes);
    }
  }

  return SearchBoxManager;

});
