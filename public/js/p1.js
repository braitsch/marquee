
$(function() {

	let image = { url: '/img/slow-magic.jpg' };
	let thumb = { mode:'normal', crop:{w:500, h:500}, rw:16, rh:9 };

	const maxFileSize = 1;

	const $viewer = $('.viewer');
	const $image = $('.viewer img');
	const $marquee = $('.marquee');;
	const $style = $('.thumb-settings .style');
	const $color = $('.thumb-settings .color');
	const $width = $('.thumb-settings .w');
	const $height = $('.thumb-settings .h');
	const $select = $('.btn-select');
	const $upload = $('.btn-upload');
	const $fileInput = $('.file-dialog')

/*
	dropdowns & inputs
*/

	$style.change(function(){
		thumb.mode = this.value.toLowerCase();
		if (thumb.mode == 'normal'){
			$width.val(''); $height.val('');
		}	else if (thumb.mode == 'fixed size'){
			$width.val(thumb.crop.w);
			$height.val(thumb.crop.h);
		}	else if (thumb.mode == 'fixed ratio'){
			$width.val(thumb.rw);
			$height.val(thumb.rh);
		}
		$width.prop('disabled', thumb.mode == 'normal');
		$height.prop('disabled', thumb.mode == 'normal');
	});
	$color.change(function(){
		$marquee.css('border-color', this.value.toLowerCase());
	});
	$width.change(function(){
		let w = $(this).val();
		if (w < 1) w = 1;
		if (w > image.nw) w = image.nw;
		if (thumb.mode == 'fixed size'){
			thumb.crop.w = w;
		}	else if (thumb.mode == 'fixed ratio'){
			thumb.rw = w;
		}
		$(this).val(w);
	});
	$height.change(function(){
		let h = $(this).val();
		if (h < 1) h = 1;
		if (h > image.nh) h = image.nh;
		if (thumb.mode == 'fixed size'){
			thumb.crop.h = h;
		}	else if (thumb.mode == 'fixed ratio'){
			thumb.rh = h;
		}
		$(this).val(h);
	});

/*
	select and upload image
*/

	$select.click(function(e){  $fileInput.click(); });
	$upload.click(function(e){
		let mx = (image.nw/image.w);
		let my = (image.nh/image.h);
		let data = {
			x : (thumb.crop.x-image.x) * mx,
			y : (thumb.crop.y-image.y) * my,
			w : thumb.crop.w, h : thumb.crop.h
		}
		if (thumb.mode != 'fixed size'){
			data.w *= mx;
			data.h *= my;
		}
		var request = new XMLHttpRequest();
			request.open('POST', '/upload');
		var formData = new FormData();
			formData.append('data', JSON.stringify(data));
			formData.append('file', new File([image.blob], 'photo.'+image.ext, { type: 'image/'+(image.ext=='jpg' ? 'jpeg' : image.ext)}));
		request.send(formData);
	})

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

	const getImageAsBlob = async function(url)
	{
		image.ext = url.split('.').pop();
		convertBlobToImage(await fetch(url).then(r => r.blob()));
	}

	const convertBlobToImage = function(blob)
	{
		image.blob = blob;
		var reader = new FileReader();
		reader.onload = function (e) {
			$image.attr('src', e.target.result);
			setTimeout(function(){
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
			}, 100)
		}
		reader.readAsDataURL(blob);
	}

	getImageAsBlob(image.url)

	/*
		marquee tool
	*/

	$marquee.hide();
	$image.on('dragstart', function(e) { e.preventDefault(); });
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
		if (thumb.mode == 'fixed ratio') {
			thumb.crop.h = thumb.crop.w * (thumb.rh/thumb.rw);
			if (thumb.crop.y + thumb.crop.h > image.h){
				thumb.crop.h = image.h - thumb.crop.y;
				thumb.crop.w = thumb.crop.h * (thumb.rw/thumb.rh);
			}
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
		thumb.crop.x = mouse.x;
		thumb.crop.y = mouse.y;
		if (thumb.mode == 'fixed size'){
			let dx = (image.nw - thumb.crop.w) * (image.w/image.nw);
			let dy = (image.nh - thumb.crop.h) * (image.h/image.nh);
			if (thumb.crop.x > dx + image.x) thumb.crop.x = dx + image.x;
			if (thumb.crop.y > dy + image.y) thumb.crop.y = dy + image.y;
			let w = thumb.crop.w * (image.w/image.nw);
			let h = thumb.crop.h * (image.h/image.nh);
			$marquee.css({ top:thumb.crop.y, left:thumb.crop.x, width:w, height:h });
		}	else{
		// allow resizing //
			$viewer.css('cursor', 'crosshair');
			$image.bind("mousemove", resize);
			$marquee.bind("mousemove", resize);
			$marquee.css({ top:thumb.crop.y, left:thumb.crop.x, width:0, height:0 });
		}
		$marquee.show();
	}
	var onMouseUp = function()
	{
		$viewer.css('cursor', 'default');
		$image.unbind("mousemove", resize);
		$marquee.unbind("mousemove", resize);
	}
	$(window).bind("mouseup", onMouseUp);
	$image.bind("mousedown", onMouseDown);
	$marquee.bind("mousedown", onMouseDown);
	document.addEventListener("keydown", function(e){
// allow arrow keys to fine tune placement of the thumbnail //
		if ($marquee.is(":visible")){
			if (e.keyCode == 37){
				thumb.crop.x--;
			} else if (e.keyCode == 38){
				thumb.crop.y--;
			} else if (e.keyCode == 39){
				thumb.crop.x++;
			} else if (e.keyCode == 40){
				thumb.crop.y++;
			}
			if (thumb.crop.x < image.x) thumb.crop.x = image.x;
			if (thumb.crop.y < image.y) thumb.crop.y = image.y;
			if (thumb.crop.x+thumb.crop.w>image.x+image.w) thumb.crop.x = (image.x+image.w)-thumb.crop.w;
			if (thumb.crop.y+thumb.crop.h>image.y+image.h) thumb.crop.y = (image.y+image.h)-thumb.crop.h;
			$marquee.css({ left:thumb.crop.x, top:thumb.crop.y });
		}
	}, false);

});
