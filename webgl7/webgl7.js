let vertices = [];

class Pyramid {
    constructor(cx, cy, cz, width, height) {
        const radius = (width / 2) / Math.cos(Math.PI / 6);

        const v1 = {
            x: cx,
            y: cy + height / 2,
            z: cz,
            r: Math.random(),
            g: Math.random(),
            b: Math.random()
        };

        const v2 = {
            x: cx,
            y: cy - height / 2,
            z: cz + radius,
            r: Math.random(),
            g: Math.random(),
            b: Math.random()
        };

        const v3 = {
            x: cx + width / 2,
            y: cy - height / 2,
            z: cz - (Math.sin(Math.PI / 6) * radius),
            r: Math.random(),
            g: Math.random(),
            b: Math.random()
        };

        const v4 = {
            x: cx - width / 2,
            y: cy - height / 2,
            z: cz - (Math.sin(Math.PI / 6) * radius),
            r: Math.random(),
            g: Math.random(),
            b: Math.random()
        };

        Pyramid.addSurface([v1, v2, v3]);
        Pyramid.addSurface([v1, v3, v4]);
        Pyramid.addSurface([v1, v4, v2]);
        Pyramid.addSurface([v3, v2, v4]);
    }

    static addSurface(surface) {
        surface.forEach(element => {
            const value = Object.values(element);
            value.forEach(element => vertices.push(element));
        });
    }
}

// ------------------- //
// --- Init buffer --- //
// ------------------- //

// Initialize the buffers we'll need
initBuffers = (gl) => {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
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
    const canvas = document.getElementById('webgl7');
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

    new Pyramid(0, 0, 0, 1, Math.sqrt(6) / 3);
    
    // Init buffers
    initBuffers(gl);

    // Collect all the info needed to use the shader program
    const programInfo = {
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

    const worldMatrix = new Float32Array(16),
          viewMatrix = new Float32Array(16),
          normalize = false,
          stride = 6 * Float32Array.BYTES_PER_ELEMENT,
          numComponents = 3,
          type = gl.FLOAT;
    let offset = 0;
    mat4.identity(worldMatrix);
    mat4.lookAt(viewMatrix, [0, 0, -3], [0, 0, 0], [0, 1, 0]);

    // Create a perspective matrix, a special matrix that is used
    // to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees -> radians
    const fieldOfView = Math.PI / 4;
    const projectionMatrix = mat4.create();
    // Glmatrix.js always has the first argument as the destination to receive the result.
    mat4.perspective(projectionMatrix, fieldOfView, canvas.width / canvas.height, 0.1, 1000);  

    // 2nd: number of elements, 3rd: type of element, 5th: size of each vertex, 6th: offset from beginning of vertex to this attribute
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    // 2nd: number of elements, 3rd: type of element, 5th: size of each vertex, 6th: offset from beginning of vertex to this attribute
    offset = 3 * Float32Array.BYTES_PER_ELEMENT;
    gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, numComponents, type, normalize, stride, offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

    // Tell WebGL to use our program when drawing
    gl.useProgram(shaderProgram);
    
    // Set the shader uniforms
    gl.uniformMatrix4fv(programInfo.uniformLocations.mWorldUniformLocation, normalize, worldMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, normalize, viewMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, normalize, projectionMatrix);
    
    // rgba 0-1 values
    gl.clearColor(0.1, 0.5, 0.6, 0.5);

    const identityMatrix = new Float32Array(16);
    mat4.identity(identityMatrix);

    gl.enable(gl.DEPTH_TEST);

    /* ------------ */
    /* --- LOOP --- */
    /* ------------ */

    const angleIncrement = Math.PI / 200;
    let angle = 0;
    render = () => {        
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        mat4.rotate(worldMatrix, identityMatrix, angle, [1, 1, 0]);
        angle += angleIncrement;

        gl.uniformMatrix4fv(programInfo.uniformLocations.mWorldUniformLocation, gl.FALSE, worldMatrix );
        
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 6);
        
        requestAnimationFrame(render);
    }
   requestAnimationFrame(render);
}

// Draw
document.addEventListener('DOMContentLoaded', main());