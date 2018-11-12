
$(function() {

	$modal_dl = $('.modal-download');
	$modal_dl_img = $('.modal-download img');
	$modal_dl_btn = $('.modal-download .btn');

	let mq = new Marquee();
	mq.onComplete(function(name, base64)
	{
		$modal_dl_img.attr('src', base64);
		$modal_dl_img.attr('name', name);
		$modal_dl_btn.attr('href', base64);
		$modal_dl_btn.attr('download', name);
		$modal_dl.modal('show');
	});

	$modal_dl_btn.click(function(){ $modal_dl.modal('hide'); });
	$modal_dl.on('hidden.bs.modal', function (e) {
		let request = new XMLHttpRequest();
			request.open('POST', '/delete');
		let formData = new FormData();
			formData.append('file', $modal_dl_img.attr('name'));
		request.send(formData);
	});

});