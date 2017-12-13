var keys = require("../core/init.js").keys;
var globals = require("../core/init.js").globals;
var defaults = require("../core/init.js").defaults;
var update = require("../core/render.js").update;
var network = require("../core/init.js").globals.network;
var container = require("../core/init.js").container;
var mouse = require("../core/init.js").globals.mouse;
var nodeIntersection = require("./interaction.js").nodeIntersection;
var callbacks = require("../core/init.js").callbacks;
var freeStyle = require("./navigation.js").freeStyle;
var confineXYMovement = require("./navigation.js").confineXYMovement;
var axes = require("../core/init.js").axes;

/**
 * Hammer.js Controls (Touch)
 */ 

var main_el = document.getElementById("main_vis");

var mc = new Hammer.Manager(main_el, {
	recognizers: [
    // RecognizerClass, [options], [recognizeWith, ...], [requireFailure, ...]
    [Hammer.Pan],
    [Hammer.Rotate],
    [Hammer.Press],
		[Hammer.Pinch, { enable: true }, ['rotate']],
		[Hammer.Swipe], // ,{ direction: Hammer.DIRECTION_HORIZONTAL }
	]
});

var old_rotation = 0;
mc.on("rotate", function(ev) {
  if ( !ev.srcEvent.shiftKey ) {
    return;
  }
  // console.log(ev);  
  if ( ev.rotation < old_rotation ) {
    network.rotateOnAxis(axes.axis_z, defaults.delta_rotation/2);
    axes.axis_x.applyAxisAngle(axes.axis_z, -defaults.delta_rotation/2);
    axes.axis_y.applyAxisAngle(axes.axis_z, -defaults.delta_rotation/2);
  }
  else {
    network.rotateOnAxis(axes.axis_z, -defaults.delta_rotation/2);
    axes.axis_x.applyAxisAngle(axes.axis_z, defaults.delta_rotation/2);
    axes.axis_y.applyAxisAngle(axes.axis_z, defaults.delta_rotation/2);
  }
  old_rotation = ev.rotation;
})

var old_scale = 1;
mc.on("pinch", function(ev) {
  // Not sure if this can be the case...
  if ( ev.pointerType === 'mouse' ) {
    return;
  }
  var new_z_pos = globals.camera.position.z - (ev.scale-old_scale) * 20;
  new_z_pos = Math.min(new_z_pos, defaults.MAX_CAM_DISTANCE);
  new_z_pos = Math.max(new_z_pos, defaults.MIN_CAM_DISTANCE);
  globals.camera.position.z = new_z_pos;
  window.requestAnimationFrame(update);
});


var old_pos_x = globals.camera.position.x;
var old_pos_y = globals.camera.position.y;
var old_deltaX = 0;
mc.on("pan", function(ev) {
  // console.log(ev);
  if ( ev.pointerType === 'mouse' ) {
    return;
  }
  if ( ev.srcEvent.shiftKey ) {
    freeStyle( ev.srcEvent );
  }
  else if ( ev.srcEvent.altKey ) {
    if ( ev.deltaX > old_deltaX ) {
      network.rotateOnAxis(axes.axis_y, defaults.delta_rotation);
      axes.axis_x.applyAxisAngle(axes.axis_y, -defaults.delta_rotation);
    }
    else {
      network.rotateOnAxis(axes.axis_y, -defaults.delta_rotation);
      axes.axis_x.applyAxisAngle(axes.axis_y, defaults.delta_rotation);
    }
    old_deltaX = ev.deltaX;
  }
  else {
    globals.camera.position.x = old_pos_x - ev.deltaX * globals.camera.position.z / 500;
    globals.camera.position.y = old_pos_y + ev.deltaY * globals.camera.position.z / 500;
    confineXYMovement();
  }
  window.requestAnimationFrame(update);
});

mc.on("panend", function(ev) {
  old_pos_x = globals.camera.position.x;
  old_pos_y = globals.camera.position.y;
});
