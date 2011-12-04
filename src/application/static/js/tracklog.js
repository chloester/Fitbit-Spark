$(document).onload(function() {
  var today = new Date();
  var d = today.getDate();
  var m = today.getMonth() + 1;
  var y = today.getFullYear();

  // data {name,type,startMonth,startDay,startYear,endMonth,endDay,endYear}
  // type 1=productivity, 2=health
  var things = [
    ["To-Dos", 0, 4, 23, 2007, m, d, y],
    
    ["Weight",1,1,1,2011,m,d,y],
    ["Sleep",1,12,22,2010,m,d,y],
    ["Steps",1,10,13,2010,m,d,y],
    ["Work",0,7,13,2010,m,d,y],
    ["Location",3,10,16,2009,m,d,y],
    ["Concerts",2,8,14,2009,m,d,y],
    ["Movies",2,11,21,2008,m,d,y]
  ];
  var numThings = things.length;

  // colors
  var black = Raphael.color("hsb(0,0,0)");
  var white = Raphael.color("hsb(1,1,1)");
  var colors = [
    [Raphael.color("#b3dc6c")], // productivity
    [Raphael.color("#f691b2")], // health
    [Raphael.color("#9fc6e7")], // entertainment
    [Raphael.color("#fbe983")] // location
  ];

  // x axis
  var startYear = y;

  // layout
  var margin = 50;
  var barHeight = 5;
  var barGap = 5;
  var yearWidth = 0;

  // screen size
  var ww = 800;
  var wh = margin * 2 + (barHeight + barGap) * numThings;

  // setup
  var paper = Raphael("tracklog", ww, wh);
  drawAxis();
  drawBars();

  function drawAxis() {
    // axis lines
    var axisLines = paper.path("M"+margin+","+margin+"V"+(wh-margin)+"H"+ww);
    axisLines.attr({stroke: 'black'});
    drawXTicks();
    drawYTicks();
  }

  function drawXTicks() {
    // earliest year (first tick value)
    var yearIndex = 4; // startYear is in index y of things array
    for(var i = 0;i < numThings; i++) {
      if(things[i][yearIndex] < startYear) {
	startYear = things[i][yearIndex];
      }
    }
    yearWidth = (ww-margin-4*barGap)/(y-startYear+1);

    // draw ticks
    var startXTick = margin + barGap;
    var h = 5;
    // draw ticks for each year
    for(var i = 0; i <= y-startYear+2; i++) {
      paper.path("M"+startXTick+","+(wh-margin)+"l0,"+h+"z").attr({stroke:'black'});
      paper.text(startXTick, wh-margin+2*h, startYear+i);
      startXTick = startXTick + yearWidth;
    }
  }

  // TODO move text to right side
  // TODO add legend with circles on right side
  // TODO fix x axis dates (2-3 months before start and after end)
  // TODO use Date items instead of ints in things[]
  function drawYTicks() {
    var startYTick = wh-margin-barGap-(barHeight/2);
    var w = 5;
    for(var i = 0; i < numThings; i++) {
      paper.path("M"+margin+","+startYTick+"h"+(-w));
      // change text size here with some attr; look up in docs
      paper.text(margin-2*w, startYTick, things[i][0]).attr("text-anchor","end");
      startYTick = startYTick - (barHeight + barGap);
    }
  }
  
  function drawBars() {
    var x,y,w,h;
    var dayearIndex = 3;
    var monthIndex = 2;
    var yearIndex = 4;
    
    for(var i = 0; i < numThings; i++) {
      var yearX = yearWidth * (things[i][yearIndex]-startYear);
      var monthX = yearWidth/12 * things[i][monthIndex];
      var dayX = yearWidth/12/30 * things[i][dayearIndex];
      x = margin+barGap + yearX + monthX + dayX;
      y = wh-margin-(barGap+barHeight)*(i+1);
      w = calcBarWidth(things[i]);
      h = barHeight;
      var bar = paper.rect(x,y,w,h);
      bar.attr("fill",colors[things[i][1]]);
      bar.attr("stroke-width",0);
    }
  }
  
  function calcBarWidth(a) {
    var y1 = a[4];
    var m1 = a[2];
    var d1 = a[3];
    var y2 = a[7];
    var m2 = a[5];
    var d2 = a[6];
    
    var startDate = new Date(y1,m1,d1);
    var endDate = new Date(y2,m2,d2);
    
    var diff = Math.round((endDate - startDate)/86400000);
    return diff * yearWidth/365;
  }
});
