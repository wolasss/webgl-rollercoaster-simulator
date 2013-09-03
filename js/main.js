var ROLLERCOASTER = (function() {
	//private vars
	var _renderer, _stats = false;


	var onWindowResize = function() {
		_renderer.setSize( window.innerWidth, window.innerHeight );
	},
	prepareEvents = function() {
		$(window).resize(onWindowResize);
	},
	init = function(opts) {
		opts = opts || {};
		opts.stats = opts.stats || true;

		generateScene();
		prepareEvents();
		animate();
		if(opts.stats) showStats();
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
		_stats.setMode(1); // 0: fps, 1: ms

		// Align bottom-left
		_stats.domElement.style.position = 'absolute';
		_stats.domElement.style.left = '0px';
		_stats.domElement.style.bottom = '0px';

		document.body.appendChild( _stats.domElement );
	};
	
	return {
		start : init
	}
})();