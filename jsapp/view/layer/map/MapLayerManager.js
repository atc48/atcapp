(function (pkg, fac){
  pkg.MapLayerManager = fac(_, createjs, pkg);
})(atcapp, function(_, createjs, app) {

  var DEFAULT_SCALE = 10.0;
  
  function MapLayerManager(stageSizeMan, uiCommand) {
    this.stageSizeMan = stageSizeMan;
    this.uiCommand = uiCommand.on("zoom", _.bind(this.onZoomInput, this));
    
    this.container = new createjs.Container();
    this.worldMapLayer  = new app.WorldMapLayer();
    this.container.addChild(this.worldMapLayer);

    this.curScale = DEFAULT_SCALE;
    this.container.scaleX = this.container.scaleY = this.curScale;
    this.container.scaleY *= app.Coord.Y_RATIO;
  }

  MapLayerManager.prototype.onZoomInput = function(e) {
    var nextScale = this.curScale * (1.0 + 0.1 * (e.delta > 0 ? 1 : -1))
    this.updateScale(nextScale);
  };

  MapLayerManager.prototype.updateScale = function (scale) {
    var oldScale = this.curScale;
    if (scale == oldScale) { return; }
    
    this.curScale = scale;
    this.container.scaleX = this.container.scaleY = scale;
    this.container.scaleY *= app.Coord.Y_RATIO;
    this.container.x -= newPosDiff(this.stageSizeMan.curWidth);
    this.container.y -= newPosDiff(this.stageSizeMan.curHeight);

    function newPosDiff(curStageSize) {
      return curStageSize * (scale - oldScale) / 2;
    }

    __.log(this.worldMapLeyr.getBounds());

  };

  return MapLayerManager;
});
