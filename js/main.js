/*
Main Algorithm and Codes for Demo
Developed by Jingxuan Zhang of Tongji (@tongji.edu.cn)
You can Contact with Jingxuan.N,Zhang@gmail.com
Or 2010_fno@tongji.edu.cn

Thanks for http://www.sitepoint.com/html5-javascript-open-dropped-files/
filedrag.js - HTML5 File Drag & Drop demonstration
Featured on SitePoint.com
Developed by Craig Buckler (@craigbuckler) of OptimalWorks.net
*/
(function() {

	// getElementById
	function $id(id) {
		return document.getElementById(id);
	}


	// Golbal Variable
	// Canvas Object
	var iCanvas = $id("imagedisplay"),
		iCtx = iCanvas.getContext("2d");
	// Image Matrix
	var myMat, preMat;
	// CV_BORDER_TYPE
	var CV_BORDER_REPLICATE = 0x01,
		CV_BORDER_REFLECT = 0x02,
		CV_BORDER_REFLECT_101 = 0x03,
		CV_BORDER_WRAP = 0x04,
		CV_BORDER_CONSTANT = 0x05;


	// output information
	function Output(msg) {
		var m = $id("messages");
		m.innerHTML = "<p>Status Messages</p>" + msg;
	}


	// file drag hover
	function FileDragHover(e) {
		e.stopPropagation();
		e.preventDefault();
		e.target.className = (e.type == "dragover" ? "hover" : "");
	}


	// file selection
	function FileSelectHandler(e) {

		// cancel event and hover styling
		FileDragHover(e);

		// fetch FileList object
		var files = e.target.files || e.dataTransfer.files;

		// process all File objects
		for (var i = 0, f; f = files[i]; i++) {
			ParseFile(f);
		}

	}


	// output file information
	function ParseFile(file) {
		// display an image
		if (file.type.indexOf("image") == 0) {
			var reader = new FileReader();
			reader.onload = function(e) {
				/*Output(
					"<p><strong>" + file.name + ":</strong><br />" +
					'<img src="' + e.target.result + '" /></p>'
				);*/
				var img = new Image();
				img.onload = function() {
					myMat = imread(img);
					preMat = [];
					Output(
						"<p>File information: <strong>" + file.name +
						"</strong> type: <strong>" + file.type +
						"</strong> size: <strong>" + file.size +
						"</strong> <i>bytes</i></p>" +
						"<p>Width: <strong>" + myMat.col +
						"</strong> <i>px</i> Height: <strong>" + myMat.row +
						"</strong> <i>px</i></p>"
					);
				};
				img.src = e.target.result;
				//iCtx.drawImage(img, 0, 0);
			}
			reader.readAsDataURL(file);
		} else {
			Output(
				"<p><strong>No Supported FileType!</strong></p>"
			);
		}

	}




	// Get Matrix Object
	function Mat(__row, __col, __data, __buffer, __type) {
	    this.row = __row || 0;
	    this.col = __col || 0;
	    this.channel = 4;
	    this.buffer = __buffer || new ArrayBuffer(__row * __col * 4);
	    this.data = new Uint8ClampedArray(this.buffer);
	    __data && this.data.set(__data);
	    this.bytes = 1;
	    this.type = "CV_RGBA";
	}

	// Methods for Matrix Object
	Mat.prototype.toString = function(){
	    var tempData = this.data,
	        text = "Mat("+ this.type +") = {\n",
	        num = this.col * this.channel;
	    for(var i = 0; i < this.row; i++){
	        text += "["
	        for(var j = 0; j < num; j++){
	            text += (tempData[i * num + j] + ",");
	        }
	        text += "]\n";
	    }
	    text += "}";
	    return text;
	};

	Mat.prototype.clone = function(){
	    return new Mat(this.row, this.col, this.data);
	};

	Mat.prototype.at = function(__x, __y, __channel){
	    return this.data[(__x * this.col + __y) * this.channel + __channel];
	};

	Mat.prototype.set = function(__x, __y, __channel, __value){
		return this.data[(__x * this.col + __y) * this.channel + __channel] = __value;
	}

	// Read Image to Matrix
	function imread(__image) {
	    var width = __image.width,
	        height = __image.height;
	    iResize(width, height);
	    iCtx.drawImage(__image, 0, 0);
	    var imageData = iCtx.getImageData(0, 0, width, height),
	        tempMat = new Mat(height, width, imageData.data);
	//    imageData = null;
	//    iCtx.clearRect(0, 0, width, height);
	    return tempMat;
	}

	// iResize
	function iResize(__width, __height){
	    iCanvas.width = __width;
	    iCanvas.height = __height;
	}

	// Convert Matrix to ImageData
	function RGBA2ImageData(__imgMat){
	    var width = __imgMat.col,
	        height = __imgMat.row,
	        imageData = iCtx.createImageData(width, height);
	    imageData.data.set(__imgMat.data);
	    return imageData;
	}




	// Image Processing Algorithm
	// RGBA to Gray
	function cvtColor(__src){
	    if(__src.type && __src.type === "CV_RGBA"){
	        var row = __src.row,
	            col = __src.col;
	        var dst = new Mat(row, col);
	            data = dst.data,
	            data2 = __src.data;
	        var pix1, pix2, pix = __src.row * __src.col * 4;
	        while (pix){
	            data[pix -= 4] = data[pix1 = pix + 1] = data[pix2 = pix + 2] = (data2[pix] * 299 + data2[pix1] * 587 + data2[pix2] * 114) / 1000;
	            data[pix + 3] = data2[pix + 3];
	        }
	        dst.type = "CV_GRAY";
	    }else{
	        return src;
	    }
	    return dst;
	}

	// Flip Horizontal or Vertical
	function Flip(__src, __type) {
		var row = __src.row,
			col = __src.col;
		var dst = new Mat(row, col);
		if(__type == "horizontal") {
			for(var i=0; i<row; i++)
				for(var j=0; j<col; j++)
				{
					dst.set(i, j, 0, __src.at(i, col-1-j, 0));
					dst.set(i, j, 1, __src.at(i, col-1-j, 1));
					dst.set(i, j, 2, __src.at(i, col-1-j, 2));
					dst.set(i, j, 3, __src.at(i, col-1-j, 3));
				}
		} else if(__type == "vertical") {
			for(var j=0; j<col; j++)
				for(var i=0; i<row; i++)
				{
					dst.set(i, j, 0, __src.at(row-1-i, j, 0));
					dst.set(i, j, 1, __src.at(row-1-i, j, 1));
					dst.set(i, j, 2, __src.at(row-1-i, j, 2));
					dst.set(i, j, 3, __src.at(row-1-i, j, 3));
				}
		}
		return dst;
	}

	// Zoom Picture
	function Zoom(__src, __zoomWidth, __zoomHeight) {
		var col = Math.round(__src.col * __zoomWidth/100);
		var row = Math.round(__src.row * __zoomHeight/100);
		if(col==__src.col && row==__src.row)
			return __src;
		if(col==0)
			col += 1;
		if(row==0)
			row += 1;

		var dst = new Mat(row, col);

		var xrIntFloat_16 = (__src.col<<16) / col + 1;
		var yrIntFloat_16 = (__src.row<<16) / row + 1;

		for(var y=0; y<row; y++)
			for(var x=0; x<col; x++)
			{
				var srcx = (x*xrIntFloat_16) >>> 16;
				var srcy = (y*yrIntFloat_16) >>> 16;

				dst.set(y, x, 0, __src.at(srcy, srcx, 0));
				dst.set(y, x, 1, __src.at(srcy, srcx, 1));
				dst.set(y, x, 2, __src.at(srcy, srcx, 2));
				dst.set(y, x, 3, __src.at(srcy, srcx, 3));
			}

		return dst;
	}

	// Binary Linear Interpolation Zoom
	function ZoomBilinear(__src, __zoomWidth, __zoomHeight) {
	    var col = Math.round(__src.col * __zoomWidth/100);
	    var row = Math.round(__src.row * __zoomHeight/100);
	    if(col===__src.col && row===__src.row)
	        return __src;
	    if(col===0)
	        col += 2;
	    if(row===0)
	        row += 2;

	    var dst = new Mat(row, col);

	    for(var i=0; i<row; i++)
	    {
	        var srcI = (i + 0.5) * __src.row / row - 0.5,
	            srcI1 = Math.floor(srcI),
	        	srcI2 = srcI1 + 1;
	        var v = srcI - srcI1;
	        (srcI1 < 0) && srcI1++;
	        (srcI2 > __src.row - 1) && srcI2--;
	        for(var j=0; j<col; j++)
	        {
	            var srcJ = (j + 0.5) * __src.col / col - 0.5,
	                srcJ1 = Math.floor(srcJ);
	            	srcJ2 = srcJ1 + 1;
	            var u = srcJ - srcJ1;
	            (srcJ1 < 0) && srcJ1++;
	            (srcJ2 > __src.col - 1) && srcJ2--;
	            
                var pm3 = u * v;
                var pm2 = u - pm3;
                var pm1 = v - pm3;
                var pm0 = 1 - v - pm2;

	            for(var c=0; c<4; c++)
	            {
	                var Color0 = __src.at(srcI1, srcJ1, c),
	                    Color1 = __src.at(srcI2, srcJ1, c),
	                    Color2 = __src.at(srcI1, srcJ2, c),
	                    Color3 = __src.at(srcI2, srcJ2, c);

	                
	                dst.set(i, j, c, pm0*Color0+pm1*Color1+pm2*Color2+pm3*Color3);
	            }
	        }
	    }

	    return dst;
	}
	
	// Three Order Convolution Interpolation Zoom
	function ZoomTriConv(__src, __zoomWidth, __zoomHeight) {
		var borderI = function(i) {
			if(i < 0) return 0;
			if(i > __src.row - 1) return __src.row - 1;
			return i;
		};
		var borderJ = function(j) {
			if(j < 0) return 0;
			if(j > __src.col - 1) return __src.col - 1;
			return j;
		};
		var SinXDivX = function(x) {
			// return Math.sin(x*Math.PI) / (x*Math.PI);
			x = Math.abs(x);
			var a = -1;
			var x2 = x*x;
			var x3 = x2*x;
			if(x < 1) return (a+2)*x3 - (a+3)*x2 + 1;
			else if(x < 2) return a*(x3 - 5*x2 + 8*x - 4);
			else return 0;
		};
		var bColor = function(color) {
			if(color < 0) return 0;
			if(color > 255) return 255;
			return color;
		}
		var col = Math.round(__src.col * __zoomWidth/100);
	    var row = Math.round(__src.row * __zoomHeight/100);
	    if(col===__src.col && row===__src.row)
	        return __src;
	    if(col===0)
	        col += 2;
	    if(row===0)
	        row += 2;

	    var dst = new Mat(row, col);
	    var srcIB = new Array(4),
	    	srcJB = new Array(4),
	    	afv = new Array(4),
	    	afu = new Array(4);

	    for(var i=0; i<row; i++)
	    {
	        var srcI = (i + 0.5) * (__src.row - 1) / row - 0.5,
	            srcI0 = Math.floor(srcI);
	        var fv = srcI - srcI0;
	        srcIB[3] = borderI(srcI0 + 3);
        	srcIB[2] = borderI(srcI0 + 2);
        	srcIB[1] = borderI(srcI0 + 1);
        	srcIB[0] = borderI(srcI0 + 0);
        	afv[0] = SinXDivX(1+fv);
	        afv[1] = SinXDivX(fv);
	        afv[2] = SinXDivX(1-fv);
	        afv[3] = SinXDivX(2-fv);

	        for(var j=0; j<col; j++)
	        {
	            var srcJ = (j + 0.5) * (__src.col - 1) / col - 0.5,
	                srcJ0 = Math.floor(srcJ);
	            var fu = srcJ - srcJ0;
	            srcJB[3] = borderJ(srcJ0 + 3);
	        	srcJB[2] = borderJ(srcJ0 + 2);
	        	srcJB[1] = borderJ(srcJ0 + 1);
	        	srcJB[0] = borderJ(srcJ0 + 0);
	        	afu[0] = SinXDivX(1+fu);
		        afu[1] = SinXDivX(fu);
		        afu[2] = SinXDivX(1-fu);
		        afu[3] = SinXDivX(2-fu);

	            for(var c=0; c<4; c++)
	            {
	            	scolor = 0;
	                for(var i0=0; i0<4; i0++)
	                {
	                	var acolor = 0;
	                	for(var j0=0; j0<4; j0++)
	                	{
	                		acolor += afu[j0]*__src.at(srcIB[i0], srcJB[j0], c);
	                	}
	                	scolor += acolor*afv[i0];
	                }

	                
	                dst.set(i, j, c, bColor(Math.round(scolor)));
	            }
	        }
	    }

	    return dst;
	}

	// RGB to HSV of Point
	function p_RGB2HSV(__R, __G, __B) {
		var min, max, delta, tmp;
		var hsv = [0, 0, 0];

		tmp = Math.min(__R, __G);
		min = Math.min(tmp, __B);
		tmp = Math.max(__R, __G);
		max = Math.max(tmp, __B);

		hsv[2] = max;

		if(max == 0)
			return hsv;
		
		delta = max - min;
		hsv[1] = Math.round(255 * delta / max);

		if(__R == max)
			hsv[0] = (__G - __B) / delta;
		else if(__G == max)
			hsv[0] = 2 + (__B - __R) / delta;
		else
			hsv[0] = 4 + (__R - __G) / delta;

		hsv[0] = Math.round(hsv[0]*255/6);
		if(hsv[0] < 0)
			hsv[0] += 255;

		return hsv;
	}

	// RGB to HSV
	function RGB2HSV(__src) {
		var row = __src.row;
		var col = __src.col;

		// var buffer = new ArrayBuffer(row * col * 4);
		// var tempArray = new Uint8ClampedArray(buffer);

		var H = new Array();
		var S = new Array();
		var V = new Array();
		var A = new Array();

		for(var i=0; i<row; i++)
		{
			// offsetI = i * col;
			H[i] = new Array();
			S[i] = new Array();
			V[i] = new Array();
			A[i] = new Array();

			for(var j=0; j<col; j++)
			{
				var hsv = p_RGB2HSV(__src.at(i, j, 0), __src.at(i, j, 1), __src.at(i, j, 2));
				// tempArray[(offsetI + j)*4 + 0] = hsv[0];
				// tempArray[(offsetI + j)*4 + 1] = hsv[1];
				// tempArray[(offsetI + j)*4 + 2] = hsv[2];
				// tempArray[(offsetI + j)*4 + 3] = hsv[3];
				H[i][j] = hsv[0];
				S[i][j] = hsv[1];
				V[i][j] = hsv[2];
				A[i][j] = __src.at(i, j, 3);
			}
		}

		// return buffer;
		return [H, S, V, A];
	}

	// HSV to RGB of Point
	function p_HSV2RGB(__H, __S, __V) {
		var h = __H,
			s = __S,
			v = __V;

		if(s == 0)
			return [v, v, v];

		var h = __H * 6 / 255;
		var s = s / 255;
		var i = Math.floor(h);
		var f = h - i;
		var p = Math.floor(v * (1 - s)),
			q = Math.floor(v * (1 - s * f)),
			t = Math.floor(v * (1 - s * (1 - f)));

		switch(i)
		{
			case 0: return [v, t, p];
			case 1: return [q, v, p];
			case 2: return [p, v, t];
			case 3: return [p, q, v];
			case 4: return [t, p, v];
			case 5: return [v, p, q];
		}
	}

	// HSV to RGB
	function HSV2RGB(__H, __S, __V, __A) {
		var row = __H.length;
		var col = __H[0].length;

		var rgb = new Array(row * col * 4);
		var offset = 0;
		for(var i=0; i<row; i++)
		{
			for(var j=0; j<col; j++)
			{
				var p_rgb = p_HSV2RGB(__H[i][j], __S[i][j], __V[i][j]);
				rgb[offset++] = p_rgb[0];
				rgb[offset++] = p_rgb[1];
				rgb[offset++] = p_rgb[2];
				rgb[offset++] = __A[i][j];
			}
		}

		return rgb;
	}

	// Histogram Balance
	function histogramBalance(__src) {
		var row = __src.row;
		var col = __src.col;
		var tol = row * col;

		var hsv = RGB2HSV(__src);

		var freq = new Array(256);
		for(var i=0; i<freq.length; i++)
			freq[i] = 0;

		var gray = freq;

		for(var i=0; i<row; i++)
			for(var j=0; j<col; j++)
				freq[hsv[2][i][j]]++;

		freq[0] /= tol;
		for(var i=1; i<freq.length; i++)
		{
			freq[i] /= tol;
			freq[i] += freq[i-1];
		}

		for(var i=0; i<gray.length; i++)
			gray[i] = Math.floor(255*freq[i] + 0.5);

		for(var i=0; i<row; i++)
			for(var j=0; j<col; j++)
				hsv[2][i][j] = gray[hsv[2][i][j]];


		return new Mat(row, col, HSV2RGB(hsv[0], hsv[1], hsv[2], hsv[3]));
	}

	// Computes the source location of an extrapolated pixel.
	function borderInterpolate(__p, __len, __borderType) {
		if(__p < 0 || __p >= __len){
			switch(__borderType){
				case CV_BORDER_REPLICATE:
					__p = __p < 0 ? 0 : __len - 1;
					break;
				case CV_BORDER_REFLECT:
				case CV_BORDER_REFLECT_101:
					var delta = __borderType == CV_BORDER_REFLECT_101;
					if(__len == 1)
						return 0;
					do{
						if(__p < 0)
							__p = -__p - 1 + delta;
						else
							__p = __len - 1 - (__p - __len) - delta;
					}while(__p < 0 || __p >= __len)
					break;
				case CV_BORDER_WRAP:
					if(__p < 0)
						__p -= (((__p - __len + 1) / __len) | 0) * __len;
					if(__p >= __len)
						__p %= __len;
					break;
				case CV_BORDER_CONSTANT:
					__p = -1;
				default:
			}
		}
		return __p;
	};

	// Forms a border around an image.
	function copyMakeBorder(__src, __top, __left, __bottom, __right, __borderType, __value) {
		if(__borderType === CV_BORDER_CONSTANT){
			return copyMakeConstBorder_8U(__src, __top, __left, __bottom, __right, __value);
		}else{
			return copyMakeBorder_8U(__src, __top, __left, __bottom, __right, __borderType);
		}
	};

	//NOT CV_BORDER_CONSTANT
	function copyMakeBorder_8U(__src, __top, __left, __bottom, __right, __borderType) {
	    var i, j;
	    var width = __src.col,
	        height = __src.row;
	    var top = __top,
	        left = __left || __top,
	        right = __right || left,
	        bottom = __bottom || top,
	        dstWidth = width + left + right,
	        dstHeight = height + top + bottom,
	        borderType = borderType || CV_BORDER_REFLECT;
	    var buffer = new ArrayBuffer(dstHeight * dstWidth * 4),
	        tab = new Uint32Array(left + right);
	    
	    for(i = 0; i < left; i++){
	        tab[i] = borderInterpolate(i - left, width, __borderType);
	    }
	    for(i = 0; i < right; i++){
	        tab[i + left] = borderInterpolate(width + i, width, __borderType);
	    }
	    
	    var tempArray, data;
	    
	    for(i = 0; i < height; i++){
	        tempArray = new Uint32Array(buffer, (i + top) * dstWidth * 4, dstWidth);
	        data = new Uint32Array(__src.buffer, i * width * 4, width);
	        for(j = 0; j < left; j++)
	            tempArray[j] = data[tab[j]];
	        for(j = 0; j < right; j++)
	            tempArray[j + width + left] = data[tab[j + left]];
	        tempArray.set(data, left);
	    }
	    
	    var allArray = new Uint32Array(buffer);
	    for(i = 0; i < top; i++){
	        j = borderInterpolate(i - top, height, __borderType);
	        tempArray = new Uint32Array(buffer, i * dstWidth * 4, dstWidth);
	        tempArray.set(allArray.subarray((j + top) * dstWidth, (j + top + 1) * dstWidth));
	    }
	    for(i = 0; i < bottom; i++){
	        j = borderInterpolate(i + height, height, __borderType);
	        tempArray = new Uint32Array(buffer, (i + top + height) * dstWidth * 4, dstWidth);
	        tempArray.set(allArray.subarray((j + top) * dstWidth, (j + top + 1) * dstWidth));
	    }
	    
	    return new Mat(dstHeight, dstWidth, new Uint8ClampedArray(buffer));
	}

	// Linear Filter
	function LinearFilter(__src, size1, size2, height, width, kernel, dstData, __borderType) {
	    var startY = size1 >> 1;
	    var startX = size2 >> 1;
	        
	    var withBorderMat = copyMakeBorder(__src, startY, startX, 0, 0, __borderType);
	            
	    var mData = withBorderMat.data,
	        mWidth = withBorderMat.col;
	        
	    var i, j, y, x;
	    var newValue, nowX, offsetY, offsetI, offsetN;
	    
	    for(i = height; i--;){
	        offsetI = i * width;
	        offsetN = (i + startY) * mWidth;
	        for(j = width; j--;){
	            newValue = [0, 0, 0];
	            for(y = size1; y--;){
	                offsetY = (y + i) * mWidth;
	                for(x = size2; x--;){
	                    nowX = x + j;
	                    newValue[0] += (mData[(offsetY + nowX)*4 + 0] * kernel[y * size2 + x]);
	                    newValue[1] += (mData[(offsetY + nowX)*4 + 1] * kernel[y * size2 + x]);
	                    newValue[2] += (mData[(offsetY + nowX)*4 + 2] * kernel[y * size2 + x]);
	                }
	            }
	            dstData[(j + offsetI)*4 + 0] = newValue[0];
	            dstData[(j + offsetI)*4 + 1] = newValue[1];
	            dstData[(j + offsetI)*4 + 2] = newValue[2];
	            dstData[(j + offsetI)*4 + 3] = mData[(offsetN + j + startX)*4 + 3];
	        }
	    }
	}

	// Sobel Operator
	function Sobel(__src, __xorder, __yorder, __size, __borderType, __dst) {
        var kernel,
            height = __src.row,
            width = __src.col,
            dst = __dst || new Mat(height, width),
            dstData = dst.data
            size = __size || 3;
        switch(size){
            case 1:
                size = 3;
            case 3:
                if(__xorder){
                    kernel = [-1, 0, 1,
                              -2, 0, 2,
                              -1, 0, 1
                             ];
                }else if(__yorder){
                    kernel = [-1, -2, -1,
                               0,  0,  0,
                               1,  2,  1
                             ];
                }
                break;
            case 5:
                if(__xorder){
                    kernel = [-1, -2, 0, 2, 1,
                              -4, -8, 0, 8, 4,
                              -6,-12, 0,12, 6,
                              -4, -8, 0, 8, 4,
                              -1, -2, 0, 2, 1
                             ];
                }else if(__yorder){
                    kernel = [-1, -4, -6, -4, -1,
                              -2, -8,-12, -8, -2,
                               0,  0,  0,  0,  0,
                               2,  8, 12,  8,  2,
                               1,  4,  6,  4,  1
                             ];
                }
                break;
            default:
            
        }
        
        LinearFilter(__src, size, size, height, width, kernel, dstData, __borderType);

	    return dst;
	};

	// Laplacian Operator
	function Laplacian(__src, __opt, __borderType, __dst) {
		var kernel,
			height = __src.row,
			width = __src.col,
			dst = __dst || new Mat(height, width),
			dstData = dst.data,
			opt = __opt || 1;
			size =  3;
		switch(opt){
			case 0:
				kernel = [0,  1, 0,
						  1, -4, 1,
						  0,  1, 0
						 ];
				break;
			case 1:
				kernel = [2,  0, 2,
						  0, -8, 0,
						  2,  0, 2
						 ];
				break;
			case 2:
				kernel = [1,  1, 1,
						  1, -8, 1,
						  1,  1, 1
						 ];
				break;
			case 3:
				kernel = [ 0, -1,  0,
						  -1,  4, -1,
						   0, -1,  0
						 ];
				break;
			case 4:
				kernel = [-2, 0, -2,
						   0, 8,  0,
						  -2, 0, -2
						 ];
				break;
			case 5:
				kernel = [-1, -1, -1,
						  -1,  8, -1,
						  -1, -1, -1
						 ];
				break;
			default:
			
		}
		
		LinearFilter(__src, size, size, height, width, kernel, dstData, __borderType);

		return dst;
	};

	// Laplacian of Gaussian Operator
	function LoG(__src, __borderType, __dst) {
        var kernel,
            height = __src.row,
            width = __src.col,
            dst = __dst || new Mat(height, width),
            dstData = dst.data
            size = 5;
        
        kernel = [-2, -4, -4, -4, -2,
        		  -4,  0,  8,  0, -4,
        		  -4,  8, 24,  8, -4,
        		  -4,  0,  8,  0, -4,
        		  -2, -4, -4, -4, -2
        		 ];
        
        LinearFilter(__src, size, size, height, width, kernel, dstData, __borderType);

	    return dst;
	};

	// Kirsch Operator
	function Kirsch(__src, __borderType, __dst) {
        var height = __src.row,
            width = __src.col,
            dst = __dst || new Mat(height, width),
            dstData = dst.data,
			size = 3;
		var startX = size >> 1;
	        
	    var withBorderMat = copyMakeBorder(__src, startX, startX, 0, 0, __borderType);
	            
	    var mData = withBorderMat.data,
	        mWidth = withBorderMat.col;

	    var kernel = new Array(8);
    	kernel[0] = [ 5,  5,  5,
    				 -3,  0, -3,
    				 -3, -3, -3
    				];
    	kernel[1] = [-3,  5,  5,
    				 -3,  0,  5,
    				 -3, -3, -3
    				];
    	kernel[2] = [-3, -3,  5,
    				 -3,  0,  5,
    				 -3, -3,  5
    				];
    	kernel[3] = [-3, -3, -3,
    				 -3,  0,  5,
    				 -3,  5,  5
    				];
    	kernel[4] = [-3, -3, -3,
    				 -3,  0, -3,
    				  5,  5,  5
    				];
    	kernel[5] = [-3, -3, -3,
    				  5,  0, -3,
    				  5,  5, -3
    				];
    	kernel[6] = [ 5, -3, -3,
    				  5,  0, -3,
    				  5, -3, -3
    				];
    	kernel[7] = [ 5,  5, -3,
    				  5,  0, -3,
    				 -3, -3, -3
    				];
	        
	    var i, j, y, x;
	    var newValue, tmpValue, nowX, offsetY, offsetI, offsetN;
	    
	    for(i = height; i--;){
	        offsetI = i * width;
	        offsetN = (i + startX) * mWidth;
	        for(j = width; j--;){
	        	newValue = [0, 0, 0];
	        	for(k = 8; k--;){
	        		tmpValue = [0, 0, 0];
		            for(y = size; y--;){
		                offsetY = (y + i) * mWidth;
		                for(x = size; x--;){
		                    nowX = x + j;
		                    tmpValue[0] += (mData[(offsetY + nowX)*4 + 0] * kernel[k][y * size + x]);
		                    tmpValue[1] += (mData[(offsetY + nowX)*4 + 1] * kernel[k][y * size + x]);
		                    tmpValue[2] += (mData[(offsetY + nowX)*4 + 2] * kernel[k][y * size + x]);
		                }
		            }
		            newValue[0] = (tmpValue[0]>newValue[0] ? tmpValue[0] : newValue[0]);
		            newValue[1] = (tmpValue[1]>newValue[1] ? tmpValue[1] : newValue[1]);
		            newValue[2] = (tmpValue[2]>newValue[2] ? tmpValue[2] : newValue[2]);
	        	}
	            
	            dstData[(j + offsetI)*4 + 0] = newValue[0];
	            dstData[(j + offsetI)*4 + 1] = newValue[1];
	            dstData[(j + offsetI)*4 + 2] = newValue[2];
	            dstData[(j + offsetI)*4 + 3] = mData[(offsetN + j + startX)*4 + 3];
	        }
	    }

	    return dst;
	}

	// Blur of Average
	function blur(__src, __size1, __size2, __borderType, __dst) {
		var height = __src.row,
			width = __src.col,
			dst = __dst || new Mat(height, width),
			dstData = dst.data;

		var size1 = __size1 || 3,
			size2 = __size2 || size1,
			size = size1 * size2;

		var kernel = new Array(size);
		var i;
		for(i=size; i--;)
			kernel[i] = 1 / size;

		LinearFilter(__src, size1, size2, height, width, kernel, dstData, __borderType);

		return dst;
	}

	// Gaussian Kernel Generator
	function getGaussianKernel(__n, __sigma) {
		var SMALL_GAUSSIAN_SIZE = 7,
	        smallGaussianTab = [[1],
	                            [0.25, 0.5, 0.25],
	                            [0.0625, 0.25, 0.375, 0.25, 0.0625],
	                            [0.03125, 0.109375, 0.21875, 0.28125, 0.21875, 0.109375, 0.03125]
	        ];
	        
	    var fixedKernel = __n & 2 == 1 && __n <= SMALL_GAUSSIAN_SIZE && __sigma <= 0 ? smallGaussianTab[__n >> 1] : 0;
	    
	    var sigmaX = __sigma > 0 ? __sigma : ((__n - 1) * 0.5 - 1) * 0.3 + 0.8,
	        scale2X = -0.5 / (sigmaX * sigmaX),
	        sum = 0;
	    
	    var i, x, t, kernel = [];
	    
	    for(i = 0; i < __n; i++){
	        x = i - (__n - 1) * 0.5;
	        t = fixedKernel ? fixedKernel[i] : Math.exp(scale2X * x * x);
	        kernel[i] = t;
	        sum += t;
	    }
	    
	    sum = 1 / sum;
	    
	    for(i = __n; i--;){
	        kernel[i] *= sum;
	    }
	    
	    return kernel;
	}

	// Gussian Blur Filter
	function GaussianBlur(__src, __size1, __size2, __sigma1, __sigma2, __borderType, __dst) {
		var height = __src.row,
			width = __src.col,
			dst = __dst || new Mat(height, width),
			dstData = dst.data;

		var sigma1 = __sigma1 || 0,
			sigma2 = __sigma2 || __sigma1;

		var size1 = __size1 || Math.round(sigma1 * 6 + 1) | 1,
			size2 = __size2 || Math.round(sigma2 * 6 + 1) | 1,
			size = size1 * size2;

		var startY = size1 >> 1,
			startX = size2 >> 1;
		var withBorderMat = copyMakeBorder(__src, startY, startX, 0, 0, __borderType),
			mData = withBorderMat.data,
			mWidth = withBorderMat.col;

		var kernel1 = getGaussianKernel(size1, sigma1),
			kernel2,
			kernel = new Array(size1 * size2);

		if(size1 === size2 && sigma1 === sigma2)
			kernel2 = kernel1;
		else
			kernel2 = getGaussianKernel(size2, sigma2);

		var i, j;

		for(i = size1; i--;) {
			for(j = size2; j--;) {
				kernel[i * size2 + j] = kernel1[i] * kernel2[j];
			}
		}

		LinearFilter(__src, size1, size2, height, width, kernel, dstData, __borderType);

		return dst;
	}

	// Sort Filter ( Median Blur Filter )
	function medianBlur(__src, __size1, __size2, __borderType, __dst) {
	    var height = __src.row,
	        width = __src.col,
	        dst = __dst || new Mat(height, width),
	        dstData = dst.data;
	    var size1 = __size1 || 3,
	        size2 = __size2 || size1,
	        size = size1 * size2;

	    var startY = size1 >> 1,
	        startX = size2 >> 1;
	    var withBorderMat = copyMakeBorder(__src, startY, startX, 0, 0, __borderType),
	        mData = withBorderMat.data,
	        mWidth = withBorderMat.col;
	    
	    var newValue = [], nowX, offsetY, offsetI, offsetN;
	    var i, j, y, x;
	    var msize = size >> 1;

	    for(i = height; i--;){
	        offsetI = i * width;
	        offsetN = (i + startY) * mWidth;
	        for(j = width; j--;){
	            newValue = [new Array(size), new Array(size), new Array(size)];
	            var o = 0;
	            for(y = size1; y--;){
	                offsetY = (y + i) * mWidth;
	                for(x = size2; x--;){
	                    nowX = x + j;
	                    newValue[0][o] = mData[(offsetY + nowX)*4 + 0];
	                    newValue[1][o] = mData[(offsetY + nowX)*4 + 1];
	                    newValue[2][o] = mData[(offsetY + nowX)*4 + 2];
	                    o++;
	                }
	            }
	            newValue[0].sort(function(a, b){return a - b;});
	            newValue[1].sort(function(a, b){return a - b;});
	            newValue[2].sort(function(a, b){return a - b;});
	            dstData[(j + offsetI)*4 + 0] = newValue[0][msize];
	            dstData[(j + offsetI)*4 + 1] = newValue[1][msize];
	            dstData[(j + offsetI)*4 + 2] = newValue[2][msize];
	            dstData[(j + offsetI)*4 + 3] = mData[(offsetN + j + startX)*4 + 3];
	        }
	    }

    	return dst;
	}
	
	// Fast Sort Filter
	function fmedianBlur(__src, __size1, __size2, __borderType, __dst) {
	    var height = __src.row,
	        width = __src.col,
	        dst = __dst || new Mat(height, width),
	        dstData = dst.data;
	    var size1 = __size1 || 3,
	        size2 = __size2 || size1,
	        size = size1 * size2;

	    var startY = size1 >> 1,
	        startX = size2 >> 1;
	    var withBorderMat = copyMakeBorder(__src, startY, startX, 0, 0, __borderType);
	    
	    var f, gray;
	    var i, j, y, x, c;
	    var msize = size >> 1;
	    
	    var freq = new Array(256 * 4);
	    var curfreq;
		for(i=0; i<freq.length; i++)
			freq[i] = 0;
	    
	    for(i=0; i<size1; i++)
	    	for(j=0; j<size2; j++)
	    		for(c=0; c<4; c++)
	    			freq[4 * withBorderMat.at(i, j, c) + c]++;

	    for(i=0; i<height; i++){
	        for(j=0; j<width; j++){
	            if(j===0){
	            	if(i > 0)
		            	for(x=0; x<size2; x++)
		            		for(c=0; c<4; c++){
		            			freq[4 * withBorderMat.at(i-1, x, c) + c]--;
		            			freq[4 * withBorderMat.at(i+size1-1, x, c) + c]++;
		            		}
	            	curfreq = freq.concat();
	            }else{
	            	for(y=0; y<size1; y++)
	            		for(c=0; c<4; c++){
	            			curfreq[4 * withBorderMat.at(i+y, j-1, c) + c]--;
	            			curfreq[4 * withBorderMat.at(i+y, j+size2-1, c) + c]++;
	            		}
	            }
	            
	            for(c=0; c<4; c++){
	            	gray = -1;
		            for(f=0; f<=msize;)
		            	f += curfreq[4 * (++gray) + c];
		            dst.set(i, j, c, gray);
		        }
	        }
	    }

    	return dst;
	}



	// Save Image
	function showDownloadText() {
		$id("buttoncontainer").style.display = "none";
		$id("textdownload").style.display = "block";
	}

	function hideDownloadText() {
		$id("buttoncontainer").style.display = "block";
		$id("textdownload").style.display = "none";
	}

	function convertCanvas(strType) {
		if (strType == "PNG")
			var oImg = Canvas2Image.saveAsPNG(iCanvas, true);
		if (strType == "BMP")
			var oImg = Canvas2Image.saveAsBMP(iCanvas, true);
		if (strType == "JPEG")
			var oImg = Canvas2Image.saveAsJPEG(iCanvas, true);

		if (!oImg) {
			alert("Sorry, this browser is not capable of saving " + strType + " files!");
			return false;
		}

		oImg.id = "canvasimage";

		oImg.style.border = iCanvas.style.border;
		$id("display").replaceChild(oImg, iCanvas);

		showDownloadText();
	}

	function saveCanvas(pCanvas, strType) {
		var bRes = false;
		if (strType == "PNG")
			bRes = Canvas2Image.saveAsPNG(iCanvas);
		if (strType == "BMP")
			bRes = Canvas2Image.saveAsBMP(iCanvas);
		if (strType == "JPEG")
			bRes = Canvas2Image.saveAsJPEG(iCanvas);

		if (!bRes) {
			alert("Sorry, this browser is not capable of saving " + strType + " files!");
			return false;
		}
	}

	$id("savepngbtn").onclick = function() {
		saveCanvas(iCanvas, "PNG");
	}
	$id("savebmpbtn").onclick = function() {
		saveCanvas(iCanvas, "BMP");
	}
	$id("savejpegbtn").onclick = function() {
		saveCanvas(iCanvas, "JPEG");
	}

	$id("convertpngbtn").onclick = function() {
		convertCanvas("PNG");
	}
	$id("convertbmpbtn").onclick = function() {
		convertCanvas("BMP");
	}
	$id("convertjpegbtn").onclick = function() {
		convertCanvas("JPEG");
	}

	$id("resetbtn").onclick = function() {
		var oImg = $id("canvasimage");
		$id("display").replaceChild(iCanvas, oImg);

		hideDownloadText();
	}



	// Button Click
	$id("undo").onclick = function() {
		undo();
		var imageData = RGBA2ImageData(myMat);
		iResize(myMat.col, myMat.row);
		iCtx.putImageData(imageData, 0, 0);
	}

	$id("RGBA2Gray").onclick = function() {
		intohistory();
		myMat = cvtColor(myMat);
		var imageData = RGBA2ImageData(myMat);
		iResize(myMat.col, myMat.row);
		iCtx.putImageData(imageData, 0, 0);
		$id("undo").disabled = "";
	}

	$id("FlipH").onclick = function() {
		intohistory();
		myMat = Flip(myMat, "horizontal");
		var imageData = RGBA2ImageData(myMat);
		iResize(myMat.col, myMat.row);
		iCtx.putImageData(imageData, 0, 0);
		$id("undo").disabled = "";
	}

	$id("FlipV").onclick = function() {
		intohistory();
		myMat = Flip(myMat, "vertical");
		var imageData = RGBA2ImageData(myMat);
		iResize(myMat.col, myMat.row);
		iCtx.putImageData(imageData, 0, 0);
		$id("undo").disabled = "";
	}

	$id("defaultbtn").onclick = function() {
		$id("zoomWidth").value = 100;
		$id("zoomHeight").value = 100;
	}

	$id("zoombtn").onclick = function() {
		intohistory();
		myMat = Zoom(myMat, $id("zoomWidth").value, $id("zoomHeight").value);
		var imageData = RGBA2ImageData(myMat);
		iResize(myMat.col, myMat.row);
		iCtx.putImageData(imageData, 0, 0);
		$id("undo").disabled = "";
	}

	$id("bilinearbtn").onclick = function() {
		intohistory();
		myMat = ZoomBilinear(myMat, $id("zoomWidth").value, $id("zoomHeight").value);
		var imageData = RGBA2ImageData(myMat);
		iResize(myMat.col, myMat.row);
		iCtx.putImageData(imageData, 0, 0);
		$id("undo").disabled = "";
	}
	
	$id("triconvbtn").onclick = function() {
		intohistory();
		myMat = ZoomTriConv(myMat, $id("zoomWidth").value, $id("zoomHeight").value);
		var imageData = RGBA2ImageData(myMat);
		iResize(myMat.col, myMat.row);
		iCtx.putImageData(imageData, 0, 0);
		$id("undo").disabled = "";
	}

	$id("balancebtn").onclick = function() {
		intohistory();
		myMat = histogramBalance(myMat);
		var imageData = RGBA2ImageData(myMat);
		iResize(myMat.col, myMat.row);
		iCtx.putImageData(imageData, 0, 0);
		$id("undo").disabled = "";
	}

	$id("sobelbtn").onclick = function() {
		intohistory();
		switch($id("sobelsel").selectedIndex)
		{
			case 0: myMat = Sobel(myMat, 1, 0, 3); break;
			case 1: myMat = Sobel(myMat, 1, 0, 5); break;
			case 2: myMat = Sobel(myMat, 0, 1, 3); break;
			case 3: myMat = Sobel(myMat, 0, 1, 5); break;
		}
		var imageData = RGBA2ImageData(myMat);
		iResize(myMat.col, myMat.row);
		iCtx.putImageData(imageData, 0, 0);
		$id("undo").disabled = "";
	}

	$id("laplacianbtn").onclick = function() {
		intohistory();
		switch($id("laplaciansel").selectedIndex)
		{
			case 0: myMat = Laplacian(myMat, 0); break;
			case 1: myMat = Laplacian(myMat, 1); break;
			case 2: myMat = Laplacian(myMat, 2); break;
			case 3: myMat = Laplacian(myMat, 3); break;
			case 4: myMat = Laplacian(myMat, 4); break;
			case 5: myMat = Laplacian(myMat, 5); break;
		}
		var imageData = RGBA2ImageData(myMat);
		iResize(myMat.col, myMat.row);
		iCtx.putImageData(imageData, 0, 0);
		$id("undo").disabled = "";
	}

	$id("logbtn").onclick = function() {
		intohistory();
		myMat = LoG(myMat);
		var imageData = RGBA2ImageData(myMat);
		iResize(myMat.col, myMat.row);
		iCtx.putImageData(imageData, 0, 0);
		$id("undo").disabled = "";
	}

	$id("kirschbtn").onclick = function() {
		intohistory();
		myMat = Kirsch(myMat);
		var imageData = RGBA2ImageData(myMat);
		iResize(myMat.col, myMat.row);
		iCtx.putImageData(imageData, 0, 0);
		$id("undo").disabled = "";
	}

	$id("blurbtn").onclick = function() {
		intohistory();
		myMat = blur(myMat, 1+2*parseInt($id("sizerng").value));
		var imageData = RGBA2ImageData(myMat);
		iResize(myMat.col, myMat.row);
		iCtx.putImageData(imageData, 0, 0);
		$id("undo").disabled = "";
	}

	$id("gaussianbtn").onclick = function() {
		intohistory();
		myMat = GaussianBlur(myMat, 1+2*parseInt($id("sizerng").value), parseInt($id("sizerng").value));
		var imageData = RGBA2ImageData(myMat);
		iResize(myMat.col, myMat.row);
		iCtx.putImageData(imageData, 0, 0);
		$id("undo").disabled = "";
	}

	$id("medianbtn").onclick = function() {
		intohistory();
		myMat = medianBlur(myMat, 1+2*parseInt($id("sizerng").value));
		var imageData = RGBA2ImageData(myMat);
		iResize(myMat.col, myMat.row);
		iCtx.putImageData(imageData, 0, 0);
		$id("undo").disabled = "";
	}
	
	$id("fmedianbtn").onclick = function() {
		intohistory();
		myMat = fmedianBlur(myMat, 1+2*parseInt($id("sizerng").value));
		var imageData = RGBA2ImageData(myMat);
		iResize(myMat.col, myMat.row);
		iCtx.putImageData(imageData, 0, 0);
		$id("undo").disabled = "";
	}

	$id("filterbtn").onclick = function() {
		intohistory();
		var size;
		var kernel;
		if($id("kernelsize").selectedIndex == 0) {
			size = 3;
			kernel = [parseInt($id("k11").value), parseInt($id("k12").value), parseInt($id("k13").value),
					  parseInt($id("k21").value), parseInt($id("k22").value), parseInt($id("k23").value),
					  parseInt($id("k31").value), parseInt($id("k32").value), parseInt($id("k33").value)
					 ];
		} else {
			size = 5;
			kernel = [parseInt($id("k00").value), parseInt($id("k01").value), parseInt($id("k02").value), parseInt($id("k03").value), parseInt($id("k04").value),
					  parseInt($id("k10").value), parseInt($id("k11").value), parseInt($id("k12").value), parseInt($id("k13").value), parseInt($id("k14").value),
					  parseInt($id("k20").value), parseInt($id("k21").value), parseInt($id("k22").value), parseInt($id("k23").value), parseInt($id("k24").value),
					  parseInt($id("k30").value), parseInt($id("k31").value), parseInt($id("k32").value), parseInt($id("k33").value), parseInt($id("k34").value),
					  parseInt($id("k40").value), parseInt($id("k41").value), parseInt($id("k42").value), parseInt($id("k43").value), parseInt($id("k44").value),
					 ];
		}

		var height = myMat.row,
            width = myMat.col,
            dst = new Mat(height, width),
            dstData = dst.data;

        LinearFilter(myMat, size, size, height, width, kernel, dstData);
        myMat = dst;
        var imageData = RGBA2ImageData(myMat);
		iResize(myMat.col, myMat.row);
		iCtx.putImageData(imageData, 0, 0);
		$id("undo").disabled = "";
	}

	$id("sizerng").onchange = function() {
		$id("blursize").innerHTML = $id("sizerng").value;
	}

	$id("kernelsize").onchange = function() {
		if($id("kernelsize").selectedIndex == 0)
			$id("sizetable").innerHTML = ".s5{display: none;}";
		else
			$id("sizetable").innerHTML = "";
	}



	// History Manager
	function undo() {
		myMat = preMat.pop();
		(preMat.length !== 0) || ($id("undo").disabled = "disabled");
	}

	function intohistory() {
		(preMat.length < 30) || preMat.shift();
		preMat.push(myMat);
	}



	// initialize
	function Init() {

		var fileselect = $id("fileselect"),
			filedrag = $id("filedrag"),
			submitbutton = $id("submitbutton");

		// file select
		fileselect.addEventListener("change", FileSelectHandler, false);

		// is XHR2 available?
		var xhr = new XMLHttpRequest();
		if (xhr.upload) {

			// file drop
			filedrag.addEventListener("dragover", FileDragHover, false);
			filedrag.addEventListener("dragleave", FileDragHover, false);
			filedrag.addEventListener("drop", FileSelectHandler, false);
			filedrag.style.display = "block";

			// remove submit button
			submitbutton.style.display = "none";
		}

	}

	// call initialization file
	if (window.File && window.FileList && window.FileReader) {
		Init();
	}


})();
