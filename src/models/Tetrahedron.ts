import { BufferAttribute } from '../core/BufferAttribute';
import { BufferGeometry } from '../core/BufferGeometry';
import { MeshBasicMaterial  } from '../core/MeshBasicMaterial';

const vertexShader = `#version 300 es
precision mediump float;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

in vec3 aPosition;
in vec3 aColor;

out vec4 vColor;

void main () {

  vColor = vec4(aColor, 1.0);
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);

}

`;

const fragmentShader = `#version 300 es
precision mediump float;

in vec4 vColor;
out vec4 fragColor;

void main () {
  fragColor = vec4(vColor);
}
`;

const parameters = {
  // defines: {},
  // uniforms: {},
//  fragmentShader,
//  vertexShader,
 wireframe: false,
 wireframeLinewidth: 1.0,
//  lights: false,
 morphTargets: false,
//  morphNormals: false,
}


export default {
  material: new MeshBasicMaterial(parameters),

  makeGeometry(side = Math.sqrt(3), rad = 0): BufferGeometry {

    const R = side / Math.sqrt(3);
    const tau = 2.0 * Math.PI;
    const deg120 = tau/3;
    const deg240 = 2 * deg120;
    
    const positions = [
      R * Math.cos(rad + deg120), 0.0, R * Math.sin(rad + deg120), // 0 red
      R * Math.cos(rad + deg240), 0.0, R * Math.sin(rad + deg240), // 1 yellow
      R * Math.cos(rad), 0, R * Math.sin(rad), // 2 green
      0.0, R , 0.0, // 3 blue
    ];

    const colors = [
      1.0, 0.0, 0.0,  // 0
      1.0, 1.0, 0.0,  // 1
      0.0, 1.0, 0.0,  // 2
      0.0, 0.0, 1.0,  // 3
    ];



    const indices = [
      2, 3, 1,
      0, 2, 1,
      0, 3, 2,
      3, 0, 1
    ];


    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute( new Float32Array(positions), 3))
    geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3))
    geometry.setIndex(indices);

    return geometry;
  }
}

