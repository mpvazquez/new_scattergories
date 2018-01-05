(function() {
	'use strict';

	var express = require('express');

	var PORT = process.env.PORT || 8080;

	var app = express();

	function renderGame(req, res) {
		res.render('game.ejs', {});
	}

	function renderIndex(req, res) {
		res.render('index.ejs', {});
	}

	app.use(express.static('public'));

	app.get('/', renderIndex);
	app.get('/game', renderGame);
	app.get('/*', function(req, res) {
	  res.status(404).render('404.ejs');
	});

	app.listen(PORT, function() {
		console.log('Listening on port', PORT);
	});

})();
