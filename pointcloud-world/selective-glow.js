import * as THREE from '../lib/three/three.module.js';

// Only layer 1 enters the glow/history buffer; terrain, stars and UI never bloom.
// Bounded resolution and two blur directions keep the effect independent of
// particle count on the CPU. A short history leaves a faint, rapidly decaying wake.
export function createSelectiveGlow(renderer,scene,camera) {
  const screen=new THREE.Scene(),ortho=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2));quad.frustumCulled=false;screen.add(quad);
  const targets=Array.from({length:5},()=>new THREE.WebGLRenderTarget(4,4,{depthBuffer:true,stencilBuffer:false}));
  const [mask,blurX,blurY,historyA,historyB]=targets;
  const vertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
  const historyMaterial=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,
    uniforms:{uCurrent:{value:null},uPrevious:{value:null},uHistory:{value:0}},vertexShader:vertex,
    fragmentShader:`varying vec2 vUv;uniform sampler2D uCurrent,uPrevious;uniform float uHistory;
      void main(){vec3 c=texture2D(uCurrent,vUv).rgb,p=texture2D(uPrevious,vUv).rgb;gl_FragColor=vec4(max(c,p*uHistory),1.);}`});
  const blurMaterial=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,
    uniforms:{uSource:{value:null},uStep:{value:new THREE.Vector2()}},vertexShader:vertex,
    fragmentShader:`varying vec2 vUv;uniform sampler2D uSource;uniform vec2 uStep;
      void main(){vec3 c=texture2D(uSource,vUv).rgb*.32;
      c+=(texture2D(uSource,vUv+uStep*1.4).rgb+texture2D(uSource,vUv-uStep*1.4).rgb)*.235;
      c+=(texture2D(uSource,vUv+uStep*3.2).rgb+texture2D(uSource,vUv-uStep*3.2).rgb)*.105;
      gl_FragColor=vec4(c,1.);}`});
  const composite=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,transparent:true,
    blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneFactor,
    uniforms:{uSource:{value:null},uStrength:{value:.65}},vertexShader:vertex,
    fragmentShader:`varying vec2 vUv;uniform sampler2D uSource;uniform float uStrength;
      void main(){gl_FragColor=vec4(min(texture2D(uSource,vUv).rgb,vec3(.8))*uStrength,0.);

      }`});
  let width=0,height=0,previous=historyA,next=historyB,hasHistory=false;
  const dimensions=new THREE.Vector2(),oldClear=new THREE.Color();
  const api={enabled:true,strength:.65,trail:.26,
    render(){
      if(!api.enabled){hasHistory=false;renderer.render(scene,camera);return;}
      renderer.getDrawingBufferSize(dimensions);
      const w=Math.max(4,Math.min(768,Math.round(dimensions.x*.4))),h=Math.max(4,Math.min(540,Math.round(dimensions.y*.4)));
      if(w!==width||h!==height){width=w;height=h;targets.forEach(t=>t.setSize(w,h));hasHistory=false;}
      const oldTarget=renderer.getRenderTarget(),oldAuto=renderer.autoClear,oldLayers=camera.layers.mask,oldBackground=scene.background;
      renderer.getClearColor(oldClear);const oldAlpha=renderer.getClearAlpha();
      let failed=false;
      try {
        renderer.autoClear=true;renderer.setRenderTarget(oldTarget);renderer.render(scene,camera);
        scene.background=null;camera.layers.set(1);renderer.setClearColor(0x000000,0);
        renderer.setRenderTarget(mask);renderer.clear();renderer.render(scene,camera);
        scene.background=oldBackground;camera.layers.mask=oldLayers;
        quad.material=historyMaterial;historyMaterial.uniforms.uCurrent.value=mask.texture;historyMaterial.uniforms.uPrevious.value=previous.texture;
        historyMaterial.uniforms.uHistory.value=hasHistory?api.trail:0;
        renderer.setRenderTarget(next);renderer.render(screen,ortho);hasHistory=true;
        [previous,next]=[next,previous];
        quad.material=blurMaterial;blurMaterial.uniforms.uSource.value=previous.texture;blurMaterial.uniforms.uStep.value.set(1/width,0);
        renderer.setRenderTarget(blurX);renderer.render(screen,ortho);
        blurMaterial.uniforms.uSource.value=blurX.texture;blurMaterial.uniforms.uStep.value.set(0,1/height);
        renderer.setRenderTarget(blurY);renderer.render(screen,ortho);
        quad.material=composite;composite.uniforms.uSource.value=blurY.texture;composite.uniforms.uStrength.value=api.strength;
        renderer.setRenderTarget(oldTarget);renderer.autoClear=false;renderer.render(screen,ortho);
      } catch(error) {
        api.enabled=false;failed=true;console.warn('局部柔光暂不可用，保留基础点云。',error);
      } finally {
        scene.background=oldBackground;camera.layers.mask=oldLayers;
        renderer.setClearColor(oldClear,oldAlpha);renderer.autoClear=oldAuto;renderer.setRenderTarget(oldTarget);
      }
      if(failed)renderer.render(scene,camera);
    },
    reset(){hasHistory=false;},
    dispose(){targets.forEach(t=>t.dispose());quad.geometry.dispose();historyMaterial.dispose();blurMaterial.dispose();composite.dispose();}
  };
  return api;
}
