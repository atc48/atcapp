(function (pkg, fac){
  pkg.MapLayerManager = fac(_, __, createjs, pkg);
})(atcapp, function(_, __, createjs, app) {

  var GRID_DEBUG = false;
  
  function MapLayerManager(stageSize, uiCommand, flightLayerMan, layerDragObserver) {
    var self = this;
    this.flightLayerMan = flightLayerMan;
    this.stageSize = stageSize;

    this.container = new createjs.Container();
    this.container.addChild(
      this.mapBackLayer   = new app.MapBackLayer(),
      this.coordGridLayer = new app.CoordGridLayer(),
      this.worldMapLayer  = new app.WorldMapLayer(),
      this.firLayer       = new app.FirLayer(),
      this.sectorBdyLayer = new app.SectorBdyLayer(),
      this.navaidsLayer   = new app.NavaidsLayer(),
      this.flightLayerMan.layer,
      this.mapDragLayer   = new createjs.Container(),
      null
    );

    // TODO: provide this obj for external classes.
    this.mapCoordConverter = new app.MapCoordConverter(
      _.bind(this.container.globalToLocal, this.container));

    // external object: you can get getMapStatus()
    this.mapStatus = new app.MapStatus(this.mapCoordConverter, stageSize);
    if (GRID_DEBUG) {
      this.container.addChild(
	this.gridDebugLayer = new app.GridDebugLayer()
      );
      this.gridDebugLayer.setup(this.mapStatus);
    }

    this.uiCommandHandler = new app.MapUICommandHandler(
      uiCommand, this.container, stageSize, this.mapStatus);
    this.mapStatus.on("scale", _.bind(this._onMapScaleChange, this));
    this.mapStatus.on("move",  _.bind(this._onMapMove,        this));
    
    this.container.addEventListener("mousedown", _.bind(this._onMouseDown, this));

    this.mapStatus.setup(this.mapCoordConverter, stageSize);

    this.mapDragLayer.cursor = "move";
    layerDragObserver.on("onMapDragMode",  _.bind(this._onMapDragMode,  this));
    layerDragObserver.on("offMapDragMode", _.bind(this._offMapDragMode, this));
  }

  MapLayerManager.prototype.getMapStatus = function () {
    return this.mapStatus;
  };

  MapLayerManager.prototype._onMapScaleChange = function (e) {
    var scale = e.scale;
    this.coordGridLayer.onScaleUpdated(scale);
    this.navaidsLayer.onMapScaleChange(scale);
    this.flightLayerMan.onMapScaleChange(scale);
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

  MapLayerManager.prototype.getMapDraggableLayer = function () {
    return this.container;
  }

  MapLayerManager.prototype._onMapDragMode = function () {
    var graphics = new createjs.Graphics().beginFill("#000000")
	.drawRect(0, 0, this.stageSize.curWidth, this.stageSize.curHeight);
    var shape = new createjs.Shape(graphics);
    shape.alpha = 0.01;
    this.mapDragLayer.addChild( shape );
    return this;
  };
  MapLayerManager.prototype._offMapDragMode = function () {
    this.mapDragLayer.removeAllChildren();
    return this;
  };

  return MapLayerManager;
});
