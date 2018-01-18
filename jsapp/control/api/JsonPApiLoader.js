(function (pkg, fac) {
  pkg.JsonPApiLoader = fac(atcapp);
})(atcapp, function (app) {

  /**
   * JSONP
   */

  createjs.extend(JsonPApiLoader, app.AbstractApiLoader);

  function JsonPApiLoader() {
    this.AbstractApiLoader_constructor();
  }

  /**
   * Example:
   *   var apiLoader = new app.JsonPApiLoader();
   *   apiLoader.
   *   apiUrl( this.apiUrl ).
   *   success(success).
   *   error(error).
   *   // params(params).
   *   load();
   */
  
  var p = JsonPApiLoader.prototype;

  p.load = function () {
    // TODO: implement
    __.assert("TODO: implement");
  };
  
  return createjs.promote(JsonPApiLoader, "AbstractApiLoader");

});
