(function (pkg, factory) {
  pkg.ExternalInitializer = factory(createjs, pkg);
})(atcapp, function(createjs, app) {

  function ExternalInitializer($fixSearch) {
    this.fixSearchBox = new app.CodeSearchBox( $fixSearch );
  }

  ExternalInitializer.prototype.init = function (codeFinder) {
    this.searchBoxMan = new app.SearchBoxManager(this.fixSearchBox, codeFinder);
  };

  return ExternalInitializer;

});
