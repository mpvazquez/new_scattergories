(function() {
	'use strict';

	var xhr = new XMLHttpRequest();

	var round = {
		answers: [],	
		answerDetails: [],
		gameLetter: null,
		number: null
	}

	var inputs;
	var rollButton;
	var timerButton;

	var ERROR_MESSAGES = {
		duplicate: 'Your answer cannot be used twice this round',
		empty: 'Your answer cannot be left blank',
		length: 'Your answer must be at least two letters or longer',
		letter: 'Your answer must begin with this round\'s letter',
		spell: 'Your answer must be spelled correctly',
		default: 'Your answer is accepted!'
	}

	function checkSpellingAPI(el) {
		var value = el.value.trim().toLowerCase();
		var url = '/validate/' + value;

		xhr.open('GET', url, true);
		xhr.responseType = 'text';
		xhr.onreadystatechange = function() {
			if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
				var data = JSON.parse(xhr.responseText).data;
				var isValid = !data.length;
				var errorType = isValid ? 'default' : 'spell';
				var pointValue = 0;

				if (value.split(' ').length > 1) {
					pointValue += scoreAlliteration(value);
				}

				if (isValid) {
					pointValue++;
					round.answers.push(value);
				}

				validateInputEl({
					el: el,
					isValid: isValid,
					message: ERROR_MESSAGES[errorType],
					pointValue: pointValue
				});
			}
		};
		xhr.send();
	}

	function endGame() {
		var gameMessageNode = document.getElementById('game-message');
		var nextRoundLink = document.getElementById('next-round-link');
		var roundScoreNode = document.getElementById('round-score');
		var totalScoreNode = document.getElementById('total-score');

		var nextRoundHref = '/game/';
		var totalScore = round.answers.length;

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

		roundScoreNode.textContent = round.answers.length;
		totalScoreNode.textContent = totalScore;
	}

	function selectNextInput(el) {
		var nextId = Number(el.dataset.index) + 1;
		var idSelector = 'category-input-' + nextId;

		if (nextId < 12) {
			document.getElementById(idSelector).focus();
		}
	}

	function scoreAlliteration(value) {
		var splitValue = value.toLowerCase().split(' ');
		var score = 0;

		for(var i = 1; i < splitValue.length; i++) {
			if (splitValue[0][0] === splitValue[i][0]) {
				score++;
			}
		}
		return score;
	}

	function startGame() {
		var gameScore = document.getElementById('game-score');

		inputs = document.getElementsByClassName('category-input');
		rollButton = document.getElementById('roll-die-button');
		timerButton = document.getElementById('timer-button');

		round.number = Number(document.getElementById('game-round').dataset.round);

		if (typeof Storage !== undefined) {
			var score = sessionStorage.getItem('score') || '0';

			if (round === 1) {
				score = '0';
				sessionStorage.setItem('score', score);
			}

			gameScore.textContent = score;
		} else {
			document.getElementById('game-score-container').remove();

			console.error('Sorry, local web storage is not supported on your browser!');
		}

		for (var i = 0; i < inputs.length; i++) {
			inputs[i].addEventListener('blur', function(event) {
					validateValue(event.currentTarget);
			});

			inputs[i].addEventListener('keydown', function(event) {
				var returnKeyCode = event.keyCode === 13;

				if (returnKeyCode) {
					selectNextInput(event.currentTarget);
				}
			});
		}

		rollButton.addEventListener('click', startRoll);

		timerButton.addEventListener('click', startTimer);
	}

	function startRoll(event) {
		event.preventDefault();

		var alphabet = 'abcdefghijklmnopqrstuvwyz';
		var randomNumber = Math.floor(Math.random() * alphabet.length);
		var gameDetailsRight = document.getElementById('game-details-container-right');
		var letterContainer = document.getElementById('game-letter');

		round.gameLetter = alphabet.charAt(randomNumber);

		var gameLetterMessage = 'Letter: ' + round.gameLetter.toUpperCase();

		gameDetailsRight.classList.add('active-game-letter');

		letterContainer.appendChild(document.createTextNode(gameLetterMessage));
		rollButton.disabled = true;
		timerButton.disabled = false;
	}

	function startTimer(event) {
		event.preventDefault();

		var categoryContainer = document.getElementById('category-container');
		var firstInput = document.getElementById('category-input-0');
		var gameTimer = document.getElementById('game-timer');
		var timerCount = 120;

		categoryContainer.classList.remove('blur-text');

		toggleDisabledInputs(false);
		timerButton.disabled = true;

		var timer = setInterval(function() {
			timerCount -= 1;
			gameTimer.textContent = timerCount;

			if (timerCount === 0) {
				clearInterval(timer);
				toggleDisabledInputs(true);

				endGame();
			}
		}, 1000);

		// start game by selecting the first input
		firstInput.focus();
	}

	function toggleDisabledInputs(boolean) {
		for (var i = 0; i < inputs.length; i++) {
			inputs[i].disabled = boolean;
		}
	}

	function validateInputEl(inputData) {
		var color = 'red';
		var element = inputData.el;
		var messageEl = document.getElementById('category-input-message-' + element.dataset.index);

		console.log(inputData.pointValue)

		if (inputData.isValid) {
			color = 'green';
			messageEl.classList.remove('active');
		} else {
			messageEl.classList.add('active');
		}

		messageEl.textContent = inputData.message;
		element.style['border-color'] = color;
	}

	function validateValue(el) {
		var value = el.value.trim().toLowerCase();
		var errorType = 'accepted';

		var isDuplicate = round.answers.includes(value);
		var isEmpty = !value;
		var isValidLetter = !isEmpty && value[0] === round.gameLetter.toLowerCase();
		var isValidLength = !isEmpty && value.length > 1;

		var isValid = !isEmpty && isValidLetter && isValidLength && !isDuplicate;

		if (!isValidLetter) {
			errorType = 'letter';
		}
		if (!isValidLength) {
			errorType = 'length';
		}
		if (isDuplicate) {
			errorType = 'duplicate';
		}
		if (isEmpty) {
			errorType = 'empty';
		}

		if (isValid) {
			checkSpellingAPI(el);
		} else {
			validateInputEl({
				el: el,
				isValid: isValid,
				message: ERROR_MESSAGES[errorType],
				pointValue: 0
			});
		}
	}

	document.addEventListener("DOMContentLoaded", startGame);

})();
