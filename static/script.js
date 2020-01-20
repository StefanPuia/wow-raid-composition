/*jslint browser: true */
/*global window */

'use strict';

let classes = {};
let raiders = [];
let storage = 'local';

window.addEventListener('load', function() {
	callServer('/api/classes', {}, function(err, classData) {
		if(err) throw err;
		classes = classData;

		Object.keys(classes).sort().forEach(function(key) {
			let c = classes[key];
			$('#playerClass').append(newEl('option', {
				value: key,
				textContent: c.name
			}))
		})

		if(typeof localStorage.localRaiders != 'undefined') {
			raiders = JSON.parse(localStorage.localRaiders);
		}

		let build = getParameterValue('build');
		if(build) {
			callServer('/api/build/' + build, {}, function(err, data) {
				if(err) {
					window.location = "/build";
				}
				else {
					storage = 'server';
					importPlayers(data);
				}
			})
		}
		else {
			loadRaiders();
		}
	})

	$('#playerClass').addEventListener('change', updateSpecs);
	$('#playerAdd').addEventListener('click', addPlayer);
	$('#playerName').addEventListener('keyup', function(e) {if(e.which == 13)addPlayer();})
	$('#showImport').addEventListener('click', showImportBox);
	$('.closeImport').addEventListener('click', closeImportBox);
	$('#import').addEventListener('click', importPlayers);
	$('#export').addEventListener('click', exportPlayers);
	$('#resetComp').addEventListener('click', resetComp);
	$('#saveComp').addEventListener('click', saveComp);

    $("body").addEventListener("click", (e) => {
        handlePlayerClick(e.target);
    });
})