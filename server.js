(function() {
	'use strict';

	var express = require('express');

	var PORT = process.env.PORT || 8080;

	var app = express();

	function render(req, res) {
		console.log('page should render!');

		res.send('RENDER');
	}

	app.use(express.static('public'));

	app.get('/', render);
	app.get('/*', function(req, res) {
	  res.status(404).render('404.ejs');
	});

	app.listen(PORT, function() {
		console.log('Listening on port', PORT);
	});

})();
