const BASE_IMAGES_URL = 'https://berndmalle.com/graphinius-sample-data/images/';



function fetchJson( url ) {
  return fetch(url, {
    method: 'GET',
    // mode: "cors",
  })
  .then( response => response.json() )
}


function getGraphsDirectoryListing() {
  console.log('loading city graphs directory listing...');

  fetchJson( BASE_IMAGES_URL )
    .then(data => {
      console.log(data);
      return data;
    });
}


function getGraphsCategoryListing( cat ) {
  console.log(`loading graphs listing for category ${cat}`);

  fetchJson( BASE_IMAGES_URL + `/${cat}/` )
    .then(data => {
      console.log(data);
      return data;
    });
}