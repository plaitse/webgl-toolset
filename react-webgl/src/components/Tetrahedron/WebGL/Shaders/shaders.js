import Constants from './const';
import Fragment from './fragment';
import GL from '../webgl';
import Vertex from './vertex';

export default class Shaders {
    constructor() {
        const vertexShader = this.createVertexShader();
        const fragmentShader = this.createFragmentShader();
        const shaderProgram = this.createShaderProgram(vertexShader, fragmentShader);
        const programInfo = this.createProgramInfo(shaderProgram);

        this.programInfo = programInfo
    }

    createFragmentShader = () => {
        const fragmentShader = GL.createFragmentShader();
        GL.addShaderSource(fragmentShader, Fragment);
        GL.compileShader(fragmentShader);
        return fragmentShader;
    }

    createProgramInfo = (shaderProgram) => {
        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: GL.getAttribLocation(shaderProgram, Constants.POSITION)
            },
            uniformLocations: {
                projectionMatrix: GL.getUniformLocation(shaderProgram, Constants.MATRIX1),
                modelViewMatrix: GL.getUniformLocation(shaderProgram, Constants.MATRIX2),
                mWorldUniformLocation: GL.getUniformLocation(shaderProgram, Constants.MATRIX3)
            },
        };
        return programInfo;
    }

    createShaderProgram = (vertexShader, fragmentShader) => {
        const shaderProgram = GL.createShaderProgram();
        GL.attachShaderToProgram(shaderProgram, vertexShader);
        GL.attachShaderToProgram(shaderProgram, fragmentShader);
        GL.linkProgram(shaderProgram);
        return shaderProgram;
    }

    createVertexShader = () => {
        const vertexShader = GL.createVertexShader();
        GL.addShaderSource(vertexShader, Vertex);
        GL.compileShader(vertexShader);
        return vertexShader;
    }

    getShaderProgram = () => this.programInfo;
}
