(function (pkg, fac){
  pkg.Coord = fac();
})(atcapp, function () {
  function Coord() {
  }
  Coord.Y_RATIO = 111 / 91;

  return Coord;
});
