var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");
var PORT = 3000;
var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/nhlArticles";
// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);


app.get("/scrape", function(req, res) {
  axios.get("http://www.nhl.com/flyers").then(function(response) {
    var $ = cheerio.load(response.data);

    $(".mixed-feed__item-header-text").each(function(i, element) {
      var result = {};

      result.title = $(this)
        .children(a).children(h4)
        .text();
      result.link = $(this)
        .children(a)
        .attr("href");
      result.preview = $(this)
        .children(a).children(h5)
        .text();

      db.Articles.create(result)
        .then(function(dbArticles) {
          console.log(dbArticles);
        })
        // .catch(function(err) {
        //   return res.send(err);
        // });
    });
    res.send("Scrape Complete");
  });
});

app.get("/articles", function(req, res) {
  db.Articles.find({}).then(function(dbArticles){
    res.json(dbArticles);
  })
  // .catch(function(err){
  //   res.send(err);
  // })
  
});

app.get("/articles/:id", function(req, res) {
  db.Articles.findOne({_id: req.params.id}).populate("Comment")
  .then(function(dbArticles) {
    res.json(dbArticles);
  })
  // .catch(function(err) {
  //   res.json(err);
  // });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // TODO
  // ====
  db.Comment.create(req.body).then(function(dbComment){
    return db.Articles.findOneAndUpdate({_id: req.params.id}, {$set: {comment: dbComment._id}}, {new: true})
  }).then(function(updatedArticles){
    res.json(updatedArticles)
  })
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
