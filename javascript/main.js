// GLOBAL VARIABLES

var NOTES = ""
const STATS_ORDER = [
	'TOI', 'Shifts', 'TOI/shift', 
	'Goals', 'Assists', 'Plus', 'Minus', 
	'Shots', 'Blocked Shots', 'Off-target Shots', 
	'Faceoff Wins', 'Faceoff Losses', 'Hits'
];
const STATS_LENGTH = STATS_ORDER.length;
var STATS = {};
for (var i = 0; i < STATS_LENGTH; i++) {STATS[STATS_ORDER[i]] = 0;}
var start_time = 0;
var on_ice = false;


// Functions

function get_time() {
	var d = new Date();
	return Math.round(d.getTime() / 1000);  // Convert milliseconds to seconds
}


function update_output() {
	var output = "";
	for (var i = 0; i < STATS_LENGTH; i++) {
		var stat = STATS_ORDER[i];
		output += stat + ": " + STATS[stat].toString() + "<br/>";
	}
	output += "<br/>" + NOTES;
	document.getElementById("output").innerHTML = output;
}


function submit_note() {
	var note = document.getElementById("note").value;
	NOTES += "- " + note + "<br/>";
	document.getElementById("note").value = "";
	update_output();
}


function increment_stat(stat_name) {
	if (on_ice) {
		STATS[stat_name] += 1;
		update_output();
	}
}

function start_shift() {
	if (!on_ice) {
		start_time = get_time();
		on_ice = true;
	}
}


function stop_shift() {
	if (on_ice) {
		STATS['TOI'] += get_time() - start_time;
		increment_stat("Shifts");
		STATS['TOI/shift'] = STATS['TOI'] / STATS['Shifts'];
		update_output();
		on_ice = false;
	}
}


// Key bindings

document.onkeydown = function (e) {
	e = e || window.event;
	switch (e.which || e.keyCode) {
		case 13 : // 13 is Enter
			submit_note();
	}
}
