// Array Caches (provide typed arrays for temporary by size)

const arrayCacheF32 = [];
const arrayCacheI32 = [];

// Float32Array caches used for uploading Matrix uniforms

const mat4array = new Float32Array( 16 );
const mat3array = new Float32Array( 9 );
const mat2array = new Float32Array( 4 );

// Flattening for arrays of vectors and matrices

function copyArray( target, source ): void {

	for ( let i = 0, l = source.length; i < l; i ++ ) {

		target[ i ] = source[ i ];

	}

}

function flatten( array, nBlocks, blockSize ) {

	const firstElem = array[ 0 ];

	if ( firstElem <= 0 || firstElem > 0 ) return array;
	// unoptimized: ! isNaN( firstElem )
	// see http://jacksondunstan.com/articles/983

	const n = nBlocks * blockSize;
	let r = arrayCacheF32[ n ];

	if ( r === undefined ) {

		r = new Float32Array( n );
		arrayCacheF32[ n ] = r;

	}

	if ( nBlocks !== 0 ) {

		firstElem.toArray( r, 0 );

		for ( let i = 1, offset = 0; i !== nBlocks; ++ i ) {

			offset += blockSize;
			array[ i ].toArray( r, offset );

		}

	}

	return r;

}

function arraysEqual( a: any[], b: any[] ): boolean {

	if ( a.length !== b.length ) return false;

	for ( let i = 0, l = a.length; i < l; i ++ ) {

		if ( a[ i ] !== b[ i ] ) return false;

	}

	return true;

}

export default function UniformUtils(info) {


	// Note: Defining these methods externally, because they come in a bunch
	// and this way their names minify.

	// Single scalar

	function setValueV1f( gl, v ) {

		const cache = this.cache;

		if ( cache[ 0 ] === v ) return;
		gl.uniform1f( this.addr, v );
		info.render.uniformCalls++;

		cache[ 0 ] = v;

	}

	// Single float vector (from flat array or THREE.VectorN)

	function setValueV2f( gl, v ) {

		const cache = this.cache;

		if ( v.x !== undefined ) {

			if ( cache[ 0 ] !== v.x || cache[ 1 ] !== v.y ) {

				gl.uniform2f( this.addr, v.x, v.y );
				info.render.uniformCalls++;
				cache[ 0 ] = v.x;
				cache[ 1 ] = v.y;

			}

		} else {

			if ( arraysEqual( cache, v ) ) return;

			gl.uniform2fv( this.addr, v );
			info.render.uniformCalls++;
			copyArray( cache, v );

		}

	}

	function setValueV3f( gl, v ) {

		const cache = this.cache;

		if ( v.x !== undefined ) {

			if ( cache[ 0 ] !== v.x || cache[ 1 ] !== v.y || cache[ 2 ] !== v.z ) {

				gl.uniform3f( this.addr, v.x, v.y, v.z );
				info.render.uniformCalls++;
				cache[ 0 ] = v.x;
				cache[ 1 ] = v.y;
				cache[ 2 ] = v.z;

			}

		} else if ( v.r !== undefined ) {

			if ( cache[ 0 ] !== v.r || cache[ 1 ] !== v.g || cache[ 2 ] !== v.b ) {

				gl.uniform3f( this.addr, v.r, v.g, v.b );
				info.render.uniformCalls++;
				cache[ 0 ] = v.r;
				cache[ 1 ] = v.g;
				cache[ 2 ] = v.b;

			}

		} else {

			if ( arraysEqual( cache, v ) ) return;

			gl.uniform3fv( this.addr, v );
			info.render.uniformCalls++;
			copyArray( cache, v );

		}

	}

	function setValueV4f( gl, v ) {

		const cache = this.cache;

		if ( v.x !== undefined ) {

			if ( cache[ 0 ] !== v.x || cache[ 1 ] !== v.y || cache[ 2 ] !== v.z || cache[ 3 ] !== v.w ) {

				gl.uniform4f( this.addr, v.x, v.y, v.z, v.w );
				info.render.uniformCalls++;
				cache[ 0 ] = v.x;
				cache[ 1 ] = v.y;
				cache[ 2 ] = v.z;
				cache[ 3 ] = v.w;

			}

		} else {

			if ( arraysEqual( cache, v ) ) return;

			gl.uniform4fv( this.addr, v );
			info.render.uniformCalls++;
			copyArray( cache, v );

		}

	}

	// Single matrix (from flat array or THREE.MatrixN)

	function setValueM2( gl, v ) {

		const cache = this.cache;
		const elements = v.elements;

		if ( elements === undefined ) {

			if ( arraysEqual( cache, v ) ) return;

			gl.uniformMatrix2fv( this.addr, false, v );
			info.render.uniformCalls++;
			copyArray( cache, v );

		} else {

			if ( arraysEqual( cache, elements ) ) return;

			mat2array.set( elements );

			gl.uniformMatrix2fv( this.addr, false, mat2array );
			info.render.uniformCalls++;
			copyArray( cache, elements );

		}

	}

	function setValueM3( gl, v ) {

		const cache = this.cache;
		const elements = v.elements;

		if ( elements === undefined ) {

			if ( arraysEqual( cache, v ) ) return;

			gl.uniformMatrix3fv( this.addr, false, v );
			info.render.uniformCalls++;
			copyArray( cache, v );

		} else {

			if ( arraysEqual( cache, elements ) ) return;

			mat3array.set( elements );

			gl.uniformMatrix3fv( this.addr, false, mat3array );
			info.render.uniformCalls++;
			copyArray( cache, elements );

		}

	}

	function setValueM4( gl, v ) {

		const cache = this.cache;
		const elements = v.elements;

		if ( elements === undefined ) {

			if ( arraysEqual( cache, v ) ) return;

			gl.uniformMatrix4fv( this.addr, false, v );
			info.render.uniformCalls++;
			copyArray( cache, v );

		} else {

			if ( arraysEqual( cache, elements ) ) return;

			mat4array.set( elements );

			gl.uniformMatrix4fv( this.addr, false, mat4array );
			info.render.uniformCalls++;
			copyArray( cache, elements );

		}

	}

	// Single integer / boolean

	function setValueV1i( gl, v ) {

		const cache = this.cache;

		if ( cache[ 0 ] === v ) return;

		gl.uniform1i( this.addr, v );
		info.render.uniformCalls++;
		cache[ 0 ] = v;

	}

	// Single integer / boolean vector (from flat array)

	function setValueV2i( gl, v ) {

		const cache = this.cache;

		if ( arraysEqual( cache, v ) ) return;

		gl.uniform2iv( this.addr, v );
		info.render.uniformCalls++;
		copyArray( cache, v );

	}

	function setValueV3i( gl, v ) {

		const cache = this.cache;

		if ( arraysEqual( cache, v ) ) return;

		gl.uniform3iv( this.addr, v );
		info.render.uniformCalls++;
		copyArray( cache, v );

	}

	function setValueV4i( gl, v ) {

		const cache = this.cache;

		if ( arraysEqual( cache, v ) ) return;

		gl.uniform4iv( this.addr, v );
		info.render.uniformCalls++;
		copyArray( cache, v );

	}

	// Single unsigned integer

	function setValueV1ui( gl, v ) {

		const cache = this.cache;

		if ( cache[ 0 ] === v ) return;

		gl.uniform1ui( this.addr, v );
		info.render.uniformCalls++;
		cache[ 0 ] = v;

	}

	// Single unsigned integer vector (from flat array)

	function setValueV2ui( gl, v ) {

		const cache = this.cache;

		if ( arraysEqual( cache, v ) ) return;

		gl.uniform2uiv( this.addr, v );
		info.render.uniformCalls++;
		copyArray( cache, v );

	}

	function setValueV3ui( gl, v ) {

		const cache = this.cache;

		if ( arraysEqual( cache, v ) ) return;

		gl.uniform3uiv( this.addr, v );
		info.render.uniformCalls++;
		copyArray( cache, v );

	}

	function setValueV4ui( gl, v ) {

		const cache = this.cache;

		if ( arraysEqual( cache, v ) ) return;

		gl.uniform4uiv( this.addr, v );
		info.render.uniformCalls++;
		copyArray( cache, v );

	}


	// Single texture (2D / Cube)

	// function setValueT1( gl, v, textures ) {

	// 	const cache = this.cache;
	// 	const unit = textures.allocateTextureUnit();

	// 	if ( cache[ 0 ] !== unit ) {

	// 		gl.uniform1i( this.addr, unit );
	// 		cache[ 0 ] = unit;

	// 	}

	// 	textures.safeSetTexture2D( v || emptyTexture, unit );

	// }

	// function setValueT3D1( gl, v, textures ) {

	// 	const cache = this.cache;
	// 	const unit = textures.allocateTextureUnit();

	// 	if ( cache[ 0 ] !== unit ) {

	// 		gl.uniform1i( this.addr, unit );
	// 		cache[ 0 ] = unit;

	// 	}

	// 	textures.setTexture3D( v || emptyTexture3d, unit );

	// }

	// function setValueT6( gl, v, textures ) {

	// 	const cache = this.cache;
	// 	const unit = textures.allocateTextureUnit();

	// 	if ( cache[ 0 ] !== unit ) {

	// 		gl.uniform1i( this.addr, unit );
	// 		cache[ 0 ] = unit;

	// 	}

	// 	textures.safeSetTextureCube( v || emptyCubeTexture, unit );

	// }

	// function setValueT2DArray1( gl, v, textures ) {

	// 	const cache = this.cache;
	// 	const unit = textures.allocateTextureUnit();

	// 	if ( cache[ 0 ] !== unit ) {

	// 		gl.uniform1i( this.addr, unit );
	// 		cache[ 0 ] = unit;

	// 	}

	// 	textures.setTexture2DArray( v || emptyTexture2dArray, unit );

	// }

	// Helper to pick the right setter for the singular case

	function getSingularSetter ( type ) {

		switch ( type ) {

			case 0x1406: return setValueV1f; // FLOAT
			case 0x8b50: return setValueV2f; // _VEC2
			case 0x8b51: return setValueV3f; // _VEC3
			case 0x8b52: return setValueV4f; // _VEC4

			case 0x8b5a: return setValueM2; // _MAT2
			case 0x8b5b: return setValueM3; // _MAT3
			case 0x8b5c: return setValueM4; // _MAT4

			case 0x1404: case 0x8b56: return setValueV1i; // INT, BOOL
			case 0x8b53: case 0x8b57: return setValueV2i; // _VEC2
			case 0x8b54: case 0x8b58: return setValueV3i; // _VEC3
			case 0x8b55: case 0x8b59: return setValueV4i; // _VEC4

			case 0x1405: return setValueV1ui; // UINT
			case 0x8dc6: return setValueV2ui; // _VEC2
			case 0x8dc7: return setValueV3ui; // _VEC3
			case 0x8dc8: return setValueV4ui; // _VEC4

			// case 0x8b5e: // SAMPLER_2D
			// case 0x8d66: // SAMPLER_EXTERNAL_OES
			// case 0x8dca: // INT_SAMPLER_2D
			// case 0x8dd2: // UNSIGNED_INT_SAMPLER_2D
			// case 0x8b62: // SAMPLER_2D_SHADOW
			// 	return setValueT1;

			// case 0x8b5f: // SAMPLER_3D
			// case 0x8dcb: // INT_SAMPLER_3D
			// case 0x8dd3: // UNSIGNED_INT_SAMPLER_3D
			// 	return setValueT3D1;

			// case 0x8b60: // SAMPLER_CUBE
			// case 0x8dcc: // INT_SAMPLER_CUBE
			// case 0x8dd4: // UNSIGNED_INT_SAMPLER_CUBE
			// case 0x8dc5: // SAMPLER_CUBE_SHADOW
			// 	return setValueT6;

			// case 0x8dc1: // SAMPLER_2D_ARRAY
			// case 0x8dcf: // INT_SAMPLER_2D_ARRAY
			// case 0x8dd7: // UNSIGNED_INT_SAMPLER_2D_ARRAY
			// case 0x8dc4: // SAMPLER_2D_ARRAY_SHADOW
			// 	return setValueT2DArray1;

		}

	}


	// Array of scalars

	function setValueV1fArray( gl, v ) {

		gl.uniform1fv( this.addr, v );

	}

	// Array of vectors (from flat array or array of THREE.VectorN)

	function setValueV2fArray( gl, v ) {

		const data = flatten( v, this.size, 2 );

		gl.uniform2fv( this.addr, data );

	}

	function setValueV3fArray( gl, v ) {

		const data = flatten( v, this.size, 3 );

		gl.uniform3fv( this.addr, data );

	}

	function setValueV4fArray( gl, v ) {

		const data = flatten( v, this.size, 4 );

		gl.uniform4fv( this.addr, data );

	}

	// Array of matrices (from flat array or array of THREE.MatrixN)

	function setValueM2Array( gl, v ) {

		const data = flatten( v, this.size, 4 );

		gl.uniformMatrix2fv( this.addr, false, data );

	}

	function setValueM3Array( gl, v ) {

		const data = flatten( v, this.size, 9 );

		gl.uniformMatrix3fv( this.addr, false, data );

	}

	function setValueM4Array( gl, v ) {

		const data = flatten( v, this.size, 16 );

		gl.uniformMatrix4fv( this.addr, false, data );

	}

	// Array of integer / boolean

	function setValueV1iArray( gl, v ) {

		gl.uniform1iv( this.addr, v );

	}

	// Array of integer / boolean vectors (from flat array)

	function setValueV2iArray( gl, v ) {

		gl.uniform2iv( this.addr, v );

	}

	function setValueV3iArray( gl, v ) {

		gl.uniform3iv( this.addr, v );

	}

	function setValueV4iArray( gl, v ) {

		gl.uniform4iv( this.addr, v );

	}

	// Array of unsigned integer

	function setValueV1uiArray( gl, v ) {

		gl.uniform1uiv( this.addr, v );

	}

	// Array of unsigned integer vectors (from flat array)

	function setValueV2uiArray( gl, v ) {

		gl.uniform2uiv( this.addr, v );

	}

	function setValueV3uiArray( gl, v ) {

		gl.uniform3uiv( this.addr, v );

	}

	function setValueV4uiArray( gl, v ) {

		gl.uniform4uiv( this.addr, v );

	}


	// Array of textures (2D / Cube)

	// function setValueT1Array( gl, v, textures ) {

	// 	const n = v.length;

	// 	const units = allocTexUnits( textures, n );

	// 	gl.uniform1iv( this.addr, units );

	// 	for ( let i = 0; i !== n; ++ i ) {

	// 		textures.safeSetTexture2D( v[ i ] || emptyTexture, units[ i ] );

	// 	}

	// }

	// function setValueT6Array( gl, v, textures ) {

	// 	const n = v.length;

	// 	const units = allocTexUnits( textures, n );

	// 	gl.uniform1iv( this.addr, units );

	// 	for ( let i = 0; i !== n; ++ i ) {

	// 		textures.safeSetTextureCube( v[ i ] || emptyCubeTexture, units[ i ] );

	// 	}

	// }

	// Helper to pick the right setter for a pure (bottom-level) array

	function getPureArraySetter( type ) {
		info.render.uniformCalls++;
		switch ( type ) {

			case 0x1406: return setValueV1fArray; // FLOAT
			case 0x8b50: return setValueV2fArray; // _VEC2
			case 0x8b51: return setValueV3fArray; // _VEC3
			case 0x8b52: return setValueV4fArray; // _VEC4

			case 0x8b5a: return setValueM2Array; // _MAT2
			case 0x8b5b: return setValueM3Array; // _MAT3
			case 0x8b5c: return setValueM4Array; // _MAT4

			case 0x1404: case 0x8b56: return setValueV1iArray; // INT, BOOL
			case 0x8b53: case 0x8b57: return setValueV2iArray; // _VEC2
			case 0x8b54: case 0x8b58: return setValueV3iArray; // _VEC3
			case 0x8b55: case 0x8b59: return setValueV4iArray; // _VEC4

			case 0x1405: return setValueV1uiArray; // UINT
			case 0x8dc6: return setValueV2uiArray; // _VEC2
			case 0x8dc7: return setValueV3uiArray; // _VEC3
			case 0x8dc8: return setValueV4uiArray; // _VEC4

			// case 0x8b5e: // SAMPLER_2D
			// case 0x8d66: // SAMPLER_EXTERNAL_OES
			// case 0x8dca: // INT_SAMPLER_2D
			// case 0x8dd2: // UNSIGNED_INT_SAMPLER_2D
			// case 0x8b62: // SAMPLER_2D_SHADOW
			// 	return setValueT1Array;

			// case 0x8b60: // SAMPLER_CUBE
			// case 0x8dcc: // INT_SAMPLER_CUBE
			// case 0x8dd4: // UNSIGNED_INT_SAMPLER_CUBE
			// case 0x8dc5: // SAMPLER_CUBE_SHADOW
			// 	return setValueT6Array;

		}

	}

	return {
		getSingularSetter,
    getPureArraySetter,
    copyArray,
	}
}
