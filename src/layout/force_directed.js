var INIT = require("../core/init.js");
var defaults = INIT.defaults;
var globals = INIT.globals;
var network = globals.network;
var dims = globals.graph_dims;
var force = INIT.force_layout;
var update = require("../core/render.js").update;
var nodes_obj_idx = require("./constant_layout.js").nodes_obj_idx;

var now = null,
    init_coords = true,
    old_coordinates = null,
    random_components = null,
    first_init = true;

var nodes;
var bodies = [];
var body;
var coords;

const SLOW_DOWN_FACTOR = 1e3;


/**
 * 
 */
function fdLoop() {
  if(init_coords) {
    init();
  }
  if(!defaults.stop_fd) {    
    forceDirectedLayout();
    window.requestAnimationFrame(fdLoop);
  }

  // TODO check this out...
  else {
    init_coords = true;
  }
}


/**
 * 
 */
function init() {
  now = +new Date;
  // reset bodies
  bodies = [];
  nodes = graph.getNodes();
  old_coordinates = new Float32Array(graph.nrNodes() * 3);
  var nodes = graph.getNodes(),
      i = 0;
      
  // BAD HACK!!!
  var diff_x = first_init ? dims.AVG_X : 0;
  var diff_y = first_init ? dims.AVG_Y : 0;
  var diff_z = first_init ? dims.AVG_Z : 0;
  
  // Correct coordinates for viewport
  for(node in nodes_obj) {
    old_coordinates[i] = nodes[node].getFeature('coords').x - diff_x;
    old_coordinates[i + 1] = nodes[node].getFeature('coords').y - diff_y;
    old_coordinates[i + 2] = nodes[node].getFeature('coords').z - diff_z;
    i += 3;
  }

  // Create new bodies from graph nodes;
  for (var nodeID in nodes) {
    var coords = nodes[nodeID].getFeature('coords');
    bodies.push(new NodeBody(coords.x - diff_x, coords.y - diff_y, nodeID));
  }
  
  first_init = false;
  init_coords = false;
  defaults.stop_fd = false;
}


/**
 * 
 */
function forceDirectedLayout() {

  nodes = graph.getNodes();
  old_nodes = network.children[0].geometry.getAttribute('position').array;
  // console.log(old_nodes);

  // build quad tree:
  var createQuadTree = require('ngraph.quadtreebh');
  var quadTree = createQuadTree();

  // insert bodies into the quad tree 
  quadTree.insertBodies(bodies); // performance: O(n * log n)

  // calculate forces acting on each body in the tree O(n * log n):
  bodies.forEach(function(body) {
    quadTree.updateBodyForce(body);
  });

  // Update body position as well as node position
  bodies.forEach(function(body) {
    body.velocity.x += body.force.x / SLOW_DOWN_FACTOR;
    body.velocity.y += body.force.y / SLOW_DOWN_FACTOR;
    body.pos.x += body.velocity.x;
    body.pos.y += body.velocity.y;

    // Set new position for graph node
    coords = nodes[body.id].getFeature('coords').x = body.pos.x;
    coords = nodes[body.id].getFeature('coords').y = body.pos.y;

    // Set new node position for WebGL
    var index = nodes_obj_idx[body.id];
    old_nodes[index] = nodes[body.id].getFeature('coords').x;
    old_nodes[index + 1] = nodes[body.id].getFeature('coords').y;
  });

  // console.log(bodies[0].velocity);

  // Set new edge positions for WebGL
  var undEdges = [ network.children[1].geometry.getAttribute('position').array,
                graph.getUndEdges()],
  dirEdges = [ network.children[2].geometry.getAttribute('position').array,
                graph.getDirEdges()];
                
  [undEdges, dirEdges].forEach(function(all_edges_of_a_node) {
    var i = 0;
    var old_edges = all_edges_of_a_node[0];
    var edges = all_edges_of_a_node[1];
    for (var edge_index in edges) {
      var edge = edges[edge_index];
      var node_a_id = edge._node_a.getID();
      var node_b_id = edge._node_b.getID();

      old_edges[i] = nodes[node_a_id].getFeature('coords').x;
      old_edges[i + 1] = nodes[node_a_id].getFeature('coords').y;
      old_edges[i + 3] = nodes[node_b_id].getFeature('coords').x;
      old_edges[i + 4] = nodes[node_b_id].getFeature('coords').y;

      // if ( globals.TWO_D_MODE ) {
      //   old_edges[i + 2] = 0;
      //   old_edges[i + 5] = 0;
      // } else {
      //   old_edges[i + 2] = nodes[node_a_id].getFeature('coords').z;
      //   old_edges[i + 5] = nodes[node_b_id].getFeature('coords').z;
      // }
      i += 6;
    }
    
  });
  
  // Update WebGL matrix
  network.children[0].geometry.attributes.position.needsUpdate = true;
  network.children[1].geometry.attributes.position.needsUpdate = true;
  network.children[2].geometry.attributes.position.needsUpdate = true;
  window.requestAnimationFrame(update);
}

function fdStop() {
  defaults.stop_fd = true;
}

//export
force.fdLoop = fdLoop;
force.fdStop = fdStop;



// custom body class
function NodeBody(x, y, id) {
  this.id = id;
  this.mass = 1;
  this.pos = {x: x, y: y};
  this.prevPos = {x: x, y: y};
  this.force = {x: x, y: y};
  this.velocity = {x: 0, y: 0}
}