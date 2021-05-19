import { mat4 } from "gl-matrix";
import Program from "../Program";
import utils from "../utils";

// Visualize a floor on the screen
export default class Floor  {
  static makeGeometry({ dimension, alignment, lines, shift }) {
    const inc = (2 * dimension) / lines;
    const vertices = [];
    const indices = [];

    const getAlignedArray = (l: number) => {
      const a = dimension;
      const b = -a + l * inc;
      const c = shift;
      switch (alignment.toUpperCase()) {
        case "X": {
          return [c, -a, b, c, a, b, c, b, -a, c, b, a];
        }
        case "Y": {
          return [-a, c, b, a, c, b, b, c, -a, b, c, a];
        }
        default: {
          return [-a, b, c, a, b, c, b, -a, c, b, a, c];
        }
      }
    };

    for (let l = 0; l <= lines; l++) {
      const arr = getAlignedArray(l);
      vertices[6 * l + 0] = arr[0];
      vertices[6 * l + 1] = arr[1];
      vertices[6 * l + 2] = arr[2];

      vertices[6 * l + 3] = arr[3];
      vertices[6 * l + 4] = arr[4];
      vertices[6 * l + 5] = arr[5];

      vertices[6 * (lines + 1) + 6 * l + 0] = arr[6];
      vertices[6 * (lines + 1) + 6 * l + 1] = arr[7];
      vertices[6 * (lines + 1) + 6 * l + 2] = arr[8];

      vertices[6 * (lines + 1) + 6 * l + 3] = arr[9];
      vertices[6 * (lines + 1) + 6 * l + 4] = arr[10];
      vertices[6 * (lines + 1) + 6 * l + 5] = arr[11];

      indices[2 * l + 0] = 2 * l + 0;
      indices[2 * l + 1] = 2 * l + 1;
      indices[2 * (lines + 1) + 2 * l] = 2 * (lines + 1) + 2 * l + 0;
      indices[2 * (lines + 1) + 2 * l + 1] = 2 * (lines + 1) + 2 * l + 1;
    }


    return {
      index: indices,
      aPosition: vertices,
      count: Math.floor(vertices.length / 3)
    };
  }

  static info = {
    vertexShader: `#version 300 es
      precision mediump float;
      
      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;

      in vec3 aPosition;
      // out vec3 vPosition;
      void main() {
        gl_PointSize = 1.0;
        // vPosition = aPosition;
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
      }
    `,
    fragmentShader: `#version 300 es
      precision mediump float;
      // in vec3 vPosition;
      out vec4 fragColor;
      void main() {

        fragColor = vec4(0.2, 0.2, 0.3, 1.0);
      }
    `
  };

  alias: string;
  vao: WebGLVertexArrayObject;
  buffers: any;
  program: Program;
  data: any;
  modelMatrix: mat4;
  position: {x: number, y: number, z: number};
  rotation: {x: number, y: number, z: number};
  scaling: {x: number, y: number, z: number};
  needsUpdate: boolean;
  wireframe: boolean;
  visible: boolean;

  constructor(gl, props = {dimension: 5.0 , lines: 10, alignment: 'Y', shift: 0 }) {
  
    this.alias = "floor";
    this.program = new Program(gl, Floor.info.vertexShader, Floor.info.fragmentShader);
    this.vao = gl.createVertexArray();
    this.buffers = {};
    this.data = Floor.makeGeometry(props);
    this.modelMatrix = mat4.create();
    this.visible = true;
    this.needsUpdate = true;

  }

  public build = (gl: WebGL2RenderingContext): void => {
    const { program, data, vao, buffers } = this;

    gl.bindVertexArray(vao);

    buffers['aPosition'] = utils.createBuffer(gl, program['aPosition'], data['aPosition'])

    const indexBuffer = gl.createBuffer();
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data["index"]), gl.STATIC_DRAW);
    
    buffers['index'] = indexBuffer;
    // program.useProgram();

  }

  updateLocalTransforms = () => {

    this.needsUpdate = false
  }
  update = (modelViewMatrix, projectionMatrix) => {
    if(this.needsUpdate) this.updateLocalTransforms()

    // alternatively, multiply model * view here and send as one uniform
    // why it is good/bad to do it?
    const mat = mat4.clone(modelViewMatrix);

    mat4.multiply(mat, mat, this.modelMatrix);
    
    this.program.updateUniform("uModelViewMatrix", mat);
    this.program.updateUniform("uProjectionMatrix", projectionMatrix);
  }

  public render = (gl: WebGL2RenderingContext): void => {
    const { data, vao, buffers } = this;
  
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers['aPosition'])
    gl.drawArrays(gl.LINES, 0, data.count);
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    // gl.drawElements(gl.LINES, data.index.length, gl.UNSIGNED_BYTE, 0);
    gl.bindVertexArray(null);

  };
}
