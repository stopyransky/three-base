
import { mat4 } from 'gl-matrix';
import Program from '../Program';
import utils from '../utils';

export default class Axes {
  static makeGeometry(length) {
 
    const vertices = [
      0, 0, 0,
      length, 0, 0,
      0, 0, 0, 
      0, length, 0, 
      0, 0, 0,
      0, 0, length
    ];

    const colors = [
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
    ]

    return {
      vertices,
      colors,
      count: Math.floor(vertices.length / 3)
    };
  }

  static info = {

    vertexShader: `#version 300 es
      precision mediump float;
      
      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;

      in vec3 aPosition;
      in vec3 aColor;
      
      out vec3 vColor;

      void main() {
        vColor = aColor;
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
      }
    `,
    fragmentShader: `#version 300 es
      precision mediump float;
      
      in vec3 vColor;
      out vec4 fragColor;
      
      void main() {
        fragColor = vec4(vColor, 1.0);
      }
    `
  };

  alias:string ;
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

  constructor(gl, length = 1) {
    this.alias = "axes";
    this.program = new Program(gl, Axes.info.vertexShader, Axes.info.fragmentShader);
    this.vao = gl.createVertexArray();;
    this.buffers = {};
    this.modelMatrix = mat4.create();
    this.data = Axes.makeGeometry(length);
    this.needsUpdate = false;
    this.visible = true;
  }

  public build(gl: WebGL2RenderingContext): void {

    const { program, data, buffers, vao } = this;

    gl.bindVertexArray(vao);

    buffers['aPosition'] = utils.createBuffer(gl, program['aPosition'], data.vertices)
    buffers['aColor'] = utils.createBuffer(gl, program['aColor'], data.colors)
   
    gl.bindVertexArray(null);
    
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
  };
}
