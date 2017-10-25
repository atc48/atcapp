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
    var x = this.x
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
  Canpos.Coord = Coord;

  return Canpos;
});
