(function (pkg, fac) {
  pkg.AppOption = fac(_, __, createjs, atcapp);
})(atcapp, function (_, __, createjs, app) {

  function AppOption(opt_raw) {
    this.opt = opt_raw || {};
  }

  var p = AppOption.prototype;

  // Usage: appOpt.host().getOr("example.com")
  p.host = function () {
    return __orWrap(this.opt.host);
  };

  p.assetsDirPath = function () {
    return __orWrap( __path( this.opt.assets_dir) );
  };

  p.assetsPathToBase64Map = function () {
    return __orWrap( this.opt.assets_base64_map );
  };

  // Usage: if:   appOpt.flightsApiPath().getOrNull()
  //        then: appOpt.flightsApiPath().get()
  p.flightsApiPath = function () {
    return __orWrap( this.opt.flights_api_path );
  }

  function __path(path) {
    if (_.isString(path)) {
      if (path.length > 0 && path[path.length-1] != "/") {
	path += "/";
      }
    }
    return path;
  }


  /**
   * Usage:
   *   var valObj = __orWrap(val);
   *   valObj.getOr(2) // => val if val
   *   valObj.getOr(2) // => 2 unless val   
   */
  function __orWrap(val) {
    return {
      getOr: function (orVal) {
	if (_.isNull(val) || _.isUndefined(val)) {
	  return orVal;	  
	}
	return val;
      },
      getOrNull: function () {
	return this.getOr(null);
      },
      get: function () { // throws error if the value is blank
	__.assert(!_.isNull(this.getOr(null)));
	return this.getOr(null);
      }
    };
  };

  return AppOption;
});
