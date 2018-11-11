
const marquee = require('./marquee');

module.exports = function(app) {

	app.get('/', function (req, res)
	{	
		res.render('index');
	});

	app.post('/delete', function(req, res){
		marquee.delete(req, function(msg){
			res.send(msg);
		});
	});

	app.post('/upload', function(req, res, next){
		marquee.upload(req, function(file){
			res.send(file);
		});
	});

	app.get('/list', function(req, res, next){
		marquee.list(function(files){
			res.send(files);
		});
	});

	app.get('/reset', function(req, res, next){
		marquee.reset(function(){
			res.redirect('/list');
		});
	});

	app.get('*', function(req, res){
		if (req.url != '/favicon.ico'){
			res.redirect('/');
		}	else{
			res.sendStatus(404);
		}
	});

};