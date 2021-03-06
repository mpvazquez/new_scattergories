(function() {
	'use strict';

	var xhr = new XMLHttpRequest();

	var ANSWER_MESSAGES = {
		default: 'Your answer is valid!',
		duplicate: 'Your answer was already used this round',
		empty: 'Your answer cannot be left blank',
		length: 'Your answer must be at least two letters or longer',
		letter: 'Your answer must begin with this round\'s letter',
		spell: 'Your answer must be spelled correctly'
	}

	var round = {
		answers: [],
		gameLetter: null,
		number: null
	}

	var inputs;
	var rollButton;
	var timerButton;

	function calcInputPoints(value) {
		var splitValue = value.split(' ');
		var score = 0;

		for(var i = 0; i < splitValue.length; i++) {
			if (round.gameLetter === splitValue[i][0]) {
				score++;
			}
		}
		return score;
	}
	
	function calcRoundPoints() {
		var points = 0;

		for (var i = 0; i < round.answers.length; i++) {
			points += round.answers[i].points;
		}
		return points;
	}

	function checkDuplicates(inputData) {
		var isDuplicate = false;

		for (var i = 0; i < round.answers.length; i++) {
			if (round.answers[i].value === inputData.value && i !== inputData.index) {
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
		var totalScore = calcRoundPoints();

		if (typeof Storage !== undefined) {
			var pastScore = sessionStorage.getItem('score');
			var usedLetters = JSON.parse(sessionStorage.getItem('letters')) || [];

			totalScore += Number(pastScore);
			sessionStorage.setItem('score', totalScore);

			usedLetters.push(round.gameLetter);
			sessionStorage.setItem('letters', JSON.stringify(usedLetters));
		}

		if (round.number < 3) {
			nextHref += (round.number + 1);
		} else {
			var nextButton = document.getElementById('next-round-button');

			nextButton.textContent = "New Game";
			nextHref += 1;
			if (typeof Storage !== undefined) {
				sessionStorage.clear();
			}
		}

		gameMessageNode.classList.add('active');
		nextRoundLink.setAttribute('href', nextHref);

		roundScoreNode.textContent = calcRoundPoints();
		totalScoreNode.textContent = totalScore;
	}

	function getLetter() {
		// excludes the letters: "q", "u", "v", "x", and "z"
		var alphabet = 'abcdefghijklmnoprstwy';

		if (typeof Storage !== undefined) {
			var usedLetters = sessionStorage.getItem('letters') || [];

			if (typeof usedLetters === 'string') {
				usedLetters = JSON.parse(usedLetters);
			}

			if (usedLetters.length) {
				alphabet = alphabet.split('');

				for (var i = 0; i < usedLetters.length; i++) {
					if (alphabet.includes(usedLetters[i])) {
						var indexOf = alphabet.indexOf(usedLetters[i]);
						alphabet.splice(indexOf, 1);
					}
				}
				alphabet = alphabet.join('');
			}
		}

		var randomIndex = Math.floor(Math.random() * alphabet.length);

		return alphabet.charAt(randomIndex);
	}

	function selectNextInput(el) {
		var nextId = Number(el.dataset.index) + 1;
		var idSelector = 'category-input-' + nextId;

		if (nextId < 12) {
			document.getElementById(idSelector).focus();
		} else {
			document.activeElement.blur();
		}
	}

	function setCurrentScore() {
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
	}

	function setEventListeners() {
		rollButton = document.getElementById('roll-button');
		timerButton = document.getElementById('timer-button');

		rollButton.addEventListener('click', startRoll);
		timerButton.addEventListener('click', startTimer);

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
	}

	function spellCheckAPI(value) {
		return new Promise(function(resolve, reject) {
			var url = '/validate/' + value;

			xhr.open('GET', url, true);
			xhr.responseType = 'text';
			xhr.onreadystatechange = function() {
				if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
					resolve(JSON.parse(xhr.responseText).data);
				}
			};
			xhr.send();
		});
	}

	function startGame() {
		inputs = document.getElementsByClassName('category-input');

		round.number = Number(document.getElementById('game-round').dataset.round);

		setCurrentScore();
		setEventListeners();
	}

	function startRoll(event) {
		event.preventDefault();

		var letterContainer = document.getElementById('game-letter');

		round.gameLetter = getLetter();

		letterContainer.classList.add('active');
		letterContainer.textContent = 'Letter: ' + round.gameLetter.toUpperCase();
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

				document.activeElement.blur();
				setTimeout(endGame, 50);
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

		messageEl.textContent = ANSWER_MESSAGES[inputData.status];
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
		var inputData = {
			index: Number(el.dataset.index),
			isValid: false,
			points: 0,
			status: 'default',
			value: el.value.trim().toLowerCase()
		}

		var isDuplicate = checkDuplicates(inputData);
		var isEmpty = !inputData.value;
		var isValidLetter = !isEmpty && inputData.value[0] === round.gameLetter.toLowerCase();
		var isValidLength = !isEmpty && inputData.value.length > 1;

		inputData.isValid = !isEmpty && !isDuplicate && isValidLength && isValidLetter;

		if (!isValidLength) inputData.status = 'length';
		if (!isValidLetter) inputData.status = 'letter';
		if (isDuplicate) inputData.status = 'duplicate';
		if (isEmpty) inputData.status = 'empty';

		if (inputData.isValid) {
			var apiRepsonse = await spellCheckAPI(inputData.value);

			if (!apiRepsonse.length) {
				inputData.points += calcInputPoints(inputData.value);
			} else {
				inputData.status = 'spell';
				inputData.isValid = !inputData.isValid;
			}
		}

		updateInputEl(el, inputData);
	}

	document.addEventListener("DOMContentLoaded", startGame);

})();
