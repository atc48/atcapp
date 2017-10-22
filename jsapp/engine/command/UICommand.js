(function (pkg, fac) {
  pkg.UICommand = fac($, atcapp);
})(atcapp, function ($, app) {

  createjs.extend(UICommand, app.Dispatcher);
  createjs.promote(UICommand, "Dispatcher");
  
  function UICommand() {
    this.Dispatcher_constructor();
    // TODO: aspect something.
  }

  /**
   * Example: 
   *     uiCommand.on("mapZoom", function (delta) {});
   *     uiCommand.fore("mapZoom", 100);
   */
  
  return UICommand;
});
