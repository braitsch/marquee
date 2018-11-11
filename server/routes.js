
const fs = require('fs');
const mv = require('mv');
const path = require('path');
const sharp = require('sharp');
const formidable = require('formidable');

const images = 'media'; // <- destination folder
const public = path.join(__dirname, '/../public');
const uploads = path.join(public, images);

module.exports = function(app) {

	app.get('/', function (req, res)
	{	
		res.render('index');
	});

	app.post('/delete', function(req, res)
	{
		let form = new formidable.IncomingForm();
		form.on('end', function() { res.send('ok'); });
		form.parse(req, function(err, fields) {
			let file = fields.file.substring(fields.file.lastIndexOf('/') + 1);
			fs.unlinkSync(path.join(uploads, file), function(e){ console.log(e); });
		});
	});

	app.post('/upload', function(req, res)
	{
		let form = new formidable.IncomingForm();
		let file = undefined;
		let crop = undefined;
		let fileName = app.guid();
		form.on('file', function(type, f) { file = f; });
		form.on('field', function(name, field) { if (name == 'crop') crop = JSON.parse(field); });
		form.on('end', function() {
			if (!fs.existsSync(uploads)) fs.mkdirSync(uploads);
			mv(file.path, uploads +'/'+ fileName + '.jpg', function( e ) { 
				if (e){
					console.log(e);
				}	else{
					if (crop){
						let large = uploads +'/'+ fileName + '.jpg'
						let small = uploads +'/'+ fileName + '_sm.jpg'
						sharp(large)
						.extract({
							left: Math.round(crop.x),
							top: Math.round(crop.y),
							width: Math.round(crop.w),
							height: Math.round(crop.h)
						}).toBuffer().then(data => {
							sharp(data).toFile(small).then(function(){
								fs.unlinkSync(large);
								res.send('/'+images+'/'+fileName+'_sm.jpg');
							}).catch(function(e){ console.log(e); });
						}).catch(function(e){ console.log(e); });
					}
				}
			});
		});
		form.parse(req, function(err, fields, file) {});
	});

	app.get('*', function(req, res){
		if (req.url != '/favicon.ico'){
			res.redirect('/');
		}	else{
			res.sendStatus(404);
		}
	});

};

