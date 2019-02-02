draw = () => {
    const canvas = document.getElementById('webgl1');
    const context = canvas.getContext('webgl');

    if (context === null) {
        console.log('Unable to init WebGL.');
        return;
    }

    // Set clear color to black, fully opaque
    context.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the context (color buffer) to that color (redrawing the canvas with background color)
    context.clear(context.COLOR_BUFFER_BIT);

    // Now we need to define the shaders that will create the color for the simple scene
    // as well as draw the object. This will establish how the square plane appears on the screen.
    // A shader program is a set of vertex and fragment shaders.
    // We write shader functions in GLSL and pass the text of the code into WebGL
    // to be compiled for execution on the GPU.

    // Each time a shape is rendered, the vertex shader is run for each vertex in the shape.
    // Its job is to transform the input vertex from its original coordinate system
    // into the clipspace coordinate system used by WebGL, in which each axis has a range from - 1.0 to 1.0,
    // regardless of aspect ratio, actual size or any other factors.

    // A vertex receives vertex position values from an attribute called aVertexPosition
    // The position is then multiplied by two 4x4 matrices called uProjectionMatrix and uModelViewMatrix
    // Finally, gl_Position is set to the result.

    // The fragment shader is called once for every pixel on each shape to be drawn,
    // after the shape's vertices have been processed by the vertex shader.
    // Its job is to determine the color of that pixel by figuring out which texel (the pixel from within the shape's texture)
    // to apply to the pixel, getting that texel's color, then applying the appropriate lighting to the color.
    // The color is then returned to the WebGL layer by storing it in gl_FragColor variable.
    // That color is then drawn to the screen in the correct position for the shape's corresponding pixel.
}

document.addEventListener('DOMContentLoaded', draw());