(function (pkg, fac) {
  pkg.Fix = fac(_, __, createjs, pkg);
})(atcapp, function (_, __, createjs, app) {

  createjs.extend(Fix, app.ExContainer);
  createjs.promote(Fix, "ExContainer");
  
  var COLOR = app.COLOR.NAVAIDS;
  var STROKE = 1;
  var SIZE_MAP = {
    FIX: 8,
    VORDME: 6,
    VORTAC: 6,
    NDB   : 6
  };
  var USE_CACHE = false;

  var VISIBLE_MODE = {
    NON:  new _VisibleMode(4, 4),
    MIN:  new _VisibleMode(3, 4),
    MID:  new _VisibleMode(2, 3),
    MAX:  new _VisibleMode(1, 2),
    MEGA: new _VisibleMode(0, 1),
    GIGA: new _VisibleMode(0, 0)
  }
  Fix.VISIBLE_MODE = VISIBLE_MODE;

  Fix.CATEGORIES = {
    "FIX"   : 1,   
    "VORDME": 1,
    "VORTAC": 1
  }

  function Fix(data) {
    this.ExContainer_constructor();
    this.data = data;
    this.code = data.code;
    this.category = this.data.getCategory();
    this.isCompulsory = !!this.data.is_compulsory();
    this.isFirBdy     = !!this.data.is_fir_boundary();
    this.iconSize = SIZE_MAP[ this.category ];
    this.priority = this.data.priority();

    this._drawIcon();
    this._drawLabel();

    USE_CACHE && this.cache(-20, -8, 40, 26);
	
    var canpos = data.getCanpos();
    this.x = canpos.x;
    this.y = canpos.y;
  }

  Fix.prototype._drawIcon = function () {
    this.icon = new createjs.Shape();
    var g = this.icon.graphics;
    g.beginStroke( COLOR.COLOR );
    g.setStrokeStyle(STROKE);
    
    if (this.data.is_compulsory()){
      g.beginFill( COLOR.COLOR );
    }
    this[ "_draw_" + this.category ](g);
    this.addChild( this.icon );
  };

  Fix.prototype._drawLabel = function () {
    this.label = new createjs.Text(this.code, COLOR.FONT, COLOR.FONT_COLOR);
    var bounds = this.label.getBounds();
    
    this.label.y = (this.iconSize / 2);
    if (bounds) {
      this.label.x = - bounds.width / 2;
    }
    this.addChild(this.label);
  };

  Fix.prototype._draw_FIX = function (g) {
    var size = this.iconSize;
    var verticalDiff = size * (1.73/2) / 2;
    g.moveTo(0, - verticalDiff);
    g.lineTo(  size / 2, verticalDiff);
    g.lineTo(- size / 2, verticalDiff);
    g.lineTo(0, - verticalDiff);
  };
  Fix.prototype._draw_VORTAC =
    Fix.prototype._draw_VORDME =
    Fix.prototype._draw_NDB = function (g) {
    var diff = this.iconSize / 2;
    g.moveTo(-diff, -diff);
    g.lineTo( diff, -diff);
    g.lineTo( diff,  diff);
    g.lineTo(-diff,  diff);
    g.lineTo(-diff,  -diff);
  };

  Fix.prototype.changeVisibleMode = function (visibleMode) {
    this.icon.visible  = visibleMode.iconVisible(this);
    this.label.visible = visibleMode.labelVisible(this);
    this.visible = this.icon.visible;
    USE_CACHE && this.updateCache();    
  };

  Fix.prototype.onLayerScaleUpdated = function (scale) {
    this.scaleX = this.scaleY = 1.0 / scale;
  };

  Fix.getDefaultVisibleModeByScale = function (scale) {
    if (500 < scale) { return VISIBLE_MODE.GIGA; }
    if (140 < scale) { return VISIBLE_MODE.MEGA; }
    if (80 < scale) { return VISIBLE_MODE.MAX; }
    if (40 < scale) { return VISIBLE_MODE.MID; }
    if (20 < scale) { return VISIBLE_MODE.MIN; }
    return VISIBLE_MODE.NON;
  }
  
  function _VisibleMode(_iconPermitPriority, _labelPermitPriority) {
    this.iconVisible  = function (fix) {
      return fix.priority >= _iconPermitPriority;
    };
    this.labelVisible = function (fix) {
      return fix.priority >= _labelPermitPriority;
    }
    this.visibleMinimumPriority = function () {
      return _iconPermitPriority;
    };
    this.visiblePriorities = function () {
      return _.range(
	_iconPermitPriority,
	_VisibleMode.maxPriority + 1
      );
    };
  }

  _VisibleMode.priorities = _.map(VISIBLE_MODE, function (mode) {
    return mode.visibleMinimumPriority();
  });
  _VisibleMode.minPriority = _.min(_VisibleMode.priorities);
  _VisibleMode.maxPriority = _.max(_VisibleMode.priorities);

  return Fix;
});
