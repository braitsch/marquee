
function Marquee(){

	let image = { url: '/img/slow-magic.jpg' };
	let thumb = { mode:'normal', fixed:{w:250, h:250}, ratio:{w:16, h:9}};

	const maxFileSize = 4;

	const $viewer = $('.viewer');
	const $image = $('.viewer img');
	const $cropper = $('.cropper');
	const $style = $('.settings .style');
	const $color = $('.settings .color');
	const $width = $('.settings .w');
	const $height = $('.settings .h');
	const $select = $('.btn-select');
	const $upload = $('.btn-upload');
	const $progress = $('.progress-bar');
	const $fileInput = $('.file-dialog');

	let onCompleteCallback;
	this.onComplete = function(callback)
	{
		onCompleteCallback = callback;
	}

/*
	dropdowns & inputs
*/

	$style.change(function(){
		thumb.mode = this.value.toLowerCase();
		if (thumb.mode == 'normal'){
			$width.val(''); $height.val('');
		}	else if (thumb.mode == 'fixed size'){
			$width.val(thumb.fixed.w);
			$height.val(thumb.fixed.h);
		}	else if (thumb.mode == 'fixed ratio'){
			$width.val(thumb.ratio.w);
			$height.val(thumb.ratio.h);
		}
		$width.prop('disabled', thumb.mode == 'normal');
		$height.prop('disabled', thumb.mode == 'normal');
	});
	$color.change(function(){
		$cropper.css('border-color', this.value.toLowerCase());
	});
	$width.change(function(){
		let w = $(this).val();
		if (w < 1) w = 1;
		if (w > image.nw) w = image.nw;
		if (thumb.mode == 'fixed size'){
			thumb.fixed.w = w;
		}	else if (thumb.mode == 'fixed ratio'){
			thumb.ratio.w = w;
		}
		$(this).val(w);
	});
	$height.change(function(){
		let h = $(this).val();
		if (h < 1) h = 1;
		if (h > image.nh) h = image.nh;
		if (thumb.mode == 'fixed size'){
			thumb.fixed.h = h;
		}	else if (thumb.mode == 'fixed ratio'){
			thumb.ratio.h = h;
		}
		$(this).val(h);
	});

/*
	select and upload image
*/

	$select.click(function(e){  $fileInput.click(); });
	$upload.click(function(e){
		var request = new XMLHttpRequest();
		request.open('POST', '/upload');
		request.upload.onprogress = function(e){
			var percentComplete = Math.round(e.loaded / e.total * 100);
			$progress.css('width', percentComplete+'%')
		}
		request.onreadystatechange = function(e) {
			if (request.readyState == 4 && request.status == 200) {
				$progress.fadeOut(1000);
				if (onCompleteCallback) onCompleteCallback(request.responseText);
			}
		};
		var formData = new FormData();
		if (thumb.w && thumb.h){
			let mx = (image.nw/image.w);
			let my = (image.nh/image.h);
			let data = { x : (thumb.x-image.x) * mx, y : (thumb.y-image.y) * my, w : thumb.w * mx, h : thumb.h * my };
			formData.append('data', JSON.stringify(data));
		}
		$progress.css('width', '0%'); $progress.show();
		formData.append('file', new File([image.blob], 'photo.'+image.ext, { type: 'image/'+(image.ext=='jpg' ? 'jpeg' : image.ext)}));
		request.send(formData);
	});
	$fileInput.change(function(e) {
		if (this.files && this.files[0]) {
			if (maxFileSize && this.files[0].size/1000/1000 > maxFileSize){
				alert('The maximum file size for uploads in this demo is '+maxFileSize+'MB.');
			}	else{
				let url = $fileInput.val().replace(/C:\\fakepath\\/i, '');
				image.ext = url.split('.').pop();
				convertBlobToImage(this.files[0]);
			}
		}
	});

	var getImageAsBlob = async function(url)
	{
		image.ext = url.split('.').pop();
		convertBlobToImage(await fetch(url).then(r => r.blob()));
	}
	var convertBlobToImage = function(blob)
	{
		image.blob = blob;
		var reader = new FileReader();
		reader.onload = function (e) {
			$image.attr('src', e.target.result);
			setTimeout(computeImageDimensions, 100);
		}
		reader.readAsDataURL(blob);
	}
	var computeImageDimensions = function()
	{
		let img = $image[0];
		let dw = img.width/img.naturalWidth;
		let dh = img.height/img.naturalHeight;
		if (dw > dh){
			let w = img.naturalWidth * dh;
			image.x	= (img.width-w)/2;
			image.y	= 0;
			image.w	= w;
			image.h	= img.height;
		}	else{
			let h = img.naturalHeight * dw;
			image.x	= 0;
			image.y	= (img.height-h)/2;
			image.w	= img.width;
			image.h	= h;
		}
		image.nw = img.naturalWidth;
		image.nh = img.naturalHeight;
		thumb.x = 0; thumb.y = 0; thumb.w = 0; thumb.h = 0;
		$cropper.css({ top:thumb.y, left:thumb.x, width:thumb.w, height:thumb.h });
		$cropper.hide();
	}

	getImageAsBlob(image.url);

/*
	marquee tool
*/

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
		thumb.w = mouse.x - thumb.x;
		thumb.h = mouse.y - thumb.y;
		if (thumb.w < 0) thumb.w = 0;
		if (thumb.h < 0) thumb.h = 0;
		if (thumb.mode == 'fixed ratio') {
			thumb.h = thumb.w * (thumb.ratio.h/thumb.ratio.w);
			if (thumb.y + thumb.h > image.h){
				thumb.h = image.h - thumb.y;
				thumb.w = thumb.h * (thumb.ratio.w/thumb.ratio.h);
			}
		}
		$cropper.css({ width:thumb.w, height:thumb.h});
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
		thumb.x = mouse.x;
		thumb.y = mouse.y;
		thumb.w = 0; thumb.h = 0;
		if (thumb.mode == 'fixed size'){
			let dx = (image.nw - thumb.fixed.w) * (image.w/image.nw);
			let dy = (image.nh - thumb.fixed.h) * (image.h/image.nh);
			if (thumb.x > dx + image.x) thumb.x = dx + image.x;
			if (thumb.y > dy + image.y) thumb.y = dy + image.y;
			thumb.w = thumb.fixed.w * (image.w/image.nw);
			thumb.h = thumb.fixed.h * (image.h/image.nh);
			$cropper.css({ top:thumb.y, left:thumb.x, width:thumb.w, height:thumb.h });
		}	else{
		// allow resizing //
			$viewer.css('cursor', 'crosshair');
			$image.bind("mousemove", resize);
			$cropper.bind("mousemove", resize);
			$cropper.css({ top:thumb.y, left:thumb.x, width:0, height:0 });
		}
		$cropper.show();
	}
	var onMouseUp = function()
	{
		$viewer.css('cursor', 'default');
		$image.unbind("mousemove", resize);
		$cropper.unbind("mousemove", resize);
	}
	$cropper.bind("mousedown", onMouseDown);
	$image.bind("mousedown", onMouseDown);
	$image.on('dragstart', function(e) { e.preventDefault(); });
	$(window).bind("mouseup", onMouseUp);
	document.addEventListener("keydown", function(e){
// allow arrow keys to fine tune placement of the thumbnail //
		if ($cropper.is(":visible")){
			if (e.keyCode == 37){
				thumb.x--;
			} else if (e.keyCode == 38){
				thumb.y--;
			} else if (e.keyCode == 39){
				thumb.x++;
			} else if (e.keyCode == 40){
				thumb.y++;
			}
			if (thumb.x < image.x) thumb.x = image.x;
			if (thumb.y < image.y) thumb.y = image.y;
			if (thumb.x+thumb.w>image.x+image.w) thumb.x = (image.x+image.w)-thumb.w;
			if (thumb.y+thumb.h>image.y+image.h) thumb.y = (image.y+image.h)-thumb.h;
			$cropper.css({ left:thumb.x, top:thumb.y });
		}
	}, false);
	$( window ).resize(computeImageDimensions);

};
