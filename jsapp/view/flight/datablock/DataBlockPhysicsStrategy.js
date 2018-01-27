(function (pkg, fac) {
  pkg.DataBlockPhysicsStrategy = fac(_, __);
})(atcapp, function (_, __) {

  var DATA_BLOCK_FORCE_COEF = 1.5 * 10000;
  var FORCE_X_MULT = 1;

  var IS_DEBUG = false;

  function DataBlockPhysicsStrategy() {
  }

  var p = DataBlockPhysicsStrategy.prototype;

  p.forceByOtherWithCenter = function (selfPos, otherPos) {
    var xDiff = (otherPos.x - selfPos.x);
    var yDiff = (otherPos.y - selfPos.y);
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

  function __test() {
    var strategy = new DataBlockPhysicsStrategy();
    var i = 0;

    var force = strategy.forceByOtherWithCenter({x:2, y:2}, {x:4,y:4});
    assrt(force.x,
	  -(2 / Math.sqrt(2 * 2 + 2*2)) * (DATA_BLOCK_FORCE_COEF / 8) *
	  FORCE_X_MULT );
    assrt(force.y,
	  -(2 / Math.sqrt(2 * 2 + 2*2)) * (DATA_BLOCK_FORCE_COEF / 8) );

    var force = strategy.forceByOtherWithCenter({x:-4, y:-4}, {x:-2,y:-2});
    assrt(force.x,
	  -(2 / Math.sqrt(2 * 2 + 2*2)) * (DATA_BLOCK_FORCE_COEF / 8) *
	  FORCE_X_MULT );
    assrt(force.y,
	  -(2 / Math.sqrt(2 * 2 + 2*2)) * (DATA_BLOCK_FORCE_COEF / 8) );

    var force = strategy.forceByOtherWithCenter({x:2, y:-2}, {x:4,y:-4});
    assrt(force.x,
	  -(2 / Math.sqrt(2 * 2 + 2*2)) * (DATA_BLOCK_FORCE_COEF / 8) *
	  FORCE_X_MULT );
    assrt(force.y,
	  + (2 / Math.sqrt(2 * 2 + 2*2)) * (DATA_BLOCK_FORCE_COEF / 8) );
    

    console.log("DataBlockPhysicsStrategy.__test(): " + i +" tests ok!");

    function assrt(exp, res) {
      i++;
      __.assert(Math.abs(exp - res) < 0.01, "exp=" + exp + ", res=" + res +
	       "(DataBlockPhysicsStrategy.__test)");
    }
  }
  IS_DEBUG && __test();

  return DataBlockPhysicsStrategy;

});
