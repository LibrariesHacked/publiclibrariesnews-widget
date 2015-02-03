# public libraries news widget

this plugin was created as a project to embed a small map of local library news stories into public libraries news http://www.publiclibrariesnews.com.

based on a tutorial at: http://www.librarieshacked.org/tutorials/publiclibrariesnewsmap

## google script and fusion table

the data is collected from the PLN RSS feed (http://www.publiclibrariesnews.com/feed), but for performance reasons the data is queried, geocoded and cached in a google fusion table.  the processing is performed at timed intervals by a google script.

## supporting technologies

* geocoding using google maps geocoder (from within google script)
* leaflet maps engine
* cartodb map tiles to provide a retina black and white tile layer.
* leaflet full screen plugin

## how to embed

embedding the map onto a site is simple.  the following code:

note: to make use of the google fusion table API, a key is required.  these can be generated at http://... and allow for 25,000 requests per day.

## files

* PublicLibrariesNewsDemo.htm - a demo page mockup of basic PLN layout, with map embedded.
* publiclibrariesnews-widget.js - the script file referenced in the embed code.
* GetPLNData.gs - the google script currently being run every hour.
* http:// - the google fusion table showing existing library news stories