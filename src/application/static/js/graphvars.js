var dateIndex = 0;
var stepsIndex = 1;
var homeIndex = 2; // boolean: home or not // demo only
var outIndex = 3; // boolean: outside or not // demo only

var ww = window.innerHeight;
var wh = window.innerHeight;
var margin = ww*.1;

var paper = Raphael("graph",ww,wh);
//var border = paper.path("M0 0H"+ww+"V"+wh+"H0V0Z");

function setColorDemo(home,out) {
	var h;
	var s = 0.88;
	var b = 0.88;
	if (home) {
		h = Math.random() * 0.16; // red-yellow, hue 0-0.16
	}
	if (!home && out) {
		h = Math.random() * 0.39 + 0.19; // green-blue, hue 0.19-0.58
	}
	if (!home && !out) {
		h = Math.random() * 0.33 + 0.61; // purple-pink, hue 0.61-0.94
	}
	return "hsb("+h+","+s+","+b+")";
}

function setColor(steps) {
	var h;
	var s = 0.88;
	var b = 0.88;
	if (steps < 100) {
		h = Math.random() * 0.39 + 0.19; // green-blue, hue 0.19-0.58
	}
	if (steps >= 100 && steps <= 300) {
		h = Math.random() * 0.16; // red-yellow, hue 0-0.16
	}
	if (steps > 300) {
		h = Math.random() * 0.33 + 0.61; // purple-pink, hue 0.61-0.94
	}
	return "hsb("+h+","+s+","+b+")";
}