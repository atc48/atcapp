(function (pkg, fac) {
  pkg.DataBlock = fac(_, __, createjs, pkg);
})(atcapp, function (_, __, createjs, app) {

  createjs.extend(DataBlock, app.ExContainer);
  createjs.promote(DataBlock, "ExContainer");

  var FONT  = "12px " + app.COLOR.DATA_BLOCK.FONT;
  var COLOR =           app.COLOR.DATA_BLOCK.COLOR;
  var DISTANCE = 60;
  var BACK_COLOR = "#000000";
  var BACK_ALPHA = 0.2;
  var BACK_BUFF  = 2;

  var RIGID_SIZE = {
    width: 76,
    height: 40
  };
  RIGID_SIZE.heightRatio = RIGID_SIZE.height / RIGID_SIZE.width;
  
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
    this.heading = data.heading();

    var bounds = this.getBounds();
    if (bounds) {
      this.back.graphics.clear().beginFill(BACK_COLOR).drawRect(
	0, 0, bounds.width, bounds.height + BACK_BUFF
      );
    }

    this.defaultPos();
  };

  DataBlock.prototype.setCenterPos = function (x, y) {
    this.x = x - RIGID_SIZE.width / 2;
    this.y = y - RIGID_SIZE.height / 2;
  };

  DataBlock.prototype.defaultPos = function () {
    var theta = -2 * Math.PI * ((this.heading + 90) / 360);
    var x = Math.sin(theta) * DISTANCE;
    var y = Math.cos(theta) * DISTANCE;
    this.setCenterPos(x, y);
  };

  DataBlock.prototype.getForcePos = function () {
    return {
      x: this.x + RIGID_SIZE.width / 2,
      y: this.y + RIGID_SIZE.height / 2
    };
  };

  DataBlock.prototype.updateForcePos = function (cx, cy) { //center-x,y
    var distance = Math.sqrt( Math.pow(cx, 2) + Math.pow(cy, 2) );
    var ratio = DISTANCE / distance; //Math.min(DISTANCE / distance, 1);
    this.setCenterPos(cx * ratio, cy * ratio);
  };

  DataBlock.RIGID_SIZE = RIGID_SIZE;

  return DataBlock;

});
