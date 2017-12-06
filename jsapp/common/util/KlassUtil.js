(function (pkg, fac) {
  pkg.KlassUtil = fac(_, __);
})(atcapp, function (_, __) {

  function KlassUtil(){}

  KlassUtil.make_updateKeys = function (klass) {
    return updateKeys;

    function updateKeys(keys) {
      __.assert(_.isArray(keys));
      _.each(keys, __addGetter);

      function __addGetter(key, i) {
	__.assert(_.isString(key) && key.length > 0 && _.isNumber(i) && i >= 0);
	klass.prototype[key] = function () {
	  return this._raw[i];
	};
      }
    };
  };

  return KlassUtil;
});
