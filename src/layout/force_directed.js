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
    first_init = true,
    converged = false;

var nodes;
var bodies = [];
var body;
var coords;
var adj_list;

const SLOW_DOWN_FACTOR = 1e3;
const SPRING_CONST = 0.2;
const EPSILON = 0.1;

/**
 * 
 */
function fdLoop() {
  if(init_coords) {
    init();
  }
  if(!defaults.stop_fd) {    
    forceDirectedLayout();

    if(!converged) {
      window.requestAnimationFrame(fdLoop);
    }
  }

  // TODO check this out...
  else {
    init_coords = true;
  }
}


/**
 * @assumption window.graph is defined and an instance of Graphinius BaseGraph
 */
function init() {
  now = +new Date;

  // Let's get an adjacency list including incoming edges for spring calculation
  adj_list = graph.adjListDict(true);
  // console.log(adj_list);

  // reset bodies
  bodies = [];
  nodes = graph.getNodes();
  old_coordinates = new Float32Array(graph.nrNodes() * 3);
  var nodes = graph.getNodes();
      
  // BAD HACK!!!
  var diff_x = first_init ? dims.AVG_X : 0;
  var diff_y = first_init ? dims.AVG_Y : 0;
  var diff_z = first_init ? dims.AVG_Z : 0;

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
  gl_nodes = network.children[0].geometry.getAttribute('position').array;
  // console.log(gl_nodes);

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
    // calculate spring forces
    var spring_force = calculateSpringForces(body.id) || {x: 0, y: 0};

    body.velocity.x = ( body.force.x / SLOW_DOWN_FACTOR + spring_force.x );
    body.velocity.y = ( body.force.y / SLOW_DOWN_FACTOR + spring_force.y );

    if ( Math.abs(body.pos.x) < EPSILON || Math.abs(body.pos.y) < EPSILON ) {
      // converged = true;
    }

    body.pos.x += body.velocity.x;
    body.pos.y += body.velocity.y;

    // Set new position for graph node
    coords = nodes[body.id].getFeature('coords').x = body.pos.x;
    coords = nodes[body.id].getFeature('coords').y = body.pos.y;

    // Set new node position for WebGL
    var index = nodes_obj_idx[body.id];
    gl_nodes[index] = nodes[body.id].getFeature('coords').x;
    gl_nodes[index + 1] = nodes[body.id].getFeature('coords').y;
  });

  console.log(bodies[0].velocity.x);
  console.log(bodies[0].velocity.y);

  // console.log(bodies[0].velocity);

  // Set new edge positions for WebGL
  var undEdges = [ network.children[1].geometry.getAttribute('position').array,
                graph.getUndEdges()],
  dirEdges = [ network.children[2].geometry.getAttribute('position').array,
                graph.getDirEdges()];
                
  [undEdges, dirEdges].forEach(function(all_edges_of_a_node) {
    var i = 0;
    var gl_edges = all_edges_of_a_node[0];
    var edges = all_edges_of_a_node[1];
    for (var edge_index in edges) {
      var edge = edges[edge_index];
      var node_a_id = edge._node_a.getID();
      var node_b_id = edge._node_b.getID();

      gl_edges[i] = nodes[node_a_id].getFeature('coords').x;
      gl_edges[i + 1] = nodes[node_a_id].getFeature('coords').y;
      gl_edges[i + 3] = nodes[node_b_id].getFeature('coords').x;
      gl_edges[i + 4] = nodes[node_b_id].getFeature('coords').y;

      // if ( globals.TWO_D_MODE ) {
      //   gl_edges[i + 2] = 0;
      //   gl_edges[i + 5] = 0;
      // } else {
      //   gl_edges[i + 2] = nodes[node_a_id].getFeature('coords').z;
      //   gl_edges[i + 5] = nodes[node_b_id].getFeature('coords').z;
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


function calculateSpringForces(nodeID) {
  var force = {x: 0, y: 0},
      own_coords = nodes[nodeID].getFeature('coords'),
      n_coords = {x: 0, y: 0},
      x_diff = 0,
      y_diff = 0;
  
  for ( n_id in adj_list[nodeID] ) {
    // get coordinates of neighbor
    n_coords = nodes[n_id].getFeature('coords');
    x_diff = n_coords.x - own_coords.x;
    y_diff = n_coords.y - own_coords.y;
    force.x += x_diff * SPRING_CONST;
    force.y += y_diff * SPRING_CONST;
  }
  // console.log(force);
  return force;
  // return {x: 0, y: 0};
}


// custom body class
function NodeBody(x, y, id) {
  this.id = id;
  this.mass = 1;
  this.pos = {x: x, y: y};
  this.prevPos = {x: x, y: y};
  this.force = {x: x, y: y};
  this.velocity = {x: 0, y: 0}
}



//export
force.fdLoop = fdLoop;
force.fdStop = fdStop;