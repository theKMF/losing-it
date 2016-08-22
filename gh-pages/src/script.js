var firstTime = false;
var roughly = true; //finegrained differences or not
var saveName = 'wDataObj';

var sessionData;
var lastWeight;
var lastFat;
var lastWater;
var lastMuscle;
var lastBone;
var dataEntries; //how many data entries are there?
var lastDiff = 10; //for animation of the number

var graphLeftMargin = 50;
var graphTopMargin = 50;
var graphWidth;
var graphHeight;
var barWidth = 0;
var maxBarHeight = 0;
var nextEvenTen;

var pfx = ["webkit", "moz", "MS", "o", ""]; //for animation callback
var sequencePosition = 0;
var sequence = ["weight", "fat", "water", "muscle", "bone", "done"];
var activeSequence;

var doneButton;
var starty = 0;
var dist = 0;
var statusdiv; //where to print changing values 
var touchBox; //current active toucharea
var unit; //kg or % etc
var targetVar;

var weightCol = '#d37e29';
var fatCol = '#fee895';
var waterCol = '#0f6499';
var muscleCol = '#500b1b';
var boneCol = '#fff';
var doDebug = true;

DomReady.ready(function () {
	doneButton = document.getElementById('done1');
   //localStorage.removeItem(saveName);
    checkData();

    graphWidth = screen.availWidth * window.devicePixelRatio;
    graphHeight = graphWidth * 0.75;
    setUpValueAdjust('box1', 'weight', ' kg');
    
	PrefixedEvent(doneButton, "AnimationEnd", animationListener);
	PrefixedEvent(box1, "AnimationEnd", animationListener);
    
    viewStats.addEventListener('touchstart', function(e){
       drawGraph();
	}, false);
	
	doneButton.addEventListener('touchstart', function(e){
		doneButton.className = 'doneButton animated bounceOut ';
	}, false);
    
    toggleWeight.addEventListener('touchstart', function(e){
        fillThisGraphKilo("weight", weightCol);
    }, false);
    
    toggleMuscle.addEventListener('touchstart', function(e){
        fillThisGraph("muscle", muscleCol);
    }, false);
    
    toggleWater.addEventListener('touchstart', function(e){
        fillThisGraph("water", waterCol);
    }, false);
    
    toggleFat.addEventListener('touchstart', function(e){
        fillThisGraph("fat", fatCol);
    }, false);
    
    toggleBone.addEventListener('touchstart', function(e){
        fillThisGraph("bone", boneCol);
    }, false);
});

function setMaxBarHeightWidth(){
    dataEntries = sessionData.weight.length;
    var i = 0
    for(i; i < dataEntries; i++){
        if(sessionData.weight[i] > maxBarHeight){
            maxBarHeight = sessionData.weight[i];
        }
    }
    nextEvenTen = (Math.floor(maxBarHeight / 10) + 1) * 10;
    barWidth = (graphWidth - graphLeftMargin) / dataEntries;
}

function checkData(){
	sessionData = JSON.parse( localStorage.getItem( saveName ) ) ;
    
	if(sessionData == null) firstTime = true;
	if(sessionData === null) firstTime = true; 
    
    if(firstTime){
        createSessionObject();
    }else{
        roughly = false;
    }
    
    dataEntries = sessionData.weight.length;
    
    lastWeight =    sessionData.weight[dataEntries -1];
    lastFat =       sessionData.fat[dataEntries -1];
    lastWater  =    sessionData.water[dataEntries -1];
    lastMuscle =    sessionData.muscle[dataEntries -1];
    lastBone =      sessionData.bone[dataEntries -1];
}

function saveData(){
	sessionData.weight.push(lastWeight);
	sessionData.fat.push(lastFat);
	sessionData.water.push(lastWater);
	sessionData.muscle.push(lastMuscle);
	sessionData.bone.push(lastBone);
	
	localStorage.setItem( saveName, JSON.stringify(sessionData) );
}


function createSessionObject(){
    sessionData = {
        "weight" : [84.1],
        "fat" : [30.1],
        "water" : [50.0],
        "muscle" : [25.4],
        "bone" : [2.1]
    };
}


function launchFullscreen(element) {
	if(element.requestFullscreen) {
		element.requestFullscreen();
	} else if(element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	} else if(element.webkitRequestFullscreen) {
		element.webkitRequestFullscreen();
	} else if(element.msRequestFullscreen) {
		element.msRequestFullscreen();
	}
}

//Rita grafen
function drawGraph(){
    setMaxBarHeightWidth();
    graphArea.innerHTML = '<canvas id="graphCanvas" width="' + graphWidth + '" height="'+ graphHeight +'"></canvas>';
	touchBoxWrapper.className = 'lazyhide';
    
    var gDiv = document.getElementById('graphArea');
    gDiv.style.display = "block";
	
    var gCanvas = document.getElementById("graphCanvas");
	var gContext = gCanvas.getContext("2d");
	
    var tenKiloLine = (graphHeight - graphTopMargin) / (nextEvenTen / 10);
    var barGap = 0;
    
   //draw lines and background
	gContext.fillStyle="#FFFFFF";
	gContext.fillRect(0, 0,graphWidth, graphHeight);
    gContext.beginPath();
    for(var ly = graphTopMargin + 0.5; ly <= graphHeight; ly += tenKiloLine){
        gContext.moveTo(0,ly);
        gContext.lineTo(graphWidth, ly);
    }
    
    gContext.strokeStyle = "#5f6f7f";
    gContext.stroke();
    gContext.closePath();
    gContext.globalAlpha = 0.9;
    
    
    //draw total weight
    var dx =  graphLeftMargin;
    var totHeight = (sessionData.weight[0] / maxBarHeight) * graphHeight;
    var dy =  graphHeight - totHeight;
    
    fillThisGraphKilo('weight', weightCol);
    fillThisGraph('water', waterCol);
    fillThisGraph('muscle', muscleCol);
    fillThisGraph('fat', fatCol);
    fillThisGraphKilo('bone', boneCol);
    showToggles();
    
}

function drawThisGraph(what, colour){
    debugOut("Data entries " + dataEntries);
    var gCanvas = document.getElementById("graphCanvas");
	var gContext = gCanvas.getContext("2d");
    var dx =  graphLeftMargin;
    var barHeight = (sessionData[what][0] / maxBarHeight) * (graphHeight-graphTopMargin);
    var dy =  graphHeight - barHeight;
    
    gContext.beginPath();
    gContext.moveTo(graphLeftMargin,barHeight);
    gContext.fillStyle=colour;
    for(var i = 0;i<dataEntries;i++){
        dx = graphLeftMargin + (i * barWidth);
        barHeight = (sessionData[what][i] / maxBarHeight) * (graphHeight-graphTopMargin);
        dy = graphHeight - barHeight;
        gContext.lineTo(dx, dy);
    }
    gContext.lineWidth = 5;
    gContext.stroke();
    gContext.closePath();
}

function fillThisGraphKilo(what, colour){
    var gCanvas = document.getElementById("graphCanvas");
	var gContext = gCanvas.getContext("2d");
    var dx =  graphLeftMargin;
    var totHeight = (sessionData[what][0] / maxBarHeight) * (graphHeight-graphTopMargin);
    var dy =  graphHeight - totHeight;
    
    gContext.fillStyle=colour;
    gContext.beginPath();
    gContext.moveTo(graphLeftMargin,graphHeight);
    
    for(var i = 0;i<dataEntries;i++){
        dx = graphLeftMargin + (i * barWidth);
        totHeight = (sessionData[what][i] / maxBarHeight) * (graphHeight-graphTopMargin);
        dy = graphHeight - totHeight;
        gContext.lineTo(dx, dy);
    }
    gContext.lineTo(dx, graphHeight);
    gContext.closePath();
    gContext.lineWidth = 1;
    gContext.fill();
}

function fillThisGraph(what, colour){
    var gCanvas = document.getElementById("graphCanvas");
	var gContext = gCanvas.getContext("2d");
    var totHeight = (sessionData.weight[0] / maxBarHeight) * (graphHeight-graphTopMargin);
    var dx = graphLeftMargin;
    var dy = (sessionData[what][0]/100)*totHeight;
    gContext.beginPath();
    gContext.moveTo(graphLeftMargin,graphHeight);
    
    for(var i = 0; i < dataEntries; i++){
        totHeight = (sessionData.weight[i] / maxBarHeight) * (graphHeight-graphTopMargin);
        dy = (sessionData[what][i]/100)*totHeight;
        dx = graphLeftMargin + (i * barWidth);
        gContext.lineTo(dx, graphHeight - dy);
    }
    gContext.lineTo(dx, graphHeight);
    gContext.closePath();
    gContext.fillStyle = colour;
    gContext.lineWidth = 0;
    gContext.fill();
}


function showToggles(){
    toggles.className = 'toggleWrapper';
    toggleWeight.className = 'toggleButton weight animated bounceIn';
    toggleFat.className = 'toggleButton fat animated bounceIn';
    toggleWater.className = 'toggleButton water animated bounceIn';
    toggleMuscle.className = 'toggleButton muscle animated bounceIn';
    toggleBone.className = 'toggleButton bone animated bounceIn';
}

function debugOut(str){
    if(doDebug){
        var theDebug = document.getElementById('debugOutYeah');
        theDebug.className = 'debugOut';
	   theDebug.innerHTML = str;
    }
}
//animation handling

function PrefixedEvent(element, type, callback) {
	for (var p = 0; p < pfx.length; p++) {
		if (!pfx[p]) type = type.toLowerCase();
		element.addEventListener(pfx[p]+type, callback, false);
	}
}

function animationListener(e){
	//is it the end of an animation?
	if(e.type.toLowerCase().indexOf("animationend") >= 0){
	//which animation?
	//bounceOut = Done button
	//fadeOutLeft = numbersdisplay	
        if (e.animationName == "bounceOut") {
            touchBox.className = activeSequence + ' touchbox animated fadeOutLeft';
			sequencePosition++;
		}
		
		if(e.animationName == "fadeOutLeft"){
			touchBox.className = "lazyhide";
			switch (activeSequence){
				case "weight":
					var targetDivId = 'box2';
					document.getElementById(targetDivId).className = "touchbox fat animated fadeInRight";
					setUpValueAdjust(targetDivId, 'fat', '%');
					break;
				case "fat":
					var targetDivId = 'box3';
					document.getElementById(targetDivId).className = "touchbox water animated fadeInRight";
					setUpValueAdjust(targetDivId, 'water', '%');
					break;
				case "water":
					var targetDivId = 'box4';
					document.getElementById(targetDivId).className = "touchbox muscle animated fadeInRight";
					setUpValueAdjust(targetDivId, 'muscle', '%');
					break;
				case "muscle":
					var targetDivId = 'box5';
					document.getElementById(targetDivId).className = "touchbox bone animated fadeInRight";
					setUpValueAdjust(targetDivId, 'bone', ' kg');
					break;
                case "bone":
                    saveData();
                    drawGraph();
                    break;
			}
		}
	}
}

function numberBounceDone(){
    statusdiv.className = "numbers";
}

function setUpValueAdjust(touchElementId, outputElementId, unitString){
    activeSequence = sequence[sequencePosition]; //string representing whats being messuerd
    
    touchBox = document.getElementById(touchElementId);
	statusdiv = document.getElementById(outputElementId);
	unit = unitString;
    statusdiv.innerHTML = sessionData[activeSequence][dataEntries-1] + unit;
	
    touchBox.addEventListener('touchstart', boxTouchStart, false);
	touchBox.addEventListener('touchmove', boxTouchMove, false);
	touchBox.addEventListener('touchend', boxTouchEnd, false);
	
	PrefixedEvent(touchBox, 'AnimationEnd', animationListener);
    PrefixedEvent(statusdiv, 'AnimationEnd', numberBounceDone);
}

//////////////////Touch  prylar

function boxTouchStart(e){
	var touchobj = e.changedTouches[0]; // reference first touch point (ie: first finger)
	starty = parseInt(touchobj.clientY); // get x position of touch point relative to left edge of browser
     
	e.preventDefault();
}

function boxTouchMove(e){
	var touchobj = e.changedTouches[0]; // reference first touch point for this event
	var dist = starty - parseInt(touchobj.clientY);
	var diff;
	var printable;
    if(roughly === false){
		 diff = dist / 500;
	}else{
		diff = dist / 30;
	}
    var rounded;
    switch (activeSequence){
                case "weight":
					rounded = ((lastWeight + diff)/10)*10;
                    break;
				case "fat":
					rounded = ((lastFat + diff)/10)*10;
                    var bonusNumber = ((rounded/100) * lastWeight).toFixed(1);
                    fatBonus.innerHTML = "or " + bonusNumber + " kg"; 
					break;
				case "water":
					rounded = ((lastWater + diff)/10)*10;
                    var bonusNumber = ((rounded/100) * lastWeight).toFixed(1);
                    waterBonus.innerHTML = "or " + bonusNumber + " liter"; 
					break;
				case "muscle":
					rounded = ((lastMuscle + diff)/10)*10;
                    var bonusNumber = ((rounded/100) * lastWeight).toFixed(1);
                    muscleBonus.innerHTML = "or " + bonusNumber + " kg"; 
					break;
				case "bone":
					rounded = ((lastBone + diff)/10)*10;
					break;
    }
	
	printable = rounded.toFixed(1);
    if(printable%1 === 0){
        statusdiv.className = "numbers animated pulse";
    }
	statusdiv.innerHTML = printable + unit;
	e.preventDefault();
}


function boxTouchEnd(e){
    var touchobj = e.changedTouches[0]; // reference first touch point for this event
	e.preventDefault();
    switch (activeSequence){
                case "weight":
					lastWeight = parseFloat(statusdiv.innerHTML);
                    break;
				case "fat":
					lastFat = parseFloat(statusdiv.innerHTML);
					break;
				case "water":
					lastWater = parseFloat(statusdiv.innerHTML);
					break;
				case "muscle":
					lastMuscle = parseFloat(statusdiv.innerHTML);
					break;
				case "bone":
					lastBone = parseFloat(statusdiv.innerHTML);
					break;
    }
	
	roughly = false;
	doneButton.style.visibility = "visible";
	doneButton.className = 'doneButton animated bounceIn';
}
