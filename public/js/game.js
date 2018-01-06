(function() {
	'use strict';

	var gameLetter;

	function toggleInput(boolean) {
		var categoryInputs = document.getElementsByClassName('category-input');

		for (var i = 0; i < categoryInputs.length; i++) {
			categoryInputs[i].disabled = boolean;
		}
	}

	document.addEventListener("DOMContentLoaded", function() {
		var letterContainer = document.getElementById('game-letter');
		var rollButton = document.getElementById('roll-die-button');
		var timerButton = document.getElementById('timer-button');

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

			toggleInput(false);

			var timer = setInterval(function() {
				timerCount -= 1;

				timerButton.textContent = timerCount;

				if (timerCount < 0) {
					timerButton.textContent = 'Expired!';
					timerButton.disabled = true;
					clearInterval(timer);

					toggleInput(true);
				}
			}, 1000);
		});
	});

})();
