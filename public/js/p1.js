
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
		}
		reader.readAsDataURL(blob);
	}

	getImageAsBlob(file.url)

});
