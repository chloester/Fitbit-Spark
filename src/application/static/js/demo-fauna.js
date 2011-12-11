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
	
	// init variables needed for fauna
	var i = 0;
	var faunaArray = [];
	var totalR = 0;
	
	setInterval(update,speed);

	function update() {
		if(i != numLogs) {
			time.attr("text",log[i][dateIndex]);

			// // with gaps
			// // set up new circle
			// if (log[i][stepsIndex] > 0) {
			// 	var radius = log[i][stepsIndex]/50+totalR; // default:/15
			// 	var color = setColor(log[i][homeIndex],log[i][outIndex]);
			// } else {
			// 	var radius = 1 + totalR;
			// 	var color = "hsb(0,0,0)";
			// }
			// // draw circle and add it to faunaArray
			// //if (log[i][stepsIndex] > 0) {
			// var circle = paper.circle(ww/2,wh/2,radius);
			// circle.attr({"stroke-width":0, "fill":color, "fill-opacity":0.9});
			// circle.toBack();
			// //}
			
			// without gaps
			// set up new circle
			var radius = log[i][stepsIndex]/50+totalR;
			var color = setColor(log[i][homeIndex],log[i][outIndex]);

			// draw circle and add it to faunaArray
			if (log[i][stepsIndex] > 0) {
				var circle = paper.circle(ww/2,wh/2,radius);
				circle.attr({"stroke-width":0, "fill":color, "fill-opacity":0.9});
				circle.toBack();
			}
			
			// make circles shimmer (oscillate between starting color and other range values)
			// rounded edges based on speed
			// fade at night, or other transient animation
			
			totalR = radius;
			i++;
		}
	}
}