import { drawScene } from './scene';
import GL from './webgl';
import Shaders from './Shaders/shaders';
import Tetrahedron from './tetrahedron';

export default (id) => {
    const canvas = document.querySelector(`#${id}`);
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    // Context
    GL.init(gl);

    // Shaders
    const shaders = new Shaders();
    const shaderProgram = shaders.getShaderProgram();

    // Buffers
    const positionBuffer = GL.createBuffer();
    GL.bindBuffer(positionBuffer);

    // Tetrahedron positions
    const tetra = new Tetrahedron(0, 0, 0, 1, Math.sqrt(6) / 3);
    const positions = tetra.getPositions();

    // Buffers
    GL.addBufferData(positions);

    // Loop
    const angle = Math.PI / 400;
    let tetraRotation = 0;
    const render = () => {
        drawScene(shaderProgram, positions, tetraRotation);
        tetraRotation += angle;
        requestAnimationFrame(render);
    }

    window.requestAnimationFrame(render);
}
