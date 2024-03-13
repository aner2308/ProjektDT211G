"use strict";

let searchBtnEl = document.getElementById("searchBtn");
searchBtnEl.addEventListener('click', searchWeather);   //Kör funktionen searchWeather vid klick på sökknappen

//Funktion för att ta innehållet i sökrutan och logga det i consolen
function searchWeather() {
    let cityEl = document.getElementById('searchInput').value; // Hämta värdet från sökrutan
    if (cityEl.trim() !== '') { // Kontrollera om sökrutan inte är tom
        console.log("Stad:", cityEl);
        // Nu kan du använda värdet av 'cityEl' för att göra din API-förfrågan eller utföra andra åtgärder
    } else {
        console.log('Textrutan är tom');
    }
}

