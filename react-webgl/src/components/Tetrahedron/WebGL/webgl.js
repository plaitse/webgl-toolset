class WebGL {
    init(gl) { this.gl = gl; }

    // Buffers
    createBuffer = () => this.gl.createBuffer();
    bindBuffer = (buffer) => this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    addBufferData = (vertices) => this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

    // Canvas
    canvasWidth = () => this.gl.canvas.clientWidth;
    canvasHeight = () => this.gl.canvas.clientHeight;

    // Draw
    drawArrays = (noOfIndices) => this.gl.drawArrays(this.gl.LINES, 0, noOfIndices);

    // Matrix
    uploadMatrix4fv = (location, matrix) => this.gl.uniformMatrix4fv(location, false, matrix);

    // Shaders
    createVertexShader = () => this.gl.createShader(this.gl.VERTEX_SHADER);
    createFragmentShader = () => this.gl.createShader(this.gl.FRAGMENT_SHADER);

    addShaderSource = (shader, source) => this.gl.shaderSource(shader, source);
    compileShader = (shader) => this.gl.compileShader(shader);
    createShaderProgram = () => this.gl.createProgram();
    attachShaderToProgram = (program, shader) => this.gl.attachShader(program, shader);
    linkProgram = (program) => this.gl.linkProgram(program);
    useProgram = (program) => this.gl.useProgram(program);

    getAttribLocation = (program, attribute) => this.gl.getAttribLocation(program, attribute);
    getUniformLocation = (program, uniform) => this.gl.getUniformLocation(program, uniform);
    pointToAttribute = (data) => this.gl.vertexAttribPointer(data, 3, this.gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
    enableVertexAttribArray = (attribute) => this.gl.enableVertexAttribArray(attribute);
}

const glContext = new WebGL();

export default glContext;