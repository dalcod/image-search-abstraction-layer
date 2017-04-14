var express = require("express");
var app = express();
var port = process.env.PORT || 8080;

var obj = {};
app.locals.obj = obj;

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res){
    res.render("index");
});

app.get("/", function(req, res, next){
   
});

app.use(function(req, res){
    res.status(404).render("404");
});

app.listen(port, function(){
    console.log("The app is running")
});