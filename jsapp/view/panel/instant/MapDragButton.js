(function (pkg, fac) {
  pkg.MapDragButton = fac(createjs, pkg);
})(atcapp, function (createjs, app) {

  createjs.extend(MapDragButton, app.CircleButton);
  createjs.promote(MapDragButton, "parent");

  var IMG_ORG_SIZE = 80;

  function MapDragButton(size) {
    this.parent_constructor( app.IMG.MAP_DRAG_BTN, {img_org_size: IMG_ORG_SIZE, active_state_btn: 1} );
    this.scaleX = this.scaleY = size / IMG_ORG_SIZE;

    // fires "active" and "deactive" events via super class.
  }

  return MapDragButton;
});
