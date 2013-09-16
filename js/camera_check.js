		var numFs = 8;
  		var radius = 6;
  		var cos,cos1;
  		cos = Math.cos(1 * Math.PI * 2 / numFs) * radius;
  		cos1 = Math.sin(1 * Math.PI * 2 / numFs) * radius;
  		
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