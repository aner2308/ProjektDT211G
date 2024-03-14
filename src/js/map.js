"use strict";

const map = L.map('map').setView([0, 0], 2); // Sätter initial position och zoomnivå

// Lägg till en OpenStreetMap-baslayer till kartan
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);