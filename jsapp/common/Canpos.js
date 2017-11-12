(function (pkg, fac){
  pkg.Canpos = fac(__, createjs);
})(atcapp, function (__, createjs) {

  var SCALE_Y = 111 / 91;

  /**
   * Canpos
   */
  function Canpos(x, y) {
    this.x = x;
    this.y = y;
  }

  Canpos.canposByCoord = function (east, north) {
    return new Canpos(
      (east < 0) ? (east + 360) : east,
      (- north + 90) * SCALE_Y
    );
  };

  Canpos.prototype.toCoord = function () {
    var x = this.x;
    var y = this.y;

    return new Coord(
      (x > 180) ? (x - 360) : x,
	- (y / SCALE_Y - 90)
    );
  }

  Canpos.prototype.normalize = function () {
    this.x = _limit(this.x, 360 - 0.001);
    this.y = _limit(this.y, 180 - 0.001);
    return this;
    function _limit(n, max) {
      return Math.max(0, Math.min(max, n));
    }
  };

  Canpos.prototype.equals = function (other) {
    return this.x == other.x && this.y == other.y;
  };

  Canpos.prototype.assertNumber = function () {
    __.assert(_.isNumber(this.x) && _.isNumber(this.y));
    __.assert(!_.isNaN(this.x) && !_.isNaN(this.y));
  };

  Canpos.prototype.getRectangle = function (rightBtm) {
    __.assert(_.isObject(rightBtm) && rightBtm.x >= this.x && rightBtm.y >= this.y);
    return new createjs.Rectangle(this.x, this.y, rightBtm.x - this.x, rightBtm.y - this.y);
  }
  
  Canpos.bounds = {
    width:  360,
    height: 180 * SCALE_Y
  };

  /**
   * Coord
   */
  function Coord(east, north) {
    this.east = east;
    this.north = north;
  }
  Coord.prototype.round = function (r) {
    var pow = 1.0;
    for (var i=0; i<r; i++) { pow = pow * 10; }

    this.east  = Math.round( pow * this.east )  / pow;
    this.north = Math.round( pow * this.north ) / pow;

    return this;
  };
  Coord.prototype.toExp = function (opt) {
    opt = opt || {}
    var r = opt.r || 2;
    var lonSign = this.north >= 0 ? "N" : "S";
    var latSign = this.east  <= 180 ? "E" : "W";
    var lon = (this.north >= 0 ? this.north : - this.north).toFixed(r);
    var lat = (this.east >= 0 ? this.east : this.east - 180).toFixed(r);
    if (opt.format) {
      return opt.format(lonSign, lon, latSign, lat);
    }
    return lonSign + lon + " " + latSign + lat;
  };
  Coord.prototype.equals = function (other) {
    return this.east == other.east && this.north == other.north;
  };
  Coord.prototype.assertNumber = function () {
    __.assert(_.isNumber(this.east) && _.isNumber(this.north));
  };

  Canpos.Coord = Coord;

  /**
   * Bounds
   */
  function Bounds(width, height) {
    __.assert(_.isNumber(width) && _.isNumber(height));
    this.width  = width;  // canpos space width
    this.height = height; // canpos space height
  }
  Bounds.boundsByCoord = function(lat, lon) {
    return new Bounds(lat, lon * SCALE_Y);
  }
  Canpos.boundsByCoord = Bounds.boundsByCoord;  
  Canpos.Bounds = Bounds;

  return Canpos;
});
