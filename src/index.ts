import "./styles.css";
import * as dat from 'dat.gui';

import {Clock} from './core/Clock';
import {Scene} from './core/Scene';
import {PerspectiveCamera} from "./core/PerspectiveCamera";
import {OrbitControls} from "./core/OrbitControls";

import Mesh from './core/Mesh';
// import Renderer from "./Renderer";

import makeTetraGeometry from './models/Tetrahedron';
import BasicMaterial from './materials/BasicMaterial';
import Stats from './helpers/Stats';
import { WebGLRenderer } from "./WebGLRenderer";




const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gui, stats, perfLib, clock, scene, camera, renderer, controls;
let tetrahedron1, tetrahedron2, tetrahedron3, floor, axes;



const guiParams = {
  clockSpeed: 25,
  getModelViewMatrix: function() {
    const value = renderer.getUniformValue(tetrahedron1, 'uModelViewMatrix');
    console.log(value);
  },
  animate: true,
  translateX: 0,
  translateY: 0,
  translateZ: 0, 
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  scale: 1,
  scaleX: 1, 
  scaleY: 1,
  scaleZ: 1,
  navigate: true,
  elevation: 0,
  azimuth: 0,
  cameraTime: 0,
  helpersVisible: true,
}


function toggleHelpers() {
  floor.visible = guiParams.helpersVisible;
  axes.visible = guiParams.helpersVisible;
}


function tick(time, dt) {
  // perfLib.nextFrame(window.performance.now());

  if(guiParams.navigate) {
    guiParams.cameraTime += dt;
    camera.setAzimuth(guiParams.cameraTime * 0.2);
  }
  
  if(guiParams.animate) {
    tetrahedron1.rotateX(time);
    tetrahedron2.rotateY(time);
    tetrahedron3.rotateZ(time);
  }
  renderer.render(scene, camera);
  stats.update(renderer.info);
  renderer.info.reset();

}

function init() {
  stats = Stats();
  renderer = new WebGLRenderer({ canvas });


  // perfLib = new GLPerf({
  //   chartLen:  30,
  //   chartHz:  10,
  //   gl: renderer.getContext(),
  //   chartLogger: (chart) => {
  //     // console.log(chart)
  //   },
  //   paramLogger: (logger) => {
  //     if (perfLib && renderer.info) {
  //       perfLib.factorGPU = 1 / renderer.info.render.calls;
  //     }

  //     stats.updateProfiler(logger);
  //     // console.log(logger);
  //   },
  // });

  clock = new Clock(guiParams.clockSpeed); // not working currently
  scene = new Scene();

  camera = new PerspectiveCamera(45, window.innerWidth/window.innerHeight);
  // camera.setPosition(0, 0, 12)
  // camera.setElevation(-Math.PI/12); // 30 deg
  controls = new OrbitControls(camera, canvas)
  
  const tetraGeometry = makeTetraGeometry(1.6);
  // const floorGeometry = makeFloorGeometry({dimension: 5.0 , lines: 10, alignment: 'Y', shift: 0 });
  const basicMaterial = BasicMaterial();

  tetrahedron1 = new Mesh(tetraGeometry, basicMaterial);
  tetrahedron2 = new Mesh(tetraGeometry, basicMaterial);
  tetrahedron2.translate("x", 3.0);
  tetrahedron3 = new Mesh(tetraGeometry, basicMaterial);
  tetrahedron3.translate("x", -3.0);
  // floor = new Mesh(floorGeometry, basicMaterial);
  // axes = new Axes(gl, 0.75);

  // scene.add(floor);
  // scene.add(axes);
  scene.add(tetrahedron1);
  scene.add(tetrahedron2);
  scene.add(tetrahedron3);

  window.addEventListener('keyup', (e) => {
    if(e.key === 'h') {
      guiParams.helpersVisible = !guiParams.helpersVisible;
      toggleHelpers();
    }
  })


  // perfLib.begin('profiler');
  // clock.on('tick', tick);
  // clock.

}

init();



function initGui() {

  gui = new dat.GUI();
  gui.add(guiParams, 'clockSpeed', 0, 60, 1).onChange((s) => {
    clock.setSpeed(s)
  });
  const objectGui = gui.addFolder('Tetrahedron')
  objectGui.add(guiParams, 'getModelViewMatrix')
  objectGui.add(tetrahedron1.material, 'wireframe')
  const objectTranslation = objectGui.addFolder('translation');
  const objectRotation = objectGui.addFolder('rotation');

  const objectScaling = objectGui.addFolder('scaling');
  const cameraGui = gui.addFolder('Camera');
  cameraGui.open();
  objectTranslation.add(guiParams, 'translateX', -5, 5, 1.0 )
  .onChange(() => {
    tetrahedron1.translate('x', guiParams.translateX);
  })
  objectTranslation.add(guiParams, 'translateY', -5, 5, 1.0 )
  .onChange(() => {
    tetrahedron1.translate('y', guiParams.translateY);
  })
  objectTranslation.add(guiParams, 'translateZ', -5, 5, 1.0 )
  .onChange(() => {
    tetrahedron1.translate('z', guiParams.translateZ);
  })

  objectRotation.add(guiParams, 'rotateX', 0, 360, 1 )
  .onChange(() => {
    tetrahedron1.rotateX(guiParams.rotateX * Math.PI/180);
  })
  objectRotation.add(guiParams, 'rotateY', 0, 360, 1 )
  .onChange(() => {
    tetrahedron1.rotateY(guiParams.rotateY* Math.PI/180);
  })
  objectRotation.add(guiParams, 'rotateZ', 0, 360, 1 )
  .onChange(() => {
    tetrahedron1.rotateZ(guiParams.rotateZ* Math.PI/180);
  })
  objectScaling.add(guiParams, 'scale', 0, 2, 0.1 )
  .onChange(() => {
    tetrahedron1.scaleXYZ(guiParams.scale);
  })
  objectScaling.add(guiParams, 'scaleX', 0, 2, 0.1 )
  .onChange(() => {
    tetrahedron1.scale('x', guiParams.scaleX);
  }).listen()
  objectScaling.add(guiParams, 'scaleY', 0, 2, 0.1 )
  .onChange(() => {
    tetrahedron1.scale('y', guiParams.scaleY);
  }).listen()
  objectScaling.add(guiParams, 'scaleZ', 0, 2, 0.1 )
  .onChange(() => {
    tetrahedron1.scale('z', guiParams.scaleZ);
  }).listen()

  cameraGui.add(guiParams, 'navigate').onChange(() => {
    // guiParams.cameraTime = 0;
  });
  cameraGui.add(camera.position, 'x', -5, 5, 1.0).listen();
  cameraGui.add(camera.position, 'y', -5, 5, 1.0).listen();
  cameraGui.add(camera.position, 'z', -5, 10, 1.0).listen();
  cameraGui.add(camera, 'fov', 5, 180, 5);
  cameraGui.add(camera, 'azimuth', 0, Math.PI * 2, Math.PI/180 )
  // .onChange(() => {
  //   camera.setAzimuth(guiParams.azimuth * Math.PI/180);
  // })
  .listen()
  cameraGui.add(camera, 'elevation', -Math.PI/2, Math.PI/2, Math.PI/180 ).listen()

}

// initGui();

