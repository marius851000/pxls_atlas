var server = require("./server/main.js")
var config = require("./config.json")

var serv = new server.Server(config);
serv.run();
