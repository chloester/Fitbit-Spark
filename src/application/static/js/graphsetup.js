var divWidth = 920;
var divHeight = 600;

if (window.innerWidth && window.innerHeight) {
    divWidth = window.innerWidth;
    divHeight = window.innerHeight-200;
}
if (divWidth > 920) divWidth = 920;
if (divHeight < 100) divHeight = 100;

var paper = Raphael("graph",divWidth,divHeight);

var textPadding = 10;
var speedOfAnimation = 0;

// time counter
var time = paper.text(textPadding,textPadding,"");
time.attr({"text-anchor":"start", "font-size":14, "fill":"#ffffff"});

// labels
var timeLabel;
var valueLabel;

// log
var log;
var logSize;

// steps
// assuming average walking speed = 2.5-3.3 mph, max running speed = 6mph 
// formula: ((mph x 5280)/60) / 2 for steps/min (assuming 2' stride)
// for 1 min log, range should be 110-145 steps, max = 264
// for 5 min log, range should be 550-725 steps, max = 1320
// TODO set color using elevation instead of step count

var lowRangeOfWalkingSpeed = 2.5;
var highRangeOfWalkingSpeed = 3.5;
var runningSpeed = 6;
var strideLength = 2.4;
var FEET_PER_MILE = 5280;
var MINS_PER_HOUR = 60;
var logInterval = 5;

var lowStepRange = (lowRangeOfWalkingSpeed * FEET_PER_MILE)/MINS_PER_HOUR/strideLength * logInterval;
var highStepRange = (highRangeOfWalkingSpeed * FEET_PER_MILE)/MINS_PER_HOUR/strideLength * logInterval;
var maxStepRange = (runningSpeed * FEET_PER_MILE)/MINS_PER_HOUR/strideLength * logInterval;

function setColor(steps) {
	var h = calculateHueFromSteps(steps, lowStepRange, highStepRange, maxStepRange);
	var s = 0.88;
	var b = 0.88;

	return "hsb("+h+","+s+","+b+")";
}

function calculateHueFromSteps(steps, lowStepRange, highStepRange, maxStepRange) {
    if (steps < lowStepRange) {
        // blue-green, hue 0.67-0.19 (243-68)
	    return 0.67 - (steps/lowStepRange * (0.67-0.19)); 	    
	}
	if (steps >= lowStepRange && steps <= highStepRange) {
	    // yellow-red, hue 0.16-0 (60-0)
	    return 0.16 - ((steps-lowStepRange)/(highStepRange-lowStepRange) * 0.16);
	}
	if (steps > highStepRange) {
	    // pink-purple, hue 0.94-0.73 (338-264)
	    return 0.94 - (steps-highStepRange)/(maxStepRange-highStepRange) * (0.94-0.73); 
	}
}

function setColorRGB(steps) {
    // same as setColor, but for Bucket viz's Canvas fillStyle
    var h = calculateHueFromSteps(steps, lowStepRange, highStepRange, maxStepRange);
	var s = Math.random() * 0.66 + 0.33;
	var v = 0.88;

    rgb = hsv2rgb(h,s,v);
    
    return rgb;
}

function hsv2rgb(h,s,v) {
    // Adapted from http://divWidthw.easyrgb.com/math.html
    // by http://jsres.blogspot.com/2008/01/convert-hsv-to-rgb-equivalent.html
    // hsv values = 0 - 1, rgb values = 0 - 255
    var r, g, b;
    var RGB = new Array();
    if(s==0){
        RGB['red']=RGB['green']=RGB['blue']=Math.round(v*255);
    }else{
        // h must be < 1
        var var_h = h * 6;
        if (var_h==6) var_h = 0;
        //Or ... var_i = floor( var_h )
        var var_i = Math.floor( var_h );
        var var_1 = v*(1-s);
        var var_2 = v*(1-s*(var_h-var_i));
        var var_3 = v*(1-s*(1-(var_h-var_i)));
        if(var_i==0){ 
            var_r = v; 
            var_g = var_3; 
            var_b = var_1;
        }else if(var_i==1){ 
            var_r = var_2;
            var_g = v;
            var_b = var_1;
        }else if(var_i==2){
            var_r = var_1;
            var_g = v;
            var_b = var_3
        }else if(var_i==3){
            var_r = var_1;
            var_g = var_2;
            var_b = v;
        }else if (var_i==4){
            var_r = var_3;
            var_g = var_1;
            var_b = v;
        }else{ 
            var_r = v;
            var_g = var_1;
            var_b = var_2
        }
        //rgb results = 0 ÷ 255  
        RGB['red']=Math.round(var_r * 255);
        RGB['green']=Math.round(var_g * 255);
        RGB['blue']=Math.round(var_b * 255);
    }
    return "rgb(" + RGB['red'] + "," + RGB['green'] + "," + RGB['blue'] + ")";  
};

// specifies which elements should show time+value label on mouseover
function createInteraction(elements, timeLabel, valueLabel) {
	for(var i = 0; i < elements.length; i++) {
		elements[i].mouseover(function () {
		    timeLabel.show();
		    timeLabel.toFront();
        	valueLabel.show();
        	valueLabel.toFront();
		});
		elements[i].mouseout(function () {
		    timeLabel.hide();
        	valueLabel.hide();
		});
	}
}

function updateLog() {
    console.log("Updating log...");
	$.getJSON('/raw', function(data, textStatus, jqXHR) {
		log = data;
		logSize = log.length;
		time.attr("text",log[log.length-1].time);
		
        calculateTotalSteps(log);
	});
}

function calculateTotalSteps(log) {
    var newTotal = 0;
	for(var i = 0; i < logSize; i++) {
	    newTotal += log[i].value;
	}
	$('#totalSteps').text(newTotal);
	
	return newTotal;
}