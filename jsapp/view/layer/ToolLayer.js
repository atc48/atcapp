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

    this.instantPanel = new atcapp.InstantPanel();

    this.addChild( this.statusBarView );
    this.addChild( this.instantPanel );
  }

  ToolLayer.prototype.setup = function (stageSize) {
    this.stageSize = stageSize;

    this.instantPanel.setup( stageSize );

    stageSize.on("resize", _.bind(this.onStageResize, this));
  };

  ToolLayer.prototype.onStageResize = function (e) {
    this.statusBarView.x = STATUS_BAR.MARGIN;
    this.statusBarView.y = this.stageSize.curHeight - STATUS_BAR.FONT_SIZE;
  };

  return ToolLayer;
});
