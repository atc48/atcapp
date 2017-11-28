(function (pkg, fac) {
  pkg.InstantPanel = fac(_, createjs, pkg);
})(atcapp, function (_, createjs, app) {

  createjs.extend(InstantPanel, app.ExContainer);
  createjs.promote(InstantPanel, "super");

  var BTN_SIZE = 40;
  var WIDTH = BTN_SIZE, HEIGHT = BTN_SIZE;
  var MARGIN_X = 16, MARGIN_Y = 8;

  function InstantPanel() {
    this.super_constructor();
  }

  InstantPanel.prototype.setup = function (stageSize) {
    __.assert(stageSize);
    this.stageSize = stageSize;

    this._appendButton( this.mapDragBtn = new app.MapDragButton(BTN_SIZE) );

    stageSize.on("resize", _.bind(this._onResize, this));
  };
  
  InstantPanel.prototype.getMapDragButtonDelegate = function () {
    var self = this;
    return {
      getIsActive: function () {
	return !!( self.mapDragBtn && self.mapDragBtn.isActive );
      },
      on : function (a,b) { self.mapDragBtn.dispatcher.on(a,b); },
      off: function (a,b) { self.mapDragBtn.dispatcher.off(a,b); }
    }
  };

  InstantPanel.prototype._onResize = function () {
    this.x = this.stageSize.curWidth - WIDTH - MARGIN_X;
    this.y = this.stageSize.curHeight - HEIGHT * this.numChildren - MARGIN_Y;
  };

  InstantPanel.prototype._appendButton = function (btn) {
    btn.x = 0;
    btn.y = this.numChildren * HEIGHT;
    this.addChild(btn);
  };

  return InstantPanel;
});
