var map, changesMarkers = [], newsMarkers = [], overlays = {};
var changesTable = '18RMAdHdkrRwUiUrE7ltKzTdFVjvYQLDGevlczxcm';
var newsTable = '1juIutd8McD3OGnWHWVrZbyWPeLim9RZXvHRiKmFe';

jQuery(function () {
    // 3 required css files: standard leaflet, fullscreen plugin, and marker cluster style.
    
    // Leaflet CSS
    jQuery('head').append('<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.css" />');
    
    // Leaflet fullscreen CSS
    jQuery('head').append('<link rel="stylesheet" href="https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-fullscreen/v0.0.4/leaflet.fullscreen.css" />');
    
    // 
    jQuery('head').append('<link rel="stylesheet" href="https://cdn.rawgit.com/Leaflet/Leaflet.markercluster/master/dist/MarkerCluster.Default.css" />');
    
    
    jQuery('head').append('<style>.leaflet-popup-content-wrapper { border-radius: 0px !important; } .leaflet-popup-content { margin-top: 5px !important; margin-bottom: 5px !important; margin-left: 5px !important; margin-right: 5px !important; } </style>');

    // width is fixed to be 100% of the available container.
    jQuery('#plnMap').css('width', '100%');

    // get variables from the map div element.
    var numberItems = jQuery('#plnMap').data('items');

    if (!numberItems) numberItems = '200';
    var height = jQuery('#plnMap').data('height');

    // default the height to 250px, if set then use user value.
    jQuery('#plnMap').css('height', '250px');
    if (height) jQuery('#plnMap').css('height', height);

    // get two supporting scripts.
    // currently gets them synchronously - may do both asynchronously later.
    jQuery.getScript("http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js", function () {
        jQuery.getScript("https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-fullscreen/v0.0.4/Leaflet.fullscreen.min.js", function () {
            GetLayer(changesTable, numberItems);
            GetLayer(newsTable, numberItems);
        });
    });
});

function GetLayer(table, rows) {

    // query to select rows from the fusion table - limited by either 200 (default), or the limit parameter
    var fusionQuery = "SELECT Date, Location, Story, Latitude, Longitude, URL FROM " + table + " ORDER BY Date DESC LIMIT " + rows;
    var fusionUrl = 'https://www.googleapis.com/fusiontables/v2/query?sql=' + fusionQuery + '&key=AIzaSyCtJBC5LYkc3E1wcS8hgyVWIWxDeiwolAc';

    // will end up grouping data into an object indexed by location.
    var locations = {};

    jQuery.getJSON(fusionUrl, function (data) {

        if (data && data.rows && data.rows.length > 0) {

            jQuery.each(data.rows, function () {
                if (locations[this[1].trim()] && locations[this[1].trim()].text) {
                    locations[this[1].trim()].text = locations[this[1].trim()].text + '<h4>' + this[1] + '</h4><small><a href="' + this[5] + '" target="_blank">' + this[0].replace(' +0000', '') + '</a></small><br/>' + this[2] + '<br/><br/><hr>';
                    locations[this[1].trim()].number = locations[this[1].trim()].number + 1;
                }
                else {
                    locations[this[1].trim()] = { text: '<h4>' + this[1] + '</h4><small><a href="' + this[5] + '" target="_blank">' + this[0].replace(' +0000', '') + '</a></small><br/>' + this[2] + '<br/><br/><hr>', number: 1, latitude: this[3], longitude: this[4] };
                }
            });

            jQuery.each(locations, function (key, value) {
                if (value.latitude && value.latitude != "" && value.longitude && value.longitude != "") {
                    var size = "small";

                    if (value.number >= 5) size = "medium";
                    if (value.number >= 10) size = "large";

                    var newsIcon = L.divIcon({ html: '<div><span>' + value.number + '</span></div>', className: "marker-cluster marker-cluster-" + size, iconSize: new L.Point(40, 40) });

                    var popup = L.popup({
                        maxWidth: 160,
                        maxHeight: 140,
                        closeButton: false,
                        className: 'plnPopup'
                    }).setContent(value.text);

                    if (table == newsTable) newsMarkers.push(L.marker([value.latitude, value.longitude], { icon: newsIcon }).bindPopup(popup));
                    if (table == changesTable) changesMarkers.push(L.marker([value.latitude, value.longitude], { icon: newsIcon }).bindPopup(popup));
                }
            });
            
            if (table == newsTable) overlays['News'] = L.layerGroup(newsMarkers);
            if (table == changesTable) overlays['Changes'] = L.layerGroup(changesMarkers);
            
            // add the layer control if both are loaded
            if (overlays['Changes'] && overlays['News']) {
                var latlng = L.latLng(53.5, -2.6);
                map = L.map('plnMap', { zoomControl: false, center: latlng, zoom: 6, fullscreenControl: true, layers: [overlays['News']] });

                L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}' + (L.Browser.retina ? '@2x' : '') + '.png', {
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OSM</a> contributors, <a href="http://cartodb.com/attributions">CartoDB</a>'
                }).addTo(map);

                L.control.layers(null, overlays).addTo(map);

                // change the overlays to act like radio buttons
                map.on('overlayadd', function (e) {
                    if (e.name == 'News') jQuery('#plnMap .leaflet-control-layers-overlays span:contains("Changes")').click();
                    if (e.name == 'Changes') jQuery('#plnMap .leaflet-control-layers-overlays span:contains("News")').click();
                });
                map.on('overlayremove', function (e) {
                    if (e.name == 'News') jQuery('#plnMap .leaflet-control-layers-overlays span:contains("Changes")').click();
                    if (e.name == 'Changes') jQuery('#plnMap .leaflet-control-layers-overlays span:contains("News")').click();
                });
            }
        }
    });
}