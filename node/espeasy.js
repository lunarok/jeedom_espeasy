var http = require('http');
var request = require('request');

var urlJeedom = process.argv[2],
    debug = process.argv[3] || 0;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function answer(req, res) {
    console.log("We've got a request for " + req.url);
    var uri = parse(req.url).pathname
    url = urlJeedom + "&" + uri + "&" + req.connection.remoteAddress;
    if (debug == 1) {console.log("Calling Jeedom " + url);}
  	request({
  		url: url,
  		method: 'PUT',
  	},
  	function (error, response, body) {
  		if (!error && response.statusCode == 200) {
  			if (debug == 1) {console.log((new Date()) + "Got response Value: " + response.statusCode);}
  		}else{
  			console.log((new Date()) + " - SaveValue Error : "  + error );
  		}
  	});

    // HTTP response header - the content will be HTML MIME type
    res.writeHead(200, {'Content-Type': 'text/html'});

    // Write out the HTTP response body
    res.write('<html><body>' +
    '<h1>Jeedom receive<h1>'+
    '</body></html>');

    // End of HTTP response
    res.end();
}

/************************/
/*  START THE SERVER    */
/************************/

// Create the HTTP server
var server = http.createServer(answer);

// Turn server on - now listening for requests on localIP and port
server.listen(8121);

// print message to terminal that server is running
console.log('Server running');
