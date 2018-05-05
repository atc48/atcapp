(function (pkg, fac) {
  pkg.UrlConfig = fac(_, __);
})(atcapp, function (_, __) {

  var PRODUCTION_HOST = "atc48.com";

  function UrlConfig(appOpt) {
    __.assert(_.isObject(appOpt));
    this._initHost( appOpt.host().getOr( location.href.split('/')[2] ));
    this._apiUrlHref = this._href + "/api";
    this._assetsDirPath = appOpt.assetsDirPath().getOr("/atcapp/img/");
    this.appOpt = appOpt;
  };

  var p = UrlConfig.prototype;

  p._initHost = function (host) {
    __.assert(_.isString(host));
    if (host == "") {
      host = PRODUCTION_HOST; // when local boot
    }
    this._host = host;
    this._href = "http://" + host

    return this;
  }

  p.getAssetsDirPath = function () {
    return this._assetsDirPath;
  };

  p.getApiUrl = function (apiName) {
    __.assert(_.isString(apiName) && apiName.indexOf("/") !== 0);

    if (apiName == "flights" && this.appOpt.flightsApiPath().getOrNull()) {
      return this.appOpt.flightsApiPath().get();
    }

    return this._apiUrlHref + "/" + apiName;
  };

  return UrlConfig;
});
