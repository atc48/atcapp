(function (pkg, fac) {
  pkg.FixData = fac(_, __, pkg);
})(atcapp, function (_, __, app) {

  function FixData(raw, code) {
    this._raw = raw;
    this.code = code;
  }

  /**
    "canpos_array",
    "category_key",
    "is_compulsory",
    "pronounciation",
    "is_fir_boundary",
    "coord_exp",
    "route_codes"
   */
  FixData.updateKeys = app.KlassUtil.make_updateKeys(FixData);

  FixData.prototype.getCanpos = function () {
    if (!this.canpos) {
      var r = this.canpos_array();
      this.canpos = new app.Canpos(r[0], r[1]);
    }
    return this.canpos;
  };

  var CATEGORY_MAP = {
    1: "FIX",
    2: "VORDME",
    3: "VORTAC"
  };

  FixData.prototype.getCategory = function () {
    if (!this.category) {
      this.category = CATEGORY_MAP[ this.category_key() ];
      __.assert(_.isString(this.category), "unknown category:" +
		this.category_key() + ":" + this.code);
    }
    return this.category;
  };

  return FixData;
});
