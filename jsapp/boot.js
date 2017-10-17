atcapp.boot = function (canvasId) {
  var stage = new createjs.Stage(canvasId);
   
  var circle = new atcapp.Circle();
  circle.x = 100;
  circle.y = 100;
  stage.addChild(circle);

  stage.enableMouseOver();
  stage.update();
  
  var stageMan = new atcapp.StageSizeManager(stage);

  stageMan.on("resize", function () {
    console.log("resize");
  });
    
}
