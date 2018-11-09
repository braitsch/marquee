
$(function() {

	const maxFileSize = 1;
	let file = { url : '/img/slow-magic.jpg' };

	let image = $('img');
	let btnSelect = $('.btn-select');
	let btnUpload = $('.btn-upload');
	let fileDialog = $('.file-dialog');

	btnSelect.click(function(e){  fileDialog.click(); });
	btnUpload.click(function(e){
		var request = new XMLHttpRequest();
			request.open('POST', '/upload');
		var formData = new FormData();
			formData.append('crop', JSON.stringify(thumb));
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
			image.attr('src', e.target.result);
			setTimeout(function(){
				let img = image[0];
			// calculate computed position from object-fit //
				console.log(img.width, img.height, img.naturalWidth, img.naturalHeight)
			}, 100)
		}
		reader.readAsDataURL(blob);
	}

	getImageAsBlob(file.url)

	/*
		thumbnail generator
	*/
	
	let thumb = {};
	var $image = $('.viewer img');
	var $thumb = $('.marquee');
	var $container = $('.viewer');

	$thumb.hide();
	$image.on('dragstart', function(e) { e.preventDefault(); });
	var clearThumbnail = function()
	{
		$thumb.hide();
		thumb.crop = { };
	}
	var getMousePosition = function(e)
	{
		var mouse = { x:e.clientX, y:e.clientY };
		var div = {x:$container.offset().left - $(window).scrollLeft(), y:$container.offset().top - $(window).scrollTop()};
		return { x:(mouse.x - div.x), y:(mouse.y - div.y) };
	}
	var resize = function(e)
	{
		var mouse = getMousePosition(e);
		var width = mouse.x - thumb.crop.x;
		var height = mouse.y - thumb.crop.y;
		if (thumb.mode == 'fixed ratio'){
			height = width * (thumb.ratio.height/thumb.ratio.width);
		}
		$thumb.css({
			width	:width,
			height	:height
		});
	}
	var onMouseDown = function(e)
	{
		var mouse = getMousePosition(e);
		thumb.crop = { };
		thumb.crop.x = mouse.x;
		thumb.crop.y = mouse.y;
		$thumb.css({
			left	:thumb.crop.x,
			top		:thumb.crop.y,
		});
	// allow resizing //
		if (thumb.mode != 'fixed size'){
			$image.bind("mousemove", resize);
			$thumb.bind("mousemove", resize);
			$image.css('cursor', 'crosshair');
			$thumb.css({ width:0, height:0 });
		}	else{
	// fixed size mode //
			$thumb.css({
				width	:thumb.width * ($image.width()/image.width),
				height	:thumb.height * ($image.height()/image.height)
			});
		}
		$thumb.show();
	}
	var onMouseUp = function()
	{
		$image.css('cursor', 'default');
		$image.unbind("mousemove", resize);
		$thumb.unbind("mousemove", resize);
	}

	$(window).bind("mouseup", onMouseUp);
	$image.bind("mousedown", onMouseDown);
	$thumb.bind("mousedown", onMouseDown);
	document.addEventListener("keydown", function(e){
// allow arrow keys to fine tune placement of the thumbnail //
		if ($thumb.is(":visible")){
			if (e.keyCode == 37){
				thumb.crop.x--;
			} else if (e.keyCode == 38){
				thumb.crop.y--;
			} else if (e.keyCode == 39){
				thumb.crop.x++;
			} else if (e.keyCode == 40){
				thumb.crop.y++;
			}
			$thumb.css({ left:thumb.crop.x, top:thumb.crop.y });
		}
	}, false);

});
