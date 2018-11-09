
$(function() {

	let thumb = {};
	let image = {};
	let file = { url : '/img/slow-magic.jpg' };

	const maxFileSize = 1;

	const $viewer = $('.viewer');
	const $image = $('.viewer img');
	const $marquee = $('.marquee');
	const btnSelect = $('.btn-select');
	const btnUpload = $('.btn-upload');
	const fileDialog = $('.file-dialog');

	btnSelect.click(function(e){  fileDialog.click(); });
	btnUpload.click(function(e){
		let mx = (image.nw/image.w);
		let my = (image.nh/image.h);
		thumb.crop.x = (thumb.crop.x-image.x) * mx;
		thumb.crop.y = (thumb.crop.y-image.y) * my;
		thumb.crop.w *= mx;
		thumb.crop.h *= my;
		var request = new XMLHttpRequest();
			request.open('POST', '/upload');
		var formData = new FormData();
			formData.append('data', JSON.stringify(thumb.crop));
			formData.append('file', new File([file.blob], 'photo.'+file.ext, { type: 'image/'+(file.ext=='jpg' ? 'jpeg' : file.ext)}));
		request.send(formData);
	})

	fileDialog.change(function(e) {
		if (this.files && this.files[0]) {
			if (maxFileSize && this.files[0].size/1000/1000 > maxFileSize){
				alert('The maximum file size for uploads in this demo is '+maxFileSize+'MB.');
			}	else{
				let url = fileDialog.val().replace(/C:\\fakepath\\/i, '');
				file.ext = url.split('.').pop();
				convertBlobToImage(this.files[0]);
			}
		}
	});

	const getImageAsBlob = async function(url)
	{
		file.ext = url.split('.').pop();
		convertBlobToImage(await fetch(url).then(r => r.blob()));
	}

	const convertBlobToImage = function(blob)
	{
		file.blob = blob;
		var reader = new FileReader();
		reader.onload = function (e) {
			$image.attr('src', e.target.result);
			setTimeout(function(){
				let img = $image[0];
				let dw = img.width/img.naturalWidth;
				let dh = img.height/img.naturalHeight;
				if (dw > dh){
					let w = img.naturalWidth * dh;
					image = {
						x	:(img.width-w)/2,
						y	:0,
						w	:w,
						h	:img.height
					};
				}	else{
					let h = img.naturalHeight * dw;
					image = {
						x	:0,
						y	:(img.height-h)/2,
						w	:img.width,
						h	:h
					};
				}
				image.nw = img.naturalWidth;
				image.nh = img.naturalHeight;
				//$marquee.css({top:image.y, left:image.x, width:image.w, height:image.h});
				//$marquee.show();
			}, 100)
		}
		reader.readAsDataURL(blob);
	}

	getImageAsBlob(file.url)

	/*
		thumbnail generator
	*/


	$marquee.hide();
	$image.on('dragstart', function(e) { e.preventDefault(); });
	var clearThumbnail = function()
	{
		$marquee.hide();
		thumb.crop = { };
	}
	var getMousePosition = function(e)
	{
		var mouse = { x:e.clientX, y:e.clientY };
		var div = {x:$viewer.offset().left - $(window).scrollLeft(), y:$viewer.offset().top - $(window).scrollTop()};
		return { x:(mouse.x - div.x), y:(mouse.y - div.y) };
	}
	var resize = function(e)
	{
		var mouse = getMousePosition(e);
		if (!isWithinBounds(mouse)) return;
		thumb.crop.w = mouse.x - thumb.crop.x;
		thumb.crop.h = mouse.y - thumb.crop.y;
		if (thumb.mode == 'fixed ratio'){
			thumb.crop.h = thumb.crop.w * (thumb.ratio.height/thumb.ratio.width);
		}
		$marquee.css({ width:thumb.crop.w, height:thumb.crop.h});
	}
	var isWithinBounds = function(p)
	{
		let x = p.x-image.x > 0;
		let y = p.y-image.y > 0;
		let w = p.x<(image.x+image.w);
		let h = p.y<(image.y+image.h);
		return x && y && w && h;
	}
	var onMouseDown = function(e)
	{
		var mouse = getMousePosition(e);
		if (!isWithinBounds(mouse)) return;
		thumb.crop = { x:mouse.x, y:mouse.y };
		$marquee.css({ left:thumb.crop.x, top:thumb.crop.y});
	// allow resizing //
		if (thumb.mode != 'fixed size'){
			$image.bind("mousemove", resize);
			$marquee.bind("mousemove", resize);
			$image.css('cursor', 'crosshair');
			$marquee.css({ width: 0, height: 0 });
		}	else{
	// fixed size mode //
			$marquee.css({
				width	:thumb.width * ($image.width()/image.width),
				height	:thumb.height * ($image.height()/image.height)
			});
		}
		$marquee.show();
	}
	var onMouseUp = function()
	{
		$image.css('cursor', 'default');
		$image.unbind("mousemove", resize);
		$marquee.unbind("mousemove", resize);
	}

	$(window).bind("mouseup", onMouseUp);
	$image.bind("mousedown", onMouseDown);
	$marquee.bind("mousedown", onMouseDown);
// 	document.addEventListener("keydown", function(e){
// // allow arrow keys to fine tune placement of the thumbnail //
// 		if ($marquee.is(":visible")){
// 			if (e.keyCode == 37){
// 				thumb.crop.x--;
// 			} else if (e.keyCode == 38){
// 				thumb.crop.y--;
// 			} else if (e.keyCode == 39){
// 				thumb.crop.x++;
// 			} else if (e.keyCode == 40){
// 				thumb.crop.y++;
// 			}
// 			$marquee.css({ left:thumb.crop.x, top:thumb.crop.y });
// 		}
// 	}, false);

});
