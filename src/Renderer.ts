import { mat4 } from 'gl-matrix';
import Scene from './core/Scene';
import Camera from './core/Camera';
import {ProgramCache} from './core/cache/ProgramCache';
import BindingStateCache from './core/cache/BindingStateCache';
import WebGLState from './core/WebGLState';
import {WebGLExtensions} from './core/WebGLExtensions';
import {WebGLCapabilities} from './core/WebGLCapabilities';
import WebGLInfo from './core/WebGLInfo';
import Mesh from './core/Mesh';



export default function Renderer(parameters) {

  const { canvas } = parameters;

  const gl = canvas.getContext('webgl2');
  
  
  const info = WebGLInfo(gl);
  const extensions = WebGLExtensions(gl)
  const capabilities = WebGLCapabilities(gl, extensions, parameters);
  const bindingStateCache = BindingStateCache(gl);
  const programCache = ProgramCache(gl, capabilities, bindingStateCache, info);
  const state = WebGLState(gl);
  
  this.info = info;

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.10, 0.12, 0.15, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  this.getContext = function() { return gl; }

  // temporary solution
  const shroedingerRender = [
    [
      (mode, count) => { 
        gl.drawArrays(mode, 0, count); 
        info.update( count, mode, 1 );
      },
      (mode, count) => { 
        gl.drawArrays(gl.LINE_LOOP, 0, count)
        info.update( count, gl.LINE_LOOP, 1 );
      }
    ],
    [
      (mode, count) => {
        gl.drawElements(mode, count, 0)
        info.update( count, mode, 1 );
      },
      (mode, count) => {
        gl.drawElements(gl.LINE_LOOP, count, 0)
        info.update( count, gl.LINE_LOOP, 1 );
      }
    ]
  ];
  
  function renderObject(object, bindingState) {
    const { indexed, material, geometry: { mode, count } } = object;
    const { vao, buffers } = bindingState;
    const wireframe = +material.wireframe;
    gl.bindVertexArray(vao);
    // console.log(indexed, wireframe, geometry);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);

    shroedingerRender[indexed][wireframe](gl[mode], count);

    // if(wireframe) {
    //   gl.drawElements(gl.LINE_LOOP, count, gl.UNSIGNED_SHORT, 0);

    // } else {
    //   gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);


    // }

    gl.bindVertexArray(null);
  }
  
  this.render = function(scene: Scene, camera: Camera) {
    // use state
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // gl.clear();

    camera.updateLocalTransforms();
   
    const viewMatrix = camera.viewMatrix;

    const projectionMatrix = camera.projectionMatrix;

    scene.traverse((object: Mesh) => {
      if(!object.visible) return;
      // console.log(object)
      object.updateLocalTransforms();

  
      const program = programCache.getProgram(object);
      
      program.useProgram();

      const modelViewMatrix = mat4.create();
      mat4.copy(modelViewMatrix, viewMatrix);

      mat4.multiply(modelViewMatrix, modelViewMatrix, object.matrix);
  
      program.updateUniform('uModelViewMatrix', modelViewMatrix);
      program.updateUniform('uProjectionMatrix', projectionMatrix);

      const bindingState = bindingStateCache.getState(object, program);

      renderObject(object, bindingState);

    });

    info.programs = programCache.count();
  }

  // it shows uniform value for ann instance of object that uses the program
  this.getUniformValue = function(object, name) {
    const prog = programCache.getProgram(object);
    return prog.getUniform(name).cache;
  }
}