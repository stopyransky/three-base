import { Geometry } from "../Mesh";


export default function makeTetrahedron(side = Math.sqrt(3), rad = 0): Geometry {
    const R = side / Math.sqrt(3);
    const tau = 2.0 * Math.PI;
    const deg120 = tau/3;
    const deg240 = 2 * deg120;
    
    const positions = [
      R * Math.cos(rad + deg120), 0.0, R * Math.sin(rad + deg120), // 0 red
      R * Math.cos(rad + deg240), 0.0, R * Math.sin(rad + deg240), // 1 yellow
      R * Math.cos(rad), 0, R * Math.sin(rad), // 2 green
      0.0, R , 0.0, // 3 blue
    ];

    const colors = [
      1.0, 0.0, 0.0,  // 0
      1.0, 1.0, 0.0,  // 1
      0.0, 1.0, 0.0,  // 2
      0.0, 0.0, 1.0,  // 3
    ];



    const indices = [
      2, 3, 1,
      0, 2, 1,
      0, 3, 2,
      3, 0, 1
    ];


    return {
      attributeNames: ['aPosition', 'aColor'],
      index: indices,
      count: 12,
      mode: 'TRIANGLES',
      aPosition: positions,
      aColor: colors,
      attributes: {
        positions,
        colors
      }
    };
  }
