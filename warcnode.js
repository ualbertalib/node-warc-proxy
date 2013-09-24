var http = require('http');
var fs = require('fs');
var csv = require('csv');
var readline = require('readline');
var url = require("url");


var response;
var offset = 2795745;
var length = 1000;
var calclength = 17390;
var mimetype = '';
var usecalclength = true;
var blocks = 0;

var warc;

// load data
// #WARC filename offset warc-type warc-subject-uri warc-record-id content-type content-length

csv()
	.from.path('../warc/drupalib.interoperating.info.warc.csv', { delimiter: ' ', escape: '"' })
	 .to.array( function(data){
	//	  console.log(data)
		  warc = data;
	 } ); 


function readLines(input, func, res) {
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
    	if (usecalclength)
		length = calclength;
		
	console.log("offset: " + offset + " length: " + length + ' calclength: ' + calclength);
	
	res.writeHead(200, {'Content-Type': mimetype});

	var input = fs.createReadStream('../warc/drupalib.interoperating.info.warc', {
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
  	offset = offset + data.length +1;
  	calclength = calclength - data.length - 1;
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
    console.log('Line: (' + data.length + ') ' + data);

  }
}


// create server
http.createServer(function (req, res) {
	response = res;
	
	var pathname = "http://drupalib.interoperating.info" + url.parse(req.url).pathname;
	console.log("Request for: " + pathname);
	// find entry in warc array
   for(var i=0; i<warc.length; i++) {
        if ((warc[i][3] == pathname) && (warc[i][2] == 'response')) {
        	offset = parseInt(warc[i][1]);
        	length = parseInt(warc[i][6]);
        	console.log("Found in warc: " + offset + " " + length);
        	break;
        }
    }

	
	var input = fs.createReadStream('../warc/drupalib.interoperating.info.warc', {
	  'bufferSize': 4 * 1024,
	  'start': offset, 
	  'end': offset + length
	})
	readLines(input, func, res);
	

//	res.end(offset);
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');

	 
