//// requires: jsfeat.js
// extract image patch and compute intensity histrogram (spatial)
var normalizedHist = {
	hist : function(option){
		var pw = Math.round((option.pw-1)/2)*2+1; // patch width
		var ph = Math.round((option.ph-1)/2)*2+1; // patch height
		var nbins = new Array(option.nbins.length); // sampling grid
		for(var i = 0; i < nbins.length; i++){
			nbins[i] = new Array(2);
			nbins[i][0] = option.nbins[i][0];
			nbins[i][1] = option.nbins[i][1];
		}
		
		var vdim = 0; // feature dimension
		var gridset = new Array(nbins.length); // grid of regions
		for(var i = 0; i < gridset.length; i++){
			var ny = nbins[i][0];
			var nx = nbins[i][1];
			gridset[i] = new Array(2);
			gridset[i][0] = new Array(ny);
			gridset[i][1] = new Array(nx);
			var dy = Math.floor(ph/ny);
			var dx = Math.floor(pw/nx);
			for(var m = 0; m < ny; m++){
				gridset[i][0][m] = dy * (m+1) - 1;
			}
			for(var n = 0; n < nx; n++){
				gridset[i][1][n] = dx * (n+1) - 1;
			}
		    vdim = vdim + ny*nx;
		}
		this.patchwidth = function(){return pw;}
		this.patchheight = function(){return ph;}
		this.featuredimension = function(){return vdim;}
			
		// extract histogram from patch, (x, y) up-left corner of the path
		this.getfeature = function(ctx, x, y){
			var imgPatch = ctx.getImageData(x, y, pw, ph);
			var imgPathGray = new jsfeat.matrix_t(imgPatch.width, imgPatch.height, jsfeat.U8_t | jsfeat.C1_t);
			jsfeat.imgproc.grayscale(imgPatch.data, imgPathGray.data);
			return computefeature(imgPathGray);
		}

		// function to compute normalized histogram of an image patch
		var computefeature = function(patch){
			// get integral image
			var s = getIntegralImg(patch);
			// compute histogram
			// var vdim = 0;
			var i,j,h;
			var vecHist = new Array(vdim);
			var cnt = 0;
			for(i = 0; i < gridset.length; i++){
				h = computeHist(s, gridset[i]);
				for(j = 0; j < h.length; j++, cnt++){
					vecHist[cnt] = h[j];
				}
			}
			return vecHist;
		}
		// function to compute integral image 
		var getIntegralImg = function(patch){
			// create integral image (padding zeros in first row and column)
			var s = matrix2D(patch.rows+1, patch.cols+1,0);
			var i,j;
			for(i = 0; i < patch.rows; i++){
				for(j = 0; j < patch.cols; j++){
					s[i+1][j+1] = s[i+1][j] + patch.data[i*patch.cols+j];
				}
			}
			for(j = 0; j < patch.cols; j++){
				for(i = 0; i < patch.rows; i++){
					s[i+1][j+1] = s[i+1][j+1] + s[i][j+1];
				}
			}
			return s;
		}
		// function to compute normalized histogram from integral image
		var computeHist = function(s, grid){
			var h = Array.apply(null, new Array(grid[0].length*grid[1].length)).map(Number.prototype.valueOf,0);
			var cnt = 0;
			var h_sum = 0;
			var i,j, a, b;
			var prv_a, prv_b;
			for(i = 0; i < grid[0].length; i++){
				for(j = 0; j < grid[1].length; j++){
					a = grid[0][i];
					b = grid[1][j];
					if (i > 0){ 
						prv_a = grid[0][i-1];
					}else{
						prv_a = 0;
					}
					if (j > 0){ 
						prv_b = grid[1][j-1];
					}else{
						prv_b = 0;
					}
					h[cnt] = s[a][b] - s[prv_a][b] - s[a][prv_b] + s[prv_a][prv_b];
					h_sum += h[cnt];
					cnt++;
				}
			}
			// normalization
			if (h_sum != 0){
				for(i = 0; i < h.length; i++){
					h[i] /= h_sum;
				}
			}
			return h;
		}

		// function to create a 2D matrix
		var matrix2D = function(rows, cols, defaultValue){
			var arr = [];
			// creates all lines
			for(var i=0; i < rows; i++){
			  // creates an empty line
			  arr.push([]);
			  // adds cols to the empty line
			  arr[i].push( new Array(cols));
			  for(var j=0; j < cols; j++){
			    // initialization
			    arr[i][j] = defaultValue;
			  }
			}
			return arr;
		}
		return true;
	}
}


