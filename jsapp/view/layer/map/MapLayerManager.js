(function (pkg, fac){
  pkg.MapLayerManager = fac(_, __, createjs, pkg);
})(atcapp, function(_, __, createjs, app) {
  
  function MapLayerManager(stageSize, uiCommand, flightLayerMan) {
    var self = this;
    this.flightLayerMan = flightLayerMan;
    
    this.container = new createjs.Container();
    this.container.addChild(
      this.mapBackLayer   = new app.MapBackLayer(),
      this.coordGridLayer = new app.CoordGridLayer(),
      this.worldMapLayer  = new app.WorldMapLayer(),
      this.firLayer       = new app.FirLayer(),
      this.sectorBdyLayer = new app.SectorBdyLayer(),
      this.flightLayerMan.layer,
      null
    );

    // TODO: provide this obj for external classes.
    this.mapCoordConverter = new app.MapCoordConverter(
      _.bind(this.container.globalToLocal, this.container));

    // external object: you can get getMapStatus()
    this.mapStatus = new app.MapStatus(this.mapCoordConverter);

    this.uiCommandHandler = new app.MapUICommandHandler(
      uiCommand, this.container, stageSize, this.mapStatus);
    this.mapStatus.on("scale", _.bind(this._onMapScaleChange, this));
    this.mapStatus.on("move",  _.bind(this._onMapMove,        this));
    
    this.container.addEventListener("mousedown", _.bind(this._onMouseDown, this));

    this.mapStatus.setup();
  }

  MapLayerManager.prototype._onMapScaleChange = function (e) {
    var scale = e.scale;
    this.coordGridLayer.onScaleUpdated(scale);
    this.flightLayerMan.onMapScaleChange(scale);
    /*
    if (!this.timer) {
      var self = this;
      this.timer = setTimeout(function () {
	self.flightLayerMan.layer.cache(0, 0, app.Canpos.bounds.width, app.Canpos.bounds.height, Math.min(20, self.container.scaleX));
	self.timer = null;
      }, 200);
    }*/
  }

  MapLayerManager.prototype._onMapMove = function (e) {
    // do something if needed
  }

  MapLayerManager.prototype._onMouseDown = function (e) {
    var coord = this.mapCoordConverter.stageToCoord(e).round(2);
    app.StatusBar.getInstance().setMsg(
      coord.toExp({r:2})
    );
  };

  MapLayerManager.prototype.getMapStatus = function () {
    return this.mapStatus;
  };

  return MapLayerManager;
});
