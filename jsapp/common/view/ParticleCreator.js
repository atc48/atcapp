(function (pkg, fac) {
  pkg.ParticleCreator = fac(_, __, createjs, pkg);
})(atcapp, function (_, __, createjs, app) {

  var __baseImg;
  var REMOVE_DELAY = 1000;

  function ParticleCreator() {
  }

  ParticleCreator.prototype.createFire = function (size, pos) {
    return __mkEmitter(size, pos, [204, 61, 0], [122, 31, 0]);
  };

  function __mkEmitter(size, pos, color, colorVar) {
    if (!__baseImg) {
      __baseImg = new Image();
      __baseImg.src = app.IMG.PARTICLE_();
    }
    
    var emitter = new createjs.ParticleEmitter(__baseImg);
    emitter.emitterType = createjs.ParticleEmitterType.Emit;
    emitter.emissionRate = 40;
    emitter.maxParticles = 200;
    emitter.life = 1000;
    emitter.lifeVar = 0;
    emitter.position = pos;
    emitter.positionVarX = size / 2;
    emitter.positionVarY = size / 2;
    emitter.speed = 60;
    emitter.speedVar = 60;
    emitter.accelerationX = 0;
    emitter.accelerationY = -250;
    emitter.radialAcceleration = 0;
    emitter.radialAccelerationVar = 0;
    emitter.tangentalAcceleration = 40;
    emitter.tangentalAccelerationVar = 0;
    emitter.angle = 0;
    emitter.angleVar = 180;
    emitter.startSpin = 0;
    emitter.startSpinVar = 0;
    emitter.endSpin = null;
    emitter.endSpinVar = null;
    emitter.startColor = color;
    emitter.startColorVar = colorVar;
    emitter.startOpacity = 1;
    emitter.endColor = null;
    emitter.endColorVar = null;
    emitter.endOpacity = null;
    emitter.startSize = size;
    emitter.startSizeVar = size/2;
    emitter.endSize = 0;
    emitter.endSizeVar = null;

    var container = __mkContainer(emitter);

    return container;
  };

  function __mkContainer(emitter) {
    var container = new createjs.Container();
    var willRemove = false;
    container.removeAfter = function () {
      willRemove = true;
      container.removeChild( emitter );
      _.delay(function () {
	if (!willRemove) { return; }
	if (container.parent) {
	  container.parent.removeChild( container );
	}
	emitter.reset();
      }, REMOVE_DELAY);
    };
    container.addTo = function (parent) {
      willRemove = false;
      parent.addChild(container);
      container.addChild( emitter );
    };
    return container;
  }


  return ParticleCreator;
});
