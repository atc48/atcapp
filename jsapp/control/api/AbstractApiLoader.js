(function (pkg, fac) {
  pkg.AbstractApiLoader = fac(_, __);
})(atcapp, function (_, __) {

  function AbstractApiLoader() {
  }

  var p = AbstractApiLoader.prototype;

  p.load = function () {
    __.assert(false, "AbstractApiLoader: has not implemented.");
  };

  p.apiUrl = function (apiUrl) {
    __.assert(_.isString(apiUrl));
    this.__apiUrl = apiUrl;
    return this;
  }

  p.params = function (params) {
    __.assert(_.isObject(params));
    this.__params; // optional
    return this;
  };

  p.success = function (fn) {
    __.assert(_.isFunction(fn));
    this.__onSuccess = fn;
    return this;
  };

  p.error = function (fn) {
    __.assert(_.isFunction(fn));
    this.__onError = fn;
    return this;
  };

  return AbstractApiLoader;

});
