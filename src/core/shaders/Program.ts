/* eslint-disable @typescript-eslint/no-use-before-define */

import { UniformsCache } from "../cache/UniformsCache";
import { ShaderGenerator } from "./ShaderGenerator";

let programIdCount = 0;

interface IProgram {
  name: string;
  id: any;
  cacheKey: any;
  usedTimes: number;
  program: WebGLProgram;
  vertexShader: any;
  fragmentShader: any;
  getAttributes: () => Record<string, number>;
  getUniforms: () => UniformsCache;
  destroy: () => void;
}

function addLineNumbers(string) {
  const lines = string.split("\n");

  for (let i = 0; i < lines.length; i++) {
    lines[i] = i + 1 + ": " + lines[i];
  }

  return lines.join("\n");
}

function WebGLShader(gl, type, string) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, string);
  gl.compileShader(shader);

  return shader;
}

export { WebGLShader };

function getShaderErrors(gl, shader, type) {
  const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  const log = gl.getShaderInfoLog(shader).trim();

  if (status && log === "") return "";

  // --enable-privileged-webgl-extension
  // console.log( '**' + type + '**', gl.getExtension( 'WEBGL_debug_shaders' ).getTranslatedShaderSource( shader ) );

  const source = gl.getShaderSource(shader);

  return (
    "THREE.WebGLShader: gl.getShaderInfoLog() " +
    type +
    "\n" +
    log +
    addLineNumbers(source)
  );
}

function fetchAttributeLocations(
  gl: WebGL2RenderingContext,
  program: WebGLProgram
) {
  const attributes = {};

  const n = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

  for (let i = 0; i < n; i++) {
    const info = gl.getActiveAttrib(program, i);
    const name = info.name;

    // console.log( 'THREE.WebGLProgram: ACTIVE VERTEX ATTRIBUTE:', name, i );

    attributes[name] = gl.getAttribLocation(program, name);
  }

  return attributes;
}

function Program(
  renderer,
  cacheKey,
  parameters,
  bindingStates,
  info
): IProgram {
  const gl = renderer.getContext();

  // let vertexShader = parameters.vertexShader;
  // let fragmentShader = parameters.vertexShader;

  const generatedShader = ShaderGenerator(renderer, parameters);
  const vertexShader = generatedShader.vertexShader;
  const fragmentShader = generatedShader.vertexShader;
  // }

  const glVertexShader = WebGLShader(gl, gl.VERTEX_SHADER, vertexShader);
  const glFragmentShader = WebGLShader(gl, gl.FRAGMENT_SHADER, fragmentShader);

  const program = gl.createProgram();

  gl.attachShader(program, glVertexShader);
  gl.attachShader(program, glFragmentShader);

  // Force a particular attribute to index 0.

  if (parameters.index0AttributeName !== undefined) {
    gl.bindAttribLocation(program, 0, parameters.index0AttributeName);
  } else if (parameters.morphTargets === true) {
    // programs with morphTargets displace position out of attribute 0
    gl.bindAttribLocation(program, 0, "position");
  }

  gl.linkProgram(program);

  // check for link errors
  if (renderer.debug.checkShaderErrors) {
    const programLog = gl.getProgramInfoLog(program).trim();
    const vertexLog = gl.getShaderInfoLog(glVertexShader).trim();
    const fragmentLog = gl.getShaderInfoLog(glFragmentShader).trim();

    let runnable = true;
    let haveDiagnostics = true;

    if (gl.getProgramParameter(program, gl.LINK_STATUS) === false) {
      runnable = false;

      const vertexErrors = getShaderErrors(gl, glVertexShader, "vertex");
      const fragmentErrors = getShaderErrors(gl, glFragmentShader, "fragment");

      console.error(
        "THREE.WebGLProgram: shader error: ",
        gl.getError(),
        "gl.VALIDATE_STATUS",
        gl.getProgramParameter(program, gl.VALIDATE_STATUS),
        "gl.getProgramInfoLog",
        programLog,
        vertexErrors,
        fragmentErrors
      );
    } else if (programLog !== "") {
      console.warn("THREE.WebGLProgram: gl.getProgramInfoLog()", programLog);
    } else if (vertexLog === "" || fragmentLog === "") {
      haveDiagnostics = false;
    }

    if (haveDiagnostics) {
      this.diagnostics = {
        runnable: runnable,

        programLog: programLog,

        vertexShader: {
          log: vertexLog,
          prefix: ""
        },

        fragmentShader: {
          log: fragmentLog,
          prefix: ""
        }
      };
    }
  }

  // Clean up

  // Crashes in iOS9 and iOS10. #18402
  // gl.detachShader( program, glVertexShader );
  // gl.detachShader( program, glFragmentShader );

  gl.deleteShader(glVertexShader);
  gl.deleteShader(glFragmentShader);

  // set up caching for uniform locations

  let cachedUniforms;

  this.getUniforms = function (): UniformsCache {
    if (cachedUniforms === undefined) {
      cachedUniforms = new UniformsCache(gl, program, info);
    }

    return cachedUniforms;
  };

  // set up caching for attribute locations

  let cachedAttributes;

  this.getAttributes = function () {
    if (cachedAttributes === undefined) {
      cachedAttributes = fetchAttributeLocations(gl, program);
    }

    return cachedAttributes;
  };

  // free resource

  this.destroy = function () {
    bindingStates.releaseStatesOfProgram(this);

    gl.deleteProgram(program);
    this.program = undefined;
  };

  //

  this.name = parameters.shaderName;
  this.id = programIdCount++;
  this.cacheKey = cacheKey;
  this.usedTimes = 1;
  this.program = program;
  this.vertexShader = glVertexShader;
  this.fragmentShader = glFragmentShader;

  return this;
}

export { Program, IProgram };
