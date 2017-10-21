(function (pkg, fac){
  pkg.MapLayerManager = fac(createjs, pkg);
})(atcapp, function(createjs, app) {

  var DEFAULT_SCALE = 10.0;
  
  function MapLayerManager() {
    this.container = new createjs.Container();
    this.container.scaleX = this.container.scaleY = DEFAULT_SCALE;
    this.container.scaleY *= app.Coord.Y_RATIO;
    
    var worldMapLayer  = new app.WorldMapLayer();

    this.container.addChild(worldMapLayer);
  }

  return MapLayerManager;
});
