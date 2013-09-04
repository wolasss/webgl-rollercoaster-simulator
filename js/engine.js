var ENGINE = ENGINE || {};

//renderer 
ENGINE.Renderer = function( opts ) {
	//params
	opts = opts || {};
	//vars

	//internal vars
	var _gl, _canvas, _shaders,
	TextureImage, Texture, ShaderProgram, VertexPosition, VertexTexture;
	var AspectRatio;

	

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
		AspectRatio = _canvas.width / _canvas.height;
		this.setViewport(0, 0, _canvas.width, _canvas.height);
	}
	window.zmienna = 146;
	window.x =window.innerWidth / window.innerHeight;
	window.y =1;
	window.z = 10000.0;
	this.renderObject = function(Object, Texture) {
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

	    //Generate The Perspective Matrix 
		
	    var PerspectiveMatrix = MakePerspective(window.zmienna, window.x, window.y, window.z);  
	  
	    var TransformMatrix = Object.GetTransforms();  
	  
	    //Set slot 0 as the active Texture  
	    _gl.activeTexture(_gl.TEXTURE0);  
	  
	    //Load in the Texture To Memory  
	    _gl.bindTexture(_gl.TEXTURE_2D, Texture);  
	  
	    //Update The Texture Sampler in the fragment shader to use slot 0  
	    _gl.uniform1i(_gl.getUniformLocation(ShaderProgram, "uSampler"), 0);  
	  
	    //Set The Perspective and Transformation Matrices  
	    var pmatrix = _gl.getUniformLocation(ShaderProgram, "PerspectiveMatrix");  
	    _gl.uniformMatrix4fv(pmatrix, false, new Float32Array(PerspectiveMatrix));  
	  
	    var tmatrix = _gl.getUniformLocation(ShaderProgram, "TransformationMatrix");  
	    _gl.uniformMatrix4fv(tmatrix, false, new Float32Array(TransformMatrix));  
	  
	    //Draw The Triangles  
	    _gl.drawElements(_gl.TRIANGLES, Object.Triangles.length, _gl.UNSIGNED_SHORT, 0);   
	}
	this.render  = function ( scene, camera, renderTarget) {
		if ( camera instanceof ENGINE.Camera === false ) {
			return;
		}
		var lights = scene.__lights, renderList = [];

		renderList = scene.__objects;

		_gl.clear(_gl.COLOR_BUFFER_BIT|_gl.DEPTH_BUFFER_BIT); 
		for(var i=0, len=renderList.length; i<len; i++) {
			//render objects
			this.renderObject(renderList[i], renderList[i].activeTexture.glTex);
		} 
		//_gl.viewport(0, 0, _gl.viewportWidth, _gl.viewportHeight);

		//this.renderObject(renderList[0], Texture);

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

	function MakePerspective(FOV, AspectRatio, Closest, Farest){  
	    var YLimit = Closest * Math.tan(FOV * Math.PI / 360);  
	    var A = -( Farest + Closest ) / ( Farest - Closest );  
	    var B = -2 * Farest * Closest / ( Farest - Closest );  
	    var C = (2 * Closest) / ( (YLimit * AspectRatio) * 2 );  
	    var D = (2 * Closest) / ( YLimit * 2 );  
	    return [  
	        C, 0, 0, 0,  
	        0, D, 0, 0,  
	        0, 0, A, -1,  
	        0, 0, B, 0  
	    ];  
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
	 	TextureImage = new Image();  
  
	    TextureImage.onload = function(){  
	    	Texture = LoadTexture(TextureImage); 
	    } 
   		TextureImage.src = "/rollercoaster/textures/grasslight-small.jpg"; 
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

	this.matrix = mat4.create();
	this.matrixWorld = mat4.create();
};

ENGINE.Object3D.prototype = {
	constructor: ENGINE.Object3D
};

ENGINE.Scene = function() {
	ENGINE.Object3D.call(this);

	this.__objects = [];
	this.__lights = [];
};

ENGINE.Scene.prototype = Object.create( ENGINE.Object3D.prototype );

ENGINE.Scene.prototype.add = function(obj) { 
	ENGINE._gui.add(obj, 'Rotation');
	ENGINE._gui.add(obj.rotation, 'x', true);
	ENGINE._gui.add(obj.rotation, 'y');
	ENGINE._gui.add(obj.rotation, 'z');
	ENGINE._gui.add(obj.scale, 'x');
	ENGINE._gui.add(obj.scale, 'y');
	ENGINE._gui.add(obj.scale, 'z');
	ENGINE._gui.add(obj.pos, 'x');
	ENGINE._gui.add(obj.pos, 'y');
	ENGINE._gui.add(obj.pos, 'z');
	ENGINE._gui.add(window, 'zmienna');
	ENGINE._gui.add(window, 'x');
	ENGINE._gui.add(window, 'y');
	ENGINE._gui.add(window, 'z');

	this.children.push(obj);
	obj.parent = this;
	return this.__objects.push(obj)
	;
}

ENGINE.Camera = function () {

	ENGINE.Object3D.call( this );

	this.matrixWorldInverse = mat4.create();

	this.projectionMatrix = mat4.create();
	this.projectionMatrixInverse = mat4.create();

};

ENGINE.Camera.prototype = Object.create( ENGINE.Object3D.prototype );


ENGINE.Camera.prototype.lookAt = function () {

	// This routine does not support cameras with rotated and/or translated parent(s)

	var m1 = mat4.create();

	return function ( vector ) {

		m1.lookAt( this.position, vector, this.up );

		//this.quaternion.setFromRotationMatrix( m1 );

	};

}();

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
	this.name = opts.name || '';
	opts.pos = opts.pos || {};
	this.pos = {
		x: opts.pos.x || 0,
		y: opts.pos.y || 0,
		z: opts.pos.z || 0
	};
	this.scale = {
		x: opts.scale.x || 0,
		y: opts.scale.y || 0,
		z: opts.scale.z || 0
	};
	this.rotation = {
		x: opts.rotation.x || 0,
		y: opts.rotation.y || 0,
		z: opts.rotation.z || 0
	},
	this.Vertices = opts.vertexArr;
	this.Rotation = 0;
	opts.triangleArr = opts.triangleArr || [];
    this.Triangles = opts.triangleArr;
    this.triangleCount = opts.triangleArr.length;
    this.Texture = opts.textureArr || [];
    opts.texture = opts.texture || {};
    this.texUrl = opts.texture.imageSrc;
    if(this.texUrl) this.activeTexture = new ENGINE.Texture(this.texUrl);
    this.ready = false;
    this.GetTransforms = function () {
	    
	    //Create a Blank Identity Matrix
	    var TMatrix = mat4.create();
	    
	    //Scaling
	    var Temp = mat4.create();
	    Temp[0] *= this.scale.x;
	    Temp[5] *= this.scale.y;
	    Temp[10] *= this.scale.z;
	    //mat4.multiply(Tmatrix,Temp);
	    TMatrix = mat4.multiply(TMatrix,TMatrix,Temp);
	 
	    //Rotating X
	    Temp = mat4.create();
	    var X = this.rotation.x * (Math.PI / 180.0);
	    Temp[5] = Math.cos(X);
	    Temp[6] = Math.sin(X);
	    Temp[9] = -1 * Math.sin(X);
	    Temp[10] = Math.cos(X);
	    //TMatrix = MultiplyMatrix(TMatrix, Temp);
	    TMatrix = mat4.multiply(TMatrix,TMatrix,Temp);

	    //Rotating Y
	    Temp = mat4.create();
	    var Y = this.rotation.y * (Math.PI / 180.0);
	    Temp[0] = Math.cos(Y);
	    Temp[2] = -1 * Math.sin(Y);
	    Temp[8] = Math.sin(Y);
	    Temp[10] = Math.cos(Y);
	    //TMatrix = MultiplyMatrix(TMatrix, Temp);
	    TMatrix = mat4.multiply(TMatrix,TMatrix,Temp);
	 
	    //Rotating Z
	    Temp = mat4.create();
	    var Z = this.rotation.z * (Math.PI / 180.0);
	    Temp[0] = Math.cos(Z);
	    Temp[1] = Math.sin(Z);
	    Temp[4] = -1 * Math.sin(Z);
	    Temp[5] = Math.cos(Z);
	    //TMatrix = MultiplyMatrix(TMatrix, Temp);
	    TMatrix = mat4.multiply(TMatrix,TMatrix,Temp);

	    //Moving
	    Temp = mat4.create();
	    Temp[12] = this.pos.x;
	    Temp[13] = this.pos.y;
	    Temp[14] = this.pos.z * -1;
	 
	    return mat4.multiply(TMatrix,TMatrix,Temp);
	}
}

ENGINE.BasicMesh.prototype = Object.create( ENGINE.Object3D.prototype );

ENGINE.GUI = function() {
	this._gui = new dat.GUI();
}

ENGINE.GUI.prototype.add = function(obj, val, slider) {
	if(slider) return this._gui.add(obj, val, -100, 100).step(1);
	return this._gui.add(obj, val);
}

ENGINE.Texture = function(url) {
	var _self = this, _gl = ENGINE.__gl;
	console.log(_gl);
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

