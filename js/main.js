var ROLLERCOASTER = (function() {
	//private vars
	var _config, renderer, scene, camera, _gl, _stats = false, _gui = false;

	_config = {
		x: 5
	};

	var onWindowResize = function() {
		renderer.setSize( window.innerWidth, window.innerHeight );
	},
	prepareEvents = function() {
		$(window).resize(onWindowResize);
	},
	init = function(opts) {
		opts = opts || {};

		generateScene();
		prepareEvents();
		animate();
		if(opts.stats) showStats();
		if(opts.controls) showControls();
	},
	generateScene = function() {
		renderer = new ENGINE.Renderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

        scene = new ENGINE.Scene();

        _gl = renderer.getContext();
	},
	animate = function () {
		requestAnimationFrame( animate );
		render();
		if(_stats) _stats.update();
	},
	render = function() {
		renderer.render();
	},
	showStats = function() {
		_stats = new Stats();
		_stats.setMode(0); // 0: fps, 1: ms

		// Align bottom-left
		_stats.domElement.style.position = 'absolute';
		_stats.domElement.style.left = '0px';
		_stats.domElement.style.bottom = '0px';

		document.body.appendChild( _stats.domElement );
	},
	showControls = function() {
		_gui = new dat.GUI();
        _gui.add(_config, 'x', 0, 100).step(1);
	};
	
	return {
		start : init,
		gl: function() {return renderer}
	}
})();