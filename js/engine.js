var ENGINE = ENGINE || {};

ENGINE.isLightEnabled = false;

ENGINE.switchLight = function() {
	ENGINE.isLightEnabled = !ENGINE.isLightEnabled;
}

ENGINE.throwError = function(text) {
	$(function(){
		$('.engine').html(text).addClass('on');
	});
}

//physics 
ENGINE.gravityACC = 9.80665;
ENGINE.cartMass = 500;
ENGINE.speed=0;

ENGINE.CalculateSpeed = function(height) {
	var startEnergy =  (ENGINE.cartMass*4/2) + ENGINE.cartMass*height*ENGINE.gravityACC; 
	return function(h) {
		ENGINE.speed = Math.sqrt(  (2*startEnergy-2*ENGINE.cartMass*ENGINE.gravityACC*h)/ENGINE.cartMass  );
		ENGINE.speed = (7.2*ENGINE.speed)/100000;
	}
}

//renderer 
ENGINE.Renderer = function( opts ) {
	opts = opts || {};

	var _gl, _canvas, _shaders,
	TextureImage, Texture, ShaderProgram, VertexPosition, VertexTexture, AspectRatio, VertexNormals, lightingDirection, adjustedLD, flatLD, normalMatrix = mat4.create();

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
	PerspectiveMatrix,
	matrix = mat4.create(), 
	point = vec3.create(), 
	lookAtPoint = vec3.create(), 
	normal = vec3.create(), 
	pmatrix, 
	tmatrix, 
	time=0; // 0 - start 1 - end.

	ENGINE.MouseX = 0;
	ENGINE.MouseY = 0;

	this.renderObject = function(Object, TexturesArray, camera, road) {
		PerspectiveMatrix = camera.projectionMatrix;

		Object.updateMatrix();
		Object.invertMatrix();

		mat4.multiply(matrix, camera.matrixInversed, Object.matrixInversed);   
	   	_gl.uniformMatrix4fv(pmatrix, false, PerspectiveMatrix);    
	    _gl.uniformMatrix4fv(tmatrix, false, matrix);  

		if ( Object.name==='cart' ) {

			if((parseFloat(time,10)-1.0000000)>=0) {
				time=0;
			} 
			point = road.catmullPoints.point(time);
			normal = road.catmullNormals.point(time);
			lookAtPoint = road.catmullPoints.point(time+0.05);
			Object.up = normal;
			if(time>0.92) {
				lookAtPoint = road.catmullPoints.point(0.05); //don't look under cart!
			}
			Object.setPosition(point[0], point[1], point[2]);
			Object.pointAt(lookAtPoint[0], lookAtPoint[1], lookAtPoint[2]);

			ENGINE.CalculateSpeed((-1)*10*Object.position[1]);
			time=time+ENGINE.speed;
		}

		_gl.bindBuffer(_gl.ARRAY_BUFFER, Object.VertexBuffer);  
	    _gl.vertexAttribPointer(VertexPosition, 3, _gl.FLOAT, false, 0, 0);  
	  
		_gl.bindBuffer(_gl.ARRAY_BUFFER, Object.TextureBuffer);  
		_gl.vertexAttribPointer(VertexTexture, 2, _gl.FLOAT, false, 0, 0);

		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, Object.TriangleBuffer); 

		for(var i=0, len=TexturesArray.length; i<len; i++) {
		    	_gl.bindTexture(_gl.TEXTURE_2D, TexturesArray[i].glTex);  
	    		_gl.uniform1i(_gl.getUniformLocation(ShaderProgram, "uSampler"), 0); 

	    		if(Object.offset) {
			    	//_gl.bindBuffer(_gl.ARRAY_BUFFER, Object.NormalBuffer);
					//_gl.vertexAttribPointer(ShaderProgram.VertexNormals, Object.Triangles.length, _gl.FLOAT, false, 0, 0);
				}

				_gl.uniform1i(ShaderProgram.useLightingUniform, ENGINE.isLightEnabled);
					if (ENGINE.isLightEnabled) {
					  _gl.uniform3f(ShaderProgram.ambientColorUniform, 0.4, 0.4, 0.4);

					  lightingDirection = vec3.fromValues(-5, -5, -10);
					  adjustedLD = vec3.create();
					  vec3.normalize(adjustedLD, lightingDirection);

					  flatLD = new Float32Array(adjustedLD);
					  _gl.uniform3fv(ShaderProgram.lightingDirectionUniform, flatLD);

					  _gl.uniform3f(ShaderProgram.directionalColorUniform, 0.9, 0.9, 0.7);
				}

				normalMatrix = mat4.create();
				mat4.transpose(normalMatrix, Object.matrix);
				_gl.uniformMatrix4fv(ShaderProgram.nMatrixUniform, false, new Float32Array(normalMatrix));
				
		    	if(Object.offset) {
		    		_gl.drawElements(_gl.TRIANGLES, Object.offset, _gl.UNSIGNED_SHORT, i*2*Object.offset);   
		    	} else {
		    		_gl.drawElements(_gl.TRIANGLES, Object.Triangles.length, _gl.UNSIGNED_SHORT, 0);   
		    	}
		    	
		}	  	    
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
	 	if(!ENGINE.__gl) {
	 		ENGINE.throwError('Niestety, nie mogę załadować kontekstu WebGL.');
	 	}

	 	//set vars
	 	ENGINE.RepeatWrapping = ENGINE.__gl.REPEAT;
		ENGINE.ClampToEdgeWrapping = ENGINE.__gl.CLAMP_TO_EDGE;
	}

	initGL();
	_shaders = new ENGINE.Shaders();
	_shaders.init();
	_gui = new ENGINE.GUI();
	ENGINE._gui = _gui;

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

	this.position = vec3.fromValues(0,0,0);
	this.scale = vec3.fromValues(1,1,1);
	this.rotation = vec3.fromValues(0,0,0);

	this.up = vec3.fromValues(0,1,0);

	this.matrix = mat4.create();
	this.matrixInversed = mat4.create();

	this.matrixWorld = mat4.create();

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
	obj.NormalBuffer = _gl.createBuffer();

	_gl.bindBuffer(_gl.ARRAY_BUFFER, obj.VertexBuffer);  
	_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(obj.Vertices), _gl.STATIC_DRAW); 

	_gl.bindBuffer(_gl.ARRAY_BUFFER, obj.TextureBuffer);  
	_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(obj.Texture), _gl.STATIC_DRAW);  

	_gl.bindBuffer(_gl.ARRAY_BUFFER, obj.NormalBuffer);
  	_gl.bufferData(_gl.ARRAY_BUFFER, new Uint16Array(obj.Triangles), _gl.STATIC_DRAW);

	_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, obj.TriangleBuffer); 
	_gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.Triangles), _gl.STATIC_DRAW);

  	obj.NormalBuffer.numItems = obj.vertexNormals.length / 3;
  	obj.NormalBuffer.itemSize = 3;

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
	if(ENGINE.MouseY<1) {
		ENGINE.MouseY=1;
	}
	this.setPosition(( ENGINE.MouseX - this.position[0] ) * .05,(  ENGINE.MouseY - this.position[1] ) * .05,15);
}

ENGINE.RelativeCamera = function( fov, near, far, parent) {
	ENGINE.PerspectiveCamera.call( this, fov, near, far );

	this.parent = parent;
	this.updateProjectionMatrix();
}

ENGINE.RelativeCamera.prototype = Object.create( ENGINE.PerspectiveCamera.prototype );

ENGINE.RelativeCamera.prototype.lookAt = function ( x,y,z, up ) {
	var vector = vec3.fromValues((-1)*x, (-1)*y, (-1)*z),
	up = up || this.parent.up;
	this.camera=true;
	this.lookAtMatrix = mat4.create();
	this.lookAtCoor = vec3.fromValues(x,y,z);
	mat4.lookAt(this.lookAtMatrix, this.position, vector, this.parent.up);
	mat4.invert(this.lookAtMatrix,this.lookAtMatrix);
};

ENGINE.RelativeCamera.prototype.updateView = function () { 
	var parent  = this.parent, nextPoint = this.parent.nextPoint !== "undefined" ? this.parent.nextPoint : false,
	normal = vec3.create();
	vec3.normalize(normal, parent.up);
	this.position[0] = (-1)*this.parent.position[0];
	this.position[1] = (-1)*this.parent.position[1];
	this.position[2] = (-1)*this.parent.position[2];
	vec3.scale(normal, normal, 2);
	vec3.add(this.position, this.position, normal);

	if(nextPoint) {
		this.lookAt(nextPoint[0], nextPoint[1], nextPoint[2]);
	}
}

ENGINE.LookAtCamera = function( fov, near, far, parent) {
	ENGINE.RelativeCamera.call( this, fov, near, far, parent );

	this.updateProjectionMatrix();
}

ENGINE.LookAtCamera.prototype = Object.create( ENGINE.RelativeCamera.prototype );

ENGINE.LookAtCamera.prototype.lookAt = function ( x,y,z ) {
	var vector = vec3.fromValues((-1)*x, (-1)*y, (-1)*z);
	this.camera=true;
	this.lookAtMatrix = mat4.create();
	this.lookAtCoor = vec3.fromValues(x,y,z);
	mat4.lookAt(this.lookAtMatrix, this.position, vector, this.up);
	mat4.invert(this.lookAtMatrix,this.lookAtMatrix);
};

ENGINE.LookAtCamera.prototype.updateView = function () { 
	var parent  = this.parent;

	if(ENGINE.MouseY<2) {
		ENGINE.MouseY=2;
	} //don't look under plane
	this.setPosition(( ENGINE.MouseX - this.position[0] ) * .05,(  ENGINE.MouseY - this.position[1] ) * .05,15);
	this.lookAt(this.parent.position[0], (-1)*this.parent.position[1], this.parent.position[2]);

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
		    console.log(_gl.compileShader(this.VShader));
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
		    

		    //Link Vertex Position Attribute from Shader  
		    VertexPosition = _gl.getAttribLocation(ShaderProgram, "VertexPosition");  
		    _gl.enableVertexAttribArray(VertexPosition);  
		    obj.VertexPosition = VertexPosition;
		      
		    //Link Texture Coordinate Attribute from Shader  
		    VertexNormals = _gl.getAttribLocation(ShaderProgram, "aVertexNormal");
            _gl.enableVertexAttribArray(ShaderProgram.VertexNormals);
            ShaderProgram.VertexNormals = VertexNormals;

            VertexTexture = _gl.getAttribLocation(ShaderProgram, "TextureCoord");  
		    _gl.enableVertexAttribArray(VertexTexture); 
		    obj.VertexTexture = VertexTexture;

            ShaderProgram.samplerUniform = _gl.getUniformLocation(ShaderProgram, "uSampler");
            ShaderProgram.useLightingUniform = _gl.getUniformLocation(ShaderProgram, "uUseLighting");
            ShaderProgram.ambientColorUniform = _gl.getUniformLocation(ShaderProgram, "uAmbientColor");
            ShaderProgram.lightingDirectionUniform = _gl.getUniformLocation(ShaderProgram, "uLightingDirection");
            ShaderProgram.directionalColorUniform = _gl.getUniformLocation(ShaderProgram, "uDirectionalColor");

            obj.ShaderProgram = ShaderProgram;

		    return obj;
	}

}

ENGINE.Model = function(opts) {
	ENGINE.Object3D.call(this);

	this.name = opts.name || '';
	opts.pos = opts.pos || {};
	opts.scale = opts.scale || {};
	opts.rotation = opts.rotation || {};
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
    this.vertexNormals = opts.vertexNormals || [];
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

ENGINE.Model.prototype = Object.create( ENGINE.Object3D.prototype );

ENGINE.Road = function(opts) {
	ENGINE.Model.call(this, opts);

	this.pathPoints = opts.pathPoints || [];
	this.pathNormals = opts.pathNormals || [];
	this.catmullPoints = new ENGINE.CatmullRom();
	this.catmullNormals = new ENGINE.CatmullRom();
	this.isRendered = false;
	this.init(opts.camera);
}

ENGINE.Road.prototype = Object.create( ENGINE.Model.prototype );

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
		this.catmullPoints.addPoint(new vec3.fromValues((-1)*a[0], (-1)*a[1], (-1)*a[2]));
		this.catmullNormals.addPoint(vec3.fromValues((-1)*ENGINE.path.normals[i][0],(-1)*ENGINE.path.normals[i][1],(-1)*ENGINE.path.normals[i][2]));
	}
	var start =  this.catmullPoints.point(0);
	ENGINE.CalculateSpeed = ENGINE.CalculateSpeed((-1)*10*start[1]);
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
	    var TempTex = _gl.createTexture();  
	    _gl.bindTexture(_gl.TEXTURE_2D, TempTex);    
	      
	    var wrapS = opt.wrapS !== undefined ? opt.wrapS : ENGINE.RepeatWrapping,
	    wrapT = opt.wrapT !== undefined ? opt.wrapT : ENGINE.RepeatWrapping;
	      
	    _gl.texImage2D(_gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, Img);    
	      
	    _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR);
  		_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR_MIPMAP_NEAREST);

  		_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, wrapS);
		_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, wrapT);
	    _gl.generateMipmap(_gl.TEXTURE_2D);   
	      
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
