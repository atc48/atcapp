(function (pkg, fac) {
  pkg.NavaidsInitializer = fac(_, __, createjs, pkg);
})(atcapp, function(_, __, createjs, app) {

  function NavaidsInitializer(){
  }

  var DATA;

  NavaidsInitializer.prototype.init = function (fixLayer, routeLayer) {
    DATA = app.DATA_FIXES_AND_ROUTES;
    this._initFixes(fixLayer);
  };

  NavaidsInitializer.prototype._initFixes = function (layer) {
    app.FixData.updateKeys( DATA["fixes_keys"] );
    var fixMap = {};
    _.each(DATA[ "fixes" ], function (obj, code) {
      var fix = new app.Fix( new app.FixData(obj, code) );
      fixMap[code] = fix;
      layer.addChild( fix );
    });
    this.fixMap = fixMap;
  };

  return NavaidsInitializer;
});
