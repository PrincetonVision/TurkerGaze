function checkServerResponse(){
	serverRequest = requestAnimationFrame(checkServerResponse);
	if(noHITinDB != null){
		cancelAnimationFrame(serverRequest);
		if (noHITinDB == true) { // no more hit
			$("#instrmsgP").html(instrMsg.nohit);
		}else{
			$("#instrmsgP").html(instrMsg.loadfont);
			drawslider(100, 5); // draw progress bar
			$('#slider').show();
			loadfontTime = new Date().getTime();
			checkFontPreloader();
		};
	}
}

function checkFontPreloader(){
	fontPreloaderRequest = requestAnimationFrame(checkFontPreloader);
	if(FONTLOADED){
		cancelAnimationFrame(fontPreloaderRequest);
		drawslider(100, 10); // draw progress bar
		preloadIcons(0);
	}
}


// check whether fullscreen is on
function checkFullscreenOn(){
	checkFullscreenOnRequest = requestAnimFrame(checkFullscreenOn);
	if(window.innerHeight != screen.height){
		$(document).unbind(); // unbind key press event
		cancelRequestAnimFrame(checkFullscreenOnRequest);
		if (!EXPERIMENT_END && !KEY_DOWN){
			restartTask(instrMsg.fullscreen); // restart the whole experiment
		}else{
			KEY_DOWN = false;
		}
		$('#warningP').css('color', msgColor);
	}
}


// check the quality the facial landmark tracking based on head pose, face size
function checkLdmkValidity(position){
	if(!position){
		return statusMsg.detecting;
	}
	// estimate roll: the direction of the line connecting two outer eye corners
	var Roll = Math.abs(Math.atan((position[28][1]-position[23][1])/(position[28][0]-position[23][0]))/Math.PI*180);
	if(Roll > maxRoll){
		return statusMsg.rotateface;
	}
	// estimate yaw
	// direction of nose bridge (nose, eye, mouth relative location)
	var Yaw = Math.abs(Math.atan((position[33][0]-position[62][0])/(position[33][1]-position[62][1]))/Math.PI*180);
	if(Yaw > maxYaw){
		return statusMsg.turnface;
	}
	// control eye patch size: not too small/large
	var iW = Math.abs(position[23][0]+position[30][0]-position[25][0]-position[28][0])/2;
	if(iW < minEyeW){
		return statusMsg.toofar;
	}
	if(iW > maxEyeW){
		return statusMsg.tooclose;
	}
	return ''; // no abnormal result detected
}

