var ROLLERCOASTER = (function() {
	//private vars
	var _config, renderer, scene, camera, _gl, _stats = false, _gui = false;

	_config = {
		x: 5
	};

	LoadTexture = function(Img){  
		console.log('a:', _gl);
	    //Create a new Texture and Assign it as the active one  
	    var TempTex = _gl.createTexture();  
	    _gl.bindTexture(_gl.TEXTURE_2D, TempTex);    
	      
	    //Flip Positive Y (Optional)  
	    _gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, true);  
	      
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
        _gl = renderer.getContext();

        scene = new ENGINE.Scene();
        camera = new ENGINE.Camera();

        var plane = new ENGINE.BasicMesh({
        	pos : {
        		x: 0,
        		y: 0,
        		z: 0
        	},
        	scale : {
        		x: 18.8,
        		y: 2.5,
        		z: 3.2,
        	},
        	rotation: {
        		x: -37.0,
        		y: 0,
        		z: 0,
        	},
        	vertexArr: [ 1.0,  1.0,  -1.0,
				         1.0, -1.0,  -1.0,
				        -1.0,  1.0,  -1.0,
				        -1.0, -1.0,  -1.0],
        	triangleArr: [	0, 1, 2,
       						1, 2, 3],
        	textureArr: [	8.0, 0.0,
         					8.0, 8.0,
         					0.0, 0.0,
         					0.0, 8.0],
			texture: {
				imageSrc: 'textures/grasslight-small.jpg'
			}
        });

        scene.add( plane );
        
	},
	animate = function () {
		requestAnimationFrame( animate );
		render();
		if(_stats) _stats.update();
	},
	render = function() {
		renderer.render(scene, camera);
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