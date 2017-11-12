(function (pkg, fac) {
  pkg.Flight = fac(_, __, createjs, pkg);
})(atcapp, function (_, __, createjs, app) {

  createjs.extend(Flight, app.ExContainer);
  createjs.promote(Flight, "ExContainer");

  function Flight() {
    this.ExContainer_constructor({hover: true});
    this.addChild( this.line         = new app.BoundsLine() );
    this.addChild( this.targetSymbol = new app.TargetSymbol() );
    this.addChild( this.dataBlock    = new app.DataBlock(this) );
    //this.addChild( new app.Circle() );

    this.dataBlock.dispatcher.on("move", this._onDataBlockMove);
  }

  Flight.prototype.override__hoverMsg = function (e) {
    return this.id;
  };

  Flight.prototype._onDataBlockMove = function (e) {
    var self = e.parent;
    self._updateLine();
  };

  Flight.prototype.updateData = function (data) {
    __.assert(_.isObject(data));
    this.x = data.x();
    this.y = data.y();
    this.targetSymbol.updateData(data);
    this.dataBlock.updateData(data);
    this._updateLine();

    return this;
  };

  Flight.prototype._updateLine = function () {
    if (this._isDataBlockFix) { return; }
    this.line.update( this.dataBlock.getTransformedBounds() );
  };

  Flight.prototype.highlight = function () {
    this.targetSymbol.highlight();
  };

  return Flight;
});
