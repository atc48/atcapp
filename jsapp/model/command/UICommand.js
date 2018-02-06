(function (pkg, fac) {
  pkg.UICommand = fac($, atcapp);
})(atcapp, function ($, app) {

  createjs.extend(UICommand, app.Dispatcher);

  var TYPES = ["mapMove", "zoom", "mapFix"];
  // "mapMove", "zoom" by User Input
  // "mapFix" by Program Order
  
  function UICommand() {
    this.Dispatcher_constructor({types: TYPES});
    // TODO: aspect something.
  }

  var p = UICommand.prototype;

  p.fire = function (type, e) {
    if (type == "zoom") {
      __.assert(_.isNumber(e.delta) || _.isNumber(e.scale) || _.isNumber(e.scaleMult));
    }
    if (type == "mapFix") {
      __.assert(e.scale || e.scaleMinBounds || e.scaleMaxBounds || e.canpos);
    }
    this.Dispatcher_fire(type, e);
  };

  /**
   * Example: 
   *     uiCommand.on("mapZoom", function (delta) {});
   *     uiCommand.fore("mapZoom", 100);
   */
  
  return createjs.promote(UICommand, "Dispatcher");
});
