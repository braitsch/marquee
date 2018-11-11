
/*
    Copyright (C) 2018 Stephen Braitsch [http://braitsch.io]
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

const fs = require('fs');
const mv = require('mv');
const path = require('path');
const sharp = require('sharp');
const formidable = require('formidable');

const images = 'media'; // <- destination folder
const public = path.join(__dirname, '/../public');
const uploads = path.join(public, images);

if (!fs.existsSync(uploads)) fs.mkdirSync(uploads);
const guid = function(){return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});}

exports.upload = function(req, cback)
{
	let form = new formidable.IncomingForm();
	let file = undefined;
	let crop = undefined;
	let fileName = guid();
	form.on('file', function(type, f) { file = f; });
	form.on('field', function(name, field) { if (name == 'crop') crop = JSON.parse(field); });
	form.on('end', function() {
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
							if (fs.existsSync(large)) fs.unlinkSync(large);
							cback('/'+images+'/'+fileName+'_sm.jpg');
						}).catch(function(e){ console.log(e); });
					}).catch(function(e){ console.log(e); });
				}
			}
		});
	});
	form.parse(req, function(err, fields, file) {});
}

exports.delete = function(req, cback)
{
	let form = new formidable.IncomingForm();
	form.on('end', cback);
	form.parse(req, function(err, fields) {
		let file = path.join(uploads, fields.file.substring(fields.file.lastIndexOf('/') + 1));
		if (fs.existsSync(file)) fs.unlinkSync(file);
	});
}

exports.list = function(cback)
{
	let files = [];
	fs.readdirSync(uploads).forEach(file => {  files.push(file); });
	cback(files);
}

exports.reset = function(cback)
{
	fs.readdir(uploads, (err, files) => {
		for (const file of files) {
			let p = path.join(uploads, file);
			if (fs.existsSync(p)) fs.unlinkSync(p);
		}
		cback();
	});
}


