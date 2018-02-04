(function (pkg, fac) {
  pkg.StatusBarView = fac(_, createjs, pkg);
})(atcapp, function(_, createjs, app) {

  createjs.extend(StatusBarView, app.ExContainer);

  var CONF = {
    FONT_SIZE: 16,
    COLOR    : "#aaaaaa",
    MARGIN   : 4,
    BG: "#333",
    ALPHA: 0.8
  }

  function StatusBarView() {
    this.ExContainer_constructor();

    this.text = new createjs.Text(
      "", CONF.FONT_SIZE + "px serif", CONF.COLOR);
    this.bg = new createjs.Shape();
    this.bg.alpha = CONF.ALPHA;
    
    this.addChild( this.bg );
    this.addChild( this.text );
  }

  var p = StatusBarView.prototype;

  p.update = function (msg) {
    this.text.text = msg;
    var bounds = this.text.getBounds();
    this.bg.graphics.clear();    
    if (bounds) {
      this.bg.graphics
	.beginFill(CONF.BG)
	.drawRect(-CONF.MARGIN, 0, bounds.width + CONF.MARGIN * 2, bounds.height);
    }
  };

  p.getMargin = function () {
    return CONF.MARGIN;
  };

  p.getHeight = function () {
    return CONF.MARGIN + CONF.FONT_SIZE;
  };

  
  return createjs.promote(StatusBarView, "ExContainer");
});
