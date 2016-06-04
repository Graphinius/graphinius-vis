/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var init            = __webpack_require__(1),
	    render          = __webpack_require__(2),
	    mutate          = __webpack_require__(5),
	    hist_reader     = __webpack_require__(6),
	    main_loop       = __webpack_require__(7),
	    readCSV         = __webpack_require__(8),
	    readJSON        = __webpack_require__(9),
	    const_layout    = __webpack_require__(3),
	    force_layout    = __webpack_require__(10),
	    generic_layout  = __webpack_require__(11),
	    fullscreen      = __webpack_require__(12),
	    interaction     = __webpack_require__(13),
	    navigation      = __webpack_require__(14),
	    controlUI       = __webpack_require__(4);


	var out = typeof window !== 'undefined' ? window : global;

	out.$GV = {
	  core: {
	    init: init,
	    render: render,
	    mutate: mutate
	  },
	  history: {
	    reader: hist_reader,
	    loop: main_loop
	  },
	  input: {
	    csv: readCSV,
	    json: readJSON
	  },
	  layout: {
	    const: const_layout,
	    force: force_layout,
	    generic: generic_layout
	  },
	  view: {
	    fullscreen: fullscreen,
	    interaction: interaction,
	    navigation: navigation,
	    controlUI: controlUI
	  }
	};

	module.exports = {
	  $GV:	out.$GV
	};

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	window.$G = __webpack_require__(15).$G;

	var config = {
	  // keys for handling events
	  keys: {
	    KEY_A: 97,
	    KEY_D: 100,
	    KEY_W: 119,
	    KEY_S: 115,
	    KEY_R: 114,
	    KEY_F: 102,
	    KEY_X: 120,
	    KEY_Y: 121,
	    KEY_C: 99,
	    KEY_SX: 88,
	    KEY_SY: 89,
	    KEY_SC: 67
	  },
	  // default size of canvas/container
	  container: {
	    element: document.querySelector("#main_vis"),
	    WIDTH: 1200,
	    HEIGHT: 800
	  },
	  // default render parameters
	  defaults: {
	    node_size: 6,
	    background_color: 0x000000,
	    tranparent: true,
	    opacity: 0.5, //default is 1; range: 0.0 - 1.0
	    linewidth: 1,
	    
	    //camera settings
	    fov: 70,
	    near: 0.1,
	    far: 5000,
	    
	    //raycaster
	    highlight_node_color: new THREE.Color(0xf1ecfb),

	    //zoom
	    ZOOM_FACTOR: 0.05,
	    MAX_FOV: 100, //zoom out
	    MIN_FOV: 20, //zoom in

	    //distance to move
	    delta_distance: 10,
	    //rotation step
	    delta_rotation: 0.05,

	    //for coloring
	    randomColors: [
	      0xc4d0db, 0xf6b68a, 0xffff33, 0x003fff,
	      0xec2337, 0x008744, 0xffa700, 0x1df726,
	      0x8fd621, 0x2d049b, 0x873bd3, 0x85835f
	    ],
	    
	    //for bfs and dfs coloring
	    bfs_gradient_end_color: 0x901A43, // open todo red
	    bfs_gradient_middle_color: 0xfff730, // lemontiger yellow
	    bfs_gradient_start_color: 0x079207, // dark shit green
	    
	    //color for colorSingleEdge/Node, addEdge
	    edge_color: '#ff0000',
	    node_color: '#ff0000',
	    
	    //mouse wheel - firefox
	    //minus: firefox has different wheel direction
	    //chromium etc -> factor 120, firefox -> 3
	    firefox_wheel_factor: -40,
	    
	    //stop calculation of force directed layout
	    stop_fd: false
	  },
	  globals: {
	    mouse: new THREE.Vector2(),
	    graph_dims: {
	      MIN_X: 0,
	      MAX_X: 0,
	      AVG_X: 0,
	      MIN_Y: 0,
	      MAX_Y: 0,
	      AVG_Y: 0,
	      MIN_Z: 0,
	      MAX_Z: 0,
	      AVG_Z: 0
	    },
	    selected_node: null,
	    TWO_D_MODE: false,
	    INTERSECTED: {
	      index: 0, color: new THREE.Color(), node: null
	    },
	    raycaster: new THREE.Raycaster(),
	    renderer: new THREE.WebGLRenderer({antialias: false}),
	    scene: new THREE.Scene(),
	    network: new THREE.Group(),
	    camera: null
	  },
	  callbacks: {
	    node_intersects: []
	  },
	  force_layout: {
	    fdLoop: null,
	    fdStop: null,
	    magnitude: 2,
	    speed: 2
	  }
	};
	module.exports = config;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var container = __webpack_require__(1).container;
	var globals = __webpack_require__(1).globals;
	var constant = __webpack_require__(3);
	var controlUI = __webpack_require__(4);

	function renderGraph() {
	  var graph = graph || window.graph;
	  if(!graph) {
	    throw new Error("No graph object present, unable to render anything.");
	  }

	  if(!window.nodes_obj || !window.node_keys) {
	    window.nodes_obj = window.graph.getNodes();
	    window.node_keys = Object.keys(window.nodes_obj);
	    window.und_edges = window.graph.getUndEdges();
	    window.und_edges_keys = Object.keys(window.und_edges);
	    window.dir_edges = window.graph.getDirEdges();
	    window.dir_edges_keys = Object.keys(window.dir_edges);
	  }

	  constant.renderGraph(graph);
	  window.requestAnimationFrame(updateGraph);
	  controlUI.setDirectionUnchecked();
	  console.log("rendering graph...");
	}

	function updateGraph () {
	  globals.renderer.render(globals.scene, globals.camera);
	};

	module.exports = {
	    renderGraph: renderGraph,
	    update: updateGraph
	};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var container = __webpack_require__(1).container;
	var defaults = __webpack_require__(1).defaults;
	var dims = __webpack_require__(1).globals.graph_dims;
	var globals = __webpack_require__(1).globals;

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
	  dims.MIN_X = dims.MAX_X = nodes_obj[0].getFeature('coords').x;
	  dims.MIN_Y = dims.MAX_Y = nodes_obj[0].getFeature('coords').y;
	  dims.MIN_Z = dims.MAX_Z = nodes_obj[0].getFeature('coords').z;

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

	  var element = document.getElementById("containerGraph");
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
	    nodeColors[i*3] = nodes_obj[node].getFeature('color').r/256.0;
	    nodeColors[i*3 + 1] = nodes_obj[node].getFeature('color').g/256.0;
	    nodeColors[i*3 + 2] = nodes_obj[node].getFeature('color').b/256.0;

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
	    size: defaults.node_size
	  });

	  var particles = new THREE.Points(geometry, material);
	  globals.network.add(particles);

	  //EDGE
	  var materialLine = new THREE.LineBasicMaterial({
	    transparent : defaults.tranparent,
	    opacity: defaults.opacity,
	    vertexColors: THREE.VertexColors,
	    linewidth: defaults.linewidth
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

	      lineColors[i * 6] = nodes_obj[node_a_id].getFeature('color').r/256.0;
	      lineColors[i * 6 + 1] = nodes_obj[node_a_id].getFeature('color').g/256.0;
	      lineColors[i * 6 + 2] = nodes_obj[node_a_id].getFeature('color').b/256.0;
	      lineColors[i * 6 + 3] = nodes_obj[node_b_id].getFeature('color').r/256.0;
	      lineColors[i * 6 + 4] = nodes_obj[node_b_id].getFeature('color').g/256.0;
	      lineColors[i * 6 + 5] = nodes_obj[node_b_id].getFeature('color').b/256.0;

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
	}

	module.exports = {
	  renderGraph: renderGraph,
	  nodes_obj_idx: nodes_obj_idx,
	  edges_obj_idx: edges_obj_idx
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var force = __webpack_require__(1).force_layout;

	if(localStorage.getItem("directed") == 1) {
	  document.querySelector("#directed").checked = true;
	  document.querySelector("#undirected").checked = false;
	} 
	else {
	  document.querySelector("#directed").checked = false;
	  document.querySelector("#undirected").checked = true;
	}

	directed.onclick = function() {
	  localStorage.setItem("directed", Number(1));
	  window.location.reload();
	};

	undirected.onclick = function() {
	  localStorage.setItem("directed", Number(0));
	  window.location.reload();
	};

	function setDirectionUnchecked() {
	  document.querySelector("#directed").checked = false;
	  document.querySelector("#undirected").checked = false;
	}

	function startStopForce() {
	  //start force directed layout
	  if(!document.querySelector("#myonoffswitch").checked) {
	    document.querySelector("#updateAllNodesButton").style.visibility="hidden";
	    document.querySelector("#chosenHideNodeButton").style.visibility="hidden";
	    document.querySelector("#chosenUpdateNodeButton").style.visibility="hidden";
	    force.fdLoop();
	  }
	  //stop force directed layout
	  else {
	    document.querySelector("#updateAllNodesButton").style.visibility="visible";
	    document.querySelector("#chosenHideNodeButton").style.visibility="visible";
	    document.querySelector("#chosenUpdateNodeButton").style.visibility="visible";
	    force.fdStop();
	  }
	}

	document.querySelector("#force_magnitude").addEventListener('input', function(event) {
	  var mag = +document.querySelector("#force_magnitude").value;
	  force.magnitude = mag;
	  document.querySelector("#force_mag_display").innerHTML = mag;
	});

	document.querySelector("#force_speed").addEventListener('input', function(event) {
	  var speed = +document.querySelector("#force_speed").value;
	  force.speed = speed;
	  document.querySelector("#force_speed_display").innerHTML = speed;
	});

	module.exports = {
	  startStopForce: startStopForce,
	  setDirectionUnchecked: setDirectionUnchecked
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var network = __webpack_require__(1).globals.network;
	var update = __webpack_require__(2).update;
	var nodes_obj_idx = __webpack_require__(3).nodes_obj_idx;
	var edges_obj_idx = __webpack_require__(3).edges_obj_idx;
	var globals = __webpack_require__(1).globals;
	var dims = __webpack_require__(1).globals.graph_dims;
	var defaults = __webpack_require__(1).defaults;

	var segment_color_obj = {};

	//add node to graph but without edges
	function addNode(new_node) {
	  var old_nodes = network.children[0].geometry.getAttribute('position').array;
	  var old_colors = network.children[0].geometry.getAttribute('color').array;
	  var new_nodes = new Float32Array(old_nodes.length + 3);
	  var new_colors = new Float32Array(new_nodes.length);
	  var new_color = new THREE.Color(0xff7373);

	  for(var i = 0; i < old_nodes.length; i++) {
	    new_nodes[i] = old_nodes[i];
	    new_colors[i] = old_colors[i];
	  }

	  new_nodes[new_nodes.length - 3] = new_node.getFeature('coords').x;
	  new_nodes[new_nodes.length - 2] = new_node.getFeature('coords').y;
	  new_nodes[new_nodes.length - 1] = new_node.getFeature('coords').z;
	  new_colors[new_nodes.length - 3] = new_color.r;
	  new_colors[new_nodes.length - 2] = new_color.g;
	  new_colors[new_nodes.length - 1] = new_color.b;

	  if(globals.TWO_D_MODE) {
	    new_nodes[new_nodes.length - 1] = 0;
	  }

	  //index: last element of old_nodes array
	  nodes_obj_idx[new_node.getID()] = old_nodes.length;

	  network.children[0].geometry.addAttribute('position', new THREE.BufferAttribute(new_nodes, 3));
	  network.children[0].geometry.addAttribute('color', new THREE.BufferAttribute(new_colors, 3));
	  network.children[0].geometry.attributes.position.needsUpdate = true;
	  network.children[0].geometry.attributes.color.needsUpdate = true;
	  window.requestAnimationFrame(update);
	}

	function addRandomNodes() {
	  var x_ = Math.floor((Math.random() * dims.MAX_X) - dims.AVG_X),
	      y_ = Math.floor((Math.random() * dims.MAX_Y) - dims.AVG_Y),
	      z_ = Math.floor((Math.random() * dims.MAX_Z) - dims.AVG_Z),
	      idx = Object.keys(nodes_obj_idx).length;

	  if(globals.TWO_D_MODE) {
	    z_ = 0;
	  }

	  var new_node = graph.addNode(idx, {coords: {x: x_, y: y_, z:z_}});
	  addNode(new_node);
	}

	//remove node and their edges
	function hideNode(hide_node) {
	  //remove node
	  var node_id = hide_node.getID();
	  var index = nodes_obj_idx[node_id];

	  var old_nodes = network.children[0].geometry.getAttribute('position').array;
	  old_nodes[index] = NaN;
	  old_nodes[index + 1] = NaN;
	  old_nodes[index + 2] = NaN;

	  //remove edge - directed
	  var undEdges = [ network.children[1].geometry.getAttribute('position').array,
	                    hide_node.undEdges()];
	  //TODO - directed
	  var in_out_edges = {};
	  for (var e in hide_node.inEdges()) { in_out_edges[e] = hide_node.inEdges()[e]; }
	  for (var e in hide_node.outEdges()) { in_out_edges[e] = hide_node.outEdges()[e]; }
	  //----
	  var dirEdges = [ network.children[2].geometry.getAttribute('position').array,
	                    in_out_edges];

	  [undEdges, dirEdges].forEach(function(all_edges_of_a_node) {
	    var old_edges = all_edges_of_a_node[0];
	    var edges = all_edges_of_a_node[1];
	    for(var i = 0; i < Object.keys(edges).length; i++) {
	      var edge = edges[Object.keys(edges)[i]];

	      //update from-node
	      var edge_index = edges_obj_idx[edge.getID()];
	      old_edges[edge_index] = NaN;
	      old_edges[edge_index + 1] = NaN;
	      old_edges[edge_index + 2] = NaN;
	      old_edges[edge_index + 3] = NaN;
	      old_edges[edge_index + 4] = NaN;
	      old_edges[edge_index + 5] = NaN;
	    }
	  });

	  network.children[0].geometry.attributes.position.needsUpdate = true;
	  network.children[1].geometry.attributes.position.needsUpdate = true;
	  network.children[2].geometry.attributes.position.needsUpdate = true;
	  window.requestAnimationFrame(update);
	}

	function addEdge(edge) {
	  var index = 1;
	  if(edge._directed) {
	    index = 2;
	  }

	  var old_edges = network.children[index].geometry.getAttribute('position').array;
	  var old_colors = network.children[index].geometry.getAttribute('color').array;
	  var new_edges = new Float32Array(old_edges.length + 6); // 3 xyz-coordinate * 2 nodes
	  var new_colors = new Float32Array(old_colors.length + 6);
	  var new_color = new THREE.Color(defaults.edge_color);
	  for(var i = 0; i < old_edges.length; i++) {
	    new_edges[i] = old_edges[i];
	    new_colors[i] = old_colors[i];
	  }

	  new_edges[new_edges.length - 6] = edge._node_a.getFeature('coords').x;
	  new_edges[new_edges.length - 5] = edge._node_a.getFeature('coords').y;
	  new_edges[new_edges.length - 4] = edge._node_a.getFeature('coords').z;
	  new_edges[new_edges.length - 3] = edge._node_b.getFeature('coords').x;
	  new_edges[new_edges.length - 2] = edge._node_b.getFeature('coords').y;
	  new_edges[new_edges.length - 1] = edge._node_b.getFeature('coords').z;

	  new_colors[new_colors.length - 6] = new_color.r;
	  new_colors[new_colors.length - 5] = new_color.g;
	  new_colors[new_colors.length - 4] = new_color.b;
	  new_colors[new_colors.length - 3] = new_color.r;
	  new_colors[new_colors.length - 2] = new_color.g;
	  new_colors[new_colors.length - 1] = new_color.b;

	  //network.children[index].geometry.removeAttribute ('position');
	  network.children[index].geometry.addAttribute('position', new THREE.BufferAttribute(new_edges, 3));
	  network.children[index].geometry.addAttribute('color', new THREE.BufferAttribute(new_colors, 3));
	  network.children[index].geometry.attributes.position.needsUpdate = true;
	  network.children[index].geometry.attributes.color.needsUpdate = true;
	  window.requestAnimationFrame(update);
	}

	function colorSingleNode(node, hexColor) {
	  var newColor = new THREE.Color(hexColor || defaults.node_color);
	  var nodeColors = network.children[0].geometry.getAttribute('color').array;

	  var node_id = node.getID();
	  var index = nodes_obj_idx[node_id];
	  nodeColors[index] = newColor.r;
	  nodeColors[index + 1] = newColor.g;
	  nodeColors[index + 2] = newColor.b;

	  network.children[0].geometry.attributes.color.needsUpdate = true;
	}

	function colorAllNodes(hexColor) {
	  if(hexColor == 0) {
	    var randomIndex = Math.floor((Math.random() * defaults.randomColors.length));
	    hexColor = defaults.randomColors[randomIndex];
	  }

	  var newColor = new THREE.Color(hexColor);
	  var nodeColors = network.children[0].geometry.getAttribute('color').array;

	  for(var i = 0; i < nodeColors.length;) {
	    nodeColors[i] = newColor.r;
	    nodeColors[i + 1] = newColor.g;
	    nodeColors[i + 2] = newColor.b;
	    i += 3;
	  }
	  network.children[0].geometry.attributes.color.needsUpdate = true;
	  window.requestAnimationFrame(update);
	}

	function colorSingleEdge(edge, hex_color_node_a, hex_color_node_b) {
	  var new_color_a = new THREE.Color(hex_color_node_a || defaults.edge_color);
	  var new_color_b = new THREE.Color(hex_color_node_b || defaults.edge_color);

	  var index = 1;
	  if(edge._directed) {
	    index = 2;
	  }
	  var edge_colors = network.children[index].geometry.getAttribute('color').array;
	  var edge_id = edge.getID();
	  var idx = edges_obj_idx[edge_id];

	  edge_colors[idx] = new_color_a.r;
	  edge_colors[idx + 1] = new_color_a.g;
	  edge_colors[idx + 2] = new_color_a.b;
	  edge_colors[idx + 3] = new_color_b.r;
	  edge_colors[idx + 4] = new_color_b.g;
	  edge_colors[idx + 5] = new_color_b.b;

	  network.children[index].geometry.attributes.color.needsUpdate = true;
	}

	function colorAllEdges(hexColor) {
	  if(hexColor == 0) {
	    var randomIndex = Math.floor((Math.random() * defaults.randomColors.length));
	    hexColor = defaults.randomColors[randomIndex];
	  }

	  var newColor = new THREE.Color(hexColor);
	  var edgeColors1 = network.children[1].geometry.getAttribute('color').array;
	  var edgeColors2 = network.children[2].geometry.getAttribute('color').array;

	  [edgeColors1, edgeColors2].forEach(function(edgesColor) {
	    for(var i = 0; i < edgesColor.length;) {
	      edgesColor[i] = newColor.r;
	      edgesColor[i + 1] = newColor.g;
	      edgesColor[i + 2] = newColor.b;
	      i += 3;
	    }
	  });

	  network.children[1].geometry.attributes.color.needsUpdate = true;
	  network.children[2].geometry.attributes.color.needsUpdate = true;
	  window.requestAnimationFrame(update);
	}


	function colorBFS(node) {  
	  var root = node != null ? node : graph.getRandomNode();  
	  var result_object = $G.search.BFS(graph, root);
	  colorDistMap(result_object);
	}


	function colorBFSclick() {
	  console.log('Selected node:');
	  console.dir(globals.selected_node);
	  colorBFS(globals.selected_node);
	}


	function colorPFS(node) {
	  var root = node != null ? node : graph.getRandomNode();  
	  var result_object = $G.search.PFS(graph, root);
	  colorDistMap(result_object);
	}


	function colorPFSclick() {
	  console.log('Selected node:');
	  console.dir(globals.selected_node);
	  colorPFS(globals.selected_node);
	}


	//Hint: index = node id
	function colorDistMap(result_object) {
	  segment_color_obj = {};
	  var max_distance = 0,
	      additional_node = false,
	      infinity_node = false;
	      
	  for(index in result_object) {
	    if(result_object[index].distance !== Number.POSITIVE_INFINITY) {
	      max_distance = Math.max(max_distance, result_object[index].distance);
	    }
	  }

	  var start_color = new THREE.Color(defaults.bfs_gradient_start_color),
	      middle_color = new THREE.Color(defaults.bfs_gradient_middle_color),
	      end_color = new THREE.Color(defaults.bfs_gradient_end_color),
	      gradient = [],
	      firstColor = start_color,
	      secondColor = middle_color,
	      half = max_distance / 2;

	  for(var i = 0; i <= max_distance; i++) {
	    if(i > half) {
	      firstColor = middle_color;
	      secondColor = end_color;
	    }

	    var i_mod_half = (i % half) ? (i % half) : ((i-1) % half);
	    var newColor = new THREE.Color();
	    newColor.r = firstColor.r + (secondColor.r - firstColor.r) / half * i_mod_half;
	    newColor.g = firstColor.g + (secondColor.g - firstColor.g) / half * i_mod_half;
	    newColor.b = firstColor.b + (secondColor.b - firstColor.b) / half * i_mod_half;
	    gradient.push(newColor);
	  }

	  for(index in result_object) {
	    var hex_color = '#ffffff';
	    
	    if(result_object[index].distance !== Number.POSITIVE_INFINITY) {
	      if( (result_object[index].distance|0) < 0) {
	        throw new Error('Negative distances are not supported yet!');
	      }    
	      hex_color = gradient[(result_object[index].distance)|0].getHex();
	    }

	    colorSingleNode(graph.getNodeById(index), hex_color);
	    segment_color_obj[index] = hex_color;
	  }

	  [und_edges, dir_edges].forEach(function(edges) {
	    for(edge_index in edges) {
	      var edge = edges[edge_index];
	      var node_a_id = edge._node_a.getID();
	      var node_b_id = edge._node_b.getID();

	      if(segment_color_obj[node_a_id] !== 'undefined' &&
	         segment_color_obj[node_b_id] !== 'undefined') {
	        colorSingleEdge(edge, segment_color_obj[node_a_id], segment_color_obj[node_b_id]);
	      }
	    }
	  });
	  window.requestAnimationFrame(update);
	}


	//Hint: index = node id
	function colorDFS(node) {
	  segment_color_obj = {};
	  var start_node = graph.getRandomNode(),
	      colors = [];
	  if(node != null) {
	    start_node = node;
	  }
	  var dfs = $G.search.DFS(graph, start_node);
	  //console.log(dfs);

	  for (var i = 0; i < dfs.length; i++) {
	    var new_color = new THREE.Color();
	    new_color.r = Math.floor(Math.random() * 256) / 256.0;
	    new_color.g = Math.floor(Math.random() * 256) / 256.0;
	    new_color.b = Math.floor(Math.random() * 256) / 256.0;
	    colors.push(new_color.getHex());
	  }

	  //for constant layout
	  for(var i = 0; i < dfs.length; i++) {
	    for(index in dfs[i]) {
	      colorSingleNode(graph.getNodeById(index), colors[i]);
	      segment_color_obj[index] = colors[i];
	    }
	  }

	  [und_edges, dir_edges].forEach(function(edges) {
	    for(edge_index in edges) {
	    var edge = edges[edge_index];
	    var node_a_id = edge._node_a.getID();
	    var node_b_id = edge._node_b.getID();

	      if(segment_color_obj[node_a_id] !== 'undefined' &&
	         segment_color_obj[node_b_id] !== 'undefined') {
	        colorSingleEdge(edge, segment_color_obj[node_a_id], segment_color_obj[node_b_id]);
	      }
	    }
	  });
	  window.requestAnimationFrame(update);
	}

	function colorDFSclick() {
	  console.log('Selected node:');
	  console.dir(globals.selected_node);
	  colorDFS(globals.selected_node);
	}

	function hideNodeClick() {
	  hideNode(globals.selected_node);
	}

	function colorSingleNodeClick() {
	  var randomIndex = Math.floor((Math.random() * defaults.randomColors.length)),
	      hexColor = defaults.randomColors[randomIndex];
	  colorSingleNode(globals.selected_node, hexColor);
	  window.requestAnimationFrame(update);
	}

	module.exports = {
	  addNode: addNode,
	  addRandomNodes: addRandomNodes,
	  hideNode: hideNode,
	  hideNodeClick: hideNodeClick,
	  addEdge: addEdge,
	  colorSingleNode: colorSingleNode,
	  colorSingleNodeClick: colorSingleNodeClick,
	  colorAllNodes: colorAllNodes,
	  colorSingleEdge: colorSingleEdge,
	  colorAllEdges: colorAllEdges,
	  colorBFS: colorBFS,
	  colorDFS: colorDFS,
	  colorPFS: colorPFS,
	  colorBFSclick: colorBFSclick,
	  colorDFSclick: colorDFSclick,
	  colorPFSclick: colorPFSclick
	};


/***/ },
/* 6 */
/***/ function(module, exports) {

	

/***/ },
/* 7 */
/***/ function(module, exports) {

	
	/**
	 * delta t stuff
	 */

	function main_loop() {
	  /**
	   * Check for changes,
	   * - if none, do nothing
	   * - if changes, invoke reader and GO!
	   */

	  window.requestAnimationFrame(main_loop);
	}

	window.requestAnimationFrame(main_loop);


/***/ },
/* 8 */
/***/ function(module, exports) {

	

/***/ },
/* 9 */
/***/ function(module, exports) {

	function readJSON(event, explicit, direction, weighted_mode) {
	  var explicit = typeof explicit === 'undefined' ? false : explicit;
	  var direction = typeof direction === 'undefined' ? false : direction;
	  var weighted_mode = typeof weighted_mode === 'undefined' ? false : weighted_mode;
	  
	  if(document.querySelector('#undirected').checked) {
	    direction = false;
	  }
	  else {
	    direction = true;
	  }
	  
	  var json = new $G.input.JsonInput(explicit, direction, weighted_mode);

	  //checks if the browser supports the file API
	  if (!window.File && window.FileReader && window.FileList && window.Blob) {
	    alert("Browser does not support the File API.");
	  }

	  var files = document.getElementById('input').files;
	  if (!files.length) {
	    alert("No file selected.");
	    return;
	  }

	  //only json files
	  splitFileName = files[0].name.split(".");
	  if(!splitFileName.pop().match('json')) {
	    alert("Invalid file type - it must be a json file.");
	    return;
	  }
	  // -> only works in firefox - chrome has no file.type
	  /*if (!files[0].type.match('json')){
	    alert('Wrong file type.');
	    return;
	  }*/

	  var reader = new FileReader();
	  var result = null;

	  reader.onloadend = function(event){
	    if (event.target.readyState == FileReader.DONE) {
	      //console.log(event.target.result);
	      var parsedFile = JSON.parse(event.target.result);
	      window.graph = json.readFromJSON(parsedFile);

	      document.querySelector("#nodes").innerHTML = parsedFile.nodes;
	      document.querySelector("#edges").innerHTML = parsedFile.edges;
	      //document.querySelector("#time").innerHTML = parsedFile.edges;

	      result = parsedFile.data;
	    }
	  }
	  reader.readAsText(files[0]);

	  return result;
	};

	module.exports = {
	  readJSON: readJSON
	};


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	
	var INIT = __webpack_require__(1);
	var defaults = INIT.defaults;
	var globals = INIT.globals;
	var network = globals.network;
	var dims = globals.graph_dims;
	var force = INIT.force_layout;
	var update = __webpack_require__(2).update;
	var nodes_obj_idx = __webpack_require__(3).nodes_obj_idx;

	var now = null,
	    init_coords = true,
	    old_coordinates = null,
	    random_components = null,
	    first_init = true;

	function fdLoop() {
	  if(init_coords) {
	    init();
	  }
	  if(!defaults.stop_fd) {    
	    forceDirectedLayout();
	    window.requestAnimationFrame(fdLoop);
	  }
	  else {
	    init_coords = true;
	  }
	}

	function init() {
	  now = +new Date;
	  old_coordinates = new Float32Array(graph.nrNodes() * 3);
	  var node_obj = graph.getNodes(),
	      i = 0;
	      
	  // BAD HACK!!!
	  var diff_x = first_init ? dims.AVG_X : 0;
	  var diff_y = first_init ? dims.AVG_Y : 0;
	  var diff_z = first_init ? dims.AVG_Z : 0;
	  first_init = false;
	  
	  for(node in nodes_obj) {
	    old_coordinates[i] = node_obj[node].getFeature('coords').x - diff_x;
	    old_coordinates[i + 1] = node_obj[node].getFeature('coords').y - diff_y;
	    old_coordinates[i + 2] = node_obj[node].getFeature('coords').z - diff_z;
	    i += 3;
	  }
	  init_coords = false;
	  defaults.stop_fd = false;
	  
	  // Give every node some random movement component
	  random_components = new Float32Array(graph.nrNodes() * 3),
	  i = 0;
	  for(node in nodes_obj) {
	    random_components[i] = Math.random()*100-50;
	    random_components[i + 1] = Math.random()*100-50;
	    random_components[i + 2] = Math.random()*100-50;
	    i += 3;
	  }
	}

	function forceDirectedLayout() {
	  var time = (+new Date) - now,
	      node_obj = graph.getNodes(),
	      old_nodes = network.children[0].geometry.getAttribute('position').array;

	  for(node in node_obj) {
	    var index = nodes_obj_idx[node];
	    node_obj[node].getFeature('coords').x = old_coordinates[index] + Math.sin(time*force.speed/1000)*random_components[index]*force.magnitude;
	    node_obj[node].getFeature('coords').y = old_coordinates[index + 1] + Math.sin(time*force.speed/1000)*random_components[index+1]*force.magnitude;
	    node_obj[node].getFeature('coords').z = old_coordinates[index + 2] + Math.sin(time*force.speed/1000)*random_components[index+2]*force.magnitude;

	    old_nodes[index] = node_obj[node].getFeature('coords').x;
	    old_nodes[index + 1] = node_obj[node].getFeature('coords').y;
	    if ( globals.TWO_D_MODE ) {
	      old_nodes[index + 2] = 0;
	    } else {
	      old_nodes[index + 2] = node_obj[node].getFeature('coords').z;
	    }
	  }

	  var undEdges = [ network.children[1].geometry.getAttribute('position').array,
	                    graph.getUndEdges()],
	      dirEdges = [ network.children[2].geometry.getAttribute('position').array,
	                    graph.getDirEdges()];

	  //update edges
	  [undEdges, dirEdges].forEach(function(all_edges_of_a_node) {
	    var i = 0;
	    var old_edges = all_edges_of_a_node[0];
	    var edges = all_edges_of_a_node[1];
	    for (var edge_index in edges) {
	      var edge = edges[edge_index];
	      var node_a_id = edge._node_a.getID();
	      var node_b_id = edge._node_b.getID();

	      old_edges[i] = node_obj[node_a_id].getFeature('coords').x;
	      old_edges[i + 1] = node_obj[node_a_id].getFeature('coords').y;
	      old_edges[i + 3] = node_obj[node_b_id].getFeature('coords').x;
	      old_edges[i + 4] = node_obj[node_b_id].getFeature('coords').y;

	      if ( globals.TWO_D_MODE ) {
	        old_edges[i + 2] = 0;
	        old_edges[i + 5] = 0;
	      } else {
	        old_edges[i + 2] = node_obj[node_a_id].getFeature('coords').z;
	        old_edges[i + 5] = node_obj[node_b_id].getFeature('coords').z;
	      }
	      i += 6;
	    }
	  });

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


/***/ },
/* 11 */
/***/ function(module, exports) {

	

/***/ },
/* 12 */
/***/ function(module, exports) {

	var FSelem = {
	      el: null,
	      width: null,
	      height: null
	    };

	function switchToFullScreen(elem_string) {
	  var elem = document.querySelector(elem_string);
	  var canvas = document.querySelector(elem_string + " canvas");
	  console.log(canvas);
	  if (elem) {
	    FSelem = {
	      el: elem,
	      width: elem.clientWidth,
	      height: elem.clientHeight
	    }
	    // console.log(elem);
	    if (elem.requestFullscreen) {
	      elem.requestFullscreen();
	    } else if (elem.msRequestFullscreen) {
	      elem.msRequestFullscreen();
	    } else if (elem.mozRequestFullScreen) {
	      elem.mozRequestFullScreen();
	    } else if (elem.webkitRequestFullscreen) {
	      elem.webkitRequestFullscreen();
	    }
	    canvas.focus();
	  }
	  else {
	    alert("Element to full-screen does not exist...");
	  }
	}

	function FShandler( event ) {
	  var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
	  var fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled;
	  if ( fullscreenElement ) {
	      // console.log("fullscreen enabled!");
	      fullscreenElement.style.width = "100%";
	      fullscreenElement.style.height = "100%";
	  }
	  else {
	      // console.log("fullscreen disabled!");
	      // we can't get the element that WAS in fullscreen,
	      // so we fall back to a manual entry...
	      // console.log(FSelem);
	      FSelem.el.style.width = FSelem.width+"px";
	      FSelem.el.style.height = FSelem.height+"px";
	  }
	}

	function setAndUpdateNrMutilate() {
	  var val = document.querySelector("#nr_mutilate_per_frame").value;
	  document.querySelector("#nr_mutilate_per_frame_val").innerHTML = val;
	  window.$GV.setNrMutilate(val);
	}

	document.addEventListener("fullscreenchange", FShandler);
	document.addEventListener("webkitfullscreenchange", FShandler);
	document.addEventListener("mozfullscreenchange", FShandler);
	document.addEventListener("MSFullscreenChange", FShandler);


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var network = __webpack_require__(1).globals.network;
	var update = __webpack_require__(2).update;
	var nodes_obj_idx = __webpack_require__(3).nodes_obj_idx;
	var edges_obj_idx = __webpack_require__(3).edges_obj_idx;
	var dims = __webpack_require__(1).globals.graph_dims;
	var mouse = __webpack_require__(1).globals.mouse;
	var defaults = __webpack_require__(1).defaults;
	var globals = __webpack_require__(1).globals;

	//update node and edge position
	function updateNodePosition(update_node) {

	  var node_id = update_node.getID();
	  var index = nodes_obj_idx[node_id];

	  //update nodes
	  var old_nodes = network.children[0].geometry.getAttribute('position').array;
	  old_nodes[index] = update_node.getFeature('coords').x;
	  old_nodes[index + 1] = update_node.getFeature('coords').y;
	  old_nodes[index + 2] = update_node.getFeature('coords').z;

	  if(globals.TWO_D_MODE) {
	    old_nodes[index + 2] = 0;
	  }
	  network.children[0].geometry.attributes.position.needsUpdate = true;

	  //update edges
	  var undEdges = [network.children[1].geometry.getAttribute('position').array,
	                    update_node.undEdges()];
	  //TODO - directed
	  var in_out_edges = {};
	  for (var e in update_node.inEdges()) { in_out_edges[e] = update_node.inEdges()[e]; }
	  for (var e in update_node.outEdges()) { in_out_edges[e] = update_node.outEdges()[e]; }
	  //----
	  var dirEdges = [network.children[2].geometry.getAttribute('position').array,
	                    in_out_edges];

	  [undEdges, dirEdges].forEach(function(all_edges_of_a_node) {
	    var old_edges = all_edges_of_a_node[0];
	    var edges = all_edges_of_a_node[1];
	    for(var i = 0; i < Object.keys(edges).length; i++) {
	      var edge = edges[Object.keys(edges)[i]];

	      //update from-node
	      var edge_index = edges_obj_idx[edge.getID()];
	      if(edge._node_a === update_node) {
	        old_edges[edge_index] = update_node.getFeature('coords').x;
	        old_edges[edge_index + 1] = update_node.getFeature('coords').y;
	        old_edges[edge_index + 2] = update_node.getFeature('coords').z;
	      }
	      //update to-node
	      else if(edge._node_b === update_node) {
	        old_edges[edge_index + 3] = update_node.getFeature('coords').x;
	        old_edges[edge_index + 4] = update_node.getFeature('coords').y;
	        old_edges[edge_index + 5] = update_node.getFeature('coords').z;
	      }

	      if(globals.TWO_D_MODE) {
	        old_edges[index + 2] = 0;
	        old_edges[index + 5] = 0;
	      }
	    }
	  });

	  network.children[1].geometry.attributes.position.needsUpdate = true;
	  network.children[2].geometry.attributes.position.needsUpdate = true;
	  window.requestAnimationFrame(update);
	}

	function updateAll() {
	  window.old_coordinates = new Float32Array(graph.nrNodes() * 3);
	  var node_obj = graph.getNodes();
	  var i = 0;
	  for(node in nodes_obj) {
	    old_coordinates[i] = node_obj[node].getFeature('coords').x;
	    old_coordinates[i + 1] = node_obj[node].getFeature('coords').y;
	    old_coordinates[i + 2] = node_obj[node].getFeature('coords').z;
	    if(globals.TWO_D_MODE) {
	      old_coordinates[i + 2] = 0;
	    }
	    i += 3;
	  }
	  window.cnt = 0;
	  requestAnimationFrame(updateRandomPostions);
	}

	function updateRandomPostions() {
	  //update node
	  var node_obj = graph.getNodes();
	  var old_nodes = network.children[0].geometry.getAttribute('position').array;

	  for(node in node_obj) {
	    var index = nodes_obj_idx[node];
	    node_obj[node].getFeature('coords').x = old_coordinates[index] + Math.random() * 20 - 10 - dims.AVG_X;
	    node_obj[node].getFeature('coords').y = old_coordinates[index + 1] + Math.random() * 20 - 10 - dims.AVG_Y;
	    node_obj[node].getFeature('coords').z = old_coordinates[index + 2] + Math.random() * 20 - 10 - dims.AVG_Z;
	    if(globals.TWO_D_MODE) {
	      node_obj[node].getFeature('coords').z = 0;
	    }

	    old_nodes[index] = node_obj[node].getFeature('coords').x;
	    old_nodes[index + 1] = node_obj[node].getFeature('coords').y;
	    old_nodes[index + 2] = node_obj[node].getFeature('coords').z;
	  }

	  var undEdges = [ network.children[1].geometry.getAttribute('position').array,
	                    graph.getUndEdges()];
	  var dirEdges = [ network.children[2].geometry.getAttribute('position').array,
	                    graph.getDirEdges()];

	  //update edges
	  [undEdges, dirEdges].forEach(function(all_edges_of_a_node) {
	    var i = 0;
	    var old_edges = all_edges_of_a_node[0];
	    var edges = all_edges_of_a_node[1];
	    for (var edge_index in edges) {
	      var edge = edges[edge_index];
	      var node_a_id = edge._node_a.getID();
	      var node_b_id = edge._node_b.getID();

	      old_edges[i] = node_obj[node_a_id].getFeature('coords').x;
	      old_edges[i + 1] = node_obj[node_a_id].getFeature('coords').y;
	      old_edges[i + 2] = node_obj[node_a_id].getFeature('coords').z;
	      old_edges[i + 3] = node_obj[node_b_id].getFeature('coords').x;
	      old_edges[i + 4] = node_obj[node_b_id].getFeature('coords').y;
	      old_edges[i + 5] = node_obj[node_b_id].getFeature('coords').z;
	      i += 6;
	    }
	  });

	  network.children[0].geometry.attributes.position.needsUpdate = true;
	  network.children[1].geometry.attributes.position.needsUpdate = true;
	  network.children[2].geometry.attributes.position.needsUpdate = true;
	  window.requestAnimationFrame(update);

	  if(window.cnt++ < 100) {
	    requestAnimationFrame(updateRandomPostions);
	  }
	  //set nodes/edges to original coordinates
	  else {
	    //set coordinates of nodes
	    var i = 0;
	    for(node in node_obj) {
	      var index = nodes_obj_idx[node];
	      node_obj[node].getFeature('coords').x = window.old_coordinates[i];
	      node_obj[node].getFeature('coords').y = window.old_coordinates[i + 1];
	      node_obj[node].getFeature('coords').z = window.old_coordinates[i + 2];
	      i += 3;

	      old_nodes[index] = node_obj[node].getFeature('coords').x - dims.AVG_X;
	      old_nodes[index + 1] = node_obj[node].getFeature('coords').y - dims.AVG_Y;
	      old_nodes[index + 2] = node_obj[node].getFeature('coords').z - dims.AVG_Z;
	      if(globals.TWO_D_MODE) {
	        old_nodes[index + 2] = 0;
	      }
	    }
	    //set coordinates of edges
	    [undEdges, dirEdges].forEach(function(all_edges_of_a_node) {
	      var i = 0;
	      var old_edges = all_edges_of_a_node[0];
	      var edges = all_edges_of_a_node[1];
	      for (var edge_index in edges) {
	        var edge = edges[edge_index];
	        var node_a_id = edge._node_a.getID();
	        var node_b_id = edge._node_b.getID();

	        old_edges[i] = node_obj[node_a_id].getFeature('coords').x - dims.AVG_X;
	        old_edges[i + 1] = node_obj[node_a_id].getFeature('coords').y - dims.AVG_Y;
	        old_edges[i + 2] = node_obj[node_a_id].getFeature('coords').z - dims.AVG_Z;
	        old_edges[i + 3] = node_obj[node_b_id].getFeature('coords').x - dims.AVG_X;
	        old_edges[i + 4] = node_obj[node_b_id].getFeature('coords').y - dims.AVG_Y;
	        old_edges[i + 5] = node_obj[node_b_id].getFeature('coords').z - dims.AVG_Z;
	        if(globals.TWO_D_MODE) {
	          old_edges[i + 2] = 0;
	          old_edges[i + 5] = 0;
	        }
	        i += 6;
	      }
	    });

	    network.children[0].geometry.attributes.position.needsUpdate = true;
	    network.children[1].geometry.attributes.position.needsUpdate = true;
	    network.children[2].geometry.attributes.position.needsUpdate = true;
	    window.requestAnimationFrame(update);
	  }
	}

	function switchTo2D() {
	  globals.TWO_D_MODE = true;
	  var nodes_array = network.children[0].geometry.attributes.position.array,
	      undEdges_array = network.children[1].geometry.attributes.position.array,
	      dirEdges_array = network.children[2].geometry.attributes.position.array;

	  [nodes_array, undEdges_array, dirEdges_array].forEach(function(array) {
	    for(var i = 0; i < array.length;) {
	      array[i + 2] = 0;
	      i+=3;
	    }
	  });

	  network.children[0].geometry.attributes.position.needsUpdate = true;
	  network.children[1].geometry.attributes.position.needsUpdate = true;
	  network.children[2].geometry.attributes.position.needsUpdate = true;
	  window.requestAnimationFrame(update);
	}

	function switchTo3D() {
	  globals.TWO_D_MODE = false;

	  var i = 0;
	  var array = network.children[0].geometry.attributes.position.array;
	  for(node in nodes_obj) {
	    var z = nodes_obj[node].getFeature('coords').z;
	    array[i + 2] = z;
	    i+=3;
	  }

	  i = 0;
	  array = network.children[1].geometry.attributes.position.array;
	  for (var edge_index in und_edges) {
	    var edge = und_edges[edge_index];
	    var node_a_id = edge._node_a.getID();
	    var node_b_id = edge._node_b.getID();

	    array[i + 2] = nodes_obj[node_a_id].getFeature('coords').z;
	    array[i + 5] = nodes_obj[node_b_id].getFeature('coords').z;
	    i += 6;
	  }

	  i = 0;
	  array = network.children[2].geometry.attributes.position.array;
	  for (var edge_index in dir_edges) {
	    var edge = dir_edges[edge_index];
	    var node_a_id = edge._node_a.getID();
	    var node_b_id = edge._node_b.getID();

	    array[i + 2] = nodes_obj[node_a_id].getFeature('coords').z;
	    array[i + 5] = nodes_obj[node_b_id].getFeature('coords').z;
	    i += 6;
	  }

	  network.children[0].geometry.attributes.position.needsUpdate = true;
	  network.children[1].geometry.attributes.position.needsUpdate = true;
	  network.children[2].geometry.attributes.position.needsUpdate = true;
	  window.requestAnimationFrame(update);
	}

	function nodeIntersection() {
	  var attributes = network.children[0].geometry.attributes;
	  globals.raycaster.setFromCamera(mouse, globals.camera);
	  globals.raycaster.params.Points.threshold = 1;

	  var particlesToIntersect = [];
	  particlesToIntersect.push(network.children[0]);
	  var intersects = globals.raycaster.intersectObjects(particlesToIntersect);

	  if(intersects.length > 0 && intersects[0].index != globals.INTERSECTED.index) {
	    //set previous node
	    attributes.color.array[globals.INTERSECTED.index*3] = globals.INTERSECTED.color.r;
	    attributes.color.array[globals.INTERSECTED.index*3 + 1] = globals.INTERSECTED.color.g;
	    attributes.color.array[globals.INTERSECTED.index*3 + 2] = globals.INTERSECTED.color.b;

	    globals.INTERSECTED.index = intersects[0].index;
	    globals.INTERSECTED.color.setRGB(
	      attributes.color.array[intersects[0].index*3],
	      attributes.color.array[intersects[0].index*3 + 1],
	      attributes.color.array[intersects[0].index*3 + 2]
	    );

	    //set new node
	    attributes.color.array[intersects[0].index*3] = defaults.highlight_node_color.r;
	    attributes.color.array[intersects[0].index*3 + 1] = defaults.highlight_node_color.g;
	    attributes.color.array[intersects[0].index*3 + 2] = defaults.highlight_node_color.b;
	    attributes.color.needsUpdate = true;

	    //TODO resize node
	    //attributes.size.array[intersects[0].index] = 20;
	    //attributes.size.needsUpdate = true;

	    //get key by index
	    var nodeID = Object.keys(nodes_obj_idx)[intersects[0].index];
	    globals.INTERSECTED.node = window.graph.getNodeById(nodeID);

	    //Hint: update is called in navigation
	    //window.requestAnimationFrame(update);
	  }
	}

	function updateNodePositionClick() {
	  globals.selected_node._features.coords.x = Math.floor((Math.random() * dims.MAX_X) - dims.AVG_X);
	  globals.selected_node._features.coords.y = Math.floor((Math.random() * dims.MAX_Y) - dims.AVG_Y);
	  globals.selected_node._features.coords.z = Math.floor((Math.random() * dims.MAX_Z) - dims.AVG_Z);

	  updateNodePosition(globals.selected_node);
	}

	function changeNodeSize(size) {
	  if(!document.querySelector("#myonoffswitch").checked) {
	    globals.rendererForceDirectedGraph.forEachNode(function (nodeUI) {
	      nodeUI.size = size;
	    });
	  }
	}

	module.exports = {
	    updateNodePosition: updateNodePosition,
	    updateAll: updateAll,
	    updateNodePositionClick: updateNodePositionClick,
	    switchTo2D: switchTo2D,
	    switchTo3D: switchTo3D,
	    nodeIntersection: nodeIntersection,
	    changeNodeSize: changeNodeSize
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var keys = __webpack_require__(1).keys;
	var globals = __webpack_require__(1).globals;
	var defaults = __webpack_require__(1).defaults;
	var update = __webpack_require__(2).update;
	var network = __webpack_require__(1).globals.network;
	var container = __webpack_require__(1).container;
	var mouse = __webpack_require__(1).globals.mouse;
	var nodeIntersection = __webpack_require__(13).nodeIntersection;
	var callbacks = __webpack_require__(1).callbacks;

	// for testing purposes
	var intersect_cb1 = function(node) {
	  document.querySelector("#nodeID").innerHTML = node._id;
	};
	callbacks.node_intersects.push(intersect_cb1);

	//rotation
	var axis_x = new THREE.Vector3( 1, 0, 0 ),
	    axis_y = new THREE.Vector3( 0, 1, 0 ),
	    axis_z = new THREE.Vector3( 0, 0, 1 );

	window.addEventListener('keypress', key, false);
	function key(event) {
	  switch (event.charCode) {
	    case keys.KEY_W: //zoom in
	      globals.camera.position.y = globals.camera.position.y - defaults.delta_distance; break;
	    case keys.KEY_S: //zoom out
	      globals.camera.position.y = globals.camera.position.y + defaults.delta_distance; break;
	    case keys.KEY_A: //move left
	      globals.camera.position.x = globals.camera.position.x + defaults.delta_distance; break;
	    case keys.KEY_D: //move right
	      globals.camera.position.x = globals.camera.position.x - defaults.delta_distance; break;
	    case keys.KEY_R:
	      network.translateZ(defaults.delta_distance); break;
	    case keys.KEY_F:
	      network.translateZ(-defaults.delta_distance); break;

	    case keys.KEY_X:
	      network.rotateOnAxis(axis_x, defaults.delta_rotation);
	      axis_y.applyAxisAngle(axis_x, -defaults.delta_rotation);
	      break;
	    case keys.KEY_SX:
	      network.rotateOnAxis(axis_x, -defaults.delta_rotation);
	      axis_y.applyAxisAngle(axis_x, defaults.delta_rotation);
	      break;
	    case keys.KEY_Y:
	      network.rotateOnAxis(axis_y, defaults.delta_rotation);
	      axis_x.applyAxisAngle(axis_y, -defaults.delta_rotation);
	      break;
	    case keys.KEY_SY:
	      network.rotateOnAxis(axis_y, -defaults.delta_rotation);
	      axis_x.applyAxisAngle(axis_y, defaults.delta_rotation);
	      break;
	    case keys.KEY_C:
	      network.rotateOnAxis(axis_z, defaults.delta_rotation);
	      axis_x.applyAxisAngle(axis_z, -defaults.delta_rotation);
	      axis_y.applyAxisAngle(axis_z, -defaults.delta_rotation);
	      break;
	    case keys.KEY_SC:
	      network.rotateOnAxis(axis_z, -defaults.delta_rotation);
	      axis_x.applyAxisAngle(axis_z, defaults.delta_rotation);
	      axis_y.applyAxisAngle(axis_z, defaults.delta_rotation);
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
	      network.rotateOnAxis(axis_y, -defaults.delta_rotation);
	      axis_x.applyAxisAngle(axis_y, defaults.delta_rotation);
	    }
	    else {
	      network.rotateOnAxis(axis_y, defaults.delta_rotation);
	      axis_x.applyAxisAngle(axis_y, -defaults.delta_rotation);
	    }
	  }
	  else {
	    globals.camera.fov -= defaults.ZOOM_FACTOR * delta;
	    globals.camera.fov = Math.max( Math.min( globals.camera.fov, defaults.MAX_FOV ), defaults.MIN_FOV );
	    globals.camera.projectionMatrix = new THREE.Matrix4().makePerspective(globals.camera.fov, container.WIDTH / container.HEIGHT, globals.camera.near, globals.camera.far);
	  }
	  window.requestAnimationFrame(update);
	}


	container.element.addEventListener('mousemove', mouseMove, false);
	function mouseMove(event) {

	  if(event.shiftKey && event.buttons == 1) {
	    if(event.movementX > 0) {
	      network.rotateOnAxis(axis_z, defaults.delta_rotation);
	      axis_x.applyAxisAngle(axis_z, -defaults.delta_rotation);
	      axis_y.applyAxisAngle(axis_z, -defaults.delta_rotation);
	    }
	    else if(event.movementX < 0) {
	      network.rotateOnAxis(axis_z, -defaults.delta_rotation);
	      axis_x.applyAxisAngle(axis_z, defaults.delta_rotation);
	      axis_y.applyAxisAngle(axis_z, defaults.delta_rotation);
	    }
	    else if(event.movementY > 0) {
	      network.rotateOnAxis(axis_x, defaults.delta_rotation);
	      axis_y.applyAxisAngle(axis_x, -defaults.delta_rotation);
	    }
	    else if(event.movementY < 0) {
	      network.rotateOnAxis(axis_x, -defaults.delta_rotation);
	      axis_y.applyAxisAngle(axis_x, defaults.delta_rotation);
	    }
	  }
	  //left mouse button
	  else if(event.buttons == 1) {
	    var mouseX = event.clientX / container.WIDTH;
	    var mouseY = event.clientY / container.HEIGHT;

	    var rest = (container.WIDTH/2) - (globals.graph_dims.MAX_X/2);
	    var max_x = globals.graph_dims.MAX_X;
	    var max_y = globals.graph_dims.MAX_Y;

	    if(globals.camera.position.x > max_x) {
	      globals.camera.position.x = max_x;
	    }
	    else if(globals.camera.position.x < -max_x) {
	      globals.camera.position.x = -max_x;
	    }
	    else if(globals.camera.position.y > max_y) {
	      globals.camera.position.y = max_y;
	    }
	    else if(globals.camera.position.y < -max_y) {
	      globals.camera.position.y = -max_y;
	    }

	    //movement in y: up is negative, down is positive
	    globals.camera.position.x = globals.camera.position.x - (mouseX * event.movementX);
	    globals.camera.position.y = globals.camera.position.y + (mouseY * event.movementY);
	  }

	  //raycaster
	  // calculate mouse position in normalized device coordinates
	  // (-1 to +1) for both components
	  event.preventDefault();
	  var element = document.querySelector('#containerGraph');
	  var rect = element.getBoundingClientRect();
	  mouse.x = ((event.clientX - rect.left) / container.WIDTH) * 2 - 1;
	  mouse.y = - ((event.clientY - rect.top) / container.HEIGHT) * 2 + 1;
	  //intersect after init grap
	  if(network.children[0] != null) {
	    window.requestAnimationFrame(nodeIntersection);
	  }
	  window.requestAnimationFrame(update);
	}


	container.element.addEventListener('click', click, false);
	function click(event) {
	  if(globals.INTERSECTED.node != null) {
	    
	    console.log(globals.INTERSECTED.node);
	    
	    globals.selected_node = globals.INTERSECTED.node;
	    document.querySelector("#nodeInfo").style.visibility = 'visible';
	    var ni = callbacks.node_intersects;
	    for (var cb in ni) {
	      if (typeof ni[cb] === 'function') {
	        ni[cb](globals.INTERSECTED.node);
	      }
	    }
	  }
	}

	module.exports = {
	  mouse: mouse
	};


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var Edges			= __webpack_require__(16);
	var Nodes 		= __webpack_require__(17);
	var Graph 		= __webpack_require__(19);
	var CsvInput 	= __webpack_require__(20);
	var JsonInput = __webpack_require__(62);
	var BFS				= __webpack_require__(63);
	var DFS				= __webpack_require__(65);
	var PFS       = __webpack_require__(66);

	// TODO:
	// Encapsulate ALL functions within Graph for
	// easier access and less import / new ceremony ??

	var out = typeof window !== 'undefined' ? window : global;

	/**
	 * For Browser window object
	 */
	out.$G = {
		core: {
			Edge 				: Edges.BaseEdge,
			Node 				: Nodes.BaseNode,
			Graph 			: Graph.BaseGraph,
			GraphMode		: Graph.GraphMode
		},
		input: {
			CsvInput 		: CsvInput.CSVInput,
			JsonInput 	: JsonInput.JSONInput
		},
		search: {
			BFS													   : BFS.BFS,
	    prepareBFSStandardConfig       : BFS.prepareBFSStandardConfig,
			DFS 												   : DFS.DFS,
			DFSVisit										   : DFS.DFSVisit,
			prepareDFSStandardConfig			 : DFS.prepareDFSStandardConfig,
			prepareDFSVisitStandardConfig	 : DFS.prepareDFSVisitStandardConfig,
	    PFS                            : PFS.PFS,
	    preparePFSStandardConfig       : PFS.preparePFSStandardConfig
		}
	};

	/**
	 * For NodeJS / CommonJS global object
	 */
	module.exports = {
		$G : out.$G
	};

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 16 */
/***/ function(module, exports) {

	"use strict";
	var BaseEdge = (function () {
	    function BaseEdge(_id, _node_a, _node_b, options) {
	        this._id = _id;
	        this._node_a = _node_a;
	        this._node_b = _node_b;
	        options = options || {};
	        this._directed = options.directed || false;
	        this._weighted = options.weighted || false;
	        // @NOTE isNaN and Number.isNaN confusion...
	        this._weight = this._weighted ? (isNaN(options.weight) ? 1 : options.weight) : undefined;
	        this._label = options.label || this._id;
	    }
	    BaseEdge.prototype.getID = function () {
	        return this._id;
	    };
	    BaseEdge.prototype.getLabel = function () {
	        return this._label;
	    };
	    BaseEdge.prototype.setLabel = function (label) {
	        this._label = label;
	    };
	    BaseEdge.prototype.isDirected = function () {
	        return this._directed;
	    };
	    BaseEdge.prototype.isWeighted = function () {
	        return this._weighted;
	    };
	    BaseEdge.prototype.getWeight = function () {
	        return this._weight;
	    };
	    BaseEdge.prototype.setWeight = function (w) {
	        if (!this._weighted) {
	            throw new Error("Cannot set weight on unweighted edge.");
	        }
	        this._weight = w;
	    };
	    BaseEdge.prototype.getNodes = function () {
	        return { a: this._node_a, b: this._node_b };
	    };
	    return BaseEdge;
	}());
	exports.BaseEdge = BaseEdge;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../../typings/tsd.d.ts" />
	"use strict";
	var $DS = __webpack_require__(18);
	var BaseNode = (function () {
	    function BaseNode(_id, features) {
	        this._id = _id;
	        /**
	         * degrees - let's hold them separate in order
	         * to avoid Object.keys(...)
	         */
	        this._in_degree = 0;
	        this._out_degree = 0;
	        this._und_degree = 0;
	        this._in_edges = {};
	        this._out_edges = {};
	        this._und_edges = {};
	        this._features = typeof features !== 'undefined' ? $DS.clone(features) : {};
	        this._label = this._features["label"] || this._id;
	    }
	    BaseNode.prototype.getID = function () {
	        return this._id;
	    };
	    BaseNode.prototype.getLabel = function () {
	        return this._label;
	    };
	    BaseNode.prototype.setLabel = function (label) {
	        this._label = label;
	    };
	    BaseNode.prototype.getFeatures = function () {
	        return this._features;
	    };
	    BaseNode.prototype.getFeature = function (key) {
	        return this._features[key];
	        // if ( !feat ) {
	        // 	throw new Error("Cannot retrieve non-existing feature.");
	        // }
	        // return feat;
	    };
	    BaseNode.prototype.setFeatures = function (features) {
	        this._features = $DS.clone(features);
	    };
	    BaseNode.prototype.setFeature = function (key, value) {
	        this._features[key] = value;
	    };
	    BaseNode.prototype.deleteFeature = function (key) {
	        var feat = this._features[key];
	        // if ( !feat ) {
	        // 	throw new Error("Cannot delete non-existing feature.");
	        // }
	        delete this._features[key];
	        return feat;
	    };
	    BaseNode.prototype.clearFeatures = function () {
	        this._features = {};
	    };
	    BaseNode.prototype.inDegree = function () {
	        return this._in_degree;
	    };
	    BaseNode.prototype.outDegree = function () {
	        return this._out_degree;
	    };
	    BaseNode.prototype.degree = function () {
	        return this._und_degree;
	    };
	    /**
	     * We have to:
	     * 1. throw an error if the edge is already attached
	     * 2. add it to the edge array
	     * 3. check type of edge (directed / undirected)
	     * 4. update our degrees accordingly
	     * This is a design decision we can defend by pointing out
	     * that querying degrees will occur much more often
	     * than modifying the edge structure of a node (??)
	     * One further point: do we also check for duplicate
	     * edges not in the sense of duplicate ID's but duplicate
	     * structure (nodes, direction) ?
	     * => Not for now, as we would have to check every edge
	     * instead of simply checking the hash id...
	     * ALTHOUGH: adding edges will (presumably) not occur often...
	     */
	    BaseNode.prototype.addEdge = function (edge) {
	        // is this edge connected to us at all?
	        var nodes = edge.getNodes();
	        if (nodes.a !== this && nodes.b !== this) {
	            throw new Error("Cannot add edge that does not connect to this node");
	        }
	        var edge_id = edge.getID();
	        // Is it an undirected or directed edge?
	        if (edge.isDirected()) {
	            // is it outgoing or incoming?
	            if (nodes.a === this && !this._out_edges[edge_id]) {
	                this._out_edges[edge_id] = edge;
	                this._out_degree += 1;
	                // Is the edge also connecting to ourselves -> loop ?
	                if (nodes.b === this && !this._in_edges[edge_id]) {
	                    this._in_edges[edge.getID()] = edge;
	                    this._in_degree += 1;
	                }
	            }
	            else if (!this._in_edges[edge_id]) {
	                this._in_edges[edge.getID()] = edge;
	                this._in_degree += 1;
	            }
	        }
	        else {
	            // Is the edge also connecting to ourselves -> loop
	            if (this._und_edges[edge.getID()]) {
	                throw new Error("Cannot add same undirected edge multiple times.");
	            }
	            this._und_edges[edge.getID()] = edge;
	            this._und_degree += 1;
	        }
	    };
	    BaseNode.prototype.hasEdge = function (edge) {
	        return !!this._in_edges[edge.getID()] || !!this._out_edges[edge.getID()] || !!this._und_edges[edge.getID()];
	    };
	    BaseNode.prototype.hasEdgeID = function (id) {
	        return !!this._in_edges[id] || !!this._out_edges[id] || !!this._und_edges[id];
	    };
	    BaseNode.prototype.getEdge = function (id) {
	        var edge = this._in_edges[id] || this._out_edges[id] || this._und_edges[id];
	        if (!edge) {
	            throw new Error("Cannot retrieve non-existing edge.");
	        }
	        return edge;
	    };
	    BaseNode.prototype.inEdges = function () {
	        return this._in_edges;
	    };
	    BaseNode.prototype.outEdges = function () {
	        return this._out_edges;
	    };
	    BaseNode.prototype.undEdges = function () {
	        return this._und_edges;
	    };
	    BaseNode.prototype.dirEdges = function () {
	        return $DS.mergeObjects([this._in_edges, this._out_edges]);
	    };
	    BaseNode.prototype.allEdges = function () {
	        return $DS.mergeObjects([this._in_edges, this._out_edges, this._und_edges]);
	    };
	    BaseNode.prototype.removeEdge = function (edge) {
	        if (!this.hasEdge(edge)) {
	            throw new Error("Cannot remove unconnected edge.");
	        }
	        var id = edge.getID();
	        var e = this._und_edges[id];
	        if (e) {
	            delete this._und_edges[id];
	            this._und_degree -= 1;
	        }
	        e = this._in_edges[id];
	        if (e) {
	            delete this._in_edges[id];
	            this._in_degree -= 1;
	        }
	        e = this._out_edges[id];
	        if (e) {
	            delete this._out_edges[id];
	            this._out_degree -= 1;
	        }
	    };
	    BaseNode.prototype.removeEdgeID = function (id) {
	        if (!this.hasEdgeID(id)) {
	            throw new Error("Cannot remove unconnected edge.");
	        }
	        var e = this._und_edges[id];
	        if (e) {
	            delete this._und_edges[id];
	            this._und_degree -= 1;
	        }
	        e = this._in_edges[id];
	        if (e) {
	            delete this._in_edges[id];
	            this._in_degree -= 1;
	        }
	        e = this._out_edges[id];
	        if (e) {
	            delete this._out_edges[id];
	            this._out_degree -= 1;
	        }
	    };
	    BaseNode.prototype.clearOutEdges = function () {
	        this._out_edges = {};
	        this._out_degree = 0;
	    };
	    BaseNode.prototype.clearInEdges = function () {
	        this._in_edges = {};
	        this._in_degree = 0;
	    };
	    BaseNode.prototype.clearUndEdges = function () {
	        this._und_edges = {};
	        this._und_degree = 0;
	    };
	    BaseNode.prototype.clearEdges = function () {
	        this.clearInEdges();
	        this.clearOutEdges();
	        this.clearUndEdges();
	    };
	    BaseNode.prototype.prevNodes = function () {
	        var prevs = [];
	        var key, edge;
	        for (key in this._in_edges) {
	            if (this._in_edges.hasOwnProperty(key)) {
	                edge = this._in_edges[key];
	                prevs.push({
	                    node: edge.getNodes().a,
	                    edge: edge
	                });
	            }
	        }
	        return prevs;
	    };
	    BaseNode.prototype.nextNodes = function () {
	        var nexts = [];
	        var key, edge;
	        for (key in this._out_edges) {
	            if (this._out_edges.hasOwnProperty(key)) {
	                edge = this._out_edges[key];
	                nexts.push({
	                    node: edge.getNodes().b,
	                    edge: edge
	                });
	            }
	        }
	        return nexts;
	    };
	    BaseNode.prototype.connNodes = function () {
	        var conns = [];
	        var key, edge;
	        for (key in this._und_edges) {
	            if (this._und_edges.hasOwnProperty(key)) {
	                edge = this._und_edges[key];
	                var nodes = edge.getNodes();
	                if (nodes.a === this) {
	                    conns.push({
	                        node: edge.getNodes().b,
	                        edge: edge
	                    });
	                }
	                else {
	                    conns.push({
	                        node: edge.getNodes().a,
	                        edge: edge
	                    });
	                }
	            }
	        }
	        return conns;
	    };
	    /**
	     *
	     * @param identityFunc can be used to remove 'duplicates' from resulting array,
	     * if necessary
	     * @returns {Array}
	     *
	   */
	    BaseNode.prototype.reachNodes = function (identityFunc) {
	        var identity = 0;
	        // console.log(this.nextNodes());
	        return $DS.mergeArrays([this.nextNodes(), this.connNodes()], identityFunc || function (ne) { return identity++; });
	    };
	    return BaseNode;
	}());
	exports.BaseNode = BaseNode;


/***/ },
/* 18 */
/***/ function(module, exports) {

	"use strict";
	/**
	 * Method to deep clone an object
	 *
	 * @param obj
	 * @returns {*}
	 *
	 */
	function clone(obj) {
	    if (obj === null || typeof obj !== 'object') {
	        return obj;
	    }
	    var cloneObj = obj.constructor();
	    for (var attribute in obj) {
	        if (typeof obj[attribute] === "object") {
	            cloneObj[attribute] = clone(obj[attribute]);
	        }
	        else {
	            cloneObj[attribute] = obj[attribute];
	        }
	    }
	    return cloneObj;
	}
	exports.clone = clone;
	/**
	 * @args an Array of any kind of objects
	 * @cb callback to return a unique identifier;
	 * if this is duplicate, the object will not be stored in result.
	 * @returns {Array}
	 */
	function mergeArrays(args, cb) {
	    if (cb === void 0) { cb = undefined; }
	    for (var arg_idx in args) {
	        if (!Array.isArray(args[arg_idx])) {
	            throw new Error('Will only mergeArrays arrays');
	        }
	    }
	    var seen = {}, result = [], identity;
	    for (var i = 0; i < args.length; i++) {
	        for (var j = 0; j < args[i].length; j++) {
	            identity = typeof cb !== 'undefined' ? cb(args[i][j]) : args[i][j];
	            if (seen[identity] !== true) {
	                result.push(args[i][j]);
	                seen[identity] = true;
	            }
	        }
	    }
	    return result;
	}
	exports.mergeArrays = mergeArrays;
	/**
	 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
	 * @param args Array of all the object to take keys from
	 * @returns result object
	 */
	function mergeObjects(args) {
	    for (var i = 0; i < args.length; i++) {
	        if (Object.prototype.toString.call(args[i]) !== '[object Object]') {
	            throw new Error('Will only take objects as inputs');
	        }
	    }
	    var result = {};
	    for (var i = 0; i < args.length; i++) {
	        for (var key in args[i]) {
	            if (args[i].hasOwnProperty(key)) {
	                result[key] = args[i][key];
	            }
	        }
	    }
	    return result;
	}
	exports.mergeObjects = mergeObjects;
	/**
	 * @TODO Test !!!
	 *
	 * @param object
	 * @param cb
	 */
	function findKey(obj, cb) {
	    for (var key in obj) {
	        if (obj.hasOwnProperty(key) && cb(obj[key])) {
	            return key;
	        }
	    }
	    return undefined;
	}
	exports.findKey = findKey;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../../typings/tsd.d.ts" />
	"use strict";
	var $N = __webpack_require__(17);
	var $E = __webpack_require__(16);
	var $DS = __webpack_require__(18);
	(function (GraphMode) {
	    GraphMode[GraphMode["INIT"] = 0] = "INIT";
	    GraphMode[GraphMode["DIRECTED"] = 1] = "DIRECTED";
	    GraphMode[GraphMode["UNDIRECTED"] = 2] = "UNDIRECTED";
	    GraphMode[GraphMode["MIXED"] = 3] = "MIXED";
	})(exports.GraphMode || (exports.GraphMode = {}));
	var GraphMode = exports.GraphMode;
	var BaseGraph = (function () {
	    // protected _typed_nodes: { [type: string] : { [key: string] : $N.IBaseNode } };
	    // protected _typed_dir_edges: { [type: string] : { [key: string] : $E.IBaseEdge } };
	    // protected _typed_und_edges: { [type: string] : { [key: string] : $E.IBaseEdge } };
	    function BaseGraph(_label) {
	        this._label = _label;
	        this._nr_nodes = 0;
	        this._nr_dir_edges = 0;
	        this._nr_und_edges = 0;
	        this._mode = GraphMode.INIT;
	        this._nodes = {};
	        this._dir_edges = {};
	        this._und_edges = {};
	    }
	    BaseGraph.prototype.getMode = function () {
	        return this._mode;
	    };
	    BaseGraph.prototype.getStats = function () {
	        return {
	            mode: this._mode,
	            nr_nodes: this._nr_nodes,
	            nr_und_edges: this._nr_und_edges,
	            nr_dir_edges: this._nr_dir_edges
	        };
	    };
	    /**
	     * We assume graphs in which no node has higher total degree than 65536
	     */
	    BaseGraph.prototype.degreeDistribution = function () {
	        var max_deg = 0, key, node, all_deg;
	        for (key in this._nodes) {
	            node = this._nodes[key];
	            all_deg = node.inDegree() + node.outDegree() + node.degree() + 1;
	            max_deg = all_deg > max_deg ? all_deg : max_deg;
	        }
	        var deg_dist = {
	            in: new Uint16Array(max_deg),
	            out: new Uint16Array(max_deg),
	            dir: new Uint16Array(max_deg),
	            und: new Uint16Array(max_deg),
	            all: new Uint16Array(max_deg)
	        };
	        for (key in this._nodes) {
	            node = this._nodes[key];
	            deg_dist.in[node.inDegree()]++;
	            deg_dist.out[node.outDegree()]++;
	            deg_dist.dir[node.inDegree() + node.outDegree()]++;
	            deg_dist.und[node.degree()]++;
	            deg_dist.all[node.inDegree() + node.outDegree() + node.degree()]++;
	        }
	        // console.dir(deg_dist);
	        return deg_dist;
	    };
	    BaseGraph.prototype.nrNodes = function () {
	        return this._nr_nodes;
	    };
	    BaseGraph.prototype.nrDirEdges = function () {
	        return this._nr_dir_edges;
	    };
	    BaseGraph.prototype.nrUndEdges = function () {
	        return this._nr_und_edges;
	    };
	    BaseGraph.prototype.addNode = function (id, opts) {
	        var node = new $N.BaseNode(id, opts);
	        this._nodes[node.getID()] = node;
	        this._nr_nodes += 1;
	        return node;
	    };
	    BaseGraph.prototype.hasNodeID = function (id) {
	        return !!this._nodes[id];
	    };
	    /**
	     * Use hasNodeLabel with CAUTION ->
	     * it has LINEAR runtime in the graph's #nodes
	     */
	    BaseGraph.prototype.hasNodeLabel = function (label) {
	        return !!$DS.findKey(this._nodes, function (node) {
	            return node.getLabel() === label;
	        });
	    };
	    BaseGraph.prototype.getNodeById = function (id) {
	        return this._nodes[id];
	    };
	    /**
	     * Use getNodeByLabel with CAUTION ->
	     * it has LINEAR runtime in the graph's #nodes
	     */
	    BaseGraph.prototype.getNodeByLabel = function (label) {
	        var id = $DS.findKey(this._nodes, function (node) {
	            return node.getLabel() === label;
	        });
	        return this._nodes[id];
	    };
	    BaseGraph.prototype.getNodes = function () {
	        return this._nodes;
	    };
	    /**
	     * CAUTION - This function takes linear time in # nodes
	     */
	    BaseGraph.prototype.getRandomNode = function () {
	        return this.pickRandomProperty(this._nodes);
	    };
	    BaseGraph.prototype.deleteNode = function (node) {
	        var rem_node = this._nodes[node.getID()];
	        if (!rem_node) {
	            throw new Error('Cannot remove un-added node.');
	        }
	        // Edges?
	        var in_deg = node.inDegree();
	        var out_deg = node.outDegree();
	        var deg = node.degree();
	        // Delete all edges brutally...
	        if (in_deg) {
	            this.deleteInEdgesOf(node);
	        }
	        if (out_deg) {
	            this.deleteOutEdgesOf(node);
	        }
	        if (deg) {
	            this.deleteUndEdgesOf(node);
	        }
	        delete this._nodes[node.getID()];
	        this._nr_nodes -= 1;
	    };
	    BaseGraph.prototype.hasEdgeID = function (id) {
	        return !!this._dir_edges[id] || !!this._und_edges[id];
	    };
	    /**
	     * Use hasEdgeLabel with CAUTION ->
	     * it has LINEAR runtime in the graph's #edges
	     */
	    BaseGraph.prototype.hasEdgeLabel = function (label) {
	        var dir_id = $DS.findKey(this._dir_edges, function (edge) {
	            return edge.getLabel() === label;
	        });
	        var und_id = $DS.findKey(this._und_edges, function (edge) {
	            return edge.getLabel() === label;
	        });
	        return !!dir_id || !!und_id;
	    };
	    BaseGraph.prototype.getEdgeById = function (id) {
	        var edge = this._dir_edges[id] || this._und_edges[id];
	        if (!edge) {
	            throw new Error("cannot retrieve edge with non-existing ID.");
	        }
	        return edge;
	    };
	    /**
	     * Use hasEdgeLabel with CAUTION ->
	     * it has LINEAR runtime in the graph's #edges
	     */
	    BaseGraph.prototype.getEdgeByLabel = function (label) {
	        var dir_id = $DS.findKey(this._dir_edges, function (edge) {
	            return edge.getLabel() === label;
	        });
	        var und_id = $DS.findKey(this._und_edges, function (edge) {
	            return edge.getLabel() === label;
	        });
	        var edge = this._dir_edges[dir_id] || this._und_edges[und_id];
	        if (!edge) {
	            throw new Error("cannot retrieve edge with non-existing Label.");
	        }
	        return edge;
	    };
	    BaseGraph.prototype.getDirEdges = function () {
	        return this._dir_edges;
	    };
	    BaseGraph.prototype.getUndEdges = function () {
	        return this._und_edges;
	    };
	    BaseGraph.prototype.addEdgeByNodeIDs = function (label, node_a_id, node_b_id, opts) {
	        var node_a = this.getNodeById(node_a_id), node_b = this.getNodeById(node_b_id);
	        if (!node_a) {
	            throw new Error("Cannot add edge. Node A does not exist");
	        }
	        else if (!node_b) {
	            throw new Error("Cannot add edge. Node B does not exist");
	        }
	        else {
	            return this.addEdge(label, node_a, node_b, opts);
	        }
	    };
	    BaseGraph.prototype.addEdge = function (id, node_a, node_b, opts) {
	        var edge = new $E.BaseEdge(id, node_a, node_b, opts || {});
	        // connect edge to first node anyways			
	        node_a.addEdge(edge);
	        if (edge.isDirected()) {
	            // add edge to second node too
	            node_b.addEdge(edge);
	            this._dir_edges[edge.getID()] = edge;
	            this._nr_dir_edges += 1;
	            this.updateGraphMode();
	        }
	        else {
	            // add edge to both nodes, except they are the same...
	            if (node_a !== node_b) {
	                node_b.addEdge(edge);
	            }
	            this._und_edges[edge.getID()] = edge;
	            this._nr_und_edges += 1;
	            this.updateGraphMode();
	        }
	        return edge;
	    };
	    BaseGraph.prototype.deleteEdge = function (edge) {
	        var dir_edge = this._dir_edges[edge.getID()];
	        var und_edge = this._und_edges[edge.getID()];
	        if (!dir_edge && !und_edge) {
	            throw new Error('cannot remove non-existing edge.');
	        }
	        var nodes = edge.getNodes();
	        nodes.a.removeEdge(edge);
	        if (nodes.a !== nodes.b) {
	            nodes.b.removeEdge(edge);
	        }
	        if (dir_edge) {
	            delete this._dir_edges[edge.getID()];
	            this._nr_dir_edges -= 1;
	        }
	        else {
	            delete this._und_edges[edge.getID()];
	            this._nr_und_edges -= 1;
	        }
	        this.updateGraphMode();
	    };
	    // Some atomicity / rollback feature would be nice here...
	    BaseGraph.prototype.deleteInEdgesOf = function (node) {
	        this.checkConnectedNodeOrThrow(node);
	        var in_edges = node.inEdges();
	        var key, edge;
	        for (key in in_edges) {
	            edge = in_edges[key];
	            edge.getNodes().a.removeEdge(edge);
	            delete this._dir_edges[edge.getID()];
	            this._nr_dir_edges -= 1;
	        }
	        node.clearInEdges();
	        this.updateGraphMode();
	    };
	    // Some atomicity / rollback feature would be nice here...
	    BaseGraph.prototype.deleteOutEdgesOf = function (node) {
	        this.checkConnectedNodeOrThrow(node);
	        var out_edges = node.outEdges();
	        var key, edge;
	        for (key in out_edges) {
	            edge = out_edges[key];
	            edge.getNodes().b.removeEdge(edge);
	            delete this._dir_edges[edge.getID()];
	            this._nr_dir_edges -= 1;
	        }
	        node.clearOutEdges();
	        this.updateGraphMode();
	    };
	    // Some atomicity / rollback feature would be nice here...
	    BaseGraph.prototype.deleteDirEdgesOf = function (node) {
	        this.deleteInEdgesOf(node);
	        this.deleteOutEdgesOf(node);
	    };
	    // Some atomicity / rollback feature would be nice here...
	    BaseGraph.prototype.deleteUndEdgesOf = function (node) {
	        this.checkConnectedNodeOrThrow(node);
	        var und_edges = node.undEdges();
	        var key, edge;
	        for (key in und_edges) {
	            edge = und_edges[key];
	            var conns = edge.getNodes();
	            conns.a.removeEdge(edge);
	            if (conns.a !== conns.b) {
	                conns.b.removeEdge(edge);
	            }
	            delete this._und_edges[edge.getID()];
	            this._nr_und_edges -= 1;
	        }
	        node.clearUndEdges();
	        this.updateGraphMode();
	    };
	    // Some atomicity / rollback feature would be nice here...
	    BaseGraph.prototype.deleteAllEdgesOf = function (node) {
	        this.deleteDirEdgesOf(node);
	        this.deleteUndEdgesOf(node);
	    };
	    /**
	     * Remove all the (un)directed edges in the graph
	     */
	    BaseGraph.prototype.clearAllDirEdges = function () {
	        for (var edge in this._dir_edges) {
	            this.deleteEdge(this._dir_edges[edge]);
	        }
	    };
	    BaseGraph.prototype.clearAllUndEdges = function () {
	        for (var edge in this._und_edges) {
	            this.deleteEdge(this._und_edges[edge]);
	        }
	    };
	    BaseGraph.prototype.clearAllEdges = function () {
	        this.clearAllDirEdges();
	        this.clearAllUndEdges();
	    };
	    /**
	     * Simple edge generator:
	     * Go through all node combinations, and
	     * add an (un)directed edge with
	     * @param probability and
	     * @direction true or false
	     * CAUTION: this algorithm takes quadratic runtime in #nodes
	     */
	    BaseGraph.prototype.createRandomEdgesProb = function (probability, directed) {
	        if (0 > probability || 1 < probability) {
	            throw new Error("Probability out of range.");
	        }
	        directed = directed || false;
	        var nodes = this._nodes, node_a, node_b, edge_id, dir = directed ? '_d' : '_u';
	        for (node_a in nodes) {
	            for (node_b in nodes) {
	                if (node_a !== node_b && Math.random() < probability) {
	                    edge_id = nodes[node_a].getID() + "_" + nodes[node_b].getID() + dir;
	                    this.addEdge(edge_id, nodes[node_a], nodes[node_b], { directed: directed });
	                }
	            }
	        }
	    };
	    /**
	     * Simple edge generator:
	     * Go through all nodes, and
	     * add [min, max] (un)directed edges to
	     * a randomly chosen node
	     * CAUTION: this algorithm could take quadratic runtime in #nodes
	     * but should be much faster
	     */
	    BaseGraph.prototype.createRandomEdgesSpan = function (min, max, directed) {
	        if (min < 0) {
	            throw new Error('Minimum degree cannot be negative.');
	        }
	        if (max >= this.nrNodes()) {
	            throw new Error('Maximum degree exceeds number of reachable nodes.');
	        }
	        directed = directed || false;
	        // Do we need to set them integers before the calculations?
	        var min = min | 0, max = max | 0, nodes = this._nodes, idx_a, node_a, node_b, edge_id, node_keys = Object.keys(nodes), keys_len = node_keys.length, rand_idx, rand_deg, dir = directed ? '_d' : '_u';
	        for (idx_a in nodes) {
	            node_a = nodes[idx_a];
	            rand_idx = 0;
	            rand_deg = (Math.random() * max + min) | 0;
	            while (rand_deg) {
	                rand_idx = (keys_len * Math.random()) | 0; // should never reach keys_len...
	                node_b = nodes[node_keys[rand_idx]];
	                if (node_a !== node_b) {
	                    edge_id = node_a.getID() + "_" + node_b.getID() + dir;
	                    if (node_a.hasEdgeID(edge_id)) {
	                        continue;
	                    }
	                    this.addEdge(edge_id, node_a, node_b, { directed: directed });
	                    --rand_deg;
	                }
	            }
	        }
	    };
	    /**
	     * CAUTION - This function is linear in # directed edges
	     */
	    BaseGraph.prototype.getRandomDirEdge = function () {
	        return this.pickRandomProperty(this._dir_edges);
	    };
	    /**
	     * CAUTION - This function is linear in # undirected edges
	     */
	    BaseGraph.prototype.getRandomUndEdge = function () {
	        return this.pickRandomProperty(this._und_edges);
	    };
	    BaseGraph.prototype.checkConnectedNodeOrThrow = function (node) {
	        var node = this._nodes[node.getID()];
	        if (!node) {
	            throw new Error('Cowardly refusing to delete edges of un-added node.');
	        }
	    };
	    BaseGraph.prototype.updateGraphMode = function () {
	        var nr_dir = this._nr_dir_edges, nr_und = this._nr_und_edges;
	        if (nr_dir && nr_und) {
	            this._mode = GraphMode.MIXED;
	        }
	        else if (nr_dir) {
	            this._mode = GraphMode.DIRECTED;
	        }
	        else if (nr_und) {
	            this._mode = GraphMode.UNDIRECTED;
	        }
	        else {
	            this._mode = GraphMode.INIT;
	        }
	    };
	    BaseGraph.prototype.pickRandomProperty = function (obj) {
	        var key;
	        var count = 0;
	        for (var prop in obj) {
	            if (obj.hasOwnProperty(prop) && Math.random() < 1 / ++count) {
	                key = prop;
	            }
	        }
	        return obj[key];
	    };
	    return BaseGraph;
	}());
	exports.BaseGraph = BaseGraph;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../../typings/tsd.d.ts" />
	"use strict";
	var path = __webpack_require__(21);
	var fs = __webpack_require__(23);
	var $G = __webpack_require__(19);
	var $R = __webpack_require__(24);
	var CSVInput = (function () {
	    function CSVInput(_separator, _explicit_direction, _direction_mode) {
	        if (_separator === void 0) { _separator = ','; }
	        if (_explicit_direction === void 0) { _explicit_direction = true; }
	        if (_direction_mode === void 0) { _direction_mode = false; }
	        this._separator = _separator;
	        this._explicit_direction = _explicit_direction;
	        this._direction_mode = _direction_mode;
	    }
	    CSVInput.prototype.readFromAdjacencyListURL = function (fileurl, cb) {
	        this.readGraphFromURL(fileurl, cb, this.readFromAdjacencyList);
	    };
	    CSVInput.prototype.readFromEdgeListURL = function (fileurl, cb) {
	        this.readGraphFromURL(fileurl, cb, this.readFromEdgeList);
	    };
	    CSVInput.prototype.readGraphFromURL = function (fileurl, cb, localFun) {
	        var self = this, graph_name = path.basename(fileurl), graph, request;
	        // Node or browser ??
	        if (typeof window !== 'undefined') {
	            // Browser...
	            request = new XMLHttpRequest();
	            request.onreadystatechange = function () {
	                if (request.readyState == 4 && request.status == 200) {
	                    var input = request.responseText.split('\n');
	                    graph = localFun.apply(self, [input, graph_name]);
	                    cb(graph, undefined);
	                }
	            };
	            request.open("GET", fileurl, true);
	            request.setRequestHeader('Content-Type', 'text/csv; charset=ISO-8859-1');
	            request.send();
	        }
	        else {
	            // Node.js
	            $R.retrieveRemoteFile(fileurl, function (raw_graph) {
	                var input = raw_graph.toString().split('\n');
	                graph = localFun.apply(self, [input, graph_name]);
	                cb(graph, undefined);
	            });
	        }
	    };
	    CSVInput.prototype.readFromAdjacencyListFile = function (filepath) {
	        return this.readFileAndReturn(filepath, this.readFromAdjacencyList);
	    };
	    CSVInput.prototype.readFromEdgeListFile = function (filepath) {
	        return this.readFileAndReturn(filepath, this.readFromEdgeList);
	    };
	    CSVInput.prototype.readFileAndReturn = function (filepath, func) {
	        this.checkNodeEnvironment();
	        var graph_name = path.basename(filepath);
	        var input = fs.readFileSync(filepath).toString().split('\n');
	        return func.apply(this, [input, graph_name]);
	    };
	    CSVInput.prototype.readFromAdjacencyList = function (input, graph_name) {
	        var graph = new $G.BaseGraph(graph_name);
	        for (var idx in input) {
	            var line = input[idx], elements = this._separator.match(/\s+/g) ? line.match(/\S+/g) : line.replace(/\s+/g, '').split(this._separator), node_id = elements[0], node, edge_array = elements.slice(1), edge, target_node_id, target_node, dir_char, directed, edge_id, edge_id_u2;
	            if (!node_id) {
	                // end of file or empty line, just treat like an empty line...
	                continue;
	            }
	            node = graph.hasNodeID(node_id) ? graph.getNodeById(node_id) : graph.addNode(node_id);
	            for (var e = 0; e < edge_array.length;) {
	                if (this._explicit_direction && (!edge_array || edge_array.length % 2)) {
	                    throw new Error('Every edge entry has to contain its direction info in explicit mode.');
	                }
	                target_node_id = edge_array[e++];
	                target_node = graph.hasNodeID(target_node_id) ? graph.getNodeById(target_node_id) : graph.addNode(target_node_id);
	                /**
	                 * The direction determines if we have to check for the existence
	                 * of an edge in 'both' directions or only from one node to the other
	                 * Within the CSV module this check is done simply via ID check,
	                 * as we are following a rigorous naming scheme anyways...
	                 */
	                dir_char = this._explicit_direction ? edge_array[e++] : this._direction_mode ? 'd' : 'u';
	                if (dir_char !== 'd' && dir_char !== 'u') {
	                    throw new Error("Specification of edge direction invalid (d and u are valid).");
	                }
	                directed = dir_char === 'd';
	                edge_id = node_id + "_" + target_node_id + "_" + dir_char;
	                edge_id_u2 = target_node_id + "_" + node_id + "_" + dir_char;
	                if (graph.hasEdgeID(edge_id) || (!directed && graph.hasEdgeID(edge_id_u2))) {
	                    // The completely same edge should only be added once...
	                    continue;
	                }
	                else {
	                    edge = graph.addEdge(edge_id, node, target_node, { directed: directed });
	                }
	            }
	        }
	        return graph;
	    };
	    CSVInput.prototype.readFromEdgeList = function (input, graph_name) {
	        var graph = new $G.BaseGraph(graph_name);
	        for (var idx in input) {
	            var line = input[idx], elements = this._separator.match(/\s+/g) ? line.match(/\S+/g) : line.replace(/\s+/g, '').split(this._separator);
	            if (!elements) {
	                // end of file or empty line, just treat like an empty line...
	                continue;
	            }
	            if (elements.length < 2) {
	                throw new Error('Edge list is in wrong format - every line has to consist of two entries (the 2 nodes)');
	            }
	            var node_id = elements[0], node, target_node, edge, target_node_id = elements[1], dir_char = this._explicit_direction ? elements[2] : this._direction_mode ? 'd' : 'u', directed, edge_id, edge_id_u2;
	            node = graph.hasNodeID(node_id) ? graph.getNodeById(node_id) : graph.addNode(node_id);
	            target_node = graph.hasNodeID(target_node_id) ? graph.getNodeById(target_node_id) : graph.addNode(target_node_id);
	            if (dir_char !== 'd' && dir_char !== 'u') {
	                throw new Error("Specification of edge direction invalid (d and u are valid).");
	            }
	            directed = dir_char === 'd';
	            edge_id = node_id + "_" + target_node_id + "_" + dir_char;
	            edge_id_u2 = target_node_id + "_" + node_id + "_" + dir_char;
	            if (graph.hasEdgeID(edge_id) || (!directed && graph.hasEdgeID(edge_id_u2))) {
	                // The completely same edge should only be added once...
	                continue;
	            }
	            else {
	                edge = graph.addEdge(edge_id, node, target_node, { directed: directed });
	            }
	        }
	        return graph;
	    };
	    CSVInput.prototype.checkNodeEnvironment = function () {
	        if (typeof window !== 'undefined') {
	            throw new Error('Cannot read file in browser environment.');
	        }
	    };
	    return CSVInput;
	}());
	exports.CSVInput = CSVInput;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// resolves . and .. elements in a path array with directory names there
	// must be no slashes, empty elements, or device names (c:\) in the array
	// (so also no leading and trailing slashes - it does not distinguish
	// relative and absolute paths)
	function normalizeArray(parts, allowAboveRoot) {
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = parts.length - 1; i >= 0; i--) {
	    var last = parts[i];
	    if (last === '.') {
	      parts.splice(i, 1);
	    } else if (last === '..') {
	      parts.splice(i, 1);
	      up++;
	    } else if (up) {
	      parts.splice(i, 1);
	      up--;
	    }
	  }

	  // if the path is allowed to go above the root, restore leading ..s
	  if (allowAboveRoot) {
	    for (; up--; up) {
	      parts.unshift('..');
	    }
	  }

	  return parts;
	}

	// Split a filename into [root, dir, basename, ext], unix version
	// 'root' is just a slash, or nothing.
	var splitPathRe =
	    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
	var splitPath = function(filename) {
	  return splitPathRe.exec(filename).slice(1);
	};

	// path.resolve([from ...], to)
	// posix version
	exports.resolve = function() {
	  var resolvedPath = '',
	      resolvedAbsolute = false;

	  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
	    var path = (i >= 0) ? arguments[i] : process.cwd();

	    // Skip empty and invalid entries
	    if (typeof path !== 'string') {
	      throw new TypeError('Arguments to path.resolve must be strings');
	    } else if (!path) {
	      continue;
	    }

	    resolvedPath = path + '/' + resolvedPath;
	    resolvedAbsolute = path.charAt(0) === '/';
	  }

	  // At this point the path should be resolved to a full absolute path, but
	  // handle relative paths to be safe (might happen when process.cwd() fails)

	  // Normalize the path
	  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
	    return !!p;
	  }), !resolvedAbsolute).join('/');

	  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
	};

	// path.normalize(path)
	// posix version
	exports.normalize = function(path) {
	  var isAbsolute = exports.isAbsolute(path),
	      trailingSlash = substr(path, -1) === '/';

	  // Normalize the path
	  path = normalizeArray(filter(path.split('/'), function(p) {
	    return !!p;
	  }), !isAbsolute).join('/');

	  if (!path && !isAbsolute) {
	    path = '.';
	  }
	  if (path && trailingSlash) {
	    path += '/';
	  }

	  return (isAbsolute ? '/' : '') + path;
	};

	// posix version
	exports.isAbsolute = function(path) {
	  return path.charAt(0) === '/';
	};

	// posix version
	exports.join = function() {
	  var paths = Array.prototype.slice.call(arguments, 0);
	  return exports.normalize(filter(paths, function(p, index) {
	    if (typeof p !== 'string') {
	      throw new TypeError('Arguments to path.join must be strings');
	    }
	    return p;
	  }).join('/'));
	};


	// path.relative(from, to)
	// posix version
	exports.relative = function(from, to) {
	  from = exports.resolve(from).substr(1);
	  to = exports.resolve(to).substr(1);

	  function trim(arr) {
	    var start = 0;
	    for (; start < arr.length; start++) {
	      if (arr[start] !== '') break;
	    }

	    var end = arr.length - 1;
	    for (; end >= 0; end--) {
	      if (arr[end] !== '') break;
	    }

	    if (start > end) return [];
	    return arr.slice(start, end - start + 1);
	  }

	  var fromParts = trim(from.split('/'));
	  var toParts = trim(to.split('/'));

	  var length = Math.min(fromParts.length, toParts.length);
	  var samePartsLength = length;
	  for (var i = 0; i < length; i++) {
	    if (fromParts[i] !== toParts[i]) {
	      samePartsLength = i;
	      break;
	    }
	  }

	  var outputParts = [];
	  for (var i = samePartsLength; i < fromParts.length; i++) {
	    outputParts.push('..');
	  }

	  outputParts = outputParts.concat(toParts.slice(samePartsLength));

	  return outputParts.join('/');
	};

	exports.sep = '/';
	exports.delimiter = ':';

	exports.dirname = function(path) {
	  var result = splitPath(path),
	      root = result[0],
	      dir = result[1];

	  if (!root && !dir) {
	    // No dirname whatsoever
	    return '.';
	  }

	  if (dir) {
	    // It has a dirname, strip trailing slash
	    dir = dir.substr(0, dir.length - 1);
	  }

	  return root + dir;
	};


	exports.basename = function(path, ext) {
	  var f = splitPath(path)[2];
	  // TODO: make this comparison case-insensitive on windows?
	  if (ext && f.substr(-1 * ext.length) === ext) {
	    f = f.substr(0, f.length - ext.length);
	  }
	  return f;
	};


	exports.extname = function(path) {
	  return splitPath(path)[3];
	};

	function filter (xs, f) {
	    if (xs.filter) return xs.filter(f);
	    var res = [];
	    for (var i = 0; i < xs.length; i++) {
	        if (f(xs[i], i, xs)) res.push(xs[i]);
	    }
	    return res;
	}

	// String.prototype.substr - negative index don't work in IE8
	var substr = 'ab'.substr(-1) === 'b'
	    ? function (str, start, len) { return str.substr(start, len) }
	    : function (str, start, len) {
	        if (start < 0) start = str.length + start;
	        return str.substr(start, len);
	    }
	;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(22)))

/***/ },
/* 22 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 23 */
/***/ function(module, exports) {

	

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var http = __webpack_require__(25);
	/**
	 * @TODO: Test it !!!
	 *
	 * @param url
	 * @param cb
	 * @returns {ClientRequest}
	 */
	function retrieveRemoteFile(url, cb) {
	    if (typeof cb !== 'function') {
	        throw new Error('Provided callback is not a function.');
	    }
	    return http.get(url, function (response) {
	        // Continuously update stream with data
	        var body = '';
	        response.on('data', function (d) {
	            body += d;
	        });
	        response.on('end', function () {
	            // Received data in body...
	            cb(body);
	        });
	    });
	}
	exports.retrieveRemoteFile = retrieveRemoteFile;


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var http = module.exports;
	var EventEmitter = __webpack_require__(26).EventEmitter;
	var Request = __webpack_require__(27);
	var url = __webpack_require__(55)

	http.request = function (params, cb) {
	    if (typeof params === 'string') {
	        params = url.parse(params)
	    }
	    if (!params) params = {};
	    if (!params.host && !params.port) {
	        params.port = parseInt(window.location.port, 10);
	    }
	    if (!params.host && params.hostname) {
	        params.host = params.hostname;
	    }

	    if (!params.protocol) {
	        if (params.scheme) {
	            params.protocol = params.scheme + ':';
	        } else {
	            params.protocol = window.location.protocol;
	        }
	    }

	    if (!params.host) {
	        params.host = window.location.hostname || window.location.host;
	    }
	    if (/:/.test(params.host)) {
	        if (!params.port) {
	            params.port = params.host.split(':')[1];
	        }
	        params.host = params.host.split(':')[0];
	    }
	    if (!params.port) params.port = params.protocol == 'https:' ? 443 : 80;
	    
	    var req = new Request(new xhrHttp, params);
	    if (cb) req.on('response', cb);
	    return req;
	};

	http.get = function (params, cb) {
	    params.method = 'GET';
	    var req = http.request(params, cb);
	    req.end();
	    return req;
	};

	http.Agent = function () {};
	http.Agent.defaultMaxSockets = 4;

	var xhrHttp = (function () {
	    if (typeof window === 'undefined') {
	        throw new Error('no window object present');
	    }
	    else if (window.XMLHttpRequest) {
	        return window.XMLHttpRequest;
	    }
	    else if (window.ActiveXObject) {
	        var axs = [
	            'Msxml2.XMLHTTP.6.0',
	            'Msxml2.XMLHTTP.3.0',
	            'Microsoft.XMLHTTP'
	        ];
	        for (var i = 0; i < axs.length; i++) {
	            try {
	                var ax = new(window.ActiveXObject)(axs[i]);
	                return function () {
	                    if (ax) {
	                        var ax_ = ax;
	                        ax = null;
	                        return ax_;
	                    }
	                    else {
	                        return new(window.ActiveXObject)(axs[i]);
	                    }
	                };
	            }
	            catch (e) {}
	        }
	        throw new Error('ajax not supported in this browser')
	    }
	    else {
	        throw new Error('ajax not supported in this browser');
	    }
	})();

	http.STATUS_CODES = {
	    100 : 'Continue',
	    101 : 'Switching Protocols',
	    102 : 'Processing',                 // RFC 2518, obsoleted by RFC 4918
	    200 : 'OK',
	    201 : 'Created',
	    202 : 'Accepted',
	    203 : 'Non-Authoritative Information',
	    204 : 'No Content',
	    205 : 'Reset Content',
	    206 : 'Partial Content',
	    207 : 'Multi-Status',               // RFC 4918
	    300 : 'Multiple Choices',
	    301 : 'Moved Permanently',
	    302 : 'Moved Temporarily',
	    303 : 'See Other',
	    304 : 'Not Modified',
	    305 : 'Use Proxy',
	    307 : 'Temporary Redirect',
	    400 : 'Bad Request',
	    401 : 'Unauthorized',
	    402 : 'Payment Required',
	    403 : 'Forbidden',
	    404 : 'Not Found',
	    405 : 'Method Not Allowed',
	    406 : 'Not Acceptable',
	    407 : 'Proxy Authentication Required',
	    408 : 'Request Time-out',
	    409 : 'Conflict',
	    410 : 'Gone',
	    411 : 'Length Required',
	    412 : 'Precondition Failed',
	    413 : 'Request Entity Too Large',
	    414 : 'Request-URI Too Large',
	    415 : 'Unsupported Media Type',
	    416 : 'Requested Range Not Satisfiable',
	    417 : 'Expectation Failed',
	    418 : 'I\'m a teapot',              // RFC 2324
	    422 : 'Unprocessable Entity',       // RFC 4918
	    423 : 'Locked',                     // RFC 4918
	    424 : 'Failed Dependency',          // RFC 4918
	    425 : 'Unordered Collection',       // RFC 4918
	    426 : 'Upgrade Required',           // RFC 2817
	    428 : 'Precondition Required',      // RFC 6585
	    429 : 'Too Many Requests',          // RFC 6585
	    431 : 'Request Header Fields Too Large',// RFC 6585
	    500 : 'Internal Server Error',
	    501 : 'Not Implemented',
	    502 : 'Bad Gateway',
	    503 : 'Service Unavailable',
	    504 : 'Gateway Time-out',
	    505 : 'HTTP Version Not Supported',
	    506 : 'Variant Also Negotiates',    // RFC 2295
	    507 : 'Insufficient Storage',       // RFC 4918
	    509 : 'Bandwidth Limit Exceeded',
	    510 : 'Not Extended',               // RFC 2774
	    511 : 'Network Authentication Required' // RFC 6585
	};

/***/ },
/* 26 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      }
	      throw TypeError('Uncaught, unspecified "error" event.');
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var Stream = __webpack_require__(28);
	var Response = __webpack_require__(51);
	var Base64 = __webpack_require__(54);
	var inherits = __webpack_require__(29);

	var Request = module.exports = function (xhr, params) {
	    var self = this;
	    self.writable = true;
	    self.xhr = xhr;
	    self.body = [];
	    
	    self.uri = (params.protocol || 'http:') + '//'
	        + params.host
	        + (params.port ? ':' + params.port : '')
	        + (params.path || '/')
	    ;
	    
	    if (typeof params.withCredentials === 'undefined') {
	        params.withCredentials = true;
	    }

	    try { xhr.withCredentials = params.withCredentials }
	    catch (e) {}
	    
	    if (params.responseType) try { xhr.responseType = params.responseType }
	    catch (e) {}
	    
	    xhr.open(
	        params.method || 'GET',
	        self.uri,
	        true
	    );

	    xhr.onerror = function(event) {
	        self.emit('error', new Error('Network error'));
	    };

	    self._headers = {};
	    
	    if (params.headers) {
	        var keys = objectKeys(params.headers);
	        for (var i = 0; i < keys.length; i++) {
	            var key = keys[i];
	            if (!self.isSafeRequestHeader(key)) continue;
	            var value = params.headers[key];
	            self.setHeader(key, value);
	        }
	    }
	    
	    if (params.auth) {
	        //basic auth
	        this.setHeader('Authorization', 'Basic ' + Base64.btoa(params.auth));
	    }

	    var res = new Response;
	    res.on('close', function () {
	        self.emit('close');
	    });
	    
	    res.on('ready', function () {
	        self.emit('response', res);
	    });

	    res.on('error', function (err) {
	        self.emit('error', err);
	    });
	    
	    xhr.onreadystatechange = function () {
	        // Fix for IE9 bug
	        // SCRIPT575: Could not complete the operation due to error c00c023f
	        // It happens when a request is aborted, calling the success callback anyway with readyState === 4
	        if (xhr.__aborted) return;
	        res.handle(xhr);
	    };
	};

	inherits(Request, Stream);

	Request.prototype.setHeader = function (key, value) {
	    this._headers[key.toLowerCase()] = value
	};

	Request.prototype.getHeader = function (key) {
	    return this._headers[key.toLowerCase()]
	};

	Request.prototype.removeHeader = function (key) {
	    delete this._headers[key.toLowerCase()]
	};

	Request.prototype.write = function (s) {
	    this.body.push(s);
	};

	Request.prototype.destroy = function (s) {
	    this.xhr.__aborted = true;
	    this.xhr.abort();
	    this.emit('close');
	};

	Request.prototype.end = function (s) {
	    if (s !== undefined) this.body.push(s);

	    var keys = objectKeys(this._headers);
	    for (var i = 0; i < keys.length; i++) {
	        var key = keys[i];
	        var value = this._headers[key];
	        if (isArray(value)) {
	            for (var j = 0; j < value.length; j++) {
	                this.xhr.setRequestHeader(key, value[j]);
	            }
	        }
	        else this.xhr.setRequestHeader(key, value)
	    }

	    if (this.body.length === 0) {
	        this.xhr.send('');
	    }
	    else if (typeof this.body[0] === 'string') {
	        this.xhr.send(this.body.join(''));
	    }
	    else if (isArray(this.body[0])) {
	        var body = [];
	        for (var i = 0; i < this.body.length; i++) {
	            body.push.apply(body, this.body[i]);
	        }
	        this.xhr.send(body);
	    }
	    else if (/Array/.test(Object.prototype.toString.call(this.body[0]))) {
	        var len = 0;
	        for (var i = 0; i < this.body.length; i++) {
	            len += this.body[i].length;
	        }
	        var body = new(this.body[0].constructor)(len);
	        var k = 0;
	        
	        for (var i = 0; i < this.body.length; i++) {
	            var b = this.body[i];
	            for (var j = 0; j < b.length; j++) {
	                body[k++] = b[j];
	            }
	        }
	        this.xhr.send(body);
	    }
	    else if (isXHR2Compatible(this.body[0])) {
	        this.xhr.send(this.body[0]);
	    }
	    else {
	        var body = '';
	        for (var i = 0; i < this.body.length; i++) {
	            body += this.body[i].toString();
	        }
	        this.xhr.send(body);
	    }
	};

	// Taken from http://dxr.mozilla.org/mozilla/mozilla-central/content/base/src/nsXMLHttpRequest.cpp.html
	Request.unsafeHeaders = [
	    "accept-charset",
	    "accept-encoding",
	    "access-control-request-headers",
	    "access-control-request-method",
	    "connection",
	    "content-length",
	    "cookie",
	    "cookie2",
	    "content-transfer-encoding",
	    "date",
	    "expect",
	    "host",
	    "keep-alive",
	    "origin",
	    "referer",
	    "te",
	    "trailer",
	    "transfer-encoding",
	    "upgrade",
	    "user-agent",
	    "via"
	];

	Request.prototype.isSafeRequestHeader = function (headerName) {
	    if (!headerName) return false;
	    return indexOf(Request.unsafeHeaders, headerName.toLowerCase()) === -1;
	};

	var objectKeys = Object.keys || function (obj) {
	    var keys = [];
	    for (var key in obj) keys.push(key);
	    return keys;
	};

	var isArray = Array.isArray || function (xs) {
	    return Object.prototype.toString.call(xs) === '[object Array]';
	};

	var indexOf = function (xs, x) {
	    if (xs.indexOf) return xs.indexOf(x);
	    for (var i = 0; i < xs.length; i++) {
	        if (xs[i] === x) return i;
	    }
	    return -1;
	};

	var isXHR2Compatible = function (obj) {
	    if (typeof Blob !== 'undefined' && obj instanceof Blob) return true;
	    if (typeof ArrayBuffer !== 'undefined' && obj instanceof ArrayBuffer) return true;
	    if (typeof FormData !== 'undefined' && obj instanceof FormData) return true;
	};


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	module.exports = Stream;

	var EE = __webpack_require__(26).EventEmitter;
	var inherits = __webpack_require__(29);

	inherits(Stream, EE);
	Stream.Readable = __webpack_require__(30);
	Stream.Writable = __webpack_require__(47);
	Stream.Duplex = __webpack_require__(48);
	Stream.Transform = __webpack_require__(49);
	Stream.PassThrough = __webpack_require__(50);

	// Backwards-compat with node 0.4.x
	Stream.Stream = Stream;



	// old-style streams.  Note that the pipe method (the only relevant
	// part of this class) is overridden in the Readable class.

	function Stream() {
	  EE.call(this);
	}

	Stream.prototype.pipe = function(dest, options) {
	  var source = this;

	  function ondata(chunk) {
	    if (dest.writable) {
	      if (false === dest.write(chunk) && source.pause) {
	        source.pause();
	      }
	    }
	  }

	  source.on('data', ondata);

	  function ondrain() {
	    if (source.readable && source.resume) {
	      source.resume();
	    }
	  }

	  dest.on('drain', ondrain);

	  // If the 'end' option is not supplied, dest.end() will be called when
	  // source gets the 'end' or 'close' events.  Only dest.end() once.
	  if (!dest._isStdio && (!options || options.end !== false)) {
	    source.on('end', onend);
	    source.on('close', onclose);
	  }

	  var didOnEnd = false;
	  function onend() {
	    if (didOnEnd) return;
	    didOnEnd = true;

	    dest.end();
	  }


	  function onclose() {
	    if (didOnEnd) return;
	    didOnEnd = true;

	    if (typeof dest.destroy === 'function') dest.destroy();
	  }

	  // don't leave dangling pipes when there are errors.
	  function onerror(er) {
	    cleanup();
	    if (EE.listenerCount(this, 'error') === 0) {
	      throw er; // Unhandled stream error in pipe.
	    }
	  }

	  source.on('error', onerror);
	  dest.on('error', onerror);

	  // remove all the event listeners that were added.
	  function cleanup() {
	    source.removeListener('data', ondata);
	    dest.removeListener('drain', ondrain);

	    source.removeListener('end', onend);
	    source.removeListener('close', onclose);

	    source.removeListener('error', onerror);
	    dest.removeListener('error', onerror);

	    source.removeListener('end', cleanup);
	    source.removeListener('close', cleanup);

	    dest.removeListener('close', cleanup);
	  }

	  source.on('end', cleanup);
	  source.on('close', cleanup);

	  dest.on('close', cleanup);

	  dest.emit('pipe', source);

	  // Allow for unix-like usage: A.pipe(B).pipe(C)
	  return dest;
	};


/***/ },
/* 29 */
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {exports = module.exports = __webpack_require__(31);
	exports.Stream = __webpack_require__(28);
	exports.Readable = exports;
	exports.Writable = __webpack_require__(40);
	exports.Duplex = __webpack_require__(39);
	exports.Transform = __webpack_require__(45);
	exports.PassThrough = __webpack_require__(46);
	if (!process.browser && process.env.READABLE_STREAM === 'disable') {
	  module.exports = __webpack_require__(28);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(22)))

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	module.exports = Readable;

	/*<replacement>*/
	var isArray = __webpack_require__(32);
	/*</replacement>*/


	/*<replacement>*/
	var Buffer = __webpack_require__(33).Buffer;
	/*</replacement>*/

	Readable.ReadableState = ReadableState;

	var EE = __webpack_require__(26).EventEmitter;

	/*<replacement>*/
	if (!EE.listenerCount) EE.listenerCount = function(emitter, type) {
	  return emitter.listeners(type).length;
	};
	/*</replacement>*/

	var Stream = __webpack_require__(28);

	/*<replacement>*/
	var util = __webpack_require__(37);
	util.inherits = __webpack_require__(29);
	/*</replacement>*/

	var StringDecoder;


	/*<replacement>*/
	var debug = __webpack_require__(38);
	if (debug && debug.debuglog) {
	  debug = debug.debuglog('stream');
	} else {
	  debug = function () {};
	}
	/*</replacement>*/


	util.inherits(Readable, Stream);

	function ReadableState(options, stream) {
	  var Duplex = __webpack_require__(39);

	  options = options || {};

	  // the point at which it stops calling _read() to fill the buffer
	  // Note: 0 is a valid value, means "don't call _read preemptively ever"
	  var hwm = options.highWaterMark;
	  var defaultHwm = options.objectMode ? 16 : 16 * 1024;
	  this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;

	  // cast to ints.
	  this.highWaterMark = ~~this.highWaterMark;

	  this.buffer = [];
	  this.length = 0;
	  this.pipes = null;
	  this.pipesCount = 0;
	  this.flowing = null;
	  this.ended = false;
	  this.endEmitted = false;
	  this.reading = false;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, because any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // whenever we return null, then we set a flag to say
	  // that we're awaiting a 'readable' event emission.
	  this.needReadable = false;
	  this.emittedReadable = false;
	  this.readableListening = false;


	  // object stream flag. Used to make read(n) ignore n and to
	  // make all the buffer merging and length checks go away
	  this.objectMode = !!options.objectMode;

	  if (stream instanceof Duplex)
	    this.objectMode = this.objectMode || !!options.readableObjectMode;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // when piping, we only care about 'readable' events that happen
	  // after read()ing all the bytes and not getting any pushback.
	  this.ranOut = false;

	  // the number of writers that are awaiting a drain event in .pipe()s
	  this.awaitDrain = 0;

	  // if true, a maybeReadMore has been scheduled
	  this.readingMore = false;

	  this.decoder = null;
	  this.encoding = null;
	  if (options.encoding) {
	    if (!StringDecoder)
	      StringDecoder = __webpack_require__(41).StringDecoder;
	    this.decoder = new StringDecoder(options.encoding);
	    this.encoding = options.encoding;
	  }
	}

	function Readable(options) {
	  var Duplex = __webpack_require__(39);

	  if (!(this instanceof Readable))
	    return new Readable(options);

	  this._readableState = new ReadableState(options, this);

	  // legacy
	  this.readable = true;

	  Stream.call(this);
	}

	// Manually shove something into the read() buffer.
	// This returns true if the highWaterMark has not been hit yet,
	// similar to how Writable.write() returns true if you should
	// write() some more.
	Readable.prototype.push = function(chunk, encoding) {
	  var state = this._readableState;

	  if (util.isString(chunk) && !state.objectMode) {
	    encoding = encoding || state.defaultEncoding;
	    if (encoding !== state.encoding) {
	      chunk = new Buffer(chunk, encoding);
	      encoding = '';
	    }
	  }

	  return readableAddChunk(this, state, chunk, encoding, false);
	};

	// Unshift should *always* be something directly out of read()
	Readable.prototype.unshift = function(chunk) {
	  var state = this._readableState;
	  return readableAddChunk(this, state, chunk, '', true);
	};

	function readableAddChunk(stream, state, chunk, encoding, addToFront) {
	  var er = chunkInvalid(state, chunk);
	  if (er) {
	    stream.emit('error', er);
	  } else if (util.isNullOrUndefined(chunk)) {
	    state.reading = false;
	    if (!state.ended)
	      onEofChunk(stream, state);
	  } else if (state.objectMode || chunk && chunk.length > 0) {
	    if (state.ended && !addToFront) {
	      var e = new Error('stream.push() after EOF');
	      stream.emit('error', e);
	    } else if (state.endEmitted && addToFront) {
	      var e = new Error('stream.unshift() after end event');
	      stream.emit('error', e);
	    } else {
	      if (state.decoder && !addToFront && !encoding)
	        chunk = state.decoder.write(chunk);

	      if (!addToFront)
	        state.reading = false;

	      // if we want the data now, just emit it.
	      if (state.flowing && state.length === 0 && !state.sync) {
	        stream.emit('data', chunk);
	        stream.read(0);
	      } else {
	        // update the buffer info.
	        state.length += state.objectMode ? 1 : chunk.length;
	        if (addToFront)
	          state.buffer.unshift(chunk);
	        else
	          state.buffer.push(chunk);

	        if (state.needReadable)
	          emitReadable(stream);
	      }

	      maybeReadMore(stream, state);
	    }
	  } else if (!addToFront) {
	    state.reading = false;
	  }

	  return needMoreData(state);
	}



	// if it's past the high water mark, we can push in some more.
	// Also, if we have no data yet, we can stand some
	// more bytes.  This is to work around cases where hwm=0,
	// such as the repl.  Also, if the push() triggered a
	// readable event, and the user called read(largeNumber) such that
	// needReadable was set, then we ought to push more, so that another
	// 'readable' event will be triggered.
	function needMoreData(state) {
	  return !state.ended &&
	         (state.needReadable ||
	          state.length < state.highWaterMark ||
	          state.length === 0);
	}

	// backwards compatibility.
	Readable.prototype.setEncoding = function(enc) {
	  if (!StringDecoder)
	    StringDecoder = __webpack_require__(41).StringDecoder;
	  this._readableState.decoder = new StringDecoder(enc);
	  this._readableState.encoding = enc;
	  return this;
	};

	// Don't raise the hwm > 128MB
	var MAX_HWM = 0x800000;
	function roundUpToNextPowerOf2(n) {
	  if (n >= MAX_HWM) {
	    n = MAX_HWM;
	  } else {
	    // Get the next highest power of 2
	    n--;
	    for (var p = 1; p < 32; p <<= 1) n |= n >> p;
	    n++;
	  }
	  return n;
	}

	function howMuchToRead(n, state) {
	  if (state.length === 0 && state.ended)
	    return 0;

	  if (state.objectMode)
	    return n === 0 ? 0 : 1;

	  if (isNaN(n) || util.isNull(n)) {
	    // only flow one buffer at a time
	    if (state.flowing && state.buffer.length)
	      return state.buffer[0].length;
	    else
	      return state.length;
	  }

	  if (n <= 0)
	    return 0;

	  // If we're asking for more than the target buffer level,
	  // then raise the water mark.  Bump up to the next highest
	  // power of 2, to prevent increasing it excessively in tiny
	  // amounts.
	  if (n > state.highWaterMark)
	    state.highWaterMark = roundUpToNextPowerOf2(n);

	  // don't have that much.  return null, unless we've ended.
	  if (n > state.length) {
	    if (!state.ended) {
	      state.needReadable = true;
	      return 0;
	    } else
	      return state.length;
	  }

	  return n;
	}

	// you can override either this method, or the async _read(n) below.
	Readable.prototype.read = function(n) {
	  debug('read', n);
	  var state = this._readableState;
	  var nOrig = n;

	  if (!util.isNumber(n) || n > 0)
	    state.emittedReadable = false;

	  // if we're doing read(0) to trigger a readable event, but we
	  // already have a bunch of data in the buffer, then just trigger
	  // the 'readable' event and move on.
	  if (n === 0 &&
	      state.needReadable &&
	      (state.length >= state.highWaterMark || state.ended)) {
	    debug('read: emitReadable', state.length, state.ended);
	    if (state.length === 0 && state.ended)
	      endReadable(this);
	    else
	      emitReadable(this);
	    return null;
	  }

	  n = howMuchToRead(n, state);

	  // if we've ended, and we're now clear, then finish it up.
	  if (n === 0 && state.ended) {
	    if (state.length === 0)
	      endReadable(this);
	    return null;
	  }

	  // All the actual chunk generation logic needs to be
	  // *below* the call to _read.  The reason is that in certain
	  // synthetic stream cases, such as passthrough streams, _read
	  // may be a completely synchronous operation which may change
	  // the state of the read buffer, providing enough data when
	  // before there was *not* enough.
	  //
	  // So, the steps are:
	  // 1. Figure out what the state of things will be after we do
	  // a read from the buffer.
	  //
	  // 2. If that resulting state will trigger a _read, then call _read.
	  // Note that this may be asynchronous, or synchronous.  Yes, it is
	  // deeply ugly to write APIs this way, but that still doesn't mean
	  // that the Readable class should behave improperly, as streams are
	  // designed to be sync/async agnostic.
	  // Take note if the _read call is sync or async (ie, if the read call
	  // has returned yet), so that we know whether or not it's safe to emit
	  // 'readable' etc.
	  //
	  // 3. Actually pull the requested chunks out of the buffer and return.

	  // if we need a readable event, then we need to do some reading.
	  var doRead = state.needReadable;
	  debug('need readable', doRead);

	  // if we currently have less than the highWaterMark, then also read some
	  if (state.length === 0 || state.length - n < state.highWaterMark) {
	    doRead = true;
	    debug('length less than watermark', doRead);
	  }

	  // however, if we've ended, then there's no point, and if we're already
	  // reading, then it's unnecessary.
	  if (state.ended || state.reading) {
	    doRead = false;
	    debug('reading or ended', doRead);
	  }

	  if (doRead) {
	    debug('do read');
	    state.reading = true;
	    state.sync = true;
	    // if the length is currently zero, then we *need* a readable event.
	    if (state.length === 0)
	      state.needReadable = true;
	    // call internal read method
	    this._read(state.highWaterMark);
	    state.sync = false;
	  }

	  // If _read pushed data synchronously, then `reading` will be false,
	  // and we need to re-evaluate how much data we can return to the user.
	  if (doRead && !state.reading)
	    n = howMuchToRead(nOrig, state);

	  var ret;
	  if (n > 0)
	    ret = fromList(n, state);
	  else
	    ret = null;

	  if (util.isNull(ret)) {
	    state.needReadable = true;
	    n = 0;
	  }

	  state.length -= n;

	  // If we have nothing in the buffer, then we want to know
	  // as soon as we *do* get something into the buffer.
	  if (state.length === 0 && !state.ended)
	    state.needReadable = true;

	  // If we tried to read() past the EOF, then emit end on the next tick.
	  if (nOrig !== n && state.ended && state.length === 0)
	    endReadable(this);

	  if (!util.isNull(ret))
	    this.emit('data', ret);

	  return ret;
	};

	function chunkInvalid(state, chunk) {
	  var er = null;
	  if (!util.isBuffer(chunk) &&
	      !util.isString(chunk) &&
	      !util.isNullOrUndefined(chunk) &&
	      !state.objectMode) {
	    er = new TypeError('Invalid non-string/buffer chunk');
	  }
	  return er;
	}


	function onEofChunk(stream, state) {
	  if (state.decoder && !state.ended) {
	    var chunk = state.decoder.end();
	    if (chunk && chunk.length) {
	      state.buffer.push(chunk);
	      state.length += state.objectMode ? 1 : chunk.length;
	    }
	  }
	  state.ended = true;

	  // emit 'readable' now to make sure it gets picked up.
	  emitReadable(stream);
	}

	// Don't emit readable right away in sync mode, because this can trigger
	// another read() call => stack overflow.  This way, it might trigger
	// a nextTick recursion warning, but that's not so bad.
	function emitReadable(stream) {
	  var state = stream._readableState;
	  state.needReadable = false;
	  if (!state.emittedReadable) {
	    debug('emitReadable', state.flowing);
	    state.emittedReadable = true;
	    if (state.sync)
	      process.nextTick(function() {
	        emitReadable_(stream);
	      });
	    else
	      emitReadable_(stream);
	  }
	}

	function emitReadable_(stream) {
	  debug('emit readable');
	  stream.emit('readable');
	  flow(stream);
	}


	// at this point, the user has presumably seen the 'readable' event,
	// and called read() to consume some data.  that may have triggered
	// in turn another _read(n) call, in which case reading = true if
	// it's in progress.
	// However, if we're not ended, or reading, and the length < hwm,
	// then go ahead and try to read some more preemptively.
	function maybeReadMore(stream, state) {
	  if (!state.readingMore) {
	    state.readingMore = true;
	    process.nextTick(function() {
	      maybeReadMore_(stream, state);
	    });
	  }
	}

	function maybeReadMore_(stream, state) {
	  var len = state.length;
	  while (!state.reading && !state.flowing && !state.ended &&
	         state.length < state.highWaterMark) {
	    debug('maybeReadMore read 0');
	    stream.read(0);
	    if (len === state.length)
	      // didn't get any data, stop spinning.
	      break;
	    else
	      len = state.length;
	  }
	  state.readingMore = false;
	}

	// abstract method.  to be overridden in specific implementation classes.
	// call cb(er, data) where data is <= n in length.
	// for virtual (non-string, non-buffer) streams, "length" is somewhat
	// arbitrary, and perhaps not very meaningful.
	Readable.prototype._read = function(n) {
	  this.emit('error', new Error('not implemented'));
	};

	Readable.prototype.pipe = function(dest, pipeOpts) {
	  var src = this;
	  var state = this._readableState;

	  switch (state.pipesCount) {
	    case 0:
	      state.pipes = dest;
	      break;
	    case 1:
	      state.pipes = [state.pipes, dest];
	      break;
	    default:
	      state.pipes.push(dest);
	      break;
	  }
	  state.pipesCount += 1;
	  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

	  var doEnd = (!pipeOpts || pipeOpts.end !== false) &&
	              dest !== process.stdout &&
	              dest !== process.stderr;

	  var endFn = doEnd ? onend : cleanup;
	  if (state.endEmitted)
	    process.nextTick(endFn);
	  else
	    src.once('end', endFn);

	  dest.on('unpipe', onunpipe);
	  function onunpipe(readable) {
	    debug('onunpipe');
	    if (readable === src) {
	      cleanup();
	    }
	  }

	  function onend() {
	    debug('onend');
	    dest.end();
	  }

	  // when the dest drains, it reduces the awaitDrain counter
	  // on the source.  This would be more elegant with a .once()
	  // handler in flow(), but adding and removing repeatedly is
	  // too slow.
	  var ondrain = pipeOnDrain(src);
	  dest.on('drain', ondrain);

	  function cleanup() {
	    debug('cleanup');
	    // cleanup event handlers once the pipe is broken
	    dest.removeListener('close', onclose);
	    dest.removeListener('finish', onfinish);
	    dest.removeListener('drain', ondrain);
	    dest.removeListener('error', onerror);
	    dest.removeListener('unpipe', onunpipe);
	    src.removeListener('end', onend);
	    src.removeListener('end', cleanup);
	    src.removeListener('data', ondata);

	    // if the reader is waiting for a drain event from this
	    // specific writer, then it would cause it to never start
	    // flowing again.
	    // So, if this is awaiting a drain, then we just call it now.
	    // If we don't know, then assume that we are waiting for one.
	    if (state.awaitDrain &&
	        (!dest._writableState || dest._writableState.needDrain))
	      ondrain();
	  }

	  src.on('data', ondata);
	  function ondata(chunk) {
	    debug('ondata');
	    var ret = dest.write(chunk);
	    if (false === ret) {
	      debug('false write response, pause',
	            src._readableState.awaitDrain);
	      src._readableState.awaitDrain++;
	      src.pause();
	    }
	  }

	  // if the dest has an error, then stop piping into it.
	  // however, don't suppress the throwing behavior for this.
	  function onerror(er) {
	    debug('onerror', er);
	    unpipe();
	    dest.removeListener('error', onerror);
	    if (EE.listenerCount(dest, 'error') === 0)
	      dest.emit('error', er);
	  }
	  // This is a brutally ugly hack to make sure that our error handler
	  // is attached before any userland ones.  NEVER DO THIS.
	  if (!dest._events || !dest._events.error)
	    dest.on('error', onerror);
	  else if (isArray(dest._events.error))
	    dest._events.error.unshift(onerror);
	  else
	    dest._events.error = [onerror, dest._events.error];



	  // Both close and finish should trigger unpipe, but only once.
	  function onclose() {
	    dest.removeListener('finish', onfinish);
	    unpipe();
	  }
	  dest.once('close', onclose);
	  function onfinish() {
	    debug('onfinish');
	    dest.removeListener('close', onclose);
	    unpipe();
	  }
	  dest.once('finish', onfinish);

	  function unpipe() {
	    debug('unpipe');
	    src.unpipe(dest);
	  }

	  // tell the dest that it's being piped to
	  dest.emit('pipe', src);

	  // start the flow if it hasn't been started already.
	  if (!state.flowing) {
	    debug('pipe resume');
	    src.resume();
	  }

	  return dest;
	};

	function pipeOnDrain(src) {
	  return function() {
	    var state = src._readableState;
	    debug('pipeOnDrain', state.awaitDrain);
	    if (state.awaitDrain)
	      state.awaitDrain--;
	    if (state.awaitDrain === 0 && EE.listenerCount(src, 'data')) {
	      state.flowing = true;
	      flow(src);
	    }
	  };
	}


	Readable.prototype.unpipe = function(dest) {
	  var state = this._readableState;

	  // if we're not piping anywhere, then do nothing.
	  if (state.pipesCount === 0)
	    return this;

	  // just one destination.  most common case.
	  if (state.pipesCount === 1) {
	    // passed in one, but it's not the right one.
	    if (dest && dest !== state.pipes)
	      return this;

	    if (!dest)
	      dest = state.pipes;

	    // got a match.
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;
	    if (dest)
	      dest.emit('unpipe', this);
	    return this;
	  }

	  // slow case. multiple pipe destinations.

	  if (!dest) {
	    // remove all.
	    var dests = state.pipes;
	    var len = state.pipesCount;
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;

	    for (var i = 0; i < len; i++)
	      dests[i].emit('unpipe', this);
	    return this;
	  }

	  // try to find the right one.
	  var i = indexOf(state.pipes, dest);
	  if (i === -1)
	    return this;

	  state.pipes.splice(i, 1);
	  state.pipesCount -= 1;
	  if (state.pipesCount === 1)
	    state.pipes = state.pipes[0];

	  dest.emit('unpipe', this);

	  return this;
	};

	// set up data events if they are asked for
	// Ensure readable listeners eventually get something
	Readable.prototype.on = function(ev, fn) {
	  var res = Stream.prototype.on.call(this, ev, fn);

	  // If listening to data, and it has not explicitly been paused,
	  // then call resume to start the flow of data on the next tick.
	  if (ev === 'data' && false !== this._readableState.flowing) {
	    this.resume();
	  }

	  if (ev === 'readable' && this.readable) {
	    var state = this._readableState;
	    if (!state.readableListening) {
	      state.readableListening = true;
	      state.emittedReadable = false;
	      state.needReadable = true;
	      if (!state.reading) {
	        var self = this;
	        process.nextTick(function() {
	          debug('readable nexttick read 0');
	          self.read(0);
	        });
	      } else if (state.length) {
	        emitReadable(this, state);
	      }
	    }
	  }

	  return res;
	};
	Readable.prototype.addListener = Readable.prototype.on;

	// pause() and resume() are remnants of the legacy readable stream API
	// If the user uses them, then switch into old mode.
	Readable.prototype.resume = function() {
	  var state = this._readableState;
	  if (!state.flowing) {
	    debug('resume');
	    state.flowing = true;
	    if (!state.reading) {
	      debug('resume read 0');
	      this.read(0);
	    }
	    resume(this, state);
	  }
	  return this;
	};

	function resume(stream, state) {
	  if (!state.resumeScheduled) {
	    state.resumeScheduled = true;
	    process.nextTick(function() {
	      resume_(stream, state);
	    });
	  }
	}

	function resume_(stream, state) {
	  state.resumeScheduled = false;
	  stream.emit('resume');
	  flow(stream);
	  if (state.flowing && !state.reading)
	    stream.read(0);
	}

	Readable.prototype.pause = function() {
	  debug('call pause flowing=%j', this._readableState.flowing);
	  if (false !== this._readableState.flowing) {
	    debug('pause');
	    this._readableState.flowing = false;
	    this.emit('pause');
	  }
	  return this;
	};

	function flow(stream) {
	  var state = stream._readableState;
	  debug('flow', state.flowing);
	  if (state.flowing) {
	    do {
	      var chunk = stream.read();
	    } while (null !== chunk && state.flowing);
	  }
	}

	// wrap an old-style stream as the async data source.
	// This is *not* part of the readable stream interface.
	// It is an ugly unfortunate mess of history.
	Readable.prototype.wrap = function(stream) {
	  var state = this._readableState;
	  var paused = false;

	  var self = this;
	  stream.on('end', function() {
	    debug('wrapped end');
	    if (state.decoder && !state.ended) {
	      var chunk = state.decoder.end();
	      if (chunk && chunk.length)
	        self.push(chunk);
	    }

	    self.push(null);
	  });

	  stream.on('data', function(chunk) {
	    debug('wrapped data');
	    if (state.decoder)
	      chunk = state.decoder.write(chunk);
	    if (!chunk || !state.objectMode && !chunk.length)
	      return;

	    var ret = self.push(chunk);
	    if (!ret) {
	      paused = true;
	      stream.pause();
	    }
	  });

	  // proxy all the other methods.
	  // important when wrapping filters and duplexes.
	  for (var i in stream) {
	    if (util.isFunction(stream[i]) && util.isUndefined(this[i])) {
	      this[i] = function(method) { return function() {
	        return stream[method].apply(stream, arguments);
	      }}(i);
	    }
	  }

	  // proxy certain important events.
	  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
	  forEach(events, function(ev) {
	    stream.on(ev, self.emit.bind(self, ev));
	  });

	  // when we try to consume some more bytes, simply unpause the
	  // underlying stream.
	  self._read = function(n) {
	    debug('wrapped _read', n);
	    if (paused) {
	      paused = false;
	      stream.resume();
	    }
	  };

	  return self;
	};



	// exposed for testing purposes only.
	Readable._fromList = fromList;

	// Pluck off n bytes from an array of buffers.
	// Length is the combined lengths of all the buffers in the list.
	function fromList(n, state) {
	  var list = state.buffer;
	  var length = state.length;
	  var stringMode = !!state.decoder;
	  var objectMode = !!state.objectMode;
	  var ret;

	  // nothing in the list, definitely empty.
	  if (list.length === 0)
	    return null;

	  if (length === 0)
	    ret = null;
	  else if (objectMode)
	    ret = list.shift();
	  else if (!n || n >= length) {
	    // read it all, truncate the array.
	    if (stringMode)
	      ret = list.join('');
	    else
	      ret = Buffer.concat(list, length);
	    list.length = 0;
	  } else {
	    // read just some of it.
	    if (n < list[0].length) {
	      // just take a part of the first list item.
	      // slice is the same for buffers and strings.
	      var buf = list[0];
	      ret = buf.slice(0, n);
	      list[0] = buf.slice(n);
	    } else if (n === list[0].length) {
	      // first list is a perfect match
	      ret = list.shift();
	    } else {
	      // complex case.
	      // we have enough to cover it, but it spans past the first buffer.
	      if (stringMode)
	        ret = '';
	      else
	        ret = new Buffer(n);

	      var c = 0;
	      for (var i = 0, l = list.length; i < l && c < n; i++) {
	        var buf = list[0];
	        var cpy = Math.min(n - c, buf.length);

	        if (stringMode)
	          ret += buf.slice(0, cpy);
	        else
	          buf.copy(ret, c, 0, cpy);

	        if (cpy < buf.length)
	          list[0] = buf.slice(cpy);
	        else
	          list.shift();

	        c += cpy;
	      }
	    }
	  }

	  return ret;
	}

	function endReadable(stream) {
	  var state = stream._readableState;

	  // If we get here before consuming all the bytes, then that is a
	  // bug in node.  Should never happen.
	  if (state.length > 0)
	    throw new Error('endReadable called on non-empty stream');

	  if (!state.endEmitted) {
	    state.ended = true;
	    process.nextTick(function() {
	      // Check that we didn't get one last unshift.
	      if (!state.endEmitted && state.length === 0) {
	        state.endEmitted = true;
	        stream.readable = false;
	        stream.emit('end');
	      }
	    });
	  }
	}

	function forEach (xs, f) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    f(xs[i], i);
	  }
	}

	function indexOf (xs, x) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    if (xs[i] === x) return i;
	  }
	  return -1;
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(22)))

/***/ },
/* 32 */
/***/ function(module, exports) {

	module.exports = Array.isArray || function (arr) {
	  return Object.prototype.toString.call(arr) == '[object Array]';
	};


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer, global) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */

	'use strict'

	var base64 = __webpack_require__(34)
	var ieee754 = __webpack_require__(35)
	var isArray = __webpack_require__(36)

	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50
	Buffer.poolSize = 8192 // not used by this implementation

	var rootParent = {}

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
	 *     on objects.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.

	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	  ? global.TYPED_ARRAY_SUPPORT
	  : typedArraySupport()

	function typedArraySupport () {
	  function Bar () {}
	  try {
	    var arr = new Uint8Array(1)
	    arr.foo = function () { return 42 }
	    arr.constructor = Bar
	    return arr.foo() === 42 && // typed array instances can be augmented
	        arr.constructor === Bar && // constructor can be set
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	}

	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}

	/**
	 * Class: Buffer
	 * =============
	 *
	 * The Buffer constructor returns instances of `Uint8Array` that are augmented
	 * with function properties for all the node `Buffer` API functions. We use
	 * `Uint8Array` so that square bracket notation works as expected -- it returns
	 * a single octet.
	 *
	 * By augmenting the instances, we can avoid modifying the `Uint8Array`
	 * prototype.
	 */
	function Buffer (arg) {
	  if (!(this instanceof Buffer)) {
	    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
	    if (arguments.length > 1) return new Buffer(arg, arguments[1])
	    return new Buffer(arg)
	  }

	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    this.length = 0
	    this.parent = undefined
	  }

	  // Common case.
	  if (typeof arg === 'number') {
	    return fromNumber(this, arg)
	  }

	  // Slightly less common case.
	  if (typeof arg === 'string') {
	    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
	  }

	  // Unusual.
	  return fromObject(this, arg)
	}

	function fromNumber (that, length) {
	  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < length; i++) {
	      that[i] = 0
	    }
	  }
	  return that
	}

	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

	  // Assumption: byteLength() return value is always < kMaxLength.
	  var length = byteLength(string, encoding) | 0
	  that = allocate(that, length)

	  that.write(string, encoding)
	  return that
	}

	function fromObject (that, object) {
	  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

	  if (isArray(object)) return fromArray(that, object)

	  if (object == null) {
	    throw new TypeError('must start with number, buffer, array or string')
	  }

	  if (typeof ArrayBuffer !== 'undefined') {
	    if (object.buffer instanceof ArrayBuffer) {
	      return fromTypedArray(that, object)
	    }
	    if (object instanceof ArrayBuffer) {
	      return fromArrayBuffer(that, object)
	    }
	  }

	  if (object.length) return fromArrayLike(that, object)

	  return fromJsonObject(that, object)
	}

	function fromBuffer (that, buffer) {
	  var length = checked(buffer.length) | 0
	  that = allocate(that, length)
	  buffer.copy(that, 0, 0, length)
	  return that
	}

	function fromArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Duplicate of fromArray() to keep fromArray() monomorphic.
	function fromTypedArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  // Truncating the elements is probably not what people expect from typed
	  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
	  // of the old Buffer constructor.
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	function fromArrayBuffer (that, array) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    array.byteLength
	    that = Buffer._augment(new Uint8Array(array))
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromTypedArray(that, new Uint8Array(array))
	  }
	  return that
	}

	function fromArrayLike (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
	// Returns a zero-length buffer for inputs that don't conform to the spec.
	function fromJsonObject (that, object) {
	  var array
	  var length = 0

	  if (object.type === 'Buffer' && isArray(object.data)) {
	    array = object.data
	    length = checked(array.length) | 0
	  }
	  that = allocate(that, length)

	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype
	  Buffer.__proto__ = Uint8Array
	} else {
	  // pre-set for values that may exist in the future
	  Buffer.prototype.length = undefined
	  Buffer.prototype.parent = undefined
	}

	function allocate (that, length) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = Buffer._augment(new Uint8Array(length))
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that.length = length
	    that._isBuffer = true
	  }

	  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
	  if (fromPool) that.parent = rootParent

	  return that
	}

	function checked (length) {
	  // Note: cannot use `length < kMaxLength` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}

	function SlowBuffer (subject, encoding) {
	  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

	  var buf = new Buffer(subject, encoding)
	  delete buf.parent
	  return buf
	}

	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }

	  if (a === b) return 0

	  var x = a.length
	  var y = b.length

	  var i = 0
	  var len = Math.min(x, y)
	  while (i < len) {
	    if (a[i] !== b[i]) break

	    ++i
	  }

	  if (i !== len) {
	    x = a[i]
	    y = b[i]
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'binary':
	    case 'base64':
	    case 'raw':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}

	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

	  if (list.length === 0) {
	    return new Buffer(0)
	  }

	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; i++) {
	      length += list[i].length
	    }
	  }

	  var buf = new Buffer(length)
	  var pos = 0
	  for (i = 0; i < list.length; i++) {
	    var item = list[i]
	    item.copy(buf, pos)
	    pos += item.length
	  }
	  return buf
	}

	function byteLength (string, encoding) {
	  if (typeof string !== 'string') string = '' + string

	  var len = string.length
	  if (len === 0) return 0

	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'binary':
	      // Deprecated
	      case 'raw':
	      case 'raws':
	        return len
	      case 'utf8':
	      case 'utf-8':
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength

	function slowToString (encoding, start, end) {
	  var loweredCase = false

	  start = start | 0
	  end = end === undefined || end === Infinity ? this.length : end | 0

	  if (!encoding) encoding = 'utf8'
	  if (start < 0) start = 0
	  if (end > this.length) end = this.length
	  if (end <= start) return ''

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'binary':
	        return binarySlice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}

	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}

	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}

	Buffer.prototype.compare = function compare (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return 0
	  return Buffer.compare(this, b)
	}

	Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
	  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
	  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
	  byteOffset >>= 0

	  if (this.length === 0) return -1
	  if (byteOffset >= this.length) return -1

	  // Negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

	  if (typeof val === 'string') {
	    if (val.length === 0) return -1 // special case: looking for empty string always fails
	    return String.prototype.indexOf.call(this, val, byteOffset)
	  }
	  if (Buffer.isBuffer(val)) {
	    return arrayIndexOf(this, val, byteOffset)
	  }
	  if (typeof val === 'number') {
	    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
	      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
	    }
	    return arrayIndexOf(this, [ val ], byteOffset)
	  }

	  function arrayIndexOf (arr, val, byteOffset) {
	    var foundIndex = -1
	    for (var i = 0; byteOffset + i < arr.length; i++) {
	      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
	      } else {
	        foundIndex = -1
	      }
	    }
	    return -1
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	// `get` is deprecated
	Buffer.prototype.get = function get (offset) {
	  console.log('.get() is deprecated. Access using array indexes instead.')
	  return this.readUInt8(offset)
	}

	// `set` is deprecated
	Buffer.prototype.set = function set (v, offset) {
	  console.log('.set() is deprecated. Access using array indexes instead.')
	  return this.writeUInt8(v, offset)
	}

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; i++) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) throw new Error('Invalid hex string')
	    buf[offset + i] = parsed
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}

	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}

	function binaryWrite (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}

	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}

	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    var swap = encoding
	    encoding = offset
	    offset = length | 0
	    length = swap
	  }

	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining

	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('attempt to write outside buffer bounds')
	  }

	  if (!encoding) encoding = 'utf8'

	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)

	      case 'ascii':
	        return asciiWrite(this, string, offset, length)

	      case 'binary':
	        return binaryWrite(this, string, offset, length)

	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []

	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1

	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint

	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }

	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }

	    res.push(codePoint)
	    i += bytesPerSequence
	  }

	  return decodeCodePointsArray(res)
	}

	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000

	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }

	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}

	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}

	function binarySlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length

	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len

	  var out = ''
	  for (var i = start; i < end; i++) {
	    out += toHex(buf[i])
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end

	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }

	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }

	  if (end < start) end = start

	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = Buffer._augment(this.subarray(start, end))
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; i++) {
	      newBuf[i] = this[i + start]
	    }
	  }

	  if (newBuf.length) newBuf.parent = this.parent || this

	  return newBuf
	}

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }

	  return val
	}

	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }

	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }

	  return val
	}

	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}

	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}

	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}

	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}

	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	}

	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}

	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}

	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = 0
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = byteLength - 1
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	  if (offset < 0) throw new RangeError('index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }

	  var len = end - start
	  var i

	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; i--) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; i++) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    target._set(this.subarray(start, start + len), targetStart)
	  }

	  return len
	}

	// fill(value, start=0, end=buffer.length)
	Buffer.prototype.fill = function fill (value, start, end) {
	  if (!value) value = 0
	  if (!start) start = 0
	  if (!end) end = this.length

	  if (end < start) throw new RangeError('end < start')

	  // Fill 0 bytes; we're done
	  if (end === start) return
	  if (this.length === 0) return

	  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
	  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

	  var i
	  if (typeof value === 'number') {
	    for (i = start; i < end; i++) {
	      this[i] = value
	    }
	  } else {
	    var bytes = utf8ToBytes(value.toString())
	    var len = bytes.length
	    for (i = start; i < end; i++) {
	      this[i] = bytes[i % len]
	    }
	  }

	  return this
	}

	/**
	 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
	 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
	 */
	Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
	  if (typeof Uint8Array !== 'undefined') {
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	      return (new Buffer(this)).buffer
	    } else {
	      var buf = new Uint8Array(this.length)
	      for (var i = 0, len = buf.length; i < len; i += 1) {
	        buf[i] = this[i]
	      }
	      return buf.buffer
	    }
	  } else {
	    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
	  }
	}

	// HELPER FUNCTIONS
	// ================

	var BP = Buffer.prototype

	/**
	 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
	 */
	Buffer._augment = function _augment (arr) {
	  arr.constructor = Buffer
	  arr._isBuffer = true

	  // save reference to original Uint8Array set method before overwriting
	  arr._set = arr.set

	  // deprecated
	  arr.get = BP.get
	  arr.set = BP.set

	  arr.write = BP.write
	  arr.toString = BP.toString
	  arr.toLocaleString = BP.toString
	  arr.toJSON = BP.toJSON
	  arr.equals = BP.equals
	  arr.compare = BP.compare
	  arr.indexOf = BP.indexOf
	  arr.copy = BP.copy
	  arr.slice = BP.slice
	  arr.readUIntLE = BP.readUIntLE
	  arr.readUIntBE = BP.readUIntBE
	  arr.readUInt8 = BP.readUInt8
	  arr.readUInt16LE = BP.readUInt16LE
	  arr.readUInt16BE = BP.readUInt16BE
	  arr.readUInt32LE = BP.readUInt32LE
	  arr.readUInt32BE = BP.readUInt32BE
	  arr.readIntLE = BP.readIntLE
	  arr.readIntBE = BP.readIntBE
	  arr.readInt8 = BP.readInt8
	  arr.readInt16LE = BP.readInt16LE
	  arr.readInt16BE = BP.readInt16BE
	  arr.readInt32LE = BP.readInt32LE
	  arr.readInt32BE = BP.readInt32BE
	  arr.readFloatLE = BP.readFloatLE
	  arr.readFloatBE = BP.readFloatBE
	  arr.readDoubleLE = BP.readDoubleLE
	  arr.readDoubleBE = BP.readDoubleBE
	  arr.writeUInt8 = BP.writeUInt8
	  arr.writeUIntLE = BP.writeUIntLE
	  arr.writeUIntBE = BP.writeUIntBE
	  arr.writeUInt16LE = BP.writeUInt16LE
	  arr.writeUInt16BE = BP.writeUInt16BE
	  arr.writeUInt32LE = BP.writeUInt32LE
	  arr.writeUInt32BE = BP.writeUInt32BE
	  arr.writeIntLE = BP.writeIntLE
	  arr.writeIntBE = BP.writeIntBE
	  arr.writeInt8 = BP.writeInt8
	  arr.writeInt16LE = BP.writeInt16LE
	  arr.writeInt16BE = BP.writeInt16BE
	  arr.writeInt32LE = BP.writeInt32LE
	  arr.writeInt32BE = BP.writeInt32BE
	  arr.writeFloatLE = BP.writeFloatLE
	  arr.writeFloatBE = BP.writeFloatBE
	  arr.writeDoubleLE = BP.writeDoubleLE
	  arr.writeDoubleBE = BP.writeDoubleBE
	  arr.fill = BP.fill
	  arr.inspect = BP.inspect
	  arr.toArrayBuffer = BP.toArrayBuffer

	  return arr
	}

	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []

	  for (var i = 0; i < length; i++) {
	    codePoint = string.charCodeAt(i)

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }

	        // valid lead
	        leadSurrogate = codePoint

	        continue
	      }

	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }

	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }

	    leadSurrogate = null

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }

	  return byteArray
	}

	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; i++) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(33).Buffer, (function() { return this; }())))

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	;(function (exports) {
		'use strict';

	  var Arr = (typeof Uint8Array !== 'undefined')
	    ? Uint8Array
	    : Array

		var PLUS   = '+'.charCodeAt(0)
		var SLASH  = '/'.charCodeAt(0)
		var NUMBER = '0'.charCodeAt(0)
		var LOWER  = 'a'.charCodeAt(0)
		var UPPER  = 'A'.charCodeAt(0)
		var PLUS_URL_SAFE = '-'.charCodeAt(0)
		var SLASH_URL_SAFE = '_'.charCodeAt(0)

		function decode (elt) {
			var code = elt.charCodeAt(0)
			if (code === PLUS ||
			    code === PLUS_URL_SAFE)
				return 62 // '+'
			if (code === SLASH ||
			    code === SLASH_URL_SAFE)
				return 63 // '/'
			if (code < NUMBER)
				return -1 //no match
			if (code < NUMBER + 10)
				return code - NUMBER + 26 + 26
			if (code < UPPER + 26)
				return code - UPPER
			if (code < LOWER + 26)
				return code - LOWER + 26
		}

		function b64ToByteArray (b64) {
			var i, j, l, tmp, placeHolders, arr

			if (b64.length % 4 > 0) {
				throw new Error('Invalid string. Length must be a multiple of 4')
			}

			// the number of equal signs (place holders)
			// if there are two placeholders, than the two characters before it
			// represent one byte
			// if there is only one, then the three characters before it represent 2 bytes
			// this is just a cheap hack to not do indexOf twice
			var len = b64.length
			placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

			// base64 is 4/3 + up to two characters of the original data
			arr = new Arr(b64.length * 3 / 4 - placeHolders)

			// if there are placeholders, only get up to the last complete 4 chars
			l = placeHolders > 0 ? b64.length - 4 : b64.length

			var L = 0

			function push (v) {
				arr[L++] = v
			}

			for (i = 0, j = 0; i < l; i += 4, j += 3) {
				tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
				push((tmp & 0xFF0000) >> 16)
				push((tmp & 0xFF00) >> 8)
				push(tmp & 0xFF)
			}

			if (placeHolders === 2) {
				tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
				push(tmp & 0xFF)
			} else if (placeHolders === 1) {
				tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
				push((tmp >> 8) & 0xFF)
				push(tmp & 0xFF)
			}

			return arr
		}

		function uint8ToBase64 (uint8) {
			var i,
				extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
				output = "",
				temp, length

			function encode (num) {
				return lookup.charAt(num)
			}

			function tripletToBase64 (num) {
				return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
			}

			// go through the array every three bytes, we'll deal with trailing stuff later
			for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
				temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
				output += tripletToBase64(temp)
			}

			// pad the end with zeros, but make sure to not forget the extra bytes
			switch (extraBytes) {
				case 1:
					temp = uint8[uint8.length - 1]
					output += encode(temp >> 2)
					output += encode((temp << 4) & 0x3F)
					output += '=='
					break
				case 2:
					temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
					output += encode(temp >> 10)
					output += encode((temp >> 4) & 0x3F)
					output += encode((temp << 2) & 0x3F)
					output += '='
					break
			}

			return output
		}

		exports.toByteArray = b64ToByteArray
		exports.fromByteArray = uint8ToBase64
	}( false ? (this.base64js = {}) : exports))


/***/ },
/* 35 */
/***/ function(module, exports) {

	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]

	  i += d

	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}

	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

	  value = Math.abs(value)

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }

	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128
	}


/***/ },
/* 36 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.

	function isArray(arg) {
	  if (Array.isArray) {
	    return Array.isArray(arg);
	  }
	  return objectToString(arg) === '[object Array]';
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = Buffer.isBuffer;

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(33).Buffer))

/***/ },
/* 38 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// a duplex stream is just a stream that is both readable and writable.
	// Since JS doesn't have multiple prototypal inheritance, this class
	// prototypally inherits from Readable, and then parasitically from
	// Writable.

	module.exports = Duplex;

	/*<replacement>*/
	var objectKeys = Object.keys || function (obj) {
	  var keys = [];
	  for (var key in obj) keys.push(key);
	  return keys;
	}
	/*</replacement>*/


	/*<replacement>*/
	var util = __webpack_require__(37);
	util.inherits = __webpack_require__(29);
	/*</replacement>*/

	var Readable = __webpack_require__(31);
	var Writable = __webpack_require__(40);

	util.inherits(Duplex, Readable);

	forEach(objectKeys(Writable.prototype), function(method) {
	  if (!Duplex.prototype[method])
	    Duplex.prototype[method] = Writable.prototype[method];
	});

	function Duplex(options) {
	  if (!(this instanceof Duplex))
	    return new Duplex(options);

	  Readable.call(this, options);
	  Writable.call(this, options);

	  if (options && options.readable === false)
	    this.readable = false;

	  if (options && options.writable === false)
	    this.writable = false;

	  this.allowHalfOpen = true;
	  if (options && options.allowHalfOpen === false)
	    this.allowHalfOpen = false;

	  this.once('end', onend);
	}

	// the no-half-open enforcer
	function onend() {
	  // if we allow half-open state, or if the writable side ended,
	  // then we're ok.
	  if (this.allowHalfOpen || this._writableState.ended)
	    return;

	  // no more data can be written.
	  // But allow more writes to happen in this tick.
	  process.nextTick(this.end.bind(this));
	}

	function forEach (xs, f) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    f(xs[i], i);
	  }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(22)))

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// A bit simpler than readable streams.
	// Implement an async ._write(chunk, cb), and it'll handle all
	// the drain event emission and buffering.

	module.exports = Writable;

	/*<replacement>*/
	var Buffer = __webpack_require__(33).Buffer;
	/*</replacement>*/

	Writable.WritableState = WritableState;


	/*<replacement>*/
	var util = __webpack_require__(37);
	util.inherits = __webpack_require__(29);
	/*</replacement>*/

	var Stream = __webpack_require__(28);

	util.inherits(Writable, Stream);

	function WriteReq(chunk, encoding, cb) {
	  this.chunk = chunk;
	  this.encoding = encoding;
	  this.callback = cb;
	}

	function WritableState(options, stream) {
	  var Duplex = __webpack_require__(39);

	  options = options || {};

	  // the point at which write() starts returning false
	  // Note: 0 is a valid value, means that we always return false if
	  // the entire buffer is not flushed immediately on write()
	  var hwm = options.highWaterMark;
	  var defaultHwm = options.objectMode ? 16 : 16 * 1024;
	  this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;

	  // object stream flag to indicate whether or not this stream
	  // contains buffers or objects.
	  this.objectMode = !!options.objectMode;

	  if (stream instanceof Duplex)
	    this.objectMode = this.objectMode || !!options.writableObjectMode;

	  // cast to ints.
	  this.highWaterMark = ~~this.highWaterMark;

	  this.needDrain = false;
	  // at the start of calling end()
	  this.ending = false;
	  // when end() has been called, and returned
	  this.ended = false;
	  // when 'finish' is emitted
	  this.finished = false;

	  // should we decode strings into buffers before passing to _write?
	  // this is here so that some node-core streams can optimize string
	  // handling at a lower level.
	  var noDecode = options.decodeStrings === false;
	  this.decodeStrings = !noDecode;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // not an actual buffer we keep track of, but a measurement
	  // of how much we're waiting to get pushed to some underlying
	  // socket or file.
	  this.length = 0;

	  // a flag to see when we're in the middle of a write.
	  this.writing = false;

	  // when true all writes will be buffered until .uncork() call
	  this.corked = 0;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, because any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // a flag to know if we're processing previously buffered items, which
	  // may call the _write() callback in the same tick, so that we don't
	  // end up in an overlapped onwrite situation.
	  this.bufferProcessing = false;

	  // the callback that's passed to _write(chunk,cb)
	  this.onwrite = function(er) {
	    onwrite(stream, er);
	  };

	  // the callback that the user supplies to write(chunk,encoding,cb)
	  this.writecb = null;

	  // the amount that is being written when _write is called.
	  this.writelen = 0;

	  this.buffer = [];

	  // number of pending user-supplied write callbacks
	  // this must be 0 before 'finish' can be emitted
	  this.pendingcb = 0;

	  // emit prefinish if the only thing we're waiting for is _write cbs
	  // This is relevant for synchronous Transform streams
	  this.prefinished = false;

	  // True if the error was already emitted and should not be thrown again
	  this.errorEmitted = false;
	}

	function Writable(options) {
	  var Duplex = __webpack_require__(39);

	  // Writable ctor is applied to Duplexes, though they're not
	  // instanceof Writable, they're instanceof Readable.
	  if (!(this instanceof Writable) && !(this instanceof Duplex))
	    return new Writable(options);

	  this._writableState = new WritableState(options, this);

	  // legacy.
	  this.writable = true;

	  Stream.call(this);
	}

	// Otherwise people can pipe Writable streams, which is just wrong.
	Writable.prototype.pipe = function() {
	  this.emit('error', new Error('Cannot pipe. Not readable.'));
	};


	function writeAfterEnd(stream, state, cb) {
	  var er = new Error('write after end');
	  // TODO: defer error events consistently everywhere, not just the cb
	  stream.emit('error', er);
	  process.nextTick(function() {
	    cb(er);
	  });
	}

	// If we get something that is not a buffer, string, null, or undefined,
	// and we're not in objectMode, then that's an error.
	// Otherwise stream chunks are all considered to be of length=1, and the
	// watermarks determine how many objects to keep in the buffer, rather than
	// how many bytes or characters.
	function validChunk(stream, state, chunk, cb) {
	  var valid = true;
	  if (!util.isBuffer(chunk) &&
	      !util.isString(chunk) &&
	      !util.isNullOrUndefined(chunk) &&
	      !state.objectMode) {
	    var er = new TypeError('Invalid non-string/buffer chunk');
	    stream.emit('error', er);
	    process.nextTick(function() {
	      cb(er);
	    });
	    valid = false;
	  }
	  return valid;
	}

	Writable.prototype.write = function(chunk, encoding, cb) {
	  var state = this._writableState;
	  var ret = false;

	  if (util.isFunction(encoding)) {
	    cb = encoding;
	    encoding = null;
	  }

	  if (util.isBuffer(chunk))
	    encoding = 'buffer';
	  else if (!encoding)
	    encoding = state.defaultEncoding;

	  if (!util.isFunction(cb))
	    cb = function() {};

	  if (state.ended)
	    writeAfterEnd(this, state, cb);
	  else if (validChunk(this, state, chunk, cb)) {
	    state.pendingcb++;
	    ret = writeOrBuffer(this, state, chunk, encoding, cb);
	  }

	  return ret;
	};

	Writable.prototype.cork = function() {
	  var state = this._writableState;

	  state.corked++;
	};

	Writable.prototype.uncork = function() {
	  var state = this._writableState;

	  if (state.corked) {
	    state.corked--;

	    if (!state.writing &&
	        !state.corked &&
	        !state.finished &&
	        !state.bufferProcessing &&
	        state.buffer.length)
	      clearBuffer(this, state);
	  }
	};

	function decodeChunk(state, chunk, encoding) {
	  if (!state.objectMode &&
	      state.decodeStrings !== false &&
	      util.isString(chunk)) {
	    chunk = new Buffer(chunk, encoding);
	  }
	  return chunk;
	}

	// if we're already writing something, then just put this
	// in the queue, and wait our turn.  Otherwise, call _write
	// If we return false, then we need a drain event, so set that flag.
	function writeOrBuffer(stream, state, chunk, encoding, cb) {
	  chunk = decodeChunk(state, chunk, encoding);
	  if (util.isBuffer(chunk))
	    encoding = 'buffer';
	  var len = state.objectMode ? 1 : chunk.length;

	  state.length += len;

	  var ret = state.length < state.highWaterMark;
	  // we must ensure that previous needDrain will not be reset to false.
	  if (!ret)
	    state.needDrain = true;

	  if (state.writing || state.corked)
	    state.buffer.push(new WriteReq(chunk, encoding, cb));
	  else
	    doWrite(stream, state, false, len, chunk, encoding, cb);

	  return ret;
	}

	function doWrite(stream, state, writev, len, chunk, encoding, cb) {
	  state.writelen = len;
	  state.writecb = cb;
	  state.writing = true;
	  state.sync = true;
	  if (writev)
	    stream._writev(chunk, state.onwrite);
	  else
	    stream._write(chunk, encoding, state.onwrite);
	  state.sync = false;
	}

	function onwriteError(stream, state, sync, er, cb) {
	  if (sync)
	    process.nextTick(function() {
	      state.pendingcb--;
	      cb(er);
	    });
	  else {
	    state.pendingcb--;
	    cb(er);
	  }

	  stream._writableState.errorEmitted = true;
	  stream.emit('error', er);
	}

	function onwriteStateUpdate(state) {
	  state.writing = false;
	  state.writecb = null;
	  state.length -= state.writelen;
	  state.writelen = 0;
	}

	function onwrite(stream, er) {
	  var state = stream._writableState;
	  var sync = state.sync;
	  var cb = state.writecb;

	  onwriteStateUpdate(state);

	  if (er)
	    onwriteError(stream, state, sync, er, cb);
	  else {
	    // Check if we're actually ready to finish, but don't emit yet
	    var finished = needFinish(stream, state);

	    if (!finished &&
	        !state.corked &&
	        !state.bufferProcessing &&
	        state.buffer.length) {
	      clearBuffer(stream, state);
	    }

	    if (sync) {
	      process.nextTick(function() {
	        afterWrite(stream, state, finished, cb);
	      });
	    } else {
	      afterWrite(stream, state, finished, cb);
	    }
	  }
	}

	function afterWrite(stream, state, finished, cb) {
	  if (!finished)
	    onwriteDrain(stream, state);
	  state.pendingcb--;
	  cb();
	  finishMaybe(stream, state);
	}

	// Must force callback to be called on nextTick, so that we don't
	// emit 'drain' before the write() consumer gets the 'false' return
	// value, and has a chance to attach a 'drain' listener.
	function onwriteDrain(stream, state) {
	  if (state.length === 0 && state.needDrain) {
	    state.needDrain = false;
	    stream.emit('drain');
	  }
	}


	// if there's something in the buffer waiting, then process it
	function clearBuffer(stream, state) {
	  state.bufferProcessing = true;

	  if (stream._writev && state.buffer.length > 1) {
	    // Fast case, write everything using _writev()
	    var cbs = [];
	    for (var c = 0; c < state.buffer.length; c++)
	      cbs.push(state.buffer[c].callback);

	    // count the one we are adding, as well.
	    // TODO(isaacs) clean this up
	    state.pendingcb++;
	    doWrite(stream, state, true, state.length, state.buffer, '', function(err) {
	      for (var i = 0; i < cbs.length; i++) {
	        state.pendingcb--;
	        cbs[i](err);
	      }
	    });

	    // Clear buffer
	    state.buffer = [];
	  } else {
	    // Slow case, write chunks one-by-one
	    for (var c = 0; c < state.buffer.length; c++) {
	      var entry = state.buffer[c];
	      var chunk = entry.chunk;
	      var encoding = entry.encoding;
	      var cb = entry.callback;
	      var len = state.objectMode ? 1 : chunk.length;

	      doWrite(stream, state, false, len, chunk, encoding, cb);

	      // if we didn't call the onwrite immediately, then
	      // it means that we need to wait until it does.
	      // also, that means that the chunk and cb are currently
	      // being processed, so move the buffer counter past them.
	      if (state.writing) {
	        c++;
	        break;
	      }
	    }

	    if (c < state.buffer.length)
	      state.buffer = state.buffer.slice(c);
	    else
	      state.buffer.length = 0;
	  }

	  state.bufferProcessing = false;
	}

	Writable.prototype._write = function(chunk, encoding, cb) {
	  cb(new Error('not implemented'));

	};

	Writable.prototype._writev = null;

	Writable.prototype.end = function(chunk, encoding, cb) {
	  var state = this._writableState;

	  if (util.isFunction(chunk)) {
	    cb = chunk;
	    chunk = null;
	    encoding = null;
	  } else if (util.isFunction(encoding)) {
	    cb = encoding;
	    encoding = null;
	  }

	  if (!util.isNullOrUndefined(chunk))
	    this.write(chunk, encoding);

	  // .end() fully uncorks
	  if (state.corked) {
	    state.corked = 1;
	    this.uncork();
	  }

	  // ignore unnecessary end() calls.
	  if (!state.ending && !state.finished)
	    endWritable(this, state, cb);
	};


	function needFinish(stream, state) {
	  return (state.ending &&
	          state.length === 0 &&
	          !state.finished &&
	          !state.writing);
	}

	function prefinish(stream, state) {
	  if (!state.prefinished) {
	    state.prefinished = true;
	    stream.emit('prefinish');
	  }
	}

	function finishMaybe(stream, state) {
	  var need = needFinish(stream, state);
	  if (need) {
	    if (state.pendingcb === 0) {
	      prefinish(stream, state);
	      state.finished = true;
	      stream.emit('finish');
	    } else
	      prefinish(stream, state);
	  }
	  return need;
	}

	function endWritable(stream, state, cb) {
	  state.ending = true;
	  finishMaybe(stream, state);
	  if (cb) {
	    if (state.finished)
	      process.nextTick(cb);
	    else
	      stream.once('finish', cb);
	  }
	  state.ended = true;
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(22)))

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var Buffer = __webpack_require__(42).Buffer;

	var isBufferEncoding = Buffer.isEncoding
	  || function(encoding) {
	       switch (encoding && encoding.toLowerCase()) {
	         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
	         default: return false;
	       }
	     }


	function assertEncoding(encoding) {
	  if (encoding && !isBufferEncoding(encoding)) {
	    throw new Error('Unknown encoding: ' + encoding);
	  }
	}

	// StringDecoder provides an interface for efficiently splitting a series of
	// buffers into a series of JS strings without breaking apart multi-byte
	// characters. CESU-8 is handled as part of the UTF-8 encoding.
	//
	// @TODO Handling all encodings inside a single object makes it very difficult
	// to reason about this code, so it should be split up in the future.
	// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
	// points as used by CESU-8.
	var StringDecoder = exports.StringDecoder = function(encoding) {
	  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
	  assertEncoding(encoding);
	  switch (this.encoding) {
	    case 'utf8':
	      // CESU-8 represents each of Surrogate Pair by 3-bytes
	      this.surrogateSize = 3;
	      break;
	    case 'ucs2':
	    case 'utf16le':
	      // UTF-16 represents each of Surrogate Pair by 2-bytes
	      this.surrogateSize = 2;
	      this.detectIncompleteChar = utf16DetectIncompleteChar;
	      break;
	    case 'base64':
	      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
	      this.surrogateSize = 3;
	      this.detectIncompleteChar = base64DetectIncompleteChar;
	      break;
	    default:
	      this.write = passThroughWrite;
	      return;
	  }

	  // Enough space to store all bytes of a single character. UTF-8 needs 4
	  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
	  this.charBuffer = new Buffer(6);
	  // Number of bytes received for the current incomplete multi-byte character.
	  this.charReceived = 0;
	  // Number of bytes expected for the current incomplete multi-byte character.
	  this.charLength = 0;
	};


	// write decodes the given buffer and returns it as JS string that is
	// guaranteed to not contain any partial multi-byte characters. Any partial
	// character found at the end of the buffer is buffered up, and will be
	// returned when calling write again with the remaining bytes.
	//
	// Note: Converting a Buffer containing an orphan surrogate to a String
	// currently works, but converting a String to a Buffer (via `new Buffer`, or
	// Buffer#write) will replace incomplete surrogates with the unicode
	// replacement character. See https://codereview.chromium.org/121173009/ .
	StringDecoder.prototype.write = function(buffer) {
	  var charStr = '';
	  // if our last write ended with an incomplete multibyte character
	  while (this.charLength) {
	    // determine how many remaining bytes this buffer has to offer for this char
	    var available = (buffer.length >= this.charLength - this.charReceived) ?
	        this.charLength - this.charReceived :
	        buffer.length;

	    // add the new bytes to the char buffer
	    buffer.copy(this.charBuffer, this.charReceived, 0, available);
	    this.charReceived += available;

	    if (this.charReceived < this.charLength) {
	      // still not enough chars in this buffer? wait for more ...
	      return '';
	    }

	    // remove bytes belonging to the current character from the buffer
	    buffer = buffer.slice(available, buffer.length);

	    // get the character that was split
	    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

	    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
	    var charCode = charStr.charCodeAt(charStr.length - 1);
	    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
	      this.charLength += this.surrogateSize;
	      charStr = '';
	      continue;
	    }
	    this.charReceived = this.charLength = 0;

	    // if there are no more bytes in this buffer, just emit our char
	    if (buffer.length === 0) {
	      return charStr;
	    }
	    break;
	  }

	  // determine and set charLength / charReceived
	  this.detectIncompleteChar(buffer);

	  var end = buffer.length;
	  if (this.charLength) {
	    // buffer the incomplete character bytes we got
	    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
	    end -= this.charReceived;
	  }

	  charStr += buffer.toString(this.encoding, 0, end);

	  var end = charStr.length - 1;
	  var charCode = charStr.charCodeAt(end);
	  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
	  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
	    var size = this.surrogateSize;
	    this.charLength += size;
	    this.charReceived += size;
	    this.charBuffer.copy(this.charBuffer, size, 0, size);
	    buffer.copy(this.charBuffer, 0, 0, size);
	    return charStr.substring(0, end);
	  }

	  // or just emit the charStr
	  return charStr;
	};

	// detectIncompleteChar determines if there is an incomplete UTF-8 character at
	// the end of the given buffer. If so, it sets this.charLength to the byte
	// length that character, and sets this.charReceived to the number of bytes
	// that are available for this character.
	StringDecoder.prototype.detectIncompleteChar = function(buffer) {
	  // determine how many bytes we have to check at the end of this buffer
	  var i = (buffer.length >= 3) ? 3 : buffer.length;

	  // Figure out if one of the last i bytes of our buffer announces an
	  // incomplete char.
	  for (; i > 0; i--) {
	    var c = buffer[buffer.length - i];

	    // See http://en.wikipedia.org/wiki/UTF-8#Description

	    // 110XXXXX
	    if (i == 1 && c >> 5 == 0x06) {
	      this.charLength = 2;
	      break;
	    }

	    // 1110XXXX
	    if (i <= 2 && c >> 4 == 0x0E) {
	      this.charLength = 3;
	      break;
	    }

	    // 11110XXX
	    if (i <= 3 && c >> 3 == 0x1E) {
	      this.charLength = 4;
	      break;
	    }
	  }
	  this.charReceived = i;
	};

	StringDecoder.prototype.end = function(buffer) {
	  var res = '';
	  if (buffer && buffer.length)
	    res = this.write(buffer);

	  if (this.charReceived) {
	    var cr = this.charReceived;
	    var buf = this.charBuffer;
	    var enc = this.encoding;
	    res += buf.slice(0, cr).toString(enc);
	  }

	  return res;
	};

	function passThroughWrite(buffer) {
	  return buffer.toString(this.encoding);
	}

	function utf16DetectIncompleteChar(buffer) {
	  this.charReceived = buffer.length % 2;
	  this.charLength = this.charReceived ? 2 : 0;
	}

	function base64DetectIncompleteChar(buffer) {
	  this.charReceived = buffer.length % 3;
	  this.charLength = this.charReceived ? 3 : 0;
	}


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer, global) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */

	'use strict'

	var base64 = __webpack_require__(43)
	var ieee754 = __webpack_require__(35)
	var isArray = __webpack_require__(44)

	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.

	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	  ? global.TYPED_ARRAY_SUPPORT
	  : typedArraySupport()

	/*
	 * Export kMaxLength after typed array support is determined.
	 */
	exports.kMaxLength = kMaxLength()

	function typedArraySupport () {
	  try {
	    var arr = new Uint8Array(1)
	    arr.foo = function () { return 42 }
	    return arr.foo() === 42 && // typed array instances can be augmented
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	}

	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}

	function createBuffer (that, length) {
	  if (kMaxLength() < length) {
	    throw new RangeError('Invalid typed array length')
	  }
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = new Uint8Array(length)
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    if (that === null) {
	      that = new Buffer(length)
	    }
	    that.length = length
	  }

	  return that
	}

	/**
	 * The Buffer constructor returns instances of `Uint8Array` that have their
	 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
	 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
	 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
	 * returns a single octet.
	 *
	 * The `Uint8Array` prototype remains unmodified.
	 */

	function Buffer (arg, encodingOrOffset, length) {
	  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
	    return new Buffer(arg, encodingOrOffset, length)
	  }

	  // Common case.
	  if (typeof arg === 'number') {
	    if (typeof encodingOrOffset === 'string') {
	      throw new Error(
	        'If encoding is specified then the first argument must be a string'
	      )
	    }
	    return allocUnsafe(this, arg)
	  }
	  return from(this, arg, encodingOrOffset, length)
	}

	Buffer.poolSize = 8192 // not used by this implementation

	// TODO: Legacy, not needed anymore. Remove in next major version.
	Buffer._augment = function (arr) {
	  arr.__proto__ = Buffer.prototype
	  return arr
	}

	function from (that, value, encodingOrOffset, length) {
	  if (typeof value === 'number') {
	    throw new TypeError('"value" argument must not be a number')
	  }

	  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
	    return fromArrayBuffer(that, value, encodingOrOffset, length)
	  }

	  if (typeof value === 'string') {
	    return fromString(that, value, encodingOrOffset)
	  }

	  return fromObject(that, value)
	}

	/**
	 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
	 * if value is a number.
	 * Buffer.from(str[, encoding])
	 * Buffer.from(array)
	 * Buffer.from(buffer)
	 * Buffer.from(arrayBuffer[, byteOffset[, length]])
	 **/
	Buffer.from = function (value, encodingOrOffset, length) {
	  return from(null, value, encodingOrOffset, length)
	}

	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype
	  Buffer.__proto__ = Uint8Array
	  if (typeof Symbol !== 'undefined' && Symbol.species &&
	      Buffer[Symbol.species] === Buffer) {
	    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
	    Object.defineProperty(Buffer, Symbol.species, {
	      value: null,
	      configurable: true
	    })
	  }
	}

	function assertSize (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('"size" argument must be a number')
	  }
	}

	function alloc (that, size, fill, encoding) {
	  assertSize(size)
	  if (size <= 0) {
	    return createBuffer(that, size)
	  }
	  if (fill !== undefined) {
	    // Only pay attention to encoding if it's a string. This
	    // prevents accidentally sending in a number that would
	    // be interpretted as a start offset.
	    return typeof encoding === 'string'
	      ? createBuffer(that, size).fill(fill, encoding)
	      : createBuffer(that, size).fill(fill)
	  }
	  return createBuffer(that, size)
	}

	/**
	 * Creates a new filled Buffer instance.
	 * alloc(size[, fill[, encoding]])
	 **/
	Buffer.alloc = function (size, fill, encoding) {
	  return alloc(null, size, fill, encoding)
	}

	function allocUnsafe (that, size) {
	  assertSize(size)
	  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < size; i++) {
	      that[i] = 0
	    }
	  }
	  return that
	}

	/**
	 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
	 * */
	Buffer.allocUnsafe = function (size) {
	  return allocUnsafe(null, size)
	}
	/**
	 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
	 */
	Buffer.allocUnsafeSlow = function (size) {
	  return allocUnsafe(null, size)
	}

	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') {
	    encoding = 'utf8'
	  }

	  if (!Buffer.isEncoding(encoding)) {
	    throw new TypeError('"encoding" must be a valid string encoding')
	  }

	  var length = byteLength(string, encoding) | 0
	  that = createBuffer(that, length)

	  that.write(string, encoding)
	  return that
	}

	function fromArrayLike (that, array) {
	  var length = checked(array.length) | 0
	  that = createBuffer(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	function fromArrayBuffer (that, array, byteOffset, length) {
	  array.byteLength // this throws if `array` is not a valid ArrayBuffer

	  if (byteOffset < 0 || array.byteLength < byteOffset) {
	    throw new RangeError('\'offset\' is out of bounds')
	  }

	  if (array.byteLength < byteOffset + (length || 0)) {
	    throw new RangeError('\'length\' is out of bounds')
	  }

	  if (length === undefined) {
	    array = new Uint8Array(array, byteOffset)
	  } else {
	    array = new Uint8Array(array, byteOffset, length)
	  }

	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = array
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromArrayLike(that, array)
	  }
	  return that
	}

	function fromObject (that, obj) {
	  if (Buffer.isBuffer(obj)) {
	    var len = checked(obj.length) | 0
	    that = createBuffer(that, len)

	    if (that.length === 0) {
	      return that
	    }

	    obj.copy(that, 0, 0, len)
	    return that
	  }

	  if (obj) {
	    if ((typeof ArrayBuffer !== 'undefined' &&
	        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
	      if (typeof obj.length !== 'number' || isnan(obj.length)) {
	        return createBuffer(that, 0)
	      }
	      return fromArrayLike(that, obj)
	    }

	    if (obj.type === 'Buffer' && isArray(obj.data)) {
	      return fromArrayLike(that, obj.data)
	    }
	  }

	  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
	}

	function checked (length) {
	  // Note: cannot use `length < kMaxLength` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}

	function SlowBuffer (length) {
	  if (+length != length) { // eslint-disable-line eqeqeq
	    length = 0
	  }
	  return Buffer.alloc(+length)
	}

	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }

	  if (a === b) return 0

	  var x = a.length
	  var y = b.length

	  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
	    if (a[i] !== b[i]) {
	      x = a[i]
	      y = b[i]
	      break
	    }
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'binary':
	    case 'base64':
	    case 'raw':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}

	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) {
	    throw new TypeError('"list" argument must be an Array of Buffers')
	  }

	  if (list.length === 0) {
	    return Buffer.alloc(0)
	  }

	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; i++) {
	      length += list[i].length
	    }
	  }

	  var buffer = Buffer.allocUnsafe(length)
	  var pos = 0
	  for (i = 0; i < list.length; i++) {
	    var buf = list[i]
	    if (!Buffer.isBuffer(buf)) {
	      throw new TypeError('"list" argument must be an Array of Buffers')
	    }
	    buf.copy(buffer, pos)
	    pos += buf.length
	  }
	  return buffer
	}

	function byteLength (string, encoding) {
	  if (Buffer.isBuffer(string)) {
	    return string.length
	  }
	  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
	      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
	    return string.byteLength
	  }
	  if (typeof string !== 'string') {
	    string = '' + string
	  }

	  var len = string.length
	  if (len === 0) return 0

	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'binary':
	      // Deprecated
	      case 'raw':
	      case 'raws':
	        return len
	      case 'utf8':
	      case 'utf-8':
	      case undefined:
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength

	function slowToString (encoding, start, end) {
	  var loweredCase = false

	  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
	  // property of a typed array.

	  // This behaves neither like String nor Uint8Array in that we set start/end
	  // to their upper/lower bounds if the value passed is out of range.
	  // undefined is handled specially as per ECMA-262 6th Edition,
	  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
	  if (start === undefined || start < 0) {
	    start = 0
	  }
	  // Return early if start > this.length. Done here to prevent potential uint32
	  // coercion fail below.
	  if (start > this.length) {
	    return ''
	  }

	  if (end === undefined || end > this.length) {
	    end = this.length
	  }

	  if (end <= 0) {
	    return ''
	  }

	  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
	  end >>>= 0
	  start >>>= 0

	  if (end <= start) {
	    return ''
	  }

	  if (!encoding) encoding = 'utf8'

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'binary':
	        return binarySlice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
	// Buffer instances.
	Buffer.prototype._isBuffer = true

	function swap (b, n, m) {
	  var i = b[n]
	  b[n] = b[m]
	  b[m] = i
	}

	Buffer.prototype.swap16 = function swap16 () {
	  var len = this.length
	  if (len % 2 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 16-bits')
	  }
	  for (var i = 0; i < len; i += 2) {
	    swap(this, i, i + 1)
	  }
	  return this
	}

	Buffer.prototype.swap32 = function swap32 () {
	  var len = this.length
	  if (len % 4 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 32-bits')
	  }
	  for (var i = 0; i < len; i += 4) {
	    swap(this, i, i + 3)
	    swap(this, i + 1, i + 2)
	  }
	  return this
	}

	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}

	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}

	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}

	Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
	  if (!Buffer.isBuffer(target)) {
	    throw new TypeError('Argument must be a Buffer')
	  }

	  if (start === undefined) {
	    start = 0
	  }
	  if (end === undefined) {
	    end = target ? target.length : 0
	  }
	  if (thisStart === undefined) {
	    thisStart = 0
	  }
	  if (thisEnd === undefined) {
	    thisEnd = this.length
	  }

	  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
	    throw new RangeError('out of range index')
	  }

	  if (thisStart >= thisEnd && start >= end) {
	    return 0
	  }
	  if (thisStart >= thisEnd) {
	    return -1
	  }
	  if (start >= end) {
	    return 1
	  }

	  start >>>= 0
	  end >>>= 0
	  thisStart >>>= 0
	  thisEnd >>>= 0

	  if (this === target) return 0

	  var x = thisEnd - thisStart
	  var y = end - start
	  var len = Math.min(x, y)

	  var thisCopy = this.slice(thisStart, thisEnd)
	  var targetCopy = target.slice(start, end)

	  for (var i = 0; i < len; ++i) {
	    if (thisCopy[i] !== targetCopy[i]) {
	      x = thisCopy[i]
	      y = targetCopy[i]
	      break
	    }
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	function arrayIndexOf (arr, val, byteOffset, encoding) {
	  var indexSize = 1
	  var arrLength = arr.length
	  var valLength = val.length

	  if (encoding !== undefined) {
	    encoding = String(encoding).toLowerCase()
	    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
	        encoding === 'utf16le' || encoding === 'utf-16le') {
	      if (arr.length < 2 || val.length < 2) {
	        return -1
	      }
	      indexSize = 2
	      arrLength /= 2
	      valLength /= 2
	      byteOffset /= 2
	    }
	  }

	  function read (buf, i) {
	    if (indexSize === 1) {
	      return buf[i]
	    } else {
	      return buf.readUInt16BE(i * indexSize)
	    }
	  }

	  var foundIndex = -1
	  for (var i = 0; byteOffset + i < arrLength; i++) {
	    if (read(arr, byteOffset + i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
	      if (foundIndex === -1) foundIndex = i
	      if (i - foundIndex + 1 === valLength) return (byteOffset + foundIndex) * indexSize
	    } else {
	      if (foundIndex !== -1) i -= i - foundIndex
	      foundIndex = -1
	    }
	  }
	  return -1
	}

	Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
	  if (typeof byteOffset === 'string') {
	    encoding = byteOffset
	    byteOffset = 0
	  } else if (byteOffset > 0x7fffffff) {
	    byteOffset = 0x7fffffff
	  } else if (byteOffset < -0x80000000) {
	    byteOffset = -0x80000000
	  }
	  byteOffset >>= 0

	  if (this.length === 0) return -1
	  if (byteOffset >= this.length) return -1

	  // Negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

	  if (typeof val === 'string') {
	    val = Buffer.from(val, encoding)
	  }

	  if (Buffer.isBuffer(val)) {
	    // special case: looking for empty string/buffer always fails
	    if (val.length === 0) {
	      return -1
	    }
	    return arrayIndexOf(this, val, byteOffset, encoding)
	  }
	  if (typeof val === 'number') {
	    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
	      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
	    }
	    return arrayIndexOf(this, [ val ], byteOffset, encoding)
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
	  return this.indexOf(val, byteOffset, encoding) !== -1
	}

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; i++) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) return i
	    buf[offset + i] = parsed
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}

	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}

	function binaryWrite (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}

	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}

	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    throw new Error(
	      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
	    )
	  }

	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining

	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('Attempt to write outside buffer bounds')
	  }

	  if (!encoding) encoding = 'utf8'

	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)

	      case 'ascii':
	        return asciiWrite(this, string, offset, length)

	      case 'binary':
	        return binaryWrite(this, string, offset, length)

	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []

	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1

	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint

	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }

	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }

	    res.push(codePoint)
	    i += bytesPerSequence
	  }

	  return decodeCodePointsArray(res)
	}

	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000

	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }

	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}

	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}

	function binarySlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length

	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len

	  var out = ''
	  for (var i = start; i < end; i++) {
	    out += toHex(buf[i])
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end

	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }

	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }

	  if (end < start) end = start

	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = this.subarray(start, end)
	    newBuf.__proto__ = Buffer.prototype
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; i++) {
	      newBuf[i] = this[i + start]
	    }
	  }

	  return newBuf
	}

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }

	  return val
	}

	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }

	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }

	  return val
	}

	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}

	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}

	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}

	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}

	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	}

	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1
	    checkInt(this, value, offset, byteLength, maxBytes, 0)
	  }

	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1
	    checkInt(this, value, offset, byteLength, maxBytes, 0)
	  }

	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}

	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}

	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = 0
	  var mul = 1
	  var sub = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
	      sub = 1
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = byteLength - 1
	  var mul = 1
	  var sub = 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
	      sub = 1
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	  if (offset < 0) throw new RangeError('Index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }

	  var len = end - start
	  var i

	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; i--) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; i++) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    Uint8Array.prototype.set.call(
	      target,
	      this.subarray(start, start + len),
	      targetStart
	    )
	  }

	  return len
	}

	// Usage:
	//    buffer.fill(number[, offset[, end]])
	//    buffer.fill(buffer[, offset[, end]])
	//    buffer.fill(string[, offset[, end]][, encoding])
	Buffer.prototype.fill = function fill (val, start, end, encoding) {
	  // Handle string cases:
	  if (typeof val === 'string') {
	    if (typeof start === 'string') {
	      encoding = start
	      start = 0
	      end = this.length
	    } else if (typeof end === 'string') {
	      encoding = end
	      end = this.length
	    }
	    if (val.length === 1) {
	      var code = val.charCodeAt(0)
	      if (code < 256) {
	        val = code
	      }
	    }
	    if (encoding !== undefined && typeof encoding !== 'string') {
	      throw new TypeError('encoding must be a string')
	    }
	    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
	      throw new TypeError('Unknown encoding: ' + encoding)
	    }
	  } else if (typeof val === 'number') {
	    val = val & 255
	  }

	  // Invalid ranges are not set to a default, so can range check early.
	  if (start < 0 || this.length < start || this.length < end) {
	    throw new RangeError('Out of range index')
	  }

	  if (end <= start) {
	    return this
	  }

	  start = start >>> 0
	  end = end === undefined ? this.length : end >>> 0

	  if (!val) val = 0

	  var i
	  if (typeof val === 'number') {
	    for (i = start; i < end; i++) {
	      this[i] = val
	    }
	  } else {
	    var bytes = Buffer.isBuffer(val)
	      ? val
	      : utf8ToBytes(new Buffer(val, encoding).toString())
	    var len = bytes.length
	    for (i = 0; i < end - start; i++) {
	      this[i + start] = bytes[i % len]
	    }
	  }

	  return this
	}

	// HELPER FUNCTIONS
	// ================

	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []

	  for (var i = 0; i < length; i++) {
	    codePoint = string.charCodeAt(i)

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }

	        // valid lead
	        leadSurrogate = codePoint

	        continue
	      }

	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }

	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }

	    leadSurrogate = null

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }

	  return byteArray
	}

	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; i++) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}

	function isnan (val) {
	  return val !== val // eslint-disable-line no-self-compare
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(33).Buffer, (function() { return this; }())))

/***/ },
/* 43 */
/***/ function(module, exports) {

	'use strict'

	exports.toByteArray = toByteArray
	exports.fromByteArray = fromByteArray

	var lookup = []
	var revLookup = []
	var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

	function init () {
	  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
	  for (var i = 0, len = code.length; i < len; ++i) {
	    lookup[i] = code[i]
	    revLookup[code.charCodeAt(i)] = i
	  }

	  revLookup['-'.charCodeAt(0)] = 62
	  revLookup['_'.charCodeAt(0)] = 63
	}

	init()

	function toByteArray (b64) {
	  var i, j, l, tmp, placeHolders, arr
	  var len = b64.length

	  if (len % 4 > 0) {
	    throw new Error('Invalid string. Length must be a multiple of 4')
	  }

	  // the number of equal signs (place holders)
	  // if there are two placeholders, than the two characters before it
	  // represent one byte
	  // if there is only one, then the three characters before it represent 2 bytes
	  // this is just a cheap hack to not do indexOf twice
	  placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0

	  // base64 is 4/3 + up to two characters of the original data
	  arr = new Arr(len * 3 / 4 - placeHolders)

	  // if there are placeholders, only get up to the last complete 4 chars
	  l = placeHolders > 0 ? len - 4 : len

	  var L = 0

	  for (i = 0, j = 0; i < l; i += 4, j += 3) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
	    arr[L++] = (tmp >> 16) & 0xFF
	    arr[L++] = (tmp >> 8) & 0xFF
	    arr[L++] = tmp & 0xFF
	  }

	  if (placeHolders === 2) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
	    arr[L++] = tmp & 0xFF
	  } else if (placeHolders === 1) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
	    arr[L++] = (tmp >> 8) & 0xFF
	    arr[L++] = tmp & 0xFF
	  }

	  return arr
	}

	function tripletToBase64 (num) {
	  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
	}

	function encodeChunk (uint8, start, end) {
	  var tmp
	  var output = []
	  for (var i = start; i < end; i += 3) {
	    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
	    output.push(tripletToBase64(tmp))
	  }
	  return output.join('')
	}

	function fromByteArray (uint8) {
	  var tmp
	  var len = uint8.length
	  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
	  var output = ''
	  var parts = []
	  var maxChunkLength = 16383 // must be multiple of 3

	  // go through the array every three bytes, we'll deal with trailing stuff later
	  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
	    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
	  }

	  // pad the end with zeros, but make sure to not forget the extra bytes
	  if (extraBytes === 1) {
	    tmp = uint8[len - 1]
	    output += lookup[tmp >> 2]
	    output += lookup[(tmp << 4) & 0x3F]
	    output += '=='
	  } else if (extraBytes === 2) {
	    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
	    output += lookup[tmp >> 10]
	    output += lookup[(tmp >> 4) & 0x3F]
	    output += lookup[(tmp << 2) & 0x3F]
	    output += '='
	  }

	  parts.push(output)

	  return parts.join('')
	}


/***/ },
/* 44 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.


	// a transform stream is a readable/writable stream where you do
	// something with the data.  Sometimes it's called a "filter",
	// but that's not a great name for it, since that implies a thing where
	// some bits pass through, and others are simply ignored.  (That would
	// be a valid example of a transform, of course.)
	//
	// While the output is causally related to the input, it's not a
	// necessarily symmetric or synchronous transformation.  For example,
	// a zlib stream might take multiple plain-text writes(), and then
	// emit a single compressed chunk some time in the future.
	//
	// Here's how this works:
	//
	// The Transform stream has all the aspects of the readable and writable
	// stream classes.  When you write(chunk), that calls _write(chunk,cb)
	// internally, and returns false if there's a lot of pending writes
	// buffered up.  When you call read(), that calls _read(n) until
	// there's enough pending readable data buffered up.
	//
	// In a transform stream, the written data is placed in a buffer.  When
	// _read(n) is called, it transforms the queued up data, calling the
	// buffered _write cb's as it consumes chunks.  If consuming a single
	// written chunk would result in multiple output chunks, then the first
	// outputted bit calls the readcb, and subsequent chunks just go into
	// the read buffer, and will cause it to emit 'readable' if necessary.
	//
	// This way, back-pressure is actually determined by the reading side,
	// since _read has to be called to start processing a new chunk.  However,
	// a pathological inflate type of transform can cause excessive buffering
	// here.  For example, imagine a stream where every byte of input is
	// interpreted as an integer from 0-255, and then results in that many
	// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
	// 1kb of data being output.  In this case, you could write a very small
	// amount of input, and end up with a very large amount of output.  In
	// such a pathological inflating mechanism, there'd be no way to tell
	// the system to stop doing the transform.  A single 4MB write could
	// cause the system to run out of memory.
	//
	// However, even in such a pathological case, only a single written chunk
	// would be consumed, and then the rest would wait (un-transformed) until
	// the results of the previous transformed chunk were consumed.

	module.exports = Transform;

	var Duplex = __webpack_require__(39);

	/*<replacement>*/
	var util = __webpack_require__(37);
	util.inherits = __webpack_require__(29);
	/*</replacement>*/

	util.inherits(Transform, Duplex);


	function TransformState(options, stream) {
	  this.afterTransform = function(er, data) {
	    return afterTransform(stream, er, data);
	  };

	  this.needTransform = false;
	  this.transforming = false;
	  this.writecb = null;
	  this.writechunk = null;
	}

	function afterTransform(stream, er, data) {
	  var ts = stream._transformState;
	  ts.transforming = false;

	  var cb = ts.writecb;

	  if (!cb)
	    return stream.emit('error', new Error('no writecb in Transform class'));

	  ts.writechunk = null;
	  ts.writecb = null;

	  if (!util.isNullOrUndefined(data))
	    stream.push(data);

	  if (cb)
	    cb(er);

	  var rs = stream._readableState;
	  rs.reading = false;
	  if (rs.needReadable || rs.length < rs.highWaterMark) {
	    stream._read(rs.highWaterMark);
	  }
	}


	function Transform(options) {
	  if (!(this instanceof Transform))
	    return new Transform(options);

	  Duplex.call(this, options);

	  this._transformState = new TransformState(options, this);

	  // when the writable side finishes, then flush out anything remaining.
	  var stream = this;

	  // start out asking for a readable event once data is transformed.
	  this._readableState.needReadable = true;

	  // we have implemented the _read method, and done the other things
	  // that Readable wants before the first _read call, so unset the
	  // sync guard flag.
	  this._readableState.sync = false;

	  this.once('prefinish', function() {
	    if (util.isFunction(this._flush))
	      this._flush(function(er) {
	        done(stream, er);
	      });
	    else
	      done(stream);
	  });
	}

	Transform.prototype.push = function(chunk, encoding) {
	  this._transformState.needTransform = false;
	  return Duplex.prototype.push.call(this, chunk, encoding);
	};

	// This is the part where you do stuff!
	// override this function in implementation classes.
	// 'chunk' is an input chunk.
	//
	// Call `push(newChunk)` to pass along transformed output
	// to the readable side.  You may call 'push' zero or more times.
	//
	// Call `cb(err)` when you are done with this chunk.  If you pass
	// an error, then that'll put the hurt on the whole operation.  If you
	// never call cb(), then you'll never get another chunk.
	Transform.prototype._transform = function(chunk, encoding, cb) {
	  throw new Error('not implemented');
	};

	Transform.prototype._write = function(chunk, encoding, cb) {
	  var ts = this._transformState;
	  ts.writecb = cb;
	  ts.writechunk = chunk;
	  ts.writeencoding = encoding;
	  if (!ts.transforming) {
	    var rs = this._readableState;
	    if (ts.needTransform ||
	        rs.needReadable ||
	        rs.length < rs.highWaterMark)
	      this._read(rs.highWaterMark);
	  }
	};

	// Doesn't matter what the args are here.
	// _transform does all the work.
	// That we got here means that the readable side wants more data.
	Transform.prototype._read = function(n) {
	  var ts = this._transformState;

	  if (!util.isNull(ts.writechunk) && ts.writecb && !ts.transforming) {
	    ts.transforming = true;
	    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
	  } else {
	    // mark that we need a transform, so that any data that comes in
	    // will get processed, now that we've asked for it.
	    ts.needTransform = true;
	  }
	};


	function done(stream, er) {
	  if (er)
	    return stream.emit('error', er);

	  // if there's nothing in the write buffer, then that means
	  // that nothing more will ever be provided
	  var ws = stream._writableState;
	  var ts = stream._transformState;

	  if (ws.length)
	    throw new Error('calling transform done when ws.length != 0');

	  if (ts.transforming)
	    throw new Error('calling transform done when still transforming');

	  return stream.push(null);
	}


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// a passthrough stream.
	// basically just the most minimal sort of Transform stream.
	// Every written chunk gets output as-is.

	module.exports = PassThrough;

	var Transform = __webpack_require__(45);

	/*<replacement>*/
	var util = __webpack_require__(37);
	util.inherits = __webpack_require__(29);
	/*</replacement>*/

	util.inherits(PassThrough, Transform);

	function PassThrough(options) {
	  if (!(this instanceof PassThrough))
	    return new PassThrough(options);

	  Transform.call(this, options);
	}

	PassThrough.prototype._transform = function(chunk, encoding, cb) {
	  cb(null, chunk);
	};


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(40)


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(39)


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(45)


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(46)


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	var Stream = __webpack_require__(28);
	var util = __webpack_require__(52);

	var Response = module.exports = function (res) {
	    this.offset = 0;
	    this.readable = true;
	};

	util.inherits(Response, Stream);

	var capable = {
	    streaming : true,
	    status2 : true
	};

	function parseHeaders (res) {
	    var lines = res.getAllResponseHeaders().split(/\r?\n/);
	    var headers = {};
	    for (var i = 0; i < lines.length; i++) {
	        var line = lines[i];
	        if (line === '') continue;
	        
	        var m = line.match(/^([^:]+):\s*(.*)/);
	        if (m) {
	            var key = m[1].toLowerCase(), value = m[2];
	            
	            if (headers[key] !== undefined) {
	            
	                if (isArray(headers[key])) {
	                    headers[key].push(value);
	                }
	                else {
	                    headers[key] = [ headers[key], value ];
	                }
	            }
	            else {
	                headers[key] = value;
	            }
	        }
	        else {
	            headers[line] = true;
	        }
	    }
	    return headers;
	}

	Response.prototype.getResponse = function (xhr) {
	    var respType = String(xhr.responseType).toLowerCase();
	    if (respType === 'blob') return xhr.responseBlob || xhr.response;
	    if (respType === 'arraybuffer') return xhr.response;
	    return xhr.responseText;
	}

	Response.prototype.getHeader = function (key) {
	    return this.headers[key.toLowerCase()];
	};

	Response.prototype.handle = function (res) {
	    if (res.readyState === 2 && capable.status2) {
	        try {
	            this.statusCode = res.status;
	            this.headers = parseHeaders(res);
	        }
	        catch (err) {
	            capable.status2 = false;
	        }
	        
	        if (capable.status2) {
	            this.emit('ready');
	        }
	    }
	    else if (capable.streaming && res.readyState === 3) {
	        try {
	            if (!this.statusCode) {
	                this.statusCode = res.status;
	                this.headers = parseHeaders(res);
	                this.emit('ready');
	            }
	        }
	        catch (err) {}
	        
	        try {
	            this._emitData(res);
	        }
	        catch (err) {
	            capable.streaming = false;
	        }
	    }
	    else if (res.readyState === 4) {
	        if (!this.statusCode) {
	            this.statusCode = res.status;
	            this.emit('ready');
	        }
	        this._emitData(res);
	        
	        if (res.error) {
	            this.emit('error', this.getResponse(res));
	        }
	        else this.emit('end');
	        
	        this.emit('close');
	    }
	};

	Response.prototype._emitData = function (res) {
	    var respBody = this.getResponse(res);
	    if (respBody.toString().match(/ArrayBuffer/)) {
	        this.emit('data', new Uint8Array(respBody, this.offset));
	        this.offset = respBody.byteLength;
	        return;
	    }
	    if (respBody.length > this.offset) {
	        this.emit('data', respBody.slice(this.offset));
	        this.offset = respBody.length;
	    }
	};

	var isArray = Array.isArray || function (xs) {
	    return Object.prototype.toString.call(xs) === '[object Array]';
	};


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }

	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};


	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function(fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global.process)) {
	    return function() {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }

	  if (process.noDeprecation === true) {
	    return fn;
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	};


	var debugs = {};
	var debugEnviron;
	exports.debuglog = function(set) {
	  if (isUndefined(debugEnviron))
	    debugEnviron = process.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = process.pid;
	      debugs[set] = function() {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	};


	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;


	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};


	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];

	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}


	function stylizeNoColor(str, styleType) {
	  return str;
	}


	function arrayToHash(array) {
	  var hash = {};

	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });

	  return hash;
	}


	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== exports.inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }

	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }

	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);

	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }

	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }

	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }

	  var base = '', array = false, braces = ['{', '}'];

	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }

	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }

	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }

	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }

	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }

	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }

	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }

	  ctx.seen.push(value);

	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }

	  ctx.seen.pop();

	  return reduceToSingleString(output, base, braces);
	}


	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}


	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}


	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}


	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }

	  return name + ': ' + str;
	}


	function reduceToSingleString(output, base, braces) {
	  var numLinesEst = 0;
	  var length = output.reduce(function(prev, cur) {
	    numLinesEst++;
	    if (cur.indexOf('\n') >= 0) numLinesEst++;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);

	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }

	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}


	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = __webpack_require__(53);

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}


	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}


	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	              'Oct', 'Nov', 'Dec'];

	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()),
	              pad(d.getMinutes()),
	              pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}


	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};


	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = __webpack_require__(29);

	exports._extend = function(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;

	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};

	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(22)))

/***/ },
/* 53 */
/***/ function(module, exports) {

	module.exports = function isBuffer(arg) {
	  return arg && typeof arg === 'object'
	    && typeof arg.copy === 'function'
	    && typeof arg.fill === 'function'
	    && typeof arg.readUInt8 === 'function';
	}

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	;(function () {

	  var object =  true ? exports : this; // #8: web workers
	  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

	  function InvalidCharacterError(message) {
	    this.message = message;
	  }
	  InvalidCharacterError.prototype = new Error;
	  InvalidCharacterError.prototype.name = 'InvalidCharacterError';

	  // encoder
	  // [https://gist.github.com/999166] by [https://github.com/nignag]
	  object.btoa || (
	  object.btoa = function (input) {
	    for (
	      // initialize result and counter
	      var block, charCode, idx = 0, map = chars, output = '';
	      // if the next input index does not exist:
	      //   change the mapping table to "="
	      //   check if d has no fractional digits
	      input.charAt(idx | 0) || (map = '=', idx % 1);
	      // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
	      output += map.charAt(63 & block >> 8 - idx % 1 * 8)
	    ) {
	      charCode = input.charCodeAt(idx += 3/4);
	      if (charCode > 0xFF) {
	        throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
	      }
	      block = block << 8 | charCode;
	    }
	    return output;
	  });

	  // decoder
	  // [https://gist.github.com/1020396] by [https://github.com/atk]
	  object.atob || (
	  object.atob = function (input) {
	    input = input.replace(/=+$/, '');
	    if (input.length % 4 == 1) {
	      throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
	    }
	    for (
	      // initialize result and counters
	      var bc = 0, bs, buffer, idx = 0, output = '';
	      // get next character
	      buffer = input.charAt(idx++);
	      // character found in table? initialize bit storage and add its ascii value;
	      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
	        // and if not first of each 4 characters,
	        // convert the first 8 bits to one ascii character
	        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
	    ) {
	      // try to find character in table (0-63, not found => -1)
	      buffer = chars.indexOf(buffer);
	    }
	    return output;
	  });

	}());


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	'use strict';

	var punycode = __webpack_require__(56);
	var util = __webpack_require__(58);

	exports.parse = urlParse;
	exports.resolve = urlResolve;
	exports.resolveObject = urlResolveObject;
	exports.format = urlFormat;

	exports.Url = Url;

	function Url() {
	  this.protocol = null;
	  this.slashes = null;
	  this.auth = null;
	  this.host = null;
	  this.port = null;
	  this.hostname = null;
	  this.hash = null;
	  this.search = null;
	  this.query = null;
	  this.pathname = null;
	  this.path = null;
	  this.href = null;
	}

	// Reference: RFC 3986, RFC 1808, RFC 2396

	// define these here so at least they only have to be
	// compiled once on the first module load.
	var protocolPattern = /^([a-z0-9.+-]+:)/i,
	    portPattern = /:[0-9]*$/,

	    // Special case for a simple path URL
	    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

	    // RFC 2396: characters reserved for delimiting URLs.
	    // We actually just auto-escape these.
	    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

	    // RFC 2396: characters not allowed for various reasons.
	    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

	    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
	    autoEscape = ['\''].concat(unwise),
	    // Characters that are never ever allowed in a hostname.
	    // Note that any invalid chars are also handled, but these
	    // are the ones that are *expected* to be seen, so we fast-path
	    // them.
	    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
	    hostEndingChars = ['/', '?', '#'],
	    hostnameMaxLen = 255,
	    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
	    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
	    // protocols that can allow "unsafe" and "unwise" chars.
	    unsafeProtocol = {
	      'javascript': true,
	      'javascript:': true
	    },
	    // protocols that never have a hostname.
	    hostlessProtocol = {
	      'javascript': true,
	      'javascript:': true
	    },
	    // protocols that always contain a // bit.
	    slashedProtocol = {
	      'http': true,
	      'https': true,
	      'ftp': true,
	      'gopher': true,
	      'file': true,
	      'http:': true,
	      'https:': true,
	      'ftp:': true,
	      'gopher:': true,
	      'file:': true
	    },
	    querystring = __webpack_require__(59);

	function urlParse(url, parseQueryString, slashesDenoteHost) {
	  if (url && util.isObject(url) && url instanceof Url) return url;

	  var u = new Url;
	  u.parse(url, parseQueryString, slashesDenoteHost);
	  return u;
	}

	Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
	  if (!util.isString(url)) {
	    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
	  }

	  // Copy chrome, IE, opera backslash-handling behavior.
	  // Back slashes before the query string get converted to forward slashes
	  // See: https://code.google.com/p/chromium/issues/detail?id=25916
	  var queryIndex = url.indexOf('?'),
	      splitter =
	          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
	      uSplit = url.split(splitter),
	      slashRegex = /\\/g;
	  uSplit[0] = uSplit[0].replace(slashRegex, '/');
	  url = uSplit.join(splitter);

	  var rest = url;

	  // trim before proceeding.
	  // This is to support parse stuff like "  http://foo.com  \n"
	  rest = rest.trim();

	  if (!slashesDenoteHost && url.split('#').length === 1) {
	    // Try fast path regexp
	    var simplePath = simplePathPattern.exec(rest);
	    if (simplePath) {
	      this.path = rest;
	      this.href = rest;
	      this.pathname = simplePath[1];
	      if (simplePath[2]) {
	        this.search = simplePath[2];
	        if (parseQueryString) {
	          this.query = querystring.parse(this.search.substr(1));
	        } else {
	          this.query = this.search.substr(1);
	        }
	      } else if (parseQueryString) {
	        this.search = '';
	        this.query = {};
	      }
	      return this;
	    }
	  }

	  var proto = protocolPattern.exec(rest);
	  if (proto) {
	    proto = proto[0];
	    var lowerProto = proto.toLowerCase();
	    this.protocol = lowerProto;
	    rest = rest.substr(proto.length);
	  }

	  // figure out if it's got a host
	  // user@server is *always* interpreted as a hostname, and url
	  // resolution will treat //foo/bar as host=foo,path=bar because that's
	  // how the browser resolves relative URLs.
	  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
	    var slashes = rest.substr(0, 2) === '//';
	    if (slashes && !(proto && hostlessProtocol[proto])) {
	      rest = rest.substr(2);
	      this.slashes = true;
	    }
	  }

	  if (!hostlessProtocol[proto] &&
	      (slashes || (proto && !slashedProtocol[proto]))) {

	    // there's a hostname.
	    // the first instance of /, ?, ;, or # ends the host.
	    //
	    // If there is an @ in the hostname, then non-host chars *are* allowed
	    // to the left of the last @ sign, unless some host-ending character
	    // comes *before* the @-sign.
	    // URLs are obnoxious.
	    //
	    // ex:
	    // http://a@b@c/ => user:a@b host:c
	    // http://a@b?@c => user:a host:c path:/?@c

	    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
	    // Review our test case against browsers more comprehensively.

	    // find the first instance of any hostEndingChars
	    var hostEnd = -1;
	    for (var i = 0; i < hostEndingChars.length; i++) {
	      var hec = rest.indexOf(hostEndingChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
	        hostEnd = hec;
	    }

	    // at this point, either we have an explicit point where the
	    // auth portion cannot go past, or the last @ char is the decider.
	    var auth, atSign;
	    if (hostEnd === -1) {
	      // atSign can be anywhere.
	      atSign = rest.lastIndexOf('@');
	    } else {
	      // atSign must be in auth portion.
	      // http://a@b/c@d => host:b auth:a path:/c@d
	      atSign = rest.lastIndexOf('@', hostEnd);
	    }

	    // Now we have a portion which is definitely the auth.
	    // Pull that off.
	    if (atSign !== -1) {
	      auth = rest.slice(0, atSign);
	      rest = rest.slice(atSign + 1);
	      this.auth = decodeURIComponent(auth);
	    }

	    // the host is the remaining to the left of the first non-host char
	    hostEnd = -1;
	    for (var i = 0; i < nonHostChars.length; i++) {
	      var hec = rest.indexOf(nonHostChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
	        hostEnd = hec;
	    }
	    // if we still have not hit it, then the entire thing is a host.
	    if (hostEnd === -1)
	      hostEnd = rest.length;

	    this.host = rest.slice(0, hostEnd);
	    rest = rest.slice(hostEnd);

	    // pull out port.
	    this.parseHost();

	    // we've indicated that there is a hostname,
	    // so even if it's empty, it has to be present.
	    this.hostname = this.hostname || '';

	    // if hostname begins with [ and ends with ]
	    // assume that it's an IPv6 address.
	    var ipv6Hostname = this.hostname[0] === '[' &&
	        this.hostname[this.hostname.length - 1] === ']';

	    // validate a little.
	    if (!ipv6Hostname) {
	      var hostparts = this.hostname.split(/\./);
	      for (var i = 0, l = hostparts.length; i < l; i++) {
	        var part = hostparts[i];
	        if (!part) continue;
	        if (!part.match(hostnamePartPattern)) {
	          var newpart = '';
	          for (var j = 0, k = part.length; j < k; j++) {
	            if (part.charCodeAt(j) > 127) {
	              // we replace non-ASCII char with a temporary placeholder
	              // we need this to make sure size of hostname is not
	              // broken by replacing non-ASCII by nothing
	              newpart += 'x';
	            } else {
	              newpart += part[j];
	            }
	          }
	          // we test again with ASCII char only
	          if (!newpart.match(hostnamePartPattern)) {
	            var validParts = hostparts.slice(0, i);
	            var notHost = hostparts.slice(i + 1);
	            var bit = part.match(hostnamePartStart);
	            if (bit) {
	              validParts.push(bit[1]);
	              notHost.unshift(bit[2]);
	            }
	            if (notHost.length) {
	              rest = '/' + notHost.join('.') + rest;
	            }
	            this.hostname = validParts.join('.');
	            break;
	          }
	        }
	      }
	    }

	    if (this.hostname.length > hostnameMaxLen) {
	      this.hostname = '';
	    } else {
	      // hostnames are always lower case.
	      this.hostname = this.hostname.toLowerCase();
	    }

	    if (!ipv6Hostname) {
	      // IDNA Support: Returns a punycoded representation of "domain".
	      // It only converts parts of the domain name that
	      // have non-ASCII characters, i.e. it doesn't matter if
	      // you call it with a domain that already is ASCII-only.
	      this.hostname = punycode.toASCII(this.hostname);
	    }

	    var p = this.port ? ':' + this.port : '';
	    var h = this.hostname || '';
	    this.host = h + p;
	    this.href += this.host;

	    // strip [ and ] from the hostname
	    // the host field still retains them, though
	    if (ipv6Hostname) {
	      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
	      if (rest[0] !== '/') {
	        rest = '/' + rest;
	      }
	    }
	  }

	  // now rest is set to the post-host stuff.
	  // chop off any delim chars.
	  if (!unsafeProtocol[lowerProto]) {

	    // First, make 100% sure that any "autoEscape" chars get
	    // escaped, even if encodeURIComponent doesn't think they
	    // need to be.
	    for (var i = 0, l = autoEscape.length; i < l; i++) {
	      var ae = autoEscape[i];
	      if (rest.indexOf(ae) === -1)
	        continue;
	      var esc = encodeURIComponent(ae);
	      if (esc === ae) {
	        esc = escape(ae);
	      }
	      rest = rest.split(ae).join(esc);
	    }
	  }


	  // chop off from the tail first.
	  var hash = rest.indexOf('#');
	  if (hash !== -1) {
	    // got a fragment string.
	    this.hash = rest.substr(hash);
	    rest = rest.slice(0, hash);
	  }
	  var qm = rest.indexOf('?');
	  if (qm !== -1) {
	    this.search = rest.substr(qm);
	    this.query = rest.substr(qm + 1);
	    if (parseQueryString) {
	      this.query = querystring.parse(this.query);
	    }
	    rest = rest.slice(0, qm);
	  } else if (parseQueryString) {
	    // no query string, but parseQueryString still requested
	    this.search = '';
	    this.query = {};
	  }
	  if (rest) this.pathname = rest;
	  if (slashedProtocol[lowerProto] &&
	      this.hostname && !this.pathname) {
	    this.pathname = '/';
	  }

	  //to support http.request
	  if (this.pathname || this.search) {
	    var p = this.pathname || '';
	    var s = this.search || '';
	    this.path = p + s;
	  }

	  // finally, reconstruct the href based on what has been validated.
	  this.href = this.format();
	  return this;
	};

	// format a parsed object into a url string
	function urlFormat(obj) {
	  // ensure it's an object, and not a string url.
	  // If it's an obj, this is a no-op.
	  // this way, you can call url_format() on strings
	  // to clean up potentially wonky urls.
	  if (util.isString(obj)) obj = urlParse(obj);
	  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
	  return obj.format();
	}

	Url.prototype.format = function() {
	  var auth = this.auth || '';
	  if (auth) {
	    auth = encodeURIComponent(auth);
	    auth = auth.replace(/%3A/i, ':');
	    auth += '@';
	  }

	  var protocol = this.protocol || '',
	      pathname = this.pathname || '',
	      hash = this.hash || '',
	      host = false,
	      query = '';

	  if (this.host) {
	    host = auth + this.host;
	  } else if (this.hostname) {
	    host = auth + (this.hostname.indexOf(':') === -1 ?
	        this.hostname :
	        '[' + this.hostname + ']');
	    if (this.port) {
	      host += ':' + this.port;
	    }
	  }

	  if (this.query &&
	      util.isObject(this.query) &&
	      Object.keys(this.query).length) {
	    query = querystring.stringify(this.query);
	  }

	  var search = this.search || (query && ('?' + query)) || '';

	  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

	  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
	  // unless they had them to begin with.
	  if (this.slashes ||
	      (!protocol || slashedProtocol[protocol]) && host !== false) {
	    host = '//' + (host || '');
	    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
	  } else if (!host) {
	    host = '';
	  }

	  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
	  if (search && search.charAt(0) !== '?') search = '?' + search;

	  pathname = pathname.replace(/[?#]/g, function(match) {
	    return encodeURIComponent(match);
	  });
	  search = search.replace('#', '%23');

	  return protocol + host + pathname + search + hash;
	};

	function urlResolve(source, relative) {
	  return urlParse(source, false, true).resolve(relative);
	}

	Url.prototype.resolve = function(relative) {
	  return this.resolveObject(urlParse(relative, false, true)).format();
	};

	function urlResolveObject(source, relative) {
	  if (!source) return relative;
	  return urlParse(source, false, true).resolveObject(relative);
	}

	Url.prototype.resolveObject = function(relative) {
	  if (util.isString(relative)) {
	    var rel = new Url();
	    rel.parse(relative, false, true);
	    relative = rel;
	  }

	  var result = new Url();
	  var tkeys = Object.keys(this);
	  for (var tk = 0; tk < tkeys.length; tk++) {
	    var tkey = tkeys[tk];
	    result[tkey] = this[tkey];
	  }

	  // hash is always overridden, no matter what.
	  // even href="" will remove it.
	  result.hash = relative.hash;

	  // if the relative url is empty, then there's nothing left to do here.
	  if (relative.href === '') {
	    result.href = result.format();
	    return result;
	  }

	  // hrefs like //foo/bar always cut to the protocol.
	  if (relative.slashes && !relative.protocol) {
	    // take everything except the protocol from relative
	    var rkeys = Object.keys(relative);
	    for (var rk = 0; rk < rkeys.length; rk++) {
	      var rkey = rkeys[rk];
	      if (rkey !== 'protocol')
	        result[rkey] = relative[rkey];
	    }

	    //urlParse appends trailing / to urls like http://www.example.com
	    if (slashedProtocol[result.protocol] &&
	        result.hostname && !result.pathname) {
	      result.path = result.pathname = '/';
	    }

	    result.href = result.format();
	    return result;
	  }

	  if (relative.protocol && relative.protocol !== result.protocol) {
	    // if it's a known url protocol, then changing
	    // the protocol does weird things
	    // first, if it's not file:, then we MUST have a host,
	    // and if there was a path
	    // to begin with, then we MUST have a path.
	    // if it is file:, then the host is dropped,
	    // because that's known to be hostless.
	    // anything else is assumed to be absolute.
	    if (!slashedProtocol[relative.protocol]) {
	      var keys = Object.keys(relative);
	      for (var v = 0; v < keys.length; v++) {
	        var k = keys[v];
	        result[k] = relative[k];
	      }
	      result.href = result.format();
	      return result;
	    }

	    result.protocol = relative.protocol;
	    if (!relative.host && !hostlessProtocol[relative.protocol]) {
	      var relPath = (relative.pathname || '').split('/');
	      while (relPath.length && !(relative.host = relPath.shift()));
	      if (!relative.host) relative.host = '';
	      if (!relative.hostname) relative.hostname = '';
	      if (relPath[0] !== '') relPath.unshift('');
	      if (relPath.length < 2) relPath.unshift('');
	      result.pathname = relPath.join('/');
	    } else {
	      result.pathname = relative.pathname;
	    }
	    result.search = relative.search;
	    result.query = relative.query;
	    result.host = relative.host || '';
	    result.auth = relative.auth;
	    result.hostname = relative.hostname || relative.host;
	    result.port = relative.port;
	    // to support http.request
	    if (result.pathname || result.search) {
	      var p = result.pathname || '';
	      var s = result.search || '';
	      result.path = p + s;
	    }
	    result.slashes = result.slashes || relative.slashes;
	    result.href = result.format();
	    return result;
	  }

	  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
	      isRelAbs = (
	          relative.host ||
	          relative.pathname && relative.pathname.charAt(0) === '/'
	      ),
	      mustEndAbs = (isRelAbs || isSourceAbs ||
	                    (result.host && relative.pathname)),
	      removeAllDots = mustEndAbs,
	      srcPath = result.pathname && result.pathname.split('/') || [],
	      relPath = relative.pathname && relative.pathname.split('/') || [],
	      psychotic = result.protocol && !slashedProtocol[result.protocol];

	  // if the url is a non-slashed url, then relative
	  // links like ../.. should be able
	  // to crawl up to the hostname, as well.  This is strange.
	  // result.protocol has already been set by now.
	  // Later on, put the first path part into the host field.
	  if (psychotic) {
	    result.hostname = '';
	    result.port = null;
	    if (result.host) {
	      if (srcPath[0] === '') srcPath[0] = result.host;
	      else srcPath.unshift(result.host);
	    }
	    result.host = '';
	    if (relative.protocol) {
	      relative.hostname = null;
	      relative.port = null;
	      if (relative.host) {
	        if (relPath[0] === '') relPath[0] = relative.host;
	        else relPath.unshift(relative.host);
	      }
	      relative.host = null;
	    }
	    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
	  }

	  if (isRelAbs) {
	    // it's absolute.
	    result.host = (relative.host || relative.host === '') ?
	                  relative.host : result.host;
	    result.hostname = (relative.hostname || relative.hostname === '') ?
	                      relative.hostname : result.hostname;
	    result.search = relative.search;
	    result.query = relative.query;
	    srcPath = relPath;
	    // fall through to the dot-handling below.
	  } else if (relPath.length) {
	    // it's relative
	    // throw away the existing file, and take the new path instead.
	    if (!srcPath) srcPath = [];
	    srcPath.pop();
	    srcPath = srcPath.concat(relPath);
	    result.search = relative.search;
	    result.query = relative.query;
	  } else if (!util.isNullOrUndefined(relative.search)) {
	    // just pull out the search.
	    // like href='?foo'.
	    // Put this after the other two cases because it simplifies the booleans
	    if (psychotic) {
	      result.hostname = result.host = srcPath.shift();
	      //occationaly the auth can get stuck only in host
	      //this especially happens in cases like
	      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	      var authInHost = result.host && result.host.indexOf('@') > 0 ?
	                       result.host.split('@') : false;
	      if (authInHost) {
	        result.auth = authInHost.shift();
	        result.host = result.hostname = authInHost.shift();
	      }
	    }
	    result.search = relative.search;
	    result.query = relative.query;
	    //to support http.request
	    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
	      result.path = (result.pathname ? result.pathname : '') +
	                    (result.search ? result.search : '');
	    }
	    result.href = result.format();
	    return result;
	  }

	  if (!srcPath.length) {
	    // no path at all.  easy.
	    // we've already handled the other stuff above.
	    result.pathname = null;
	    //to support http.request
	    if (result.search) {
	      result.path = '/' + result.search;
	    } else {
	      result.path = null;
	    }
	    result.href = result.format();
	    return result;
	  }

	  // if a url ENDs in . or .., then it must get a trailing slash.
	  // however, if it ends in anything else non-slashy,
	  // then it must NOT get a trailing slash.
	  var last = srcPath.slice(-1)[0];
	  var hasTrailingSlash = (
	      (result.host || relative.host || srcPath.length > 1) &&
	      (last === '.' || last === '..') || last === '');

	  // strip single dots, resolve double dots to parent dir
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = srcPath.length; i >= 0; i--) {
	    last = srcPath[i];
	    if (last === '.') {
	      srcPath.splice(i, 1);
	    } else if (last === '..') {
	      srcPath.splice(i, 1);
	      up++;
	    } else if (up) {
	      srcPath.splice(i, 1);
	      up--;
	    }
	  }

	  // if the path is allowed to go above the root, restore leading ..s
	  if (!mustEndAbs && !removeAllDots) {
	    for (; up--; up) {
	      srcPath.unshift('..');
	    }
	  }

	  if (mustEndAbs && srcPath[0] !== '' &&
	      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
	    srcPath.unshift('');
	  }

	  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
	    srcPath.push('');
	  }

	  var isAbsolute = srcPath[0] === '' ||
	      (srcPath[0] && srcPath[0].charAt(0) === '/');

	  // put the host back
	  if (psychotic) {
	    result.hostname = result.host = isAbsolute ? '' :
	                                    srcPath.length ? srcPath.shift() : '';
	    //occationaly the auth can get stuck only in host
	    //this especially happens in cases like
	    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	    var authInHost = result.host && result.host.indexOf('@') > 0 ?
	                     result.host.split('@') : false;
	    if (authInHost) {
	      result.auth = authInHost.shift();
	      result.host = result.hostname = authInHost.shift();
	    }
	  }

	  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

	  if (mustEndAbs && !isAbsolute) {
	    srcPath.unshift('');
	  }

	  if (!srcPath.length) {
	    result.pathname = null;
	    result.path = null;
	  } else {
	    result.pathname = srcPath.join('/');
	  }

	  //to support request.http
	  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
	    result.path = (result.pathname ? result.pathname : '') +
	                  (result.search ? result.search : '');
	  }
	  result.auth = relative.auth || result.auth;
	  result.slashes = result.slashes || relative.slashes;
	  result.href = result.format();
	  return result;
	};

	Url.prototype.parseHost = function() {
	  var host = this.host;
	  var port = portPattern.exec(host);
	  if (port) {
	    port = port[0];
	    if (port !== ':') {
	      this.port = port.substr(1);
	    }
	    host = host.substr(0, host.length - port.length);
	  }
	  if (host) this.hostname = host;
	};


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/*! https://mths.be/punycode v1.3.2 by @mathias */
	;(function(root) {

		/** Detect free variables */
		var freeExports = typeof exports == 'object' && exports &&
			!exports.nodeType && exports;
		var freeModule = typeof module == 'object' && module &&
			!module.nodeType && module;
		var freeGlobal = typeof global == 'object' && global;
		if (
			freeGlobal.global === freeGlobal ||
			freeGlobal.window === freeGlobal ||
			freeGlobal.self === freeGlobal
		) {
			root = freeGlobal;
		}

		/**
		 * The `punycode` object.
		 * @name punycode
		 * @type Object
		 */
		var punycode,

		/** Highest positive signed 32-bit float value */
		maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

		/** Bootstring parameters */
		base = 36,
		tMin = 1,
		tMax = 26,
		skew = 38,
		damp = 700,
		initialBias = 72,
		initialN = 128, // 0x80
		delimiter = '-', // '\x2D'

		/** Regular expressions */
		regexPunycode = /^xn--/,
		regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
		regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

		/** Error messages */
		errors = {
			'overflow': 'Overflow: input needs wider integers to process',
			'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
			'invalid-input': 'Invalid input'
		},

		/** Convenience shortcuts */
		baseMinusTMin = base - tMin,
		floor = Math.floor,
		stringFromCharCode = String.fromCharCode,

		/** Temporary variable */
		key;

		/*--------------------------------------------------------------------------*/

		/**
		 * A generic error utility function.
		 * @private
		 * @param {String} type The error type.
		 * @returns {Error} Throws a `RangeError` with the applicable error message.
		 */
		function error(type) {
			throw RangeError(errors[type]);
		}

		/**
		 * A generic `Array#map` utility function.
		 * @private
		 * @param {Array} array The array to iterate over.
		 * @param {Function} callback The function that gets called for every array
		 * item.
		 * @returns {Array} A new array of values returned by the callback function.
		 */
		function map(array, fn) {
			var length = array.length;
			var result = [];
			while (length--) {
				result[length] = fn(array[length]);
			}
			return result;
		}

		/**
		 * A simple `Array#map`-like wrapper to work with domain name strings or email
		 * addresses.
		 * @private
		 * @param {String} domain The domain name or email address.
		 * @param {Function} callback The function that gets called for every
		 * character.
		 * @returns {Array} A new string of characters returned by the callback
		 * function.
		 */
		function mapDomain(string, fn) {
			var parts = string.split('@');
			var result = '';
			if (parts.length > 1) {
				// In email addresses, only the domain name should be punycoded. Leave
				// the local part (i.e. everything up to `@`) intact.
				result = parts[0] + '@';
				string = parts[1];
			}
			// Avoid `split(regex)` for IE8 compatibility. See #17.
			string = string.replace(regexSeparators, '\x2E');
			var labels = string.split('.');
			var encoded = map(labels, fn).join('.');
			return result + encoded;
		}

		/**
		 * Creates an array containing the numeric code points of each Unicode
		 * character in the string. While JavaScript uses UCS-2 internally,
		 * this function will convert a pair of surrogate halves (each of which
		 * UCS-2 exposes as separate characters) into a single code point,
		 * matching UTF-16.
		 * @see `punycode.ucs2.encode`
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode.ucs2
		 * @name decode
		 * @param {String} string The Unicode input string (UCS-2).
		 * @returns {Array} The new array of code points.
		 */
		function ucs2decode(string) {
			var output = [],
			    counter = 0,
			    length = string.length,
			    value,
			    extra;
			while (counter < length) {
				value = string.charCodeAt(counter++);
				if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
					// high surrogate, and there is a next character
					extra = string.charCodeAt(counter++);
					if ((extra & 0xFC00) == 0xDC00) { // low surrogate
						output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
					} else {
						// unmatched surrogate; only append this code unit, in case the next
						// code unit is the high surrogate of a surrogate pair
						output.push(value);
						counter--;
					}
				} else {
					output.push(value);
				}
			}
			return output;
		}

		/**
		 * Creates a string based on an array of numeric code points.
		 * @see `punycode.ucs2.decode`
		 * @memberOf punycode.ucs2
		 * @name encode
		 * @param {Array} codePoints The array of numeric code points.
		 * @returns {String} The new Unicode string (UCS-2).
		 */
		function ucs2encode(array) {
			return map(array, function(value) {
				var output = '';
				if (value > 0xFFFF) {
					value -= 0x10000;
					output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
					value = 0xDC00 | value & 0x3FF;
				}
				output += stringFromCharCode(value);
				return output;
			}).join('');
		}

		/**
		 * Converts a basic code point into a digit/integer.
		 * @see `digitToBasic()`
		 * @private
		 * @param {Number} codePoint The basic numeric code point value.
		 * @returns {Number} The numeric value of a basic code point (for use in
		 * representing integers) in the range `0` to `base - 1`, or `base` if
		 * the code point does not represent a value.
		 */
		function basicToDigit(codePoint) {
			if (codePoint - 48 < 10) {
				return codePoint - 22;
			}
			if (codePoint - 65 < 26) {
				return codePoint - 65;
			}
			if (codePoint - 97 < 26) {
				return codePoint - 97;
			}
			return base;
		}

		/**
		 * Converts a digit/integer into a basic code point.
		 * @see `basicToDigit()`
		 * @private
		 * @param {Number} digit The numeric value of a basic code point.
		 * @returns {Number} The basic code point whose value (when used for
		 * representing integers) is `digit`, which needs to be in the range
		 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
		 * used; else, the lowercase form is used. The behavior is undefined
		 * if `flag` is non-zero and `digit` has no uppercase form.
		 */
		function digitToBasic(digit, flag) {
			//  0..25 map to ASCII a..z or A..Z
			// 26..35 map to ASCII 0..9
			return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
		}

		/**
		 * Bias adaptation function as per section 3.4 of RFC 3492.
		 * http://tools.ietf.org/html/rfc3492#section-3.4
		 * @private
		 */
		function adapt(delta, numPoints, firstTime) {
			var k = 0;
			delta = firstTime ? floor(delta / damp) : delta >> 1;
			delta += floor(delta / numPoints);
			for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
				delta = floor(delta / baseMinusTMin);
			}
			return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
		}

		/**
		 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
		 * symbols.
		 * @memberOf punycode
		 * @param {String} input The Punycode string of ASCII-only symbols.
		 * @returns {String} The resulting string of Unicode symbols.
		 */
		function decode(input) {
			// Don't use UCS-2
			var output = [],
			    inputLength = input.length,
			    out,
			    i = 0,
			    n = initialN,
			    bias = initialBias,
			    basic,
			    j,
			    index,
			    oldi,
			    w,
			    k,
			    digit,
			    t,
			    /** Cached calculation results */
			    baseMinusT;

			// Handle the basic code points: let `basic` be the number of input code
			// points before the last delimiter, or `0` if there is none, then copy
			// the first basic code points to the output.

			basic = input.lastIndexOf(delimiter);
			if (basic < 0) {
				basic = 0;
			}

			for (j = 0; j < basic; ++j) {
				// if it's not a basic code point
				if (input.charCodeAt(j) >= 0x80) {
					error('not-basic');
				}
				output.push(input.charCodeAt(j));
			}

			// Main decoding loop: start just after the last delimiter if any basic code
			// points were copied; start at the beginning otherwise.

			for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

				// `index` is the index of the next character to be consumed.
				// Decode a generalized variable-length integer into `delta`,
				// which gets added to `i`. The overflow checking is easier
				// if we increase `i` as we go, then subtract off its starting
				// value at the end to obtain `delta`.
				for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

					if (index >= inputLength) {
						error('invalid-input');
					}

					digit = basicToDigit(input.charCodeAt(index++));

					if (digit >= base || digit > floor((maxInt - i) / w)) {
						error('overflow');
					}

					i += digit * w;
					t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

					if (digit < t) {
						break;
					}

					baseMinusT = base - t;
					if (w > floor(maxInt / baseMinusT)) {
						error('overflow');
					}

					w *= baseMinusT;

				}

				out = output.length + 1;
				bias = adapt(i - oldi, out, oldi == 0);

				// `i` was supposed to wrap around from `out` to `0`,
				// incrementing `n` each time, so we'll fix that now:
				if (floor(i / out) > maxInt - n) {
					error('overflow');
				}

				n += floor(i / out);
				i %= out;

				// Insert `n` at position `i` of the output
				output.splice(i++, 0, n);

			}

			return ucs2encode(output);
		}

		/**
		 * Converts a string of Unicode symbols (e.g. a domain name label) to a
		 * Punycode string of ASCII-only symbols.
		 * @memberOf punycode
		 * @param {String} input The string of Unicode symbols.
		 * @returns {String} The resulting Punycode string of ASCII-only symbols.
		 */
		function encode(input) {
			var n,
			    delta,
			    handledCPCount,
			    basicLength,
			    bias,
			    j,
			    m,
			    q,
			    k,
			    t,
			    currentValue,
			    output = [],
			    /** `inputLength` will hold the number of code points in `input`. */
			    inputLength,
			    /** Cached calculation results */
			    handledCPCountPlusOne,
			    baseMinusT,
			    qMinusT;

			// Convert the input in UCS-2 to Unicode
			input = ucs2decode(input);

			// Cache the length
			inputLength = input.length;

			// Initialize the state
			n = initialN;
			delta = 0;
			bias = initialBias;

			// Handle the basic code points
			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue < 0x80) {
					output.push(stringFromCharCode(currentValue));
				}
			}

			handledCPCount = basicLength = output.length;

			// `handledCPCount` is the number of code points that have been handled;
			// `basicLength` is the number of basic code points.

			// Finish the basic string - if it is not empty - with a delimiter
			if (basicLength) {
				output.push(delimiter);
			}

			// Main encoding loop:
			while (handledCPCount < inputLength) {

				// All non-basic code points < n have been handled already. Find the next
				// larger one:
				for (m = maxInt, j = 0; j < inputLength; ++j) {
					currentValue = input[j];
					if (currentValue >= n && currentValue < m) {
						m = currentValue;
					}
				}

				// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
				// but guard against overflow
				handledCPCountPlusOne = handledCPCount + 1;
				if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
					error('overflow');
				}

				delta += (m - n) * handledCPCountPlusOne;
				n = m;

				for (j = 0; j < inputLength; ++j) {
					currentValue = input[j];

					if (currentValue < n && ++delta > maxInt) {
						error('overflow');
					}

					if (currentValue == n) {
						// Represent delta as a generalized variable-length integer
						for (q = delta, k = base; /* no condition */; k += base) {
							t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
							if (q < t) {
								break;
							}
							qMinusT = q - t;
							baseMinusT = base - t;
							output.push(
								stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
							);
							q = floor(qMinusT / baseMinusT);
						}

						output.push(stringFromCharCode(digitToBasic(q, 0)));
						bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
						delta = 0;
						++handledCPCount;
					}
				}

				++delta;
				++n;

			}
			return output.join('');
		}

		/**
		 * Converts a Punycode string representing a domain name or an email address
		 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
		 * it doesn't matter if you call it on a string that has already been
		 * converted to Unicode.
		 * @memberOf punycode
		 * @param {String} input The Punycoded domain name or email address to
		 * convert to Unicode.
		 * @returns {String} The Unicode representation of the given Punycode
		 * string.
		 */
		function toUnicode(input) {
			return mapDomain(input, function(string) {
				return regexPunycode.test(string)
					? decode(string.slice(4).toLowerCase())
					: string;
			});
		}

		/**
		 * Converts a Unicode string representing a domain name or an email address to
		 * Punycode. Only the non-ASCII parts of the domain name will be converted,
		 * i.e. it doesn't matter if you call it with a domain that's already in
		 * ASCII.
		 * @memberOf punycode
		 * @param {String} input The domain name or email address to convert, as a
		 * Unicode string.
		 * @returns {String} The Punycode representation of the given domain name or
		 * email address.
		 */
		function toASCII(input) {
			return mapDomain(input, function(string) {
				return regexNonASCII.test(string)
					? 'xn--' + encode(string)
					: string;
			});
		}

		/*--------------------------------------------------------------------------*/

		/** Define the public API */
		punycode = {
			/**
			 * A string representing the current Punycode.js version number.
			 * @memberOf punycode
			 * @type String
			 */
			'version': '1.3.2',
			/**
			 * An object of methods to convert from JavaScript's internal character
			 * representation (UCS-2) to Unicode code points, and back.
			 * @see <https://mathiasbynens.be/notes/javascript-encoding>
			 * @memberOf punycode
			 * @type Object
			 */
			'ucs2': {
				'decode': ucs2decode,
				'encode': ucs2encode
			},
			'decode': decode,
			'encode': encode,
			'toASCII': toASCII,
			'toUnicode': toUnicode
		};

		/** Expose `punycode` */
		// Some AMD build optimizers, like r.js, check for specific condition patterns
		// like the following:
		if (
			true
		) {
			!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
				return punycode;
			}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else if (freeExports && freeModule) {
			if (module.exports == freeExports) { // in Node.js or RingoJS v0.8.0+
				freeModule.exports = punycode;
			} else { // in Narwhal or RingoJS v0.7.0-
				for (key in punycode) {
					punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
				}
			}
		} else { // in Rhino or a web browser
			root.punycode = punycode;
		}

	}(this));

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(57)(module), (function() { return this; }())))

/***/ },
/* 57 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 58 */
/***/ function(module, exports) {

	'use strict';

	module.exports = {
	  isString: function(arg) {
	    return typeof(arg) === 'string';
	  },
	  isObject: function(arg) {
	    return typeof(arg) === 'object' && arg !== null;
	  },
	  isNull: function(arg) {
	    return arg === null;
	  },
	  isNullOrUndefined: function(arg) {
	    return arg == null;
	  }
	};


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.decode = exports.parse = __webpack_require__(60);
	exports.encode = exports.stringify = __webpack_require__(61);


/***/ },
/* 60 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	'use strict';

	// If obj.hasOwnProperty has been overridden, then calling
	// obj.hasOwnProperty(prop) will break.
	// See: https://github.com/joyent/node/issues/1707
	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	module.exports = function(qs, sep, eq, options) {
	  sep = sep || '&';
	  eq = eq || '=';
	  var obj = {};

	  if (typeof qs !== 'string' || qs.length === 0) {
	    return obj;
	  }

	  var regexp = /\+/g;
	  qs = qs.split(sep);

	  var maxKeys = 1000;
	  if (options && typeof options.maxKeys === 'number') {
	    maxKeys = options.maxKeys;
	  }

	  var len = qs.length;
	  // maxKeys <= 0 means that we should not limit keys count
	  if (maxKeys > 0 && len > maxKeys) {
	    len = maxKeys;
	  }

	  for (var i = 0; i < len; ++i) {
	    var x = qs[i].replace(regexp, '%20'),
	        idx = x.indexOf(eq),
	        kstr, vstr, k, v;

	    if (idx >= 0) {
	      kstr = x.substr(0, idx);
	      vstr = x.substr(idx + 1);
	    } else {
	      kstr = x;
	      vstr = '';
	    }

	    k = decodeURIComponent(kstr);
	    v = decodeURIComponent(vstr);

	    if (!hasOwnProperty(obj, k)) {
	      obj[k] = v;
	    } else if (Array.isArray(obj[k])) {
	      obj[k].push(v);
	    } else {
	      obj[k] = [obj[k], v];
	    }
	  }

	  return obj;
	};


/***/ },
/* 61 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	'use strict';

	var stringifyPrimitive = function(v) {
	  switch (typeof v) {
	    case 'string':
	      return v;

	    case 'boolean':
	      return v ? 'true' : 'false';

	    case 'number':
	      return isFinite(v) ? v : '';

	    default:
	      return '';
	  }
	};

	module.exports = function(obj, sep, eq, name) {
	  sep = sep || '&';
	  eq = eq || '=';
	  if (obj === null) {
	    obj = undefined;
	  }

	  if (typeof obj === 'object') {
	    return Object.keys(obj).map(function(k) {
	      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
	      if (Array.isArray(obj[k])) {
	        return obj[k].map(function(v) {
	          return ks + encodeURIComponent(stringifyPrimitive(v));
	        }).join(sep);
	      } else {
	        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
	      }
	    }).join(sep);

	  }

	  if (!name) return '';
	  return encodeURIComponent(stringifyPrimitive(name)) + eq +
	         encodeURIComponent(stringifyPrimitive(obj));
	};


/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../../typings/tsd.d.ts" />
	"use strict";
	var fs = __webpack_require__(23);
	var $G = __webpack_require__(19);
	var $R = __webpack_require__(24);
	var DEFAULT_WEIGHT = 1;
	var JSONInput = (function () {
	    function JSONInput(_explicit_direction, _direction, _weighted_mode) {
	        if (_explicit_direction === void 0) { _explicit_direction = true; }
	        if (_direction === void 0) { _direction = false; }
	        if (_weighted_mode === void 0) { _weighted_mode = false; }
	        this._explicit_direction = _explicit_direction;
	        this._direction = _direction;
	        this._weighted_mode = _weighted_mode;
	    }
	    JSONInput.prototype.readFromJSONFile = function (filepath) {
	        this.checkNodeEnvironment();
	        var json = JSON.parse(fs.readFileSync(filepath).toString());
	        return this.readFromJSON(json);
	    };
	    JSONInput.prototype.readFromJSONURL = function (fileurl, cb) {
	        var self = this, graph, request, json;
	        // Node or browser ??
	        if (typeof window !== 'undefined') {
	            // Browser...			
	            request = new XMLHttpRequest();
	            request.onreadystatechange = function () {
	                // console.log("Ready state: " + request.readyState);
	                // console.log("Reqst status: " + request.status);
	                if (request.readyState == 4 && request.status == 200) {
	                    var json = JSON.parse(request.responseText);
	                    graph = self.readFromJSON(json);
	                    if (cb) {
	                        cb(graph, undefined);
	                    }
	                }
	            };
	            request.open("GET", fileurl, true);
	            request.timeout = 60000;
	            request.setRequestHeader('Content-Type', 'application/json');
	            request.send();
	        }
	        else {
	            // Node.js
	            $R.retrieveRemoteFile(fileurl, function (raw_graph) {
	                graph = self.readFromJSON(JSON.parse(raw_graph));
	                cb(graph, undefined);
	            });
	        }
	    };
	    /**
	     * In this case, there is one great difference to the CSV edge list cases:
	     * If you don't explicitly define a directed edge, it will simply
	     * instantiate an undirected one
	     * we'll leave that for now, as we will produce apt JSON sources later anyways...
	     */
	    JSONInput.prototype.readFromJSON = function (json) {
	        var graph = new $G.BaseGraph(json.name), coords_json, coords, coord_idx, coord_val, features, feature;
	        for (var node_id in json.data) {
	            var node = graph.hasNodeID(node_id) ? graph.getNodeById(node_id) : graph.addNode(node_id);
	            /**
	             * Reading and instantiating features
	             * We are using the shortcut setFeatures here,
	             * so we have to read them before any special features
	             */
	            if (features = json.data[node_id].features) {
	                // for ( feature in features ) {
	                // 	node.setFeature(feature, features[feature]);
	                // }
	                node.setFeatures(features);
	            }
	            /**
	             * Reading and instantiating coordinates
	             * Coordinates are treated as special features,
	             * and are therefore added after general features
	             */
	            if (coords_json = json.data[node_id].coords) {
	                coords = {};
	                for (coord_idx in coords_json) {
	                    coords[coord_idx] = +coords_json[coord_idx];
	                }
	                node.setFeature('coords', coords);
	            }
	            // Reading and instantiating edges
	            var edges = json.data[node_id].edges;
	            for (var e in edges) {
	                var edge_input = edges[e], target_node_id = edge_input.to, 
	                // Is there any direction information?
	                directed = this._explicit_direction ? edge_input.directed : this._direction, dir_char = directed ? 'd' : 'u', 
	                // Is there any weight information?,
	                weight_float = parseFloat(edge_input.weight), weight_info = weight_float === weight_float ? weight_float : DEFAULT_WEIGHT, edge_weight = this._weighted_mode ? weight_info : undefined, target_node = graph.hasNodeID(target_node_id) ? graph.getNodeById(target_node_id) : graph.addNode(target_node_id);
	                var edge_id = node_id + "_" + target_node_id + "_" + dir_char, edge_id_u2 = target_node_id + "_" + node_id + "_" + dir_char;
	                if (graph.hasEdgeID(edge_id) || (!directed && graph.hasEdgeID(edge_id_u2))) {
	                    // The completely same edge should only be added once...
	                    continue;
	                }
	                else {
	                    var edge = graph.addEdge(edge_id, node, target_node, {
	                        directed: directed,
	                        weighted: this._weighted_mode,
	                        weight: edge_weight
	                    });
	                }
	            }
	        }
	        return graph;
	    };
	    JSONInput.prototype.checkNodeEnvironment = function () {
	        if (typeof window !== 'undefined') {
	            throw new Error('Cannot read file in browser environment.');
	        }
	    };
	    return JSONInput;
	}());
	exports.JSONInput = JSONInput;


/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../../typings/tsd.d.ts" />
	"use strict";
	var $G = __webpack_require__(19);
	var $CB = __webpack_require__(64);
	/**
	 * Breadth first search - usually performed to see
	 * reachability etc. Therefore we do not want 'segments'
	 * or 'components' of our graph, but simply one well
	 * defined result segment covering the whole graph.
	 *
	 * @param graph the graph to perform BFS on
	 * @param v the vertex to use as a start vertex
	 * @param config an optional config object, will be
	 * automatically instantiated if not passed by caller
	 * @returns {{}}
	 * @constructor
	 */
	function BFS(graph, v, config) {
	    var config = config || prepareBFSStandardConfig(), callbacks = config.callbacks, dir_mode = config.dir_mode;
	    /**
	     * We are not traversing an empty graph...
	     */
	    if (graph.getMode() === $G.GraphMode.INIT) {
	        throw new Error('Cowardly refusing to traverse graph without edges.');
	    }
	    /**
	     * We are not traversing a graph taking NO edges into account
	     */
	    if (dir_mode === $G.GraphMode.INIT) {
	        throw new Error('Cannot traverse a graph with dir_mode set to INIT.');
	    }
	    // scope to pass to callbacks at different stages of execution
	    var bfsScope = {
	        marked: {},
	        nodes: graph.getNodes(),
	        queue: [],
	        current: null,
	        next_node: null,
	        next_edge: null,
	        root_node: v,
	        adj_nodes: []
	    };
	    /**
	       * HOOK 1: BFS INIT
	       */
	    if (callbacks.init_bfs) {
	        $CB.execCallbacks(callbacks.init_bfs, bfsScope);
	    }
	    bfsScope.queue.push(v);
	    var i = 0;
	    while (i < bfsScope.queue.length) {
	        bfsScope.current = bfsScope.queue[i++];
	        /**
	         * Do we move only in the directed subgraph,
	         * undirected subgraph or complete (mixed) graph?
	         */
	        if (dir_mode === $G.GraphMode.MIXED) {
	            bfsScope.adj_nodes = bfsScope.current.reachNodes();
	        }
	        else if (dir_mode === $G.GraphMode.UNDIRECTED) {
	            bfsScope.adj_nodes = bfsScope.current.connNodes();
	        }
	        else if (dir_mode === $G.GraphMode.DIRECTED) {
	            bfsScope.adj_nodes = bfsScope.current.nextNodes();
	        }
	        else {
	            bfsScope.adj_nodes = [];
	        }
	        /**
	         * HOOK 2 - Sort adjacent nodes
	         */
	        if (typeof callbacks.sort_nodes === 'function') {
	            callbacks.sort_nodes(bfsScope);
	        }
	        for (var adj_idx in bfsScope.adj_nodes) {
	            bfsScope.next_node = bfsScope.adj_nodes[adj_idx].node;
	            bfsScope.next_edge = bfsScope.adj_nodes[adj_idx].edge;
	            /**
	             * HOOK 3 - Node unmarked
	             */
	            if (config.result[bfsScope.next_node.getID()].distance === Number.POSITIVE_INFINITY) {
	                if (callbacks.node_unmarked) {
	                    $CB.execCallbacks(callbacks.node_unmarked, bfsScope);
	                }
	            }
	            else {
	                /**
	                 * HOOK 4 - Node marked
	                 */
	                if (callbacks.node_marked) {
	                    $CB.execCallbacks(callbacks.node_marked, bfsScope);
	                }
	            }
	        }
	    }
	    return config.result;
	}
	exports.BFS = BFS;
	function prepareBFSStandardConfig() {
	    var config = {
	        result: {},
	        callbacks: {
	            init_bfs: [],
	            node_unmarked: [],
	            node_marked: [],
	            sort_nodes: undefined
	        },
	        dir_mode: $G.GraphMode.MIXED,
	        messages: {},
	        filters: {}
	    }, result = config.result, callbacks = config.callbacks;
	    var count = 0;
	    var counter = function () {
	        return count++;
	    };
	    // Standard INIT callback
	    var initBFS = function (context) {
	        // initialize all nodes to infinite distance
	        for (var key in context.nodes) {
	            config.result[key] = {
	                distance: Number.POSITIVE_INFINITY,
	                parent: null,
	                counter: -1
	            };
	        }
	        // initialize root node entry
	        config.result[context.root_node.getID()] = {
	            distance: 0,
	            parent: context.root_node,
	            counter: counter()
	        };
	    };
	    callbacks.init_bfs.push(initBFS);
	    // Standard Node unmarked callback
	    // have to populate respective result entry
	    var nodeUnmarked = function (context) {
	        config.result[context.next_node.getID()] = {
	            distance: result[context.current.getID()].distance + 1,
	            parent: context.current,
	            counter: counter()
	        };
	        context.queue.push(context.next_node);
	    };
	    callbacks.node_unmarked.push(nodeUnmarked);
	    return config;
	}
	exports.prepareBFSStandardConfig = prepareBFSStandardConfig;


/***/ },
/* 64 */
/***/ function(module, exports) {

	"use strict";
	/**
	 * @param context this pointer to the DFS or DFSVisit function
	 */
	function execCallbacks(cbs, context) {
	    cbs.forEach(function (cb) {
	        if (typeof cb === 'function') {
	            cb(context);
	        }
	        else {
	            throw new Error('Provided callback is not a function.');
	        }
	    });
	}
	exports.execCallbacks = execCallbacks;


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../../typings/tsd.d.ts" />
	"use strict";
	var $G = __webpack_require__(19);
	var $CB = __webpack_require__(64);
	/**
	 * DFS Visit - one run to see what nodes are reachable
	 * from a given "current" root node
	 *
	 * @param graph
	 * @param current_root
	 * @param config
	 * @returns {{}}
	 * @constructor
	 */
	function DFSVisit(graph, current_root, config) {
	    // scope to pass to callbacks at different stages of execution
	    var dfsVisitScope = {
	        stack: [],
	        adj_nodes: [],
	        stack_entry: null,
	        current: null,
	        current_root: current_root
	    };
	    var config = config || prepareDFSVisitStandardConfig(), callbacks = config.callbacks, dir_mode = config.dir_mode;
	    /**
	     * We are not traversing an empty graph...
	     */
	    if (graph.getMode() === $G.GraphMode.INIT) {
	        throw new Error('Cowardly refusing to traverse graph without edges.');
	    }
	    /**
	       * We are not traversing a graph taking NO edges into account
	       */
	    if (dir_mode === $G.GraphMode.INIT) {
	        throw new Error('Cannot traverse a graph with dir_mode set to INIT.');
	    }
	    /**
	     * HOOK 1 - INIT (INNER DFS VISIT):
	     * Initializing a possible result object,
	     * possibly with the current_root;
	     */
	    if (callbacks.init_dfs_visit) {
	        $CB.execCallbacks(callbacks.init_dfs_visit, dfsVisitScope);
	    }
	    // Start by pushing current root to the stack
	    dfsVisitScope.stack.push({
	        node: current_root,
	        parent: current_root,
	        weight: 0 // initial weight cost from current_root
	    });
	    while (dfsVisitScope.stack.length) {
	        dfsVisitScope.stack_entry = dfsVisitScope.stack.pop();
	        dfsVisitScope.current = dfsVisitScope.stack_entry.node;
	        /**
	         * HOOK 2 - AQUIRED CURRENT NODE / POPPED NODE
	         */
	        if (callbacks.node_popped) {
	            $CB.execCallbacks(callbacks.node_popped, dfsVisitScope);
	        }
	        if (!config.dfs_visit_marked[dfsVisitScope.current.getID()]) {
	            config.dfs_visit_marked[dfsVisitScope.current.getID()] = true;
	            /**
	             * HOOK 3 - CURRENT NODE UNMARKED
	             */
	            if (callbacks.node_unmarked) {
	                $CB.execCallbacks(callbacks.node_unmarked, dfsVisitScope);
	            }
	            /**
	             * Do we move only in the directed subgraph,
	             * undirected subgraph or complete (mixed) graph?
	             */
	            if (dir_mode === $G.GraphMode.MIXED) {
	                dfsVisitScope.adj_nodes = dfsVisitScope.current.reachNodes();
	            }
	            else if (dir_mode === $G.GraphMode.UNDIRECTED) {
	                dfsVisitScope.adj_nodes = dfsVisitScope.current.connNodes();
	            }
	            else if (dir_mode === $G.GraphMode.DIRECTED) {
	                dfsVisitScope.adj_nodes = dfsVisitScope.current.nextNodes();
	            }
	            /**
	             * HOOK 4 - SORT ADJACENT NODES
	             */
	            if (typeof callbacks.sort_nodes === 'function') {
	                callbacks.sort_nodes(dfsVisitScope);
	            }
	            for (var adj_idx in dfsVisitScope.adj_nodes) {
	                /**
	                 * HOOK 5 - NODE OR EDGE TYPE CHECK...
	                 * LATER !!
	                 */
	                if (callbacks) {
	                }
	                dfsVisitScope.stack.push({
	                    node: dfsVisitScope.adj_nodes[adj_idx].node,
	                    parent: dfsVisitScope.current,
	                    weight: dfsVisitScope.adj_nodes[adj_idx].edge.getWeight()
	                });
	            }
	            /**
	             * HOOK 6 - ADJACENT NODES PUSHED - LEAVING CURRENT NODE
	             */
	            if (callbacks.adj_nodes_pushed) {
	                $CB.execCallbacks(callbacks.adj_nodes_pushed, dfsVisitScope);
	            }
	        }
	        else {
	            /**
	             * HOOK 7 - CURRENT NODE ALREADY MARKED
	             */
	            if (callbacks.node_marked) {
	                $CB.execCallbacks(callbacks.node_marked, dfsVisitScope);
	            }
	        }
	    }
	    return config.visit_result;
	}
	exports.DFSVisit = DFSVisit;
	/**
	 * Depth first search - used for reachability / exploration
	 * of graph structure and as a basis for topological sorting
	 * and component / community analysis.
	 * Because DFS can be used as a basis for many other algorithms,
	 * we want to keep the result as generic as possible to be
	 * populated by the caller rather than the core DFS algorithm.
	 *
	 * @param graph
	 * @param root
	 * @param config
	 * @returns {{}[]}
	 * @constructor
	 */
	function DFS(graph, root, config) {
	    var config = config || prepareDFSStandardConfig(), callbacks = config.callbacks, dir_mode = config.dir_mode;
	    if (graph.getMode() === $G.GraphMode.INIT) {
	        throw new Error('Cowardly refusing to traverse graph without edges.');
	    }
	    if (dir_mode === $G.GraphMode.INIT) {
	        throw new Error('Cannot traverse a graph with dir_mode set to INIT.');
	    }
	    var dfsScope = {
	        marked: {},
	        nodes: graph.getNodes()
	    };
	    /**
	     * HOOK 1 - INIT (OUTER DFS)
	     */
	    if (callbacks.init_dfs) {
	        $CB.execCallbacks(callbacks.init_dfs, dfsScope);
	    }
	    callbacks.adj_nodes_pushed = callbacks.adj_nodes_pushed || [];
	    var markNode = function (context) {
	        dfsScope.marked[context.current.getID()] = true;
	    };
	    callbacks.adj_nodes_pushed.push(markNode);
	    // We need to put our results into segments
	    // for easy counting of 'components'
	    // TODO refactor for count & counter...
	    var dfs_result = [{}];
	    var dfs_idx = 0;
	    var count = 0;
	    var counter = function () {
	        return count++;
	    };
	    /**
	     * We not only add new nodes to the result object
	     * of DFSVisit, but also to it's appropriate
	     * segment of the dfs_result object
	     */
	    var addToProperSegment = function (context) {
	        dfs_result[dfs_idx][context.current.getID()] = {
	            parent: context.stack_entry.parent,
	            counter: counter()
	        };
	    };
	    // check if a callbacks object has been instantiated
	    if (callbacks && callbacks.node_unmarked) {
	        callbacks.node_unmarked.push(addToProperSegment);
	    }
	    // Start with root node, no matter what
	    DFSVisit(graph, root, config);
	    // Now take the rest in 'normal' order
	    for (var node_key in dfsScope.nodes) {
	        if (!dfsScope.marked[node_key]) {
	            // Next segment in dfs_results
	            dfs_idx++;
	            dfs_result.push({});
	            // Explore and fill next subsegment
	            DFSVisit(graph, dfsScope.nodes[node_key], config);
	        }
	    }
	    // console.dir(config.visit_result);
	    return dfs_result;
	}
	exports.DFS = DFS;
	/**
	 * This is the only place in which a config object
	 * is instantiated (except manually, of course)
	 *
	 * Therefore, we do not take any arguments
	 */
	function prepareDFSVisitStandardConfig() {
	    var config = {
	        visit_result: {},
	        callbacks: {},
	        messages: {},
	        dfs_visit_marked: {},
	        dir_mode: $G.GraphMode.MIXED
	    }, result = config.visit_result, callbacks = config.callbacks;
	    // internal variable for order of visit
	    // during DFS Visit                      
	    var count = 0;
	    var counter = function () {
	        return count++;
	    };
	    callbacks.init_dfs_visit = callbacks.init_dfs_visit || [];
	    var initDFSVisit = function (context) {
	        result[context.current_root.getID()] = {
	            parent: context.current_root
	        };
	    };
	    callbacks.init_dfs_visit.push(initDFSVisit);
	    callbacks.node_unmarked = callbacks.node_unmarked || [];
	    var setResultEntry = function (context) {
	        result[context.current.getID()] = {
	            parent: context.stack_entry.parent,
	            counter: counter()
	        };
	    };
	    callbacks.node_unmarked.push(setResultEntry);
	    return config;
	}
	exports.prepareDFSVisitStandardConfig = prepareDFSVisitStandardConfig;
	/**
	 * First instantiates config file for DFSVisit, then
	 * enhances it with outer DFS init callback
	 */
	function prepareDFSStandardConfig() {
	    // First prepare DFS Visit callbacks
	    var config = prepareDFSVisitStandardConfig(), callbacks = config.callbacks, result = config.visit_result;
	    // Now add outer DFS INIT callback
	    callbacks.init_dfs = callbacks.init_dfs || [];
	    var setInitialResultEntries = function (context) {
	        // for ( var node_id in context.nodes ) {
	        // 	result[node_id] = {
	        // 		parent: null,
	        // 		counter: -1
	        // 	}
	        // }
	    };
	    callbacks.init_dfs.push(setInitialResultEntries);
	    return config;
	}
	exports.prepareDFSStandardConfig = prepareDFSStandardConfig;
	;


/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../../typings/tsd.d.ts" />
	"use strict";
	var $E = __webpack_require__(16);
	var $G = __webpack_require__(19);
	var $CB = __webpack_require__(64);
	var $BH = __webpack_require__(67);
	/**
	 * Priority first search
	 *
	 * Like BFS, we are not necessarily visiting the
	 * whole graph, but only what's reachable from
	 * a given start node.
	 *
	 * @param graph the graph to perform PFS only
	 * @param v the node from which to start PFS
	 * @config a config object similar to that used
	 * in BFS, automatically instantiated if not given..
	 */
	function PFS(graph, v, config) {
	    var config = config || preparePFSStandardConfig(), callbacks = config.callbacks, dir_mode = config.dir_mode;
	    /**
	       * We are not traversing an empty graph...
	       */
	    if (graph.getMode() === $G.GraphMode.INIT) {
	        throw new Error('Cowardly refusing to traverse graph without edges.');
	    }
	    /**
	       * We are not traversing a graph taking NO edges into account
	       */
	    if (dir_mode === $G.GraphMode.INIT) {
	        throw new Error('Cannot traverse a graph with dir_mode set to INIT.');
	    }
	    /**
	     * we take a standard eval function returning
	     * the weight of a successor edge
	     * This will later be replaced by a config option...
	     */
	    var evalPriority = function (ne) {
	        return ne.best;
	    };
	    /**
	     * we take a standard ID function returning
	     * the ID of a NeighborEntry's node
	     * This will later be replaced by a config option...
	     */
	    var evalObjID = function (ne) {
	        return ne.node.getID();
	    };
	    // We need to push NeighborEntries
	    // TODO: Virtual edge addition OK?
	    var start_ne = {
	        node: v,
	        edge: new $E.BaseEdge('virtual start edge', v, v, { weighted: true, weight: 0 }),
	        best: 0
	    };
	    var scope = {
	        OPEN_HEAP: new $BH.BinaryHeap($BH.BinaryHeapMode.MIN, evalPriority, evalObjID),
	        OPEN: {},
	        CLOSED: {},
	        nodes: graph.getNodes(),
	        root_node: v,
	        current: start_ne,
	        adj_nodes: [],
	        next: null,
	        better_dist: Number.POSITIVE_INFINITY,
	    };
	    /**
	       * HOOK 1: PFS INIT
	       */
	    callbacks.init_pfs && $CB.execCallbacks(callbacks.init_pfs, scope);
	    scope.OPEN_HEAP.insert(start_ne);
	    scope.OPEN[start_ne.node.getID()] = start_ne;
	    /**
	     * Main loop
	     */
	    while (scope.OPEN_HEAP.size()) {
	        // get currently best node
	        scope.current = scope.OPEN_HEAP.pop();
	        if (scope.current == null) {
	            console.log("HEAP popped undefined - HEAP size: " + scope.OPEN_HEAP.size());
	        }
	        // remove from OPEN
	        scope.OPEN[scope.current.node.getID()] = undefined;
	        // add it to CLOSED
	        scope.CLOSED[scope.current.node.getID()] = scope.current;
	        // TODO what if we already reached the goal?
	        if (scope.current.node === config.goal_node) {
	            /**
	             * HOOK 2: Goal node reached
	             */
	            config.callbacks.goal_reached && $CB.execCallbacks(config.callbacks.goal_reached, scope);
	            // If a goal node is set from the outside & we reach it, we stop.
	            return config.result;
	        }
	        /**
	         * Extend the current node, also called
	         * "create n's successors"...
	             */
	        // TODO: Reverse callback logic to NOT merge anything by default!!!
	        if (dir_mode === $G.GraphMode.MIXED) {
	            scope.adj_nodes = scope.current.node.reachNodes();
	        }
	        else if (dir_mode === $G.GraphMode.UNDIRECTED) {
	            scope.adj_nodes = scope.current.node.connNodes();
	        }
	        else if (dir_mode === $G.GraphMode.DIRECTED) {
	            scope.adj_nodes = scope.current.node.nextNodes();
	        }
	        else {
	            throw new Error('Unsupported traversal mode. Please use directed, undirected, or mixed');
	        }
	        /**
	         * EXPAND AND EXAMINE NEIGHBORHOOD
	         */
	        for (var adj_idx in scope.adj_nodes) {
	            scope.next = scope.adj_nodes[adj_idx];
	            if (scope.CLOSED[scope.next.node.getID()]) {
	                /**
	                 * HOOK 3: Goal node already closed
	                 */
	                config.callbacks.node_closed && $CB.execCallbacks(config.callbacks.node_closed, scope);
	                continue;
	            }
	            if (scope.OPEN[scope.next.node.getID()]) {
	                // First let's recover the previous best solution from our OPEN structure,
	                // as the node's neighborhood-retrieving function cannot know it...
	                scope.next.best = scope.OPEN[scope.next.node.getID()].best;
	                /**
	                 * HOOK 4: Goal node already visited, but not yet closed
	                 */
	                config.callbacks.node_open && $CB.execCallbacks(config.callbacks.node_open, scope);
	                scope.better_dist = scope.current.best + scope.next.edge.getWeight();
	                if (scope.next.best > scope.better_dist) {
	                    /**
	                     * HOOK 5: Better path found
	                     */
	                    config.callbacks.better_path && $CB.execCallbacks(config.callbacks.better_path, scope);
	                    // HEAP operations are necessary for internal traversal,
	                    // so we handle them here in the main loop
	                    scope.OPEN_HEAP.remove(scope.next);
	                    scope.next.best = scope.better_dist;
	                    scope.OPEN_HEAP.insert(scope.next);
	                    scope.OPEN[scope.next.node.getID()].best = scope.better_dist;
	                }
	                continue;
	            }
	            // NODE NOT ENCOUNTERED
	            config.callbacks.not_encountered && $CB.execCallbacks(config.callbacks.not_encountered, scope);
	            // HEAP operations are necessary for internal traversal,
	            // so we handle them here in the main loop
	            scope.OPEN_HEAP.insert(scope.next);
	            scope.OPEN[scope.next.node.getID()] = scope.next;
	        }
	    }
	    return config.result;
	}
	exports.PFS = PFS;
	function preparePFSStandardConfig() {
	    var config = {
	        result: {},
	        callbacks: {
	            init_pfs: [],
	            not_encountered: [],
	            node_open: [],
	            node_closed: [],
	            better_path: [],
	            goal_reached: []
	        },
	        messages: {
	            init_pfs_msgs: [],
	            not_enc_msgs: [],
	            node_open_msgs: [],
	            node_closed_msgs: [],
	            better_path_msgs: [],
	            goal_reached_msgs: []
	        },
	        dir_mode: $G.GraphMode.MIXED,
	        goal_node: null
	    }, callbacks = config.callbacks;
	    var count = 0;
	    var counter = function () {
	        return count++;
	    };
	    // Standard INIT callback
	    var initPFS = function (context) {
	        // initialize all nodes to infinite distance
	        for (var key in context.nodes) {
	            config.result[key] = {
	                distance: Number.POSITIVE_INFINITY,
	                parent: null,
	                counter: -1
	            };
	        }
	        // initialize root node entry
	        // maybe take heuristic into account right here...??
	        config.result[context.root_node.getID()] = {
	            distance: 0,
	            parent: context.root_node,
	            counter: counter()
	        };
	    };
	    callbacks.init_pfs.push(initPFS);
	    // Node not yet encountered callback
	    var notEncountered = function (context) {
	        // setting it's best score to actual distance + edge weight
	        // and update result structure
	        context.next.best = context.current.best + context.next.edge.getWeight();
	        config.result[context.next.node.getID()] = {
	            distance: context.next.best,
	            parent: context.current.node,
	            counter: undefined
	        };
	    };
	    callbacks.not_encountered.push(notEncountered);
	    // Callback for when we find a better solution
	    var betterPathFound = function (context) {
	        config.result[context.next.node.getID()].distance = context.better_dist;
	        config.result[context.next.node.getID()].parent = context.current.node;
	    };
	    callbacks.better_path.push(betterPathFound);
	    return config;
	}
	exports.preparePFSStandardConfig = preparePFSStandardConfig;


/***/ },
/* 67 */
/***/ function(module, exports) {

	/// <reference path="../../typings/tsd.d.ts" />
	"use strict";
	(function (BinaryHeapMode) {
	    BinaryHeapMode[BinaryHeapMode["MIN"] = 0] = "MIN";
	    BinaryHeapMode[BinaryHeapMode["MAX"] = 1] = "MAX";
	})(exports.BinaryHeapMode || (exports.BinaryHeapMode = {}));
	var BinaryHeapMode = exports.BinaryHeapMode;
	var BinaryHeap = (function () {
	    /**
	     * Mode of a min heap should only be set upon
	     * instantiation and never again afterwards...
	     * @param _mode MIN or MAX heap
	     * @param _evalPriority the evaluation function applied to
	     * all incoming objects to determine it's score
	     * @param _evalObjID function to determine the identity of
	     * the object we are looking for at removal etc..
	     */
	    function BinaryHeap(_mode, _evalPriority, _evalObjID) {
	        if (_mode === void 0) { _mode = BinaryHeapMode.MIN; }
	        if (_evalPriority === void 0) { _evalPriority = function (obj) {
	            if (typeof obj !== 'number' && typeof obj !== 'string') {
	                return NaN;
	            }
	            return parseInt(obj);
	        }; }
	        if (_evalObjID === void 0) { _evalObjID = function (obj) {
	            return obj;
	        }; }
	        this._mode = _mode;
	        this._evalPriority = _evalPriority;
	        this._evalObjID = _evalObjID;
	        this._array = [];
	        this._positions = {};
	    }
	    BinaryHeap.prototype.getMode = function () {
	        return this._mode;
	    };
	    BinaryHeap.prototype.getArray = function () {
	        return this._array;
	    };
	    BinaryHeap.prototype.getPositions = function () {
	        return this._positions;
	    };
	    BinaryHeap.prototype.size = function () {
	        return this._array.length;
	    };
	    BinaryHeap.prototype.getEvalPriorityFun = function () {
	        return this._evalPriority;
	    };
	    BinaryHeap.prototype.evalInputPriority = function (obj) {
	        return this._evalPriority(obj);
	    };
	    BinaryHeap.prototype.getEvalObjIDFun = function () {
	        return this._evalObjID;
	    };
	    BinaryHeap.prototype.evalInputObjID = function (obj) {
	        return this._evalObjID(obj);
	    };
	    BinaryHeap.prototype.peek = function () {
	        return this._array[0];
	    };
	    BinaryHeap.prototype.pop = function () {
	        if (this.size()) {
	            return this.remove(this._array[0]);
	        }
	    };
	    BinaryHeap.prototype.find = function (obj) {
	        var pos = this.getNodePosition(obj);
	        return this._array[pos];
	    };
	    /**
	     * Insert - Adding an object to the heap
	     * @param obj the obj to add to the heap
	     * @returns {number} the objects index in the internal array
	     */
	    BinaryHeap.prototype.insert = function (obj) {
	        if (isNaN(this._evalPriority(obj))) {
	            throw new Error("Cannot insert object without numeric priority.");
	        }
	        this._array.push(obj);
	        this.setNodePosition(obj, this.size() - 1, false);
	        this.trickleUp(this.size() - 1);
	    };
	    /**
	     *
	     */
	    BinaryHeap.prototype.remove = function (obj) {
	        if (isNaN(this._evalPriority(obj))) {
	            throw new Error('Object invalid.');
	        }
	        /**
	         * Search in O(1)
	         */
	        // var pos = this.getNodePosition(obj),
	        //     found = this._array[pos];
	        // if ( typeof found !== 'undefined' && found !== null ) {
	        //   var last = this._array.pop();
	        //   this.unsetNodePosition(found);
	        //   if ( this.size() ) {
	        //     this._array[pos] = last;
	        //     // update node position before trickling
	        //     this.setNodePosition(last, pos, true, this.size()); // old size after pop()..
	        //     this.trickleUp(pos);
	        //     this.trickleDown(pos);
	        //   }
	        //   return found;
	        // }
	        /**
	         * OLD SEARCH in O(n) (but simpler)
	         */
	        var objID = this._evalObjID(obj), found = undefined;
	        for (var pos = 0; pos < this._array.length; pos++) {
	            if (this._evalObjID(this._array[pos]) === objID) {
	                found = this._array[pos];
	                // we pop the last element
	                var last = this._array.pop();
	                // we switch the last with the found element
	                // and restore the heaps order, but only if the
	                // heap size is not down to zero
	                if (this.size()) {
	                    this._array[pos] = last;
	                    this.trickleUp(pos);
	                    this.trickleDown(pos);
	                }
	                return found;
	            }
	        }
	        // console.log("Found undefined object at position: " + pos);
	        return found;
	    };
	    BinaryHeap.prototype.trickleDown = function (i) {
	        var parent = this._array[i];
	        // run until we manually break
	        while (true) {
	            var right_child_idx = (i + 1) * 2, left_child_idx = right_child_idx - 1, right_child = this._array[right_child_idx], left_child = this._array[left_child_idx], swap = null;
	            // check if left child exists
	            if (left_child_idx < this.size() && !this.orderCorrect(parent, left_child)) {
	                swap = left_child_idx;
	            }
	            if (right_child_idx < this.size() && !this.orderCorrect(parent, right_child)
	                && !this.orderCorrect(left_child, right_child)) {
	                swap = right_child_idx;
	            }
	            if (swap === null) {
	                break;
	            }
	            // we only have to swap one child, doesn't matter which one
	            this._array[i] = this._array[swap];
	            this._array[swap] = parent;
	            // correct position for later lookup in O(1)
	            this.setNodePosition(this._array[i], i, true, swap);
	            this.setNodePosition(this._array[swap], swap, true, i);
	            i = swap;
	        }
	    };
	    BinaryHeap.prototype.trickleUp = function (i) {
	        var child = this._array[i];
	        // Can only trickle up from positive levels
	        while (i) {
	            var parent_idx = Math.floor((i + 1) / 2) - 1, parent = this._array[parent_idx];
	            if (this.orderCorrect(parent, child)) {
	                break;
	            }
	            else {
	                this._array[parent_idx] = child;
	                this._array[i] = parent;
	                // correct position for later lookup in O(1)
	                this.setNodePosition(child, parent_idx, true, i);
	                this.setNodePosition(parent, i, true, parent_idx);
	                // next round...
	                i = parent_idx;
	            }
	        }
	    };
	    BinaryHeap.prototype.orderCorrect = function (obj_a, obj_b) {
	        var obj_a_pr = this._evalPriority(obj_a);
	        var obj_b_pr = this._evalPriority(obj_b);
	        if (this._mode === BinaryHeapMode.MIN) {
	            return obj_a_pr <= obj_b_pr;
	        }
	        else {
	            return obj_a_pr >= obj_b_pr;
	        }
	    };
	    /**
	     * Superstructure to enable search in BinHeap in O(1)
	     * @param obj
	     * @param pos
	     */
	    BinaryHeap.prototype.setNodePosition = function (obj, new_pos, replace, old_pos) {
	        if (replace === void 0) { replace = true; }
	        if (typeof obj === 'undefined' || obj === null || typeof new_pos === 'undefined' || new_pos === null) {
	            throw new Error('minium required arguments are ojb and new_pos');
	        }
	        if (replace === true && (typeof old_pos === 'undefined' || old_pos === null)) {
	            throw new Error('replacing a node position requires an old_pos');
	        }
	        // First we create a new entry object
	        var pos_obj = {
	            priority: this.evalInputPriority(obj),
	            position: new_pos
	        };
	        var obj_key = this.evalInputObjID(obj);
	        var occurrence = this._positions[obj_key];
	        if (!occurrence) {
	            // we can simply add the object to the hash...
	            this._positions[obj_key] = pos_obj;
	        }
	        else if (Array.isArray(occurrence)) {
	            // if we replace, we add the position object to the array
	            if (replace) {
	                for (var i = 0; i < occurrence.length; i++) {
	                    if (occurrence[i].position === old_pos) {
	                        occurrence[i].position = new_pos;
	                        return;
	                    }
	                }
	            }
	            else {
	                occurrence.push(pos_obj);
	            }
	        }
	        else {
	            // we have a single object at this place...
	            // either we replace the droid or we give it some company ;)
	            if (replace) {
	                this._positions[obj_key] = pos_obj;
	            }
	            else {
	                this._positions[obj_key] = [occurrence, pos_obj];
	            }
	        }
	    };
	    /**
	     *
	     */
	    BinaryHeap.prototype.getNodePosition = function (obj) {
	        var obj_key = this.evalInputObjID(obj);
	        var occurrence = this._positions[obj_key];
	        if (!occurrence) {
	            console.log("getNodePosition: no occurrence found");
	            console.log("Neighborhood entry: ");
	            console.dir(obj);
	            console.log("Object KEY: " + obj_key);
	            return undefined;
	        }
	        else if (Array.isArray(occurrence)) {
	            // lets find the droid we are looking for...
	            // we are of course looking for the smallest one ;)
	            var node = null, min = Number.POSITIVE_INFINITY;
	            for (var i = 0; i < occurrence.length; i++) {
	                if (occurrence[i].position < min) {
	                    node = occurrence[i];
	                }
	            }
	            if (node) {
	                if (typeof node.position === 'undefined')
	                    console.log('Node position: undefined!');
	                return node.position;
	            }
	        }
	        else {
	            // we have a single object at this place
	            if (typeof occurrence.position === 'undefined')
	                console.log('Occurrence position: undefined!');
	            return occurrence.position;
	        }
	    };
	    /**
	     * @param obj
	     * @returns {number}
	     */
	    BinaryHeap.prototype.unsetNodePosition = function (obj) {
	        var obj_key = this.evalInputObjID(obj);
	        var occurrence = this._positions[obj_key];
	        if (!occurrence) {
	            console.log("Neighborhood entry: ");
	            console.log("Object: ");
	            console.dir(obj);
	            console.log("Object KEY: " + obj_key);
	            return undefined;
	        }
	        else if (Array.isArray(occurrence)) {
	            // lets find the droid we are looking for...
	            // we are of course looking for the smallest one ;)
	            var node_idx = null, node = null, min = Number.POSITIVE_INFINITY;
	            for (var i = 0; i < occurrence.length; i++) {
	                if (occurrence[i].position < min) {
	                    node_idx = i;
	                    node = occurrence[i];
	                }
	            }
	            if (node) {
	                // remove the wanted droid (it's become useless...)
	                occurrence.splice(node_idx, 1);
	                // if only 1 droid remains, make him officially single!
	                if (occurrence.length === 1) {
	                    this._positions[obj_key] = occurrence[0];
	                }
	                if (typeof node.position === 'undefined')
	                    console.log('Node position: undefined!');
	                return node.position;
	            }
	        }
	        else {
	            // we have a single object at this place
	            delete this._positions[obj_key];
	            return occurrence.position;
	        }
	    };
	    return BinaryHeap;
	}());
	exports.BinaryHeap = BinaryHeap;


/***/ }
/******/ ]);