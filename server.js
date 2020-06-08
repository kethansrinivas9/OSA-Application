var fs = require("fs");
var port = 3000;
var express = require("express");

var app = express();

//use static files in Client folder
app.use(express.static(__dirname + "/Client"));
// use static files in the Root folder
app.use(express.static(__dirname));

app.listen(port);
