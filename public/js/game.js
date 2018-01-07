(function() {
	'use strict';

	var xhr = new XMLHttpRequest();

	var answerList = [];
	var gameLetter;

	function endGame() {
		var message = 'Congrats! You scored ' + answerList.length + ' out of 12!';
		var gameMessageNode = document.getElementById('game-message');

		gameMessageNode.classList = 'active';
		gameMessageNode.textContent = message;
	}

	function markInputBorder(el, isValid) {
		var color = 'red';

		if (isValid) {
			color = 'green';
		}

		el.style['border-color'] = color;
	}

	function runLocalValidation(event) {
		var value = event.currentTarget.value;

		// initial input validation for minimum characters, and match gameLetter
		if (!value.length || value[0].toLowerCase() !== gameLetter.toLowerCase() || value.length < 2) {
			markInputBorder(event.currentTarget, false);
		} else {
			validateInput(event);
		}
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
		var value = event.currentTarget.value;
		var url = '/validate/' + value;

		xhr.open('GET', url, true);
		xhr.responseType = 'text';
		xhr.onreadystatechange = function() {
			if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
				var data = JSON.parse(xhr.responseText).data;

				markInputBorder(domEl, !data.length);

				if (!data.length && !answerList.includes(value)) {
					answerList.push(value)
				}
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
					runLocalValidation(event);

					// select next input, if there is one
					selectNextInput(event.currentTarget);
				}
			});

			categoryInputs[i].addEventListener('blur', function(event) {
				runLocalValidation(event);
			})
		}

		rollButton.addEventListener('click', function(event) {
			event.preventDefault();

			var alphabet = 'abcdefghijklmnopqrstuvwxyz';
			var randomNumber = Math.floor(Math.random() * alphabet.length);
			var gameDetailsContainer = document.getElementById('game-details-container');

			gameLetter = alphabet.charAt(randomNumber);

			var gameLetterMessage = 'Letter: ' + gameLetter.toUpperCase();

			gameDetailsContainer.classList.add('active-game-letter');

			letterContainer.appendChild(document.createTextNode(gameLetterMessage));
			rollButton.disabled = true;
			timerButton.disabled = false;
		});

		timerButton.addEventListener('click', function(event) {
			event.preventDefault();

			var categoryContainer = document.getElementById('category-container');
			var gameTimer = document.getElementById('game-timer');
			var firstInput = document.getElementById('category-input-0');
			var timerCount = 120;

			categoryContainer.classList.remove('blur-text');

			toggleInputs(categoryInputs, false);

			var timer = setInterval(function() {
				var gameTimerContainer = document.getElementById('game-timer-container');
				timerCount -= 1;

				gameTimer.textContent = timerCount;
				timerButton.disabled = true;

				if (timerCount === 0) {
					clearInterval(timer);

					toggleInputs(categoryInputs, true);

					endGame();
				}
			}, 1000);

			// start game by selecting the first input
			firstInput.focus();
		});
	});

})();
