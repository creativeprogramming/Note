/*
 * Copyright MIT © <2013> <Francesco Trillini>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and 
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE 
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
 
var self = window; 
 
;(function(self) {

	var mouse = { x: 0, y: 0}, data = [], id, zIndex, target, drag = false;

	/*
	 * Init.
	 */
	
	function init() {
	
		// Is web storage supported by browser?
		if(!!(HTML5StorageSupport())) {
			
			// When it's first time...
			if(localStorage['data'] === undefined) {
				
				id = zIndex = -1;
				
				localStorage['data'] = JSON.stringify(data);
				
			}
			
			// ...otherwise...
			else {
			
				id = zIndex = JSON.parse(localStorage['data']).length - 1;
			
				loadNotes();
			
			}
		
		}
		
		else {
		
			console.error("Sorry, but we can't handle it with your old browser.");
			
			return;
		
		}
	
		attachNoteListener();
	
	}
	
	/*
	 * Is web storage supported by browser.
	 */
	
	function HTML5StorageSupport() {
	
		return 'localStorage' in window && window['localStorage'] !== null;
	
	}
	
	/*
	 * Gets the note from DOM.
	 */
	
	function getNote(div) {
	
		return document.querySelector('div#' + div.target.id);
	
	}
	
	/*
	 * Sets on fullscreen.
	 */
	
	function onFullScreen() {
		
		if(document.documentElement.webkitRequestFullScreen)

			document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
			
		else if(document.documentElement.mozRequestFullScreen)
		
			document.documentElement.mozRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
		
		else	
		
			document.documentElement.requestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
	
	}
	
	/*
	 * Buttons listeners.
	 */
	
	function attachNoteListener() {
	
		var newNote = document.querySelector('#new');
		var modeFull = document.querySelector('#fullscreen');
		
		newNote.addEventListener('click', addNote, false);	
		modeFull.addEventListener('click', onFullScreen, false);
	
	}
	
	/*
	 * Note listeners.
	 */
	
	function attachListeners(note, close, field, footer) {
	
		note.addEventListener('mousedown', onMouseDown, false);
		note.addEventListener('mouseup', onMouseUp, false);
		note.addEventListener('mousemove', onMouseMove, false);
	
		note.addEventListener('click', function(event) {
		
			event.preventDefault();
		
			field.focus();

		}, false);
		
		close.addEventListener('click', function(event) {
		
			event.preventDefault();
			
			closeNote(note, event);
		
		}, false);
		
		field.addEventListener('keyup', function(event) {			
						
			onKeyUp(field, footer, event);
				
		}, false);
			
		note.addEventListener('mouseover', function(event) {
			
			event.preventDefault();
				
			onMouseOver(close);
			
		}, false);
			
		note.addEventListener('mouseout', function(event) {
				
			event.preventDefault();
			
			onMouseOut(close);
			
		}, false);
			
		close.style.display = 'none';
	
	}
	
	/*
	 * Add a new note.
	 */
	
	function addNote() {
		
		id++;
		zIndex++;
		
		var body = document.querySelector('body');
		
		var note = document.createElement('div');
		var close = document.createElement('div');
		var field = document.createElement('div');
		var footer = document.createElement('div');
    		
		note.setAttribute('id', 'note' + id);
		close.setAttribute('id', 'note' + id);
		field.setAttribute('id', 'note' + id);
		field.setAttribute('contenteditable', true);
			
		note.classList.add('note');
		close.classList.add('close');
		field.classList.add('field');
		footer.classList.add('footer');
		
		note.style.zIndex = zIndex;
			
		note.appendChild(close);
		note.appendChild(field);
		note.appendChild(footer);
		body.appendChild(note);
		
		attachListeners(note, close, field, footer);
		
		var data = JSON.parse(localStorage['data']);
		
		// Save the current note's data
		data.push({
		
			id: id,
			text: '',
			position: { x: 20, y: 20 },
			zIndex: zIndex,
			
			time: { 
			
				day: new Date().getDate(), 
				month: new Date().getMonth() + 1, 
				year: new Date().getFullYear(), 
				h: new Date().getHours(), 
				m: new Date().getMinutes(), 
				s: new Date().getSeconds() 
				
			}
		
		});
		
		localStorage['data'] = JSON.stringify(data);
		
	}
	
	/*
	 * Load notes.
	 */
	
	function loadNotes() {
	
		[].forEach.call(JSON.parse(localStorage['data']), function(data, index) {
		
			var body = document.querySelector('body');
		
			var note = document.createElement('div');
			var close = document.createElement('div');
			var field = document.createElement('div');
			var footer = document.createElement('div');
    		
			note.setAttribute('id', 'note' + data.id);
			close.setAttribute('id', 'note' + data.id);
			field.setAttribute('id', 'note' + data.id);
			field.setAttribute('contenteditable', true);
			
			note.classList.add('note');
			close.classList.add('close');
			field.classList.add('field');
			footer.classList.add('footer');
		
			note.style.left = data.position.x;
			note.style.top = data.position.y;
			note.style.zIndex = data.zIndex;
			
			field.innerHTML = '<strong>' + data.text + '</strong>';
			footer.innerHTML = 'Last Modified: ' + data.time.day + '/' + data.time.month + '/' + data.time.year + ' ' + data.time.h + ':' + data.time.m + ':' + data.time.s;
	
			note.appendChild(close);
			note.appendChild(field);
			note.appendChild(footer);
			body.appendChild(note);
		
			attachListeners(note, close, field, footer);
		
		});
	
	}
	
	/*
	 * On key up event.
	 */
	
	function onKeyUp(field, footer, event) {
	
		target = getNote(event);
			
		var data = JSON.parse(localStorage['data']);
					
		var day = data[(event.target.id).match(/\d+/)].time.day = new Date().getDate();
		var month = data[(event.target.id).match(/\d+/)].time.month = new Date().getMonth() + 1;
		var year = data[(event.target.id).match(/\d+/)].time.year = new Date().getFullYear();
		var hours = data[(event.target.id).match(/\d+/)].time.h = new Date().getHours();
		var minutes = data[(event.target.id).match(/\d+/)].time.m = new Date().getMinutes();
		var seconds = data[(event.target.id).match(/\d+/)].time.s = new Date().getSeconds();
			
		data[(event.target.id).match(/\d+/)].text = field.innerHTML;
			
		footer.innerHTML = 'Last Modified: ' + day + '/' + month + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds;
		
		localStorage['data'] = JSON.stringify(data);
	
	}
	
	/*
	 * Close note.
	 */
	
	function closeNote(note, event) {
	
		target = getNote(event);
			
		note.classList.add('closeAnimation');
			
		// Wait for animation end...	
		setTimeout(function() {
			
			var data = JSON.parse(localStorage['data']);
			
			// Delete note from array
			data.splice((event.target.id).match(/\d+/), 1);
			
			id = zIndex = data.length - 1;
					
			var body = document.querySelector('body');
			
			// Remove note from DOM
			body.removeChild(target);
			
			// Reset id & zIndex
			for(var index = 0; index < data.length; index++) {
			
				data[index].id = 'note' + index;
				data[index].zIndex = index;

			}
			
			[].slice.call(document.querySelectorAll('.note')).forEach(function(elem, value) {
				
				elem.setAttribute('id', 'note' + value);
				
			});
			
			[].slice.call(document.querySelectorAll('.close')).forEach(function(elem, value) {
		
				elem.setAttribute('id', 'note' + value);
	
			});
			
			[].slice.call(document.querySelectorAll('.field')).forEach(function(elem, value) {
		
				elem.setAttribute('id', 'note' + value);
				
			});
			
			localStorage['data'] = JSON.stringify(data);
			
		}, 600);
	
	}
	
	/*
	 * Mouse down event.
	 */
	
	function onMouseDown(event) {
	
		event.preventDefault();
	
		target = getNote(event);
		
		mouse.x = event.pageX - target.offsetLeft;
		mouse.y = event.pageY - target.offsetTop;
		
		var data = JSON.parse(localStorage['data']);
		
		[].slice.call(document.querySelectorAll('.note')).forEach(function(elem, value) {
		
			data[value].zIndex = elem.style.zIndex = 0;
		
		});
		
		target.style.zIndex = 99999;
		
		data[(event.target.id).match(/\d+/)].zIndex = 99999;
		
		localStorage['data'] = JSON.stringify(data);
		
		drag = true;
	
	}
	
	/*
	 * Mouse up event.
	 */
	
	function onMouseUp(event) {
		
		event.preventDefault();
		
		if(drag)
										
			drag = false;
		
	}
	
	/*
	 * Mouse move event.
	 */
	
	function onMouseMove(event) {
	
		event.preventDefault();
	
		if(drag) {
			
			var paddingX = (event.pageX - mouse.x) + 'px';
			var paddingY = Math.min(event.pageY - mouse.y, innerHeight - 250 * 1.6) + 'px';
			
			target.style.left = paddingX;
			target.style.top = paddingY;
			
			var data = JSON.parse(localStorage['data']);
			
			data[(event.target.id).match(/\d+/)].position.x = target.style.left;
			data[(event.target.id).match(/\d+/)].position.y = target.style.top;
		
			localStorage['data'] = JSON.stringify(data);
						
		}
	
	}
	
	/*
	 * Mouse over event.
	 */
	
	function onMouseOver(close) {
			
		close.style.display = 'block';
	
	}
	
	/*
	 * Mouse out event.
	 */
	
	function onMouseOut(close) {
			
		close.style.display = 'none';
	
	}
	
	window.addEventListener ? window.addEventListener('load', init, false) : window.onload = init;

})(self);