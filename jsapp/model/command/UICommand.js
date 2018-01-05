(function (pkg, fac) {
  pkg.UICommand = fac($, atcapp);
})(atcapp, function ($, app) {

  createjs.extend(UICommand, app.Dispatcher);

  var TYPES = ["mapMove", "zoom", "mapFix"];
  
  function UICommand() {
    this.Dispatcher_constructor({types: TYPES});
    // TODO: aspect something.
  }

  /**
   * Example: 
   *     uiCommand.on("mapZoom", function (delta) {});
   *     uiCommand.fore("mapZoom", 100);
   */
  
  return createjs.promote(UICommand, "Dispatcher");
});
