// import { GLSL3 } from '../co/nstants';
import { ShaderMaterial } from './ShaderMaterial';

class RawShaderMaterial extends ShaderMaterial {
  isRawShaderMaterial = true;
  

	constructor( parameters ) {

    super( parameters );
    // this.glslVersion = GLSL3;
    this.type = 'RawShaderMaterial';
	}

}

export { RawShaderMaterial };
