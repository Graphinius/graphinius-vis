var keys = require("../core/init.js").keys;
var globals = require("../core/init.js").globals;
var defaults = require("../core/init.js").defaults;
var update = require("../core/render.js").update;
var network = require("../core/init.js").globals.network;
var container = require("../core/init.js").container;
var mouse = require("../core/init.js").globals.mouse;
var nodeIntersection = require("./interaction.js").nodeIntersection;
var callbacks = require("../core/init.js").callbacks;
var axes = require("../core/init.js").axes;

console.log(axes);

// for testing purposes
var intersect_cb1 = function(node) {
  document.querySelector("#nodeID").innerHTML = node._id;
};
callbacks.node_intersects.push(intersect_cb1);


window.addEventListener('keypress', key, false);
function key(event) {
  switch (event.charCode) {
    case keys.KEY_F: //zoom in
      globals.camera.position.y = globals.camera.position.y - defaults.delta_distance; break;
    case keys.KEY_R: //zoom out
      globals.camera.position.y = globals.camera.position.y + defaults.delta_distance; break;
    case keys.KEY_D: //move left
      globals.camera.position.x = globals.camera.position.x + defaults.delta_distance; break;
    case keys.KEY_A: //move right
      globals.camera.position.x = globals.camera.position.x - defaults.delta_distance; break;
    case keys.KEY_W:
      network.translateZ(defaults.delta_distance); break;
    case keys.KEY_S:
      network.translateZ(-defaults.delta_distance); break;

    case keys.KEY_X:
      network.rotateOnAxis(axes.axis_x, defaults.delta_rotation);
      axes.axis_y.applyAxisAngle(axes.axis_x, -defaults.delta_rotation);
      break;
    case keys.KEY_SX:
      network.rotateOnAxis(axes.axis_x, -defaults.delta_rotation);
      axes.axis_y.applyAxisAngle(axes.axis_x, defaults.delta_rotation);
      break;
    case keys.KEY_Y:
      network.rotateOnAxis(axes.axis_y, defaults.delta_rotation);
      axes.axis_x.applyAxisAngle(axes.axis_y, -defaults.delta_rotation);
      break;
    case keys.KEY_SY:
      network.rotateOnAxis(axes.axis_y, -defaults.delta_rotation);
      axes.axis_x.applyAxisAngle(axes.axis_y, defaults.delta_rotation);
      break;
    case keys.KEY_C:
      network.rotateOnAxis(axes.axis_z, defaults.delta_rotation);
      axes.axis_x.applyAxisAngle(axes.axis_z, -defaults.delta_rotation);
      axes.axis_y.applyAxisAngle(axes.axis_z, -defaults.delta_rotation);
      break;
    case keys.KEY_SC:
      network.rotateOnAxis(axes.axis_z, -defaults.delta_rotation);
      axes.axis_x.applyAxisAngle(axes.axis_z, defaults.delta_rotation);
      axes.axis_y.applyAxisAngle(axes.axis_z, defaults.delta_rotation);
      break;
    default:
      break;
  }
  window.requestAnimationFrame(update);
}

//zoom in and out
var eventWheel = 'mousewheel';
if(typeof InstallTrigger !== 'undefined') {
  eventWheel = 'wheel';
}
container.element.addEventListener(eventWheel, mousewheel, false);

function mousewheel(event) {
  //wheel down: negative value; firefox positive
  //wheel up: positive value; firefox negative;

  var delta = event.wheelDelta; //chromium, ...
  if(typeof InstallTrigger !== 'undefined') { //firefox
    delta = event.deltaY * defaults.firefox_wheel_factor;
  }

  if(event.altKey) {
    if(delta < 0) {
      network.rotateOnAxis(axes.axis_y, -defaults.delta_rotation);
      axes.axis_x.applyAxisAngle(axes.axis_y, defaults.delta_rotation);
    }
    else {
      network.rotateOnAxis(axes.axis_y, defaults.delta_rotation);
      axes.axis_x.applyAxisAngle(axes.axis_y, -defaults.delta_rotation);
    }
  }
  else {
    var new_z_pos = globals.camera.position.z - defaults.CAM_Z_DELTA_FACTOR * delta;
    new_z_pos = Math.min(new_z_pos, defaults.MAX_CAM_DISTANCE);
    new_z_pos = Math.max(new_z_pos, defaults.MIN_CAM_DISTANCE);
    globals.camera.position.z = new_z_pos;
    // console.log(new_z_pos);
  }
  window.requestAnimationFrame(update);
}



container.element.addEventListener('mousemove', mouseMove, false);
function mouseMove(event) {

  if(event.shiftKey && event.buttons == 1) {
    freeStyle( event );
  }
  //left mouse button
  else if(event.buttons == 1) {
    var mouseX = event.clientX / container.WIDTH;
    var mouseY = event.clientY / container.HEIGHT;
    confineXYMovement();
    //movement in y: up is negative, down is positive
    globals.camera.position.x = globals.camera.position.x - (mouseX * event.movementX);
    globals.camera.position.y = globals.camera.position.y + (mouseY * event.movementY);
  }

  //raycaster
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  event.preventDefault();
  var element = document.querySelector('#main_vis');
  var rect = element.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / container.WIDTH) * 2 - 1;
  mouse.y = - ((event.clientY - rect.top) / container.HEIGHT) * 2 + 1;
  //intersect after init grap
  if(network.children[0] != null) {
    window.requestAnimationFrame(nodeIntersection);
  }
  window.requestAnimationFrame(update);
}


function freeStyle( event ) {
  if(event.movementX > 0) {
    network.rotateOnAxis(axes.axis_z, defaults.delta_rotation);
    axes.axis_x.applyAxisAngle(axes.axis_z, -defaults.delta_rotation);
    axes.axis_y.applyAxisAngle(axes.axis_z, -defaults.delta_rotation);
  }
  else if(event.movementX < 0) {
    network.rotateOnAxis(axes.axis_z, -defaults.delta_rotation);
    axes.axis_x.applyAxisAngle(axes.axis_z, defaults.delta_rotation);
    axes.axis_y.applyAxisAngle(axes.axis_z, defaults.delta_rotation);
  }
  else if(event.movementY > 0) {
    network.rotateOnAxis(axes.axis_x, defaults.delta_rotation);
    axes.axis_y.applyAxisAngle(axes.axis_x, -defaults.delta_rotation);
  }
  else if(event.movementY < 0) {
    network.rotateOnAxis(axes.axis_x, -defaults.delta_rotation);
    axes.axis_y.applyAxisAngle(axes.axis_x, defaults.delta_rotation);
  }
}

function confineXYMovement() {
  // var max_x = globals.graph_dims.MAX_X;
  // var max_y = globals.graph_dims.MAX_Y;

  // if(globals.camera.position.x > max_x) {
  //   globals.camera.position.x = max_x;
  // }
  // else if(globals.camera.position.x < -max_x) {
  //   globals.camera.position.x = -max_x;
  // }
  // else if(globals.camera.position.y > max_y) {
  //   globals.camera.position.y = max_y;
  // }
  // else if(globals.camera.position.y < -max_y) {
  //   globals.camera.position.y = -max_y;
  // }
}


/**
 * !!! This belongs into interaction.js !!!
 */
// container.element.addEventListener('click', click, false);
// function click(event) {
//   if(globals.INTERSECTED.node != null) {
    
//     // console.log(globals.INTERSECTED.node);
    
//     globals.selected_node = globals.INTERSECTED.node;
//     document.querySelector("#nodeInfo").style.visibility = 'visible';
//     var ni = callbacks.node_intersects;
//     for (var cb in ni) {
//       if (typeof ni[cb] === 'function') {
//         ni[cb](globals.INTERSECTED.node);
//       }
//     }
//   }
// }

module.exports = {
  mouse: mouse,
  freeStyle: freeStyle,
  confineXYMovement: confineXYMovement
};
