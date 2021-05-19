import Camera from "./Camera";


// Abstraction over common controls for user interaction with a 3D scene
export default class Controls {
  camera: Camera;
  canvas: HTMLCanvasElement;
  dragging: boolean;
  picking: boolean;
  ctrl: boolean;
  x: number;
  y: number;
  lastX: number;
  lastY: number;
  button: number;
  key: number;
  dloc: number;
  dstep: number;
  motionFactor: number;
  keyIncrement: number;
  alt: any;

  constructor(camera: Camera, canvas: HTMLCanvasElement) {
    this.camera = camera;
    this.canvas = canvas;

    this.dragging = false;
    this.picking = false;
    this.ctrl = false;

    this.x = 0;
    this.y = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.button = 0;
    this.key = 0;

    this.dloc = 0;
    this.dstep = 0;
    this.motionFactor = 10;
    this.keyIncrement = Math.PI/18; // 10 deg

    canvas.onmousedown = this.onMouseDown;
    canvas.onmouseup = this.onMouseUp;
    canvas.onmousemove = this.onMouseMove;
    window.onkeydown = this.onKeyDown;
    window.onkeyup = this.onKeyUp;
  }

  // Sets picker for picking objects
  // setPicker = (picker: Picker) => {
  //   this.picker = picker;
  // }

  // Returns 3D coordinates
  get2DCoords = (event: MouseEvent) => {
    let top = 0,
      left = 0,
      canvas = this.canvas;

    while (canvas && canvas.tagName !== "BODY") {
      top += canvas.offsetTop;
      left += canvas.offsetLeft;
      canvas = canvas.offsetParent as HTMLCanvasElement;
    }

    left += window.pageXOffset;
    top -= window.pageYOffset;

    return {
      x: event.clientX - left,
      y: this.canvas.height - (event.clientY - top)
    };
  }

  onMouseUp = (event: MouseEvent): void => {
    this.dragging = false;

    // if (!event.shiftKey && this.picker) {
    //   this.picking = false;
    //   this.picker.stop();
    // }
  }

  onMouseDown = (event: MouseEvent): void => {
    this.dragging = true;

    this.x = event.clientX;
    this.y = event.clientY;
    this.button = event.button;

    this.dstep =
      Math.max(
        this.camera.position.x,
        this.camera.position.y,
        this.camera.position.z
      ) / 50;

    // if (!this.picker) return;

    // const coordinates = this.get2DCoords(event);
    // this.picking = this.picker.find(coordinates);

    // if (!this.picking) this.picker.stop();
  }

  onMouseMove = (event: MouseEvent): void => {
    this.lastX = this.x;
    this.lastY = this.y;

    // this.calculateMouseCoordinates(event);
    // console.log(event.clientX, event.clientY, this.x, this.y)
    this.x = event.clientX;
    this.y = event.clientY;
    if (!this.dragging) return;

    this.ctrl = event.ctrlKey;
    this.alt = event.altKey;

    const dx = this.x - this.lastX;
    const dy = this.y - this.lastY;

    // if (this.picking && this.picker.moveCallback) {
    //   this.picker.moveCallback(dx, dy);
    //   return;
    // }

    if (!this.button) {
      if (this.alt) {
        this.dolly(dy);
      } else {
        this.rotate(dx, dy);
      }
    }
  }

  onKeyDown = (event: KeyboardEvent) => {
    this.key = event.keyCode;
    this.ctrl = event.ctrlKey;

    if (this.ctrl) return;

    switch (this.key) {
      case 37:
        return this.camera.changeAzimuth(-this.keyIncrement);
      case 38:
        return this.camera.changeElevation(this.keyIncrement);
      case 39:
        return this.camera.changeAzimuth(this.keyIncrement);
      case 40:
        return this.camera.changeElevation(-this.keyIncrement);
      default:
        return;
    }
  }

  onKeyUp = (event: KeyboardEvent): void => {
    if (event.keyCode === 17) {
      this.ctrl = false;
    }
  }

  dolly = (value: number): void  => {
    console.log(value)
    if (value > 0) {
      this.dloc -= this.dstep;
    } else if (value < 0) {
      this.dloc += this.dstep;
    }

    this.camera.dolly(this.dloc);
  }

  rotate = (dx: number, dy: number): void => {
    const { width, height } = this.canvas;

    const deltaAzimuth = -30 / width;
    const deltaElevation = -30 / height;

    const azimuth = dx * deltaAzimuth * this.motionFactor * Math.PI/180;
    const elevation = dy * deltaElevation * this.motionFactor* Math.PI/180;

    this.camera.changeAzimuth(azimuth);
    this.camera.changeElevation(elevation);
  }
}
