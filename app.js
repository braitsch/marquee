
var express = require('express');
var app = express();
var http = require('http').Server(app);
// bodyParser only required for stripe integration //
var bodyParser = require('body-parser'); 

app.locals.pretty = true;

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'pug');
app.set('views', './server/views');
// bodyParser only required for stripe integration //
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/uploads'));

require('./server/routes')(app);
require('./server/stripe')(app);

const exec = require('child_process').exec;
const cmpl = 'stylus -w '+__dirname+'/public/css';
exec( cmpl, (e, stdout, stderr) => {
	e ? console.log(e) : console.log('watching style sheet');
});

http.listen(app.get('port'), function(q, r)
{
	console.log('Express server listening on port', app.get('port'));
});
