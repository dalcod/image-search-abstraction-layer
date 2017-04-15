var express = require("express");
var bing = require("node-bing-api")({accKey: "6b61248133364cae95330e6bbb463cbb"});
var mongodb = require("mongodb").MongoClient;
var url = process.env.MONGOLAB_URI;
var app = express();
var port = process.env.PORT || 8080;

/*mongodb.connect(url, function(err, db){
    if (err) {
        console.log(err);
        return;
    }
    db.collection("img-entries").remove({});
    db.close();
});*/

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res){
    res.render("index");
});

app.get("/search", function(req, res, next){
    //localhost:8080/search?q=armor&[offset]=10
    var thatRes = res;
    var searchStr = req.query.q;
    var offset = req.query.offset;

    if (!searchStr || !offset) {
        next();
        return;
    }
    if (offset > 50) {
        res.end("The maximum number of images per offset is 50.");
    }

    mongodb.connect(url, function(err, db){
        if (err) {
            console.log(err);
            return;
        }
        var date =  new Date().toString().split(/GMT/);
        db.collection("img-entries").insert({
            "entry": searchStr,
            "when": date[0]
        });
        db.close();
    });

    bing.images(searchStr, {top: offset}, function(error, res, body){
        if (error) {
            next();
            return;
        }
        var arr = [];
        body.value.forEach(function(obj, i){
            arr[i] = {
                "url": obj.contentUrl,
                "name": obj.name,
                "thumbnail": obj.thumbnailUrl,
                "context": obj.hostPageUrl,
            };
        });
        app.locals.contArr = arr;
        thatRes.render("result");
    });
});

app.get("/history", function(req, res, next){
    mongodb.connect(url, function(err, db){
        if (err) {
            console.log(err);
            return;
        }
        db.collection("img-entries").find({}).toArray(function(err, data){
            if (err) {
                console.log(err);
                return;
            }
            app.locals.entries = data;
            res.render("history");
            db.close();
        });
    });
});

app.use(function(req, res){
    res.status(404).render("404");
});

app.listen(port, function(){
    console.log("The app is running")
});