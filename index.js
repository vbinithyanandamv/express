var path = require('path');
var express = require('express');

var app = express();
var port = process.env.PORT || 8080;
var staticPath = path.join(__dirname, '/public');
app.use(express.static(staticPath));

app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});