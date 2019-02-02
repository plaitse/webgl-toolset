// ------------------- //
// --- Init buffer --- //
// ------------------- //

// Initialize the buffers we'll need
// Here we just have one object, a simple two-dimensional square
initBuffers = (gl) => {
  // Create a buffer for the square's positions
  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer operations to from here out
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Ceate an array of positions for the square
  const positions = [
      1.0,  1.0,
      -1.0,  1.0,
      1.0, -1.0,
      -1.0, -1.0,
  ];

  // Pass the list of positions into WebGL to build the shape
  // We do this by creating a Float32Array from the JavaScript array, then use it to fill the current buffer
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return { position: positionBuffer };
}



// ------------------ //
// --- Draw scene --- //
// ------------------ //

drawScene = (gl, programInfo, buffers) => {
  // Clear to black, fully opaque
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Clear everything
  gl.clearDepth(1.0);
  // Enable depth testing
  gl.enable(gl.DEPTH_TEST);
  // Near things obscure far things
  gl.depthFunc(gl.LEQUAL);

  // Clear the canvas before we start drawing on it
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is used
  // to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees -> radians
  const fieldOfView = 45 * Math.PI / 180;
  // with a width/height ratio that matches the display size of the canvas
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  // We only want to see objects between 0.1 units and 100 units away from the camera
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // Glmatrix.js always has the first argument as the destination to receive the result.
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  // Set the drawing position to the "identity" point, which is the center of the scene.
  const modelViewMatrix = mat4.create();

  // Move the drawing position a bit to where we want to start drawing the square.
  // Arg: destination matrix, matrix to translate, amount to translate
  mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);

  // Tell WebGL how to pull out the positions from the position buffer into the vertexPosition attribute
  const numComponents = 2,
        type = gl.FLOAT,
        normalize = false,
        stride = 0,
        offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);

  // Set the shader uniforms
  gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv( programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

  const vertexCount = 4;
  gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
}



// ------------------- //
// --- Load shader --- //
// ------------------- //

// Creates a shader of the given type, uploads the source and compiles it
loadShader = (gl, type, source) => {
  const shader = gl.createShader(type);

  // Send the source to the shader object
  gl.shaderSource(shader, source);

  // Compile the shader program
  gl.compileShader(shader);

  // If compilation failed stop
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}



// --------------------------- //
// --- Init shader program --- //
// --------------------------- //

// Initialize a shader program so WebGL knows how to draw our data
initShaderProgram = (gl, vsSource, fsSource) => {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If theshader program failed stop
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}



// --------------------- //
// --- Main function --- //
// --------------------- //

main = () => {
  const canvas = document.querySelector('#webgl2');
  const gl = canvas.getContext('webgl');

  // If no context stop
  if (!gl) {
    console.log('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program
  const vsSource = `
    attribute vec4 aVertexPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `;

  // Fragment shader program
  const fsSource = `
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  `;

  // Initialize a shader program; this is where all the lighting for the vertices and so forth is established
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
  };

  // Here's where we call the routine that builds all the objects we'll be drawing
  const buffers = initBuffers(gl);

  // Draw the scene
  drawScene(gl, programInfo, buffers);
}



// Launch
main();