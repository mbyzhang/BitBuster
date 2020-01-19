function rotateX(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv1 = m[1], mv5 = m[5], mv9 = m[9];

    m[1] = m[1] * c - m[2] * s;
    m[5] = m[5] * c - m[6] * s;
    m[9] = m[9] * c - m[10] * s;

    m[2] = m[2] * c + mv1 * s;
    m[6] = m[6] * c + mv5 * s;
    m[10] = m[10] * c + mv9 * s;
}

function rotateY(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = m[0], mv4 = m[4], mv8 = m[8];

    m[0] = c * m[0] + s * m[2];
    m[4] = c * m[4] + s * m[6];
    m[8] = c * m[8] + s * m[10];

    m[2] = c * m[2] - s * mv0;
    m[6] = c * m[6] - s * mv4;
    m[10] = c * m[10] - s * mv8;
}

function rotateZ(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = m[0], mv4 = m[4], mv8 = m[8];

    m[0] = c * m[0] + s * m[2];
    m[4] = c * m[4] + s * m[6];
    m[8] = c * m[8] + s * m[10];

    m[2] = c * m[2] - s * mv0;
    m[6] = c * m[6] - s * mv4;
    m[10] = c * m[10] - s * mv8;
}

function get_projection(angle, a, zMin, zMax) {
    var ang = Math.tan((angle * .5) * Math.PI / 180);//angle*.5
    return [
        0.5 / ang, 0, 0, 0,
        0, 0.5 * a / ang, 0, 0,
        0, 0, -(zMax + zMin) / (zMax - zMin), -1,
        0, 0, (-2 * zMax * zMin) / (zMax - zMin), 0
    ];
}

function initBuffers(gl, numbers, boxes, size, psize) {

    // Create a buffer for the cube's vertex positions
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Now create an array of positions for the cube
    zz = 1.0;

    NBox = numbers.length;
    var positions = [];//new Array(12*numbers.length);
    for (i = 0; i < NBox; i++) {
        k = i * 12;
        x = numbers[i][1];
        y = numbers[i][2];
        positions[k] = x;
        positions[k + 1] = y - size;
        positions[k + 2] = zz
        positions[k + 3] = x + size;
        positions[k + 4] = y - size;
        positions[k + 5] = zz
        positions[k + 6] = x + size;
        positions[k + 7] = y;
        positions[k + 8] = zz
        positions[k + 9] = x;
        positions[k + 10] = y;
        positions[k + 11] = zz
    }

    x = boxes[0][0];
    y = boxes[0][1];
    positions[NBox * 12] = x;
    positions[NBox * 12 + 1] = y - psize;
    positions[NBox * 12 + 2] = zz
    positions[NBox * 12 + 3] = x + psize;
    positions[NBox * 12 + 4] = y - psize;
    positions[NBox * 12 + 5] = zz
    positions[NBox * 12 + 6] = x + psize;
    positions[NBox * 12 + 7] = y;
    positions[NBox * 12 + 8] = zz
    positions[NBox * 12 + 9] = x;
    positions[NBox * 12 + 10] = y;
    positions[NBox * 12 + 11] = zz
    x = boxes[1][0];
    y = boxes[1][1];
    positions[NBox * 12 + 12] = x;
    positions[NBox * 12 + 13] = y - psize;
    positions[NBox * 12 + 14] = zz
    positions[NBox * 12 + 15] = x + psize;
    positions[NBox * 12 + 16] = y - psize;
    positions[NBox * 12 + 17] = zz
    positions[NBox * 12 + 18] = x + psize;
    positions[NBox * 12 + 19] = y;
    positions[NBox * 12 + 20] = zz
    positions[NBox * 12 + 21] = x;
    positions[NBox * 12 + 22] = y;
    positions[NBox * 12 + 23] = zz

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Now set up the texture coordinates for the faces.
    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

    var texturec = [];//new Array(8*numbers.length);
    for (i = 0; i < NBox + 2; i++) {
        k = i * 8;
        texturec[k] = 0.0;
        texturec[k + 1] = 0.0;
        texturec[k + 2] = 1.0;
        texturec[k + 3] = 0.0;
        texturec[k + 4] = 1.0;
        texturec[k + 5] = 1.0;
        texturec[k + 6] = 0.0;
        texturec[k + 7] = 1.0;
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturec),
        gl.STATIC_DRAW);


    // texind
    const texindBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texindBuffer);

    var texindices = [];//new Array(4*numbers.length);
    for (i = 0; i < NBox; i++) {
        k = i * 4;
        texindices[k] = numbers[i][0];
        texindices[k + 1] = numbers[i][0];
        texindices[k + 2] = numbers[i][0];
        texindices[k + 3] = numbers[i][0];
    }

    k = NBox * 4;
    texindices[k] = 8.0;
    texindices[k + 1] = 8.0;
    texindices[k + 2] = 8.0;
    texindices[k + 3] = 8.0;
    k = (NBox + 1) * 4;
    texindices[k] = 9.0;
    texindices[k + 1] = 9.0;
    texindices[k + 2] = 9.0;
    texindices[k + 3] = 9.0;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texindices), gl.STATIC_DRAW);

    // Build the element array buffer; this specifies the indices
    // into the vertex arrays for each face's vertices.

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    var indices = [];
    for (i = 0; i < NBox + 2; i++) {
        k = i * 6;
        g = 4 * i;
        indices[k] = g;
        indices[k + 1] = g + 1;
        indices[k + 2] = g + 2;
        indices[k + 3] = g;
        indices[k + 4] = g + 2;
        indices[k + 5] = g + 3;
    }

    // Now send the element array to GL
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        textureCoord: textureCoordBuffer,
        textureIndex: texindBuffer,
        indices: indexBuffer,
    };
}


function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);

    const image = new Image();
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
            srcFormat, srcType, image);

        // WebGL1 has different requirements for power of 2 images
        // vs non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn of mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;

    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);


    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

function drawScene(gl, programInfo, buffers, tex, numbers) {

    gl.clearColor(0.9, 0.9, 0.9, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /* MATRIX */
    var proj_matrix = get_projection(40, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 100.0);
    var mo_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    var view_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    view_matrix[14] = view_matrix[14] - 6;

    /*mo_matrix[0] = 1, mo_matrix[1] = 0, mo_matrix[2] = 0,
    mo_matrix[3] = 0,
    mo_matrix[4] = 0, mo_matrix[5] = 1, mo_matrix[6] = 0,
     mo_matrix[7] = 0,
 
       mo_matrix[8] = 0, mo_matrix[9] = 0, mo_matrix[10] = 1,
       mo_matrix[11] = 0,
 
       mo_matrix[12] = 0, mo_matrix[13] = 0, mo_matrix[14] = 0,
       mo_matrix[15] = 1;
 
       rotateY(mo_matrix, cubeRotation);
       rotateX(mo_matrix, cubeRotation);*/
    rotateX(mo_matrix, Math.PI);

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the texture coordinates from
    // the texture coordinate buffer into the textureCoord attribute.
    {
        const numComponents = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
        gl.vertexAttribPointer(
            programInfo.attribLocations.textureCoord,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.textureCoord);
    }

    // texindex buffers
    //console.log(buffers.texIndex.length)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureIndex);
    gl.vertexAttribPointer(
        programInfo.attribLocations.textureIndex,
        1,
        gl.FLOAT,
        false,
        0,
        0);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.textureIndex);

    // Tell WebGL which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);


    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);

    // Set the shader uniforms
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix, false, proj_matrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix, false, mo_matrix);

    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, tex[0]);
    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(programInfo.uniformLocations.tex0, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, tex[1]);
    gl.uniform1i(programInfo.uniformLocations.tex1, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, tex[2]);
    gl.uniform1i(programInfo.uniformLocations.tex2, 2);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, tex[3]);
    gl.uniform1i(programInfo.uniformLocations.tex3, 3);
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, tex[4]);
    gl.uniform1i(programInfo.uniformLocations.tex4, 4);
    gl.activeTexture(gl.TEXTURE5);
    gl.bindTexture(gl.TEXTURE_2D, tex[5]);
    gl.uniform1i(programInfo.uniformLocations.tex5, 5);
    gl.activeTexture(gl.TEXTURE6);
    gl.bindTexture(gl.TEXTURE_2D, tex[6]);
    gl.uniform1i(programInfo.uniformLocations.tex6, 6);
    gl.activeTexture(gl.TEXTURE7);
    gl.bindTexture(gl.TEXTURE_2D, tex[7]);
    gl.uniform1i(programInfo.uniformLocations.tex7, 7);
    gl.activeTexture(gl.TEXTURE8);
    gl.bindTexture(gl.TEXTURE_2D, tex[8]);
    gl.uniform1i(programInfo.uniformLocations.tex8, 8);
    gl.activeTexture(gl.TEXTURE9);
    gl.bindTexture(gl.TEXTURE_2D, tex[9]);
    gl.uniform1i(programInfo.uniformLocations.tex9, 9);

    const offset = 0;
    gl.drawElements(gl.TRIANGLES, (numbers.length + 2) * 6, gl.UNSIGNED_SHORT, offset);

}

let canvas, gl, ctx, programInfo, buffers;

function initGl() {
    canvas = document.getElementById('glcanvas');
    tcanvas = document.getElementById('text');
    gl = canvas.getContext('webgl');
    ctx = tcanvas.getContext('2d');
    ctx.font = "12px Arial";
    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return null;
    }

    const vertCode = `
      attribute vec4 aVertexPosition;
      attribute vec2 aTextureCoord;
      attribute float atexIndex;
      
      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      varying highp vec2 vTextureCoord;
      varying lowp float vTexIndex;

      void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vTextureCoord = aTextureCoord;
        vTexIndex = atexIndex;
      }`;

    const fragCode = `
      varying highp vec2 vTextureCoord;
      varying lowp float vTexIndex;

      uniform sampler2D tex0;
      uniform sampler2D tex1;
      uniform sampler2D tex2;
      uniform sampler2D tex3;
      uniform sampler2D tex4;
      uniform sampler2D tex5;
      uniform sampler2D tex6;
      uniform sampler2D tex7;
      uniform sampler2D tex8;
      uniform sampler2D tex9;

      void main(void) {
        if (vTexIndex == 0.0) {
          gl_FragColor = texture2D(tex0, vTextureCoord);
        } else if (vTexIndex == 1.0) {
            gl_FragColor = texture2D(tex1, vTextureCoord);
        }
        else if (vTexIndex == 2.0) {
            gl_FragColor = texture2D(tex2, vTextureCoord);
        }
        else if (vTexIndex == 3.0) {
            gl_FragColor = texture2D(tex3, vTextureCoord);
        }
        else if (vTexIndex == 4.0) {
            gl_FragColor = texture2D(tex4, vTextureCoord);
        }
        else if (vTexIndex == 5.0) {
            gl_FragColor = texture2D(tex5, vTextureCoord);
        }
        else if (vTexIndex == 6.0) {
            gl_FragColor = texture2D(tex6, vTextureCoord);
        }
        else if (vTexIndex == 7.0) {
            gl_FragColor = texture2D(tex7, vTextureCoord);
        }
        else if (vTexIndex == 8.0) {
            gl_FragColor = texture2D(tex8, vTextureCoord);
        }
        else if (vTexIndex == 9.0) {
            gl_FragColor = texture2D(tex9, vTextureCoord);
        }
      }`;

    const shaderProgram = initShaderProgram(gl, vertCode, fragCode);

    programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
            textureIndex: gl.getAttribLocation(shaderProgram, 'atexIndex'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            tex0: gl.getUniformLocation(shaderProgram, 'tex0'),
            tex1: gl.getUniformLocation(shaderProgram, 'tex1'),
            tex2: gl.getUniformLocation(shaderProgram, 'tex2'),
            tex3: gl.getUniformLocation(shaderProgram, 'tex3'),
            tex4: gl.getUniformLocation(shaderProgram, 'tex4'),
            tex5: gl.getUniformLocation(shaderProgram, 'tex5'),
            tex6: gl.getUniformLocation(shaderProgram, 'tex6'),
            tex7: gl.getUniformLocation(shaderProgram, 'tex7'),
            tex8: gl.getUniformLocation(shaderProgram, 'tex8'),
            tex9: gl.getUniformLocation(shaderProgram, 'tex9'),
        },
    };

    tex = [];
    tex[0] = loadTexture(gl, 'icons/numbers/zero_2.png');
    tex[1] = loadTexture(gl, 'icons/numbers/one_2.png');
    tex[2] = loadTexture(gl, 'icons/slow.png');
    tex[3] = loadTexture(gl, 'icons/thunder.png');
    tex[4] = loadTexture(gl, 'icons/snow.png');
    tex[5] = loadTexture(gl, 'icons/bomb.png');
    tex[6] = loadTexture(gl, 'icons/strong.png');
    tex[7] = loadTexture(gl, 'icons/pill.png');
    tex[8] = loadTexture(gl, 'icons/avast_logo2.png');
    tex[9] = loadTexture(gl, 'icons/chrome_logo.png');

    //console.log()
}

function render(numbers, boxes, hp, score, gameOver, size, psize) {

    buffers = initBuffers(gl, numbers, boxes, size, psize); // Vertices etc.
    drawScene(gl, programInfo, buffers, tex, numbers);

    const hpPos = [20, 20];
    const scorePos = [430, 20];
    const gameOverPos = [250, 250];

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillText(`HP: ${hp}`, hpPos[0], hpPos[1]);
    ctx.fillText(`Score: ${score}`, scorePos[0], scorePos[1]);
    if (gameOver) ctx.fillText("Game Over!\nClick to Restart", gameOverPos[0], gameOverPos[1]);

    ctx.beginPath();
    ctx.moveTo(0, 499);
    ctx.lineTo(500, 499);
    ctx.strokeStyle = "red";
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(1, 500);
    ctx.lineTo(1, 1);
    ctx.lineTo(499,1);
    ctx.lineTo(499,500);
    ctx.strokeStyle = "blue";
    ctx.stroke();
}