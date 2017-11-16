(function (pkg, fac){
  pkg.FlightLayerManager = fac(_, __, createjs, pkg);
})(atcapp, function(_, __, createjs, app) {

  var BACK_LAYER_UPDATE_INTERVAL = 10 * 1000;

  function FlightLayerManager() {
    this.layer = new app.CoordinatedLayer();
    this.layer.addChild(
      this.backLayer = new app.FlightLayer(),
      this.mainLayer = new app.FlightLayer()
    );
    this.flightsDistributor = new app.FlightsLayerDistributor(this.mainLayer, this.backLayer);
    this.mapScale = 1;
  }

  FlightLayerManager.prototype.setup = function (flightDataProvider, mapStatus, layerDragObserver, stageSize) {
    this.flightDataProvider = flightDataProvider;
    this.mapStatus = mapStatus;
    
    flightDataProvider.on(_.bind(this._distributeFlights, this));

    this.cacheControl = new app.FlightLayerCacheControl(
      this.layer, this.mainLayer, this.backLayer, this.mapStatus);

    this.viewCoordinator = new app.FlightViewCoordinator(this.mapStatus, stageSize);

    mapStatus.on("gridChanged_prolong", _.bind(this._onGridChanged, this));
    mapStatus.on("changed_prolong", _.bind(this._onMapChangedProlong, this));

    setInterval(_.bind(this._refreshBackLayerCache, this), BACK_LAYER_UPDATE_INTERVAL);

    layerDragObserver.on("start", _.bind(this._onLayerDragStart, this));
    layerDragObserver.on("end",   _.bind(this._onLayerDragEnd, this));
  };

  FlightLayerManager.prototype.onMapScaleChange = function (scale) {
    this.mainLayer.__updateChildrenReciprocalScale(scale);
    this.backLayer.__updateChildrenReciprocalScale(scale);
    this.flightScale = this.mainLayer.__childScale;
    this.mapScale = scale;
    this.cacheControl.backLayerCache().uncache();
  }

  FlightLayerManager.prototype._distributeFlights = function () {
    this.flightsDistributor.distribute(
      this.flightDataProvider.flightDataList,
      this.flightDataProvider.gridToIdsMap,
      this.mapStatus,
      this.mainLayer.__childScale
    );
    this.cacheControl.backLayerCache().uncache();
  };

  FlightLayerManager.prototype._onGridChanged = function (e) {
    this.flightsDistributor.onGridChanged(
      this.flightDataProvider.flightDataList,
      this.flightDataProvider.gridToIdsMap,
      this.mainLayer.__childScale,
      e.diff
    );
    var activeFlights = this.flightsDistributor.getActiveFlights();
    //activeFlights = activeFlights.slice(100, 102);
    this.viewCoordinator.coordinate( activeFlights );
  };

  FlightLayerManager.prototype._onMapChangedProlong = function (e) {
    var activeFlights = this.flightsDistributor.getActiveFlights();
    this.viewCoordinator.coordinate( activeFlights );
  };

  FlightLayerManager.prototype._refreshBackLayerCache = function () {
    this.cacheControl.backLayerCache().refreshCache();
  };

  FlightLayerManager.prototype._onLayerDragStart = function () {
    this.cacheControl.captureLayer();
  };

  FlightLayerManager.prototype._onLayerDragEnd   = function () {
    this.cacheControl.unlockCaptureLayer();
  };

  return FlightLayerManager;
});
