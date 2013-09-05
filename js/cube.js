var ENGINE = ENGINE || {};


ENGINE.Cube = {
    Rotation : 90,
    Vertices : [ // X, Y, Z Coordinates
    
       1.0,  1.0,  -1.0,  
         1.0, -1.0,  -1.0,  
        -1.0,  1.0,  -1.0,  
        -1.0, -1.0,  -1.0,  
          
        //Back  
          
         1.0,  1.0,  1.0,  
         1.0, -1.0,  1.0,  
        -1.0,  1.0,  1.0,  
        -1.0, -1.0,  1.0,  
          
        //Right  
          
         1.0,  1.0,  1.0,  
         1.0, -1.0,  1.0,  
         1.0,  1.0, -1.0,  
         1.0, -1.0, -1.0,  
           
         //Left  
           
        -1.0,  1.0,  1.0,  
        -1.0, -1.0,  1.0,  
        -1.0,  1.0, -1.0,  
        -1.0, -1.0, -1.0,  
          
        //Top  
          
         1.0,  1.0,  1.0,  
        -1.0, -1.0,  1.0,  
         1.0, -1.0, -1.0,  
        -1.0, -1.0, -1.0,  
          
        //Bottom  
          
         1.0, -1.0,  1.0,  
        -1.0, -1.0,  1.0,  
         1.0, -1.0, -1.0,  
        -1.0, -1.0, -1.0  
    
    ],
    Triangles : [ // Also in groups of threes to define the three points of each triangle
        //The numbers here are the index numbers in the vertex array
        
        //Front
        
        0, 1, 2,
        1, 2, 3,
        
        //Back
        
        4, 5, 6,
        5, 6, 7,
        
        //Right
        
        8, 9, 10,
        9, 10, 11,
        
        //Left
        
        12, 13, 14,
        13, 14, 15,
        
        //Top
        
        16, 17, 18,
        17, 18, 19,
        
        //Bottom
        
        20, 21, 22,
        21, 22, 23
        
    ],
    Texture : [ //This array is in groups of two, the x and y coordinates (a.k.a U,V) in the texture
        //The numbers go from 0.0 to 1.0, One pair for each vertex
        
         //Front
         
         1.0, 1.0,  
         1.0, 0.0,  
         0.0, 1.0,  
         0.0, 0.0,  
           
          
         //Back  
          
         0.0, 1.0,  
         0.0, 0.0,  
         1.0, 1.0,  
         1.0, 0.0,  
          
         //Right  
          
         1.0, 1.0,  
         1.0, 0.0,  
         0.0, 1.0,  
         0.0, 0.0,  
           
         //Left  
           
         0.0, 1.0,  
         0.0, 0.0,  
         1.0, 1.0,  
         1.0, 0.0,  
          
         //Top  
          
         1.0, 0.0,  
         1.0, 1.0,  
         0.0, 0.0,  
         0.0, 1.0,  
          
         //Bottom  
          
         0.0, 0.0,  
         0.0, 1.0,  
         1.0, 0.0,  
         1.0, 1.0  
    ]
};
