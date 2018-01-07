(function() {
	'use strict';

	var xhr = new XMLHttpRequest();

	var answerList = [];
	var gameLetter;
	var round = null;

	function endGame() {
		var gameMessageNode = document.getElementById('game-message');
		var nextRoundHref = '/game/';
		var nextRoundLink = document.getElementById('next-round-link');
		var roundScoreNode = document.getElementById('round-score');
		var totalScoreNode = document.getElementById('total-score');
		var totalScore = answerList.length;

		if (typeof Storage !== undefined) {
			var pastScore = sessionStorage.getItem('score');
			totalScore += Number(pastScore);
			sessionStorage.setItem('score', totalScore);
		}

		if (round < 3) {
			nextRoundHref += (round + 1);
		} else {
			var nextChildButton = document.getElementById('next-round-button');

			nextChildButton.textContent = "New Game";
			nextRoundHref += 1;
			if (typeof Storage !== undefined) {
				sessionStorage.removeItem('score');
			}
		}

		gameMessageNode.classList = 'active';
		nextRoundLink.setAttribute('href', nextRoundHref);

		roundScoreNode.textContent = answerList.length;
		totalScoreNode.textContent = totalScore;
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
		var nextId = Number(el.dataset.category) + 1;
		var idSelector = 'category-input-' + nextId;

		if (nextId < 12) {
			document.getElementById(idSelector).focus();
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
		var gameScore = document.getElementById('game-score');
		var letterContainer = document.getElementById('game-letter');
		var rollButton = document.getElementById('roll-die-button');
		var timerButton = document.getElementById('timer-button');

		round = Number(document.getElementById('game-round').dataset.round);

		if (typeof Storage !== undefined) {
			var score = sessionStorage.getItem('score') || '0';

			gameScore.textContent = score;
		} else {
			document.getElementById('game-score-container').remove();

			console.error('Sorry, local web storage is not supported on your browser!');
		}

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
			var gameDetailsRight = document.getElementById('game-details-container-right');

			gameLetter = alphabet.charAt(randomNumber);

			var gameLetterMessage = 'Letter: ' + gameLetter.toUpperCase();

			gameDetailsRight.classList.add('active-game-letter');

			letterContainer.appendChild(document.createTextNode(gameLetterMessage));
			rollButton.disabled = true;
			timerButton.disabled = false;
		});

		timerButton.addEventListener('click', function(event) {
			event.preventDefault();

			var categoryContainer = document.getElementById('category-container');
			var firstInput = document.getElementById('category-input-0');
			var gameTimer = document.getElementById('game-timer');
			var timerCount = 120;

			categoryContainer.classList.remove('blur-text');

			toggleInputs(categoryInputs, false);
			timerButton.disabled = true;

			var timer = setInterval(function() {
				timerCount -= 1;

				gameTimer.textContent = timerCount;

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
