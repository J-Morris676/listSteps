//Should be run locally for system related features

var http = require("http");
var fs = require("fs");
var path = require("path");

var glob = require("glob");
var async = require("async");
var open = require('open');
var express = require('express');
var bodyParser = require('body-parser');

var stepsPattern = "w:/work/wexford/Acceptance-Tests/features/**/*.ts";

glob(stepsPattern, function (er, files) {	
	var steps = [];
	
	async.each(files, (file, callback) => {
		fs.readFile(file, (err, fileContents) => {
			if (err) callback(err);
			fileContents = fileContents.toString();
			
			extractSteps(file, fileContents, (matches) => {
				steps = steps.concat(matches);	
				callback();
			});
		})		
	}, (err) => {
		if (err) return console.log(err);
		
		createServer(steps);
		open('http://localhost:1234');
	})
});

function extractSteps(filePath, script, callback) {
	var regex = /\/\^.*\$\//g;
	var matches = [];
	var match;
	
	async.whilst(
		() => { return match !== null },
		(done) => {
			match = regex.exec(script);
			if (!match) return done();
			
			var fileName = path.basename(filePath);
			var lineNo = findLineNumberFromIndex(script, match.index);
			
			matches.push({lineNo: lineNo, filePath: filePath, fileName: fileName, index: match.index, match: match[0]});
			done();
		}, (err) => {
			callback(matches);
	});
}

function createServer(steps) {
	var publicDir = path.join(__dirname, "public");
	var app = express();
	
	app.use(express.static('public'));
	app.use( bodyParser.json() );
	
	app.get('/api/steps', function (req, res) {
	  res.send(steps);
	});
	
	app.post('/api/openFile', function(req, res) {
		if (req.body.filePath !== undefined) {
			console.log("Opening: " + req.body.filePath);
			open(req.body.filePath);
		}
		res.end();
	});
	
	app.listen(1234, function () {
	  console.log('app listening on port 1324!');
	});
}

function findLineNumberFromIndex(text, index) {
	var newLineIndex = -1;
	var count = 0;
	
	while(newLineIndex === -1 || newLineIndex < index) {
		newLineIndex = text.indexOf("\n", newLineIndex+1);
		count++;
	}
	
	return count;
}