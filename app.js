
var express = require('express');
var app = express();
var http = require('http').Server(app);

app.locals.pretty = true;
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'pug');
app.set('views', './server/views');
app.use(express.static(__dirname + '/public'));

require('./server/routes')(app);

http.listen(app.get('port'), function(q, r)
{
	console.log('Express server listening on port', app.get('port'));
});