import { Color } from '../math/Color';
import { Object3D } from './Object3D';

class Scene extends Object3D {
	isScene = true;
	type = 'Scene';

	background: Color;
	environment: any;
	fog: any;
	overrideMaterial: any;
	autoUpdate: boolean;
	matrixAutoUpdate: boolean;
	
	constructor() {

		super();

		// this.type = 'Scene';

		this.background = null;
		this.environment = null;
		this.fog = null;

		this.overrideMaterial = null;

		this.autoUpdate = true; // checked by the renderer

		// if ( typeof __THREE_DEVTOOLS__ !== 'undefined' ) {

		// 	__THREE_DEVTOOLS__.dispatchEvent( new CustomEvent( 'observe', { detail: this } ) ); // eslint-disable-line no-undef

		// }

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		if ( source.background !== null ) this.background = source.background.clone();
		if ( source.environment !== null ) this.environment = source.environment.clone();
		if ( source.fog !== null ) this.fog = source.fog.clone();

		if ( source.overrideMaterial !== null ) this.overrideMaterial = source.overrideMaterial.clone();

		this.autoUpdate = source.autoUpdate;
		this.matrixAutoUpdate = source.matrixAutoUpdate;

		return this;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		if ( this.background !== null ) data.object.background = this.background.toJSON( meta );
		if ( this.environment !== null ) data.object.environment = this.environment.toJSON( meta );
		if ( this.fog !== null ) data.object.fog = this.fog.toJSON();

		return data;

	}

}


export { Scene };
