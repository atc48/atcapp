(function (pkg, fac) {
  pkg.UrlConfig = fac(_, __);
})(atcapp, function (_, __) {

  var PRODUCTION_HOST = "atc48.com";

  function UrlConfig() {}

  var p = UrlConfig.prototype;

  p.init = function (opt_host) {
    var host = opt_host || location.href.split('/')[2];
    if (host == "") {
      host = PRODUCTION_HOST; // when local boot
    }
    var href = "http://" + host;

    this._apiUrlHref = href + "/api";

    return this;
  }

  p.getApiUrl = function (apiName) {
    __.assert(_.isString(apiName) && apiName.indexOf("/") !== 0);

    return this._apiUrlHref + "/" + apiName;
  };

  return UrlConfig;
});
