(function (pkg, fac){
  pkg.Canpos = fac();
})(atcapp, function () {

  function Canpos(x, y) {
    this.x = x;
    this.y = y;
  }
  var SCALE_Y = 111 / 91;

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
    console.log(this.north);
    var lon = (this.north >= 0 ? this.north : - this.north).toFixed(r);
    var lat = (this.east >= 0 ? this.east : this.east - 180).toFixed(r);
    if (opt.format) {
      return opt.format(lonSign, lon, latSign, lat);
    }
    return lonSign + lon + " " + latSign + lat;
  };

  Canpos.Coord = Coord;

  return Canpos;
});
