import { IExtensions } from "./WebGLExtensions";

interface ICapabilities {
	isWebGL2: boolean;
	drawBuffers: boolean;
	getMaxAnisotropy: () => number;
	getMaxPrecision: (materialPrecision: string) => string;
	precision: string;
	logarithmicDepthBuffer: boolean;
	maxTextures: number;
	maxVertexTextures: number;
	maxTextureSize: number;
	maxCubemapSize: number;
	maxAttributes: number ;
	maxVertexUniforms: number;
	maxVaryings: number;
	maxFragmentUniforms: number;
	vertexTextures:  boolean;
	floatFragmentTextures: boolean ;
	floatVertexTextures: boolean ;
	maxSamples: number;
}

function WebGLCapabilities( gl: WebGL2RenderingContext, extensions: IExtensions, parameters ): ICapabilities {

	let maxAnisotropy;

	function getMaxAnisotropy(): number {

		if ( maxAnisotropy !== undefined ) return maxAnisotropy;

		if ( extensions.has( 'EXT_texture_filter_anisotropic' ) === true ) {

			const extension = extensions.get( 'EXT_texture_filter_anisotropic' );

			maxAnisotropy = gl.getParameter( extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT );

		} else {

			maxAnisotropy = 0;

		}

		return maxAnisotropy;

	}

	function getMaxPrecision( materialPrecision: string ): string {

		if ( materialPrecision === 'highp' ) {

			if ( gl.getShaderPrecisionFormat( gl.VERTEX_SHADER, gl.HIGH_FLOAT ).precision > 0 &&
				gl.getShaderPrecisionFormat( gl.FRAGMENT_SHADER, gl.HIGH_FLOAT ).precision > 0 ) {

				return 'highp';

			}

			materialPrecision = 'mediump';

		}

		if ( materialPrecision === 'mediump' ) {

			if ( gl.getShaderPrecisionFormat( gl.VERTEX_SHADER, gl.MEDIUM_FLOAT ).precision > 0 &&
				gl.getShaderPrecisionFormat( gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT ).precision > 0 ) {

				return 'mediump';

			}

		}

		return 'lowp';

	}

	/* eslint-disable no-undef */
	const isWebGL2 = true;
	/* eslint-enable no-undef */

	let precision = parameters.precision !== undefined ? parameters.precision : 'highp';
	const maxPrecision = getMaxPrecision( precision );

	if ( maxPrecision !== precision ) {

		console.warn( 'THREE.WebGLRenderer:', precision, 'not supported, using', maxPrecision, 'instead.' );
		precision = maxPrecision;

	}

	const drawBuffers = isWebGL2 || extensions.has( 'WEBGL_draw_buffers' );

	const logarithmicDepthBuffer = parameters.logarithmicDepthBuffer === true;

	const maxTextures = gl.getParameter( gl.MAX_TEXTURE_IMAGE_UNITS );
	const maxVertexTextures = gl.getParameter( gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS );
	const maxTextureSize = gl.getParameter( gl.MAX_TEXTURE_SIZE );
	const maxCubemapSize = gl.getParameter( gl.MAX_CUBE_MAP_TEXTURE_SIZE );

	const maxAttributes = gl.getParameter( gl.MAX_VERTEX_ATTRIBS );
	const maxVertexUniforms = gl.getParameter( gl.MAX_VERTEX_UNIFORM_VECTORS );
	const maxVaryings = gl.getParameter( gl.MAX_VARYING_VECTORS );
	const maxFragmentUniforms = gl.getParameter( gl.MAX_FRAGMENT_UNIFORM_VECTORS );

	const vertexTextures = maxVertexTextures > 0;
	const floatFragmentTextures = isWebGL2 || extensions.has( 'OES_texture_float' );
	const floatVertexTextures = vertexTextures && floatFragmentTextures;

	const maxSamples = isWebGL2 ? gl.getParameter( gl.MAX_SAMPLES ) : 0;

	return {
		isWebGL2, 
		drawBuffers, 
		getMaxAnisotropy, 
		getMaxPrecision, 
		precision, 
		logarithmicDepthBuffer, 
		maxTextures, 
		maxVertexTextures, 
		maxTextureSize, 
		maxCubemapSize, 
		maxAttributes, 
		maxVertexUniforms, 
		maxVaryings, 
		maxFragmentUniforms, 
		vertexTextures, 
		floatFragmentTextures, 
		floatVertexTextures, 
		maxSamples, 
	};

}


export { WebGLCapabilities, ICapabilities };
