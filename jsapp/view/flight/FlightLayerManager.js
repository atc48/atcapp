(function (pkg, fac){
  pkg.FlightLayerManager = fac(_, __, createjs, pkg);
})(atcapp, function(_, __, createjs, app) {

  function FlightLayerManager(flightDataProvider) {
    this.layer = new app.CoordinatedLayer();
    this.layer.addChild(
      this.backLayer = new app.FlightLayer(),
      this.mainLayer = new app.FlightLayer()
    );
    flightDataProvider.on(_.bind(this._onFlightData, this));
  }

  FlightLayerManager.prototype._onFlightData = function (data) {
    var layer = this.mainLayer;
    var childScale = this.flightScale;
    layer.removeAllChildren();
    _.each(data.flights, function (flightData) {
      if (flightData.ground_flag()) { return; }
      var flight = new app.Flight().updateData(flightData);
      flight.scaleX = flight.scaleY = childScale;
      layer.addChild( flight );
    });
  };
  
  FlightLayerManager.prototype.onMapScaleChange = function (scale) {
    this.mainLayer.__updateChildrenReciprocalScale(scale);
    this.backLayer.__updateChildrenReciprocalScale(scale);
    this.flightScale = this.mainLayer.__childScale;
  }

  return FlightLayerManager;
});
