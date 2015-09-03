// -------------------- global parameters -------------------- 
// visualize optical flow results
var TEST_STABILIZATION = eval(getURLParameter('cstabilize', false));
// visualize prediction results
var VISUALIZATION = eval(getURLParameter('visualize', false));
var DOWNLOAD_DATA = eval(getURLParameter('download', true)); // download data to local file
var MemTest = eval(getURLParameter('memtest', true));
// whether send raw data with "plank" tag
var SHOWONLINE = eval(getURLParameter('online', false));
var imglisturl = getURLParameter('imglist', './demo/imglist.json');

// status flags
var RESTART = false; // restart state, stop displaying
var DISPLAYON = false; // display loop is on
var DISPLAYDOTON = false; // display circle loop is on
var KEY_DOWN = false;
var EXPERIMENT_END = false;
var ABTEST = false;
var FONTLOADED = false;
var OKLoad = false;
var noHITinDB = null; 

// load font
var loadfontTime;
var maxloadfontTime = 1000;

// instruction message
var statusMsgBarColor = "#ffc107", statusMsgBarMsgColor = "#212121";
var disableBttnColor = "#A4A4A4", startBttnColor = "#3399FF",closeTabBttnColor = "#3399FF", 
visBttnColor = "#3399FF", copyBttnColor = "#3399FF";

// getUserMedia setting
var hdW = 1280, hdH = 720; // high resolution canvas
var fps = 30;
var getUserMediaConstraints = {
 "audio": false,
 "video": {
  "mandatory": {
   "minWidth": hdW,
   "minHeight": hdH,
   "minFrameRate": fps,
   "maxWidth": hdW,
   "maxHeight": hdH,
   "maxFrameRate": fps
  },
  "optional": []
 }
};

// full screen 
var pfx = ["webkit", "moz", "ms", "o", ""];
// screen size
var sW, sH;
// canvas used for video streaming
var showW = 640, showH = 360;
var drawW, drawH, imgCanvas, imgCanvasCtx;
// overlay canvas: display facial landmarks
var overlay, overlayCtx;
// overlay canvas: display instruction message
var msgoverlay, msgoverlayCtx;
// set up canvas to work on tracking: mid resolution
var trckW = 640, trckH = 360, trackCanvasCtx, trackCanvas;
var lastFrameTimeTrck, lastFrameTimeStb;
var trckInterval = 120;
// var trckW = 512, trckH = 288, trackCanvasCtx, trackCanvas;
// set up canvas to work on feature extraction: high resolution
var hdW = 1280, hdH = 720, hdCanvasCtx, hdCanvas;
// full-screen display canvas
var ctx, fsCanvas;
// full-screen overlay
var fsoverlayCtx, fsoverlayCanvas;
// scaling factor btw high and mid resolution	
var scaleW = hdW/trckW, scaleH = hdH/trckH;
// canvas position
var cvsshift = -360, cvsmargin = 40;
// massage bar
var barw = showW, barh = 50;
// video stream	
var localSream;
// video recorder
var recordW = 320,recordH = 180;
var recorder = null, ImageData; // store video frames
var eyeCanvas, eyeCanvasCtx; // canvas to draw eye images
var webp_quality = 1;

// valid tracking results
var mineyewHD = 30, mineyehHD = 15; // minimum high res eye size
var minEyeW = mineyewHD/hdW*trckW, maxEyeW = minEyeW*4.5, maxRoll = 20, maxYaw = 20;
var patchsize = [null, null];
var prev_stable_pos, stable_idx = [33,34,35,36,37,38,39,40,41,42,43,62], stable_th = 35; // detect rapid change
var minIntensity = 30;
var cntFPS = 0, minFPS = 15, avgFPS = 0, numFPSframe = 50; 
// feature extraction
// var optionColorhist = {"nbins":[[2,3],[4,5],[8,10]], "pw":mineyewHD, "ph":mineyehHD};
var optionColorhist = {"nbins":[[6,10]], "pw":mineyewHD, "ph":mineyehHD};
var colorhist, colorhistmargin = 2.2; // histogram feature extractor

// training, testing, raw data collector
var trainQueue, testQueue, blankQueue, dataQueue, detectQueue, displayQueue, timeQueue;
var resultQueue, saveQueue; // data to save
var memActionQueue, pigQueue;

//instruction and tips images
var instrimgSize = 200, instrimgSpacing = 25, tipimgSize = 180, tipimgSpacing = 20;
var logoimgpath = ["./icons/instr/whac_a_mole_gaze_px.png"];
var instrimgpaths = ["./icons/instr/step1.png", "./icons/instr/step2.png", "./icons/instr/step5.png", "./icons/instr/step3.png", "./icons/instr/step4.png"];
var tipimgpaths = ["./icons/tips/1.png", "./icons/tips/2.png", "./icons/tips/3.png", "./icons/tips/4.png", "./icons/tips/5.png", "./icons/tips/6.png", "./icons/tips/7.png", "./icons/tips/8.png", "./icons/tips/9.png", "./icons/tips/10.png", "./icons/tips/11.png", "./icons/tips/12.png", "./icons/tips/13.png"]; 
var tiploop = [[0,2,5,7,10],[1,3,6,8,11],[0,4,5,9,10],[1,2,6,7,11],[0,3,5,8,10],[1,4,6,9,11]];
var tipmsg = ['Sit in good lighting.', 'Light face from front.', 'Make sure tracking works.', 'Keep head still.', 'Stare bird until it moves. Avoid blinks.'];
var tipsimggroup = [[0], [1,2,3], [4,5], [6,7,8], [9,10,11,12]];

// calibration
var numpts;
var curposdisplay; // index of current display content
var pointBckColor = "#000", pointRadius = 30, pointColor = "#FF0000", pointRadiusMid = 5;
var imgBckColor = "#000000";
var crossBckColor = "#000000", crossRadius = 20, crossColor = "#FF0000", crosslineWidth = 8;
var fsmsgBckColor = "#000000", msgColor = "#000000", fsmsgColor = "#FFFFFF";
var instrBodyColor = "#FFF", visBlankBckColor = '#FFF', visBlankFrmColor = '#000';
var iconsize = 80;
var ringLineWith = 5;
var crosshairRadius = 20;
var crosshairCircW = 4, crosshairCrsW = 2;
var CalbrPointsPos = { // patterns of calibration points
  "9":[[0.500,0.500],[0.050,0.050],[0.950,0.500],[0.500,0.950],[0.950,0.050],[0.050,0.500],[0.950,0.950],[0.500,0.050],[0.050,0.950],[0.500,0.500],
          [0.500,0.500],[0.050,0.500],[0.500,0.950],[0.950,0.500],[0.050,0.050],[0.950,0.050],[0.050,0.950],[0.500,0.050],[0.950,0.950],[0.500,0.500],
          [0.500,0.500],[0.950,0.950],[0.050,0.950],[0.950,0.500],[0.050,0.050],[0.950,0.050],[0.050,0.500],[0.500,0.950],[0.500,0.050],[0.500,0.500],
          [0.500,0.500],[0.050,0.050],[0.950,0.500],[0.500,0.950],[0.950,0.050],[0.050,0.500],[0.950,0.950],[0.500,0.050],[0.050,0.950],[0.500,0.500]],
  "13":[[0.500,0.500],[0.050,0.050],[0.950,0.500],[0.275,0.275],[0.500,0.950],[0.950,0.050],[0.275,0.725],[0.050,0.500],[0.950,0.950],[0.725,0.725],[0.500,0.050],[0.050,0.950],[0.725,0.275],[0.500,0.500],
          [0.500,0.500],[0.050,0.500],[0.500,0.950],[0.275,0.275],[0.950,0.500],[0.050,0.050],[0.275,0.725],[0.950,0.050],[0.050,0.950],[0.725,0.725],[0.500,0.050],[0.950,0.950],[0.725,0.275],[0.500,0.500],
          [0.500,0.500],[0.950,0.950],[0.050,0.950],[0.275,0.275],[0.950,0.500],[0.050,0.050],[0.275,0.725],[0.950,0.050],[0.050,0.500],[0.725,0.725],[0.500,0.950],[0.500,0.050],[0.725,0.275],[0.500,0.500],
          [0.500,0.500],[0.050,0.050],[0.950,0.500],[0.275,0.275],[0.500,0.950],[0.950,0.050],[0.275,0.725],[0.050,0.500],[0.950,0.950],[0.725,0.725],[0.500,0.050],[0.050,0.950],[0.725,0.275],[0.500,0.500]]        
};
var CalbrPoints = [];
var points;

// duration of stages settings
var idleLen, busyLen; 
var testLen = 3500, transLen = 500, imgLen = 3000, cntdownLen = 500, abtestLen = 10000; // duration of each type
var whacamoleLen = 20000;
var msgLen = 400;

// angry bird test
var numPig = 2; // number of pig to hit
var numPigHit = 25; // number of gaze HITs
var cntPig, curpigpos, hitcountdown, curpigidx, lowblood;
var pigsize = 80;
var lowbloodTh = 0.5, bloodRectH = 15, bloodRectW = 1.5*pigsize;
var bloodRectColor = "0F0";
var abtestStartTime = null, killpigscore = 0;
var icons = ["./icons/ab/ab1.png", "./icons/ab/ab2.png", "./icons/ab/ab3.png", "./icons/ab/ab4.png", "./icons/ab/ab5.png", "./icons/ab/ab6.png", "./icons/ab/ab7.png", "./icons/ab/ab8.png", "./icons/ab/ab9.png"];
var iconcolor = ["#FF0000", "#31B404", "#01A9DB", "#F2F5A9", "#FFFF00", "#9F81F7", "#DF3A01", "#F781BE", "#2ECCFA"];
var pigs = ["./icons/ab/pig1.png", "./icons/ab/pig2.png", "./icons/ab/pig3.png", "./icons/ab/pig4.png", "./icons/ab/pig5.png", "./icons/ab/pig6.png"];
var graypigs = ["./icons/ab/pig1_gray.png", "./icons/ab/pig2_gray.png", "./icons/ab/pig3_gray.png", "./icons/ab/pig4_gray.png", "./icons/ab/pig5_gray.png", "./icons/ab/pig6_gray.png", "./icons/ab/cage.png"];

// optical flow
var opticlflw_idx = [ // manually chosen landmarks for optical flow
// 23, 24, 25, 26, 28, 29, 30, 31, // eye
35, 36, 37, 38, 39, 42, 43, // nose
33, 41, 62, //nose bridge
15, 16, 17, 18, 19, 20, 21, 22 // eyebrow
// 44, 50// mouth
]; 
// var opticlflw_mp_idx = [[0, 1, 2, 3],[4, 5, 6, 7]]; 
var opticlflw_mp_idx = [[23,24,25,26],[28, 29, 30, 31]]; 
var opticlflw_para = {"pw":null, "ph":null, "w":null, "h":null, 
"th":4, "ema_alpha":0.1, "scale":{"x":scaleW, "y":scaleH}};
var opticlflw;
var midpoint; // middle point for eye patch bounding box

// regression
var learning_para = {"name":"ridge_regression", "parameter": 1e-5};
var mlmodel, model, train_result, test_result;
var mlmodel_online, model_online = null;
var looerr = null, kfold = 2;

// visualization
var dataPos; // location of current frame
var lastShowFrameTime, currVisFrameNum;
var smlW = 200, smlH = smlW/3*2, smlx = 20, smly = 40; // small window
var smlFontColor = "#0000FF", smlLineWidth = 3, smlFrameColor = "#FFFF00";
var smlBckColor = "#000000", smlPntRadius = 4, smlCrxRadius = 10, smlCrxLineWidth = 4; 
var predPntColor = "#0000FF", predPntColorTest = "#00FF00";
var cursmlImg, cursmlImgSrc;

// animation frame request
var visualRequest, checkFullscreenOnRequest, displayLdmkRequest, ldmkTrackRequest, abtestRequest, displayStreamRequest;

// data transmition
var resultcarrier = null;
var rawcarrier = null;
var download_fname = 'test.txt';
var delimiter = '', bsize = 5, sendinterval = 50; // meta data and result
var delimiter_raw = '', bsize_raw = 30, sendinterval_raw = 50; // raw data
var margin_raw = [0,0]; // margin for cropping eye patch
var eyepatchratio = 0.6; // aspect ratio for eye patch

// memorability test
var numgrids = [3, 5], gridsize = [210, 210], gridspacing = 10;
var numshown = 3;
var gridloc; // location of each image grid
var gridmark; // marks for each bird
var gridsel = null; // 0: unchecked, 1: checked
var gridimgs = null; // image path
var gridColor = "#E6E6E6";
var selgridColor = ["#0F0", "#F00"];
var gridLineWidth = 2;
var selLineWidth = 5;
var gridselans = null;
var memtestStartTime = null;
var memetesTimeLimit = 20000;
var basemark = 500, basemarkpig = 500;
var stepmark_catch = 5, stepmark_kill = 10;
var penaltymark = 250;
var MEMTESTON = false;
var MEMTESTPREVIEW = false;
var gridx = 50, gridy = 150;
var memtestscore = null, bestpastscore = 'NA';
var weightedacc = null;
var memrank = 0;
var maxbonusmoney = 4; // in cents
var bonusmoney = 0;

// performance test_result
var max_meanerr_practice = 0.08, max_meanerr_realgame = 0.07;
var scoreUpdate = false;

// for debug
var jittercnter = -1, jitterloc = null;
var savoploc = [], savejitterloc = [], savebfloc = [];

// bilateral filtering
var bfilterLen = 30;
var bfilterQ = new Array(bfilterLen);
var bfilterCnt = 0;
var bfilter_para = {"sigma_t":20*20*2, "sigma_pos":3*3*2};

// image stimulus
var hitimgs;

// video stimulus
var livevideo = null; // batch, idx
var livevideopara = null;// play_length, start_time
var videolist, videoobjs, videoload;
var videotypes = {"video/mp4":[], "video/ogg":[], "video/webm":[]};
var keys = Object.keys(videotypes)
var v = document.createElement('video');
for (var t = 0; t < keys.length; t++){
  if (v.canPlayType(keys[t])){
    videotypes[keys[t]] = 1;
  }
}
var VIDEOLOADED = null;
var videohit = false, imagehit = false, whachit = false; // video hit or image hit or whac-a-mole hit
var clipidx = [];

// whac-a-mole settings
var gapmole = 0.1;
var molecorner = 0.5;
var homesize, moley, molex, moleloc;
var svgpaper = null, svgbg, molehomeobj;
var curmoleidx, airmole;
var molehitcount = 0;
var molehitmax = 40;
var MOLETEST = false;
var cntmole;
var curmousepos = [-1, -1];
var timeController;
var toolbarHeight = 100, gameTotalTime;
var level2mole = [3, 3];
var molegrid = [[3,4], [4,5]]; // layout of grids for different level
var levelstatus = Array.apply(null, new Array(level2mole.length)).map(Boolean.prototype.valueOf ,false);
var molestarttime = null;
var nummole;

// sound effects
var iconsound = new Howl({urls: ['./icons/sound/s1.mp3', './icons/sound/s1.mp3']}); // bird shows up
var truesound = new Howl({urls: ['./icons/sound/s4.mp3', './icons/sound/s4.mp3']}); // correct selection sound
var falsesound = new Howl({urls: ['./icons/sound/s3.mp3', './icons/sound/s3.mp3']}); // wrong selection sound
var laseracesound = new Howl({
  urls: ['./icons/sound/laser_ace.mp3', './icons/sound/laser_ace.ogg'],
  sprite: {
    laser: [2500, 1500], // bullet
    winner: [6000, 1200], // pig disappers
    awesome: [10500, 1500] // memory test ends
  },
  volume: 0.2
});

// -------------------- experiment parameter settings -------------------- 
function countdownMsg(idx){
  return "<span style='color: #3399FF; font-size: 65px'>" + idx.toString() + "</span>";
}
// 
var typeset = ["point", "image", "cross", "message", "cntdown", "abtest", "video", "whacamole"]; 
var tagset = ["train", "test", "blank"]; // {"train":0, "test":1, "blank":2}
var maxscore = 0; 

var imgpaths = [];
var numimg = 0;
var numpart = 0;

// the displaying sequence  
var sequenceType = [], sequenceTag = [], ExprMsgs = [], expsequence = [];
function setupexperiment(){
  var cntpt = 0, cntimg = 0, cntmsg = 0, cntabtest = 0, cntvideo = 0, cntlevel = 0;
  var cntdownidx;
  if (imagehit){
    cntdownidx = numimg;
    hitimgs = new Array(imgpaths.length);
  }
  if (videohit){
    cntdownidx = clipidx.length;  
  }
  if (whachit){
    hitimgs = new Array(imgpaths.length); 
  }
   
  expsequence = new Array(sequenceType.length);
  for(var i = 0; i < sequenceType.length; i++){
    switch(typeset[sequenceType[i]]){
      case "point":
        if(tagset[sequenceTag[i]] == "train"){
          expsequence[i] = {"type":"point", "location": points[cntpt], "duration":busyLen, "tag":"train"};
        }else if(tagset[sequenceTag[i]] == "blank"){
          expsequence[i] = {"type":"point", "location": points[cntpt], "duration":idleLen, "tag":"blank"};
        }else if(tagset[sequenceTag[i]] == "test"){
          expsequence[i] = {"type":"point", "location": points[cntpt], "duration":testLen, "tag":"test"};
        }
        cntpt++;
        break;
      case "image":
        imgpath = imgpaths[cntimg];
        expsequence[i] = {"type":"image", "path":imgpath,"duration":imgLen, "tag":tagset[sequenceTag[i]]};
        cntimg++;
        break;
      case "cross":
        expsequence[i] = {"type":"cross", "duration":transLen, "tag":tagset[sequenceTag[i]]};
        break;
      case "message":
        var t = Math.floor(((numpnt-cntpt/2)*(idleLen+busyLen)+(numimg-cntimg)*(imgLen+cntdownLen)+(numabtest-cntabtest)*abtestLen)/1000); // remaining time
        for(var j = 0; j < 3; j++){
          var s = t-j;
          var sec = (t-j)%60;
          if(sec<10) sec = '0' + sec.toString();
          var min = ((t-j)-sec)/60;
          if(min<10) min = '0' + min.toString();
          // msg = ExprMsgs[cntmsg] + "</br></br><span style='color: #3399FF; font-size:75px; font-family:lcd'>"+ '00:' + min + ':' + sec + "</span>";
          msg = "<span style='font-size:40px;'>" + ExprMsgs[cntmsg] + "</span>";
          expsequence[i+j] = {"type":"message", "content":msg, "duration":msgLen, "tag":tagset[sequenceTag[i+j]]};  
        }
        cntmsg += 3;
        i += 2;
        break;
      case "cntdown":
        expsequence[i] = {"type":"crosshair", "content": countdownMsg(cntdownidx), "duration":cntdownLen, "tag":tagset[sequenceTag[i]]};
        cntdownidx--;
        break;
      case "abtest":
        expsequence[i] = {"type":"abtest", "duration":abtestLen, "tag":tagset[sequenceTag[i]]};
        cntabtest++;
        break;
      case "video":
        var b = clipidx[cntvideo][0], c = clipidx[cntvideo][1];
        expsequence[i] = {"type":"video", "index":clipidx[cntvideo], "duration":videolist[b][c].playlen, "tag":tagset[sequenceTag[i]]};
        cntvideo++;
        break;
      case "whacamole":
        expsequence[i] = {"type":"whacamole", "level":cntlevel, "duration":whacamoleLen, "tag":tagset[sequenceTag[i]]};
        cntlevel++;
        break;
    }
  }
  OKLoad = true;
}