var express = require("express");
var bing = require("node-bing-api")({accKey: "6b61248133364cae95330e6bbb463cbb"});
var url = require("url");
var app = express();
var port = process.env.PORT || 8080;

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
    if(!searchStr || !offset){
        next();
        return;
    }
    if(offset > 50){
        res.end("The maximum number of images per offset is 50.");
    }
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

app.use(function(req, res){
    res.status(404).render("404");
});

app.listen(port, function(){
    console.log("The app is running")
});