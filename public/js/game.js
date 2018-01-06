(function() {
	'use strict';

	var xhr = new XMLHttpRequest();

	var gameLetter;

	function markInputBorder(el, isValid) {
		var color = 'red';
		if (isValid) {
			color = 'green';
		}
		el.style['border-color'] = color;
	}

	function selectNextInput(el) {
		var nextId = Number(el.id.slice(15, el.id.length)) + 1;
		var idSelector = 'category-input-' + nextId;

		if (nextId < 12) {
			var nextInput = document.getElementById(idSelector);
			nextInput.focus();
		}

	}

	function toggleInputs(inputs, boolean) {
		for (var i = 0; i < inputs.length; i++) {
			inputs[i].disabled = boolean;
		}
	}

	function validateInput(event) {
		var domEl = event.currentTarget;
		var url = '/validate/' + event.currentTarget.value;

		xhr.open('GET', url, true);
		xhr.responseType = 'text';
		xhr.onreadystatechange = function() {
			if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
				var data = JSON.parse(xhr.responseText).data;

				markInputBorder(domEl, !data.length);
			}
		}
		xhr.send();
	}

	document.addEventListener("DOMContentLoaded", function() {
		var categoryInputs = document.getElementsByClassName('category-input');
		var letterContainer = document.getElementById('game-letter');
		var rollButton = document.getElementById('roll-die-button');
		var timerButton = document.getElementById('timer-button');

		for (var i = 0; i < categoryInputs.length; i++) {
			categoryInputs[i].addEventListener('keydown', function(event) {
				var enterKeyCode = event.keyCode === 13;
				var value = event.currentTarget.value;

				if (enterKeyCode) {
					// validate input
					if (value[0] && value[0].toLowerCase() === gameLetter.toLowerCase() && value.length > 1) {
						validateInput(event);
					} else {
						markInputBorder(event.currentTarget, false);
					}

					// select next input, if there is one
					selectNextInput(event.currentTarget);
				}
			});
			categoryInputs[i].addEventListener('focus', function(event) {
				// console.log(event);
			});
		}

		rollButton.addEventListener('click', function(event) {
			event.preventDefault();

			var alphabet = 'abcdefghijklmnopqrstuvwxyz';
			var randomNumber = Math.floor(Math.random() * alphabet.length);

			gameLetter = alphabet.charAt(randomNumber);
			letterContainer.appendChild(document.createTextNode(gameLetter.toUpperCase()));
			rollButton.disabled = true;
			timerButton.disabled = false;
		});

		timerButton.addEventListener('click', function(event) {
			event.preventDefault();

			var categoryContainer = document.getElementById('category-container');
			var timerCount = 120;

			categoryContainer.classList.remove('blur-text');

			toggleInputs(categoryInputs, false);

			var timer = setInterval(function() {
				timerCount -= 1;

				timerButton.textContent = timerCount;

				if (timerCount < 0) {
					timerButton.textContent = 'Expired!';
					timerButton.disabled = true;
					clearInterval(timer);

					toggleInputs(categoryInputs, true);
				}
			}, 1000);
		});
	});

})();
