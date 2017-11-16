(function (pkg, fac){
  pkg.BoundsGrid = fac(_, __, pkg);
})(atcapp, function(_, __, app) {

  var NUM_DIVIDE = 10;
  var DEBUG = false;

  function BoundsGrid(bounds, opt_numDivide) {
    var unit = Math.min(bounds.width, bounds.height) / (opt_numDivide || NUM_DIVIDE);
    if (!_.isNumber(bounds.x) || !_.isNumber(bounds.y)) {
      bounds.x = bounds.y = 0;
    }
    this.bounds = bounds; // only use width, height
    this.unit = unit;
  }

  var p = BoundsGrid.prototype;

  p.getDoubledGridKeys = function (x, y) {
    var rowSet = new _RowSet(this.unit, this.bounds.x, x);
    var colSet = new _RowSet(this.unit, this.bounds.y, y);
    var gridKeys = [];
    _.each(rowSet.pair, function (row) {
      _.each(colSet.pair, function (col) {
	if (DEBUG) { __.assert(_.isNumber(row) && _.isNumber(col)); }
	gridKeys.push( row + "x" + col );
      });
    });
    return gridKeys;
  };

  function _RowSet(unit, x0, x) {
    var row = (x - x0) / unit;
    this.first = Math.floor(row);
    this.last  = this.first + 1;//Math.ceil(row);
    //this.pair = [this.first, this.last];
    this.pair = [this.first]
  }

  function __test() {
    var lg, keys;

    lg = new BoundsGrid({width:100, height: 100}, 10);
    keys = lg.getDoubledGridKeys(0.1, 0.1);
    arrEq(keys, ["0x0", "0x1", "1x0", "1x1"]);

    keys = lg.getDoubledGridKeys(0, 0.1);
    arrEq(keys, ["0x0", "0x1", "1x0", "1x1"]);

    keys = lg.getDoubledGridKeys(0, 0);
    arrEq(keys, ["0x0", "0x1", "1x0", "1x1"]);
    
    keys = lg.getDoubledGridKeys(99, 11);
    arrEq(keys, ["9x1", "9x2", "10x1", "10x2"]);
    
    __.log("BoundsGrid: tests are ok.");

    function arrEq(arr, r) {
      __.assert(arr.length == r.length && _.difference(arr, r).length == 0, "" + arr + "==" + r);
    }
  }
  if (DEBUG) {
    __test();
  }

  return BoundsGrid;
});
