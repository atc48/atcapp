(function (pkg, fac) {
  pkg.ViewDragger = fac(_);
})(atcapp, function (_) {

  var ON_DRAG_FN_NAME = "delegate_onDrag";
  var ON_DRAG_START_FN_NAME = "delegate_onDragStart";
  var ON_DRAG_END_FN_NAME   = "delegate_onDragEnd";

  function ViewDragger(target) {
    target.addEventListener("mousedown", _handleDown);
  }

  function _handleDown(e) {
    var target = e.currentTarget;
    target._dragOffset = new createjs.Point(target.x - e.stageX, target.y - e.stageY);
    target.addEventListener("pressmove", _handleMove);
    target.addEventListener("pressup",   _handleUp);
    (target[ ON_DRAG_START_FN_NAME ] || _.noop).apply(target);
  }

  function _handleMove(e) {
    var target = e.currentTarget;
    var offset = target._dragOffset;
    target.x = e.stageX + offset.x;
    target.y = e.stageY + offset.y;
    (target[ ON_DRAG_FN_NAME ] || _.noop).apply(target);
  }

  function _handleUp(e) {
    var target = e.currentTarget;
    target._dragOffset = null;
    target.removeEventListener("pressmove", _handleMove);
    target.removeEventListener("pressup",   _handleUp);
    (target[ ON_DRAG_END_FN_NAME ] || _.noop).apply(target);
  }

  return ViewDragger;
});
