(function() {
	'use strict';

	var xhr = new XMLHttpRequest();

	var round = {
		answers: [],
		gameLetter: null,
		number: null
	}

	var inputs;
	var rollButton;
	var timerButton;

	var ERROR_MESSAGES = {
		default: 'Your answer is valid!',
		duplicate: 'Your answer was already used this round',
		empty: 'Your answer cannot be left blank',
		length: 'Your answer must be at least two letters or longer',
		letter: 'Your answer must begin with this round\'s letter',
		spell: 'Your answer must be spelled correctly'
	}

	function checkDuplicates(value) {
		var isDuplicate = false;
		for (var i = 0; i < round.answers.length; i++) {
			if (round.answers[i].value === value) {
				return true;
			}
		}
		return isDuplicate;
	}

	function endGame() {
		var gameMessageNode = document.getElementById('game-message');
		var nextRoundLink = document.getElementById('next-round-link');
		var roundScoreNode = document.getElementById('round-score');
		var totalScoreNode = document.getElementById('total-score');

		var nextHref = '/game/';
		var totalScore = scoreTotalPoints();

		if (typeof Storage !== undefined) {
			var pastScore = sessionStorage.getItem('score');
			totalScore += Number(pastScore);
			sessionStorage.setItem('score', totalScore);
		}

		if (round.number < 3) {
			nextHref += (round.number + 1);
		} else {
			var nextButton = document.getElementById('next-round-button');

			nextButton.textContent = "New Game";
			nextHref += 1;
			if (typeof Storage !== undefined) {
				sessionStorage.removeItem('score');
			}
		}

		gameMessageNode.classList.add('active');
		nextRoundLink.setAttribute('href', nextHref);

		roundScoreNode.textContent = scoreTotalPoints();
		totalScoreNode.textContent = totalScore;
	}

	function selectNextInput(el) {
		var nextId = Number(el.dataset.index) + 1;
		var idSelector = 'category-input-' + nextId;

		if (nextId < 12) {
			document.getElementById(idSelector).focus();
		}
	}

	function scoreTotalPoints() {
		var points = 0;
		for (var i = 0; i < round.answers.length; i++) {
			points += round.answers[i].pointValue;
		}
		return points;
	}

	function scoreValuePoints(value) {
		var splitValue = value.toLowerCase().split(' ');
		var score = 0;

		for(var i = 0; i < splitValue.length; i++) {
			if (round.gameLetter === splitValue[i][0]) {
				score++;
			}
		}
		return score;
	}

	function spellCheckAPI(value) {
		return new Promise(function(resolve, reject) {
			var url = '/validate/' + value;

			xhr.open('GET', url, true);
			xhr.responseType = 'text';
			xhr.onreadystatechange = function() {
				if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
					return resolve(JSON.parse(xhr.responseText).data);
				}
			};
			xhr.send();
		});
	}

	function startGame() {
		inputs = document.getElementsByClassName('category-input');
		rollButton = document.getElementById('roll-die-button');
		timerButton = document.getElementById('timer-button');

		round.number = Number(document.getElementById('game-round').dataset.round);

		if (typeof Storage !== undefined) {
			var gameScore = document.getElementById('game-score');
			var score = sessionStorage.getItem('score') || '0';

			if (round.number === 1) {
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
				validateInput(event.currentTarget);
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
		var letterContainer = document.getElementById('game-letter');

		round.gameLetter = alphabet.charAt(randomNumber);

		var gameLetterMessage = 'Letter: ' + round.gameLetter.toUpperCase();

		letterContainer.classList.add('active');
		letterContainer.textContent = gameLetterMessage;
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

	function updateInputEl(el, inputData) {
		var color = 'red';
		var messageEl = document.getElementById('category-input-message-' + el.dataset.index);

		if (inputData.isValid) {
			color = 'green';
			messageEl.classList.remove('active');
		} else {
			messageEl.classList.add('active');
		}

		messageEl.textContent = ERROR_MESSAGES[inputData.errorType];
		el.style['border-color'] = color;

		updateRoundInfo(inputData);
	}

	function updateRoundInfo(inputData) {
		var currentIndex = inputData.index;

		for (var i = 0; i < round.answers.length; i++) {
			if (round.answers[i].index === currentIndex) {
				round.answers[currentIndex] = inputData;
				return;
			}
		}
		
		round.answers.push(inputData);
	}

	async function validateInput(el) {
		var value = el.value.trim().toLowerCase();
		var errorType = 'default';
		var pointValue = 0;

		var isDuplicate = checkDuplicates(value);
		var isEmpty = !value;
		var isValidLetter = !isEmpty && value[0] === round.gameLetter.toLowerCase();
		var isValidLength = !isEmpty && value.length > 1;

		var isValid = !isEmpty && !isDuplicate && isValidLength && isValidLetter;

		if (!isValidLength) errorType = 'length';
		if (!isValidLetter) errorType = 'letter';
		if (isDuplicate) errorType = 'duplicate';
		if (isEmpty) errorType = 'empty';

		if (isValid) {
			var apiRepsonse = await spellCheckAPI(value);

			if (!apiRepsonse.length) {
				pointValue += scoreValuePoints(value);
			} else {
				errorType = 'spell';
				isValid = true;
			}
		}

		updateInputEl(el, {
			index: Number(el.dataset.index),
			isValid: isValid,
			errorType: errorType,
			pointValue: pointValue,
			value: value
		});
	}

	document.addEventListener("DOMContentLoaded", startGame);

})();
