(function() {
	'use strict';

	var express = require('express');
	var request = require('request-promise');
	var spell = require('spell-checker-js');

	var CATEGORY_LIST = require('./db/category-lists.json');

	var PORT = process.env.PORT || 8080;

	var app = express();

	spell.load('en');

	function getCategory() {
		var randomIndex = Math.floor(Math.random() * CATEGORY_LIST.data.length);
		return CATEGORY_LIST.data[randomIndex];
	}

	function getScore(req, res) {
		
	}

	function renderGame(req, res) {
		res.render('game.ejs', {
			categoryList: getCategory()
		});
	}

	function renderWelcome(req, res) {
		res.render('index.ejs', {});
	}

	function validate(req, res) {
		var input = req.params.input;

		res.json({
			data: spell.check(input)
		});
	}

	app.use(express.static('public'));

	app.get('/', renderWelcome);
	app.get('/game', renderGame);
	app.get('/get-score', getScore);
	app.get('/validate/:input', validate);
	app.get('/*', function(req, res) {
	  res.status(404).render('404.ejs');
	});

	app.listen(PORT, function() {
		console.log('Listening on port', PORT);
	});

})();
