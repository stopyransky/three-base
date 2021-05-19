import { Material } from "../Mesh";

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

function BasicMaterial(): Material {

  return {
    key: 'basic',
    vertexShader,
    fragmentShader,
    wireframe: false,
  }
}

export default BasicMaterial;