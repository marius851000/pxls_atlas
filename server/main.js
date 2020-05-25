var http = require("http");
var url = require("url");
var fs = require("fs");

function HTTPAnswer(res) {
	this.res = res;
	this.code = 200;
	this.type = "text/html";
	this.content = undefined;
};

HTTPAnswer.prototype.send = function() {
	if (this.content === undefined) {
		this.send_error("ERROR: content not set for a user on page : "+this.res.url+".", "the content of the page wasn't generated.");
	};
	this.res.writeHead(this.code, {"Content-Type": this.type});
  this.res.write(this.content);
  this.res.end();
}

HTTPAnswer.prototype.send_error = function(internal, external) {
	//TODO: real logging
	console.log(internal);
	this.code = 500;
	this.content = "<p>an internal error occured: "+external+".</p>";
}

function Server(config) {
	this.config = config;
	this.port = this.config.port;
};

Server.prototype.run = function() {
	var config = this.config;
	http.createServer(function (req, res) {
		const parsed_url = url.parse(req.url, true);
		var parsed_path = parsed_url.pathname.split("/");
		parsed_path.shift();

		let answer = new HTTPAnswer(res);
		let page_found = false;
		if (parsed_path[0] === "img") {
			if (parsed_path[1] === "canvas") {
				let splited_picture_path = parsed_path[2].split(".");
				if (splited_picture_path.length == 2) {
					let canvas_id = splited_picture_path[0];
					if (config.canvas[canvas_id] != undefined) {
						page_found = true;
						fs.readFile(config.base_folder+"data/"+canvas_id+"/image.png", function(err, data) {
							if (err) {answer.send_error(err, "an error occured while opening the file")};
							answer.type = "image/png";
							answer.content = data;
							answer.send();
						});
					};
				};
			};
		} else if (parsed_path[0] === "canvas") {
			if (parsed_path[1] != undefined) {
				var canvas_id = parsed_path[1];
				if (config.canvas[canvas_id] != undefined) {
					page_found = true;
					var canvas_config = config.canvas[canvas_id];
					fs.readFile(config.base_folder+"html/canvas.html", "utf-8", function(err, data) {
						if (err) {answer.send_error(err, "an error occured while trying to open the html file")};
						answer.content = data
							.split("{CANVAS_NAME}").join(canvas_id)
							.split("{CANVAS_WIDTH}").join(canvas_config["w"])
							.split("{CANVAS_HEIGHT}").join(canvas_config["h"]);
						answer.send();
					})
				};
			};
		} else if (parsed_path[0] === "css") {
			if (parsed_path[1] === "style.css") {
				page_found = true;
				fs.readFile(config.base_folder+"css/style.css", function(err, data) {
					if (err) {answer.send_error(err, "can't open the style.css file")};
					answer.type = "text/css";
					answer.content = data;
					answer.send();
				})
			}
		} else if (parsed_path[0] === "js") {
			if (parsed_path[1] === "c") {
				var canvas_id = parsed_path[2];
				if (config.canvas[canvas_id] != undefined) {

					var canvas_config = config.canvas[canvas_id];
					function replace_width_height(data) {
						return data.split("{CANVAS_WIDTH}").join(canvas_config["w"])
						.split("{CANVAS_HEIGHT}").join(canvas_config["h"]);
					};

					if (parsed_path[3] === "main.js") {
						page_found = true;
						fs.readFile(config.base_folder+"js/main.js", "utf-8", function(err, data) {
							if (err) { answer.send_error(err, "can't open the main.js file") };
							answer.type = "text/js";
							answer.content = replace_width_height(data);
							answer.send();
						});

					} else if (parsed_path[3] === "atlas.js") {
						page_found = true;
						fs.readFile(config.base_folder+"js/atlas.js", "utf-8", function(err, data) {
							if (err) { answer.send_error(err, "can't open the atlas.js file")};
							fs.readFile(config.base_folder+"data/"+canvas_id+"/info.json", "utf-8", function(err, atlas) {
								if (err) { answer.send_error(err, "can't open the "+canvas_id+" info file")};
								answer.type = "text/js";
								answer.content = data
									.replace("{ATLAS}", atlas);
								answer.send();
							})
						});

					} else if (parsed_path[3] === "view.js") {
						page_found = true;
						fs.readFile(config.base_folder+"js/view.js", "utf-8", function(err, data) {
							if (err) { answer.send_error(err, "can't open the view.js file")};
							answer.type = "text/js";
							answer.content = replace_width_height(data);
							answer.send();
						});

					} else if (parsed_path[3] === "draw.js") {
						page_found = true;
						fs.readFile(config.base_folder+"js/draw.js", "utf-8", function(err, data) {
							if (err) { answer.send_error(err, "can't opent the draw.js file")};
							answer.type = "text/js";
							answer.content = replace_width_height(data);
							answer.send();
						});

					} else if (parsed_path[3] === "overlap.js") {
						page_found = true;
						fs.readFile(config.base_folder+"js/draw.js", "utf-8", function(err, data) {
							if (err) { answer.send_error(err, "can't opent the draw.js file")};
							answer.type = "text/js";
							answer.content = data;
							answer.send();
						});
					}
				}

			} else if (parsed_path[1] === "pointInPolygon.js") {
				page_found = true;
				fs.readFile(config.base_folder+"js/pointInPolygon.js", function(err, data) {
					if (err) { answer.send_error(err, "can't open the pointInPolygon.js file")};
					answer.type = "text/js";
					answer.content = data;
					answer.send();
				})
			}

		} else if (parsed_path[0] === "") {
			page_found = true;
			//TODO
			answer.content = "<p>this is an unfinished page</p>";
			answer.content += "<ul>"
			for (canvas_id in config.canvas) {
				answer.content += "<li><a href=\"./canvas/"+canvas_id+"\">canvas "+canvas_id+"</a></li>";
			};
			answer.content += "</ul>"
			answer.send();
		}
		if (page_found === false) {
			console.log(parsed_path);
			answer.content = "<p>page not found</p>";
			answer.code = 404;
			answer.send();
		}
	}).listen(this.port);
};

exports.Server = Server;
