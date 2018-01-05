(function() {
	'use strict';

	var gameLetter;

	document.addEventListener("DOMContentLoaded", function() {
		var letterContainer = document.getElementById('game-letter');
		var rollButton = document.getElementById('roll-die-button');
		var timerButton = document.getElementById('timer-button');

		timerButton.disabled = true;

		rollButton.addEventListener('click', function(event) {
			event.preventDefault();

			var alphabet = 'abcdefghijklmnopqrstuvwxyz';
			var randomNumber = Math.floor(Math.random() * alphabet.length);

			gameLetter = alphabet.charAt(randomNumber);
			letterContainer.appendChild(document.createTextNode(gameLetter));
			rollButton.disabled = true;
			timerButton.disabled = false;
		});

		timerButton.addEventListener('click', function(event) {
			event.preventDefault();

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
