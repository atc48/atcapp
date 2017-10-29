(function (pkg, fac) {
  pkg.SectorBdyLayer = fac(_, __, createjs, pkg);
})(atcapp, function(_, __, createjs, app) {

  createjs.extend(SectorBdyLayer, app.CoordinatedLayer);
  createjs.promote(SectorBdyLayer, "CoordinatedLayer");

  var LINE = app.COLOR.SECTOR;
  
  function SectorBdyLayer() {
    this.CoordinatedLayer_constructor();

    this.alpha = LINE['alpha']
    this.setupLayers();
  }

  SectorBdyLayer.prototype.setupLayers = function (){
    var self = this;
    var DATA = app.DATA_SECTORS;
    /* {
         "polygons": [
	   {
             "canpos_list": [ [140.53333333, 62.20540293], ... ],
	     "pol_id": 0,
	     "sec_ids": []
	   }, ...
	 }...
      } */
    var polDatas = DATA['polygons'].slice(1);
    self.noDupDrawer = new app.NoDupLinePolygonDrawer();
    self.shapes = _.map(polDatas, function (polData) {
      var shape = self._createSectorShape(polData)
      self.addChild( shape );
      return shape;
    });
  }

  SectorBdyLayer.prototype._createSectorShape = function (polData) {
    var shape = new createjs.Shape();
    var g = shape.graphics;
    var drawer = this.noDupDrawer.getDrawWrapperFor(g);
    
    g.beginStroke( LINE['color'] );
    g.setStrokeStyle( 1, "butt", "miter", 10, true );
    
    var cList = polData["canpos_list"];
    var origin = cList[0];

    drawer.moveTo(origin);
    _.each(cList.slice(1), function (c) {
      drawer.lineToIfEnable(c);
    });
    drawer.lineToIfEnable(origin);
    
    g.endStroke();

    return shape;
  };

  return SectorBdyLayer;
});
