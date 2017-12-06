(function (pkg, fac) {
  pkg.FlightData = fac(_, __);
})(atcapp, function (_, __) {

  function FlightData(raw) {
    this._raw = raw;
  }

  /**
     0"callsign"
     1"x"
     2"y"
     3"heading"
     4"alt"
     5"speed"
     6"vspeed"
     7"ground_flag"
     8"actype"
     9"dep_code"
     10"dest_code"
   */
  FlightData.updateKeys = function (keys) {
    _.each(keys, __addGetter);

    function __addGetter(key, i) {
      __.assert(_.isString(key) && key.length > 0 && _.isNumber(i) && i >= 0);      
      FlightData.prototype[key] = function () {
	return this._raw[i];
      };
    }
  };

  FlightData.prototype.isGround = function () {
    return !!this.ground_flag();
  };

  FlightData.prototype.altExp = function () {
    return "FL" + Math.round(this.alt() / 100);
  };

  FlightData.prototype.speedExp = function () {
    return "G" + this.speed() + "kt";
  };

  // TODO: define getDepAirport(), getDestAirport()

  return FlightData;
});
