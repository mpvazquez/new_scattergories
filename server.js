(function() {
	'use strict';

	var express = require('express');

	var CATEGORY_LIST = require('./db/category-lists.json');

	var PORT = process.env.PORT || 8080;

	var app = express();

	function getCategory() {
		var randomNumber = Math.floor(Math.random() * CATEGORY_LIST.data.length);
		return CATEGORY_LIST.data[randomNumber];
	}

	function renderGame(req, res) {

		res.render('game.ejs', {
			categoryList: getCategory()
		});
	}

	function renderIndex(req, res) {
		res.render('index.ejs', {});
	}

	app.use(express.static('public'));

	app.get('/', renderIndex);
	app.get('/game', renderGame);
	app.get('/get-category', getCategory);
	app.get('/*', function(req, res) {
	  res.status(404).render('404.ejs');
	});

	app.listen(PORT, function() {
		console.log('Listening on port', PORT);
	});

})();
