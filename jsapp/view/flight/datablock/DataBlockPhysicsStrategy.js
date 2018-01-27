(function (pkg, fac) {
  pkg.DataBlockPhysicsStrategy = fac(_, __);
})(atcapp, function (_, __) {

  var DATA_BLOCK_FORCE_COEF = 1.5 * 10000;
  var FORCE_X_MULT = 3;

  function DataBlockPhysicsStrategy() {
  }

  var p = DataBlockPhysicsStrategy.prototype;

  p.forceByOtherWithCenter = function (selfCenter, selfPos, otherPos) {
    var xDiff = (otherPos.x - selfPos.x);
    var yDiff = (otherPos.y - selfPos.y) * 0.5;
    var r2 = Math.pow(xDiff, 2) + Math.pow(yDiff, 2);
    var r1 = Math.sqrt(r2);
    var force = DATA_BLOCK_FORCE_COEF / r2;
    var forceX = (- force * xDiff / r1) * FORCE_X_MULT;
    var forceY = (- force * yDiff / r1);
    __.assert(!_.isNaN(forceX) && !_.isNaN(forceY));
    return {
      x: forceX,
      y: forceY
    };
  };

  return DataBlockPhysicsStrategy;

});
