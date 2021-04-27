$(document).ready(function() {
    console.log("Page Loaded");
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
    $("mapcontainer").empty();

}