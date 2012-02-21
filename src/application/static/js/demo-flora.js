window.onload = function() {
	
	// init variables needed for flora
	var i = 0;
	var floraArray = [];
	var totalRadius = 0;
	
	setInterval(update,speed);

	function update() {
		if(i != numLogs) {
			time.attr("text",demolog[i][dateIndex]);

			// // with gaps
			// // set up new circle
			// if (demolog[i][stepsIndex] > 0) {
			// 	var radius = demolog[i][stepsIndex]/50+totalRadius; // default:/15
			// 	var color = setColorDemo(demolog[i][homeIndex],demolog[i][outIndex]);
			// } else {
			// 	var radius = 1 + totalRadius;
			// 	var color = "hsb(0,0,0)";
			// }
			// // draw circle and add it to floraArray
			// //if (demolog[i][stepsIndex] > 0) {
			// var circle = paper.circle(ww/2,wh/2,radius);
			// circle.attr({"stroke-width":0, "fill":color, "fill-opacity":0.9});
			// circle.toBack();
			// //}
			
			// without gaps
			// set up new circle
			var radius = demolog[i][stepsIndex]/50+totalRadius;
			var color = setColorDemo(demolog[i][homeIndex],demolog[i][outIndex]);

			// draw circle and add it to floraArray
			if (demolog[i][stepsIndex] > 0) {
				var circle = paper.circle(ww/2,wh/2,radius);
				circle.attr({"stroke-width":0, "stroke":"none", "fill":color, "fill-opacity":0.9});
				circle.toBack();
			}
			
			// make circles shimmer (oscillate between starting color and other range values)
			// rounded edges based on speed
			// fade at night, or other transient animation
			
			totalRadius = radius;
			i++;
		}
	}
}