const BASE_IMAGES_URL = 'https://berndmalle.com/graphinius-sample-data/images/';

console.log('Calling $GV from fetchResources: ', $GV)

function fetchJson( url ) {
  return fetch(url, {
    method: 'GET',
    // mode: "cors",
  })
  .then( response => response.json() )
}


function getGraphsDirectoryListing() {
  console.log('loading city graphs directory listing...');

  return fetchJson( BASE_IMAGES_URL )
    .then(data => {
      // console.log(data);
      return data;
    });
}


function getGraphsCategoryListing( cat ) {
  console.log(`loading graphs listing for category ${cat}`);

  return fetchJson( BASE_IMAGES_URL + `/${cat}/` )
    .then(data => {
      // console.log(data);
      return data;
    });
}


async function loadAndRenderGraph( graph_url ) {
  console.log(`Loading graph ${graph_url}`);

  const jsonReader = new $G.input.JSONInput(true, false, false);

  fetch( graph_url )
    .then( response => response.json() )
    .then( graph => {
      window.graph = jsonReader.readFromJSON( graph );

      /**
       * @todo {action} OMG refactor !!!
       */
      document.querySelector("#nodes").innerHTML = window.graph.nrNodes();
      document.querySelector("#dir-edges").innerHTML = window.graph.nrDirEdges();
      document.querySelector("#und-edges").innerHTML = window.graph.nrUndEdges();

      $GV.core.render.renderGraph();
      hideGraphModal();
    });
}


async function displayCategoryGraphs( cat ) {
  let graphs = await getGraphsCategoryListing( cat );
  // console.log( graphs );

  let entries_el = document.querySelector( "#graph-modal .entries");
  // console.log( entries_el );
  
  entries_el.innerHTML = '';

  for ( let graph of graphs ) {
    elChild = document.createElement('div');
    elChild.classList.add('graph-list-entry')

    elChild.innerHTML = `<a href="${BASE_IMAGES_URL}/${cat}/${graph.name}">${cat.name}/${graph.name}</a>`
    
    elChild.addEventListener('click', e => {
      e.preventDefault();
      console.log(`${BASE_IMAGES_URL}/${cat}/${graph.name}`);
      
      loadAndRenderGraph( `${BASE_IMAGES_URL}/${cat}/${graph.name}` );
    });
    entries_el.appendChild(elChild);
  }
}


async function displayGraphCategories() {
  showGraphModal();

  let categories = await getGraphsDirectoryListing();
  console.log( categories );

  let entries_el = document.querySelector( "#graph-modal .entries");
  // console.log( entries_el );
  
  entries_el.innerHTML = '';

  for ( let cat of categories ) {
    // console.log( cat );
    elChild = document.createElement('div');
    elChild.classList.add('graph-list-entry')
    elChild.innerHTML = `<a href="${BASE_IMAGES_URL}/${cat.name}">${cat.name}</a>`
    elChild.addEventListener('click', e => {
      e.preventDefault();
      displayCategoryGraphs( e.target.innerHTML );
    });
    entries_el.appendChild(elChild);
  }
}


function showGraphModal() {
  document.querySelector( "#graph-modal" ).classList.add("visible");
}


function hideGraphModal() {
  document.querySelector( "#graph-modal" ).classList.remove("visible");
}
