import { ShaderChunk } from './ShaderChunk';
import { UniformsLib } from './UniformsLib';
import { mergeUniforms } from '../shaders/UniformsUtils';
// import { Color } from '../../math/Color';
// import { Vector2 } from '../../math/Vector2';
// import { Vector3 } from '../../math/Vector3';
// import { Matrix3 } from '../../math/Matrix3';

const ShaderLib = {

	basic: {

		uniforms: mergeUniforms( [
			UniformsLib.common,
			UniformsLib.specularmap,
			UniformsLib.envmap,
			UniformsLib.aomap,
			UniformsLib.lightmap,
			UniformsLib.fog
		] ),

		vertexShader: ShaderChunk.meshbasic_vert,
		fragmentShader: ShaderChunk.meshbasic_frag

  },
}

export { ShaderLib }