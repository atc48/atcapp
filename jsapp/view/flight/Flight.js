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

    this.dataBlock.dispatcher.on("move", this._onDataBlockMove);
    this.setState("low");
    this.targetSymbol.addEventListener("click", this._onClick);
    this.targetSymbol.addEventListener("mouseover", this._onOver);
    this.targetSymbol.addEventListener("mouseout",  this._onOut);
  }

  Flight.prototype._onClick = function (e) {
    var self = e.currentTarget.parent; 
    self._isDataBlockFix = !self._isDataBlockFix;
    self._afterOutState = null;
    if (self._isDataBlockFix) {
      self.setState("normal");
    } else {
      self.setState("low");
    }
  };

  Flight.prototype._onOver = function (e) {
    var self = e.currentTarget.parent;
    self._afterOutState = self.state;
    self.setState("normal");
  };

  Flight.prototype._onOut = function (e) {
    var self = e.currentTarget.parent;
    self.setState( self._afterOutState || "low" );
  };
  
  Flight.prototype.override__hoverMsg = function (e) {
    return this.id;
  };

  Flight.prototype._onDataBlockMove = function(e) { // do not wrap by _.bind to slim memory
    var self = e.parent;
    self._updateLine();
    self._isDataBlockFix = true;
  };

  Flight.prototype.updateData = function (data) {
    __.assert(_.isObject(data));
    if (this.unixTime == data.unix_time()) {
      return;
    }
    this.unixTime = data.unix_time();
    this.x = data.x();
    this.y = data.y();
    this.targetSymbol.updateData(data);
    this.dataBlock.updateData(data);

    return this;
  };

  Flight.prototype.setState = function (state) {
    if (this.state == state) { return; }
    this.state = state;

    if (state == "low") {
      this._toggleDataBlock( false );
      return;
    }

    if (state == "normal") {
      this._toggleDataBlock( true );
      return;
    }

    __.assert(false, "invalid state=" + state);

    // ISSUE: "high" ?
  };

  Flight.prototype.getDataBlockStagePos = function () {
    var pos = this.dataBlock.getForcePos();
    var space = this._isDataBlockFix ? this : this.dataBlock; // I don't know why we should do this?
    return space.localToGlobal(pos.x, pos.y);
  };

  Flight.prototype.updateByForce = function (dataBlockStagePos) {
    if (dataBlockStagePos.hide) {
      this.setState("low");
    } else {
      var pos = this.dataBlock.globalToLocal(dataBlockStagePos.x, dataBlockStagePos.y);
      this.dataBlock.updateForcePos(pos.x, pos.y);
      this.setState("normal");
      this._updateLine();
    }
  };

  Flight.prototype.getIsDataBlockFix = function () {
    return this._isDataBlockFix;
  };

  Flight.prototype._toggleDataBlock = function (visible) {
    if (this._isDataBlockFix) { visible = true; }
    this.dataBlock.visible = visible;
    this.line.visible = visible;
    if (visible) {
      this._updateLine();
    }
  };

  Flight.prototype.updateScale = function (childScale) {
    this.scaleX = this.scaleY = childScale;    
  };

  Flight.prototype._updateLine = function () {
    this.line.update( this.dataBlock.getTransformedBounds() );
  };

  Flight.prototype.highlight = function () {
    this.targetSymbol.highlight();
  };

  return Flight;
});
