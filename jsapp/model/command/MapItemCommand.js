(function (pkg, fac) {
  pkg.MapItemCommand = fac(_, __, atcapp);
})(atcapp, function (_, __, app) {

  createjs.extend(MapItemCommand, app.Dispatcher);

  var TYPES = ["activate"];
  var WORD_REMOVE_REG = /[^A-Za-z0-9].*/;
  
  function MapItemCommand() {
    this.Dispatcher_constructor({types: TYPES});

    this._lastActivatedCodes = []
  }

  MapItemCommand.prototype.fire = function (type, obj, opt) {
    __.assert(_.contains(TYPES, type));
    opt = opt || {};

    if (type == "activate") {
      obj = this._prepareFireActivate(obj, opt);
      if (_.isNull(obj)) { return; }
    }
            
    this.Dispatcher_fire(type, obj);
  };

  MapItemCommand.prototype._prepareFireActivate = function (codes, opt) {
    __.assert(_.isArray(codes) && _.isObject(opt));

    codes = __filterCodes(codes, {NO_DCT: 1});

    if (_.isEqual(this._lastActivatedCodes, codes) && !opt.forceUpdate) {
      return null;
    }
    this._lastActivatedCodes = codes;

    return codes;
  };

  function __filterCodes(codes, opt) {
    opt = opt || {};

    codes = _.map(codes, function (w) {
      return w.replace(WORD_REMOVE_REG, "").toUpperCase(); });
    codes = _.compact(codes);
    if (opt["NO_DCT"]) {
      codes = _.reject(codes, function (c) { return c == "DCT"; });
    }
    
    return codes;
  }

  MapItemCommand.filterCodes = __filterCodes;

  /**
   * Example: 
   *     mapItemCommand.on("activate", function (codes) {});
   *     mapItemCommand.fire("activate", ["ADNAP", "ADGOR"]);
   */

  return createjs.promote(MapItemCommand, "Dispatcher");
});
