$(document).ready(function() {
    console.log("Page Loaded");
    makeMap();
    buildMap();
    // Event Listeners
});

function buildMap() {
    // data
    // set title

    // Stor API endpoint as queryUrl
    var queryUrl = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson`

    // Perform a GET request to query URL
    $.ajax({
        type: "GET",
        url: queryUrl,
        success: function(data) {
            console.log(data);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Status: " + textStatus);
            alert("Error: " + errorThrown);
        }
    });
}

function makeMap(data) {
    $("#mapcontainer").empty();
    $("#mapcontainer").append(`<div id="mapid"></div>`);

    // STEP 1: Create Tile Layers

    var light_mode = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    });

    var dark_mode = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/dark-v10",
        accessToken: API_KEY
    });

    // STEP 2: INIT MAP

    var myMap = L.map("mapid", {
        center: [33.0, -96.0],
        zoom: 4,
        layers: [light_mode, dark_mode]
    });

    // Legend to switch modes
    var baseMaps = {
        "Light Mode": light_mode,
        "Dark Mode": dark_mode
    };

    L.control.layers(baseMaps).addTo(myMap);

};