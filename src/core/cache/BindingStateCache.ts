/* eslint-disable @typescript-eslint/no-use-before-define */

// import utils from '../../utils';
import { IAttributesCache } from './AttributesCache';

// function BindingStatesCache(gl: WebGL2RenderingContext) {
  
//   let cache = new WeakMap();

//   function getState(object, program, attributes?) {
//     if(cache.has(object)) return cache.get(object);
  
//     const { geometry } = object;

//     const bindingState = utils.createVAO(gl, program, geometry);
    
//     cache.set(object, bindingState);

//     return bindingState;
//   }

//   function dispose() {
//     cache = new WeakMap();
//   }

//   return {
//     getState,
//     dispose,
//   }
// }

// export default BindingStatesCache;


interface IBindingStatesCache {
  setup: (object, material, program, geometry, index) => void;
  reset: () => void;
  // resetDefaultState: () => void;
  dispose: () => void;
  releaseStatesOfGeometry: (geometry) => void;
  releaseStatesOfProgram: (program) => void;
  initAttributes: () => void;
  enableAttribute: (attribute, meshPerAttribute?: number) => void;
  disableUnusedAttributes: () => void;
}

interface IBindingState {
  attributesNum: number,
  newAttributes: number[],
  enabledAttributes: number[],
  attributeDivisors: number[],
  object: WebGLVertexArrayObject;
  attributes: Record<string, any>, // improve when attribute class will bbe ready
  index: null
}

interface IBindingStates {
  [geometryId: number]: {
    [programId: number]: {
      [wireframeFlag: number]: IBindingState;
    }
  }
}

function BindingStatesCache(gl: WebGL2RenderingContext, attributesCache: IAttributesCache): IBindingStatesCache {
  const maxVertexAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

  const bindingStatesCache: IBindingStates = {};

  const defaultState: IBindingState = createBindingState(null);

  let currentState: IBindingState = defaultState;

  /**
   * Gets binding state for given geometry, program and material,
   * - if obtained state is not equal to currentState, then assign it to currentState,
   * check if buffers need to update
   * - if buffers need update, call saveCache
   * instanced mesh always require buffer update
   * update index attribute if present
   * setup vertex attributes (call gl.enableVertexAttribute and gl.vertexAttribPointer for each attribute)
   * bind index buffer if present
   * @param object -> object3d
   * @param material 
   * @param program
   * @param geometry
   * @param index
   */
  function setup(object, material, program, geometry, index): void {
    let updateBuffers = false;

    const state = getBindingState(geometry.id, program.id, material.wireframe);

    if (currentState !== state) {
      currentState = state;
      gl.bindVertexArray(currentState.object);
    }

    updateBuffers = needsUpdate(geometry, index);

    if (updateBuffers) saveCache(geometry, index);

    if (object.isInstancedMesh === true) {
      updateBuffers = true;
    }

    if (index !== null) {
      attributesCache.update(index, gl.ELEMENT_ARRAY_BUFFER);
    }

    if (updateBuffers) {
      setupVertexAttributes(object, material, program, geometry);

      if (index !== null) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, attributesCache.get(index).buffer);
      }
    }
  }

  /**
   * Creates or returns a binding state for given geometry, program and material
   * @param geometryId - geometry.id 
   * @param programId - program.id
   * @param wireframe - material.wireframe
   *
   * @returns IBindingState for given geometry, program and wireframe configuration
   * 
   * originally: getBindingState(geometry, program, material)
   */
  /* @private */ function getBindingState(
    geometryId: number,
    programId: number,
    wireframe: number
  ): IBindingState {
    // const wireframe = material.wireframe === true;

    let programMap = bindingStatesCache[geometryId];

    if (programMap === undefined) {
      programMap = {};
      bindingStatesCache[geometryId] = programMap;
    }

    let stateMap = programMap[programId];

    if (stateMap === undefined) {
      stateMap = {};
      programMap[programId] = stateMap;
    }

    let state = stateMap[wireframe];

    if (state === undefined) {
      state = createBindingState(gl.createVertexArray());
      stateMap[wireframe] = state;
    }

    return state;
  }

  /**
   * creates a binding state for a vao,
   * the bindingState is a leaf node in bindingStates cache.

   * @param vao
   */
  /* @private */ function createBindingState(vao: WebGLVertexArrayObject): IBindingState {
    const newAttributes = [];
    const enabledAttributes = [];
    const attributeDivisors = [];

    for (let i = 0; i < maxVertexAttributes; i++) {
      newAttributes[i] = 0;
      enabledAttributes[i] = 0;
      attributeDivisors[i] = 0;
    }

    return {
      attributesNum: 0,
      newAttributes,
      enabledAttributes,
      attributeDivisors,
      object: vao,
      attributes: {},
      index: null
    };
  }

  /**
   * By comparing currentState.attributes and geometry attributes, 
   * it establishes if buffers stored in binding states need to update, 
   * if so, attributes will be saved to cache (currentState),
   * and the setupVertexAttributes will be called on the geometry 
   * and index passed as params.
   * @param geometry
   * @param index
   */
  /* @private */ function needsUpdate(geometry, index): boolean {
    const cachedAttributes = currentState.attributes;
    const geometryAttributes = geometry.attributes;

    let attributesNum = 0;

    for (const key in geometryAttributes) {
      const cachedAttribute = cachedAttributes[key];
      const geometryAttribute = geometryAttributes[key];

      if (cachedAttribute === undefined) return true;

      if (cachedAttribute.attribute !== geometryAttribute) return true;

      if (cachedAttribute.data !== geometryAttribute.data) return true;

      attributesNum++;
    }

    if (currentState.attributesNum !== attributesNum) return true;

    if (currentState.index !== index) return true;

    return false;
  }

  /**
   * Loops through all attributes of the geometry, saving its data to a currentState,
   * cache key is the name of attribute. Saves cached attributes, attributeNum and index
   * to the currentState 
   * @param geometry 
   * @param index 
   */
  /* @private */ function saveCache(geometry, index) {
    const cache = {};
    const attributes = geometry.attributes;
    let attributesNum = 0;

    for (const key in attributes) {
      const attribute = attributes[key];

      const data = { attribute, data: null };

      if (attribute.data) {
        data.data = attribute.data;
      }

      cache[key] = data;

      attributesNum++;
    }

    currentState.attributes = cache;
    currentState.attributesNum = attributesNum;

    currentState.index = index;
  }

  /**
   * Initialize each currentState.newAttributes with 0, to be able to sync 
   * later with currentState.enabledAttributes
   * and gl.<enable/disable>VertexAttribArray on appropriate attrs
   */
  function initAttributes() {
    const newAttributes = currentState.newAttributes;

    for (let i = 0, il = newAttributes.length; i < il; i++) {
      newAttributes[i] = 0;
    }
  }


  /**
   * Enables an attribute passed as param, sets vertexAttribDivisor if applicable
   * sets newAttributes flag to 1 finishinng initialization of newAttribute 
   * @param attribute 
   * @param meshPerAttribute 
   */
  function enableAttributeAndDivisor(attribute, meshPerAttribute = 0) {
    const newAttributes = currentState.newAttributes;
    const enabledAttributes = currentState.enabledAttributes;
    const attributeDivisors = currentState.attributeDivisors;

    newAttributes[attribute] = 1;

    if (enabledAttributes[attribute] === 0) {
      gl.enableVertexAttribArray(attribute);
      enabledAttributes[attribute] = 1;
    }

    if (attributeDivisors[attribute] !== meshPerAttribute) {
      gl.vertexAttribDivisor(attribute, meshPerAttribute);
      attributeDivisors[attribute] = meshPerAttribute;
    }
  }

  function disableUnusedAttributes() {
    const newAttributes = currentState.newAttributes;
    const enabledAttributes = currentState.enabledAttributes;

    for (let i = 0, il = enabledAttributes.length; i < il; i++) {
      if (enabledAttributes[i] !== newAttributes[i]) {
        gl.disableVertexAttribArray(i);
        enabledAttributes[i] = 0;
      }
    }
  }

  /* @private */ function vertexAttribPointer(index, size, type, normalized, stride, offset) {
    if (type === gl.INT || type === gl.UNSIGNED_INT) {
      gl.vertexAttribIPointer(index, size, type, stride, offset);
    } else {
      gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
    }
  }

  /**
   * Enables vertex attributes and sets attribute pointer for each program attribute
   * @param object
   * @param material
   * @param program
   * @param geometry
   */
  /* @private */ function setupVertexAttributes(
    object,
    material,
    program,
    geometry
  ) {
    initAttributes();

    const geometryAttributes = geometry.attributes;

    const programAttributes = program.getAttributes();

    const materialDefaultAttributeValues = material.defaultAttributeValues;

    for (const name in programAttributes) {
      const programAttribute = programAttributes[name];

      if (programAttribute >= 0) {
        const geometryAttribute = geometryAttributes[name];

        if (geometryAttribute !== undefined) {
          const normalized = geometryAttribute.normalized;
          const size = geometryAttribute.itemSize;

          const attribute = attributesCache.get(geometryAttribute);

          // TODO Attribute may not be available on context restore

          if (attribute === undefined) continue;

          const buffer = attribute.buffer;
          const type = attribute.type;
          const bytesPerElement = attribute.bytesPerElement;

          if (geometryAttribute.isInterleavedBufferAttribute) {
            const data = geometryAttribute.data;
            const stride = data.stride;
            const offset = geometryAttribute.offset;

            if (data && data.isInstancedInterleavedBuffer) {
              enableAttributeAndDivisor(
                programAttribute,
                data.meshPerAttribute
              );

              if (geometry._maxInstanceCount === undefined) {
                geometry._maxInstanceCount = data.meshPerAttribute * data.count;
              }
            } else {
              enableAttributeAndDivisor(programAttribute);
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            vertexAttribPointer(
              programAttribute,
              size,
              type,
              normalized,
              stride * bytesPerElement,
              offset * bytesPerElement
            );
          } else {
            if (geometryAttribute.isInstancedBufferAttribute) {
              enableAttributeAndDivisor(
                programAttribute,
                geometryAttribute.meshPerAttribute
              );

              if (geometry._maxInstanceCount === undefined) {
                geometry._maxInstanceCount =
                  geometryAttribute.meshPerAttribute * geometryAttribute.count;
              }
            } else {
              enableAttributeAndDivisor(programAttribute);
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            vertexAttribPointer(programAttribute, size, type, normalized, 0, 0);
          }
        } else if (name === "instanceMatrix") {
          const attribute = attributesCache.get(object.instanceMatrix);

          // TODO Attribute may not be available on context restore

          if (attribute === undefined) continue;

          const buffer = attribute.buffer;
          const type = attribute.type;

          enableAttributeAndDivisor(programAttribute + 0, 1);
          enableAttributeAndDivisor(programAttribute + 1, 1);
          enableAttributeAndDivisor(programAttribute + 2, 1);
          enableAttributeAndDivisor(programAttribute + 3, 1);

          gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

          gl.vertexAttribPointer(programAttribute + 0, 4, type, false, 64, 0);
          gl.vertexAttribPointer(programAttribute + 1, 4, type, false, 64, 16);
          gl.vertexAttribPointer(programAttribute + 2, 4, type, false, 64, 32);
          gl.vertexAttribPointer(programAttribute + 3, 4, type, false, 64, 48);
        } else if (name === "instanceColor") {
          const attribute = attributesCache.get(object.instanceColor);

          // TODO Attribute may not be available on context restore

          if (typeof attribute === 'undefined') continue;

          const buffer = attribute.buffer;
          const type = attribute.type;

          enableAttributeAndDivisor(programAttribute, 1);

          gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

          gl.vertexAttribPointer(programAttribute, 3, type, false, 12, 0);
        } else if (materialDefaultAttributeValues !== undefined) {
          const value = materialDefaultAttributeValues[name];

          if (value !== undefined) {
            switch (value.length) {
              case 2:
                gl.vertexAttrib2fv(programAttribute, value);
                break;

              case 3:
                gl.vertexAttrib3fv(programAttribute, value);
                break;

              case 4:
                gl.vertexAttrib4fv(programAttribute, value);
                break;

              default:
                gl.vertexAttrib1fv(programAttribute, value);
            }
          }
        }
      }
    }

    disableUnusedAttributes();
  }

  function dispose() {
    reset();

    for (const geometryId in bindingStatesCache) {
      const programMap = bindingStatesCache[geometryId];

      for (const programId in programMap) {
        const stateMap = programMap[programId];

        for (const wireframe in stateMap) {
          gl.deleteVertexArray(stateMap[wireframe].object);

          delete stateMap[wireframe];
        }

        delete programMap[programId];
      }

      delete bindingStatesCache[geometryId];
    }
  }

  function releaseStatesOfGeometry(geometry): void {
    if (bindingStatesCache[geometry.id] === undefined) return;

    const programMap = bindingStatesCache[geometry.id];

    for (const programId in programMap) {
      const stateMap = programMap[programId];

      for (const wireframe in stateMap) {
        gl.deleteVertexArray(stateMap[wireframe].object);

        delete stateMap[wireframe];
      }

      delete programMap[programId];
    }

    delete bindingStatesCache[geometry.id];
  }

  function releaseStatesOfProgram(program) {
    for (const geometryId in bindingStatesCache) {
      const programMap = bindingStatesCache[geometryId];

      if (programMap[program.id] === undefined) continue;

      const stateMap = programMap[program.id];

      for (const wireframe in stateMap) {
        gl.deleteVertexArray(stateMap[wireframe].object);

        delete stateMap[wireframe];
      }

      delete programMap[program.id];
    }
  }

  function reset() {
    // resetDefaultState();

    if (currentState === defaultState) return;

    currentState = defaultState;
    gl.bindVertexArray(currentState.object);
  }

  // for backward-compatilibity

  // function resetDefaultState() {
  //   defaultState.geometry = null;
  //   defaultState.program = null;
  //   defaultState.wireframe = false;
  // }

  return {
    setup,
    reset,
    // resetDefaultState,
    dispose,
    releaseStatesOfGeometry,
    releaseStatesOfProgram,
    initAttributes,
    enableAttribute: enableAttributeAndDivisor,
    disableUnusedAttributes,
  };
}

export { BindingStatesCache, IBindingStatesCache, IBindingState, IBindingStates };
