(function (pkg, fac) {
  pkg.GridDebugLayer = fac(_, createjs, pkg);
})(atcapp, function(_, createjs, app) {

  createjs.extend(GridDebugLayer, app.CoordinatedLayer);
  createjs.promote(GridDebugLayer, "CoordinatedLayer");

  function GridDebugLayer() {
    this.CoordinatedLayer_constructor();
    this.alpha = 0.5;
    var shape = new createjs.Shape();
    this.addChild(shape);
    this.setup = function (mapStatus) {
      mapStatus.on("gridChanged", function (e) {
	shape.graphics.clear();
	_.each(e.gridMap.getGrids(), function (grid) {
	  var gridZero = app.GridMap.gridToCanpos(grid);
	  shape.graphics.beginFill("red").
	    drawRect(gridZero.x, gridZero.y, 9.9, 9.9);
	});
      });
    };
  }

  return GridDebugLayer;

});
    
