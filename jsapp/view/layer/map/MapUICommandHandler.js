(function (pkg, fac) {
  pkg.MapUICommandHandler = fac(_, __, createjs, pkg);
})(atcapp, function (_, __, createjs, app) {

  var ZOOM_MULT = 0.05;

  function MapUICommandHandler(uiCommand, container, stageSize, mapStatus) {
    __.assert(container && uiCommand && stageSize && mapStatus);

    this.uiCommand = uiCommand;
    this.container = container;
    this.mapStatus = mapStatus;
    this.posCalc   = new _ContainerPositionCalculator(container, stageSize);
    this.scaleCalc = new _ContainerScaleCalculator(stageSize);

    // by User Input
    this.uiCommand.on("zoom",    _.bind(_onZoomInput, this));
    this.uiCommand.on("mapMove", _.bind(_onMapMove, this));
    // by Program Order
    this.uiCommand.on("mapFix",  _.bind(_onMapFix, this));
    
    function _onZoomInput(e) {
      var nextScale = this.container.scaleX * (1.0 + ZOOM_MULT * (e.delta > 0 ? 1 : -1))
      this._updateScaleWithStationaryCenter(nextScale);
    }
    function _onMapMove(e) {
      this._doUpdatePosition(
	new createjs.Point(
	  this.container.x + e.moveX,
	  this.container.y + e.moveY
	)
      );
    }
    function _onMapFix(e) {
      __.assert(e.canpos || e.scale || e.scaleMinBounds);
      // scale change must be called prior to canpos.
      if (e.scaleMinBounds) {
	this._updateScaleByMinBounds(e.scaleMinBounds);
      } else if (e.scaleMaxBounds) {
	this._updateScaleByMaxBounds(e.scaleMaxBounds);
      } else if (e.scale) {
	this._doUpdateScale(e.scale);
      }
      if (e.canpos) {
	this._updateCenterPositionTo(e.canpos);
      }
    }
  }

  // will fire via mapStatus
  MapUICommandHandler.prototype._doUpdateScale = function (scale) {
    __.assert(_.isNumber(scale));
    this.container.scaleX = this.container.scaleY = scale;
    this.mapStatus.fire("scale", {type: "MapStatus.scale", scale: scale});
  }

  // will fire via mapStatus
  MapUICommandHandler.prototype._doUpdatePosition = function (localP) {
    __.assert(_.isObject(localP) && _.isNumber(localP.x) && _.isNumber(localP.y));
    this.container.x = localP.x;
    this.container.y = localP.y;
    this.mapStatus.fire("move", {type: "MapStatus.move"});
  }
  
  MapUICommandHandler.prototype._updateCenterPositionTo = function (centerP) {
    var localP = this.posCalc.getLocalPointOfCenterizingFor(centerP);
    this._doUpdatePosition(localP);
  };

  MapUICommandHandler.prototype._updateScaleWithStationaryCenter = function (scale) {
    __.assert(_.isNumber(scale));
    var oldCenterLocal = this.posCalc.getLocalPointOfCurrentStageCenter();
    this._doUpdateScale(scale);
    this._updateCenterPositionTo(oldCenterLocal);
  };

  MapUICommandHandler.prototype._updateScaleByMinBounds = function (canposBounds) {
    var scale = this.scaleCalc.getScaleByMinBounds(canposBounds);
    this._doUpdateScale(scale);
  }

  MapUICommandHandler.prototype._updateScaleByMaxBounds = function (canposBounds) {
    var scale = this.scaleCalc.getScaleByMaxBounds(canposBounds);
    this._doUpdateScale(scale);
  }  

  function _ContainerPositionCalculator(container, stageSize) {
    
    this.getLocalPointOfCurrentStageCenter = function () {
      return container.globalToLocal(
	stageSize.curWidth  / 2.0,
	stageSize.curHeight / 2.0
      );
    };

    this.getLocalPointOfCenterizingFor = function (destCenterLocal) {
      var destCenterGlobal = container.localToGlobal(destCenterLocal.x, destCenterLocal.y);
      var diff = {
	x: destCenterGlobal.x - stageSize.curWidth / 2.0,
	y: destCenterGlobal.y - stageSize.curHeight / 2.0
      };
      return new createjs.Point(
	container.x - diff.x,
	container.y - diff.y
      );
    };
  }

  function _ContainerScaleCalculator(stageSize) {

    this.getScaleByMinBounds = function (minBounds, opt_isMax) {
      __.assert(_.isObject(minBounds)); // minBounds must be Canpos.Bounds;

      var isStageWider = (stageSize.curWidth / stageSize.curHeight) >
	  (minBounds.width / minBounds.height);
      if(opt_isMax) {
	isStageWider = !isStageWider;
      }

      var scale = isStageWider ?
	  (stageSize.curHeight / minBounds.height) :
	  (stageSize.curWidth  / minBounds.width);
      return scale;
    };

    this.getScaleByMaxBounds = function (maxBounds) {
      return this.getScaleByMinBounds(maxBounds, true);
    }

  }

  return MapUICommandHandler;
});
