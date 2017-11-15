(function (pkg, fac){
  pkg.FlightViewPool = fac(_, __, atcapp);
})(atcapp, function(_, __, app) {

  function FlightViewPool(mainLayer, backLayer) {
    this.flightPool = new _FlightPool();
    this.mainLayer = new _LayerWrapper(mainLayer, this.flightPool);
    this.backLayer = new _LayerWrapper(backLayer, this.flightPool);
  }

  FlightViewPool.prototype.moveToMainLayer = function (cs) {
    this.backLayer.removeIfChild( cs );
    return this.mainLayer.addChild( cs );
  };

  FlightViewPool.prototype.moveToBackLayer = function (cs) {
    this.mainLayer.removeIfChild( cs );
    return this.backLayer.addChild( cs );
  };

  FlightViewPool.prototype.removeExcept = function (csList) {
    var removes = _.difference(this.flightPool.getAllCsList(), csList);
    var self = this;
    _.each(removes, function (cs) {
      self.removeByCallsign( cs );
    });
    return removes;
  };

  FlightViewPool.prototype.removeByCallsign = function (cs) {
    this.mainLayer.removeIfChild( cs );
    this.backLayer.removeIfChild( cs );
    this.flightPool.remove( cs );
  };

  FlightViewPool.prototype.clear = function () {
    this.mainLayer.clear();
    this.backLayer.clear();
    this.flightPool.clear();
  };

  function _LayerWrapper(layer, _flightPool) {

    this.addChild = function (cs) {
      var flight = _flightPool.getOrCreate( cs );
      if (flight.parent == layer) {
	return flight;
      }
      layer.addChild( flight );
      return flight;
    };

    this.removeIfChild = function (cs) {
      if (!_flightPool.has(cs)) {
	return;
      }
      var flight = _flightPool.getOrCreate(cs);
      if (flight.parent == layer) {
	layer.removeChild( flight );
      }
    };

    this.clear = function () {
      layer.removeAllChildren();
    };
  }

  function _FlightPool() {
    var _idToFlight = {};

    this.has = function (cs) {
      assertCallsign(cs);
      return !!_idToFlight[ cs ];
    };

    this.getOrCreate = function (cs) {
      assertCallsign(cs);
      var flight = _idToFlight[ cs ];
      if (!flight) {
	flight = new app.Flight();
	_idToFlight[ cs ] = flight;
      }
      return flight;
    };

    this.remove = function (cs) {
      assertCallsign(cs);
      delete _idToFlight[ cs ];
    };

    this.clear = function () {
      _idToFlight = {};
    };

    this.getAllCsList = function () {
      return _.keys(_idToFlight);
    };

    function assertCallsign(cs) {
      __.assert(_.isString(cs) && cs.length > 0 && cs.length <= 32);
    }

  }

  return FlightViewPool;
});
