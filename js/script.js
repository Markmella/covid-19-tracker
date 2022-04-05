

let map;
let infoWindow;
let markers = [];

const countryList = document.querySelector('.country-list-container');

async function initMap() {
    let response = await axios.get('https://corona.lmao.ninja/v2/countries');
    covidData = response.data;

    const manila = {
        lat: 14.5995,
        lng: 120.9842
    };

    map = new google.maps.Map(document.getElementById('map'), {
        center: manila,
        zoom: 5,
        mapTypeId: 'roadmap',
        streetViewControl: false,
        zoomControl: false,
        mapTypeControl: false,
        fullscreenControl: false
    });

    google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
        document.getElementById('loading').style.display = 'none';
    });

    infoWindow = new google.maps.InfoWindow();
    countryList.style.display = 'none';
    searchCountry();
}

async function searchCountry(){
    countryList.style.display = 'block';
    let foundCountry = [];
    const inputText = document.querySelector('.country-input').value.toLowerCase();
    if(inputText.length != 0){
        countryList.style.display = 'block';
    }else {
        countryList.style.display = 'none';
    }

    covidData.filter(countryyy => {
        let countryName = countryyy.country;
        if(countryName.toLowerCase().includes(inputText)){
            foundCountry.push(countryyy);
        }
    })
    clearLocations();
    displayCountries(foundCountry);
    showCovidMarkers(foundCountry);
    openWindowInformation();
}

function openWindowInformation(){
    const countryElements = document.querySelectorAll('.country-list');
    countryElements.forEach((element, index) => {
        element.addEventListener('click', () => {
            new google.maps.event.trigger(markers[index], 'click');
            countryList.style.display = 'none';
        })
    });
}

function clearLocations(){
    infoWindow.close();
    markers.forEach(marker => {
        marker.setMap(null);
    });
    markers.length = 0;
}

function displayCountries(countries){
    let countrysHtml = '';
    if(countries.length != 0){
        countries.map(data => {
            let country = data.country;
            let countryFlag = data.countryInfo.flag;
            countrysHtml += `
                <div class="country-list">
                    <span class="name">${country}</span>
                    <img src="${countryFlag}" alt="flag">
                </div>
            `;
            document.querySelector('.country-info-container').innerHTML = countrysHtml;
        })      
    }else {
        countrysHtml += `
            <div class="error-message-container">
                <div class="error-message">
                    COUNTRY NOT FOUND
                </div>
            </div>
        `;
        document.querySelector('.country-info-container').innerHTML = countrysHtml;
    }
}

function showCovidMarkers(countries){
    // let bounds = new google.maps.LatLngBounds();
    countries.map(data => {
        let latlng = new google.maps.LatLng(
            data.countryInfo.lat,
            data.countryInfo.long);
        let lastUpdated = new Date(data.updated).toLocaleDateString();
        let country = data.country;
        let cases = data.cases;
        let deaths = data.deaths;
        let recovered = data.recovered;
        let iso2 = data.countryInfo.iso2;
        // bounds.extend(latlng);
        createCovidMarker(latlng, lastUpdated, country, cases, deaths, recovered, iso2);
    });
    // map.fitBounds(bounds);
}

function createCovidMarker(latlng, lastUpdated, country, cases, deaths, recovered, iso2){
    let html = '';
    html = `
        <div class="main-info-container">
            <div class="country-info">
                <span class="country"> ${country} </span> 
                <span class="last-updated"> Last Updated: ${lastUpdated} </span> 
            </div>
            <div class="main-info">
                <span class="cases"> Cases: ${cases} </span>
                <span class="recovered"> Recovered: ${recovered} </span>
                <span class="death"> Deaths: ${deaths} </span>
            </div>
        </div>
    `;

    let marker = new google.maps.Marker({
        map: map,
        position: latlng,
        label: iso2,
        icon: 'images/coronavirus.png'
    });

    google.maps.event.addListener(marker, 'click', () => {
        infoWindow.setContent(html);
        infoWindow.open(map, marker);
    });
    markers.push(marker);    
}
