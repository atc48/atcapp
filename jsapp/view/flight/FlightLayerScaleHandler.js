(function (pkg, fac) {
  pkg.FlightLayerScaleHandler = fac();
})(atcapp, function () {

  function FlightLayerScaleHandler(mainLayer, backLayer) {
    this.mainLayer = mainLayer;
    this.backLayer = backLayer;
  }

  FlightLayerScaleHandler.prototype.update = function (scale) {
    var childScale = 1.0 / scale;
    _updateFlightsScale(this.mainLayer, childScale);
    _updateFlightsScale(this.backLayer, childScale);
    this.childScale = childScale;
  };

  return FlightLayerScaleHandler;
});
