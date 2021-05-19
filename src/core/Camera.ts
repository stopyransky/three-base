import { mat4, vec3 } from "gl-matrix";
/**
 * crane camera
 * https://en.wikipedia.org/wiki/Crane_shot
 */

 const TWO_PI = Math.PI * 2;

export default class Camera {
  home: vec3
  position: { x: number, y: number, z: number };
  fov: number;
  aspect: number;
  near: number;
  far: number;
  cameraMatrix: mat4
  projectionMatrix: mat4;
  azimuth: number;
  elevation: number;
  steps: number;
  // zoom: number;
  constructor( fov = 30, aspect = 1.0, near = 0.01, far = 1000) {
    this.home = vec3.fromValues(0, 0, 5);
    this.position = { x: 0, y: 0, z: 5 };
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
    this.cameraMatrix = mat4.create();
    this.projectionMatrix = mat4.create();
    this.azimuth = 0;
    this.elevation = 0;
    this.steps = 0;
    // mat4.translate(this.cameraMatrix, this.cameraMatrix, this.home);

  }

  get viewMatrix() {
    const viewMatrix = mat4.create();
    mat4.invert(viewMatrix, this.cameraMatrix)
    return viewMatrix;
  }

  setAzimuth = (val) => {
    this.azimuth = val;
  }

  changeAzimuth = (azimuth: number): void => {
    this.azimuth += azimuth;

    if (this.azimuth > TWO_PI || this.azimuth < -TWO_PI) {
      this.azimuth = this.azimuth % TWO_PI;
    }

    // this.update();
  };

  setPosition = (x, y, z) => {
    this.position = { x, y, z};
  }
  
  setElevation = (val) => {
    this.elevation = val;
  }

  changeElevation = (elevation: number): void => {
    this.elevation += elevation;

    if (this.elevation > TWO_PI || this.elevation < -TWO_PI) {
      this.elevation = this.elevation % TWO_PI;
    }

    // this.update();
  };

  setZoom = (zoom) => {
   this.position.z = zoom;
  }

  dolly = (stepIncrement: number): void => {
    // const normal = vec3.create();
    // const newPosition = vec3.create();
    // vec3.normalize(normal, this.normal);


    // const normal = vec4.create();
      // vec4.set(normal, 0, 0, 1, 0);
      // vec4.transformMat4(normal, normal, this.cameraMatrix);
      // // vec3.copy(this.normal, normal as vec3);
      // vec3.normalize(normal, this.normal);
    const step = stepIncrement - this.steps;

    const z = this.position.z - step;

    this.steps = stepIncrement;
    this.translate('z', z);
  };

  translate(axis, value) {
    this.position[axis] = value;
  }

  setAspect = (aspect) => {
    this.aspect = aspect;
  }

  updateLocalTransforms() {
    const { cameraMatrix, projectionMatrix, position, fov, aspect, near, far} = this;
    mat4.perspective(
      projectionMatrix,
      fov * (Math.PI / 180),
      aspect,
      near,
      far
    );
  
    mat4.identity(cameraMatrix);
    mat4.rotateY(cameraMatrix, cameraMatrix, this.azimuth);
    mat4.rotateX(cameraMatrix, cameraMatrix, this.elevation);
    mat4.translate(cameraMatrix, cameraMatrix, vec3.fromValues(position.x, position.y, position.z));
  
  }

  
}