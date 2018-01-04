(function (pkg, fac) {
  pkg.Fix = fac(_, __, createjs, pkg);
})(atcapp, function (_, __, createjs, app) {

  createjs.extend(Fix, app.ExContainer);
  
  var COLOR = app.COLOR.NAVAIDS;
  var STROKE = 1;
  var SIZE_MAP = {
    FIX: 8,
    VORDME: 6,
    VORTAC: 6,
    NDB   : 6
  };

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

  var USER_STATUS_OPT = {defaultColor:COLOR.COLOR};

  function Fix(data) {
    this.ExContainer_constructor({hover: 1});
    this.data = data;
    this.code = data.code;
    this.category = this.data.getCategory();
    this.isCompulsory = !!this.data.is_compulsory();
    this.isFirBdy     = !!this.data.is_fir_boundary();
    this.priority = this.data.priority();

    this.cursor = "pointer";
    this._visibleMode = VISIBLE_MODE.NON;

    this.userStatus = new app.FixUserStatus(this, USER_STATUS_OPT);
    this.userStatus.on("up", this._onUserStatusUpdated);

    this.addEventListener("mouseover", this._onOver);
    this.addEventListener("mouseout",  this._onOut);

    this._drawIcon();
    this._drawLabel();

    var canpos = data.getCanpos();
    this.x = canpos.x;
    this.y = canpos.y;
  }

  Fix.prototype._onOver = function (e) {
    var self = e.currentTarget;
    if (!self.userStatus.isHover()) {
      self._outUserStatus = self.userStatus.getStateKey();
    }
    self.userStatus.update( "HOVER" );
  };

  Fix.prototype._onOut = function (e) {
    var self = e.currentTarget;
    self.userStatus.update( self._outUserStatus );
  };

  Fix.prototype._onUserStatusUpdated = function (e) {
    var self = e.target;
    self._updateView();
  };

  Fix.prototype._updateView = function () {
    this._drawIcon();
    this._drawLabel();
    this._drawBG();
    this.changeVisibleMode( this._visibleMode );
    this.scaleX = this.scaleY = this._normalScale;
  }

  Fix.prototype._drawIcon = function () {
    var color = this.userStatus.getColor();

    if (this.icon) {
      this.removeChild( this.icon );
    }
    this.icon = new createjs.Shape();

    var g = this.icon.graphics;
    g.clear();
    g.beginStroke( color );
    g.setStrokeStyle(STROKE);

    if (this.data.is_compulsory()){
      g.beginFill( color );
    }
    Fix[ "__draw_" + this.category ](g, this._getSize() );

    this.addChild( this.icon );
  };

  Fix.prototype._drawLabel = function () {
    if (this.label) {
      this.removeChild( this.label );
    }

    this.label = new app.CacheableText(
      this.code, COLOR.FONT, this.userStatus.getColor());
    this.label.scaleX = this.label.scaleY = COLOR.FONT_SCALE;

    var bounds = this.label.getBounds();
    this.label.x = - bounds.width * this.label.scaleX / 2;
    this.label.y = (SIZE_MAP[ this.category ] / 2);

    this.label.doCache();

    this.addChild(this.label);
  };

  Fix.prototype._drawBG = function () {
    var size = this._getSize();
    var circleSize = size * (this.userStatus.isEasyHit() ? 2 : 1.2);
    var bg = new createjs.Shape();
    bg.graphics.clear().beginFill("#ff0000").drawCircle(0,0, circleSize);
    if (this._visibleMode.labelVisible(this)) {
      var bounds = this.label.getBounds();
      bg.graphics.beginFill("#0000ff").drawRect(
	this.label.x-4, this.label.y-4, bounds.width+8, bounds.height+8);
    }
    bg.alpha = 0.2;
    this.hitArea = bg;
  };

  Fix.prototype._getSize = function () {
    return SIZE_MAP[ this.category ];
  };

  Fix.__draw_FIX = function (g, iconSize) {
    var size = iconSize;
    var verticalDiff = size * (1.73/2) / 2;
    g.moveTo(0, - verticalDiff);
    g.lineTo(  size / 2, verticalDiff);
    g.lineTo(- size / 2, verticalDiff);
    g.lineTo(0, - verticalDiff);
  };
  Fix.__draw_VORTAC =
    Fix.__draw_VORDME =
    Fix.__draw_NDB = function (g, iconSize) {
    var diff = iconSize / 2;
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
    this._visibleMode = visibleMode;
  };

  Fix.prototype.onLayerScaleUpdated = function (scale) {
    this._normalScale = 1.0 / scale;
    this._updateView();
  };

  Fix.getDefaultVisibleModeByScale = function (scale) {
    if (500 < scale) { return VISIBLE_MODE.GIGA; }
    if (140 < scale) { return VISIBLE_MODE.MEGA; }
    if (80 < scale) { return VISIBLE_MODE.MAX; }
    if (40 < scale) { return VISIBLE_MODE.MID; }
    if (20 < scale) { return VISIBLE_MODE.MIN; }
    return VISIBLE_MODE.NON;
  }

  Fix.prototype.override__getToolTipEvent = function () {
    var pron = this.data.pronounciation() || null;
    var categoryExp = this.data.getCategoryExp();

    var msg = "";
    if (pron) {
      msg += pron;
    }
    if (categoryExp != "FIX") {
      msg += "\n" + categoryExp;
    }

    return new app.ToolTipEvent.createWithText(
      this, this.code, msg).setOpt("distance", {top: 12, bottom: 24})
  };

  Fix.prototype.override__hoverMsg = function (e) {
    return this.code + ": " + (this.data.pronounciation() || "") + " " +
      this.data.getCategoryExp() + " " + this.data.coord_exp() +
      (this.isCompulsory && " (CRP)" || "");
  };
  
  function _VisibleMode(_iconPermitPriority, _labelPermitPriority) {
    this.iconVisible  = function (fix) {
      if (fix.userStatus.isFullVisible()) {
	return true;
      }
      return fix.priority >= _iconPermitPriority;
    };
    this.labelVisible = function (fix) {
      if (fix.userStatus.isFullVisible()) {
	return true;
      }
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

  return createjs.promote(Fix, "ExContainer");
});
