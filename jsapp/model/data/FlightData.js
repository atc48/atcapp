(function (pkg, fac) {
  pkg.FlightData = fac(_, __, pkg);
})(atcapp, function (_, __, app) {

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
  FlightData.updateKeys = app.KlassUtil.make_updateKeys(FlightData);

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
