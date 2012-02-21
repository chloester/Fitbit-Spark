var dateIndex = 0;
var stepsIndex = 1;
var homeIndex = 2; // boolean: home or not // demo only
var outIndex = 3; // boolean: outside or not // demo only

var margin = window.innerWidth*.1;

var ww = 920;
var wh = 600;

if (document.body && document.body.offsetWidth) {
    ww = document.body.offsetWidth;
    wh = document.body.offsetHeight-200;
}
if (document.compatMode=='CSS1Compat' &&
document.documentElement &&
document.documentElement.offsetWidth ) {
    ww = document.documentElement.offsetWidth;
    wh = document.documentElement.offsetHeight-200;
}
if (window.screen) {
    ww = window.screen.width;
    wh = window.screen.height-200;
} 
if (window.innerWidth && window.innerHeight) {
    ww = window.innerWidth;
    wh = window.innerHeight-200;
}
if (ww > 920) ww = 920;
if (wh < 100) wh = 100;

var paper = Raphael("graph",ww,wh);
var xStart = margin;
var yStart = wh/2;
var xLoc = xStart;
var yLoc = yStart;
var pathString = "M"+xStart+" "+yStart;

var textPadding = 10;
var speed = 200; // default:500 fast:100

// time counter
var time = paper.text(textPadding,textPadding,"");
time.attr({"text-anchor":"start", "font-size":14, "fill":"#ffffff"});

// labels
var timeLabel;
var valueLabel;

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
    // for 1 min log, interval should be 88,176
    // for 5 min log, interval should be 440,880 (2-4mph average walk)
    // TODO set color using elevation instead of step count
	var h;
	var s = 0.88;
	var b = 0.88;
	if (steps < 440) {
	    h = 0.58 - 2*(steps/440 * (0.58-0.19)); // blue-green, hue 0.58-0.19 (208-68)
	    //h = Math.random() * 0.33 + 0.61; 
	}
	if (steps >= 440 && steps <= 880) {
	    h = 0.16 - (steps-440)/(880-440) * 0.16; // yellow-red, hue 0.16-0 (37-0)
		//h = Math.random() * 0.39 + 0.19; 
	}
	if (steps > 880) {
	    h = 0.94 - (steps-880)/(1600-880) * (0.94-0.63); // pink-purple, hue 0.94-0.61 (338-219)
		//h = Math.random() * 0.16; 
	}
	return "hsb("+h+","+s+","+b+")";
}

function setColorRGB(steps) {
    // same as above, but for Bucket viz's Canvas fillStyle
    var h;
	var s = Math.random() * 0.55 + 0.33;
	var l = 0.88;
	if (steps < 220) {
	    h = Math.random() * 0.33 + 0.61; // purple-pink, hue 0.61-0.94 (219-338)
	}
	if (steps >= 220 && steps <= 550) {
		h = Math.random() * 0.39 + 0.19; // green-blue, hue 0.19-0.58 (68-208)
	}
	if (steps > 550) {
		h = Math.random() * 0.16; // red-yellow, hue 0-0.16 (0-37)
	}
    
    rgb = hsv2rgb(h,s,l);
    
    return rgb;
}

function hsv2rgb(h,s,v) {
    // Adapted from http://www.easyrgb.com/math.html
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
        	valueLabel.show();
		});
		elements[i].mouseout(function () {
		    timeLabel.hide();
        	valueLabel.hide();
		});
	}
}