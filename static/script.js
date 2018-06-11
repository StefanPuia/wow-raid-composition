'use strict';

let classes = {};
let raiders = [];

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

		callServer('/api/raiders', {}, function(err, raiderData) {
			if(err) throw err;
			raiders = raiderData;
			loadRaiders(raiders);
		})
	})

	$('#playerClass').addEventListener('change', function() {
		let key = $('#playerClass').value;
		$('#playerSpec option:not([disabled])', true).forEach(function(option) {
			option.remove();
		})
		classes[key].specs.forEach(function(spec, id) {
			$('#playerSpec').append(newEl('option', {
				value: id,
				textContent: spec.name
			}))
		})
	})

	$('#playerAdd').addEventListener('click', addPlayer);
	$('#playerIlvl').addEventListener('keyup', function(e) {if(e.which == 13)addPlayer();})
	$('#playerName').addEventListener('keyup', function(e) {if(e.which == 13)addPlayer();})
	$('#playerMassAdd').addEventListener('click', showMassAdd);
	$('.closemassadd').addEventListener('click', closeMassAdd);
	$('#massAdd').addEventListener('click', massAdd);
})