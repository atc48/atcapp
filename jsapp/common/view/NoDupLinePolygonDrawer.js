(function (pkg, fac) {
  pkg.NoDupLinePolygonDrawer = fac(_, __);
})(atcapp, function(_, __) {

  var DEBUG_MODE = false;
  var LINE_IDENTIFY_ROUND_DIGIT = 1000;  

  function NoDupLinePolygonDrawer() {
    this.pLeft = null;
    this.record = {};
  }

  NoDupLinePolygonDrawer.prototype.moveTo = function (pLeft) {
    this.pLeft = pLeft;
  };
  

  NoDupLinePolygonDrawer.prototype.lineTo = function (pRight) {
    this.record[ __pointHash(this.pLeft,  pRight) ] = true;
    this.record[ __pointHash( pRight, this.pLeft) ] = true;

    this.pLeft = pRight;
  }

  NoDupLinePolygonDrawer.prototype.hasLineWritten = function (pRight) {
    return this.record[ __pointHash(this.pLeft,  pRight) ];
  };

  NoDupLinePolygonDrawer.prototype.getDrawWrapperFor = function (graphics) {
    return new _Drawer(graphics, this);
  };

  function _Drawer(graphics, parent) {
    this.g = graphics;
    this.record = parent;
  }

  _Drawer.prototype.moveTo = function (p) {
    this.g.moveTo(p[0], p[1]);
    this.record.moveTo(p);
  };

  _Drawer.prototype.lineToIfEnable = function (p) {
    if (this.record.hasLineWritten(p)) {
      this.moveTo(p);
    } else {
      this.g.lineTo(p[0], p[1]);
      this.record.lineTo(p);
    }
  };

  function __pointHash(pLeft, pRight) {
    var rounded = _.map([pLeft, pRight], function (p) {
      return _.map(p, function (val) {
	return Math.round(val * LINE_IDENTIFY_ROUND_DIGIT);
      })
    });
    pLeft  = rounded[0];
    pRight = rounded[1];
    return '<' + pLeft.join(",") + '>-<' + pRight.join(",") + ">";
  }

  if (DEBUG_MODE) {
    // decorates each methods for assertion
    _.each(["moveTo", "lineTo", "hasWritten"], function (methodName) {
      var originFn = NoDupLinePolygonDrawer.prototype[methodName];
      NoDupLinePolygonDrawer.prototype[methodName] = function (p) {
	__.assert(_.isArray(p) && p.length == 2);
	return originFn.apply(this, [p]);
      };
    });

    __test();

    function __test() {
      __.log("NoDupLinePolygonDrawer.test:");
      var drawer = new NoDupLinePolygonDrawer();
      drawer.moveTo([1,2]);
      drawer.lineTo([2,3]);
      __.assert(drawer.hasLineWritten([1,2]), _.keys(drawer._drawerord));
      __.assert(!drawer.hasLineWritten([2,4]), _.keys(drawer._drawerord));
      drawer.moveTo([4,4]);
      __.assert(!drawer.hasLineWritten([1,2]), _.keys(drawer._drawerord));
      __.assert(!drawer.hasLineWritten([2,4]), _.keys(drawer._drawerord));
      drawer.lineTo([5,5]);
      __.assert(!drawer.hasLineWritten([1,2]), _.keys(drawer._drawerord));
      __.assert(!drawer.hasLineWritten([2,4]), _.keys(drawer._drawerord));
      drawer.moveTo([4,4]);
      __.assert(drawer.hasLineWritten([5,5]), _.keys(drawer._drawerord));
    }
  }  
  
  return NoDupLinePolygonDrawer;
});
