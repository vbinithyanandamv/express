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
var dashboardname={username:"jon",name:"Sales Dashboard",lasttime:"August 01, 2016",title1:"Revenue and Profit",title2:"Margin by Region"};
var maxmininfo={message1:"Product A has the highest Revenue and Product B has the lowest Revenue.",message2:" Region A has the highest profit and Region B has the lowest Profit."}
// Creates the website server on the port #
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});


io.on('connection', function(socket){
  socket.on('maxmininfo', function(data){
    var info=data.split(';')
    maxmininfo.message1=info[0];
    maxmininfo.message2=info[1];
  });

  socket.on('userdashboardinfo', function(data){
    var info=data.split(';')
    dashboardname.username=info[0],
    dashboardname.name=info[1],
    dashboardname.lasttime=info[2];
    dashboardname.title1=info[3];
    dashboardname.title2=info[4];
  });

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
      //s
      else if(jsonData.request.intent.name == "Filter"){
        if(jsonData.request.intent.slots.Dim.value=="ZREGION"){
          outputSpeechText = "Displaying the"+jsonData.request.intent.slots.Dim.value+" for "+jsonData.request.intent.slots.Value.value;
          cardContent = "Displaying the"+jsonData.request.intent.slots.Dim.value+" for "+jsonData.request.intent.slots.Value.value;
        }else if(jsonData.request.intent.slots.Dim.value=="ZFUELCAT"){
          outputSpeechText = "Displaying the"+jsonData.request.intent.slots.Dim.value+" for "+jsonData.request.intent.slots.Value.value;
          cardContent = "Displaying the"+jsonData.request.intent.slots.Dim.value+" for "+jsonData.request.intent.slots.Value.value;
        }
        io.emit('filter',jsonData.request.intent.slots.Dim.value+':'+jsonData.request.intent.slots.Value.value);
      }
      else if(jsonData.request.intent.name == "Measure"){
          if(jsonData.request.intent.slots.Measurelist.value=="Number of Records"){
            outputSpeechText = "Displaying the"+jsonData.request.intent.slots.Measurelist.value+" for"+jsonData.request.intent.slots.Timeperiod.value;
            cardContent = "Displaying the"+jsonData.request.intent.slots.Measurelist.value+" for"+jsonData.request.intent.slots.Timeperiod.value;
          }
          else if(jsonData.request.intent.slots.Measurelist.value=="Fuel Consumption"){
            outputSpeechText =  "Displaying the"+jsonData.request.intent.slots.Measurelist.value+" for"+jsonData.request.intent.slots.Timeperiod.value;
            cardContent = "Displaying the"+jsonData.request.intent.slots.Measurelist.value+" for"+jsonData.request.intent.slots.Timeperiod.value;
          }
      }
      else if (jsonData.request.intent.name == "ExplainDashboard")
      {
        // The Intent "TurnOff" was successfully called
        outputSpeechText =  "This dashboard shows  "+dashboardname.title1+" and  "+dashboardname.title2;
        cardContent =  "This dashboard shows  "+dashboardname.title1+" and  "+dashboardname.title2;
		    io.emit('ExplainDashboard', outputSpeechText);
      }
      else if (jsonData.request.intent.name == "Whatdowesee")
      {
        // The Intent "TurnOff" was successfully called
        outputSpeechText =  maxmininfo.message1+maxmininfo.message2;
        cardContent =  maxmininfo.message1+maxmininfo.message2;
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
