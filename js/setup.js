
// -------------------- load media of the task -------------------- 
var numimg = 0, numpnt = 0, numabtest = 0;
function grabimgs(){
  // grab multimedia data
  $.getJSON(imglisturl, function(data) {
    gazeimglist = data.gaze;
    memoryimglist = data.memory;
    videolist = data.video;
    hitmode = data.hitmode;

    // calibration settings
    numpts = eval(getURLParameter('numpts', null)); // calibration
    if (numpts == null){
      if (hitmode == 'whacamole'){
        numpts = 9;
      }else{
        numpts = 13;
      }
    }
    CalbrPoints = CalbrPointsPos[numpts.toString()];
    points = new Array(CalbrPoints.length*2);
    for(var i = 0; i < CalbrPoints.length; i++){
      points[2*i] = CalbrPoints[i]; // idle
      points[2*i+1] = CalbrPoints[i]; // busy
    }

    // image viewing settings
    if (hitmode == 'whacamole'){
      idleLen = 600; 
      busyLen = 300;
    }else{
      idleLen = 800; 
      busyLen = 300;
    }

    if (hitmode == "angrybirddot"){
      imgLen = 1500;
      hitmode = null;
    }

    // preload video stimulus
    if (videolist != undefined){
      if (videolist.length > 0 && videolist[0].length > 0){
        console.log('Preloading videos...')
        videoobjs = new Array(videolist.length);
        videoload = new Array(videolist.length);
        for (var b = 0; b < videolist.length; b++){ // batch
          videoobjs[b] = new Array(videolist[b]);
          videoload[b] = new Array(videolist[b]);
          for (var c = 0; c < videolist[b].length; c++){ // clips in a batch
            videoobjs[b][c] = null;
            videoload[b][c] = 0;

            playable = false;
            for (var t = 0; t < videolist[b][c].source.type.length; t++){
              if (videotypes[videolist[b][c].source.type[t]] == 1){
                console.log('Can play: ' + videolist[b][c].source.url[t]);
                videoobjs[b][c] = document.createElement('video');
                videoobjs[b][c].autoplay = false;
                videoobjs[b][c].src = videolist[b][c].source.url[t];
                videoobjs[b][c].addEventListener('loadeddata', function() {
                  var s = Math.min(sW/this.videoWidth, sH/this.videoHeight);
                  this.width = this.videoWidth*s;
                  this.height = this.videoHeight*s;
                  console.log('Video is loaded and can be played. Resized:' + this.width + '*' + this.height);
                }, false);
                videoobjs[b][c].onplay = function(){
                  console.log('Playing: ' + this.src);
                  console.log('Video resolution: ' + this.videoWidth + '*' + this.videoHeight);
                  drawclipframe();
                }
                videoobjs[b][c].load();
                playable = true;
                console.log(videoobjs[0][1])
                break;
              }
            }
            if (!playable){ // no playable format
              console.log('Video cannot be played: ' + JSON.stringify(videolist[b][c].source));
              noHITinDB = true; 
              return;
            }
          }
        }
        // counting and idxing
        for (var b = 0; b < videolist.length; b++){ // batch
          for (var c = 0; c < videolist[b].length; c++){
            clipidx.push([b,c]);
          }
        }
        // start monitoring the progress of video preloading
        videohit = true;
        checkVideoPreload();
      }
    }else{
      if (hitmode != null && hitmode == 'whacamole'){
        whachit = true;
      }else{
        imagehit = true;  
      }

      // image stimulus
      batchconfig = new Array(gazeimglist.length); // number of images in each batch
      numimg = 0;
      for(var i = 0; i < gazeimglist.length; i++){
        batchconfig[i] = gazeimglist[i].length;
        numimg += gazeimglist[i].length;
      }

      if(numimg == 0){
        alert('Image list missing.');
        noHITinDB = true; 
        return;
      }
      
      if(memoryimglist == undefined || memoryimglist.length < numgrids[0]*numgrids[1] - numshown){
        MemTest = false;
        imgpaths = new Array(numimg);
      }else{
        imgpaths = new Array(numimg+numgrids[0]*numgrids[1] - numshown);
      }   
      
      var cnt = 0;
      for(var i = 0; i < gazeimglist.length; i++){
        for(var j = 0; j < gazeimglist[i].length; j++){
          imgpaths[cnt++] = gazeimglist[i][j];
        }
      }
      if(MemTest){
        for(var i = 0; i < memoryimglist.length; i++){
          imgpaths[cnt++] = memoryimglist[i];
        } 
      }
    }
    if (videohit || whachit) MemTest = false;
    
    if (!videohit && !imagehit && !whachit){
      noHITinDB = true;
      return;
    }

    // create procedure
    subp1 = ['msg', 'calibration', 'point', numpts+1, 'msg', 'abtest', 'abtest'];
    subp2 = ['msg', 'image', 'img'];
    subp3 = ['msg', 'video', 'clip'];
    if (imagehit){
      numbatch = gazeimglist.length;
      procedure = new Array((numbatch+1)*subp1.length + numbatch*(subp2.length+1));
      var cnt = 0;
      for(var i = 0; i <= numbatch; i++){
        for(var j = 0; j < subp1.length; j++){
          procedure[cnt++] = subp1[j];
        }
        if(i < numbatch){
          for(var j = 0; j < subp2.length; j++){
            procedure[cnt++] = subp2[j];
          }
          procedure[cnt++] = gazeimglist[i].length;
        }
      }
    }else if(videohit){
      numbatch = videolist.length;
      procedure = new Array((numbatch+1)*subp1.length + numbatch*(subp3.length+1));
      var cnt = 0;
      for(var i = 0; i <= numbatch; i++){
        for(var j = 0; j < subp1.length; j++){
          procedure[cnt++] = subp1[j];
        }
        if(i < numbatch){
          for(var j = 0; j < subp3.length; j++){
            procedure[cnt++] = subp3[j];
          }
          procedure[cnt++] = videolist[i].length;
        }
      }
    }else if(whachit){
      procedure = [];
      procedure.push('msg');
      procedure.push('calib_mole');
      procedure.push('point');
      procedure.push(numpts+1);
      for(var i = 0; i < gazeimglist[0].length; i++){
        procedure.push('level');
        procedure.push(i+1);
        procedure.push('bgimg');
        procedure.push('moletest');
      }
    }
    if(imagehit){
      numpart = 1;
    }else if(videohit){
      numpart = 0;
    }
    
    for( var i = 0; i < procedure.length; i++){
      var m = procedure[i];
      if(m == 'calibration' || m == 'img' || m == 'clip') numpart++;
    }
    var cntpart = 1;
    for(var i = 0; i < procedure.length; i++){
      switch (procedure[i]){
        case 'msg':
          msgtype = procedure[++i];
          for(var j = 0; j < 3; j++){ // 3 seconds counting down
            sequenceType.push(3); // instruction message
            sequenceTag.push(2);
            switch (msgtype){
              case 'image': 
                // ExprMsgs.push("<span style='color: #FF0000; font-size: 150%'>KEEP YOUR HEAD STILL!!</span> </br> <span style='font-size: 120%'>Look closely at each image.</span>");
                ExprMsgs.push("Part " + cntpart + "/" + numpart + ": <span style='font-size: 120%'>Remember photos</span>");
                break;
              case 'video':
                ExprMsgs.push("Part " + cntpart + "/" + numpart + ": <span style='font-size: 120%'>Watch videos</span>");
                break;
              case 'calibration':
                // ExprMsgs.push("<span style='color: #FF0000; font-size: 150%'>KEEP YOUR HEAD STILL!! NO BLINK!!</span> </br> <span style='font-size: 120%'>Gaze at each bird until the dot disappears.</span>");
                ExprMsgs.push("Part " + cntpart + "/" + numpart + ": Stare at birds");
                break;
              case 'abtest':
                // ExprMsgs.push("<span style='color: #FF0000; font-size: 150%'>KEEP YOUR HEAD STILL!!</span> </br> <span style='font-size: 120%'>Stare at the evil pig to kill it.</span>");
                ExprMsgs.push("Kill the pig");
                break;
              case 'calib_mole':
                ExprMsgs.push("Stare at birds");
                break;
            }
          }
          if(msgtype == "image" || msgtype == "calibration" || msgtype == "video") cntpart++;
          break;
        case 'level':
          level = procedure[++i];
          for(var j = 0; j < 3; j++){ // 3 seconds counting down
            sequenceType.push(3); // instruction message
            sequenceTag.push(2);
            ExprMsgs.push("LEVEL " + level);
          }
          break;
        case 'point':
          var num = procedure[++i];
          for(var j = 0; j < num; j++){
            sequenceType.push(0); // blank
            sequenceTag.push(2);
            sequenceType.push(0); // point, training
            sequenceTag.push(0);
          }
          break;
        case 'img':
          var num = procedure[++i];
          for(var j = 0; j < num; j++){
            sequenceType.push(4); // count down, testing
            sequenceTag.push(1);
            sequenceType.push(1); // image, testing
            sequenceTag.push(1);
          }
          break;
        case 'bgimg':
          sequenceType.push(1); // image, testing
          sequenceTag.push(1);
          break;
        case 'abtest':
          sequenceType.push(5); // angry bird test, blank
          sequenceTag.push(2); 
          break;
        case 'moletest':
          sequenceType.push(7); // whac a mole test, blank
          sequenceTag.push(2); 
          break;
        case 'clip':
          var num = procedure[++i];
          for(var j = 0; j < num; j++){
            sequenceType.push(4); // count down, testing
            sequenceTag.push(1);
            sequenceType.push(6); // video, testing
            sequenceTag.push(1);
          }
          break;
        default:
        ;
      }
    }
    
    for(var i = 0; i < sequenceType.length; i++){
      // if(sequenceType[i] == 1) numimg++; // image
      if(sequenceType[i] == 0 && sequenceTag[i] == 0) numpnt++; // point
      if(sequenceType[i] == 5) numabtest++; // image
    }
    var numcalipntset = 0;
    for(var i = 0; i < procedure.length; i++){
      if(procedure[i] == 'point') numcalipntset++;
    }
    if(numcalipntset > 1) kfold = numcalipntset; // number of folds for cross validation
    if (imagehit){
      maxscore = numshown*(basemark + Math.floor(memetesTimeLimit/1000)*stepmark_catch) + numcalipntset*numPig*basemarkpig + Math.floor(abtestLen/1000)*stepmark_kill;      
    }

    setupexperiment();
    noHITinDB = false;
  })
  .fail(function() {
    noHITinDB = true; 
  })
  .always(function() {  
  });
}


// check the status of preloading videos
function checkVideoPreload(){
  checkVideoPreloadRequest = requestAnimationFrame(checkVideoPreload);
  var loadcomplete = true;
  for (var b = 0; b < videoobjs.length; b++){
    for(var c = 0; c < videoobjs[b].length; c++){
      if (videoobjs[b][c] != null && videoobjs[b][c].readyState != 4){
        loadcomplete = false;
        break;
      }
    }
  }
  if (loadcomplete){
    cancelAnimationFrame(checkVideoPreloadRequest);
    VIDEOLOADED = true;
  }
}

// display video on fullscreen canvas
function drawclipframe(){
  var b = livevideo[0], c = livevideo[1];
  var vw = videoobjs[b][c].width;
  var vh = videoobjs[b][c].height;
  if(videoobjs[b][c].paused || videoobjs[b][c].ended) return;
  var t = new Date().getTime();
  if ((t - livevideopara[1]) > livevideopara[0]){
    videoobjs[b][c].pause();
    return;
  }
  ctx.drawImage(videoobjs[b][c], (sW-vw)/2, (sH-vh)/2, vw, vh);
  setTimeout(drawclipframe, 20);
}

function playvideos(b, c){
  console.log('Play video!');
  // stop any video in progress
  if (livevideo != null && videoobjs[livevideo[0]][livevideo[1]] != null){
    videoobjs[livevideo[0]][livevideo[1]].pause();
  }
  ctx.fillStyle = "#000";
  ctx.fillRect(0,0,sW,sH);

  livevideo = [b, c];
  var t = new Date().getTime();
  livevideopara = [videolist[b][c].playlen, t];
  if(livevideo != null && videoobjs[b][c] != undefined){
    videoobjs[b][c].play();
  }
}

// start loding images
grabimgs();
// preload images
var cntTipsLoaded = 0;
function createTipsSection(){
  checkTipsLoading();
  // set up DOM section for tips 
  var y = sH - tipimgSize - tipimgSpacing - 120;
  $('#tipsdiv').css({"left": 0, "top": y});
  var numtips = tipsimggroup.length;
  var x = (sW - numtips*tipimgSize - (numtips+1)*tipimgSpacing)/2;
  for(var j = 0; j < numtips; j++){
    // div
    var $newdiv = $("<div id='tipssec"+j+"'/>");
    $("#tipsdiv").append($newdiv);
    $('#tipssec'+j).css({"left": (x+j*tipimgSize+(j+1)*tipimgSpacing), "top": 0, "width":tipimgSize});
    // image
    var img;
    for(var i = 0; i < tipsimggroup[j].length; i ++){
      img = $('<img>');
      img.load(function(){
        drawslider(100, Math.floor(85+cntTipsLoaded/tipimgpaths.length*15));
        cntTipsLoaded++;
      });
      img.error(function(){onFailLoadImg('tipsimg:'+this.src);});
      img.attr('src', tipimgpaths[tipsimggroup[j][i]]);
      img.appendTo('#tipssec'+j);
      img.css({"width":tipimgSize, "height":tipimgSize});
    }
    // message
    var newtipp = $("<p id='tips"+j+"'/>");
    newtipp.appendTo('#tipssec'+j);
  } 
  for(var j = 0; j < numtips; j++){
    $('#tips'+j).css({"left": 0, "top": tipimgSize, 'max-width':tipimgSize, 'position':'relative'});
    $('#tips'+j).html(tipmsg[j]);
  }
}
function checkTipsLoading(){
  checkTipsLoadingRequest = requestAnimFrame(checkTipsLoading);
  if (cntTipsLoaded >= tipimgpaths.length){
    cancelAnimationFrame(checkTipsLoadingRequest);
    $('#slider').hide();

    // set up canvas
        setUpCanvas();
    return;
  }
}
var cntInstImgLoaded = 0;
function createInstrImgSection(){
  checkInstrImgLoading();
  var img;
  for(var i = 0; i < instrimgpaths.length; i++){
    img = $('<img>');
    img.load(function(){
      drawslider(100, Math.floor(70+cntInstImgLoaded/instrimgpaths.length*15));
      cntInstImgLoaded++;
    });
    img.error(function(){onFailLoadImg('instrimg:'+this.src);});
    img.attr('src', instrimgpaths[i]);
    img.appendTo('#instrimgdiv');
    img.css({"width":"20%"});
    img.css({'border-radius':'15px', 'border-color:':'#444', 'border':"5"});
  }
}
function checkInstrImgLoading(){
  checkTInstrImgLoadingRequest = requestAnimFrame(checkInstrImgLoading);
  if (cntInstImgLoaded >= instrimgpaths.length){
    cancelAnimationFrame(checkTInstrImgLoadingRequest);
    createTipsSection();
    return;
  }
}

// preloading hit images and memory images
function preloadHitImgs(idx){
  if(idx >= imgpaths.length){
    createInstrImgSection();
    return;
  }
  hitimgs[idx] = new Image();
  hitimgs[idx].onload = function(){
    drawslider(100, Math.floor(40+idx/imgpaths.length*30));
    preloadHitImgs(idx+1);
  };
  hitimgs[idx].onerror = function(){onFailLoadImg('hitimg:'+this.src);};
  hitimgs[idx].src = imgpaths[idx];
}

function checkOKLoading(){
  checkOKLoadingRequest = requestAnimFrame(checkOKLoading);
  if(OKLoad == true){
    if (imagehit || whachit || (videohit && VIDEOLOADED)){
      cancelAnimationFrame(checkOKLoadingRequest);
      if(imagehit || videohit){
        preloadPigs(0);
      }else if(whachit){
        preloadHitImgs(0);
      }
    }
  }
}

// preloading gray pig images
var graypigset = new Array(graypigs.length);
var cageimg;
function preloadGrayPigs(idx){
  if(idx >= graypigs.length){
    cageimg = graypigset.pop();
      if (imagehit){
        preloadHitImgs(0);  
      }else if(videohit){
        createInstrImgSection();
      }
    return;
  }
  graypigset[idx] = new Image();
  graypigset[idx].onload = function(){
    drawslider(100, Math.floor(30+idx/graypigs.length*10));
    preloadGrayPigs(idx+1);
  };
  graypigset[idx].onerror = function(){onFailLoadImg('graypig:'+this.src);};
  graypigset[idx].src = graypigs[idx];
}

// preloading pig images
var pigset = new Array(pigs.length);
function preloadPigs(idx){
  if(idx >= pigs.length){
    preloadGrayPigs(0);
    return;
  }
  pigset[idx] = new Image();
  pigset[idx].onload = function(){
    drawslider(100, Math.floor(20+idx/pigs.length*10));
    preloadPigs(idx+1);
  };
  pigset[idx].onerror = function(){onFailLoadImg('pig:'+this.src);};
  pigset[idx].src = pigs[idx];
}

// preloading icon images
var iconset = new Array(icons.length);
function preloadIcons(idx){
  if(idx >= icons.length){
    checkOKLoading();

    return;
  }
  iconset[idx] = new Image();
  iconset[idx].onload = function(){
    drawslider(100, Math.floor(10+idx/icons.length*10));
    preloadIcons(idx+1);
  };
  iconset[idx].onerror = function(){onFailLoadImg('icon:'+this.src);};
  iconset[idx].src = icons[idx];
}
function onFailLoadImg(msg){
  $("#instrmsgP").html(instrMsg.fail2loadimg);
}
