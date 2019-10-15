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
	output += "<br/><span class='bold'>Notes</span>:<br/>" + NOTES;
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
		document.getElementById("ice").innerHTML = 'on ice';
	}
}


function stop_shift() {
	if (on_ice) {
		STATS['TOI'] += get_time() - start_time;
		increment_stat("Shifts");
		STATS['TOI/shift'] = Math.round(STATS['TOI'] / STATS['Shifts']);
		update_output();
		on_ice = false;
		document.getElementById("ice").innerHTML = 'off ice';
	}
}


// Key bindings

document.onkeydown = function (e) {
	e = e || window.event;
	switch (e.which || e.keyCode) {
		case 13 : // Submit note, Enter
			submit_note(); break;
		case 83 : // Start shift, s
			start_shift(); break;
		case 69 : // Stop shift, e
			stop_shift(); break;
		case 87 : // Faceoff win, w
			if (!on_ice) {start_shift(); increment_stat('Faceoff Wins');} break;
		case 76 : // Faceoff loss, l
			if (!on_ice) {start_shift(); increment_stat('Faceoff Losses');} break;
		case 71 : // Goal, g
			increment_stat('Goals'); increment_stat('Plus'); stop_shift(); break;
		case 65 : // Assist, a
			increment_stat('Assists'); increment_stat('Plus'); stop_shift(); break;
		case 80 : // Plus, p
			increment_stat('Plus'); stop_shift(); break;
		case 77 : // Minus, m
			increment_stat('Minus'); stop_shift(); break;
		case 88 : // Shot, x
			increment_stat('Shots'); break;
		case 66 : // Blocked shot, b
			increment_stat('Blocked Shots'); break;
		case 79 : // Offtarget shot, o
			increment_stat('Off-target Shots'); break;
		case 72 : // Hit, h
			increment_stat('Hits'); break;
	}
}
