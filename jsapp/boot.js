atcapp.boot = function (canvasId) {
  var stage = new createjs.Stage(canvasId);
   
  var circle = new createjs.Shape();
  circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 50);
  circle.x = 100;
  circle.y = 100;
  stage.addChild(circle);
  
  stage.update();
  
  
  // windowのリサイズ設定
  var id;
  $(window).on('resize', function(e){
    clearTimeout(id);
    id = setTimeout(function(){
      stage.canvas.width = $(e.target).width();
      stage.canvas.height = $(e.target).height();
      stage.update();
    }, 100);
  });
  $(window).trigger('resize');
}
