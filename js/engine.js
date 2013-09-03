var ENGINE = ENGINE || {};

//renderer 
ENGINE.Renderer = function( opts ) {
	//params
	opts = opts || {};
	//vars

	//internal vars
	var _gl, _canvas;

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

		this.setViewport(0, 0, _canvas.width, _canvas.height);
	}

	this.render  = function ( scene, camera, renderTarget, forceClear ) {
		_gl.viewport(0, 0, _gl.viewportWidth, _gl.viewportHeight);
		_gl.clear(_gl.COLOR_BUFFER_BIT|_gl.DEPTH_BUFFER_BIT); 
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

		_gl.enable( _gl.DEPTH_TEST );
		_gl.depthFunc( _gl.LEQUAL ); // Near things obscure far things

		_gl.frontFace( _gl.CCW );
		_gl.cullFace( _gl.BACK );
		_gl.enable( _gl.CULL_FACE );

		_gl.enable( _gl.BLEND );
		_gl.blendEquation( _gl.FUNC_ADD );
		_gl.blendFunc( _gl.SRC_ALPHA, _gl.ONE_MINUS_SRC_ALPHA );
	};

	function initGL() {
	 	_gl = create3DContext(_canvas);
	}

	initGL();
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

ENGINE.Scene.prototype.__addObject = function() { }
ENGINE.Scene.prototype.__removeObject = function() { }

