var ROLLERCOASTER = (function() {
	//private vars
	var _config, _renderer, _stats = false, _gui = false;

	_config = {
		x: 5
	};

	var onWindowResize = function() {
		_renderer.setSize( window.innerWidth, window.innerHeight );
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
		_renderer = new ENGINE.Renderer();
        _renderer.setSize( window.innerWidth, window.innerHeight );
	},
	animate = function () {
		requestAnimationFrame( animate );
		render();
		if(_stats) _stats.update();
	},
	render = function() {
		_renderer.render();
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
		start : init
	}
})();