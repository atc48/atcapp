(function (pkg, fac) {
  pkg.ToolLayer = fac(_, createjs, pkg);
})(atcapp, function(_, createjs, app) {

  createjs.extend(ToolLayer, app.CoordinatedLayer);
  createjs.promote(ToolLayer, "CoordinatedLayer");

  var STATUS_BAR = {
    FONT_SIZE: 14,
    COLOR    : "#aaaaaa",
    MARGIN   : 2
  }

  function ToolLayer() {
    this.CoordinatedLayer_constructor();
    var self = this;

    this.statusBarView = new createjs.Text(
      "", STATUS_BAR.FONT_SIZE + "px serif", STATUS_BAR.COLOR);
    app.StatusBar.getInstance().on(function (e) {
      self.statusBarView.text = e.msg;
    });

    this.addChild( this.statusBarView );
  }

  ToolLayer.prototype.onStageResize = function (stageWidth, stageHeight) {
    this.statusBarView.x = STATUS_BAR.MARGIN;
    this.statusBarView.y = stageHeight - STATUS_BAR.FONT_SIZE;
  };

  return ToolLayer;
});
