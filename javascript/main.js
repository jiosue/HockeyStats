// GLOBAL VARIABLES

var NOTES = ""
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

	// Create output strings.
	var output = "";
	for (var i = 0; i < STATS_LENGTH; i++) {
		var stat = STATS_ORDER[i];
		output += stat + ": " + STATS[stat].toString() + "<br/>";
	}
	output += "<br/><span class='bold'>Notes</span>:<br/>" + NOTES;

	// Reset TOI and TOI/shift to seconds.
	STATS["TOI"] = toi; STATS["TOI/shift"] = toi_shift;

	// Put output on the screen.
	document.getElementById("output").innerHTML = output;
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

	// from https://stackoverflow.com/questions/36639681/how-to-copy-text-from-a-div-to-clipboard

	if (document.selection) { 
	    var range = document.body.createTextRange();
	    range.moveToElementText(document.getElementById("output"));
	    range.select().createTextRange();
	    document.execCommand("copy"); 
	} else if (window.getSelection) {
	    var range = document.createRange();
	     range.selectNode(document.getElementById("output"));
	     window.getSelection().addRange(range);
	     document.execCommand("copy");
	}

	alert("Output copied!");
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
			if (!on_ice) {start_shift(); increment_stat('Faceoff Wins');} break;
		case 76 : // Faceoff loss, l
			if (!on_ice) {start_shift(); increment_stat('Faceoff Losses');} break;
		case 71 : // Goal, g
			increment_stat('Goals'); increment_stat('Plus'); stop_shift(); break;
		case 65 : // Assist, a
			increment_stat('Assists'); increment_stat('Plus'); stop_shift(); break;
		case 39 : // Plus, <right>
			increment_stat('Plus'); stop_shift(); break;
		case 37 : // Minus, <left>
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
