(function (pkg, fac){
  pkg.MapLayerManager = fac(_, __, createjs, pkg);
})(atcapp, function(_, __, createjs, app) {

  
  function MapLayerManager(stageSizeMan, uiCommand) {
    this.stageSizeMan = stageSizeMan;
    
    this.container = new createjs.Container();
    this.container.addChild(
      this.coordGridLayer = new app.CoordGridLayer(),
      this.worldMapLayer  = new app.WorldMapLayer(),
      this.firLayer       = new app.FirLayer(),
      null
    );

    this.sizeAdapter = new app.MapSizeAdapter(this.container, uiCommand, stageSizeMan);
    uiCommand.addEventListener("mapMove", _.bind(this.onMapMove, this));

    this.sizeAdapter.on(_.bind(this._onMapScaleChange, this));
    this._onMapScaleChange( {scale: this.sizeAdapter.curScale} );
  }

  MapLayerManager.prototype.onMapMove = function(e) {
    this.container.x += e.moveX;
    this.container.y += e.moveY;
  };

  MapLayerManager.prototype._onMapScaleChange = function (e) {
    var scale = e.scale;
    this.coordGridLayer.onScaleUpdated(scale);
  }

  return MapLayerManager;
});
