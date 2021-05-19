
interface IPropertiesCache {
	
		get: (object: any) => any;
		remove: (object: any) => void,
		update: (object: any, key: string, value: any) => void,
		dispose: () => void
	
}

function PropertiesCache(): IPropertiesCache {

	let properties = new WeakMap();

	function get( object: any ) {

		let map = properties.get( object );

		if ( map === undefined ) {

			map = {};
			properties.set( object, map );

		}

		return map;

	}

	function remove( object ) {

		properties.delete( object );

	}

	function update( object, key, value ) {

		properties.get( object )[ key ] = value;

	}

	function dispose() {

		properties = new WeakMap();

	}

	return {
		get: get,
		remove: remove,
		update: update,
		dispose: dispose
	};

}


export { PropertiesCache, IPropertiesCache };
