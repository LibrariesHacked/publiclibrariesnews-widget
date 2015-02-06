# public libraries news widget

this plugin was created as a project to embed a small map of local library news stories into public libraries news http://www.publiclibrariesnews.com.

based on a tutorial at: http://www.librarieshacked.org/tutorials/publiclibrariesnewsmap

## google script and fusion table

the data is collected from the PLN RSS feed (http://www.publiclibrariesnews.com/feed), but for performance reasons the data is queried, geocoded and cached in a google fusion table.  the processing is performed at timed intervals by a google script.

## supporting technologies

* geocoding using google maps geocoder (from within google script https://developers.google.com/apps-script/)
* leaflet maps engine (http://leafletjs.com)
* cartodb map tiles to provide a retina black and white tile layer. (http://cartodb.com/)
* mapbox leaflet full screen plugin (https://www.mapbox.com/mapbox.js/example/v1.0.0/leaflet-fullscreen/) 

## how to embed

embedding the map onto a site is simple.  the following code:

<div id="plnMap" data-items="100" data-height="250px"></div>
<script src="http://www.librarieshacked.org/publiclibrariesnews-widget.js"></script>

note: to make use of the google fusion table API, a key is required.  these can be generated at https://console.developers.google.com and allow for 25,000 requests per day.

## files

* PublicLibrariesNewsDemo.htm - a demo page mockup of basic PLN layout, with map embedded.
* publiclibrariesnews-widget.js - the script file referenced in the embed code.
* GetPLNData.js - the google script currently being run at timed intervals to update the datasets.