
/**
 * https://github.com/mrdoob/three.js/blob/35eaf1906fb74f16be8b155c86c1e0d8a1d4669c/src/renderers/webgl/WebGLUniforms.js#L905
 * 
 */
// import WebGLInfo from './WebGLInfo';
import UniformUtils from './UniformUtils';

// import { CubeTexture } from './textures/CubeTexture';
// import { Texture } from '../textures/Texture.js';
// import { DataTexture2DArray } from './textures/DataTexture2DArray.js';
// import { DataTexture3D } from './textures/DataTexture3D.js';

// const emptyTexture = new Texture();
// const emptyTexture2dArray = new DataTexture2DArray();
// const emptyTexture3d = new DataTexture3D();
// const emptyCubeTexture = new CubeTexture();

let utils;

const RePathPart = /(\w+)(\])?(\[|\.)?/g;



// Texture unit allocation

// function allocTexUnits( textures, n ) {

// 	let r = arrayCacheI32[ n ];

// 	if ( r === undefined ) {

// 		r = new Int32Array( n );
// 		arrayCacheI32[ n ] = r;

// 	}

// 	for ( let i = 0; i !== n; ++ i ) {

// 		r[ i ] = textures.allocateTextureUnit();

// 	}

// 	return r;

// }

// --- Setters ---



class SingleUniform {
	id: any;
	addr: number;
	cache: any
	setValue: (id, info, addr) => void;

	constructor( id, activeInfo, addr ) {
		this.id = id;
		this.addr = addr;
		this.cache = [];
		this.setValue = utils.getSingularSetter( activeInfo.type );

		// this.path = activeInfo.name; // DEBUG

	}
}


class PureArrayUniform {
	id: any;
	addr: number;
	cache: Float32Array;
	size: number;
	setValue: (gl: WebGL2RenderingContext, v: any) => void;

	constructor( id, activeInfo, addr ) {

		this.id = id;
		this.addr = addr;
		this.cache = new Float32Array();
		this.size = activeInfo.size;
		this.setValue = utils.getPureArraySetter( activeInfo.type );

		// this.path = activeInfo.name; // DEBUG

	}

	updateCache ( data ) {

		const cache = this.cache;

		if ( data instanceof Float32Array && cache.length !== data.length ) {

			this.cache = new Float32Array( data.length );

		}

		utils.copyArray( cache, data );

	};

}


class StructuredUniform {
	id: any;
	seq: any[];
	map: any;

	constructor( id ) {
		this.id = id;
		this.seq = [];
		this.map = {};
	}
	
	setValue( gl, value, textures ) {

		const seq = this.seq;
	
		for ( let i = 0, n = seq.length; i !== n; ++ i ) {
	
			const u = seq[ i ];
			u.setValue( gl, value[ u.id ], textures );
	
		}
	
	};

}


class UniformsCache {
	gl: WebGL2RenderingContext;
	seq: any[];
	map: any;

	static addUniform( container, uniformObject ) {

		container.seq.push( uniformObject );
		container.map[ uniformObject.id ] = uniformObject;
	
	}
	
	static parseUniform( activeInfo, addr, container ) {
		// let container = this;
		const path = activeInfo.name;
		const pathLength = path.length;
	
		// reset RegExp object, because of the early exit of a previous run
		RePathPart.lastIndex = 0;
	
		while ( true ) {
	
			const match = RePathPart.exec( path ),
				matchEnd = RePathPart.lastIndex;
	
			let id: any = match[ 1 ];
			const idIsIndex = match[ 2 ] === ']',
				subscript = match[ 3 ];
	
			if ( idIsIndex ) { 
				id = id | 0; // convert to integer
			}
	
			if ( subscript === undefined || (subscript === '[' && matchEnd + 2 === pathLength) ) {
	
				// bare name or "pure" bottom-level array "[0]" suffix
	
				UniformsCache.addUniform( container, subscript === undefined ?
					new SingleUniform( id, activeInfo, addr ) :
					new PureArrayUniform( id, activeInfo, addr ) );
	
				break;
	
			} else {
	
				// step into inner node / create it in case it doesn't exist
	
				const map = container.map;
				let next = map[ id ];
	
				if ( typeof next === 'undefined' ) {
	
					next = new StructuredUniform( id );
					UniformsCache.addUniform( container, next );
	
				}
	
				container = next;
	
			}
	
		}
	
	}

	static seqWithValue( seq, values ) {

		const r = [];
	
		for ( let i = 0, n = seq.length; i !== n; ++ i ) {
	
			const uniform = seq[ i ];
			if ( uniform.id in values ) r.push( uniform );
	
		}
	
		return r;
	
	}

	static upload( gl, seq, values, textures ) {

		for ( let i = 0, n = seq.length; i !== n; ++ i ) {
	
			const u = seq[ i ],
				v = values[ u.id ];
	
			if ( v.needsUpdate !== false ) {
	
				// note: always updating when .needsUpdate is undefined
				u.setValue( gl, v.value, textures );
	
			}
	
		}
	
	};

	constructor( gl: WebGL2RenderingContext, program: WebGLProgram, info ) {
		this.gl = gl;
		this.seq = [];
		this.map = {};
		
		if(typeof utils === 'undefined') {
			utils = UniformUtils(info);
		}

		const num = gl.getProgramParameter( program, gl.ACTIVE_UNIFORMS );
		
		info.memory.activeUniforms += num;
		
		for ( let i = 0; i < num; ++ i ) {
	
			const info = gl.getActiveUniform( program, i );
			const addr = gl.getUniformLocation( program, info.name );
	
			UniformsCache.parseUniform( info, addr, this );
	
		}
		
	}

	setValue  = ( name: string, value: any, textures? ) => {
		const { gl, map } = this;
		const uniform = map[ name ];
	
		if ( typeof uniform !== 'undefined' ) uniform.setValue( gl, value, textures );
	
	};






}


export { UniformsCache };