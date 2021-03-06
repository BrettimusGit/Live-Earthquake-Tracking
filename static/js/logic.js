$(document).ready(function() {
    console.log("Page Loaded");
    buildMap();

    // Event Listeners
    $("#timeframe").change(function() {
        buildMap();
    });
});

function buildMap() {
    // data
    // set title
    var timeframe_text = $("#timeframe option:selected").text();
    $("#maptitle").text(`All Earthquakes Recorded by the USGS for the ${timeframe_text}`);

    // Stor API endpoint as queryUrl
    var timeframe = $("#timeframe").val();

    var queryUrl = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${timeframe}.geojson`

    // Perform a GET request to query URL
    $.ajax({
        type: "GET",
        url: queryUrl,
        success: function(data) {
            // second call
            $.ajax({
                type: "GET",
                url: "static/data/PB2002_boundaries.json",
                success: function(tectonic) {
                    console.log(data);
                    makeMap(data, tectonic);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    alert("Status: " + textStatus);
                    alert("Error: " + errorThrown);
                }
            });
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Status: " + textStatus);
            alert("Error: " + errorThrown);
        }
    });
}

function makeMap(data, tectonic) {
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

    // STEP 3: Create Markers

    var earthquakes = [];
    var circle_list = [];
    data.features.forEach(function(earthquake) {
        var marker = L.geoJSON(earthquake, {
            onEachFeature: onEachFeature
        });
        earthquakes.push(marker);

        var circle = L.geoJSON(earthquake, {
            pointToLayer: function(feature, latlng) {
                var geojsonMarkerOptions = createMarkerOptions(feature);
                return L.circleMarker(latlng, geojsonMarkerOptions);
            },
            onEachFeature: onEachFeature
        });
        circle_list.push(circle);
        // var marker = earthquake.geometry.coordinates;
        // console.log(marker);
    });

    // Tectonic Plates Add
    var tectonic_plates = L.geoJSON(tectonic, {
        color: "orange",
        weight: 3
    });

    var quake_group = L.layerGroup(earthquakes);
    var circle_group = L.layerGroup(circle_list);
    var tectonic_layer = L.layerGroup([tectonic_plates]);



    // STEP 4: Layer Legend
    var baseMaps = {
        "Light Mode": light_mode,
        "Dark Mode": dark_mode
    };

    var overlayMaps = {
        "Markers": quake_group,
        "Circles": circle_group,
        "Tectonic Plates": tectonic_layer
    };

    // Legend for Map
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

    // Pre-selected Layers
    tectonic_plates.addTo(myMap);
    circle_group.addTo(myMap);

    // STEP 5: Create Static Legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");

        var legendInfo = `<h4 style = "margin-bottom:10px"> Earthquake Depth </h4>
        <div>
        <div style = "background:#86F76D;height:10px;width:10px;display:inline-block"> </div> 
        <div style = "display:inline-block"> Less than 10 Miles</div>
        </div> 
        <div>
        <div style = "background:#1B85FF;height:10px;width:10px;display:inline-block"></div> 
        <div style = "display:inline-block">10 - 30 Miles</div>
        </div>
        <div>
        <div style = "background:#F9EE8E;height:10px;width:10px;display:inline-block"></div>
        <div style = "display:inline-block">30 - 50 Miles</div>
        </div>
        <div>
        <div style = "background:#F79865;height:10px;width:10px;display:inline-block"></div> 
        <div style = "display:inline-block">50 - 70 Miles</div>
        </div>
        <div>
        <div style = "background:#F6585E;height:10px;width:10px;display:inline-block"></div>
        <div style = "display:inline-block">70 - 90 Miles</div>
        </div> 
        <div>
        <div style = "background:#FF0127;height:10px;width:10px;display:inline-block"></div>
        <div style = "display:inline-block">Greater than 90 Miles</div>
        </div>`;

        div.innerHTML = legendInfo;
        return (div)
    }

    legend.addTo(myMap);

};

// Pretty Circles

function createMarkerOptions(feature) {
    var depth = feature.geometry.coordinates[2];
    var depthColor = "";
    if (depth > 90) {
        depthColor = "#FF0127";
    } else if (depth > 70) {
        depthColor = "#F6585E";
    } else if (depth > 50) {
        depthColor = "#F79865";
    } else if (depth > 30) {
        depthColor = "#F9EE8E";
    } else if (depth > 10) {
        depthColor = "#1B85FF";
    } else {
        depthColor = "#86F76D";
    }

    // Marker data
    var geojsonMarkerOptions = {
        radius: (feature.properties.mag * 4) + 1,
        fillColor: depthColor,
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    return (geojsonMarkerOptions)
}


// called to create markers 

function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.place) {
        layer.bindPopup(feature.properties.title);
    }
}