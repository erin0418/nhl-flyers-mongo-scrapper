var cheerio = require("cheerio");
var request = require("request");

var results = [];

request("https://www.nhl.com/flyers", function(error, response, html) {

  // Load the body of the HTML into cheerio
  var $ = cheerio.load(html);

  // With cheerio, find each h4-tag with the class "headline-link" and loop through the results
  $("h4.headline-link").each(function(i, element) {

    // Save the text of the h4-tag as "title"
    var title = $(element).text();

    // Find the h4 tag's parent a-tag, and save it's href value as "link"
    var link = $(element).parent().attr("href");

    // Make an object with data we scraped for this h4 and push it to the results array
    results.push({
      title: title,
      link: link
    });
  });

//   // After looping through each h4.headline-link, log the results
//   console.log(results);
});

module.exports = results;