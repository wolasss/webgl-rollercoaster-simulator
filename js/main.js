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
		
		if(opts.stats) { 
			showStats();
		}

		if(opts.controls) {
			showControls();
		}
	},
	generateScene = function() {
		renderer = new ENGINE.Renderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        _gl = renderer.getContext();

        scene = new ENGINE.Scene();
        camera = new ENGINE.PerspectiveCamera(45.0, 0.1, 2000.0);
        camera.setPosition(0,8,0);

		var numFs = 8;
  		var radius = 6;
  		var cos,cos1;
  		cos = Math.cos(1 * Math.PI * 2 / numFs) * radius;
  		cos1 = Math.sin(1 * Math.PI * 2 / numFs) * radius;
  		camera.lookAt(8,6,0);
        for(var i=0; i<numFs; i++) {
        	var angle = i * Math.PI * 2 / numFs;

	        var minecraft = new ENGINE.BasicMesh({
	        	pos : {
	        		x: Math.cos(angle) * radius,
	        		y: -1,
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
					src: ['textures/Dirt.jpg']
				}
	        });

	        // scene.add( minecraft );
        }

        var plane = new ENGINE.BasicMesh({
	        	pos:{
	        		x:0,y:0,z:0
	        	},
	        	scale: {
	        		x:1,y:1,z:1
	        	},
	        	rotation:{
	        		x:-1.57,
	        		y:0,
	        		z:0
	        	},
	        	vertexArr: [
	        	-500,500,0,500,500,0,-500,-500,0,500,-500,0
	        	],
	        	triangleArr: [0, 1, 2,
        						1, 2, 3],
        		textureArr: [256.0, 0.0,  
         					256.0, 256.0,  
         					0.0, 0.0,  
         					0.0, 256.0],
         		texture : {
         			src: ['textures/grasslight-small-dark.jpg']
         		}
	    });

	    scene.add( plane );

        obj_utils.downloadMeshes(
	        {
	            'rollercoaster': 'models/roller.obj',
	            'cart' : 'models/cart.obj',
	            'skybox' : 'models/skybox.obj'
	        },
	        function(meshes){ 
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
	        			src : ['textures/ash_uvgrid01.jpg']
	        		}
	        	});

	        	scene.add( roller );
	        	
	        	var cart = new ENGINE.BasicMesh({
	        		name : 'cart',
	        		pos: {
	        			x: -8, y: -6, z: 0
	        		},
	        		rotation: {
	        			x: 0, y: 0, z:0
	        		},
	        		scale : {
	        			x: 1, y : 1 , z: 1
	        		},
	        		vertexArr : meshes.cart.vertices,
	        		triangleArr : meshes.cart.indices,
	        		textureArr : meshes.cart.textures,
	        		texture : {
	        			src : ['textures/Blue1.jpg']
	        		}
	        	});

	        	scene.add( cart );

	        	var skybox = new ENGINE.BasicMesh({
	        		name : 'skybox',
	        		pos: {
	        			x: 0, y:-100, z: 0
	        		},
	        		rotation: {
	        			x: -3.14, y:0, z:0
	        		},
	        		scale : {
	        			x: 1, y : 1 , z: 1
	        		},
	        		vertexArr : meshes.skybox.vertices,
	        		triangleArr : meshes.skybox.indices,
	        		textureArr : meshes.skybox.textures,
	        		texture : {
	        			src : ['textures/pz.jpg', 'textures/nz.jpg', 'textures/ny.jpg', 'textures/py.jpg','textures/nx.jpg', 'textures/px.jpg'],
	        			offset : 6
	        		}
	        	});

	        	scene.add( skybox );
	        }
    	);
        
	},
	animate = function () {
		requestAnimationFrame( animate );
		render();
		if(_stats) {
			_stats.update();
		}
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