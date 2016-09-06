var express = require('express')
, app = express()
, server = require('http').createServer(app)
, port = process.env.PORT || 3000
, fs = require('fs')
, util = require('util');

var cors = require('cors');
 app.use(cors());

// Creates the website server on the port #
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

// Express Routing
app.use(express.static(__dirname + '/public'));
app.engine('html', require('ejs').renderFile);

// Helper function to format the strings so that they don't include spaces and are all lowercase 
var FormatString = function(string)
{
  var lowercaseString = string.toLowerCase();
  var formattedString = lowercaseString.replace(/\s/g,'');
  return formattedString;
};

// Handles the route for echo apis
app.post('/api/echo', function(req, res){
  console.log("received echo request");
  var requestBody = "";

  // Will accumulate the data
  req.on('data', function(data){
    requestBody+=data;
  });

  // Called when all data has been accumulated
  req.on('end', function(){
    var responseBody = {};
  

    res.statusCode = 200;
    res.contentType('application/json');
    res.send("Response is created");
  });
});