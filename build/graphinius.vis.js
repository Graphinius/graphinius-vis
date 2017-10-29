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
	    mutate          = __webpack_require__(6),
	    hist_reader     = __webpack_require__(7),
	    main_loop       = __webpack_require__(8),
	    readCSV         = __webpack_require__(9),
	    readJSON        = __webpack_require__(10),
	    const_layout    = __webpack_require__(3),
	    sine_swing      = __webpack_require__(11),
	    force_layout    = __webpack_require__(12),
	    fullscreen      = __webpack_require__(5),
	    interaction     = __webpack_require__(18),
	    navigation      = __webpack_require__(19),
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
	    sine: sine_swing,
	    force: force_layout
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
/***/ function(module, exports) {

	// window.$G = require('graphinius').$G;

	// THREE.ImageUtils.crossOrigin = '';
	var loader = new THREE.TextureLoader();
	loader.crossOrigin = true;

	var disc = "/img/disc.png";
	var flake = "/img/snowflake.png";
	var bernd = "/img/bernd.jpg";

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
	    WIDTH: window.innerWidth,
	    HEIGHT: window.innerHeight
	  },
	  // default render parameters
	  defaults: {
	    background_color: 0x000000,

	    // Nodes
	    node_size: 3,
	    node_opacity: 1,
	    transparent: true,
	    
	    // Edges
	    edge_width: 1,
	    edge_opacity: 0.2,
	    texture: loader.load(disc),
	    
	    // Camera settings
	    fov: 90,
	    near: 1,
	    far: 1e4,
	    
	    //raycaster
	    highlight_node_color: new THREE.Color(0xf1ecfb),

	    //zoom
	    CAM_Z_DELTA_FACTOR: 0.5,
	    MAX_CAM_DISTANCE: 3e3,
	    MIN_CAM_DISTANCE: 1e2,

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
	    edge_color: {
	      r: 127,
	      g: 255,
	      b: 212
	    },
	    node_color: {
	      r: 255,
	      g: 20,
	      b: 20
	    },
	    
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
	      MIN_X: undefined,
	      MAX_X: undefined,
	      AVG_X: undefined,
	      MIN_Y: undefined,
	      MAX_Y: undefined,
	      AVG_Y: undefined,
	      MIN_Z: undefined,
	      MAX_Z: undefined,
	      AVG_Z: undefined
	    },
	    selected_node: undefined,
	    TWO_D_MODE: false,
	    INTERSECTED: {
	      index: 0, color: new THREE.Color(), node: null
	    },
	    raycaster: new THREE.Raycaster(),
	    renderer: new THREE.WebGLRenderer({antialias: false, alpha: true}),
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
	  // make transparent
	  globals.renderer.setClearColor(0x000000, 0);
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
	  // console.log(defaults.edge_color);
	  // console.log(defaults.node_color);
	  
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
	}

	module.exports = {
	  renderGraph: renderGraph,
	  nodes_obj_idx: nodes_obj_idx,
	  edges_obj_idx: edges_obj_idx
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var defaults = __webpack_require__(1).defaults;
	var force = __webpack_require__(1).force_layout;
	var switchToFullScreen = __webpack_require__(5).switchToFullScreen;

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
	  if(!document.querySelector("#forceLayoutSwitch").checked) {
	    // document.querySelector("#updateAllNodesButton").style.visibility="hidden";
	    // document.querySelector("#chosenHideNodeButton").style.visibility="hidden";
	    // document.querySelector("#chosenUpdateNodeButton").style.visibility="hidden";
	    force.fdLoop();
	  }
	  //stop force directed layout
	  else {
	    // document.querySelector("#updateAllNodesButton").style.visibility="visible";
	    // document.querySelector("#chosenHideNodeButton").style.visibility="visible";
	    // document.querySelector("#chosenUpdateNodeButton").style.visibility="visible";
	    force.fdStop();
	  }
	}

	function startStopHistory() {
	  if(!document.querySelector("#historySwitch").checked) {
	    console.log("History OFF...");
	    // force.fdLoop();
	  }
	  else {
	    console.log("History ON...");
	    // force.fdStop();
	  }
	}

	// document.querySelector("#node_size_input").addEventListener('input', function(event) {
	//   var new_node_size = document.querySelector("#node_size_input").value;
	//   defaults.node_size = new_node_size;
	//   document.querySelector("#node_size").innerHTML = new_node_size;
	// });



	// document.querySelector("#force_speed").addEventListener('input', function(event) {
	//   var speed = +document.querySelector("#force_speed").value;
	//   force.speed = speed;
	//   document.querySelector("#force_speed_display").innerHTML = speed;
	// });



	/**
	 * A vew standard view functions
	 */

	var globals = __webpack_require__(1).globals;


	window.addEventListener( 'resize', onWindowResize, false );

	function onWindowResize() {
	    globals.camera.aspect = window.innerWidth / window.innerHeight;
	    globals.camera.updateProjectionMatrix();
	    globals.renderer.setSize( window.innerWidth, window.innerHeight );
	}



	module.exports = {
	  startStopForce: startStopForce,
	  startStopHistory: startStopHistory,
	  setDirectionUnchecked: setDirectionUnchecked
	};

/***/ },
/* 5 */
/***/ function(module, exports) {

	var FSelem = {
	      el: null,
	      width: null,
	      height: null
	    };

	function switchToFullScreen(elem_string) {
	  // console.log(elem_string);
	  var elem = document.querySelector(elem_string);
	  // console.log(elem);
	  var canvas = document.querySelector(elem_string + " canvas");
	  // console.log(canvas);
	  
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
	    canvas.width = window.innerWidth;
	    canvas.height = window.innerHeight;
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

	module.exports = {
	  switchToFullScreen: switchToFullScreen
	}

/***/ },
/* 6 */
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
	  colorPFSclick: colorPFSclick,
	  colorDistMap: colorDistMap
	};


/***/ },
/* 7 */
/***/ function(module, exports) {

	

/***/ },
/* 8 */
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
/* 9 */
/***/ function(module, exports) {

	

/***/ },
/* 10 */
/***/ function(module, exports) {

	function readJSON(event, explicit, direction, weighted_mode) {
	  var startTime = +(new Date);
	  var explicit = typeof explicit === 'undefined' ? false : explicit;
	  var direction = typeof direction === 'undefined' ? false : direction;
	  var weighted_mode = typeof weighted_mode === 'undefined' ? false : weighted_mode;
	  
	  if(document.querySelector('#undirected').checked) {
	    direction = false;
	  }
	  else {
	    direction = true;
	  }
	  
	  var json = new $G.input.JSONInput(explicit, direction, weighted_mode);

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

	      document.querySelector("#nodes").innerHTML = window.graph.nrNodes();
	      document.querySelector("#dir-edges").innerHTML = window.graph.nrDirEdges();
	      document.querySelector("#und-edges").innerHTML = window.graph.nrUndEdges();

	      var endTime = +(new Date);
	      document.querySelector("#time").innerHTML = (endTime - startTime) + ' ms.';

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
/* 11 */
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
/* 12 */
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
	  var createQuadTree = __webpack_require__(13);
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

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * This is Barnes Hut simulation algorithm for 2d case. Implementation
	 * is highly optimized (avoids recusion and gc pressure)
	 *
	 * http://www.cs.princeton.edu/courses/archive/fall03/cs126/assignments/barnes-hut.html
	 */

	module.exports = function(options) {
	  options = options || {};
	  options.gravity = typeof options.gravity === 'number' ? options.gravity : -1;
	  options.theta = typeof options.theta === 'number' ? options.theta : 0.8;

	  // we require deterministic randomness here
	  var random = __webpack_require__(14).random(1984),
	    Node = __webpack_require__(15),
	    InsertStack = __webpack_require__(16),
	    isSamePosition = __webpack_require__(17);

	  var gravity = options.gravity,
	    updateQueue = [],
	    insertStack = new InsertStack(),
	    theta = options.theta,

	    nodesCache = [],
	    currentInCache = 0,
	    root = newNode();

	  return {
	    insertBodies: insertBodies,
	    /**
	     * Gets root node if its present
	     */
	    getRoot: function() {
	      return root;
	    },
	    updateBodyForce: update,
	    options: function(newOptions) {
	      if (newOptions) {
	        if (typeof newOptions.gravity === 'number') {
	          gravity = newOptions.gravity;
	        }
	        if (typeof newOptions.theta === 'number') {
	          theta = newOptions.theta;
	        }

	        return this;
	      }

	      return {
	        gravity: gravity,
	        theta: theta
	      };
	    }
	  };

	  function newNode() {
	    // To avoid pressure on GC we reuse nodes.
	    var node = nodesCache[currentInCache];
	    if (node) {
	      node.quad0 = null;
	      node.quad1 = null;
	      node.quad2 = null;
	      node.quad3 = null;
	      node.body = null;
	      node.mass = node.massX = node.massY = 0;
	      node.left = node.right = node.top = node.bottom = 0;
	    } else {
	      node = new Node();
	      nodesCache[currentInCache] = node;
	    }

	    ++currentInCache;
	    return node;
	  }

	  function update(sourceBody) {
	    var queue = updateQueue,
	      v,
	      dx,
	      dy,
	      r, fx = 0,
	      fy = 0,
	      queueLength = 1,
	      shiftIdx = 0,
	      pushIdx = 1;

	    queue[0] = root;

	    while (queueLength) {
	      var node = queue[shiftIdx],
	        body = node.body;

	      queueLength -= 1;
	      shiftIdx += 1;
	      var differentBody = (body !== sourceBody);
	      if (body && differentBody) {
	        // If the current node is a leaf node (and it is not source body),
	        // calculate the force exerted by the current node on body, and add this
	        // amount to body's net force.
	        dx = body.pos.x - sourceBody.pos.x;
	        dy = body.pos.y - sourceBody.pos.y;
	        r = Math.sqrt(dx * dx + dy * dy);

	        if (r === 0) {
	          // Poor man's protection against zero distance.
	          dx = (random.nextDouble() - 0.5) / 50;
	          dy = (random.nextDouble() - 0.5) / 50;
	          r = Math.sqrt(dx * dx + dy * dy);
	        }

	        // This is standard gravition force calculation but we divide
	        // by r^3 to save two operations when normalizing force vector.
	        v = gravity * body.mass * sourceBody.mass / (r * r * r);
	        fx += v * dx;
	        fy += v * dy;
	      } else if (differentBody) {
	        // Otherwise, calculate the ratio s / r,  where s is the width of the region
	        // represented by the internal node, and r is the distance between the body
	        // and the node's center-of-mass
	        dx = node.massX / node.mass - sourceBody.pos.x;
	        dy = node.massY / node.mass - sourceBody.pos.y;
	        r = Math.sqrt(dx * dx + dy * dy);

	        if (r === 0) {
	          // Sorry about code duplucation. I don't want to create many functions
	          // right away. Just want to see performance first.
	          dx = (random.nextDouble() - 0.5) / 50;
	          dy = (random.nextDouble() - 0.5) / 50;
	          r = Math.sqrt(dx * dx + dy * dy);
	        }
	        // If s / r < θ, treat this internal node as a single body, and calculate the
	        // force it exerts on sourceBody, and add this amount to sourceBody's net force.
	        if ((node.right - node.left) / r < theta) {
	          // in the if statement above we consider node's width only
	          // because the region was squarified during tree creation.
	          // Thus there is no difference between using width or height.
	          v = gravity * node.mass * sourceBody.mass / (r * r * r);
	          fx += v * dx;
	          fy += v * dy;
	        } else {
	          // Otherwise, run the procedure recursively on each of the current node's children.

	          // I intentionally unfolded this loop, to save several CPU cycles.
	          if (node.quad0) {
	            queue[pushIdx] = node.quad0;
	            queueLength += 1;
	            pushIdx += 1;
	          }
	          if (node.quad1) {
	            queue[pushIdx] = node.quad1;
	            queueLength += 1;
	            pushIdx += 1;
	          }
	          if (node.quad2) {
	            queue[pushIdx] = node.quad2;
	            queueLength += 1;
	            pushIdx += 1;
	          }
	          if (node.quad3) {
	            queue[pushIdx] = node.quad3;
	            queueLength += 1;
	            pushIdx += 1;
	          }
	        }
	      }
	    }

	    sourceBody.force.x += fx;
	    sourceBody.force.y += fy;
	  }

	  function insertBodies(bodies) {
	    var x1 = Number.MAX_VALUE,
	      y1 = Number.MAX_VALUE,
	      x2 = Number.MIN_VALUE,
	      y2 = Number.MIN_VALUE,
	      i,
	      max = bodies.length;

	    // To reduce quad tree depth we are looking for exact bounding box of all particles.
	    i = max;
	    while (i--) {
	      var x = bodies[i].pos.x;
	      var y = bodies[i].pos.y;
	      if (x < x1) {
	        x1 = x;
	      }
	      if (x > x2) {
	        x2 = x;
	      }
	      if (y < y1) {
	        y1 = y;
	      }
	      if (y > y2) {
	        y2 = y;
	      }
	    }

	    // Squarify the bounds.
	    var dx = x2 - x1,
	      dy = y2 - y1;
	    if (dx > dy) {
	      y2 = y1 + dx;
	    } else {
	      x2 = x1 + dy;
	    }

	    currentInCache = 0;
	    root = newNode();
	    root.left = x1;
	    root.right = x2;
	    root.top = y1;
	    root.bottom = y2;

	    i = max - 1;
	    if (i >= 0) {
	      root.body = bodies[i];
	    }
	    while (i--) {
	      insert(bodies[i], root);
	    }
	  }

	  function insert(newBody) {
	    insertStack.reset();
	    insertStack.push(root, newBody);

	    while (!insertStack.isEmpty()) {
	      var stackItem = insertStack.pop(),
	        node = stackItem.node,
	        body = stackItem.body;

	      if (!node.body) {
	        // This is internal node. Update the total mass of the node and center-of-mass.
	        var x = body.pos.x;
	        var y = body.pos.y;
	        node.mass = node.mass + body.mass;
	        node.massX = node.massX + body.mass * x;
	        node.massY = node.massY + body.mass * y;

	        // Recursively insert the body in the appropriate quadrant.
	        // But first find the appropriate quadrant.
	        var quadIdx = 0, // Assume we are in the 0's quad.
	          left = node.left,
	          right = (node.right + left) / 2,
	          top = node.top,
	          bottom = (node.bottom + top) / 2;

	        if (x > right) { // somewhere in the eastern part.
	          quadIdx = quadIdx + 1;
	          left = right;
	          right = node.right;
	        }
	        if (y > bottom) { // and in south.
	          quadIdx = quadIdx + 2;
	          top = bottom;
	          bottom = node.bottom;
	        }

	        var child = getChild(node, quadIdx);
	        if (!child) {
	          // The node is internal but this quadrant is not taken. Add
	          // subnode to it.
	          child = newNode();
	          child.left = left;
	          child.top = top;
	          child.right = right;
	          child.bottom = bottom;
	          child.body = body;

	          setChild(node, quadIdx, child);
	        } else {
	          // continue searching in this quadrant.
	          insertStack.push(child, body);
	        }
	      } else {
	        // We are trying to add to the leaf node.
	        // We have to convert current leaf into internal node
	        // and continue adding two nodes.
	        var oldBody = node.body;
	        node.body = null; // internal nodes do not cary bodies

	        if (isSamePosition(oldBody.pos, body.pos)) {
	          // Prevent infinite subdivision by bumping one node
	          // anywhere in this quadrant
	          var retriesCount = 3;
	          do {
	            var offset = random.nextDouble();
	            var dx = (node.right - node.left) * offset;
	            var dy = (node.bottom - node.top) * offset;

	            oldBody.pos.x = node.left + dx;
	            oldBody.pos.y = node.top + dy;
	            retriesCount -= 1;
	            // Make sure we don't bump it out of the box. If we do, next iteration should fix it
	          } while (retriesCount > 0 && isSamePosition(oldBody.pos, body.pos));

	          if (retriesCount === 0 && isSamePosition(oldBody.pos, body.pos)) {
	            // This is very bad, we ran out of precision.
	            // if we do not return from the method we'll get into
	            // infinite loop here. So we sacrifice correctness of layout, and keep the app running
	            // Next layout iteration should get larger bounding box in the first step and fix this
	            return;
	          }
	        }
	        // Next iteration should subdivide node further.
	        insertStack.push(node, oldBody);
	        insertStack.push(node, body);
	      }
	    }
	  }
	};

	function getChild(node, idx) {
	  if (idx === 0) return node.quad0;
	  if (idx === 1) return node.quad1;
	  if (idx === 2) return node.quad2;
	  if (idx === 3) return node.quad3;
	  return null;
	}

	function setChild(node, idx, child) {
	  if (idx === 0) node.quad0 = child;
	  else if (idx === 1) node.quad1 = child;
	  else if (idx === 2) node.quad2 = child;
	  else if (idx === 3) node.quad3 = child;
	}


/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = {
	  random: random,
	  randomIterator: randomIterator
	};

	/**
	 * Creates seeded PRNG with two methods:
	 *   next() and nextDouble()
	 */
	function random(inputSeed) {
	  var seed = typeof inputSeed === 'number' ? inputSeed : (+ new Date());
	  var randomFunc = function() {
	      // Robert Jenkins' 32 bit integer hash function.
	      seed = ((seed + 0x7ed55d16) + (seed << 12))  & 0xffffffff;
	      seed = ((seed ^ 0xc761c23c) ^ (seed >>> 19)) & 0xffffffff;
	      seed = ((seed + 0x165667b1) + (seed << 5))   & 0xffffffff;
	      seed = ((seed + 0xd3a2646c) ^ (seed << 9))   & 0xffffffff;
	      seed = ((seed + 0xfd7046c5) + (seed << 3))   & 0xffffffff;
	      seed = ((seed ^ 0xb55a4f09) ^ (seed >>> 16)) & 0xffffffff;
	      return (seed & 0xfffffff) / 0x10000000;
	  };

	  return {
	      /**
	       * Generates random integer number in the range from 0 (inclusive) to maxValue (exclusive)
	       *
	       * @param maxValue Number REQUIRED. Ommitting this number will result in NaN values from PRNG.
	       */
	      next : function (maxValue) {
	          return Math.floor(randomFunc() * maxValue);
	      },

	      /**
	       * Generates random double number in the range from 0 (inclusive) to 1 (exclusive)
	       * This function is the same as Math.random() (except that it could be seeded)
	       */
	      nextDouble : function () {
	          return randomFunc();
	      }
	  };
	}

	/*
	 * Creates iterator over array, which returns items of array in random order
	 * Time complexity is guaranteed to be O(n);
	 */
	function randomIterator(array, customRandom) {
	    var localRandom = customRandom || random();
	    if (typeof localRandom.next !== 'function') {
	      throw new Error('customRandom does not match expected API: next() function is missing');
	    }

	    return {
	        forEach : function (callback) {
	            var i, j, t;
	            for (i = array.length - 1; i > 0; --i) {
	                j = localRandom.next(i + 1); // i inclusive
	                t = array[j];
	                array[j] = array[i];
	                array[i] = t;

	                callback(t);
	            }

	            if (array.length) {
	                callback(array[0]);
	            }
	        },

	        /**
	         * Shuffles array randomly, in place.
	         */
	        shuffle : function () {
	            var i, j, t;
	            for (i = array.length - 1; i > 0; --i) {
	                j = localRandom.next(i + 1); // i inclusive
	                t = array[j];
	                array[j] = array[i];
	                array[i] = t;
	            }

	            return array;
	        }
	    };
	}


/***/ },
/* 15 */
/***/ function(module, exports) {

	/**
	 * Internal data structure to represent 2D QuadTree node
	 */
	module.exports = function Node() {
	  // body stored inside this node. In quad tree only leaf nodes (by construction)
	  // contain boides:
	  this.body = null;

	  // Child nodes are stored in quads. Each quad is presented by number:
	  // 0 | 1
	  // -----
	  // 2 | 3
	  this.quad0 = null;
	  this.quad1 = null;
	  this.quad2 = null;
	  this.quad3 = null;

	  // Total mass of current node
	  this.mass = 0;

	  // Center of mass coordinates
	  this.massX = 0;
	  this.massY = 0;

	  // bounding box coordinates
	  this.left = 0;
	  this.top = 0;
	  this.bottom = 0;
	  this.right = 0;
	};


/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = InsertStack;

	/**
	 * Our implmentation of QuadTree is non-recursive to avoid GC hit
	 * This data structure represent stack of elements
	 * which we are trying to insert into quad tree.
	 */
	function InsertStack () {
	    this.stack = [];
	    this.popIdx = 0;
	}

	InsertStack.prototype = {
	    isEmpty: function() {
	        return this.popIdx === 0;
	    },
	    push: function (node, body) {
	        var item = this.stack[this.popIdx];
	        if (!item) {
	            // we are trying to avoid memory pressue: create new element
	            // only when absolutely necessary
	            this.stack[this.popIdx] = new InsertStackElement(node, body);
	        } else {
	            item.node = node;
	            item.body = body;
	        }
	        ++this.popIdx;
	    },
	    pop: function () {
	        if (this.popIdx > 0) {
	            return this.stack[--this.popIdx];
	        }
	    },
	    reset: function () {
	        this.popIdx = 0;
	    }
	};

	function InsertStackElement(node, body) {
	    this.node = node; // QuadTree node
	    this.body = body; // physical body which needs to be inserted to node
	}


/***/ },
/* 17 */
/***/ function(module, exports) {

	module.exports = function isSamePosition(point1, point2) {
	    var dx = Math.abs(point1.x - point2.x);
	    var dy = Math.abs(point1.y - point2.y);

	    return (dx < 1e-8 && dy < 1e-8);
	};


/***/ },
/* 18 */
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
	    if(globals.TWO_D_MODE) {
	      node_obj[node].getFeature('coords').z = 0;
	    }
	    else {
	      node_obj[node].getFeature('coords').z = old_coordinates[index + 2] + Math.random() * 20 - 10 - dims.AVG_Z;
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
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var keys = __webpack_require__(1).keys;
	var globals = __webpack_require__(1).globals;
	var defaults = __webpack_require__(1).defaults;
	var update = __webpack_require__(2).update;
	var network = __webpack_require__(1).globals.network;
	var container = __webpack_require__(1).container;
	var mouse = __webpack_require__(1).globals.mouse;
	var nodeIntersection = __webpack_require__(18).nodeIntersection;
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
	    var new_z_pos = globals.camera.position.z + defaults.CAM_Z_DELTA_FACTOR * delta;
	    new_z_pos = Math.min(new_z_pos, defaults.MAX_CAM_DISTANCE);
	    new_z_pos = Math.max(new_z_pos, defaults.MIN_CAM_DISTANCE);
	    globals.camera.position.z = new_z_pos;
	    // console.log(new_z_pos);
	  }
	  window.requestAnimationFrame(update);
	}


	/**
	 * Hammer.js Controls (Touch)
	 */ 

	var main_el = document.getElementById("main_vis");

	var mc = new Hammer.Manager(main_el, {
		recognizers: [
	    // RecognizerClass, [options], [recognizeWith, ...], [requireFailure, ...]
	    [Hammer.Pan],
			[Hammer.Rotate],
			[Hammer.Pinch, { enable: true }, ['rotate']],
			[Hammer.Swipe], // ,{ direction: Hammer.DIRECTION_HORIZONTAL }
		]
	});

	var old_scale = 1;
	mc.on("pinch", function(ev) {
	  var new_z_pos = globals.camera.position.z - (ev.scale-old_scale) * 300;
	  old_scale = ev.scale;
	  new_z_pos = Math.min(new_z_pos, defaults.MAX_CAM_DISTANCE);
	  new_z_pos = Math.max(new_z_pos, defaults.MIN_CAM_DISTANCE);
	  globals.camera.position.z = new_z_pos;
	  window.requestAnimationFrame(update);
	  console.log(ev.scale-old_scale);
	  console.log(new_z_pos);
	});

	mc.on("pan", function(ev) {
	  console.log(ev.deltaX);
	  // console.log(ev.deltaY);
	  globals.camera.position.x -= ev.deltaX;
	  globals.camera.position.y -= ev.deltaY;
	  window.requestAnimationFrame(update);
	});



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
	  mouse: mouse
	};


/***/ }
/******/ ]);