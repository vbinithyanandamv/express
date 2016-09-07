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
    console.log(requestBody);
    console.log(JSON.stringify(requestBody));

    // parsing the requestBody for information
    var jsonData = JSON.parse(requestBody);
    if(jsonData.request.type == "LaunchRequest")
    {
      // crafting a response
      responseBody = {
        "version": "0.1",
        "response": {
          "outputSpeech": {
            "type": "PlainText",
            "text": "Welcome to Visualbi Alexa APP"
          },
          "reprompt": {
            "outputSpeech": {
              "type": "PlainText",
              "text": "Say a command"
            }
          },
          "shouldEndSession": false
        }
      };
    }
    else if(jsonData.request.type == "IntentRequest")
    {
      var outputSpeechText = "";
      var cardContent = "";
      if (jsonData.request.intent.name == "open")
      {
        // The Intent "TurnOn" was successfully called
        outputSpeechText = "Welcome Jon,you are looking at the <Sales Dashboard> from August 01, 2016.";
        cardContent = "Welcome Jon,you are looking at the <Sales Dashboard> from August 01, 2016.";
      }
      else if (jsonData.request.intent.name == "ExplainDashboard")
      {
        // The Intent "TurnOff" was successfully called
        outputSpeechText =  "This dashboard shows Revenue and Profit by Product and Margin by Region.";
        cardContent =  "This dashboard shows Revenue and Profit by Product and Margin by Region.";
      }
      else if (jsonData.request.intent.name == "Whatdowesee")
      {
        // The Intent "TurnOff" was successfully called
        outputSpeechText =  "Product A has the highest Revenue and Product B has the lowest Revenue. Region A has the highest profit and Region B has the lowest Profit.";
        cardContent =  "Product A has the highest Revenue and Product B has the lowest Revenue. Region A has the highest profit and Region B has the lowest Profit.";
      }
      else if (jsonData.request.intent.name == "thankyou")
      {
        // The Intent "TurnOff" was successfully called
        outputSpeechText =  "Thank you for visiting us!! Don't forgot to look onto our VBX extensions";
        cardContent =  "Thank you for visiting us!! Don't forgot to look onto our VBX extensions";
      }else{
        outputSpeechText = "Sorry! I could not understand you properly! can you try again with proper command";
        cardContent = "Sorry! I could not understand you properly! can you try again with proper command";
      }
      responseBody = {
          "version": "0.1",
          "response": {
            "outputSpeech": {
              "type": "PlainText",
              "text": outputSpeechText
            },
            "card": {
              "type": "Simple",
              "title": "Open Smart Hub",
              "content": cardContent
            },
            "shouldEndSession": false
          }
        };
    }else{
      // Not a recognized type
      responseBody = {
        "version": "0.1",
        "response": {
          "outputSpeech": {
            "type": "PlainText",
            "text": "Could not parse data"
          },
          "card": {
            "type": "Simple",
            "title": "Error Parsing",
            "content": JSON.stringify(requestBody)
          },
          "reprompt": {
            "outputSpeech": {
              "type": "PlainText",
              "text": "Say a command"
            }
          },
          "shouldEndSession": false
        }
      };
    }

    res.statusCode = 200;
    res.contentType('application/json');
    res.send(responseBody);
  });
});
