(function (pkg, fac){
  pkg.MapLayerManager = fac(_, __, createjs, pkg);
})(atcapp, function(_, __, createjs, app) {

  
  function MapLayerManager(stageSizeMan, uiCommand) {
    this.stageSizeMan = stageSizeMan;

    var self = this;
    
    this.container = new createjs.Container();
    this.container.addChild(
      this.mapBackLayer   = new app.MapBackLayer(),
      this.coordGridLayer = new app.CoordGridLayer(),
      this.worldMapLayer  = new app.WorldMapLayer(),
      this.firLayer       = new app.FirLayer(),
      this.sectorBdyLayer = new app.SectorBdyLayer(),
      null
    );

    this.mapCoordConverter = new app.MapCoordConverter(
      _.bind(this.container.globalToLocal, this.container));
    this.sizeAdapter = new app.MapSizeAdapter(this.container, uiCommand, stageSizeMan);
    this.sizeAdapter.on("scale", _.bind(this._onMapScaleChange, this));
    this._onMapScaleChange( {scale: this.sizeAdapter.curScale} );

    this.container.addEventListener("mousedown", _.bind(this._onMouseDown, this));
  }

  MapLayerManager.prototype._onMapScaleChange = function (e) {
    var scale = e.scale;
    this.coordGridLayer.onScaleUpdated(scale);
  }

  MapLayerManager.prototype._onMouseDown = function (e) {
    var coord = this.mapCoordConverter.stageToCoord(e).round(2);
    app.StatusBar.getInstance().setMsg(
      coord.toExp({r:2})
    );
  };

  return MapLayerManager;
});
