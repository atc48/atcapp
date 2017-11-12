(function (pkg, fac) {
  pkg.FlightLayerCacheControl = fac(__, pkg);
})(atcapp, function (__, app) {

  var CACHE_SCALE_MULT = 1.0;
  var CACHE_SCALE_MAX  = 200;

  function FlightLayerCacheControl(layer, mainLayer, backLayer, mapStatus) {
    __.assert(layer.children.indexOf(mainLayer) >= 0 &&
	      layer.children.indexOf(backLayer) >= 0);
    this.layer     = layer; // layer has mainLayer and BackLayer
    this.mainLayer = mainLayer;
    this.backLayer = backLayer;
    this.mapStatus = mapStatus;
    this._hasLayerCaptured = false;

    this._backLayerCache = new _BackLayerCache(backLayer, mapStatus);
  }

  FlightLayerCacheControl.prototype.captureLayer = function () {
    if (this._hasLayerCaptured) { return; }
    this._hasLayerCaptured = true;

    var rect = this.mapStatus.getGridMap().getDoubleUnitSizeGridMap().getCanposBounds();

    var cacheScale = this.mapStatus.getScale() * CACHE_SCALE_MULT;
    cacheScale = Math.min(cacheScale, CACHE_SCALE_MAX);

    this.layer.cache(rect.x, rect.y, rect.width, rect.height, cacheScale);
    this.mainLayer.visible =
      this.backLayer.visible = false;
  };
  
  FlightLayerCacheControl.prototype.unlockCaptureLayer = function () {
    if (!this._hasLayerCaptured) { return; }
    this._hasLayerCaptured = false;

    this.layer.uncache();
    this.mainLayer.visible =
      this.backLayer.visible = true;    
  };

  FlightLayerCacheControl.prototype.backLayerCache = function () {
    return this._backLayerCache;
  };

  
  function _BackLayerCache(backLayer, mapStatus) {
    this.backLayer = backLayer;
    this.mapStatus = mapStatus;
  }
  
  _BackLayerCache.prototype.uncache = function () {
    this.backLayer.uncache();
  };

  _BackLayerCache.prototype.refreshCache = function () {
    var mapScale = this.mapStatus.getScale();
    var canposMax = app.Canpos.bounds;
    var cacheScale = Math.min(20, Math.round(mapScale)) * CACHE_SCALE_MULT;
    this.backLayer.cache(0, 0, canposMax.width, canposMax.height, cacheScale);
  };

  return FlightLayerCacheControl;
});
