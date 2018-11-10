
$(function() {

	let imageURL = undefined;

	$modal_dl = $('.modal-download');
	$modal_dl_img = $('.modal-download img');
	$modal_dl_btn = $('.modal-download .btn');

	let mq = new Marquee();
	mq.onComplete(function(url)
	{
		imageURL = url;
		$modal_dl_img.attr('src', imageURL);
		$modal_dl_btn.attr('href', imageURL);
		$modal_dl.modal('show');
	});

	$modal_dl_btn.click(function(){ $modal_dl.modal('hide'); });
	$modal_dl.on('hidden.bs.modal', function (e) {
		console.log('hidden')
		let request = new XMLHttpRequest();
			request.open('POST', '/delete');
		let formData = new FormData();
			formData.append('file', imageURL);
		request.send(formData);
	});

});