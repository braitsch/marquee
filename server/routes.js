
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const formidable = require('formidable');
//var pushpop = require('../../pushpop/npm-module/index.js');
//var pushpop = require('pushpop');

// pushpop.config({
// // [required] set the global upload directory //
// 	uploads:path.join(__dirname, '..', '/uploads'),
// // [optional] overwrite file names with unique ids //
// 	uniqueIds:true,
// // [optional] enable logging //
// 	enableLogs:true,
// // [optional] save files to gcloud instead of the local filesystem //
// //	service: { name:'gcloud', bucket:'pushpop'}
// })

// delete from demo anything that is older than three minutes //
//var CronJob = require('cron').CronJob;
//new CronJob('*/1 * * * *', pushpop.purge, 3, true, 'America/Los_Angeles');

module.exports = function(app) {

	app.get('/', function (req, res)
	{	
		res.render('gallery');
		//res.redirect('/project/gallery');
	});

	app.get('/project/:id', function(req, res)
	{
	// set the active project //
		// pushpop.setProject(req.params['id'], function(project){
		// 	res.render('gallery', { project : project });
		// });
	});	

	app.get('/project/:id/print', function(req, res){
		// pushpop.getProject(req.params['id'], function(project){
		// 	res.send({ project : project });
		// })
	});

	app.get('/print', function(req, res){
		// pushpop.getAll(function(projects){
		// 	res.send({ projects : projects });
		// })
	});

	app.get('/reset', function(req, res){
		// pushpop.reset(function(){
		// 	res.redirect('/');
		// });
	});

	app.post('/delete', function(req, res)
	{
		// if (!pushpop.error){
		// 	res.send('ok').status(200);
		// }	else{
		// 	res.send(pushpop.error).status(500);
		// }
	});

	app.post('/upload', function(req, res)
	{
		let form = new formidable.IncomingForm();
		let fileName = app.guid();
		let cropData = undefined;
		const gallery =  __dirname + '/../uploads';
		form.on('file', function(type, file) {
		// rename the incoming webm stream file so it is unique before we save it to disk //
			fs.rename(file.path, gallery +'/'+ fileName + '.jpg', function( e ) { });
		});
		form.on('field', function(name, field) {
			if (name == 'data') cropData = JSON.parse(field);
		});
		form.on('end', function() {
			if (cropData){
				let large = gallery +'/'+ fileName + '.jpg'
				let small = gallery +'/'+ fileName + '_sm.jpg'
				sharp(large)
				.extract({
					left: Math.round(cropData.x),
					top: Math.round(cropData.y),
					width: Math.round(cropData.w),
					height: Math.round(cropData.h)
				}).toBuffer().then(data => {
					sharp(data).toFile(small).then(function(){
						console.log('thumbnail generated')
					});
				});
			}
			res.send('ok');
		});
		form.parse(req, function(err, fields, file) { });
	});

	// app.post('/upload', pushpop.upload, function(req, res)
	// {
	// 	if (!pushpop.error){
	// 		res.send('ok').status(200);
	// 	}	else{
	// 		res.send(pushpop.error).status(500);
	// 	}
	// });

	app.get('*', function(req, res){
		if (req.url != '/favicon.ico'){
			res.redirect('/');
		}	else{
			res.sendStatus(404);
		}
	});

};

