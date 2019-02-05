const vertexShaderString = `
    attribute vec3 vertexPosition;
    attribute vec3 vertexColor;
    uniform float angle;
    varying vec3 varyingColor;

    void main(void) {
        float c = cos(angle);
        float s = sin(angle);
        mat3 rotation = mat3(c,  0,  s, 0,  1,  0, -s, 0,  c);
        vec3 transformedPos = rotation * vertexPosition;
        gl_Position = vec4(transformedPos, 1.0);
        varyingColor = vertexColor;
    }
`;

const fragmentShaderString = `
    precision mediump float;
    varying vec3 varyingColor;

    void main(void) {
        gl_FragColor = vec4(varyingColor, 1.0);
    }
`;


let gl;
console.log(gl);
let angleUniformLoc;

onresize = () => {
    const canvas =  document.getElementById('webgl9');
    const size = Math.min(window.innerWidth, window.innerHeight);

    canvas.width = size;
    canvas.height = size;

    gl.viewport(0, 0, size, size);
}

draw = (timestamp) => {

    const speed = 0.001;

    // console.log(gl);

    gl.uniform1f(angleUniformLoc, timestamp * speed);
    gl.drawElements(gl.TRIANGLES, 12, gl.UNSIGNED_BYTE, 0);
    
    requestAnimationFrame(draw);
}


start = () => {
    gl = document.getElementById('webgl9').getContext('webgl');
    
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderString);
    gl.compileShader(vertexShader);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderString);
    gl.compileShader(fragmentShader);
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    var vertexPositionAttrLoc = gl.getAttribLocation(program, 'vertexPosition');
    gl.enableVertexAttribArray(vertexPositionAttrLoc);
    var vertexColorAttrLoc = gl.getAttribLocation(program, 'vertexColor');
    gl.enableVertexAttribArray(vertexColorAttrLoc);
    angleUniformLoc = gl.getUniformLocation(program, 'angle');
    var vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    var vertices = [ 0.0,  1.0, -0.5, -1.0, -0.5, -0.5, 1.0, -0.5, -0.5, 0.0,  0.0,  1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vertexPositionAttrLoc, 3, gl.FLOAT, false, 0, 0);
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    var indices = [0, 1, 2, 0, 2, 3, 0, 3, 1, 2, 1, 3];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);
    var vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    var colors = [ 1.0,  0.0,  0.0, 0.0,  1.0,  0.0, 0.0,  0.0,  1.0, 1.0,  1.0,  0.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vertexColorAttrLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enable(gl.CULL_FACE);

    onresize();

    window.addEventListener('resize', onresize);

    draw();
}


// Draw
document.addEventListener('DOMContentLoaded', start());