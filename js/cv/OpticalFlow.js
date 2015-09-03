// require: jsfeat.js
function OpticalFlow(idx, mpidx, positions, para){
	// initialization
	var w = para.w;	// canvas size
	var h = para.h;
	this.th = para.th; // threshold
	this.ema_alpha = para.ema_alpha; // alpha for exponential moving average
	this.scale = {"x":para.scale.x, "y":para.scale.y}; // hd canvas<->position scaling factor
	this.ldmkidx = idx.slice(0, idx.length); // selected landmarks for optical flow
	this.ldmkmpidx = mpidx.slice(0, mpidx.length);

	this.options = {"win_size":20, "max_iterations":30, "epsilon":0.01, "min_eigen":0.001};
	this.curr_img_pyr = new jsfeat.pyramid_t(3);
    this.prev_img_pyr = new jsfeat.pyramid_t(3);
    this.curr_img_pyr.allocate(w, h, jsfeat.U8_t|jsfeat.C1_t);
    this.prev_img_pyr.allocate(w, h, jsfeat.U8_t|jsfeat.C1_t);
    this.prev_pos = null;

    var ptcnt = this.ldmkidx.length;
    this.prev_xy = new Float32Array(ptcnt*2);
    this.curr_xy = new Float32Array(ptcnt*2);
    for (var i = 0; i < ptcnt; i++){
    	this.curr_xy[2*i] = positions[this.ldmkidx[i]][0]; 
    	this.curr_xy[2*i+1] = positions[this.ldmkidx[i]][1];
    }
    this.ptcnt = ptcnt;
    this.ptstatus = new Uint8Array(ptcnt);

    this.getmidpoint = function(positions, canvasctx, ctxw, ctxh, prev_pos){
    	// var imageData = canvasctx.getImageData(0, 0, ctxw, ctxh);
    	var imageData = canvasctx.getImageData(0, 0, ctxw, ctxh);

        // swap flow data
        var _pt_xy = this.prev_xy;
        this.prev_xy = this.curr_xy;
        this.curr_xy = _pt_xy;
        var _pyr = this.prev_img_pyr;
        this.prev_img_pyr = this.curr_img_pyr;
        this.curr_img_pyr = _pyr;
        

        // gray image
        jsfeat.imgproc.grayscale(imageData.data, this.curr_img_pyr.data[0].data);
        // image pyramid
        this.curr_img_pyr.build(this.curr_img_pyr.data[0], true);
        // optical flow
        jsfeat.optical_flow_lk.track(this.prev_img_pyr, this.curr_img_pyr, this.prev_xy, this.curr_xy, this.ptcnt, this.options.win_size|0, this.options.max_iterations|0, this.ptstatus, this.options.epsilon, this.options.min_eigen);
		
        // estimate flow vector
		var ptcnt = this.ptcnt;
		var validcnt = 0;
		var locidx = new Array(ptcnt);
		for(var i = 0; i < ptcnt; i++){
			if(this.ptstatus[i] == 1) {
				locidx[validcnt++] = i;
			}
		}
		var flowvec = [0,0];
		if(validcnt > 0){
			var k = 0;
			var flowx = Array.apply(null, new Array(validcnt)).map(Number.prototype.valueOf,0);
			var flowy = Array.apply(null, new Array(validcnt)).map(Number.prototype.valueOf,0);
			for(var i = 0; i < validcnt; i++){
				flowx[i] = this.curr_xy[2*locidx[i]] - this.prev_xy[2*locidx[i]];
				flowy[i] = this.curr_xy[2*locidx[i]+1] - this.prev_xy[2*locidx[i]+1];
			}
			flowvec[0] = jsfeat.math.median(flowx, 0, validcnt-1) * this.scale.x;
			flowvec[1] = jsfeat.math.median(flowy, 0, validcnt-1) * this.scale.y;
			// console.log('valid points: ' + validcnt +' flow vector: ' + flowvec);
		}else{
			// console.log('no change');
		}
		
		 // update tracking using detection
        for (var i = 0; i < ptcnt; i++){
	    	this.curr_xy[2*i] = positions[this.ldmkidx[i]][0];
	    	this.curr_xy[2*i+1] = positions[this.ldmkidx[i]][1];
	    }
	    
	    var curr_pos = [[0,0],[0,0]];
	    // averaging
	    for(var e = 0; e < 2; e++){
	    	for(var i = 0; i < this.ldmkmpidx[0].length; i++){
	    		curr_pos[e][0] += positions[this.ldmkmpidx[e][i]][0] * this.scale.x;
		    	curr_pos[e][1] += positions[this.ldmkmpidx[e][i]][1] * this.scale.y;	
	    	}
	    	curr_pos[e][0] /= this.ldmkmpidx[0].length;
	    	curr_pos[e][1] /= this.ldmkmpidx[0].length;
	    }
	    // update locatin of bounding box
	    if(this.prev_pos != null){
			// previous position + optical flow vector
			var updateflag = true;
		    for (var e = 0; e < 2; e++){
		    	for (var d = 0; d < 2; d++){
		    		this.prev_pos[e][d] += flowvec[d];
		    		// check consistency
		    		if(Math.abs(this.prev_pos[e][d] -  curr_pos[e][d]) > this.th) updateflag = false;
		    	}
		    }
		    // exponential moving average
		    if(updateflag){
		    	for (var e = 0; e < 2; e++){
			    	for (var d = 0; d < 2; d++){
			    		curr_pos[e][d] = (1-this.ema_alpha)*this.prev_pos[e][d] + this.ema_alpha*curr_pos[e][d];
			    	}
			    }
			    // console.log('optical flow is working!!');
		    }
		}
		this.prev_pos = new Array(2);
		for(var e = 0; e < 2; e++){
			this.prev_pos[e] = new Array(2);
			for(var d = 0; d < 2; d++){
				this.prev_pos[e][d] = curr_pos[e][d];
			}
		}
		// console.log('flow vector: ' + flowvec + 'left: ' + curr_pos[0]);
		return curr_pos;
    }
}