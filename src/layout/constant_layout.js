var container = require("../core/init.js").container;
var defaults = require("../core/init.js").defaults;
var dims = require("../core/init.js").globals.graph_dims;
var globals = require("../core/init.js").globals;
var axes = require("../core/init.js").axes;

//tmp object to find indices
var nodes_obj_idx = {},
    edges_obj_idx = {};

globals.camera = new THREE.PerspectiveCamera( 
                      defaults.fov,
                      container.WIDTH / container.HEIGHT,
                      defaults.near, 
                      defaults.far
);

function renderGraph(graph) {
  // console.log(defaults.edge_color);
  // console.log(defaults.node_color);

  let nodes_obj = graph.getNodes();
  let und_edges = graph.getUndEdges();
  let dir_edges = graph.getDirEdges();
  
  dims.MIN_X = dims.MIN_Y = dims.MIN_Z = Number.POSITIVE_INFINITY;
  dims.MAX_X = dims.MAX_Y = dims.MAX_Z = Number.NEGATIVE_INFINITY;

  for(node in nodes_obj) {
    var x = nodes_obj[node].getFeature('coords').x;
    var y = nodes_obj[node].getFeature('coords').y;
    var z = nodes_obj[node].getFeature('coords').z;

    dims.MIN_X = Math.min(dims.MIN_X, x);
    dims.MIN_Y = Math.min(dims.MIN_Y, y);
    dims.MIN_Z = Math.min(dims.MIN_Z, z);

    dims.MAX_X = Math.max(dims.MAX_X, x);
    dims.MAX_Y = Math.max(dims.MAX_Y, y);
    dims.MAX_Z = Math.max(dims.MAX_Z, z);
  }
  dims.AVG_X = (dims.MAX_X - dims.MIN_X) / 2;
  dims.AVG_Y = (dims.MAX_Y - dims.MIN_Y) / 2;
  dims.AVG_Z = (dims.MAX_Z - dims.MIN_Z) / 2;

  globals.renderer.setSize(container.WIDTH, container.HEIGHT);
  globals.renderer.setClearColor(defaults.background_color, 1);

  var element = document.getElementById("main_vis");
  element.appendChild(globals.renderer.domElement);

  var i = 0;
  var vertices = new Float32Array(graph.nrNodes() * 3);
  var nodeColors = new Float32Array(graph.nrNodes() * 3);
  var nodeSizes = new Float32Array(graph.nrNodes());
  for(node in nodes_obj) {
    var x = nodes_obj[node].getFeature('coords').x;
    var y = nodes_obj[node].getFeature('coords').y;
    var z = nodes_obj[node].getFeature('coords').z;

    vertices[i*3] = x - dims.AVG_X;
    vertices[i*3 + 1] = y - dims.AVG_Y;
    vertices[i*3 + 2] = z - dims.AVG_Z;

    // Trying to set original color
    if ( nodes_obj[node].getFeature('color') ) {
      nodeColors[i*3] = nodes_obj[node].getFeature('color').r/256.0;
      nodeColors[i*3 + 1] = nodes_obj[node].getFeature('color').g/256.0;
      nodeColors[i*3 + 2] = nodes_obj[node].getFeature('color').b/256.0;
    }
    else {
      var j = i * 3;
      nodeColors[j++] = defaults.node_color.r/256.0;
      nodeColors[j++] = defaults.node_color.g/256.0;
      nodeColors[j++] = defaults.node_color.b/256.0;
    }

  
    nodeSizes[i] = 6;
    nodes_obj_idx[node]= i*3;
    i++;
  }

  var geometry = new THREE.BufferGeometry();
  geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.addAttribute('color', new THREE.BufferAttribute(nodeColors, 3));
  geometry.addAttribute('size', new THREE.BufferAttribute(nodeSizes, 1));


  var material = new THREE.PointsMaterial({
    vertexColors: THREE.VertexColors,
    size: defaults.node_size,
    map: defaults.texture,
    transparent: defaults.transparent,
    opacity: defaults.node_opacity
  });

  var particles = new THREE.Points(geometry, material);
  globals.network.add(particles);

  //EDGE
  var materialLine = new THREE.LineBasicMaterial({
    vertexColors: THREE.VertexColors,
    linewidth: defaults.edge_width,
    opacity: defaults.edge_opacity
  });

  [und_edges, dir_edges].forEach(function(edges) {
    var i = 0;
    var positionLine = new Float32Array(Object.keys(edges).length * 6); //2 vertices * 3 xyz
    var lineColors = new Float32Array(positionLine.length);
    for (var edge_index in edges) {
      var edge = edges[edge_index];
      var node_a_id = edge._node_a.getID();
      var node_b_id = edge._node_b.getID();

      positionLine[i * 6] = nodes_obj[node_a_id].getFeature('coords').x - dims.AVG_X;
      positionLine[i * 6 + 1] = nodes_obj[node_a_id].getFeature('coords').y - dims.AVG_Y;
      positionLine[i * 6 + 2] = nodes_obj[node_a_id].getFeature('coords').z - dims.AVG_Z;
      positionLine[i * 6 + 3] = nodes_obj[node_b_id].getFeature('coords').x - dims.AVG_X;
      positionLine[i * 6 + 4] = nodes_obj[node_b_id].getFeature('coords').y - dims.AVG_Y;
      positionLine[i * 6 + 5] = nodes_obj[node_b_id].getFeature('coords').z - dims.AVG_Z;

      if ( nodes_obj[node].getFeature('color') ) {
        lineColors[i * 6] = nodes_obj[node_a_id].getFeature('color').r/256.0;
        lineColors[i * 6 + 1] = nodes_obj[node_a_id].getFeature('color').g/256.0;
        lineColors[i * 6 + 2] = nodes_obj[node_a_id].getFeature('color').b/256.0;
        lineColors[i * 6 + 3] = nodes_obj[node_b_id].getFeature('color').r/256.0;
        lineColors[i * 6 + 4] = nodes_obj[node_b_id].getFeature('color').g/256.0;
        lineColors[i * 6 + 5] = nodes_obj[node_b_id].getFeature('color').b/256.0;
      }
      else {
        var j = i * 6;
        lineColors[j++] = defaults.edge_color.r/256.0;
        lineColors[j++] = defaults.edge_color.g/256.0;
        lineColors[j++] = defaults.edge_color.b/256.0;
        lineColors[j++] = defaults.edge_color.r/256.0;
        lineColors[j++] = defaults.edge_color.g/256.0;
        lineColors[j++] = defaults.edge_color.b/256.0;        
      }


      edges_obj_idx[edge_index] = i*6;
      i++;
    }

    var geometryLine = new THREE.BufferGeometry();
    geometryLine.addAttribute('position', new THREE.BufferAttribute(positionLine, 3));
    geometryLine.addAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    var line = new THREE.LineSegments(geometryLine, materialLine);
    globals.network.add(line);
  });

  globals.scene.add(globals.network);
  globals.camera.position.z = Math.max(dims.MAX_X, dims.MAX_Y);

  // Manually rotate the graph into the 'right' position / direction
  globals.network.rotateOnAxis(axes.axis_x, Math.PI);
  axes.axis_y.applyAxisAngle(axes.axis_x, -Math.PI);
}

module.exports = {
  renderGraph: renderGraph,
  nodes_obj_idx: nodes_obj_idx,
  edges_obj_idx: edges_obj_idx
};
