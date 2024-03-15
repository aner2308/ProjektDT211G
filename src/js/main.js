"use strict";

const BtnEl = document.getElementById("Btn");
BtnEl.addEventListener('click', refreshData);

//Containers för mina textrutor under kartan
const heightInfoEl = document.getElementById('heightInfo');
const weatherInfoEl = document.getElementById('weatherInfo');
const timeInfoEl = document.getElementById('timeInfo');

let issMarker;

// URL för att hämta ISS position från OpenNotify API
const issURL = 'https://api.wheretheiss.at/v1/satellites/25544';

// URL för att hämta väderdata från OpenWeatherMap API
const weatherURL = 'https://api.openweathermap.org/data/2.5/weather';

// API-nyckel för OpenWeatherMap
const apiKey = '2bb4d29c3b8f12d9cfe9969397ac0cbd';

// API-nyckel för timezoneDB
const timeZoneApiKey = 'ZGRYZ2CN6KRN';

//Skapar en karta med koordinater[0,0] och zoomnivå 2
const map = L.map('map', { zoomControl: false }).setView([40, 0], 2);

// Lägg till en OpenStreetMap-baslayer till kartan
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
}).addTo(map);

//Olika kartbilder att kunna använda
const CartoDB_Voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 20
});

const Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

const Esri_WorldPhysical = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 8
});

const USGS_USImagery = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 20
});

CartoDB_Voyager.addTo(map);

function refreshData() {

    //Tömmer tidigare data om den existerar
    if (heightInfoEl.innerHTML !== '') {
            heightInfoEl.innerHTML = '';
            timeInfoEl.innerHTML = '';
            weatherInfoEl.innerHTML = '';
    }

    //Tar bort tidigare kartmarkering om den existerar
    if (issMarker) {
        map.removeLayer(issMarker);
    }

    // Funktion för att hämta tidzonen baserat på latitud och longitud från timezoneDB API
    function getTimeZone(latitude, longitude) {
        const timeZoneURL = `http://api.timezonedb.com/v2.1/get-time-zone?key=${timeZoneApiKey}&format=json&by=position&lat=${latitude}&lng=${longitude}`;

        return fetch(timeZoneURL)
            .then(response => {
                if (!response.ok) {
                    throw new error('Network response fungerade ej');
                }
                return response.json();
            })
            .then(timeZoneData => {
                // Extrahera tidzonen från API-svaret
                const localTime = timeZoneData.formatted;
                return localTime;
            });
    }

    // Hämta ISS position från Open Notify API
    fetch(issURL)
        .then(response => {
            if (!response.ok) {
                throw new error('Network response fungerade ej');
            }
            return response.json();
        })
        .then(data => {
            // Extrahera latitud och longitud från API-svaret
            const latitude = data.latitude;
            const longitude = data.longitude;

            // Använd latitud och longitud för att hämta väderdata från OpenWeatherMap API
            return fetch(`${weatherURL}?lat=${latitude}&lon=${longitude}&lang=sv&appid=${apiKey}`);
        })
        .then(response => {
            if (!response.ok) {
                throw new error('Network response fungerade ej');
            }
            return response.json();
        })
        .then(Data => {

            // Extrahera temperatur i Celsius från väderdatan (omvandla från Kelvin)
            const temperatureCelsius = Math.round(Data.main.temp - 273.15);

            // Extrahera vindhastighet från väderdatan
            const windSpeed = Data.wind.speed;

            // Extrahera väderbeskrivning från väderdatan
            const weatherDescription = Data.weather[0].description;

            //Sätter opacity till noll innan animering
            weatherInfoEl.style.opacity = 0;

            //imer för att fördröja intoning
            setTimeout(() => {
                // Uppdatera innerHTML för weatherInfo
                weatherInfoEl.innerHTML = `<p>På kartan ser du vart ISS rymdstation befinner sig just nu.<br>Nedanför stationen har vi detta väder:</p>`;
                weatherInfoEl.innerHTML += `<p>Temperatur: ${temperatureCelsius}°C <br>Vindhastighet: ${windSpeed} m/s <br>Väder: ${weatherDescription}</p>`;
                weatherInfoEl.style.opacity = 1;
            }, 2500);

            // Returnera data för nästa kedja av then()
            return { latitude: Data.coord.lat, longitude: Data.coord.lon };
        })
        .then(coordinates => {
            // Hämtar tidzonen för ISS koordinaterna
            return getTimeZone(coordinates.latitude, coordinates.longitude);
        })
        .then(localTime => {
            //Loggar den lokala tiden och datumet i consolen
            console.log('Lokal tid:', localTime);

            //Sätter opacity till noll innan animering
            timeInfoEl.style.opacity = 0;

            //Timer för att fördröja intoning
            setTimeout(() => {
                // Uppdatera innerHTML för TimeInfo
                timeInfoEl.innerHTML = `<p>Den lokala tiden är ${localTime}.</p>`
                timeInfoEl.style.opacity = 1;
            }, 4000);
        })
        .catch(error => {
            console.error('Problem med fetch anropet:', error);
        });

    // Hämta ISS position från Open Notify API
    fetch(issURL)
        .then(response => {
            if (!response.ok) {
                throw new error('Network response fungerade ej');
            }
            return response.json();
        })
        .then(data => {
            // Extrahera latitud och longitud från API-svaret
            const latitude = data.latitude.toFixed(5);
            const longitude = data.longitude.toFixed(5);
            const altitude = Math.floor(data.altitude);

            // Skapa en markör för ISS position och lägg till den på kartan
            issMarker = L.marker([latitude, longitude]).addTo(map);
            issMarker.bindPopup('Position: ' + latitude + ', ' + longitude + '.').openPopup(); // Lägger till popup med text

            // Flytta kartan till ISS position
            map.setView([latitude, longitude], 2);

            //Sätter opacity till noll innan animering
            heightInfoEl.style.opacity = 0;

            //Timer för att fördröja intoning
            setTimeout(() => {
                // Uppdatera innerHTML för heightInfo
                heightInfoEl.innerHTML = `<p>ISS svävar ${altitude} kilometer över jordens yta.</p>`;
                heightInfoEl.style.opacity = 1;
            }, 1000);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

};
