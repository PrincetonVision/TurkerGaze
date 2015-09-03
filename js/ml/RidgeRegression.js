// requires: jsfeat.js
// ridge regression
// |Y - Xb|^2 + rcoef*|b|^2
// rl = eye(size(X,2))*rl_coef;
// rl(end,end) = 0;
// b = (X'*X + rl) \ X'*y;
function ridgeRegression(X, Y, rcoef){
	var dimF = X.cols+1; // feature dimenstion
	var dimV = Y.cols; // prediction dimension
	// attatch a column of ones
	var X2 = new jsfeat.matrix_t(X.cols+1, X.rows, jsfeat.F32_t | jsfeat.C1_t); 
	var i, j;
	for(i = 0; i < X.rows; i++){
		for(j = 0; j < X.cols; j++){
			X2.data[i*X2.cols+j] = X.data[i*X.cols+j];
		}
		X2.data[i*X2.cols+X2.cols-1] = 1;
	}
	// regularization
	// X'*X + I*coef, where I(end,end)=0, no regularization on bias
	var A = new jsfeat.matrix_t(dimF, dimF, jsfeat.F32_t | jsfeat.C1_t); 
	jsfeat.matmath.multiply_AtA(A, X2);
	for(i = 0; i < dimF-1; i++){
		A.data[i*dimF+i] = A.data[i*dimF+i] + rcoef;
	}
	// X'*y
	var C = new jsfeat.matrix_t(Y.cols, X2.cols, jsfeat.F32_t | jsfeat.C1_t); 
	jsfeat.matmath.multiply_AtB(C, X2, Y);
	var B = new jsfeat.matrix_t(Y.cols, X2.cols, jsfeat.F32_t | jsfeat.C1_t); 
	// B = inv(X'*X + r_mtx) * X' * y
	// jsfeat.linalg.cholesky_solve(A, B);
	// jsfeat.linalg.lu_solve(A, B);
	var AI = new jsfeat.matrix_t(A.cols, A.cols, jsfeat.F32_t | jsfeat.C1_t); 
	AI.data = mtxInverse(A);
	jsfeat.matmath.multiply(B, AI, C);

	return B;
}

function rrPredict(X, B){
	// attatch a column of ones
	var X2 = new jsfeat.matrix_t(X.cols+1, X.rows, jsfeat.F32_t | jsfeat.C1_t); 
	var i, j;
	for(i = 0; i < X.rows; i++){
		for(j = 0; j < X.cols; j++){
			X2.data[i*X2.cols+j] = X.data[i*X.cols+j];
		}
		X2.data[i*X2.cols+X2.cols-1] = 1;
	}
	// prediction
	Y = new jsfeat.matrix_t(B.cols, X.rows, jsfeat.F32_t | jsfeat.C1_t); 
	jsfeat.matmath.multiply(Y, X2, B);
	return Y;
}

// inverse of a square matrix
function mtxInverse(A){
	var i, j, k, l, s, t;
	var c = A.cols, r = A.rows;
	if (c != r){
		console.log('Matrix is not square.');
		return null;
	}

	var a = A.data;
	// starting from identity matrix
	var b = Array.apply(null, new Array(c*c)).map(Number.prototype.valueOf,0);
	for(i = 0; i < r; i++){
		b[i*r+i] = 1;
	}
	
	// identity matrix
	// var I = new jsfeat.matrix_t(r, r, jsfeat.F32_t | jsfeat.C1_t); 
	var I = new Array(r*r);
	for(i = 0; i < r; i++){
		for(j = 0; j < r; j++){
			if (i == j){
				I[i*r+j] = 1;
			}else{
				I[i*r+j] = 0;
			}
		}
	}

	// compute matrix inverse by Gauss Jordan Elimination
	// var B = new jsfeat.matrix_t(r, r, jsfeat.F32_t | jsfeat.C1_t); 
	for(j = 0; j < r; j++){
		for(i = j; i < r; i++){
			if(a[i*r+j] != 0){
				for(k = 0; k < r; k++){
					s = a[j*r+k]; a[j*r+k] = a[i*r+k]; a[i*r+k] = s;
					s = b[j*r+k]; b[j*r+k] = b[i*r+k]; b[i*r+k] = s;
				}
				t = 1/a[j*r+j];
				for(k = 0; k < r; k++){
					a[j*r+k] *= t;
					b[j*r+k] *= t;
				}
				for(l = 0; l < r; l++){
					if (l != j){
						t = -a[l*r+j];
						for(k = 0; k < r; k++){
							a[l*r+k] += t*a[j*r+k];
							b[l*r+k] += t*b[j*r+k];
						}
					}
				}
			}
			break;
		}
		if (a[i*r+j] == 0){
			console.log('Warning: Singular Matrix')
	        return null;
		}
	}
	return b;
}












