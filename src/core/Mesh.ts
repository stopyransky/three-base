

import { Matrix4 } from "../math/Matrix4";

export interface Material {
  key: string;
  vertexShader: string;
  fragmentShader: string;
  wireframe: boolean;
  visible: boolean;
}

export interface Geometry extends Record<string, any> {
  attributeNames: string[];
  count: number;
  mode: string;
  index?: number[];
}

export default class Mesh {

  geometry: Geometry;
  material: Material;
  matrix: Matrix4;
  position: {x: number, y: number, z: number};
  rotation: {x: number, y: number, z: number};
  scaling: {x: number, y: number, z: number};
  needsUpdate: boolean;
  visible: boolean;

  indexed: number;
  constructor(geometry: Geometry, material: Material) {
    this.matrix = new Matrix4();
    this.geometry = geometry;
    this.material = material;
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scaling = { x: 1, y: 1, z: 1 };
    this.needsUpdate = false;
    this.visible = true;
    this.indexed = +(!!geometry.index);
  }
  
  // updateLocalTransforms = () => {
  //   if(this.needsUpdate) {
  //     const { matrix, rotation, scaling, position } = this;
  //     mat4.identity(matrix);
  
  //     mat4.scale(matrix, matrix, [scaling.x, scaling.y, scaling.z])
  //     mat4.translate(matrix, matrix, [position.x, position.y, position.z])
  //     mat4.rotateX(matrix, matrix, rotation.x)
  //     mat4.rotateY(matrix, matrix, rotation.y)
  //     mat4.rotateZ(matrix, matrix, rotation.z)

  //     this.needsUpdate = false;
  //   }

  // }

  translate (axis: 'x' | 'y' | 'z', value: number) {
    this.position[axis] = value;
    this.needsUpdate = true;

  }


  rotate(axis, rads) {
    this.rotation[axis] = rads;
    this.needsUpdate = true;
  }
  rotateX(rads) {
    this.rotate('x', rads);
  }
  rotateY(rads) {
    this.rotate('y', rads);
  }
  rotateZ(rads) {
    this.rotate('z', rads);
  }
  scale = (axis, value) => {
    this.scaling[axis] = value;
    this.needsUpdate = true;

  }

  scaleXYZ = (value) => {
    this.scaling = { x: value, y: value, z: value };
    this.needsUpdate = true;
  }

}





