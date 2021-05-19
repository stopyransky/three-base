const stats = document.createElement('pre');
stats.setAttribute('id', 'stats')
stats.style.margin = '0px';
stats.style['white-space'] = 'pre-line';
stats.style['line-height'] = '1rem';
stats.style['user-select'] = 'none';
stats.style.padding = '0px 16px';
stats.style.position = 'absolute';
stats.style.left = '0px';
stats.style.top = '0px';
// stats.style.height = '150px';
stats.style.width = '180px';
stats.style['font-size'] = '12px';
stats.style.color = 'white';
// stats.style['background-color'] = 'rgba(100, 100, 100, 0.2)';

function Stats() {
  if(!document.getElementById('stats')) {


    document.body.appendChild(stats);
  }
  
  const infoEl = document.createElement('div');
  stats.appendChild(infoEl);
  const profilerEl = document.createElement('div');
  stats.appendChild(profilerEl);

  return {
    update: function (info) {
      const memory = Math.round(window.performance.memory.usedJSHeapSize / (1 << 20));
      //<span>programs: </span><span>${info.programs.length}</span>
        // <span>frame: </span><span>${info.render.frame}</span>

      infoEl.innerHTML = `
        <span>memory: </span><span>${memory} (mb)</span>
        <span>active uniforms: </span><span>${info.memory.activeUniforms}</span>
        <span>uniform calls: </span><span>${info.render.uniformCalls}</span>
        <span>fps: </span><span>${info.render.fps}</span>
        <span>draw calls: </span><span>${info.render.calls}</span>
        <span>triangles: </span><span>${info.render.triangles}</span>
        <span>points: </span><span>${info.render.points}</span>
        <span>lines: </span><span>${info.render.lines}</span>
        <span>geometries: </span><span>${info.memory.geometries}</span>
        <span>textures: </span><span>${info.memory.textures}</span>
        <span>programs: </span><span>${info.programs}</span>
        
      `;
    },
    updateProfiler: function(logger) {
        // <span>triangles: </span><span>${logger.render.triangles}</span>
        // <span>points: </span><span>${logger.render.points}</span>
        // <span>geometries: </span><span>${logger.memory.geometries}</span>
        // <span>textures: </span><span>${logger.memory.textures}</span>
        // console.log(logger)
      profilerEl.innerHTML = `
        <span>cpu (%): </span><span>${logger.cpu}</span>
        <span>gpu (ms): </span><span>${logger.gpu.toFixed(2)}</span>
        <span>mem (mb): </span><span>${logger.mem}</span>
        <span>fps: </span><span>${logger.fps}</span>

        
      `;
    },
    dispose: function() {
      document.body.removeChild(stats)
    }

  }


}


export default Stats;