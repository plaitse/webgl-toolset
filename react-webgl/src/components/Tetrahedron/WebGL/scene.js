import GL from './webgl';
import { mat4 } from 'gl-matrix';

export const drawScene = (programInfo, positions, tetraRotation) => {
    const fieldOfView = Math.PI / 4,
          aspect = GL.canvasWidth() / GL.canvasHeight(),
          zNear = 0.1,
          zFar = 100;

    const projectionMatrix = mat4.create(),
          modelViewMatrix = mat4.create(),
          identityMatrix = mat4.create(),
          viewMatrix = mat4.create();

    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
    mat4.lookAt(viewMatrix, [2, 2, -1], [0, 0, 0], [0, 1, 0]);
    mat4.rotate(modelViewMatrix, identityMatrix, tetraRotation, [-1, -1, -1]);

    GL.pointToAttribute(programInfo.attribLocations.vertexPosition);
    GL.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    GL.useProgram(programInfo.program);

    GL.uploadMatrix4fv(programInfo.uniformLocations.mWorldUniformLocation, modelViewMatrix);
    GL.uploadMatrix4fv(programInfo.uniformLocations.modelViewMatrix, viewMatrix);
    GL.uploadMatrix4fv(programInfo.uniformLocations.projectionMatrix, projectionMatrix);

    GL.drawArrays(positions.length / 6);
}
