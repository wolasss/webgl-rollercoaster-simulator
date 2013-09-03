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

	function initGL() {
	 	_gl = create3DContext(_canvas);
	}

	initGL();

};

ENGINE.Renderer.prototype = {
	constructor: ENGINE.WebGLRenderer
}