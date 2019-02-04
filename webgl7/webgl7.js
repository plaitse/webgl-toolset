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

        Pyramid.addSurface(v1, v2, v3);
        Pyramid.addSurface(v1, v3, v4);
        Pyramid.addSurface(v1, v4, v2);
        Pyramid.addSurface(v4, v2, v3);
    }

    static addSurface(v1, v2, v3) {
        let first = Object.values(v1),
            second = Object.values(v2),
            third = Object.values(v3);

        first.forEach(element => vertices.push(element));
        second.forEach(element => vertices.push(element));
        third.forEach(element => vertices.push(element)); 
    }
}

const vertexShaderCode = [
    "precision mediump float;",
    "",
    "attribute vec3 vertPosition;", // attributes are like parameters input unique to each vertex
    "attribute vec3 vertColor;",
    "varying vec3 fragColor;", // varying are like outputs that goes to frag shader
    "",
    "uniform mat4 mWorld;", // uniform are like parameter input that are the same for all vertices
    "uniform mat4 mView;",
    "uniform mat4 mProj;",
    "void main()",
    "{",
    "    fragColor = vertColor;",
    "    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);", // [x,y,z,1.0]
    "}"
].join('\n');

// Vertex shader program
// const vertexShaderCode = `
//     precision mediump float;

//     attribute vec3 vertPosition;
//     attribute vec3 vertColor;
//     varying vec3 fragColor;

//     uniform mat4 mWorld;
//     uniform mat4 mView;
//     uniform mat4 mProj;
//     void main() {
//         fragColor = vertColor;
//         gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);",
//     }
// `;

const fragmentShaderCode = [
    "precision mediump float;",
    "",
    "varying vec3 fragColor;",
    "void main()",
    "{",
    "    gl_FragColor = vec4(fragColor, 1.0);",
    "}"
].join('\n');

// Fragment shader program
// const fragmentShaderCode = `
//     precision mediump float

//     varying vec3 fragColor;

//     void main() {
//         gl_FragColor = vec4(fragColor, 1.0);
//     }
// `;

init = () => {
    const canvas = document.getElementById('webgl7');
    const gl = canvas.getContext('webgl');
    
    if (!gl) {
        console.log('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }
   
    /* --------------- */
    /* --- SHADERS --- */
    /* --------------- */

    // Create shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    // Add shader source code
    gl.shaderSource(vertexShader, vertexShaderCode );
    gl.shaderSource(fragmentShader, fragmentShaderCode);

    // Compile shader
    gl.compileShader(vertexShader);
    gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    gl.compileShader(fragmentShader);
    gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);

    // Create program
    var program = gl.createProgram();

    // Attach shader to it
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // Link the program
    gl.linkProgram(program);
    gl.getProgramParameter(program, gl.LINK_STATUS);

    // Validate the program
    gl.getProgramParameter(program, gl.VALIDATE_STATUS);

    /* --------------- */
    /* --- BUFFERS --- */
    /* --------------- */

    new Pyramid(0, 0, 0, 1, Math.sqrt(6) / 3);
    
    const vertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);    
    
    const positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
    // 2nd: number of elements, 3rd: type of element, 5th: size of each vertex, 6th: offset from beginning of vertex to this attribute
    gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, gl.FALSE, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
    const colorAttribLocation = gl.getAttribLocation(program, "vertColor");
    // 2nd: number of elements, 3rd: type of element, 5th: size of each vertex, 6th: offset from beginning of vertex to this attribute
    gl.vertexAttribPointer(colorAttribLocation, 3, gl.FLOAT, gl.FALSE, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);
    gl.useProgram(program);
    
    const mWorldUniformLocation = gl.getUniformLocation(program, "mWorld"),
          mViewUniformLocation = gl.getUniformLocation(program, "mView"),
          mProjUniformLocation = gl.getUniformLocation(program, "mProj"),
          worldMatrix = new Float32Array(16),
          viewMatrix = new Float32Array(16),
          projMatrix = new Float32Array(16);
    mat4.identity(worldMatrix);
    mat4.lookAt(viewMatrix, [0, 0, -3], [0, 0, 0], [0, 1, 0]);
    mat4.perspective(projMatrix, Math.PI/4, canvas.width/canvas.height, 0.1, 1000);  
    gl.uniformMatrix4fv(mWorldUniformLocation, gl.FALSE, worldMatrix );
    gl.uniformMatrix4fv(mViewUniformLocation, gl.FALSE, viewMatrix );
    gl.uniformMatrix4fv(mProjUniformLocation, gl.FALSE, projMatrix );
    
    /* ------------ */
    /* --- LOOP --- */
    /* ------------ */

    const identityMatrix = new Float32Array(16);
          angleIncrement = Math.PI/60;
          fpsDisplay = document.getElementById('fps');

    let angle = 0,
        oldtime = 0,
        fps = 0;

    // rgba 0-1 values
    gl.clearColor(0.1, 0.5, 0.6, 0.5);
    mat4.identity(identityMatrix);
    gl.enable(gl.DEPTH_TEST);

    loop = (time) => {
        fps = Math.round(1000/(time-oldtime));
        oldtime = time;
        fpsDisplay.innerHTML = `${fps} fps`;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        mat4.rotate(worldMatrix, identityMatrix, angle, [1, 1, 0]);
        gl.uniformMatrix4fv(mWorldUniformLocation, gl.FALSE, worldMatrix );
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 6);
        angle += angleIncrement;
        requestAnimationFrame(loop);
    }
   requestAnimationFrame(loop);
}
