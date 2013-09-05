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
	window.calls = 0;
	this.renderObject = function(Object, Texture, camera) {
		PerspectiveMatrix = camera.projectionMatrix;

		Object.updateMatrix();
		Object.invertMatrix();

		Object.rotateY(window.y);
		camera.rotateY(window.x);

		TransformMatrix = Object.matrix;

		 var VertexBuffer = _gl.createBuffer(); //Create a New Buffer  
	    //Bind it as The Current Buffer  
	    _gl.bindBuffer(_gl.ARRAY_BUFFER, VertexBuffer);  
	  
	    // Fill it With the Data  
	    _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(Object.Vertices), _gl.STATIC_DRAW);  
	  
	    //Connect Buffer To Shader's attribute  
	    _gl.vertexAttribPointer(VertexPosition, 3, _gl.FLOAT, false, 0, 0);  
	  
	    //Repeat For The next Two  
	    var TextureBuffer = _gl.createBuffer();  
	    _gl.bindBuffer(_gl.ARRAY_BUFFER, TextureBuffer);  
	    _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(Object.Texture), _gl.STATIC_DRAW);  
	    _gl.vertexAttribPointer(VertexTexture, 2, _gl.FLOAT, false, 0, 0);

	     var TriangleBuffer = _gl.createBuffer();  
	    _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, TriangleBuffer);  
	    _gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(Object.Triangles), _gl.STATIC_DRAW);


        //draw the triangle
        var matrix = mat4.create();
        mat4.multiply(matrix, camera.matrixInversed, Object.matrixInversed);
        //mat4.multiply(matrix, matrix, PerspectiveMatrix);
        //mat4.multiply(TransformMatrix, TransformMatrix, camera.matrixInversed);   

	    //Set slot 0 as the active Texture  
	    _gl.activeTexture(_gl.TEXTURE0);  
	  
	    //Load in the Texture To Memory  
	    _gl.bindTexture(_gl.TEXTURE_2D, Texture);  
	  
	    //Update The Texture Sampler in the fragment shader to use slot 0  
	    _gl.uniform1i(_gl.getUniformLocation(ShaderProgram, "uSampler"), 0);  
	  
	    //Set The Perspective and Transformation Matrices  
	    var pmatrix = _gl.getUniformLocation(ShaderProgram, "PerspectiveMatrix");  
	    _gl.uniformMatrix4fv(pmatrix, false, PerspectiveMatrix);  
	  
	    var tmatrix = _gl.getUniformLocation(ShaderProgram, "TransformationMatrix");  
	    _gl.uniformMatrix4fv(tmatrix, false, matrix);  
	  
	    //Draw The Triangles  
	    _gl.drawElements(_gl.TRIANGLES, Object.Triangles.length, _gl.UNSIGNED_SHORT, 0);   
	}
	this.render  = function ( scene, camera) {
		if ( camera instanceof ENGINE.Camera === false ) {
			return;
		}
		var lights = scene.__lights, renderList = [];

		renderList = scene.__objects;

		_gl.clear(_gl.COLOR_BUFFER_BIT|_gl.DEPTH_BUFFER_BIT); 
		for(var i=0, len=renderList.length; i<len; i++) {
			//render objects
			camera.updateMatrix();
			camera.invertMatrix();
			this.renderObject(renderList[i], renderList[i].activeTexture.glTex, camera);
		} 
		//_gl.viewport(0, 0, _gl.viewportWidth, _gl.viewportHeight);

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

	this.position = vec3.create();
	vec3.set(this.position,0,0,0);
	this.scale = vec3.create();
	vec3.set(this.scale,1,1,1);
	this.rotation = vec3.create();
	vec3.set(this.rotation,0,0,0);

	this.up = vec3.create();
	vec3.set(this.up, 0,1,0);

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
		this.rotation[1] = rad;
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

		this.matrixWorldNeedsUpdate = true;
	}
};

ENGINE.Object3D.prototype.setPosition = function(x,y,z) {
	vec3.set(this.position, x,y,z);
}
ENGINE.Object3D.prototype.invertMatrix = function () {
	mat4.invert(this.matrixInversed, this.matrix);
}


ENGINE.Scene = function() {
	ENGINE.Object3D.call(this);

	this.__objects = [];
	this.__lights = [];
};

ENGINE.Scene.prototype = Object.create( ENGINE.Object3D.prototype );

ENGINE.Scene.prototype.add = function(obj) { 
	this.children.push(obj);
	obj.parent = this;
	ENGINE._gui.add(window, 'x',true);
	ENGINE._gui.add(window, 'y',true);
	return this.__objects.push(obj);
}

ENGINE.Camera = function () {

	ENGINE.Object3D.call( this );

	this.matrixWorldInverse = mat4.create();
	//this.matrixInversed = mat4.create();
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


ENGINE.PerspectiveCamera.prototype.lookAt = function ( vector ) {
	var m = mat4.create();
	mat4.lookAt(m, this.position, vector, this.up);
	mat4.multiply(this.matrix, this.matrix, m);
};

ENGINE.PerspectiveCamera.prototype.updateProjectionMatrix = function () { 
	mat4.perspective(this.projectionMatrix, this.fov, this.aspect, this.near, this.far );
	mat4.invert(this.projectionMatrixInverse, this.projectionMatrix);
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
	        if(CurrentChild.nodeType == CurrentChild.TEXT_NODE)  
	            Code += CurrentChild.textContent;  
	        CurrentChild = CurrentChild.nextSibling;  
	    }  
	    return Code;  
	} 

	this.init = function() {
		if(!this.FShader || !this.VShader)  
    		alert("Error, Could Not Find Shaders");  
		else  
		{  
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
	vec3.set(this.position, (opts.pos.x ? opts.pos.x : 0),(opts.pos.y ? opts.pos.y : 0),(opts.pos.z ? opts.pos.z : 0));
	vec3.set(this.scale, (opts.scale.x ? opts.scale.x : 1),(opts.scale.y ? opts.scale.y : 1),(opts.scale.z ? opts.scale.z : 1));
	vec3.set(this.rotation, (opts.rotation.x ? opts.rotation.x : 0),(opts.rotation.y ? opts.rotation.y : 0),(opts.rotation.z ? opts.rotation.z : 0));
	this.Vertices = opts.vertexArr;
	this.Rotation = 0;
	opts.triangleArr = opts.triangleArr || [];
    this.Triangles = opts.triangleArr;
    this.triangleCount = opts.triangleArr.length;
    this.Texture = opts.textureArr || [];
    opts.texture = opts.texture || {};
    this.texUrl = opts.texture.imageSrc;
    if(this.texUrl) this.activeTexture = new ENGINE.Texture(this.texUrl); else this.noTexture = true;
    this.ready = false;
}

ENGINE.BasicMesh.prototype = Object.create( ENGINE.Object3D.prototype );

ENGINE.GUI = function() {
	this._gui = new dat.GUI();
}

ENGINE.GUI.prototype.add = function(obj, val, slider) {
	if(slider) return this._gui.add(obj, val, -10, 10).step(.1);
	return this._gui.add(obj, val);
}

ENGINE.Texture = function(url) {
	var _self = this, _gl = ENGINE.__gl;
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
	      
	    //Flip Positive Y (Optional)  
	    //_gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, true);  
	      
	    //Load in The Image  
	    _gl.texImage2D(_gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, Img);    
	      
	    //Setup Scaling properties  
	    _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR);
  		_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR_MIPMAP_NEAREST);
	    _gl.generateMipmap(_gl.TEXTURE_2D);   
	      
	    //Unbind the texture and return it.  
	    _gl.bindTexture(_gl.TEXTURE_2D, null);  
	    return TempTex;  
	}; 
}

