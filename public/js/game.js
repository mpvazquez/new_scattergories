(function() {
	'use strict';

	var gameLetter;

	function renderCategoryList(data) {
		try {
			var json = JSON.parse(data);

			json.forEach(function(listItem, index) {
				var label = document.getElementById('category-item-' + index);

				label.textContent = listItem;
			});
		} catch (error) {
			console.error(error);
		}
	}

	function fetchCategoryList() {
		var xhr = new XMLHttpRequest();
		var url = '/get-category';

		xhr.open('GET', url, true);
		xhr.responseType = 'text';
		xhr.onreadystatechange = function() {
			if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
				renderCategoryList(xhr.responseText);
			}
		}
		xhr.send();
	}

	document.addEventListener("DOMContentLoaded", function() {
		var letterContainer = document.getElementById('game-letter');
		var rollButton = document.getElementById('roll-die-button');
		var timerButton = document.getElementById('timer-button');

		timerButton.disabled = true;

		rollButton.addEventListener('click', function(event) {
			event.preventDefault();
			fetchCategoryList();

			var alphabet = 'abcdefghijklmnopqrstuvwxyz';
			var randomNumber = Math.floor(Math.random() * alphabet.length);

			gameLetter = alphabet.charAt(randomNumber);
			letterContainer.appendChild(document.createTextNode(gameLetter));
			rollButton.disabled = true;
			timerButton.disabled = false;
		});

		timerButton.addEventListener('click', function(event) {
			event.preventDefault();

			var categoryContainer = document.getElementById('category-container');
			var timerCount = 120;

			categoryContainer.classList.remove('blur-text');

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
