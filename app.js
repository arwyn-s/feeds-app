
var bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    expressSanitizer = require('express-sanitizer'),
    mongoose = require('mongoose'),
    express = require('express'),
    app = express();

// Configurations

mongoose.connect('mongodb://localhost:27017/feedsDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

/**
 * Feed Model:
 * Title
 * Image
 * Body
 * Date
 */

var feedSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    date: { type: Date, default: Date.now }
});

var Feed = mongoose.model("Feed", feedSchema);

// RESTFUL ROUTES.

// Feed.create({
//     title: "Football is awesome",
//     image: "https://cdn.pixabay.com/photo/2015/05/15/14/46/soccer-768685_960_720.jpg",
//     body: "After a long a break football is back and its time to celebrate" 
// }, (err, feed) => {
//     if(err) {
//         console.log(err);
//     } else {
//         console.log(feed);
//     }
// })
// Redirect root to blogs

app.get("/", (req, res) => res.redirect("/feeds"));

// ROUTE index
app.get("/feeds", (req, res) => {

    Feed.find({}, function (err, feeds) {
        if (err) {
            console.log("ERROR!");
        } else {
            res.render('index', { feeds: feeds });
        }
    });
});

// NEW ROUTE

app.get("/feeds/new", (req, res) => {
    res.render('new');
});

// CREATE ROUTE

app.post("/feeds", function (req, res) {
    req.body.feed.body = req.sanitize(req.body.feed.body);
    Feed.create(req.body.feed, function (err, feed) {
        if (err) {
            res.render('new');
        } else {
            res.redirect('/feeds');
        }
    })
});

// SHOW ROUTE

app.get("/feeds/:id", function (req, res) {
    Feed.findById(req.params.id, function (err, data) {
        if (err) {
            res.redirect("/feeds");
        } else {
            res.render("show", { feed: data });
        }
    });
});

// EDIT ROUTE.

app.get("/feeds/:id/edit", function (req, res) {
    Feed.findById(req.params.id, function (err, data) {
        if (err) {
            res.redirect("/feeds");
        } else {
            res.render("edit", { feed: data });
        }
    });
});

// UPDATE ROUTE.
// Methods overridden
app.put("/feeds/:id", function(req, res) {
    req.body.feed.body = req.sanitize(req.body.feed.body);
    Feed.findByIdAndUpdate(req.params.id, req.body.feed, function(err, data){
        if(err) {
            res.redirect('/feeds');
        } else {
            res.redirect('/feeds/' + req.params.id);
        }
    });
});

// DELETE ROUTE.
app.delete("/feeds/:id", function(req,res) {
    
    Feed.findByIdAndRemove(req.params.id, function(err, data){
        if(err) {
            res.redirect('/feeds');
        } else {
            res.redirect('/feeds');
        }
    });
});

// Server at 3224
app.listen(3224, () => console.log("listening"));
