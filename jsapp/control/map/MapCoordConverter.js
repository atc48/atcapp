(function (pkg, fac) {
  pkg.MapCoordConverter = fac(_, __, pkg);
})(atcapp, function (_, __, app) {

  function MapCoordConverter(globalToLocal) {
    this.globalToLocal = globalToLocal;
  }

  MapCoordConverter.prototype.stageToCoord = function (e, opt) {
    var canpos = this.stageToCanpos(e, opt);
    var coord  = canpos.toCoord();
    return coord;
  }
  
  MapCoordConverter.prototype.stageToCanpos = function (e, opt) {
    var stageX = e, stageY = opt;
    if (_.isObject(e)) {
      stageX = e.stageX;
      stageY = e.stageY;
    }
    __.assert(_.isNumber(stageX) && _.isNumber(stageY));

    var localP = this.globalToLocal(stageX, stageY);
    var canpos = new app.Canpos(localP.x, localP.y);
    return canpos;
  };

  return MapCoordConverter;
});
