// GLOBAL VARIABLES

var d = new Date();
var NOTES = "Game started on " + d.toString() + "<br/>";
const STATS_ORDER = [
	'TOI', 'Shifts', 'TOI/shift',
	'Faceoff Wins', 'Faceoff Losses',
	'Goals', 'Assists', 'Plus', 'Minus',
	'Shots', 'Blocked Shots', 'Off-target Shots', 'Hits'
];
const STATS_LENGTH = STATS_ORDER.length;
var STATS = {};
for (var i = 0; i < STATS_LENGTH; i++) {STATS[STATS_ORDER[i]] = 0;}
var start_time = 0; var on_ice = false; var paused = false;


// Functions

function get_time() {
	/* Get current time in seconds */

	var d = new Date();
	return Math.round(d.getTime() / 1000);  // Convert milliseconds to seconds
}


function pretty_time(seconds) {
	/* convert seconds to minutes:seconds */

	var minutes = Math.floor(seconds / 60).toString();
	var sec = (seconds - minutes * 60).toString();
	if (sec.length == 1) {sec = '0' + sec;}
	return minutes + ":" + sec;
}


function update_output() {
	/* Put current stats to the screen */

	// temporarilty convert TOI and TOI/shift for viewing.
	var toi = STATS["TOI"]; var toi_shift = STATS["TOI/shift"];
	STATS["TOI"] = pretty_time(toi); STATS["TOI/shift"] = pretty_time(toi_shift);

	// Create output strings
	var output = ""; set_cookie("NOTES", NOTES, 10);
	for (var i = 0; i < STATS_LENGTH; i++) {
		var stat = STATS_ORDER[i];
		output += stat + ": " + STATS[stat].toString() + "<br/>";
	}
	output += "<br/>" + NOTES;

	// Reset TOI and TOI/shift to seconds.
	STATS["TOI"] = toi; STATS["TOI/shift"] = toi_shift;

	// Put output on the screen.
	document.getElementById("output").innerHTML = output;

	// update cookies
	update_cookies();

	return output;
}


function update_cookies() {
	for (var i = 0; i < STATS_LENGTH; i++) {
		var stat = STATS_ORDER[i];
		set_cookie(stat, STATS[stat].toString(), 10);
	}
	set_cookie("NOTES", NOTES, 10);
}


function submit_note() {
	/* Add the current value in the notes input to the stats */

	var note = document.getElementById("note").value;
	NOTES += "- " + note + "<br/>";
	document.getElementById("note").value = "";
	update_output();
}


function increment_stat(stat_name) {
	/* If on ice and active, increment the stat. */

	if (on_ice && !paused) {
		STATS[stat_name] += 1;
		update_output();
	}
}

function start_shift() {
	/* If not on the ice, get on ice and start shift. */

	if (!on_ice) {
		start_time = get_time();
		on_ice = true; paused = false;
		document.getElementById("ice").innerHTML = 'on ice';
		document.getElementById("status").innerHTML = 'on ice';
	}
}


function stop_shift(do_when_paused=false) {
	/* If on the ice and currently active, stop the shift. Unless
	do_when_paused is true, then the shift is stopped regardless of active */

	if (on_ice && (do_when_paused || !paused)) {
		if (!paused) {STATS['TOI'] += get_time() - start_time;}
		paused = false;
		increment_stat("Shifts");
		STATS['TOI/shift'] = Math.round(STATS['TOI'] / STATS['Shifts']);
		update_output();
		on_ice = false;
		document.getElementById("ice").innerHTML = 'off ice';
		document.getElementById("status").innerHTML = 'off ice';
	}
}


function pause_resume() {
	/* Pause or resume the clock for the shift */

	if (on_ice && !paused) {
		document.getElementById("ice").innerHTML = 'paused';
		document.getElementById("status").innerHTML = 'paused';
		paused = true;
		STATS['TOI'] += get_time() - start_time;
	} else if (on_ice && paused) {
		document.getElementById("ice").innerHTML = 'on ice';
		document.getElementById("status").innerHTML = 'on ice';
		paused = false;
		start_time = get_time();
	}
}


function copy_output() {
	/* Copy the stats output to the clipboard */

	// from https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f

	const el = document.createElement('textarea');
	el.value = update_output().replace(/<br\s*\/?>/mg,"\n")
	el.setAttribute('readonly', '');
	el.style.position = 'absolute';
	el.style.left = '-9999px';
	document.body.appendChild(el);
	el.select();
	document.execCommand('copy');
	document.body.removeChild(el);

	alert("Output copied!");
}


function refresh() {
	/* Clear cookies and reload. */

	set_cookie("NOTES", "", 10);
	for (var i = 0; i < STATS_LENGTH; i++) {
		var stat = STATS_ORDER[i];
		set_cookie(stat, 0, 10);
	}
	location.reload();
}


// Key bindings

document.onkeydown = function (e) {
	e = e || window.event;

	// Enter should be binded regardless of if the user is typing a note
	if ((e.which || e.keyCode) == 13) {submit_note(); return;}

	// Key bindings shouldn't do anything if the person is typing a note
	if( e.target.nodeName == "INPUT" || e.target.nodeName == "TEXTAREA" ) return;
	if( e.target.isContentEditable ) return;

	// key bindings
	switch (e.which || e.keyCode) {
		case 83 : // Start/stop shift, s
			if (on_ice) {stop_shift(true);} else {start_shift();} break;
		case 80 : // Pause/resume, p
			pause_resume(); break;
		case 87 : // Faceoff win, w
			if (!on_ice) {start_shift(); increment_stat('Faceoff Wins');} else if (paused) {pause_resume(); increment_stat('Faceoff Wins');}
		case 76 : // Faceoff loss, l
			if (!on_ice) {start_shift(); increment_stat('Faceoff Losses');} break;
			if (!on_ice) {start_shift(); increment_stat('Faceoff Losses');} else if (paused) {pause_resume(); increment_stat('Faceoff Losses');}
		case 71 : // Goal, g
			increment_stat('Goals'); increment_stat('Shots'); increment_stat('Plus'); pause_resume(); break;
		case 65 : // Assist, a
			increment_stat('Assists'); increment_stat('Plus'); pause_resume(); break;
		case 39 : // Plus, <right>
			increment_stat('Plus'); pause_resume(); break;
		case 37 : // Minus, <left>
			increment_stat('Minus'); pause_resume(); break;
		case 88 : // Shot, x
			increment_stat('Shots'); break;
		case 66 : // Blocked shot, b
			increment_stat('Blocked Shots'); break;
		case 79 : // Offtarget shot, o
			increment_stat('Off-target Shots'); break;
		case 72 : // Hit, h
			increment_stat('Hits'); break;
		case 82 : // reset cookies, r
			refresh(); break;
	}
}

window.onload = function() {
	// load variables from cookies
	for (var i = 0; i < STATS_LENGTH; i++) {
		var stat = STATS_ORDER[i]; var value = get_cookie(stat);
		if (value !== "") {STATS[stat] = parseInt(value);}
	}
	var value = get_cookie("NOTES");
	if (value !== "") {NOTES = value;}
	
	update_output();
};
