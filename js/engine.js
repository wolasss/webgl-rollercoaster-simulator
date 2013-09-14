var ENGINE = ENGINE || {};



//renderer 
ENGINE.Renderer = function( opts ) {
	//params
	opts = opts || {};
	//vars

	//internal vars
	var _gl, _canvas, _shaders,
	TextureImage, Texture, ShaderProgram, VertexPosition, VertexTexture,AspectRatio;

	

	_canvas = document.getElementById('canvas');

	this.getContext = function() {
		return _gl;
	}

	this.setViewport = function ( x, y, width, height ) {

		_viewportX = x !== undefined ? x : 0;
		_viewportY = y !== undefined ? y : 0;

		_viewportWidth = width !== undefined ? width : _canvas.width;
		_viewportHeight = height !== undefined ? height : _canvas.height;

		_gl.viewport( _viewportX, _viewportY, _viewportWidth, _viewportHeight );

	};

	this.setSize = function(width, height) {
		width = parseInt(width, 10);
		height = parseInt(height, 10);
		_canvas.width = width;
		_canvas.height = height;
		_canvas.style.width = width + 'px';
		_canvas.style.height = height + 'px';
		ENGINE.aspectRatio = _canvas.width / _canvas.height;
		this.setViewport(0, 0, _canvas.width, _canvas.height);
	}
	var TransformMatrix = mat4.create(),
	PerspectiveMatrix;
	window.x = 0;
	window.y = 0;
	window.z = 0;
	window.speed = 0.001;
	window.calls = 0;

 	var matrix = mat4.create(), point = vec3.create(), lookAtPoint = vec3.create(), normal = vec3.create();
 	var pmatrix, tmatrix, k=0;
	this.renderObject = function(Object, TexturesArray, camera, road) {
		PerspectiveMatrix = camera.projectionMatrix;

		Object.updateMatrix();
		Object.invertMatrix();

		
		if ( Object.name==='rollercoaster' ) { 
			//console.log(Object.matrix);
		}
		if ( Object.name==='cart' ) {
			if((parseFloat(k,10)-1.0000000)>=0) {
				k=0;
			} 

			point = road.catmull.point(k);
			normal = road.catmull.normal(k);
			lookAtPoint = road.catmull.point(k+0.05);
			Object.forward=vec3.fromValues(0,0,-1);
			Object.up = normal;
			//console.log(k);
			if(k>0.9) {
				//console.log('position: ', Object.position);
				//console.log('rotation: ', Object.rotation); 
				//debugger; 
				lookAtPoint = road.catmull.point(0.05); //don't look under cart!
			}
			Object.setPosition(point[0], point[1], point[2]);
			Object.pointAt(lookAtPoint[0], lookAtPoint[1], lookAtPoint[2]);

			k=k+window.speed;
		}
	    //Bind it as The Current Buffer  
	    _gl.bindBuffer(_gl.ARRAY_BUFFER, Object.VertexBuffer);  
	  	    
	    //Connect Buffer To Shader's attribute  
	    _gl.vertexAttribPointer(VertexPosition, 3, _gl.FLOAT, false, 0, 0);  
	  
	    _gl.bindBuffer(_gl.ARRAY_BUFFER, Object.TextureBuffer);  
	    _gl.vertexAttribPointer(VertexTexture, 2, _gl.FLOAT, false, 0, 0);

 
	    _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, Object.TriangleBuffer); 
        //draw the triangle
       
        mat4.multiply(matrix, camera.matrixInversed, Object.matrixInversed);   

	    //Set slot 0 as the active Texture  
	    _gl.activeTexture(_gl.TEXTURE0);  

	   	_gl.uniformMatrix4fv(pmatrix, false, PerspectiveMatrix);    
	    _gl.uniformMatrix4fv(tmatrix, false, matrix);  
	    //Load in the Texture To Memory
	    var offset;
	    if(this.isRendered!=false) {
		    for(var i=0, len=TexturesArray.length; i<len; i++) {
		    	_gl.bindTexture(_gl.TEXTURE_2D, TexturesArray[i].glTex); 
		    	_gl.drawElements(_gl.TRIANGLES, (Object.offset ? Object.offset : Object.Triangles.length), _gl.UNSIGNED_SHORT, i*6*2);   
		    }
		}
	  
	    //Update The Texture Sampler in the fragment shader to use slot 0  
	    _gl.uniform1i(_gl.getUniformLocation(ShaderProgram, "uSampler"), 0);  
	  

	    
	}
	this.render  = function ( scene, camera, road) {
		if ( camera instanceof ENGINE.Camera === false ) {
			return;
		}
		var lights = scene.__lights, renderList = [];

		renderList = scene.__objects;

		_gl.clear(_gl.COLOR_BUFFER_BIT|_gl.DEPTH_BUFFER_BIT); 
		
	    pmatrix = _gl.getUniformLocation(ShaderProgram, "PerspectiveMatrix");  
	    tmatrix = _gl.getUniformLocation(ShaderProgram, "TransformationMatrix");  

		camera.updateView();

		camera.updateMatrix();
		camera.invertMatrix();
		
		for(var i=0, len=renderList.length; i<len; i++) {
			//render objects
			this.renderObject(renderList[i], renderList[i].activeTextures, camera, road);
		} 

	}

	//internal functions
	function create3DContext(canvas, opt_attribs) {
	  var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
	  var context = null;
	  for (var ii = 0; ii < names.length; ++ii) {
	    try {
	      context = canvas.getContext(names[ii], opt_attribs);
	    } catch(e) {}
	    if (context) {
	      break;
	    }
	  }
	  return context;
	}

	function setDefaultGLState () {
		_gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
		_gl.clearDepth( 1 );
		_gl.clearStencil( 0 );

		_gl.enable( _gl.DEPTH_TEST );//Enable Depth Testing
		_gl.depthFunc( _gl.LEQUAL ); // Near things obscure far things//Set Perspective View
	
	};

	function initGL() {
	 	_gl = create3DContext(_canvas);
	 	ENGINE.__gl = _gl;

	 	//set vars
	 	ENGINE.RepeatWrapping = ENGINE.__gl.REPEAT;
		ENGINE.ClampToEdgeWrapping = ENGINE.__gl.CLAMP_TO_EDGE;
	}

	initGL();
	_shaders = new ENGINE.Shaders();
	_shaders.init();
	_gui = new ENGINE.GUI();
	ENGINE._gui = _gui;
	//ENGINE._gui.add(window, 'speed');

	var shaders_obj = _shaders.create();
	ShaderProgram = shaders_obj.ShaderProgram;
	VertexPosition = shaders_obj.VertexPosition;
	VertexTexture = shaders_obj.VertexTexture;

	setDefaultGLState();
	

};

ENGINE.Renderer.prototype = {
	constructor: ENGINE.WebGLRenderer
};

ENGINE.Object3DIdCount = 0;

ENGINE.Object3D = function() {
	this.id = ENGINE.Object3DIdCount++;
	this.name = '';

	this.parent = undefined;
	this.children = [];

	this.position = vec3.create();
	vec3.set(this.position,0,0,0);
	this.scale = vec3.create();
	vec3.set(this.scale,1,1,1);
	this.rotation = vec3.create();
	vec3.set(this.rotation,0,0,0);

	this.up = vec3.create();
	vec3.set(this.up, 0,1,0);

	this._static = true; // if there is no animation don't update matrixes all the time
	this.matrixInit = false; 
	this.matrix = mat4.create();
	this.matrixInversed = mat4.create();

	this.matrixWorld = mat4.create();
	this.matrixWorldNeedsUpdate = true;

};

ENGINE.Object3D.prototype = {
	constructor: ENGINE.Object3D,
	scale : function(vector) {
		this.scale = vector;
	},
	rotateX : function(rad) {
		this.rotation[0] = rad;
	},
	rotateY : function(rad) {
			this.rotation[1]=rad;
	},
	rotateZ : function(rad) {
		this.rotation[2] = rad;
	},
	updateMatrix: function() {
		this.matrix = mat4.create();
		mat4.scale(this.matrix, this.matrix, this.scale);
		mat4.rotateX(this.matrix, this.matrix, this.rotation[0]);
		mat4.rotateY(this.matrix, this.matrix, this.rotation[1]);
		mat4.rotateZ(this.matrix, this.matrix, this.rotation[2]);
		mat4.translate(this.matrix, this.matrix, this.position);
		if(typeof(this.pointAtMatrix)!=='undefined') {
			this.matrix = this.pointAtMatrix;
		}
		if(typeof(this.lookAtMatrix)!=='undefined') {
			this.lookAt(this.lookAtCoor[0],this.lookAtCoor[1],this.lookAtCoor[2]);
			this.matrix=this.lookAtMatrix;
		}
		this.matrixWorldNeedsUpdate = true;
	}
};

ENGINE.Object3D.prototype.setPosition = function(x,y,z) {
	vec3.set(this.position, x,y,z);
}
ENGINE.Object3D.prototype.invertMatrix = function () {
	mat4.invert(this.matrixInversed, this.matrix);
}

ENGINE.Object3D.prototype.pointAt = function (x,y,z,up) {
	var position = vec3.fromValues((-1)*this.position[0], (-1)*this.position[1], (-1)*this.position[2]), vector = vec3.fromValues((-1)*x, (-1)*y, (-1)*z);
	this.nextPoint = vec3.fromValues(x,y,z);
	this.pointAtMatrix = mat4.create();
	this.lookAtCoor = vec3.fromValues(x,y,z);
	mat4.lookAt(this.pointAtMatrix, position, vector, this.up);
	//mat4.invert(this.pointAtMatrix,this.pointAtMatrix);
};

ENGINE.Scene = function() {
	ENGINE.Object3D.call(this);

	this.__objects = [];
	this.__lights = [];
};

ENGINE.Scene.prototype = Object.create( ENGINE.Object3D.prototype );

ENGINE.Scene.prototype.add = function(obj) { 
	var _gl = ENGINE.__gl;
	this.children.push(obj);
	obj.parent = this;

	obj.VertexBuffer = _gl.createBuffer();
	obj.TextureBuffer = _gl.createBuffer();
	obj.TriangleBuffer = _gl.createBuffer();

	_gl.bindBuffer(_gl.ARRAY_BUFFER, obj.VertexBuffer);  
	_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(obj.Vertices), _gl.STATIC_DRAW); 

	_gl.bindBuffer(_gl.ARRAY_BUFFER, obj.TextureBuffer);  
	_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(obj.Texture), _gl.STATIC_DRAW);  

	_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, obj.TriangleBuffer); 
	_gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.Triangles), _gl.STATIC_DRAW);

	return this.__objects.push(obj);
}

ENGINE.Camera = function () {

	ENGINE.Object3D.call( this );

	this.matrixWorldInverse = mat4.create();
	
	this.projectionMatrix = mat4.create();
	this.projectionMatrixInverse = mat4.create();

};

ENGINE.Camera.prototype = Object.create( ENGINE.Object3D.prototype );



ENGINE.PerspectiveCamera = function( fov, near, far) {
	ENGINE.Camera.call( this );

	this.fov = fov !== undefined ? fov : 45;
	this.aspect = ENGINE.aspectRatio;
	this.near = near !== undefined ? near : 0.1;
	this.far = far !== undefined ? far : 2000;

	this.updateProjectionMatrix();
}

ENGINE.PerspectiveCamera.prototype = Object.create( ENGINE.Camera.prototype );

ENGINE.PerspectiveCamera.prototype.lookAt = function ( x,y,z ) {
	this.camera=true;
	this.lookAtMatrix = mat4.create();
	this.lookAtCoor = vec3.fromValues(x,y,z);
	mat4.lookAt(this.lookAtMatrix, this.position, this.lookAtCoor, this.up);
	mat4.invert(this.lookAtMatrix,this.lookAtMatrix);
};

ENGINE.PerspectiveCamera.prototype.updateProjectionMatrix = function () { 
	mat4.perspective(this.projectionMatrix, this.fov, this.aspect, this.near, this.far );
	mat4.invert(this.projectionMatrixInverse, this.projectionMatrix);
}

ENGINE.PerspectiveCamera.prototype.updateView = function () {
	//this.rotateY(window.x);
	if(window.z<1) {
		window.z=1;
	}
	this.setPosition(( window.y - this.position[0] ) * .05,(  window.z - this.position[1] ) * .05,15);
}

ENGINE.RelativeCamera = function( fov, near, far, parent) {
	ENGINE.PerspectiveCamera.call( this, fov, near, far );

	this.parent = parent;
	this.updateProjectionMatrix();
}

ENGINE.RelativeCamera.prototype = Object.create( ENGINE.PerspectiveCamera.prototype );

ENGINE.RelativeCamera.prototype.lookAt = function ( x,y,z ) {
	var vector = vec3.fromValues((-1)*x, (-1)*y, (-1)*z);
	this.camera=true;
	this.lookAtMatrix = mat4.create();
	this.lookAtCoor = vec3.fromValues(x,y,z);
	mat4.lookAt(this.lookAtMatrix, this.position, vector, this.parent.up);
	mat4.invert(this.lookAtMatrix,this.lookAtMatrix);
};

ENGINE.RelativeCamera.prototype.updateView = function () { 
	var parent  = this.parent, nextPoint = this.parent.nextPoint !== "undefined" ? this.parent.nextPoint : false;
	this.position[0] = (-1)*this.parent.position[0];
	this.position[1] = (-1)*this.parent.position[1]+2;
	this.position[2] = (-1)*this.parent.position[2];

	if(nextPoint) {
		this.lookAt(nextPoint[0], nextPoint[1], nextPoint[2]);
	}
}

ENGINE.LookAtCamera = function( fov, near, far, parent) {
	ENGINE.RelativeCamera.call( this, fov, near, far, parent );

	this.updateProjectionMatrix();
}

ENGINE.LookAtCamera.prototype = Object.create( ENGINE.RelativeCamera.prototype );

ENGINE.LookAtCamera.prototype.updateView = function () { 
	var parent  = this.parent;
	
	if(window.z<2) {
		window.z=2;
	}
	this.setPosition(( window.y - this.position[0] ) * .05,(  window.z - this.position[1] ) * .05,15);
	this.lookAt((-1)*this.parent.position[0], (-1)*this.parent.position[1], (-1)*this.parent.position[2]);

}

ENGINE.Shaders = function() {
	var _gl = ENGINE.__gl, ShaderProgram, Code;

	this.FShader = document.getElementById('FragmentShader'); 
	this.VShader = document.getElementById('VertexShader');
	
	function LoadShader(Script){  
	    var Code = "";  
	    var CurrentChild = Script.firstChild;  
	    while(CurrentChild)  
	    {  
	        if(CurrentChild.nodeType == CurrentChild.TEXT_NODE) {
	            Code += CurrentChild.textContent;  
	        }
	        CurrentChild = CurrentChild.nextSibling;  
	    }  
	    return Code;  
	} 

	this.init = function() {
		if(!this.FShader || !this.VShader) {
    		alert("Error, Could Not Find Shaders");  
		} else  {  
		    //Load and Compile Fragment Shader  
		    Code = LoadShader(this.FShader);  
		    this.FShader = _gl.createShader(_gl.FRAGMENT_SHADER);  
		    _gl.shaderSource(this.FShader, Code);  
		    _gl.compileShader(this.FShader);  
		      
		    //Load and Compile Vertex Shader  
		    Code = LoadShader(this.VShader);  
		    this.VShader = _gl.createShader(_gl.VERTEX_SHADER);  
		    _gl.shaderSource(this.VShader, Code);  
		    _gl.compileShader(this.VShader);  
		}
	}

	this.create = function() {
			var obj = {};
		    //Create The Shader Program  
		    ShaderProgram = _gl.createProgram();
		    _gl.attachShader(ShaderProgram, this.FShader);  
		    _gl.attachShader(ShaderProgram, this.VShader);  
		    _gl.linkProgram(ShaderProgram);  
		    _gl.useProgram(ShaderProgram);  
		    obj.ShaderProgram = ShaderProgram;

		    //Link Vertex Position Attribute from Shader  
		    VertexPosition = _gl.getAttribLocation(ShaderProgram, "VertexPosition");  
		    _gl.enableVertexAttribArray(VertexPosition);  
		    obj.VertexPosition = VertexPosition;
		      
		    //Link Texture Coordinate Attribute from Shader  
		    VertexTexture = _gl.getAttribLocation(ShaderProgram, "TextureCoord");  
		    _gl.enableVertexAttribArray(VertexTexture); 
		    obj.VertexTexture = VertexTexture;
		    return obj;
	}

}

ENGINE.BasicMesh = function(opts) {
	ENGINE.Object3D.call(this);

	this.name = opts.name || '';
	opts.pos = opts.pos || {};
	opts.scale = opts.scale || {};
	opts.rotation = opts.rotation || {};
	//todo! mniejsze niz zero odpadaja ten warunke...
	vec3.set(this.position, (opts.pos.x ? opts.pos.x : 0),(opts.pos.y ? opts.pos.y : 0),(opts.pos.z ? opts.pos.z : 0));
	vec3.set(this.scale, (opts.scale.x ? opts.scale.x : 1),(opts.scale.y ? opts.scale.y : 1),(opts.scale.z ? opts.scale.z : 1));
	opts.rotation = {
		x: (typeof opts.rotation.x !== "undefined" ? opts.rotation.x : 0),
		y: (typeof opts.rotation.y !== "undefined" ? opts.rotation.y : 0),
		z: (typeof opts.rotation.z !== "undefined" ? opts.rotation.z : 0)
	}
	vec3.set(this.rotation, opts.rotation.x, opts.rotation.y,opts.rotation.z);
	this.Vertices = opts.vertexArr;
	this.VertexNormals = opts.vertexNormals;
	this.Rotation = 0;
	opts.triangleArr = opts.triangleArr || [];
    this.Triangles = opts.triangleArr;
    this.triangleCount = opts.triangleArr.length;
    this.Texture = opts.textureArr || [];
    opts.texture = opts.texture || {};
    this.texturesArray = opts.texture.src;
    this.offset = opts.texture.offset;
    this.activeTextures = [];

    if(this.texturesArray && this.texturesArray.length!==0) {
    	for(var i=0, len=this.texturesArray.length; i<len; i++){
    		this.activeTextures.push(new ENGINE.Texture(this.texturesArray[i], opts.texture.settings));
    	}
    } else {
    	this.noTexture = true;
    }
    this.ready = false;

}

ENGINE.BasicMesh.prototype = Object.create( ENGINE.Object3D.prototype );

ENGINE.Road = function(opts) {
	ENGINE.BasicMesh.call(this, opts);

	this.pathPoints = opts.pathPoints || [];
	this.pathNormals = opts.pathNormals || [];
	this.catmull = new ENGINE.CatmullRom();
	this.isRendered = false;
	this.init(opts.camera);
}

ENGINE.Road.prototype = Object.create( ENGINE.BasicMesh.prototype );

ENGINE.Road.prototype.updateMatrix = function() {
	return;
}

ENGINE.Road.prototype.multiply = function(m, v) {
	var result = vec4.create();

	result[0] = m[0]*v[0] + m[1]*v[1] + m[2]*v[2] + m[3]*v[3];
	result[1] = m[4]*v[0] + m[5]*v[1] + m[6]*v[2] + m[7]*v[3];
	result[2] = m[8]*v[0] + m[9]*v[1] + m[10]*v[2] + m[11]*v[3];
	result[3] = m[12]*v[0] + m[13]*v[1] + m[14]*v[2] + m[15]*v[3];
	return result;
}

ENGINE.Road.prototype.init = function(camera) {
	var matrix = mat4.create(), temp=vec4.create(), point = vec3.create();
	this.matrix = mat4.create();
	mat4.scale(this.matrix, this.matrix, this.scale);
	mat4.rotateX(this.matrix, this.matrix, this.rotation[0]);
	mat4.rotateY(this.matrix, this.matrix, this.rotation[1]);
	mat4.rotateZ(this.matrix, this.matrix, this.rotation[2]);
	mat4.translate(this.matrix, this.matrix, this.position);
	this.invertMatrix();
	for(var i=0, len=ENGINE.path.points.length; i<len; i++) {
		var a = vec4.create();
		temp = vec4.fromValues(ENGINE.path.points[i][0], ENGINE.path.points[i][1], ENGINE.path.points[i][2], 1);
		a = this.multiply(this.matrixInversed, temp);
		this.catmull.addPoint(new vec3.fromValues((-1)*a[0], (-1)*a[1], a[2]), vec3.fromValues((-1)*ENGINE.path.normals[i][0],(-1)*ENGINE.path.normals[i][1],ENGINE.path.normals[i][2]));
	}
}

ENGINE.GUI = function() {
	this._gui = new dat.GUI();
}

ENGINE.GUI.prototype.add = function(obj, val, slider) {
	if(slider) {
		return this._gui.add(obj, val, 0.00001, 0.01).step(0.01);
	}
	return this._gui.add(obj, val);
}

ENGINE.Texture = function(url, opt) {
	var _self = this, _gl = ENGINE.__gl;

	opt = opt || {};

	this.image = new Image();
    this.ready = false;
    this.image.onload = function () {
        this.ready = true;
        _self.glTex = _self.loadTexture(this, {});
    };
    this.image.src = url;
    this.loadTexture = function(Img, opts){  
	    //Create a new Texture and Assign it as the active one  
	    var TempTex = _gl.createTexture();  
	    _gl.bindTexture(_gl.TEXTURE_2D, TempTex);    
	      
	    var wrapS = opt.wrapS !== undefined ? opt.wrapS : ENGINE.RepeatWrapping,
	    wrapT = opt.wrapT !== undefined ? opt.wrapT : ENGINE.RepeatWrapping;
	      
	    //Load in The Image  
	    _gl.texImage2D(_gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, Img);    
	      
	    //Setup Scaling properties  
	    _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR);
  		_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR_MIPMAP_NEAREST);

  		_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, wrapS);
		_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, wrapT);
	    _gl.generateMipmap(_gl.TEXTURE_2D);   
	      
	    //Unbind the texture and return it.  
	    _gl.bindTexture(_gl.TEXTURE_2D, null);  
	    return TempTex;  
	}; 
}


ENGINE.path = (function(){
	var points = [], normals = [];
	return {
		points: points,
		normals: normals,
		add : function(p, n) {
			points.push(p);
			normals.push(n);
		}
	}
})();
