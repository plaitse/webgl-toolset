// ------------------------- //
// --- Vertices position --- //
// ------------------------- //

let positions = [];

class Tetrahedron {
    constructor(cx, cy, cz, width, height) {
        const radius = (width / 2) / Math.cos(Math.PI / 6);

        // Vertice 1 - Position
        const v1 = {
            x: cx,
            y: cy + height / 2,
            z: cz,
            r: 0, // Red
            g: 0, // Green
            b: 0  // blue
        };

        // Vertice 2 - Position
        const v2 = {
            x: cx,
            y: cy - height / 2,
            z: cz + radius,
            r: 0,
            g: 0,
            b: 0
        };

        // Vertice 3 - Position
        const v3 = {
            x: cx + width / 2,
            y: cy - height / 2,
            z: cz - (Math.sin(Math.PI / 6) * radius),
            r: 0,
            g: 0,
            b: 0
        };

        // Vertice 4 - Position
        const v4 = {
            x: cx - width / 2,
            y: cy - height / 2,
            z: cz - (Math.sin(Math.PI / 6) * radius),
            r: 0,
            g: 0,
            b: 0
        };

        Tetrahedron.addSurface([v1, v2, v3]);
        Tetrahedron.addSurface([v1, v3, v4]);
        Tetrahedron.addSurface([v1, v4, v2]);
        Tetrahedron.addSurface([v3, v2, v4]);
    }

    static addSurface(surface) {
        surface.forEach(element => {
            const value = Object.values(element);
            value.forEach(element => positions.push(element));
        });
    }
}



// ------------------- //
// --- Init buffer --- //
// ------------------- //

// Initialize the buffers we'll need
initBuffers = (gl) => {
    // Create a buffer for the tetrahedron's positions
    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer operations to from here out
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Ceate tetrahedron
    new Tetrahedron(0, 0, 0, 1, Math.sqrt(6) / 3);

    // Pass the list of positions into WebGL to build the shape
    // We do this by creating a Float32Array from the JavaScript array, then use it to fill the current buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
}



// ------------------ //
// --- Draw scene --- //
// ------------------ //

drawScene = (gl, programInfo, buffers, tetraRotation) => {
    // Clear to white, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    // Clear everything
    gl.clearDepth(1.0);
    // Enable depth testing - opaque surfaces
    gl.enable(gl.DEPTH_TEST);
    // Near things obscure far things
    gl.depthFunc(gl.LEQUAL);

    // Clear the canvas before we start drawing on it
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix, a special matrix that is used
    // to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees -> radians
    const fieldOfView = Math.PI / 4;
    // with a width/height ratio that matches the display size of the canvas
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    // We only want to see objects between 0.1 units and 100 units away from the camera
    const zNear = 0.1;
    const zFar = 100;
    const projectionMatrix = mat4.create();
    // Glmatrix.js always has the first argument as the destination to receive the result.
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // Set the drawing position to the "identity" point, which is the center of the scene.
    const modelViewMatrix = mat4.create(),
        identityMatrix = mat4.create(),
        viewMatrix = mat4.create();

    mat4.lookAt(viewMatrix, [0, 0, -2], [0, 0, 0], [0, 1, 0]);

    // Arg: destination matrix, matrix to rotate, amount to rotate in radians, axis to rotate around (X)
    mat4.rotate(modelViewMatrix, identityMatrix, tetraRotation, [-1, -1, -1]);

    const normalize = false,
        stride = 6 * Float32Array.BYTES_PER_ELEMENT,
        numComponents = 3,
        type = gl.FLOAT;
    let offset = 0;
    // gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    // 2nd: number of elements, 3rd: type of element, 5th: size of each vertex, 6th: offset from beginning of vertex to this attribute
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    offset = 3 * Float32Array.BYTES_PER_ELEMENT;
    // 2nd: number of elements, 3rd: type of element, 5th: size of each vertex, 6th: offset from beginning of vertex to this attribute
    gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, numComponents, type, normalize, stride, offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);

    // Set the shader uniforms
    gl.uniformMatrix4fv(programInfo.uniformLocations.mWorldUniformLocation, normalize, modelViewMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, normalize, viewMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, normalize, projectionMatrix);

    // Params: mode, first, count
    // To full triangle, use gl.TRIANGLES
    gl.drawArrays(gl.LINES, 0, positions.length / 6);
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

    // If the shader program failed, stop
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
    const canvas = document.getElementById('webgl8');
    const gl = canvas.getContext('webgl');
    
    // If no context stop
    if (!gl) {
        console.log('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    // Vertex shader program
    const vsSource = `
        precision mediump float;

        attribute vec3 aVertexPosition;
        attribute vec3 aVertexColor;

        uniform mat4 mWorld;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        varying lowp vec3 vColor;

        void main() {
            gl_Position = uProjectionMatrix * uModelViewMatrix * mWorld * vec4(aVertexPosition, 1.0);
            vColor = aVertexColor;
        }
    `;

    // Fragment shader program
    const fsSource = `
        precision mediump float;

        varying lowp vec3 vColor;

        void main() {
            gl_FragColor = vec4(vColor, 1.0);
        }
    `;

    // Initialize a shader program; this is where all the lighting for the vertices and so forth is established
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    // Collect all the info needed to use the shader program
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            mWorldUniformLocation: gl.getUniformLocation(shaderProgram, 'mWorld'),
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        },
    };

    // Here's where we call the routine that builds all the objects we'll be drawing
    const buffers = initBuffers(gl);

    const angle = Math.PI / 200;
    // Set the rotation at 0 for the first draw
    let tetraRotation = 0;
    // Draw the scene repeatedly
    render = () => {
        drawScene(gl, programInfo, buffers, tetraRotation);
        tetraRotation += angle;
        requestAnimationFrame(render);
    }
   requestAnimationFrame(render);
}



// Draw
document.addEventListener('DOMContentLoaded', main());