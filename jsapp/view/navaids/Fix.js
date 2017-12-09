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

  var VISIBLE_MODE = {
    NON: new _VisibleMode().none(),
    MIN: new _VisibleMode(0, 0, 0),
    MID: new _VisibleMode(1, 0, 1),
    MAX: new _VisibleMode(1, 1, 1)
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

    this._drawIcon();
    this._drawLabel();

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
  };


  Fix.getDefaultVisibleModeByScale = function (scale) {
    if (80 < scale) { return VISIBLE_MODE.MAX; }
    if (40 < scale) { return VISIBLE_MODE.MID; }
    if (20 < scale) { return VISIBLE_MODE.MIN; }
    return VISIBLE_MODE.NON;
  }

  function _VisibleMode(_forceIcon, _forceLabel, _labelAvailable) {
    this.iconVisible  = function (fix) {
      return _forceIcon || fix.isCompulsory;
    };
    this.labelVisible = function (fix) {
      return _forceLabel ||
	_labelAvailable && (fix.isCompulsory || fix.isFirBdy);
    }
    
    this.none = function () {
      this.iconVisible  = function () { return false; };
      this.labelVisible = function () { return false; };
      return this;
    };
  }


  return Fix;
});
