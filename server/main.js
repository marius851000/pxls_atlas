var http = require("http");
var url = require("url");
var fs = require("fs");

const express = require("express");


function send_error(req, res, server_side_message, client_side_message) {
	res.set("Content-Type", "text/html");
	res.send("<p>an internal error occured: "+client_side_message+". Additional info has been logged on the server.");
};

function Server(config) {
	this.config = config;
	this.port = this.config.port;
};

Server.prototype.run = function() {
	var config = this.config;
	console.log("launching server on port "+config.port+".");
	const app = express()

	app.get("/js/c/:canvas_id/atlas.js", function(req, res) {
		var canvas_id = req.params["canvas_id"];
		var canvas_config = config["canvas"][canvas_id];
		if (canvas_config != undefined) {
			fs.readFile(config.base_folder+"js/atlas.js", "utf-8", function(err, data) {
				if (err) {
					answer.send_error(req, res, err, "can't open the atlas.js file")
				} else {
					fs.readFile(config.base_folder+"data/"+canvas_id+"/info.json", "utf-8", function(err, atlas) {
						if (err) {
							send_error(req, res, err, "can't open the "+canvas_id+" info file")
						} else {
							res.set("Content-Type", "text/js");
							res.send(data
								.replace("{ATLAS}", atlas)
							);
						};
					});
				};
			});
		} else {
			res.send("the canvas doesn't exist");
		}
	});
	app.get("/", function(req, res) {
		res.set("Content-Type", "text/html");
		var page_content = "";
		page_content = "<p>this is an unfinished page</p>";
		page_content += "<ul>"
		for (canvas_id in config.canvas) {
			page_content += "<li><a href=\"./canvas/"+canvas_id+"\">canvas "+canvas_id+"</a></li>";
		};
		page_content += "</ul>"
		res.send(page_content);
	});


	app.get("/canvas/:canvas_id", function(req, res) {
		res.set("Content-Type", "text/html");
		var canvas_id = req.params["canvas_id"];
		var canvas_config = config.canvas[canvas_id];
		if (canvas_config != undefined) {
			fs.readFile(config.base_folder+"html/canvas.html", "utf-8", function(err, data) {
				if (err) {
					send_error(req, res, err, "an error occured while trying to open the html file")
				} else {
					var content = data
						.split("{CANVAS_NAME}").join(canvas_id)
						.split("{CANVAS_WIDTH}").join(canvas_config["w"])
						.split("{CANVAS_HEIGHT}").join(canvas_config["h"]);
					res.send(content);

				};
			})
		} else {
			res.send("no coresponding canvas found");
		};
	});

	app.use("/data", express.static("data"));
	app.use('/js', express.static('js'));
	app.use('/css', express.static('css'));

	app.listen(this.port, () => console.log("server started on port "+this.port+"."))
};

exports.Server = Server;
