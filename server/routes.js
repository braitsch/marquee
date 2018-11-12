
const marquee = require('@braitsch/marquee');
marquee.config({
	uploads : '/public/media', // <- relative to application root
	keepFiles : false // <- delete files after thumbnail is generated
});

module.exports = function(app) {

	app.get('/', function (req, res)
	{	
		res.render('index');
	});

	app.post('/delete', function(req, res){
		marquee.delete(req, function(deleted){
			res.sendStatus(200);
		});
	});

	app.post('/upload', function(req, res, next){
		marquee.upload(req, function(response){
			res.send(JSON.stringify({
				name:response.small.name, base64:response.small.base64
			}));
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