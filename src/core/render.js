var container = require("./init.js").container;
var globals = require("./init.js").globals;
var constant = require("../layout/constant_layout.js");
var controlUI = require("../view/controlUI.js");

function renderGraph() {
  
  var graph = graph || window.graph;
  if(!graph) {
    throw new Error("No graph object present, unable to render anything.");
  }

  constant.renderGraph(graph);
  window.requestAnimationFrame(updateGraph);
  // controlUI.setDirectionUnchecked();
  console.log("rendering graph...");
}

function updateGraph () {
  // make transparent
  globals.renderer.setClearColor(0x000000, 0);
  globals.renderer.render(globals.scene, globals.camera);
}

function clearScene() {
  let obj = globals.scene
  while(obj.children.length > 0) {
    // clearScene(obj.children[0])
    obj.remove(obj.children[0])
  }
  if(obj.geometry) obj.geometry.dispose()
  if(obj.material) obj.material.dispose()
  if(obj.texture) obj.texture.dispose()
  
  // De-reference
  window.graph = null
  globals.raycaster = null
  globals.renderer = null
  globals.scene = null
  globals.network = null
}


/**
 * Re-instantiating everything seems to keep the GPU memory (of course, why wouldn't it)
 * 
 * @description why does a page refresh clear the GPU then?
 * 
 * @todo find a way to clear the GPU from JS...
 */
function resetScene() {
  clearScene()
  setTimeout( () => {
    globals.raycaster = new THREE.Raycaster()
    globals.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
    globals.scene = new THREE.Scene()
    globals.network = new THREE.Group()
  }, 300)
}


module.exports = {
  renderGraph: renderGraph,
  update: updateGraph
  // reset: resetScene
};