(function (pkg, fac) {
  pkg.MapFixCommandSender = fac(_, __, pkg);
})(atcapp, function (_, __, app) {

  /**
   * Usage:
   *   mapFixCommandSender
   *     .centerCoordination(150.0, 40) // or .centerCanpos(c)
   *     .scaleForMinBounds(40, 40)     // or .scale(s)
   *     .fix(); // => will send "mapFix" to UICommand.
   */
  function MapFixCommandSender(uiCommand) {
    this.uiCommand = uiCommand;
  }

  MapFixCommandSender.prototype.centerCanpos = function (canpos) {
    __.assert(_.isObject(canpos));
    this.canpos = canpos;
    return this;
  };

  MapFixCommandSender.prototype.centerCoordination = function (east, north) {
    __.assert(_.isNumber(north) && _.isNumber(east));
    var canpos = app.Canpos.canposByCoord(east, north);
    return this.centerCanpos( canpos );
  };
  
  
  MapFixCommandSender.prototype.scale = function (scale) {
    this.scale = scale;
    return this;
  };

  MapFixCommandSender.prototype.scaleMinBounds = function (coordWidth, coordHeight) {
    this.scaleMinBounds = app.Canpos.boundsByCoord(coordWidth, coordHeight);
    return this;
  };

  MapFixCommandSender.prototype.scaleMaxBounds = function (coordWidth, coordHeight) {
    this.scaleMaxBounds = app.Canpos.boundsByCoord(coordWidth, coordHeight);
    return this;
  };

  
  MapFixCommandSender.prototype.fix = function () {
    __.assert(_.isObject(this.canpos) || _.isNumber(this.scale) ||
	      _.isObject(this.scaleMinBounds) || _.isObject(this.scaleMaxBounds));
    
    this.uiCommand.fire("mapFix", {
      canpos: this.canpos || null, // will be the center of the stage
      scale : this.scale  || null,
      scaleMinBounds: this.scaleMinBounds || null,
      scaleMaxBounds: this.scaleMaxBounds || null
    });
    this.clear();
    return this;
  };

  MapFixCommandSender.prototype.clear = function () {
    this.canpos = this.scale = this.scaleMaxBounds = this.scaleMinBounds = null;
  }

  return MapFixCommandSender;
});
