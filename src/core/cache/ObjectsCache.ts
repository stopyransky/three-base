
import { IWebGLInfo } from '../WebGLInfo'
import { IAttributesCache } from './AttributesCache';
import { IGeometriesCache } from './GeometriesCache';

interface IObjectsCache {
	update: (object) => any, // buffer geometry
	dipose: () => void;
}
function ObjectsCache( 
	gl: WebGL2RenderingContext, 
	geometriesCache: IGeometriesCache, 
	attributesCache: IAttributesCache, 
	info: IWebGLInfo 
) {

	let updateMap = new WeakMap<any, number>();

  function onInstancedMeshDispose( event ) {

    const instancedMesh = event.target;
  
    instancedMesh.removeEventListener( 'dispose', onInstancedMeshDispose );
  
    attributesCache.remove( instancedMesh.instanceMatrix );
  
    if ( instancedMesh.instanceColor !== null ) attributesCache.remove( instancedMesh.instanceColor );
  
  }

	function update( object ) {

		const frame = info.render.frame;

		const geometry = object.geometry;
		const buffergeometry = geometriesCache.get( object, geometry );

		// Update once per frame

		if ( updateMap.get( buffergeometry ) !== frame ) {

			geometriesCache.update( buffergeometry );

			updateMap.set( buffergeometry, frame );

		}

		if ( object.isInstancedMesh ) {

			if ( object.hasEventListener( 'dispose', onInstancedMeshDispose ) === false ) {

				object.addEventListener( 'dispose', onInstancedMeshDispose );

			}

			attributesCache.update( object.instanceMatrix, gl.ARRAY_BUFFER );

			if ( object.instanceColor !== null ) {

				attributesCache.update( object.instanceColor, gl.ARRAY_BUFFER );

			}

		}

		return buffergeometry;

	}

	function dispose() {

		updateMap = new WeakMap();

	}



	return {
		update,
		dispose
	};

}


export { ObjectsCache, IObjectsCache };