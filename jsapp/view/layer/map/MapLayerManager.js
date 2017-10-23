(function (pkg, fac){
  pkg.MapLayerManager = fac(_, __, createjs, pkg);
})(atcapp, function(_, __, createjs, app) {

  
  function MapLayerManager(stageSizeMan, uiCommand) {
    this.stageSizeMan = stageSizeMan;
    
    this.container = new createjs.Container();
    this.coordGridLayer = new app.CoordGridLayer();
    this.worldMapLayer  = new app.WorldMapLayer();
    this.container.addChild(this.coordGridLayer);
    this.container.addChild(this.worldMapLayer);

    this.sizeAdapter = new app.MapSizeAdapter(this.container, uiCommand, stageSizeMan);
    uiCommand.addEventListener("mapMove", _.bind(this.onMapMove, this));
  }

  MapLayerManager.prototype.onMapMove = function(e) {
    this.container.x += e.moveX;
    this.container.y += e.moveY;
  };

  return MapLayerManager;
});
