"use strict";

const BtnEl = document.getElementById("Btn");
BtnEl.addEventListener('click', updateAll);   //Kör funktion för att uppdatera all data


// URL för att hämta ISS position från OpenNotify API
const issURL = 'http://api.open-notify.org/iss-now.json';

// URL för att hämta väderdata från OpenWeatherMap API
const weatherURL = 'https://api.openweathermap.org/data/2.5/weather';

// API-nyckel för OpenWeatherMap
const apiKey = '2bb4d29c3b8f12d9cfe9969397ac0cbd';

// API-nyckel för timezoneDB
const timeZoneApiKey = 'ZGRYZ2CN6KRN';

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
        const { latitude, longitude } = data.iss_position;

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
        // Hantera väderdatan från OpenWeatherMap API
        console.log('Väderdata:', Data);

        // Extrahera temperatur i Celsius från väderdatan (omvandla från Kelvin)
        const temperatureCelsius = Math.round(Data.main.temp - 273.15);

        // Extrahera vindhastighet från väderdatan
        const windSpeed = Data.wind.speed;

        // Extrahera väderbeskrivning från väderdatan
        const weatherDescription = Data.weather[0].description;

        // Skapa en textsträng med temperatur, vindhastighet och väderbeskrivning
        const weatherText = `Temperatur: ${temperatureCelsius}°C, Vindhastighet: ${windSpeed} m/s, Väder: ${weatherDescription}`;

        console.log(weatherText);

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

    })
    .catch(error => {
        console.error('Problem med fetch anropet:', error);
    });


const map = L.map('map').setView([0, 0], 2); // Sätter initial position och zoomnivå

// Lägg till en OpenStreetMap-baslayer till kartan
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

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
        const { latitude, longitude } = data.iss_position;

        // Skapa en markör för ISS position och lägg till den på kartan
        const issMarker = L.marker([latitude, longitude]).addTo(map);
        issMarker.bindPopup('ISS Position. '+latitude+', '+longitude).openPopup(); // Lägger till popup med text

        // Flytta kartan till ISS position
        map.setView([latitude, longitude], 2);
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
    