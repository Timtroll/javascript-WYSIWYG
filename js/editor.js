document.addEventListener('DOMContentLoaded', function () {
	if (document.querySelector('#editor')) {
		// Add Escape enent for close popup
		document.onkeydown = function(evt) {
			evt = evt || window.event;
			if (evt.keyCode == 27) {
				ClosePopup();
			};
		}

		var seconds = new Date().getTime() / 1000;

		// load templates for insert link 
		Ajax('./js/images.js?' + seconds, createImageList, true, 'GET', '', null);

		// load templates for insert link 
		Ajax('./templates/link.html', createLinkHtml, true, 'GET', '', null);

		// load templates for insert image 
		Ajax('./templates/image.html', createImageHtml, true, 'GET', '', null);

		// init Editor
		var savedRange, isInFocus, imageList;

		var editor = document.querySelector('#editor');
		var editorhtml = document.querySelector('#editorhtml');
		var editorLink = document.querySelector('#editor-link');
		var editorImage = document.querySelector('#editor-image');

		var toolbar = document.querySelectorAll('.command');

		var colorPalette = ['000000', 'FF9966', '6699FF', '99FF66', 'CC0000', '00CC00', '0000CC', '333333', '0066FF', 'FFFFFF'];
		var forePalette = document.querySelector('.fore-palette');
		var backPalette = document.querySelector('.back-palette');

		initClosePopup();

		// initInsertImage();
		// initInsertLink();

		for (var i = 0; i < colorPalette.length; i++) {
			var dat = '<a href="#" data-command="forecolor" data-value="' + '#' + colorPalette[i] + '" style="background-color:' + '#' + colorPalette[i] + ';" class="command palette-item"></a>';
			forePalette.insertAdjacentHTML('beforeend', dat);

			dat = '<a href="#" data-command="backcolor" data-value="' + '#' + colorPalette[i] + '" style="background-color:' + '#' + colorPalette[i] + ';" class="command palette-item"></a>';
			backPalette.insertAdjacentHTML('beforeend', dat);
		}

		// Editor command selector
		Array.from(toolbar).forEach(link => {
			link.addEventListener("click", function () {
				var command = this.getAttribute('data-command');

				if (command == 'h1' || command == 'h2' ||  command == 'h3' ||  command == 'h4' || command == 'p') {
					document.execCommand('formatBlock', false, command);
					editorhtml.value = editor.innerHTML;
				}
				else if (command == 'empty') {
					document.execCommand('formatBlock', false, 'p');
					editorhtml.value = editor.innerHTML;
				}
				else if (command == 'forecolor' || command == 'backcolor') {
					document.execCommand(this.getAttribute('data-command'), false, this.getAttribute('data-value'));
					editorhtml.value = editor.innerHTML;
				}
				else if (command == 'insertorderedlist') {
					document.execCommand("insertorderedlist", false, command);
					editorhtml.value = editor.innerHTML;
				}
				else if (command == 'insertunorderedlist') {
					document.execCommand('insertunorderedlist');
					editorhtml.value = editor.innerHTML;
				}
				else if (command == 'insertimage') {
					saveSelection();
					// imageForm();
					document.querySelector("#editor-image").style.display = '';

					// show spinner and resize modal
					resize();
				}
				else if (command == 'createlink') {
					document.querySelector("#editor-link").style.display = '';

					// show spinner and resize modal
					resize();
				}
				else if (command == 'html') {
					if (editorhtml.style.display != '') {
						editorhtml.value = editor.innerHTML;
						editor.style.display = 'none';
						editorhtml.style.display = '';
					}
					else {
						editor.innerHTML = editorhtml.value;
						editor.style.display = '';
						editorhtml.style.display = 'none';
					}
				}
				else {
					document.execCommand(command, false, null);
					editorhtml.value = editor.innerHTML;
				}
				return false;
			});
		});



		// show popup for InsertImage and InsertLink
		if (document.querySelector('#editor-link') || document.querySelector('#editor-image')) {
			// show spinner and resize modal
			resize();
		}

		// fill textarea if focus are flur
		editor.addEventListener("blur", function () {
			editorhtml.value = editor.innerHTML;
		});

		// insert/Cancel image command
		if (document.querySelector('.editor-image-cancel')) {
			// cancel image command
			document.querySelector('.editor-image-cancel').addEventListener("click", function () {
				ClosePopup();
				editorhtml.value = editor.innerHTML;
				return false;
			});
		}

		// insert link command
		if (document.querySelector('.editor-link-cancel')) {
			// cancel link command
			document.querySelector('.editor-link-cancel').addEventListener("click", function () {
				ClosePopup();
				editorhtml.value = editor.innerHTML;
				return false;
			});
		}

		function saveSelection() {
			// fo different browsers
			var sel = window.getSelection && window.getSelection();

			// check exists selection
			if(sel && sel.rangeCount > 0) {
				savedRange = window.getSelection().getRangeAt(0);
			}
		}

		function restoreSelection() {
			isInFocus = true;
			document.querySelector('#editor').focus();
			if (savedRange != null) {
				// non IE and there is already a selection
				if (window.getSelection) {
					var s = window.getSelection();
					if (s.rangeCount > 0) {
						s.removeAllRanges();
					}
					s.addRange(savedRange);
				}
				// non IE and no selection
				else if (document.createRange) {
					window.getSelection().addRange(savedRange);
				}
				// IE
				else if (document.selection) {
					savedRange.select();
				}
			}
		}

		function ClosePopup() {
			if (document.querySelector("#editor-link")) {
				document.querySelector("#editor-link").style.display = 'none';
			}
			if (document.querySelector("#editor-image")) {
				document.querySelector("#editor-image").style.display = 'none';
			}
		}

		function initClosePopup() {
			if (document.querySelector(".close-popup")) {
				var close = document.querySelectorAll('.close-popup');
				Array.from(close).forEach(closer => {
					closer.addEventListener("click", function () {
						ClosePopup();
					});
				});
			}
		}

		// Load json image list
		function createImageList(inp) {
			inp = inp.replace(/\r|\n/g, '');
			imageList = JSON.parse(inp, null, 4);
		}

		// Load add image form
		function createImageHtml(inp) {
			imageHtml = inp;
			// load input image form
			document.querySelector('.ajax-content-image').innerHTML = '';
			document.querySelector('.ajax-content-image').insertAdjacentHTML('beforeend', inp);

			// create list of images
			var select = document.querySelector('#imagelist');
			for (key in imageList) {
				var option = document.createElement( 'option' );
				option.value = imageList[key];
				option.text = key;
				select.add( option );
			}

			// set image align events
			var inputs = document.querySelectorAll('.radio-input');
			Array.from(inputs).forEach(inpts => {
				inpts.addEventListener("click", function () {
					// var stl = document.querySelector('input[name=imgalign][checked]').value || '';
					document.querySelector('.example').style.float = this.value;
				});
			});

			// init image form
			if (document.querySelector(".image-insert")) {
				document.querySelector('.image-insert').addEventListener("click", function () {
					InsertImage();
				});
			}
			if (document.querySelector(".image-cancel")) {
				// close insert image popup
				document.querySelector('.image-cancel').addEventListener("click", function () {
					ClosePopup();
				});
			}
		}

		// insert image into editable div
		function InsertImage() {
			var styl = [];
			var prop = [];

			// get url from input
			var url = document.querySelector('.image-url').value || '';
			if (url) { prop.push('src="' + url + '"'); }
			// get url from select
			else {
				var e = document.querySelector('#imagelist');
				url = e.options[e.selectedIndex].value;
				if (url) {
					prop.push('src="' + url + '"');
				}
			}

			var width = document.querySelector('.image-width').value || '';
			if (document.querySelector('.image-widthper').checked && width) { width += '%'; }
			if (width) { prop.push('width="' + width + '"'); }

			var height = document.querySelector('.image-height').value || '';
			if (document.querySelector('.image-heightper').checked && height) { height += '%'; }
			if (height) { prop.push('height="' + height + '"'); }

			var imageClass = document.querySelector('.image-class').value || '';
			if (imageClass) { prop.push('class="' + imageClass + '"'); }

			var imageTitle = document.querySelector('.image-title').value || '';
			if (imageTitle) { prop.push('title="' + imageTitle + '"'); }

			var imageAlt = document.querySelector('.image-alt').value || '';
			if (imageAlt) { prop.push('alt="' + imageAlt + '"'); }

			var imageBorder = document.querySelector('.image-border').value || '';
			if (imageBorder) { styl.push('border:' + imageBorder); }

			// get align of image
			var inpRadio = document.querySelectorAll('.radio-input');
			Array.from(inpRadio).forEach(radios => {
				if (radios.checked) {
					// console.log(radios.value);
					if (radios.value) {
						styl.push('float: ' + radios.value);
					}
				}
			});

			// get padding
			var padding = [];
			for (var i = 1; i < 5; i++) {
				var x = document.querySelector('.image-padding' + i).value || '0';
				if (x) { padding.push(x); }
			}
			styl.push('padding:' + padding.join(' '));

			// get marging
			var marging = [];
			for (var i = 1; i < 5; i++) {
				var x = document.querySelector('.image-marging' + i).value || '0';
				if (x) { marging.push(x); }
			}
			styl.push('marging:' + marging.join(' '));


			var imageStyle = document.querySelector('.image-style').value || '';
			if (imageStyle) { styl.push(imageStyle); }

			var img = '<img ' + prop.join(' ') + ' style="' + styl.join(';') + '"">';

			if (url) {
				restoreSelection();
				document.execCommand('insertHTML', false, img);

				// sync editable and hidden textarea
				editorhtml.value = editor.innerHTML;
			}
		}

		// Load add Link form
		function createLinkHtml(inp) {
console.log('insert');
			// load input link form
			document.querySelector('.ajax-content-link').innerHTML = '';
			document.querySelector('.ajax-content-link').insertAdjacentHTML('beforeend', inp);

			// init link form
			if (document.querySelector(".link-insert")) {
				if (document.querySelector(".link-insert")) {
					document.querySelector('.link-insert').addEventListener("click", function () {
						InsertLink();
					});
				}
			}
			if (document.querySelector(".link-cancel")) {
				// close insert link popup
				document.querySelector('.link-cancel').addEventListener("click", function () {
					ClosePopup();
				});
			}
		}

		function InsertLink() {

		}

		// resize modal
		function resize() {
			// Element classes for resize
			var classes = ['.visible', '.spinner']

			var visible = document.querySelectorAll('.visible');
			Array.from(visible).forEach(vis => {
					vis.style.left = (window.innerWidth - vis.clientWidth)/2 + 'px';
			});
		}

		// prepare ajax request
		function getXmlHttpRequest() {
			var xmlhttp;
			try {
				xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
			}
			catch (e) {
				try {
					xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
				}
				catch (E) {
					xmlhttp = false;
				}
			}
			if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
				xmlhttp = new XMLHttpRequest();
			}
			return xmlhttp;
		}

		// exec ajax request
		function Ajax(url, callback, async, method, params, header) {
			var xmlhttp = getXmlHttpRequest();

			async = async || false;
			params = params || '';
			method = method || 'GET';

			if (method == 'GET') {
				url += '?' + params;
			}

			xmlhttp.open(method, url, async);

			if (header != null) {
				xmlhttp.setRequestHeader('Content-Type', header);
			}
			else if (method == 'POST') {
				header = 'application/x-www-form-urlencoded';
				xmlhttp.setRequestHeader('Content-Type', header);
			}

			if (!async) {
				if (params == '') {
					xmlhttp.send(null);
				}
				else {
					xmlhttp.send(params);
				}
				callback(xmlhttp.response);
			}
			else {
				xmlhttp.onreadystatechange = function() { 
					if (xmlhttp.readyState == 4) { 
						callback(xmlhttp.response);
					}
				};
				xmlhttp.send(params);
			}
			return xmlhttp;
		}
	}
});