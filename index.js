var express = require('express')
, app = express()
, server = require('http').createServer(app)
, port = process.env.PORT || 3000
, fs = require('fs')
, util = require('util');
var io = require('socket.io')(server);
var cors = require('cors');
app.use(cors());

//DYNAMIC VARIABLES FROM THE DASHBOARD
var stopRequest=false;
var dashboardname={username:"jon",name:"Sales Dashboard",lastime:"August 01, 2016"};

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

    //intent.slots.Answer
    else if(jsonData.request.type == "IntentRequest")
    {
      var outputSpeechText = "";
      var cardContent = "";
      if (jsonData.request.intent.name == "open")
      {
        // The Intent "TurnOn" was successfully called
        outputSpeechText = "Welcome "+dashboardname.username+",you are looking at the "+dashboardname.name+" from "+dashboardname.lasttime;
        cardContent = "Welcome "+dashboardname.username+",you are looking at the "+dashboardname.name+" from "+dashboardname.lasttime;
		     io.emit('open', outputSpeechText);
      }
      else if(jsonData.request.intent.name == "Filter"){
        if(jsonData.request.intent.slots.Dimension="country" && jsonData.request.intent.slots.Value=="IND"){
          outputSpeechText = "Displaying the"+jsonData.request.intent.slots.Dimension+" for "+jsonData.request.intent.slots.Value;
          cardContent = "Displaying the"+jsonData.request.intent.slots.Dimension+" for "+jsonData.request.intent.slots.Value;
        }else if(jsonData.request.intent.slots.Dimension="product" && jsonData.request.intent.slots.Value=="AUS"){
          outputSpeechText = "Displaying the"+jsonData.request.intent.slots.Dimension+" for "+jsonData.request.intent.slots.Value;
          cardContent = "Displaying the"+jsonData.request.intent.slots.Dimension+" for "+jsonData.request.intent.slots.Value;
        }
        io.emit('filter',jsonData.request.intent.slots.Dimension+':'+jsonData.request.intent.slots.Value);
      }
      else if(jsonData.request.intent.name == "Measure"){
          if(jsonData.request.intent.slots.Measurelist=="sales"){
            outputSpeechText = "Displaying the filtered result of Sales";
            cardContent = "Displaying the filtered result of Sales";
          }
          else if(jsonData.request.intent.slots.Measurelist=="revenue"){
            outputSpeechText = "Displaying the filtered result of Revenue";
            cardContent = "Displaying the filtered result of Revenue";
          }
          io.emit('measure',jsonData.request.intent.slots.Measurelist);
      }
      else if (jsonData.request.intent.name == "ExplainDashboard")
      {
        // The Intent "TurnOff" was successfully called
        outputSpeechText =  "This dashboard shows Revenue and Profit by Product and Margin by Region.";
        cardContent =  "This dashboard shows Revenue and Profit by Product and Margin by Region.";
		    io.emit('ExplainDashboard', outputSpeechText);
      }
      else if (jsonData.request.intent.name == "ExplainDashboard")
      {
        // The Intent "TurnOff" was successfully called
        outputSpeechText =  "This dashboard shows Revenue and Profit by Product and Margin by Region.";
        cardContent =  "This dashboard shows Revenue and Profit by Product and Margin by Region.";
		    io.emit('ExplainDashboard', outputSpeechText);
      }
      else if (jsonData.request.intent.name == "ExplainDashboard")
      {
        // The Intent "TurnOff" was successfully called
        outputSpeechText =  "This dashboard shows Revenue and Profit by Product and Margin by Region.";
        cardContent =  "This dashboard shows Revenue and Profit by Product and Margin by Region.";
		    io.emit('ExplainDashboard', outputSpeechText);
      }
      else if (jsonData.request.intent.name == "Whatdowesee")
      {
        // The Intent "TurnOff" was successfully called
        outputSpeechText =  "Product A has the highest Revenue and Product B has the lowest Revenue. Region A has the highest profit and Region B has the lowest Profit.";
        cardContent =  "Product A has the highest Revenue and Product B has the lowest Revenue. Region A has the highest profit and Region B has the lowest Profit.";
		    io.emit('Whatdowesee', outputSpeechText);
      }
      else if (jsonData.request.intent.name == "thankyou")
      {
        // The Intent "TurnOff" was successfully called
        outputSpeechText =  "Thank you for visiting us!! Don't forget to look onto our VBX extensions";
        cardContent =  "Thank you for visiting us!! Don't forget to look onto our VBX extensions";
      }else if (jsonData.request.intent.name="AMAZON.StopIntent") {
        handlestopRequest();
      } else if(jsonData.request.intent.name="AMAZON.CancelIntent") {
         handlestopRequest();
      }else{
        outputSpeechText = "Sorry! I could not understand you properly! can you try again with proper command";
        cardContent = "Sorry! I could not understand you properly! can you try again with proper command";
      }


      function handlestopRequest(){
        outputSpeechText =  "Thank you for visiting us!! Don't forget to look onto our VBX extensions";
        cardContent =  "Thank you for visiting us!! Don't forget to look onto our VBX extensions";
        stopRequest=true;
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
            "shouldEndSession": stopRequest
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
          "shouldEndSession": stopRequest
        }
      };
    }

    res.statusCode = 200;
    res.contentType('application/json');
    res.send(responseBody);
  });
});
