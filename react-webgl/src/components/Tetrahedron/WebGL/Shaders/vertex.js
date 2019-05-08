import Constants from './const';

export default `
    attribute vec3 ${Constants.POSITION};

    uniform mat4 ${Constants.MATRIX1};
    uniform mat4 ${Constants.MATRIX2};
    uniform mat4 ${Constants.MATRIX3};

    void main() {
        gl_Position = ${Constants.MATRIX1} * ${Constants.MATRIX2} * ${Constants.MATRIX3} * vec4(${Constants.POSITION}, 1.0);
    }
`;
