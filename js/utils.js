/*-------------------- enter full screen --------------------*/
// toggle a div to fullscreen model
function toggleFullScreenOnEle(ele){
    elem = document.getElementById(ele);
    if (elem.requestFullscreen){
        elem.requestFullscreen();
    } else if (elem.msRequestFullscreen){
        elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen){
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen){
        elem.webkitRequestFullscreen();
    }
}
// for full screen
function RunPrefixMethod(obj, method) {
    var p = 0, m, t;
    while (p < pfx.length && !obj[m]) {
        m = method;
        if (pfx[p] == "") {
            m = m.substr(0,1).toLowerCase() + m.substr(1);
        }
        m = pfx[p] + m;
        t = typeof obj[m];
        if (t != "undefined") {
            pfx = [pfx[p]];
            return (t == "function" ? obj[m]() : obj[m]);
        }
        p++;
    }
}
// toggle to normal size
function toggleFullScreen(){
    if (RunPrefixMethod(document, "FullScreen") || RunPrefixMethod(document, "IsFullScreen")) {
        RunPrefixMethod(document, "CancelFullScreen");
    }
    else {
        RunPrefixMethod(document.getElementById("fullscreen"), "RequestFullScreen");
    }
}
/*-------------------- get parameter from URL --------------------*/
function getURLParameter(VarSearch, defaultval){
    var SearchString = window.location.search.substring(1);
    SearchString = SearchString.replace(/\%22/g, '"').replace(/'/g,"%27"); // url decoder
    var VariableArray = SearchString.split('&');
    for(var i = 0; i < VariableArray.length; i++){
      var str = VariableArray[i];
      var n = str.search('=');
      if (str.substring(0, n) == VarSearch) {
        return str.substring(n+1);
      };
    }
  return defaultval;
}

/*-------------------- monitor & download --------------------*/
// download data to local file
function saveToFile(data, filename){
    var textFileAsBlob = new Blob([data], {type:'text/plain'});
    var downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    downloadLink.click();
}

// progress bar
function drawslider(max_progress, cur_progress){
    var percent_progress = Math.round((cur_progress*100)/max_progress);
    document.getElementById("sliderbar").style.width = percent_progress + '%';
    document.getElementById("progress").innerHTML = percent_progress + '%';
}

/*-------------------- draw shapes --------------------*/
// draw a circle
function drawCircle(context, x, y, r, color, fill){
    context.beginPath();
    context.arc(x, y, r, 0, 2 * Math.PI, true);
    context.closePath();
    if(fill){
        context.fillStyle = color;
        context.fill(); 
    }else{
        context.strokeStyle = color;
        context.stroke();
    }
}

// draw a crosshair
function drawCrossHair(context, x, y, r, color, circW, crsW){
    context.beginPath();
    context.lineWidth = circW;
    context.arc(x, y, r, 0, 2 * Math.PI, true);
    context.closePath();
    context.strokeStyle = color;
    context.stroke();
    drawCross(context, x, y, r, color, crsW);
}

// draw traditional movie countdown - crosshair
function drawMovieCntdown(ctx, x, y, r1, r2, color, w1, w2, w){
    ctx.strokeStyle = color;
    ctx.beginPath();
    // two circles
    ctx.lineWidth = w1;
    ctx.arc(x, y, r1, 0, 2 * Math.PI, true);
    ctx.stroke();
    ctx.beginPath();
    ctx.lineWidth = w2;
    ctx.arc(x, y, r2, 0, 2 * Math.PI, true);
    ctx.stroke();
    // partial cross
    ctx.beginPath();
    ctx.lineWidth = w;
    var d = r2*0.8, l = r2*0.4+r1-r2;
    ctx.moveTo(x-d,y);ctx.lineTo(x-d-l,y);
    ctx.moveTo(x+d,y);ctx.lineTo(x+d+l,y);
    ctx.moveTo(x,y-d);ctx.lineTo(x,y-d-l);  
    ctx.moveTo(x,y+d);ctx.lineTo(x,y+d+l);  
    ctx.stroke();
    ctx.closePath();
}

// draw circle animation
function drawDynamicCirc(w, h, ctx, x, y, bckcolor, color, duration, start_r, end_r, step, callback){
    var num = Math.round(duration/step);
    var r_set = new Array(num);
    for( var i = 0; i < num; i++){
        r_set[i] = start_r+ (end_r-start_r)/num*i; // set of radius
    }
    drawCircleLoop(w, h, ctx, x, y, r_set, bckcolor, color, step, 0, callback);
}
function drawCircleLoop(w, h, ctx, x, y, r_set, bckcolor, color, step, idx, callback){
    if (RESTART) {
        DISPLAYDOTON = false;
        DISPLAYON = false;
        return;
    }
    if(idx >= r_set.length) {
        if(callback) callback();
        return;
    }
    ctx.fillStyle = bckcolor;
    ctx.fillRect(0,0,w,h);
    drawCircle(ctx, x, y, r_set[idx], color, true);
    setTimeout(function(){
        drawCircleLoop(w, h, ctx, x, y, r_set, bckcolor, color, step, idx+1, callback);
    }, step);
}

function drawDynamicRing(ctx, x, y, bckcolor, color, duration, start_r, end_r, step, callback){
    var num = Math.round(duration/step);
    var r_set = new Array(num);
    for( var i = 0; i < num; i++){
        r_set[i] = start_r+ (end_r-start_r)/num*i; // set of radius
    }
    drawRingLoop(ctx, x, y, r_set, bckcolor, color, step, 0, callback);
}

function drawRingLoop(ctx, x, y, r_set, bckcolor, color, step, idx, callback){
    if (RESTART) {
        DISPLAYDOTON = false;
        DISPLAYON = false;
        return;
    }
    if(idx >= r_set.length) {
        if(callback) callback();
        return;
    }
    drawCircle(ctx, x, y, r_set[idx], color, false);
    setTimeout(function(){
        drawRingLoop(ctx, x, y, r_set, bckcolor, color, step, idx+1, callback);
    }, step);
}

// draw a cross
function drawCross(context, x, y, r, color, width){
    context.beginPath();
    context.lineWidth = width;
    context.moveTo(x-r,y);context.lineTo(x+r,y);
    context.moveTo(x,y-r);context.lineTo(x,y+r);
    context.strokeStyle = color;
    context.stroke();
    context.closePath();
}

/*-------------------- draw memory test --------------------*/
// draw a rounded corner rectangle
function drawRoundCornerRect(ctx, x, y, w, h, color, width){
    ctx.lineJoin = 'round';
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    rcorner = width;
    ctx.strokeRect(x, y, w+(rcorner/2), h+(rcorner/2));
    ctx.stroke();
    ctx.lineJoin = 'miter';
}

// get coordinates of grids
function getgridloc(x, y, size, grids, spacing){
    var numy = grids[0];
    var numx = grids[1];
    var w = size[1], h = size[0];
    var loc = new Array(numy); // one row
    for(var i = 0; i < numy; i++){
        loc[i] = new Array(numx);
        for(var j = 0; j < numx; j++){
            loc[i][j] = new Array(2);
            loc[i][j][0] = x + (j+1)*spacing + j*w;
            loc[i][j][1] = y + (i+1)*spacing + i*h;
        }
    }
    return loc;
}

// draw grids
function drawGrids(ctx, x, y, loc, size, sel, selans, color, selcolor, width, selwidth){
    var numy = loc.length;
    var numx = loc[0].length;
    var w = size[1], h = size[0];
    // draw grids
    ctx.beginPath();
    for(var i = 0; i < numy; i++){
        for(var j = 0; j < numx; j++){
            if(sel[i][j] == 0){
                drawRoundCornerRect(ctx, loc[i][j][0], loc[i][j][1], w, h, color, width);           
            }
            else if(selans[i][j] == 1){
                drawRoundCornerRect(ctx, loc[i][j][0], loc[i][j][1], w, h, selcolor[0], selwidth);
            }
            else{
                drawRoundCornerRect(ctx, loc[i][j][0], loc[i][j][1], w, h, selcolor[1], selwidth);
            }
        }
    }
}

// image gallery on a fixed grid
function drawGridsImg(ctx, loc, size, preview){
    var numy = loc.length;
    var numx = loc[0].length;
    var w = size[1], h = size[0];

    for(var i = 0; i < numy; i++){
        for(var j = 0; j < numx; j++){
            var image;
            if(preview){
                image = cageimg;
            }else{
                image = hitimgs[gridimgs[i][j]];
            }
            var s = Math.min(w/image.width, h/image.height);
            if(preview) s *= 0.8;
            var rsw = image.width*s, rsh = image.height*s;
            ctx.drawImage(image, loc[i][j][0]+(w-rsw)/2, loc[i][j][1]+(h-rsh)/2, rsw, rsh);
        }
    }
}

// draw catched pig or cage
function drawCage(ctx, loc, i, j, checked, answer, size){
    var image;
    if(checked == 1 && answer == 1){
        image = pigset[0];
    }else if(checked == 1 && answer == 0){
        image = cageimg;
    }else if(checked == 0){
        image = hitimgs[gridimgs[i][j]];
    }
    var w = size[1], h = size[0];
    var s = Math.min(w/image.width, h/image.height);
    if(checked == 1 && answer == 1) s *= 0.5;
    if(checked == 1 && answer == 0) s *= 0.9;
    var rsw = image.width*s, rsh = image.height*s;
    ctx.clearRect(loc[i][j][0], loc[i][j][1], w, h);
    ctx.fillStyle = "#E6E6E6";
    ctx.fillRect(loc[i][j][0], loc[i][j][1], w, h);
    ctx.drawImage(image, loc[i][j][0]+(w-rsw)/2, loc[i][j][1]+(h-rsh)/2, rsw, rsh);
    if(checked == 1 && answer == 1){
        image = cageimg;
        var s = Math.min(w/image.width, h/image.height);
        s *= 0.9;
        var rsw = image.width*s, rsh = image.height*s;
        ctx.drawImage(image, loc[i][j][0]+(w-rsw)/2, loc[i][j][1]+(h-rsh)/2, rsw, rsh);
    }
}

/*-------------------- post messages --------------------*/
// facial landmark tracking instruction
var statusMsg = {
    "detecting": "Detecting face... Move your head a bit if it's not responding.",
    "rotateface": "Your face is tilted. Please rotate your head/camera.",
    "turnface": "You are not facing forward. Please turn your head/camera.",
    "clickrestart": "To correct facial landmarks, adjust posture or click [restart].",
    "toofar": "You are too far away. Please move closer to your screen.",
    "tooclose": "You are too close. Please move back from the screen.",
    "toodark": "Please make sure your face is well lit from the front."
};

// general instruction
var instrMsg = {
    "fail2loadimg":"Sorry, it failed to load game data, please return the HIT.",
    // "startmemtest":"Part 6/6: Relax, you can move your head now. Next, you will see 15 photos: 3 you have already seen and 12 new ones. Pigs are hidding behind the 3 photos. Find the pigs by clicking on them.",
    "timeout":"You did not hit the pig in time. Please read the instructions and tips to see how to improve your aim. </br> Click the [restart] button to try again or press the [esc] key to leave full screen mode (and then you can return the HIT).",
    "moletimeout":"You did not hit the moles in time. Please read the instructions and tips to see how to improve your aim. </br> Click the [restart] button to try again or press the [esc] key to leave full screen mode (and then you can return the HIT).",
    "nohit": "Currently there are no more tasks for you to work on, please return this HIT and come back later.",
    "loadfont": "Game is loading, please wait ...",
    "loadbird": "LOADING ANGRY BIRDS...",
    "loadicon": "LOADING ICONS...",
    "loadimg": "LOADING HIT IMAGES...",
    "loadpig": "LOADING EVIL PIGS...",
    "webbrowser": "Please open this webpage by the Chrome web browser.",
    "copylink": "Please open the link in the Chrome web browser.",
    "camaccess": "Please allow access to your camera.",
    "refreshcamaccess": "Please change the camera setting and reload the page.",
    "fullscreen": "Please keep your browser in fullscreen mode.",
    "quitnwaitdata2server": "You can quit fullscreen, but <span style='color: #FF0000'>DO NOT CLOSE THE TAB !!</span></br>Please relax and wait for data being sent.",
    "waitdata2server": "<span style='color: #FF0000'>DO NOT CLOSE THE TAB !!</span></br>Please relax and wait for data being sent",
    "finishngo": "Thanks for your work!</br></br>Please return to the Amazon Mechanical Turk website and submit your HIT.",
    "finishqt": "Please close this window and return to the Amazon Mechanical Turk website to submit your qualification test.",
    "keepstill": "Please keep your head still during the task.",
    "losttrack": "Face tracking lost.",
    "headmove": "Large head movement detected.",
    "restartwork": "Please click the button below to continue working on this HIT.",
    "calibrationstart": "You will see 9 calibration points.",
    "computertooslow": "The speed of your computer doesn't meet our requirement, please return the HIT.",
    "cameranotsupport":"Sorry that ANGRY GAZE game is not supported in your browser, please return the HIT.",
    "passtest" : "Congratulations! </br> Your computer set-up passed our test.</br> You can close this tab now.",
    "failtest" : "Sorry, your web camera does not meet the requirement of this task.",
    "computertooslow": "The speed of your computer doesn't meet our requirement."
}

// show instruction message
var showInstrMsg = function(message, id, w, h){
    $(id).html(message);
    displayElm2Center(id, w, h);
}

// center an element and display, [w,h]: size of the window
var displayElm2Center = function(id, w, h){
    var l = (w - $(id).width())/2;
    var t = (h - $(id).height())/2;
    $(id).css({left: l, top: t});
    $(id).show();
}

/*-------------------- mathematical computing --------------------*/
// C(n,k)
function nchoosekRandom(n, k){
    var idx = new Array(n);
    var ind = new Array(n);
    for(var i = 0; i < n; i++){
        idx[i] = i;
        ind[i] = false
    } 
    var loc = new Array(k);
    for(var i = 0; i < k; i++){
        var r = Math.floor(Math.random()*(n-i));
        var cnt = -1;
        for(var j = 0; j < n; j++){
            if(ind[j] == false){
                cnt++;
                if(cnt == r){
                    ind[j] = true;
                    loc[i] = j;
                    break;
                }
            }
        }
    }
    return loc;
}

// bilateral filter
function bilateralFilter(queue, cnt, para){
    var base = new Array(2);
    for(var e = 0; e < 2; e++) {
        base[e] = new Array(2); 
        for(var i = 0; i < 2; i++){
            base[e][i] = queue[0][e][i];
        }
    }
    if(cnt == 1) return base;

    var pos = new Array(2);
    var normW = new Array(2);
    for(var e = 0; e < 2; e++) {
        normW[e] = 0;
        pos[e] = new Array(2);
        for(var i = 0; i < 2; i++){
            pos[e][i] = 0;
        }
    }
    for(var k = 0; k < cnt; k++){
        for(var e = 0; e < 2; e ++){
            var w = Math.exp(- k*k/para.sigma_t - 
                (Math.pow(base[e][0]-queue[k][e][0],2)+Math.pow(base[e][1]-queue[k][e][1],2))/para.sigma_pos);
            normW[e] += w;
            for(var i = 0; i < 2; i++){
                pos[e][i] += w*queue[k][e][i];
            }
        }
    }   
    for(var e = 0; e < 2; e++){
        for(var i = 0; i < 2; i++){
            pos[e][i] /= normW[e];
        }
    }
    return pos;
}

function computeAverageIntensity(ctx, x, y, w, h){
    var imageData = ctx.getImageData(x, y, w, h);
    var pixels = imageData.data;
    var meanval = 0;
    for(var i = 0; i < w*h; i++){
        meanval += pixels[i*4];
        meanval += pixels[i*4+1];
        meanval += pixels[i*4+2];
    }
    return meanval/(w*h*3);
}
/*-------------------- what-a-mole --------------------*/
// compute the coordinates of grids
function getmolegridloc(x, y, size, grids, spacing){
  var numy = grids[0];
  var numx = grids[1];
  var w = size[1], h = size[0];
  var loc = new Array(numy); // one row
  for(var i = 0; i < numy; i++){
    loc[i] = new Array(numx);
    for(var j = 0; j < numx; j++){
      loc[i][j] = new Array(2);
      loc[i][j][0] = y + i*spacing + i*h;
      loc[i][j][1] = x + j*spacing + j*w;
    }
  }
  return loc;
}


// hit a mole
function hitmole(){
    if (!MOLETEST) return;
    if (molehitcount >= molehitmax){
        
        molehitcount = 0;
        airmole.remove();
        cntmole--;
        moleNumber.updateNum(cntmole);
        if (cntmole > 0){
            startwhacamole();
        }else{
            molestarttime = null;
            svgpaper.remove();
            $('#fullscreen').show();
            $('#fsoverlay').show();
            display(expsequence); // passed the test
        }
    }else{
        // find grid index
        var gi = -1, gj = -1;
        for (var i = 0; i < moleloc.length; i++){
            if (gi > 0){
                break;
            }
            for (var j = 0; j < moleloc[i].length; j++){
                x = moleloc[i][j][1]+homesize/2, y = moleloc[i][j][0]+homesize/2;
                if( Math.abs(curmousepos[0]-y) <= homesize/2 && Math.abs(curmousepos[1]-x) <= homesize/2){
                    gi = i;
                    gj = j;
                    molehomeobj[i][j].attr("fill", "red");
                }else{
                    molehomeobj[i][j].attr("fill", "green");
                }
            }
        }
        if (gi == curmoleidx[0] && gj == curmoleidx[1]){
            molehitcount++;
        }else{
            molehitcount = 0;
        }
        setTimeout(function(){hitmole();}, 10);
    }
}

function drawTimeController(height, width, length){
    var backBar = svgpaper.rect(20, height, length, width, 0);
    backBar.attr({
        fill: 'darkred'
    });
    var timeBar = svgpaper.rect(20, height, length, width, 0);
    timeBar.attr({
       fill: 'green'
    });
    var timeLeft = svgpaper.text(20 + length + 10, height + 15, gameTotalTime/1000 + " seconds")
                    .attr({
                        fill: "white",
                        stroke: "white"
                    });

    var setTimeout = function(millsec){
        timeBar.animate({
            width: 0,
            x: 20 + length
        }, millsec);

        Snap.animate(millsec, 0, function(value){
            timeLeft.attr({
                text: Math.ceil(value/1000) + ' seconds'
            });
        }, millsec);
    }
    return {
        setTimeout: setTimeout
    }
}

function drawMoleStatus(width, height, number){
    var numLeft = svgpaper.text(width, height + 15, number + " Left")
                    .attr({
                        fill: "white",
                        stroke: "white",
                        'text-anchor': "end"
                    });
    var updateNum = function(num){
        numLeft.attr('text', num + " Left")
    }
    return {
        updateNum: updateNum
    }
}


// draw a mole
function drawmole(x, y, loc, size, idx, r1, r2) {
    var PATHS = [
        'M0,0c0,0,0-28.008,0-46.707S0-130,0-130'
    ];

    var i = idx[0],
        j = idx[1];
    var group = svgpaper.g();
    var path = svgpaper.path(PATHS[Math.floor(Math.random() * PATHS.length)]);
    totalLength = path.getTotalLength();
    path.attr({
        fill: 'none',
        stroke: "orange",
        strokeWidth: 150,
        strokeMiterlimit: 10,
        strokeLinecap: 'round',
        opacity: 1,
        strokeDasharray: totalLength + " 200",
        strokeDashoffset: totalLength
    });

    group.add(path);

    group.transform("t" + [loc[i][j][1] + size / 2, loc[i][j][0] + size / 2]);

    var mouth,
        eye,
        ey2;

    var face = svgpaper.g();
    face.attr({
        'class': 'face animating'
    });

    mouth = svgpaper.circle(0, 5, 6);
    mouth.attr({
        fill: 'white',
        'class': 'mouth'
    });
    face.add(mouth);

    eye = svgpaper.path('M-2.75-6.75c0,0-2.537,2.5-5.667,2.5s-5.667-2.5-5.667-2.5s2.537-2.5,5.667-2.5S-2.75-6.75-2.75-6.75z');
    eye.attr({
        fill: '#555555',
        'class': 'eye left'
    });
    face.add(eye);

    eye2 = svgpaper.path('M14.583-6.75c0,0-2.537,2.5-5.667,2.5S3.25-6.75,3.25-6.75s2.537-2.5,5.667-2.5S14.583-6.75,14.583-6.75z');
    eye2.attr({
        fill: '#555555',
        'class': 'eye right'
    });
    face.add(eye2);

    face.transform("s2");
    group.add(face);

    var point = path.getPointAtLength(this.totalLength - 0);

    // track mouse position
    path.animate({
        strokeDashoffset: 0
    }, 500);

    face.animate({transform: 't'+[point.x,point.y] + "s2"},500);

    $('svg').on("mousemove", function(e) {
        curmousepos = [e.pageY, e.pageX];
    });
    hitmole();

    return group;
}


// start to draw mole
function startwhacamole(){
    curmoleidx = [Math.floor(Math.random()*nummole[0]), Math.floor(Math.random()*nummole[1])];
    airmole = drawmole(molex, moley, moleloc, homesize, curmoleidx, 0, 80);
}

// draw rectangles on the grids
function drawmolehome(loc, size, r, color){
    var svgobj = new Array(loc.length);
    for (var i = 0; i < loc.length; i++){
        svgobj[i] = new Array(loc[i].length);
        for (var j = 0; j < loc[i].length; j++){
            svgobj[i][j] = svgpaper.rect(loc[i][j][1], loc[i][j][0], size, size, r);
            svgobj[i][j].attr("fill", color);
        }
    }
    return svgobj;
}

