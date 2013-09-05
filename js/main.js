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
        _gl = renderer.getContext();

        scene = new ENGINE.Scene();
        camera = new ENGINE.PerspectiveCamera(45.0, 0.1, 2000.0);
        camera.setPosition(0,3,9);

        camera.lookAt(0,0,2);
        //console.log(camera);
		var numFs = 6;
  		var radius = 6;

        for(var i=0; i<numFs; i++) {
        	var angle = i * Math.PI * 2 / numFs;
	        var plane = new ENGINE.BasicMesh({
	        	pos : {
	        		x: Math.cos(angle) * radius,
	        		y: 0,
	        		z: Math.sin(angle) * radius
	        	},
	        	scale : {
	        		x: 1,
	        		y: 1,
	        		z: 1,
	        	},
	        	rotation: {
	        		x: 0,
	        		y: 0,
	        		z: 0,
	        	},
	        	vertexArr: ENGINE.Cube.Vertices,
	        	triangleArr: ENGINE.Cube.Triangles,
	        	textureArr: ENGINE.Cube.Texture,
				texture: {
					imageSrc: 'textures/Dirt.jpg'
				}
	        });

	        scene.add( plane );
        }

        obj_utils.downloadMeshes(
	        {
	            'rollercoaster': 'models/roller.obj'
	        },
	        function(meshes){ 
	        	console.log(meshes);
	        	var roller = new ENGINE.BasicMesh({
	        		pos: {
	        			x: 0, y: 0, z: 0
	        		},
	        		scale : {
	        			x: 5, y : 5 , z: 5
	        		},
	        		vertexArr : meshes.rollercoaster.vertices,
	        		triangleArr : meshes.rollercoaster.indices,
	        		textureArr : meshes.rollercoaster.textures,
	        		texture : {
	        			imageSrc : 'textures/ash_uvgrid01.jpg'
	        		}
	        	});

	        	scene.add( roller );
	        	
	        }
    	);
        
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