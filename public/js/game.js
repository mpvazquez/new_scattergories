(function() {
	'use strict';

	var gameLetter;

	document.addEventListener("DOMContentLoaded", function() {
		var gameLetterContainer = document.getElementById('game-letter');
		var rollDieButton = document.getElementById('roll-die-button');
		var timerButton = document.getElementById('timer-button');

		timerButton.disabled = true;

		rollDieButton.addEventListener('click', function() {
			var alphabet = 'abcdefghijklmnopqrstuvwxyz';
			var randomNumber = Math.floor(Math.random() * alphabet.length);

			gameLetter = alphabet.charAt(randomNumber);
			gameLetterContainer.appendChild(document.createTextNode(gameLetter));
			rollDieButton.disabled = true;
			timerButton.disabled = false;
		});

		timerButton.addEventListener('click', function() {
			var timerCount = 120;
			
			var timer = setInterval(function() {
				timerCount -= 1;

				timerButton.textContent = timerCount;

				if (timerCount < 0) {
					timerButton.textContent = 'Expired!';
					timerButton.disabled = true;
					clearInterval(timer);
				}
			}, 1000);
		});
	});

})();
