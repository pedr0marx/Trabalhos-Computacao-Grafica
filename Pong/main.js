// Ana Beatriz Ribeiro Garcia, RA:168480 
// Arthur Romano da Luz , RA: 168498 
// Bruno de Abreu Correia, RA: 168522
// Enrique Reis Susin, RA: 168640 
// Leonardo Arazo de Oliveira, RA: 168873 
// Pedro Marx Amaral Abreu, RA: 169236 

function main() {
    const canvas = document.querySelector("#c");
    const gl = canvas.getContext('webgl');

    if (!gl) {
        throw new Error('WebGL not supported');
    }

    var vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
    var fragmentShaderSource = document.querySelector("#fragment-shader-2d").text;
  
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    var program = createProgram(gl, vertexShader, fragmentShader);

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();

    const positionLocation = gl.getAttribLocation(program, `position`);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const colorLocation = gl.getAttribLocation(program, `color`);
    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
    
    const matrixUniformLocation = gl.getUniformLocation(program, `matrix`);
    
    let matrix = m4.identity();
    matrix = m4.scale(matrix,0.50,0.50,1.0);
    gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let positionVector = [
        -0.5,-0.5,
        -0.5, 0.5,
         0.5,-0.5,
        -0.5, 0.5,
         0.5,-0.5,
         0.5, 0.5,
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionVector), gl.STATIC_DRAW);

    let theta = 0.0;
    let tx = 0.0;
    let ty = 0.0;
    let tx_step = 0.01;
    let ty_step = 0.005;
    let raqEsq = 0.0;
    let raqDir = 0.0;
    let pontuacaoJogador1 = 0;
    let pontuacaoJogador2 = 0;
    let ganhador = 0;

    let n = 5000;

    const bodyElement = document.querySelector("body");
    bodyElement.addEventListener("keydown", keyDown, false);
    document.addEventListener('keydown', keyDown);

    function keyDown(event) {

      if(event.key == 'ArrowUp') {
        if (raqDir + 0.14 <= 1) {
          raqDir = raqDir+0.05
        }
      }
      if(event.key.toLowerCase() === 'w') {
        if (raqEsq + 0.14 <= 1) {
          raqEsq = raqEsq+0.05
        }
      }
      if(event.key.toLowerCase() === 's') {
        if (raqEsq - 0.14 >= -1) {
          raqEsq = raqEsq-0.05
        }
      }
      if(event.key == 'ArrowDown') {
        if (raqDir - 0.14 >= -1) {
          raqDir = raqDir-0.05
        }
      }
  }
    function drawCircle(){
        gl.clear(gl.COLOR_BUFFER_BIT);
    
        theta += 2.0;
        if(tx >= 1){  
          if((ty <= raqDir+0.15 && ty >= raqDir-0.15)) { 
            tx_step = -tx_step; 
            tx_step -= 0.005; // toda vez que acertar a bolinha, a velocidade dela irá aumentar
            ty_step -= 0.001;
          } else {
            pontuacaoJogador1 += 1;
            updateScore();
            tx = 0; // reseta as coordenadas da bolinha para o centro denovo
            ty = 0;
            tx_step = 0.01; // reseta a velocidade da bolinha
            ty_step = 0.005;
            raqEsq = 0;
            raqDir = 0;
          }
        }
        if(tx <= -1){  
          if(ty <= raqEsq+0.15 && ty >= raqEsq-0.15) {
            tx_step = -tx_step;
            tx_step += 0.005;
            ty_step += 0.001;
          } else {
            pontuacaoJogador2 += 1;
            updateScore();
            tx = 0;
            ty = 0;
            tx_step = 0.01;
            ty_step = 0.005;
            raqDir = 0;
            raqEsq = 0;
          }
        }
        tx += tx_step;
        if(ty > 1 || ty < -1)
          ty_step = -ty_step;
        ty += ty_step;

        if (pontuacaoJogador1 == 7) {
          pontuacaoJogador1 = 0;
          pontuacaoJogador2 = 0;
          alert('Jogador 1 venceu!!');
        }

        if (pontuacaoJogador2 == 7) {
          pontuacaoJogador1 = 0;
          pontuacaoJogador2 = 0;
          alert('Jogador 2 venceu!!');
        }

        matrix = m4.identity();
        matrix = m4.translate(matrix,tx,ty,0.0);
        matrix = m4.zRotate(matrix, degToRad(theta));
        matrix = m4.scale(matrix,1,1,1.0);
        gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        setCircleVertices(gl, n, 0.03, 0.0, 0.0);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        setCircleColor(gl, n, [0.2, 0, 0]);
        gl.drawArrays(gl.TRIANGLES, 0, 3 * n);

        drawRectangle(gl, positionBuffer, colorBuffer, matrixUniformLocation, -1, raqEsq, 0.05, 0.3, [0, 0, 1]);
        drawRectangle(gl, positionBuffer, colorBuffer, matrixUniformLocation, 1, raqDir, 0.05, 0.3, [0, 0, 1]);

    
        requestAnimationFrame(drawCircle);
      }
    
    drawCircle();

    function updateScore() {
      const pontuacaoJogador1Element = document.querySelector('.player1');
      const pontuacaoJogador2Element = document.querySelector('.player2');

      pontuacaoJogador1Element.textContent = `Jogador 1: ${pontuacaoJogador1}`;
      pontuacaoJogador2Element.textContent = `Jogador 2: ${pontuacaoJogador2}`;
  }
}

function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function setCircleVertices(gl, n, radius, x, y) {
    let vertexData = [];
    for (let i = 0; i < n; i++) {
        vertexData.push(x, y);
        vertexData.push(
            x + radius * Math.cos(i * (2 * Math.PI) / n),
            y + radius * Math.sin(i * (2 * Math.PI) / n)
        );
        vertexData.push(
            x + radius * Math.cos((i + 1) * (2 * Math.PI) / n),
            y + radius * Math.sin((i + 1) * (2 * Math.PI) / n)
        );
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
}
function setCircleColor(gl, n, color) {
    let colorData = [];
    for (let triangle = 0; triangle < n; triangle++) {
        for (let vertex = 0; vertex < 3; vertex++)
            colorData.push(...color);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
}

var m4 = {
    identity: function() {
      return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];
    },

    multiply: function(a, b) {
      var a00 = a[0 * 4 + 0];
      var a01 = a[0 * 4 + 1];
      var a02 = a[0 * 4 + 2];
      var a03 = a[0 * 4 + 3];
      var a10 = a[1 * 4 + 0];
      var a11 = a[1 * 4 + 1];
      var a12 = a[1 * 4 + 2];
      var a13 = a[1 * 4 + 3];
      var a20 = a[2 * 4 + 0];
      var a21 = a[2 * 4 + 1];
      var a22 = a[2 * 4 + 2];
      var a23 = a[2 * 4 + 3];
      var a30 = a[3 * 4 + 0];
      var a31 = a[3 * 4 + 1];
      var a32 = a[3 * 4 + 2];
      var a33 = a[3 * 4 + 3];
      var b00 = b[0 * 4 + 0];
      var b01 = b[0 * 4 + 1];
      var b02 = b[0 * 4 + 2];
      var b03 = b[0 * 4 + 3];
      var b10 = b[1 * 4 + 0];
      var b11 = b[1 * 4 + 1];
      var b12 = b[1 * 4 + 2];
      var b13 = b[1 * 4 + 3];
      var b20 = b[2 * 4 + 0];
      var b21 = b[2 * 4 + 1];
      var b22 = b[2 * 4 + 2];
      var b23 = b[2 * 4 + 3];
      var b30 = b[3 * 4 + 0];
      var b31 = b[3 * 4 + 1];
      var b32 = b[3 * 4 + 2];
      var b33 = b[3 * 4 + 3];
      return [
        b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
        b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
        b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
        b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
        b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
        b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
        b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
        b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
        b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
        b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
        b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
        b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
        b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
        b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
        b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
        b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
      ];
    },

    translation: function(tx, ty, tz) {
      return [
          1,  0,  0,  0,
          0,  1,  0,  0,
          0,  0,  1,  0,
          tx, ty, tz, 1,
      ];
    },

    xRotation: function(angleInRadians) {
      var c = Math.cos(angleInRadians);
      var s = Math.sin(angleInRadians);

      return [
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1,
      ];
    },

    yRotation: function(angleInRadians) {
      var c = Math.cos(angleInRadians);
      var s = Math.sin(angleInRadians);

      return [
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1,
      ];
    },

    zRotation: function(angleInRadians) {
      var c = Math.cos(angleInRadians);
      var s = Math.sin(angleInRadians);

      return [
          c, s, 0, 0,
        -s, c, 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1,
      ];
    },

    scaling: function(sx, sy, sz) {
      return [
        sx, 0,  0,  0,
        0, sy,  0,  0,
        0,  0, sz,  0,
        0,  0,  0,  1,
      ];
    },

    translate: function(m, tx, ty, tz) {
      return m4.multiply(m, m4.translation(tx, ty, tz));
    },

    xRotate: function(m, angleInRadians) {
      return m4.multiply(m, m4.xRotation(angleInRadians));
    },

    yRotate: function(m, angleInRadians) {
      return m4.multiply(m, m4.yRotation(angleInRadians));
    },

    zRotate: function(m, angleInRadians) {
      return m4.multiply(m, m4.zRotation(angleInRadians));
    },

    scale: function(m, sx, sy, sz) {
      return m4.multiply(m, m4.scaling(sx, sy, sz));
    },

};

function setRectangleVertices(gl, width, height) {
  const x1 = -width / 2;
  const x2 = width / 2;
  const y1 = -height / 2;
  const y2 = height / 2;
  const vertices = [
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

function drawRectangle(gl, positionBuffer, colorBuffer, matrixUniformLocation, x, y, width, height, color) {
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setRectangleVertices(gl, width, height);
  
  let matrix = m4.identity();
  matrix = m4.translate(matrix, x, y, 0.0);
  gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  const colorData = [];
  for (let i = 0; i < 6; i++) {
      colorData.push(...color);
  }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function radToDeg(r) {
  return r * 180 / Math.PI;
}

function degToRad(d) {
  return d * Math.PI / 180;
}

main();
