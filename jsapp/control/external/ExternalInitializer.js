(function (pkg, factory) {
  pkg.ExternalInitializer = factory(createjs, pkg);
})(atcapp, function(createjs, app) {

  function ExternalInitializer($stage, $fixSearch) {
    this.fixSearchBox = new app.CodeSearchBox( $fixSearch );

    // disable focusing input field after stage click
    var $focusingTarget = null;
    $fixSearch.find('input').
      focusin( function () { $focusingTarget = $(this); }).
      focusout(function () { $focusingTarget = null;    });
    $stage.click(function () {
      if (!$focusingTarget) { return; }
      $focusingTarget.blur(); // focus out;
    });
  }

  var p = ExternalInitializer.prototype;

  p.init = function (codeFinder, mapItemCommand) {
    this.searchBoxMan = new app.SearchBoxManager(
      this.fixSearchBox, codeFinder, mapItemCommand);
  };

  return ExternalInitializer;

});
