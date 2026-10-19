import * as THREE from '../lib/three/three.module.js';

export function buildDreamMeadow(heightAt,excluded,{dense=true}={}) {
 let seed=19387;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};
 const p=[],roots=[],heights=[],colors=[],phases=[],flowerP=[],flowerC=[];
 const blade=(x,z,height,width,angle,tint)=>{
  const base=heightAt(x,z)+.04,phase=rand()*6.28;
  const levels=[0,.38,.73,1];
  const corners=[];
  for(let j=0;j<4;j++)for(const sign of [-1,1]) {
   const t=levels[j],w=width*(1-t)*sign;
   corners.push([x+Math.cos(angle)*w+Math.sin(angle)*t*t*height*.18,base+height*t,z+Math.sin(angle)*w]);
  }
  for(let j=0;j<3;j++)for(const k of [j*2,j*2+1,j*2+2,j*2+1,j*2+3,j*2+2]){
   p.push(...corners[k]);roots.push(x,z);heights.push(levels[Math.floor(k/2)]);phases.push(phase);colors.push(...tint);
  }
 };
 const count=dense?15000:8500;
 for(let i=0;i<count;i++){
  const near=i<count*.7;
  const x=(rand()-.5)*(near?115:340),z=near?-90+rand()*210:-300+rand()*370;
  if(excluded(x,z))continue;
  if(z>-85&&z<112&&(Math.abs(x-Math.sin(z*.095)*2.5)<3.15||Math.abs(x-(8+Math.sin(z*.09+.8)*2.3))<2.6))continue;
  const patch=Math.sin(x*.22+Math.sin(z*.09))*Math.cos(z*.16-x*.07);
  if(patch<-.28)continue;
  const h=.45+rand()*1.05+Math.max(0,patch)*.5;
  const tint=[.075+rand()*.035,.23+rand()*.13,.15+rand()*.07];
  blade(x,z,h,.045+rand()*.045,rand()*6.28,tint);
  if(rand()<.026&&z>-110){
   const y=heightAt(x,z)+.35+rand()*.45,rose=rand()<.35;
   for(let petal=0;petal<5;petal++)for(let dot=0;dot<5;dot++){
    const a=petal*6.283/5+(rand()-.5)*.6,r=.09+rand()*.17;
    flowerP.push(x+Math.cos(a)*r,y+rand()*.09,z+Math.sin(a)*r);
    flowerC.push(...(rose?[.62,.35,.58]:[.78,.75,.49]));
   }
   flowerP.push(x,y+.04,z);flowerC.push(.95,.64,.22);
  }
 }
 const geometry=new THREE.BufferGeometry();
 for(const[name,values,size]of[['position',p,3],['aRoot',roots,2],['aHeight',heights,1],['aPhase',phases,1],['color',colors,3]])geometry.setAttribute(name,new THREE.Float32BufferAttribute(values,size));
 geometry.computeBoundingSphere();
 const material=new THREE.ShaderMaterial({side:THREE.DoubleSide,vertexColors:true,uniforms:{uTime:{value:0},uDim:{value:0},uMotion:{value:1},uWindAlpha:{value:0},uWind:{value:new THREE.Vector3(10000,0,10000)}},
 vertexShader:`attribute vec2 aRoot;attribute float aHeight,aPhase;varying vec3 vColor;varying float vHeight,vDepth,vSeed;uniform float uTime,uMotion;uniform vec3 uWind;uniform float uWindAlpha;
 void main(){vec3 p=position;float t=uTime*.8;float wind=sin(aRoot.x*.11+aRoot.y*.085-t)+sin(aRoot.y*.19-t*1.3+aPhase)*.28;
 float nearby=exp(-distance(aRoot,uWind.xz)*.18)*uWindAlpha;p.x+=(wind*.25+nearby*.8)*aHeight*aHeight*uMotion;p.z+=cos(t*.7+aPhase)*.09*aHeight*uMotion;
 vec4 mv=modelViewMatrix*vec4(p,1.);vDepth=-mv.z;vHeight=aHeight;vSeed=aPhase;
 vColor=mix(color*.9,color*1.25+vec3(.025,.04,.025),pow(aHeight,2.5));gl_Position=projectionMatrix*mv;}`,
 fragmentShader:`varying vec3 vColor;varying float vHeight,vDepth,vSeed;uniform float uDim;
 void main(){float grain=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233))+vSeed)*43758.5453);if(grain<.10+vHeight*.08)discard;
 vec3 c=vColor*exp(-max(0.,vDepth-70.)*.0025)*(1.-uDim);gl_FragColor=vec4(c,1.);
 #include <colorspace_fragment>
 }`});
 const group=new THREE.Group();group.name='夜风草原·草丛与野花';group.add(new THREE.Mesh(geometry,material));
 const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.Float32BufferAttribute(flowerP,3));fg.setAttribute('color',new THREE.Float32BufferAttribute(flowerC,3));
 const fm=new THREE.PointsMaterial({vertexColors:true,size:.14,transparent:true,opacity:.85,depthWrite:false});group.add(new THREE.Points(fg,fm));
 const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion:reduce)').matches;material.uniforms.uMotion.value=reduced?0:1;
 let windStamp=-100;
 return {group,update(time,dim=0){material.uniforms.uWindAlpha.value=Math.exp(-Math.max(0,performance.now()*.001-windStamp)*1.7);material.uniforms.uTime.value=time;material.uniforms.uDim.value=dim;fm.opacity=.85*(1-dim);},windAt(point){material.uniforms.uWind.value.copy(point);windStamp=performance.now()*.001;},bladeCount:p.length/54,flowerPoints:flowerP.length/3};
}
