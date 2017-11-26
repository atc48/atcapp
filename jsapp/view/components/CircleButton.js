(function (pkg, fac) {
  pkg.CircleButton = fac(createjs, pkg);
})(atcapp, function (createjs, app) {

  createjs.extend(CircleButton, app.ExContainer);
  createjs.promote(CircleButton, "ExContainer");

  var DEACTIVE_ALPHA = 0.8;
  var ACTIVE_ALPHA   = 1.0;
  var CLICK_DIFF_Y   = 2;
  
  function CircleButton(imgPath, opt) {
    opt = opt || {};
    this.ExContainer_constructor();
    this.addChild( this.bm = new createjs.Bitmap(imgPath) );
    this.cursor = "pointer";
    this.center = new createjs.Point(20, 20);

    if (opt.img_org_size) {
      var size = opt.img_org_size;
      var back = new createjs.Shape();
      back.graphics.beginFill( app.COLOR.BACKGROUND ).drawCircle(size/2, size/2, size/2)
      back.alpha = 0.4;
      this.addChildAt(back, 0);
      this.size = size;
    }
    if (opt.active_state_btn) {
      this.isClickStateBtn = true;
    }      

    this.size = this.size || 40;
    this.center.x = this.center.y = this.size/2;

    this.dispatcher = new app.Dispatcher();

    this.alpha = DEACTIVE_ALPHA;
    this.addEventListener("mouseover", this._over);
    this.addEventListener("mouseout", this._out);
    this.addEventListener("mousedown", this._down);
    this.addEventListener("pressup", this._up);
    this.addEventListener("mousedown", this._click);
  }

  CircleButton.prototype._over = function (e) {
    var self = e.currentTarget;
    self.alpha = ACTIVE_ALPHA;
  };

  CircleButton.prototype._out = function (e) {
    var self = e.currentTarget;
    self.alpha = DEACTIVE_ALPHA;
    self.y = 0;
  };

  CircleButton.prototype._down = function (e) {
    var self = e.currentTarget;
    self.y = CLICK_DIFF_Y;
  };

  CircleButton.prototype._up = function (e) {
    var self = e.currentTarget;
    self.y = 0;
  };

  CircleButton.prototype._click = function (e) {
    var self = e.currentTarget;
    if (self.isClickStateBtn) {
      self.isActive ? self.deactivate() : self.activate();
    }
  }

  CircleButton.prototype.activate = function () {
    if (this.isActive) { return; }
    this.isActive = true;

    if (!this.emitter) {
      this.emitter = new app.ParticleCreator().createFire(this.size, this.center);
    }
    this.bm.filters = [ new createjs.ColorFilter(0,0,0,1, 255,0,0,0) ];
    this.bm.cache(0, 0, this.size, this.size);

    this.emitter.addTo( this );

    this.dispatcher.fire("deactive");
  };

  CircleButton.prototype.deactivate = function () {
    if (!this.isActive) { return; }
    this.isActive = false;

    this.bm.filters = [];
    this.bm.cache(0, 0, this.size, this.size);
    
    this.emitter.removeAfter();

    this.dispatcher.fire("active");
  };

    
  return CircleButton;
});
