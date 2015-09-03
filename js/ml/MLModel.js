// requires: jsfeat.js, RidgeRegression.js
var MLModel = {
	mlmodel : function(para){
		var methodname = para.name;
		var parameter = para.parameter;

		// learn a model
		this.train = function(trainQueue, sequence){
			// organize data to matrix
			var numtrain = trainQueue.length;
			if(numtrain == 0) return null; // no training data
			var featuredim = trainQueue[0].value[0].length*2; // one for each eye
			var traindata = new jsfeat.matrix_t(featuredim, numtrain, jsfeat.F32_t | jsfeat.C1_t); 
			var trainvalue = new jsfeat.matrix_t(2, numtrain, jsfeat.F32_t | jsfeat.C1_t); 
			var cnt = 0;
			for(var n = 0; n < numtrain; n++){
				var v = trainQueue[n].value;
				for(var e = 0; e < 2; e++){
					for(var j = 0; j < featuredim/2; j++){
						traindata.data[cnt++] = v[e][j];
					}
				}
				var t = sequence[trainQueue[n].entryidx];
				if(t.type != "point"){
					alert('Type Error!');
					return null;
				}
				for(var e = 0; e < 2; e++){
					trainvalue.data[2*n+e] = t.location[e];
				}
			}
			// recenter gaze location
			for(var i = 0; i < trainvalue.data.length; i++){
				trainvalue.data[i] -= 0.5;
			}
			// train a model
			switch(methodname){
				case "ridge_regression":
					var B = ridgeRegression(traindata, trainvalue, parameter);
					return {"name":methodname, "model":B};
					break;
				default:
					return null;
					break;
			}
		}
		this.crossvalidation = function(dQ, sequence, model, k){
			if(k < 2) return null; // at least two folds
			var numdata = dQ.length;
			if(numdata < k) return null; // not enough data
			var batchsize = Math.floor(numdata/k);
			var featuredim = dQ[0].value[0].length*2; // feature dimension
			// k folds
			var looerr = {"train":new Array(k), "test":new Array(k)};
			for(var t = 0; t < k; t++){
				var trQ = new Array(batchsize*(k-1));
				var teQ = new Array(batchsize);
				var idx_tr = 0;
				var idx_te = 0;
				for(var i = 0; i < k*batchsize; i++){
					if(i >= t*batchsize && i < (t+1)*batchsize){
						teQ[idx_tr++] = dQ[i];
					}else{
						trQ[idx_te++] = dQ[i];
					}
				}
				model = this.train(trQ, sequence); // train model
				tr_result = this.predict(trQ, sequence, model, true);
				te_result = this.predict(teQ, sequence, model, true); // prediction
				looerr.train[t] = tr_result.error;
				looerr.test[t] = te_result.error;
			}
			return looerr;
		}
		this.predict = function(testQueue, sequence, model, compute_err){
			if(model == null) return null;
			if(testQueue == null || testQueue.length == 0) return null;
			// organize data to matrix
			var numtest = testQueue.length;
			var featuredim = testQueue[0].value[0].length*2; // one for each eye
			var testdata = new jsfeat.matrix_t(featuredim, numtest, jsfeat.F32_t | jsfeat.C1_t); 
			var i = 0;
			for(var n = 0; n < numtest; n++){
				var v = testQueue[n].value;
				for(var e = 0; e < 2; e++){
					for(var j = 0; j < featuredim/2; j++){
						testdata.data[i++] = v[e][j];
					}
				}
			}
			// prediction 
			var predictvalue;
			switch(model.name){
				case "ridge_regression":
					var B = model.model;
					predictvalue = rrPredict(testdata, B);	
					for(var i = 0; i < predictvalue.data.length; i++){
						predictvalue.data[i] += 0.5;
					}
					break;
				default:
					return null;
					break;
			}
			// testing error
			if(compute_err == true){
				var cnt = 0, err = 0;
				for(var n = 0; n < testQueue.length; n++){
					var t = sequence[testQueue[n].entryidx];
					if(t.type == "point"){
						err += Math.sqrt(Math.pow(predictvalue.data[2*n]-t.location[0], 2) + Math.pow(predictvalue.data[2*n+1]-t.location[1], 2));
						cnt++;
					}
				}
				if(cnt > 0) err /= cnt;
				
				return {"prediction":predictvalue, "error":err};
			}else{
				return {"prediction":predictvalue};
			}
		}
	}
}
