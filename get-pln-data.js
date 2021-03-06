function GetPLNData() {
    var html = UrlFetchApp.fetch('http://www.publiclibrariesnews.com/feed').getContentText();
    var doc = Xml.parse(html, true);
    var posts = doc.rss.channel.item;

    var ideas = [];
    var localNews = [];
    var internationalNews = [];
    var changes = [];

    for (var i in posts) {
        var description = posts[i].description.getText();
        var title = posts[i].title.getText();
        var date = posts[i].pubDate.getText();
        var encoded = posts[i].encoded.getText().replace(/nbsp/g, '#160');
        var url = posts[i].getText();

        var post = XmlService.parse('<div>' + encoded + '</div>');
        var postHtml = post.getRootElement();
        var elements = postHtml.getChildren();

        var currentSection = '';
        for (var x = 0 ; x < elements.length ; x++) {
            var elt = elements[x].asElement();

            var eltName = '';
            if (elt != null) {
                var eltName = elt.getName();
            }

            if (elt != null && eltName == 'p') {
                var header = elt.getChild('strong');
                if (header != null && header.getText().toLowerCase().indexOf('local') != -1) currentSection = 'local';
                if (header != null && header.getText().toLowerCase().indexOf('ideas') != -1) currentSection = 'ideas';
                if (header != null && header.getText().toLowerCase().indexOf('changes') != -1) currentSection = 'changes';
                if (header != null && header.getText().toLowerCase().indexOf('national') != -1) currentSection = 'national';
                if (header != null && header.getText().toLowerCase().indexOf('international') != -1) currentSection = 'international';
            }

            if (elt != null && currentSection == 'local' && eltName == 'ul') {

                // we have the ul.  go through all the li items.
                var listItems = elt.getChildren('li');

                for (var li in listItems) {
                    var story = listItems[li].asElement();
                    var storyText = story.getValue().replace(/"/g, '&#34;').replace(/'/g, '&#39;').replace(/�/g, '&#34;').replace(/�/g, '&#34;');
                    var storyLocation = storyText.split('�')[0];
                    if (storyText.length > 1050) storyText = storyText.substr(0, 1050) + '&#8230;';
                    var storyHtml = XmlService.getCompactFormat().format(story).replace('<li style="text-align: justify;">', '').replace('</li>', '').replace(/"/g, '&#34;').replace(/'/g, '&#39;').replace(/�/g, '&#34;').replace(/�/g, '&#34;');
                    if (storyHtml.length > 1050) storyHtml = storyHtml.substr(0, 1050) + '&#8230;';

                    localNews.push({ Date: date, PostTitle: title, URL: url, PostDescription: description, Location: storyLocation, Story: storyText, Latitude: '', Longitude: '' });
                }
            }

            if (elt != null && currentSection == 'changes' && eltName == 'ul') {

                // we have the ul.  go through all the li items.
                var listChanges = elt.getChildren('li');

                for (var li in listChanges) {
                    var change = listChanges[li].asElement();
                    var changeText = change.getValue().replace(/"/g, '&#34;').replace(/'/g, '&#39;').replace(/�/g, '&#34;').replace(/�/g, '&#34;');
                    var changeLocation = changeText.split('�')[0].split('-')[0];
                    if (changeText.length > 1050) changeText = changeText.substr(0, 1050) + '&#8230;';
                    var changeHtml = XmlService.getCompactFormat().format(change).replace('<li style="text-align: justify;">', '').replace('</li>', '').replace(/"/g, '&#34;').replace(/'/g, '&#39;').replace(/�/g, '&#34;').replace(/�/g, '&#34;');
                    if (changeHtml.length > 1050) changeHtml = changeHtml.substr(0, 1050) + '&#8230;';

                    changes.push({ Date: date, PostTitle: title, URL: url, PostDescription: description, Location: changeLocation, Change: changeText, Latitude: '', Longitude: '' });
                }
            }
        }
    }

    // loop through each local news result, ensure it doesn't already exist, and add to the table
    for (var n in localNews) {
        var news = localNews[n];

        if (news.Location.length < 30) {
            // write to the google fusion table 1juIutd8McD3OGnWHWVrZbyWPeLim9RZXvHRiKmFe
            var sql = 'SELECT * FROM ' + '1juIutd8McD3OGnWHWVrZbyWPeLim9RZXvHRiKmFe' + " WHERE Story = '" + news.Story + "' LIMIT 10";
            var result = FusionTables.Query.sqlGet(sql, { hdrs: false });

            if (result.rows) {
                // row is already there - do nothing.
            } else {
                // use open street map
                var geoUrl = 'http://nominatim.openstreetmap.org/search?q=' + news.Location.trim() + ',uk&format=json';
                var geocodeData = UrlFetchApp.fetch(geoUrl);
                var geoJson = Utilities.jsonParse(geocodeData.getContentText());

                news.Latitude = geoJson[0].lat;
                news.Longitude = geoJson[0].lon;

                // add the row
                var sql = 'INSERT INTO ' + '1juIutd8McD3OGnWHWVrZbyWPeLim9RZXvHRiKmFe ' + "( Date, Location, Story, Latitude, Longitude, URL ) VALUES ('" + news.Date + "','" + news.Location + "','" + news.Story + "','" + news.Latitude + "','" + news.Longitude + "','" + news.URL + "')";
                FusionTables.Query.sql(sql);
                Utilities.sleep(2100);
            }
        }
    }

    for (var n in changes) {
        var change = changes[n];

        if (change.Location.length < 30) {
            // write to the google fusion table 18RMAdHdkrRwUiUrE7ltKzTdFVjvYQLDGevlczxcm
            var sql = 'SELECT * FROM ' + '18RMAdHdkrRwUiUrE7ltKzTdFVjvYQLDGevlczxcm' + " WHERE Story = '" + change.Change + "' LIMIT 10";
            var result = FusionTables.Query.sqlGet(sql, { hdrs: false });

            if (result.rows) {
                // row is already there - do nothing.
            } else {
                // use open street map
                var geoUrl = 'http://nominatim.openstreetmap.org/search?q=' + change.Location.trim() + ',uk&format=json';
                var geocodeData = UrlFetchApp.fetch(geoUrl);
                var geoJson = Utilities.jsonParse(geocodeData.getContentText());

                if (geoJson && geoJson.length > 0) {
                    change.Latitude = geoJson[0].lat;
                    change.Longitude = geoJson[0].lon;

                    // add the row
                    var sql = 'INSERT INTO ' + '18RMAdHdkrRwUiUrE7ltKzTdFVjvYQLDGevlczxcm ' + "( Date, Location, Story, Latitude, Longitude, URL ) VALUES ('" + change.Date + "','" + change.Location + "','" + change.Change + "','" + change.Latitude + "','" + change.Longitude + "','" + change.URL + "')";
                    FusionTables.Query.sql(sql);
                    Utilities.sleep(2100);
                }
            }
        }
    }
}