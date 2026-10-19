import * as THREE from '../lib/three/three.module.js';

// A soft, transmissive surface cloud: luminosity follows the silhouette and
// painted accents, while the rest of the surface remains individually readable.
// Particle movement is evaluated on the GPU from stable rest positions.
export function makeLuminousSurface(positions, colors, normals, sizes, scale=3) {
  const count=positions.length/3;
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geometry.setAttribute('aNormal',new THREE.Float32BufferAttribute(normals,3));
  geometry.setAttribute('aSize',new THREE.Float32BufferAttribute(sizes,1));
  const seeds=new Float32Array(count);
  for(let i=0;i<count;i++)seeds[i]=((Math.imul(i+1,1597334677)>>>0)%65521)/65521;
  geometry.setAttribute('aSeed',new THREE.BufferAttribute(seeds,1));
  const material=new THREE.ShaderMaterial({
    vertexColors:true,transparent:true,depthTest:true,depthWrite:false,
    blending:THREE.NormalBlending,toneMapped:false,
    uniforms:{
      uTime:{value:0},uViewport:{value:450},uScale:{value:scale},
      uFlow:{value:1},uGlow:{value:.85},uScatter:{value:0},uLegacy:{value:0},
      uMotion:{value:1},uPaused:{value:0},opacity:{value:1},
      uMode:{value:0},uSpeed:{value:1},uDensity:{value:1},uSize:{value:1},
      uBrightness:{value:1},uSurfaceFill:{value:1},uColorRetention:{value:0},uCore:{value:0},uRim:{value:1},uTint:{value:new THREE.Color('#f094b8')},uTintMix:{value:0}
    },
    vertexShader:`
      attribute vec3 aNormal;
      attribute float aSeed;
      attribute float aSize;
      uniform float uTime,uViewport,uScale,uFlow,uScatter,uMotion,uLegacy;
      uniform float uMode,uSpeed,uDensity,uSize,uBrightness,uRim,uTintMix,uSurfaceFill,uColorRetention;
      uniform vec3 uTint;
      varying vec3 vColor;
      varying float vAlpha,vRim,vSeed;
      vec3 flow(vec3 p,float t) {
        return vec3(sin(p.y*.83+t)*cos(p.z*.61-t*.31),
          sin(p.z*.73+t*.51)*cos(p.x*.54+t*.23),
          sin(p.x*.67-t*.42)*cos(p.y*.72+t*.34));
      }
      void main() {
        float time=uTime*uSpeed;
        float t=time*.37;
        float breath=sin(uTime*.72+position.y*.24)*.012*uMotion;
        vec3 displacement=flow(position,t)*(.026*uFlow*uMotion);
        float mote=step(.958,aSeed);
        float lift=pow(max(0.,sin(t*.7+aSeed*94.)),4.)*mote;
        vec3 p=position+aNormal*(breath+lift*.18*uFlow*uMotion)+displacement;
        p+=flow(position*.37,aSeed*12.+t*.22)*uScatter*(.5+aSeed*2.2);
        float modeAlpha=1.;
        if(uMode>1.5&&uMode<2.5)p+=flow(position*.4,t)*.13*uFlow*uMotion;
        if(uMode>2.5&&uMode<3.5) {
          p+=flow(position*.7,t)*.08*uFlow*uMotion;
          modeAlpha=.5+.5*pow(sin(position.y*.9-t*2.+aSeed)*.5+.5,2.);
        }
        if(uMode>3.5&&uMode<4.5)p+=aNormal*sin(position.y*.7-time*.9)*.075*uFlow*uMotion;
        if(uMode>4.5&&uMode<5.5)modeAlpha=.20+.80*exp(-pow((position.y-mod(time*1.1,25.))*.43,2.));
        if(uMode>5.5&&uMode<6.5) {
          float ember=pow(sin(t+aSeed*50.)*.5+.5,4.)*mote;
          p+=vec3(.1,1.,.15)*ember*uFlow*uMotion;
          modeAlpha=.7+ember*.3;
        }
        if(uMode>6.5&&uMode<7.5)p+=flow(position*.25,t)*.22*uFlow*uMotion;
        if(uMode>7.5&&uMode<8.5)p+=aNormal*sin(position.y*.8-t+position.x*.25)*.09*uFlow*uMotion;
        if(uMode>8.5) {
          float cycle=pow(sin(time*.16)*.5+.5,6.);
          p+=flow(position*.3,aSeed*6.+t)*cycle*.8*uFlow*uMotion;
          modeAlpha=1.-cycle*.32;
        }
        vec4 world=modelMatrix*vec4(p,1.);
        vec3 n=normalize(mat3(modelMatrix)*aNormal);
        vec3 view=normalize(cameraPosition-world.xyz);
        float facing=dot(n,view);
        vRim=pow(max(0.,1.-abs(facing)),2.8)*uRim;
        float light=max(max(color.r,color.g),color.b);
        float accent=smoothstep(.35,.85,min(color.r,color.g));
        float pulse=.9+.1*sin(uTime*.72+position.y*.24);
        vec3 chroma=color/max(light,.0001);
        // Warm ivory accents and the original jade/vermilion remain distinguishable.
        vColor=mix(chroma,sqrt(max(color,vec3(0.))),.25);
        vColor=mix(vColor,uTint/max(max(uTint.r,uTint.g),uTint.b),uTintMix);
        vColor=mix(vColor,vec3(1.,.95,.92),min(.48,vRim*.25+accent*.1));
        float key=max(dot(n,normalize(vec3(-.5,.8,.9))),0.);
        vColor=mix(vColor,color*(.42+key*.7+vRim*.12),uColorRetention);
        vColor*=uBrightness*(.76+accent*.22+vRim*.48);
        float visibility=mix(.19,.48,smoothstep(-.25,.65,facing));
        vAlpha=(visibility+vRim*.43+accent*.16)*pulse*(.63+.37*aSeed);
        vAlpha*=smoothstep(.008,.10,light);
        vAlpha*=modeAlpha*step(aSeed,uDensity)*uSurfaceFill;
        if(uMode>.5&&uMode<1.5)vAlpha*=.24+vRim*.9;
        vSeed=aSeed;
        vec4 mv=viewMatrix*world;gl_Position=projectionMatrix*mv;
        float projected=.11*uScale*uViewport/max(1.,-mv.z);
        gl_PointSize=clamp(projected*(.75+aSize*.55)*(1.+vRim*.3)*uSize,2.1,5.0);
        if(uLegacy>.5) {
          float key=max(dot(n,normalize(vec3(-.5,.8,.9))),0.);
          vColor=color*(.25+key*.78);vAlpha=1.;
          gl_PointSize=clamp(.12*uScale*aSize*uViewport/max(1.,-mv.z),1.15,10.);
        }
      }`,
    fragmentShader:`
      uniform float opacity,uGlow,uLegacy,uCore;
      varying vec3 vColor;
      varying float vAlpha,vRim,vSeed;
      void main() {
        float r=length(gl_PointCoord-.5)*2.;
        if(r>1.)discard;
        float core=exp(-r*r*12.);
        float halo=exp(-r*r*4.8)*.10*uGlow;
        float coverage=mix(core+halo,1.-smoothstep(.55,.98,r),uCore);
        float alpha=coverage*mix(vAlpha,.92,uCore)*opacity;
        if(uLegacy>.5) { alpha=opacity; }
        if(alpha<.035)discard;
        gl_FragColor=vec4(vColor*(1.+vRim*.20),alpha);
        #include <colorspace_fragment>
      }`
  });
  const points=new THREE.Points(geometry,material);
  const viewport=new THREE.Vector2();
  const reduced=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion:reduce)'):null;
  let previous=performance.now()*.001,elapsed=0;
  points.onBeforeRender=renderer=>{
    renderer.getDrawingBufferSize(viewport);
    material.uniforms.uViewport.value=viewport.y*.5;
    const now=performance.now()*.001;
    if(!material.uniforms.uPaused.value&&!reduced?.matches)elapsed+=Math.min(.06,now-previous);
    previous=now;
    material.uniforms.uTime.value=elapsed;
    material.uniforms.uMotion.value=reduced?.matches?0:1;
    material.uniforms.opacity.value=material.opacity;
  };
  points.layers.enable(1);
  points.frustumCulled=false;
  points.userData.luminousSurface=true;
  return points;
}

export function setLuminousStyle(root,{legacy=false,flow=1,glow=.85,scatter=0}={}) {
  root.traverse(object=>{
    if(!object.userData.luminousSurface)return;
    const {material}=object;
    material.uniforms.uLegacy.value=Number(legacy);
    material.uniforms.uFlow.value=flow;
    material.uniforms.uGlow.value=glow;
    material.uniforms.uScatter.value=scatter;
    material.transparent=!legacy;
    material.depthWrite=legacy;
    material.blending=legacy?THREE.NormalBlending:THREE.AdditiveBlending;
    material.needsUpdate=true;
  });
}

export function applyLuminousPreset(root,preset) {
  root.traverse(object=>{
    if(!object.userData.luminousSurface)return;
    const u=object.material.uniforms;
    for(const [key,value] of Object.entries({uMode:preset.mode,uSpeed:preset.speed,
      uDensity:preset.density,uSize:preset.size,uBrightness:preset.brightness,
      uRim:preset.rim,uGlow:preset.glow,uFlow:preset.flow,uTintMix:preset.tintMix})) {
      if(Number.isFinite(value))u[key].value=value;
    }
    if(preset.tint)u.uTint.value.set(preset.tint);
  });
}
