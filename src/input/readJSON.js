function readJSON(explicit, direction, weighted_mode, random_coords) {
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
    alert("ERROR: Browser does not support the File API.");
  }

  var files = document.getElementById('input').files;
  if (!files.length) {
    alert("No file selected.");
    return;
  }

  //only json files
  splitFileName = files[0].name.split(".");
  if(!splitFileName.pop().match('json')) {
    alert("ERROR: Invalid file type - can only load json files.");
    return;
  }

  var reader = new FileReader();
  var result = null;

  reader.onloadend = function(event){
    if (event.target.readyState == FileReader.DONE) {
      //console.log(event.target.result);
      var parsedFile = JSON.parse(event.target.result);

      /**
       * Actually reading the graph...
       */
      window.graph = json.readFromJSON(parsedFile);
      
      let node_keys = Object.keys(window.graph.getNodes());
      if ( random_coords && !window.graph.getNodes()[node_keys[0]].getFeature('coords') ) {
        console.log(`No coords found - generating random coordinates in range (0, 512)`);
        generateRandomCoords(window.graph);
      }

      /**
       * @todo {action} OMG refactor !!!
       */
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


function generateRandomCoords(graph) {
  let nodes = graph.getNodes();
  for ( let node_idx in nodes ) {
    let coords = {
      x: Math.random()*512,
      y: Math.random()*512,
      z: Math.random()*512
    }
    nodes[node_idx].setFeature('coords', coords);
  }
}


module.exports = {
  readJSON: readJSON
};
