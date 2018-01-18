(function (pkg, fac) {
  pkg.FlightsApi = fac(atcapp);
})(atcapp, function (app) {

  var API_NAME = "flights";

  function FlightsApi() {
  }

  var p = FlightsApi.prototype;

  p.init = function (urlConfig) {
    __.assert(_.isObject(urlConfig));
    this.urlConfig = urlConfig;
    return this;
  };

  p.load = function (success, error) {
    __.assert(this.urlConfig, "has not init");
    __.assert(_.isFunction(success) && _.isFunction(error));

    var apiUrl = this.urlConfig.getApiUrl( API_NAME );
    
    var apiLoader = new app.JsonApiLoader();
    apiLoader.
      apiUrl( apiUrl ).
      success(success).
      error(error).
      load();

    return this;
  };

  return FlightsApi;
});
