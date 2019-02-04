var vertices = [];

class Pyramid {
    constructor(cx,cy,cz,width, height){
        this.cx = cx;
        this.cy = cy;
        this.cz = cz;
        this.v1={};
        this.v2={};
        this.v3={};
        this.v4={};
        let radius = (width/2)/Math.cos(Math.PI/6);
        //v1 top
        this.v1.x=cx;
        this.v1.y=cy+height/2;
        this.v1.z=cz; 
        this.v1.r= Math.random(); 
        this.v1.g= Math.random();
        this.v1.b= Math.random();   
        //v2
        this.v2.x=cx;
        this.v2.y=cy-height/2;
        this.v2.z=cz+radius;  
        this.v2.r= Math.random();   
        this.v2.g= Math.random();
        this.v2.b= Math.random();
        //v3
        this.v3.x=cx+width/2;
        this.v3.y=cy-height/2;
        this.v3.z=cz-(Math.sin(Math.PI/6)*radius);        
        this.v3.r= Math.random();
        this.v3.g= Math.random();
        this.v3.b= Math.random();
        //v4
        this.v4.x=cx-width/2;
        this.v4.y=cy-height/2;
        this.v4.z=cz-(Math.sin(Math.PI/6)*radius);
        this.v4.r= Math.random();
        this.v4.g= Math.random();
        this.v4.b= Math.random();
        Pyramid.addSurface(this.v1,this.v2,this.v3);
        Pyramid.addSurface(this.v1,this.v3,this.v4);
        Pyramid.addSurface(this.v1,this.v4,this.v2);
        Pyramid.addSurface(this.v4,this.v2,this.v3);
    }
    static addSurface(one,two,three){
        vertices.push(one.x);
        vertices.push(one.y);
        vertices.push(one.z);
        vertices.push(one.r);
        vertices.push(one.g);
        vertices.push(one.b);
        vertices.push(two.x);
        vertices.push(two.y);
        vertices.push(two.z);
        vertices.push(two.r);
        vertices.push(two.g);
        vertices.push(two.b);
        vertices.push(three.x);
        vertices.push(three.y);
        vertices.push(three.z);
        vertices.push(three.r);
        vertices.push(three.g);
        vertices.push(three.b);        
    }
}

var vertexShaderCode = [
"precision mediump float;",
"",
"attribute vec3 vertPosition;",//attributes are like parameters input unique to each vertex
"attribute vec3 vertColor;",
"varying vec3 fragColor;",//varying are like outputs that goes to frag shader
"",
"uniform mat4 mWorld;",//uniform are like parameter input that are the same for all vertices
"uniform mat4 mView;",
"uniform mat4 mProj;",
"void main()",
"{",
"    fragColor = vertColor;",
"    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);",//[x,y,z,1.0]
"}"
].join("\n");

var fragmentShaderCode = [
"precision mediump float;",
"",
"varying vec3 fragColor;",
"void main()",
"{",
"    gl_FragColor = vec4(fragColor, 1.0);",
"}"
].join("\n");




function init() {
    const canvas = document.getElementById("webgl7");
    const gl = canvas.getContext("webgl");
    
    if (!gl) {
        console.log('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }
   
    //
    //SHADERS
    //
    //Create Shaders
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    //add shader source code
    gl.shaderSource(vertexShader, vertexShaderCode );
    gl.shaderSource(fragmentShader, fragmentShaderCode);
    //compile shaders
    gl.compileShader(vertexShader);
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        console.log(gl.getShaderInfoLog(fragmentShader));       
    }
    gl.compileShader(fragmentShader);
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        console.log(gl.getShaderInfoLog(fragmentShader));
    }
    //create program
    var program = gl.createProgram();
    //attach shaders to it
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    //link the program
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        console.log(gl.getProgramInfoLog(program));
    }
    //validate the program
    if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
        console.log(gl.getProgramInfoLog(program));
    }    
    //
    //Buffers
    //    
    /*
    for(let a=0; a<18*15000;a++){
        vertices.push(Math.random()*2-1);
    }*/
    let p= new Pyramid(0,0,0,1,Math.sqrt(6)/3);
    
    var vertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);    
    
    var positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
    var colorAttribLocation = gl.getAttribLocation(program, "vertColor");
    gl.vertexAttribPointer(
        positionAttribLocation,
        3,//number of elements
        gl.FLOAT,//type of element
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT,//size of each vertex
        0//offset from beginning of vertex to this attribute
    );
    gl.vertexAttribPointer(
        colorAttribLocation,
        3,//number of elements
        gl.FLOAT,//type of element
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT,//size of each 
        3 * Float32Array.BYTES_PER_ELEMENT//offset from beginning of vertex to this attribute
    );
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);
    gl.useProgram(program);
    
    var mWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
    var mViewUniformLocation = gl.getUniformLocation(program, "mView");
    var mProjUniformLocation = gl.getUniformLocation(program, "mProj");
    
    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);
    
    
    mat4.identity(worldMatrix);
    mat4.lookAt(viewMatrix, [0,0,-3],[0,0,0],[0,1,0]);
    mat4.perspective(projMatrix, Math.PI/4, canvas.width/canvas.height,0.1,1000.0);
  //  mat4.identity(projMatrix);
    
    
   /* worldMatrix = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
    viewMatrix = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
    projMatrix = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];*/
    
    
    
    gl.uniformMatrix4fv(mWorldUniformLocation, gl.FALSE, worldMatrix );
    gl.uniformMatrix4fv(mViewUniformLocation, gl.FALSE, viewMatrix );
    gl.uniformMatrix4fv(mProjUniformLocation, gl.FALSE, projMatrix );
    
    //
    //Main loop
    //    
                             gl.clearColor(0.1,0.5,0.6,0.5)//rgba 0-1values
    var identityMatrix = new Float32Array(16);
    mat4.identity(identityMatrix);
    var angleIncrement= Math.PI/60;
    var angle = 0; 
    var oldtime=0; 
    var fps=0;
    var fpsDisplay =document.getElementById("fps") ;     gl.enable(gl.DEPTH_TEST);             
    function loop(time){                       
        fps=Math.round(1000/(time-oldtime));
        oldtime = time;
        fpsDisplay.innerHTML=fps+"fps";
        
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        
        mat4.rotate(worldMatrix, identityMatrix, angle, [1,1,0.0]);
        gl.uniformMatrix4fv(mWorldUniformLocation, gl.FALSE, worldMatrix );
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length/6);
        angle+=angleIncrement;
        requestAnimationFrame(loop);
    }
   requestAnimationFrame(loop);
}