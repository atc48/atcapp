(function (pkg, fac) {
  pkg.DataBlock = fac(_, __, createjs, pkg);
})(atcapp, function (_, __, createjs, app) {

  createjs.extend(DataBlock, app.ExContainer);
  createjs.promote(DataBlock, "ExContainer");

  var FONT  = "12px " + app.COLOR.DATA_BLOCK.FONT;
  var COLOR =           app.COLOR.DATA_BLOCK.COLOR;
  var DISTANCE = 10;
  var BACK_COLOR = "#000000";
  var BACK_ALPHA = 0.1;
  var BACK_BUFF  = 2;
  
  function DataBlock(parent) {
    this.ExContainer_constructor({hover: true, drag: 1});
    this.callsign = new createjs.Text("", FONT, COLOR);
    this.back     = new createjs.Shape();
    this.dispatcher = new app.Dispatcher();
    this.__parent = parent;

    this.back.alpha = BACK_ALPHA;
    this.addChild( this.back );
    this.addChild( this.callsign );
  }

  DataBlock.prototype.delegate_onDragStart = function () {
    this.isPosFix = true;
  };

  DataBlock.prototype.delegate_onDrag = function () {
    this.dispatcher.fire("move", {parent: this.__parent});
  };

  DataBlock.prototype.updateData = function (data) {
    this.callsign.text = [
      data.callsign() + "  " + (data.actype() || ""),
      data.altExp() + "  " + data.speedExp(),
      data.dest_code() + "." + data.dep_code()
    ].join("\n")


    var bounds = this.getBounds();
    if (bounds) {
      if (!this.isPosFix) {
	this.x = - bounds.width - DISTANCE;
	this.y = - bounds.height - DISTANCE;
      }
      this.back.graphics.clear().beginFill(BACK_COLOR).drawRect(
	0, 0, bounds.width, bounds.height + BACK_BUFF
      );
    }
  };

  return DataBlock;

});
