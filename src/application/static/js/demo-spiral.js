window.onload = function() {
	var xStart = margin;
	var yStart = wh/2;
	var xLoc = xStart;
	var yLoc = yStart;
	var pathString = "M"+xStart+" "+yStart;
	
	var textPadding = 10;
	var speed = 200; // default:500 fast:100
	
	// time counter
	var time = paper.text(textPadding,textPadding,"");
	time.attr({"text-anchor":"start", "font-size":12, "fill":"#ffffff"});

	// init variables needed for circles and spiral
	var i = 0;
	var spiralArray = [];
	// circle's spiral path
	var deg = 20;
	var rVelocity = 2; // speed at which distance from center increases
	var thetaVelocity = deg*Math.PI/180; // angle at which dot moves along spiral

	setInterval(update,speed);

	function update() {
		if(i != numLogs) {
			time.attr("text",log[i][dateIndex]);

			// set up new circle
			var radius = log[i][stepsIndex]/15; // default:/15
			var color = setColor(log[i][homeIndex],log[i][outIndex]);
			//console.log(color);
			// draw circle and add it to spiralArray
			if (radius > 0) {
				var circle = paper.circle(ww/2,wh/2,radius);
				circle.attr({"stroke-width":0, "fill":color, "fill-opacity":0.9});
				//circle.attr({"cx":ww/2, "cy":wh/2});
				spiralArray.unshift({circle:circle, r:10, theta:0});
			}
			// place and move all circles in the array
			for (var j = 0; j < spiralArray.length; j++) {
				updateCircle(spiralArray[j]);
			}

			i++;
		}
	}

	//setInterval(updateCircle,100);
	function updateCircle(c) {
		c.r += rVelocity;
		c.theta += thetaVelocity;
		newcx = c.r * Math.cos(c.theta);
		newcy = c.r * Math.sin(c.theta);
		oldfill = c.circle.attr("fill-opacity");
		if (oldfill > 0.01) {
			c.circle.animate({cx:(ww/2)+newcx, cy:(wh/2)+newcy, "fill-opacity":(ww/2-c.r)/(ww/2)},speed);
		} else {
			c.circle.remove();
		}
	}

}

	// var homeBarGraph = function() {
	// 	var midway = paper.path("M0 "+wh/2+"H"+ww);
	// 	// separate by whether is home or not
	// 	for(var i = 0; i < numLogs; i++) {
	// 		xLoc = xLoc+margin;
	// 		// if home, draw below half of y
	// 		if (log[i][homeIndex] == 1) {
	// 			yLoc = yStart+(log[i][stepsIndex])/2;
	// 		} else {
	// 			yLoc = yStart-(log[i][stepsIndex])/2;
	// 		}
	// 		pathString = pathString.concat("V"+yLoc+"M"+xLoc+" "+yStart);
	// 	}
	// 	pathString.concat("Z");
	// 	paper.path(pathString);
	// };
	
	// function outdoorBarGraph() {
	// 	var midway = paper.path("M0 "+wh/2+"H"+ww);
	// 	//separate by whether indoors or outdoors
	// 	for(var i = 0; i < numLogs; i++) {
	// 		xLoc = xLoc+margin;
	// 		// if home, draw below half of y
	// 		if (log[i][outIndex] == 1) {
	// 			yLoc = yStart-(log[i][stepsIndex])/2;
	// 		} else {
	// 			yLoc = yStart+(log[i][stepsIndex])/2;
	// 		}
	// 		pathString = pathString.concat("V"+yLoc+"M"+xLoc+" "+yStart);
	// 	}
	// 	pathString.concat("Z");
	// 	paper.path(pathString);
	// };