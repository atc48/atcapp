(function (pkg, fac) {
  pkg.FixMap = fac(_, __);
})(atcapp, function (_, __) {

  function FixMap() {
  }

  var p = FixMap.prototype;

  p.init = function(fixMap) {
    __.assert(_.isObject(fixMap));
    this.fixMap = fixMap;
  }

  p.getByCode = function (code) {
    if (!this.fixMap) {
      return null;
    }
    return this.fixMap[code];
  };

  return FixMap;

});
