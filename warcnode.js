var http = require('http');
var fs = require('fs');
var csv = require('csv');
var url = require("url");
var stdio = require('stdio');

var ops = stdio.getopt({
    'warc': {args: 1, mandatory: true, description: "Path to WARC"}
});

var warcpath = ops.warc + "";
var warccvs = warcpath + ".csv";
var warc;
// load data
// #WARC filename offset warc-type warc-subject-uri warc-record-id content-type content-length

csv()
	.from.path(warccvs, { delimiter: ' ', escape: '"' })
	 .to.array( function(data){
	//	  console.log(data)
		  warc = data;
	 } ); 


// create server
http.createServer(function (req, res) {

var offset = 0;
var length = 0;
var headerlength = 0;
var mimetype = '';
var usecalclength = true;
var blocks = 0;

function extractFile(input, func, res) {
  var remaining = '';

  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      func(line);
      index = remaining.indexOf('\n');
    }
  });

  input.on('end', function() {
    if (remaining.length > 0) {
      func(remaining);
    }
	offset = offset + headerlength;
    if (usecalclength) {
		length = length - headerlength;
	}
	
	console.log("offset: " + offset + " length: " + length + ' headerlength: ' + headerlength);
	
	res.writeHead(200, {'Content-Type': mimetype, 'Content-Length': length});

	fs.createReadStream(warcpath, {
	  'bufferSize': 4 * 1024,
	  'start': offset +2, 
	  'end': length + offset + 2
	}).pipe(res);
    
  });
}

function func(data) {
  if (data.length == 1){
  	blocks = blocks+1;
  	console.log('End of headers ' + blocks);
  }
  if (blocks < 2) {
  	headerlength = headerlength + data.length +1;
	if (blocks == 1) {
  		// we're in the response header, so look for length and type
  		if (data.indexOf('Content-Length:') == 0) {
  			length = parseInt(data.substring(16));
  			usecalclength = false;
  			console.log("Found Content-Length: " + length);
  			}
  		else if (data.indexOf('Content-Type:') == 0) {
  			mimetype = data.substring(13);
  			console.log ("Found mimetype: " + mimetype);
  		}

  	}
   // console.log('Line: (' + data.length + ') ' + data);

  }
}




	var pathname = "http://drupalib.interoperating.info" + url.parse(req.url).pathname;
	if (url.parse(req.url).query != null)
		pathname += '?' + url.parse(req.url).query;
	console.log("Request for: " + pathname);
	
	var pathroot = "http://drupalib.interoperating.info".length;
	
	// serve list of WARC contents from /WARC/
	if (pathname == "http://drupalib.interoperating.info/WARC/") {
		res.writeHead(200, {"Content-Type": "text/html"});
		res.write("<html><head><title>WARC Contents</title></head><body><h1>WARC Contents</h1>");
		res.write("<table><tr><td>Offset</td><td>Path</td></tr>");
		   for(var i=0; i<warc.length; i++) {
			  if (warc[i][2] == 'response') {
			  	res.write("<tr><td>" + warc[i][1] + "</td>"
			  	+ "<td><a href='" + warc[i][3].substring(pathroot) + "'>" + warc[i][3] + "</a></td></tr>");
      		}
      	}
      	res.end();
	}
	// otherwise treat path as entry in WARC
	else {
	// find entry in warc array
   for(var i=0; i<warc.length; i++) {
        if ((warc[i][3] == pathname) && (warc[i][2] == 'response')) {
        	offset = parseInt(warc[i][1]);
        	length = parseInt(warc[i][6]);
        	console.log("Found in warc: " + offset + " " + length);
        	break;
        }
    }

	// if no record found, send 404
	if (offset == 0) {
		// not found in warc
    	res.writeHead(404, {"Content-Type": "text/plain"});
	    res.write("404 Not found in WARC");
    	res.end();
	}
	// otherwise fetch the record
	else {
	// fetch the first 1000 characters of the warc record
	var input = fs.createReadStream(warcpath, {
	  'bufferSize': 4 * 1024,
	  'start': offset, 
	  'end': 1000 + offset
	})
	// parse out the headers and send response
	extractFile(input, func, res);
	}
	}
//	res.end(offset);
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');

	 
