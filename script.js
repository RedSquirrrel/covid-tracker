// total confirmed
window.onload = function () {
  this.getCovid();
};

function getCovid() {
  fetch('https://api.covid19api.com/summary')
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      let totalConfirmed = data.Global.TotalConfirmed;
      let totalDeaths = data.Global.TotalDeaths;
      let totalRecovered = data.Global.TotalRecovered;
      let latestUpdate = data.Date;

      document.getElementById('confirmed').innerHTML = totalConfirmed.toLocaleString();
      document.getElementById('deaths').innerHTML = totalDeaths.toLocaleString();
      document.getElementById('recovered').innerHTML = totalRecovered.toLocaleString();
      document.getElementById('update').innerHTML = latestUpdate.substr(0, 10);   
    })
    .catch(function (err) {
      console.log(err);
    });
    
  }  

// cases showing on map
const mymap = L.map('covidMap').setView([30.5260, 15.2551], 3);
const attribution =
  ' &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles = L.tileLayer(tileUrl, { attribution });
tiles.addTo(mymap);


async function getMap() {  
  const url_api = 'https://corona.lmao.ninja/v2/countries';
  const response = await fetch(url_api);
  const data = await response.json(response);  

  const hasData = Array.isArray(data) && data.length > 0;
    
  if ( !hasData ) return;


const geoJson = {
type: 'FeatureCollection',
features: data.map((country = {}) => {
  const { countryInfo = {} } = country;
  const { lat, long: lng } = countryInfo;
  return {
    type: 'Feature',
    properties: {
     ...country,
    },
    geometry: {
      type: 'Point',
      coordinates: [ lng, lat ]
    }
  }
})
}

const geoJsonLayers = new L.GeoJSON(geoJson, {
pointToLayer: (feature = {}, latlng) => {
  const { properties = {} } = feature;
  let updatedFormatted;
  let casesString;

  const {
    country,
    updated,
    cases,
    deaths,
    recovered
  } = properties

  casesString = `${cases}`;


  // convert number with commas as separators
  if ( cases > 1000 ) {
    casesString = `${casesString.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
  }

  if ( updated ) {
    updatedFormatted = new Date(updated).toLocaleString();
  }

  const html = `
    <span class="icon-marker">
      <span class="icon-marker-tooltip">
        <h2>${country}</h2>
        <ul>
          <li><strong>Confirmed:</strong> ${casesString}</li>
          <li><strong>Deaths:</strong> ${deaths}</li>
          <li><strong>Recovered:</strong> ${recovered}</li>
          <li><strong>Last Update:</strong> ${updatedFormatted}</li>
        </ul>
      </span>
      ${ casesString }
    </span>
  `;

  return L.marker( latlng, {
    icon: L.divIcon({
      className: 'icon',
      html
    }),
    riseOnHover: true
  });
}
});

geoJsonLayers.addTo(mymap)

}

getMap();

// Thank you for freeCodeCamp for this article:
// https://www.freecodecamp.org/news/how-to-create-a-coronavirus-covid-19-dashboard-map-app-in-react-with-gatsby-and-leaflet/