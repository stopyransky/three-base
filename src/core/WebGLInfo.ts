
export interface IWebGLInfo {
	memory: {
		geometries: number;
		textures: number;
		activeUniforms: number;
	},
	render: {
		fps: number;
		frame: number;
		calls: number;
		triangles: number;
		points: number;
		lines: number;
		uniformCalls: number;
	},
		programs: any[]; // change to type
		autoReset: boolean;
		reset: () => void;
		update: (count: number, mode: number, instanceCount: number) => void;
		updateUniforms: (type?: string, value?: any) => void;
}

function WebGLInfo( gl: WebGL2RenderingContext ): IWebGLInfo {

	const memory = {
		geometries: 0,
		textures: 0,
		activeUniforms: 0,
	};

	const render = {
		fps: 0,
		frame: 0,
		calls: 0,
		triangles: 0,
		points: 0,
		lines: 0,
		uniformCalls: 0,
	};




	function update( count, mode, instanceCount ) {

		render.calls ++;

		switch ( mode ) {

			case gl.TRIANGLES:
				render.triangles += instanceCount * ( count / 3 );
				break;

			case gl.LINES:
				render.lines += instanceCount * ( count / 2 );
				break;

			case gl.LINE_STRIP:
				render.lines += instanceCount * ( count - 1 );
				break;

			case gl.LINE_LOOP:
				render.lines += instanceCount * count;
				break;

			case gl.POINTS:
				render.points += instanceCount * count;
				break;

			default:
				console.error( 'THREE.WebGLInfo: Unknown draw mode:', mode );
				break;

		}

	}

	function updateUniforms(type?, count?) {
		render.uniformCalls++;
	}

	let pTime = 0, pFrames = 0;
	// every frame is being reset
	function reset() {

		const now = performance.now();

		render.frame ++;
		
		if(now - 1000 > pTime) {
			// render.fps = 
			render.fps = render.frame - pFrames;
			pFrames = render.frame;
			pTime = now;
		}

		
		render.calls = 0;
		render.triangles = 0;
		render.points = 0;
		render.lines = 0;
		render.uniformCalls = 0;

	}

	return {
		memory: memory,
		render: render,
		programs: null,
		autoReset: true,
		reset: reset,
		update: update,
		updateUniforms,
	};

}


export default WebGLInfo;