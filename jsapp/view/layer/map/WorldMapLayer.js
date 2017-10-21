(function (pkg, fac) {
  pkg.WorldMapLayer = fac(_, createjs, pkg);
})(atcapp, function(_, createjs, app) {

  createjs.extend(WorldMapLayer, app.CoordinatedLayer);
  createjs.promote(WorldMapLayer, "CoordinatedLayer");

  var COLOR = app.COLOR.WORLDMAP;;
  
  function WorldMapLayer() {
    this.CoordinatedLayer_constructor();
    var MAP_DATA = atcapp.DATA_WORLDMAP;
    var shape = new createjs.Shape();
    var g = shape.graphics;

    _.each(MAP_DATA, function (pols) {
      _.each(pols, function (pol) {
	g.beginFill(COLOR);
	_drawPolygon(g, pol['p']);
	if(pol['s']) {
	  g.beginFill(COLOR);
	  _drawPolygon(g, pol['s']);
	}
      });
    });
    
    this.addChild(shape);
    
    function _drawPolygon(g, points) {
      g.moveTo(points[0][0], points[0][1]);
      _.each(points.slice(1), function (p) {
	g.lineTo(p[0], p[1]);
      });
    }
  }

  return WorldMapLayer;
});
