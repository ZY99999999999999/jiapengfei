import * as THREE from '../lib/three/three.module.js';

// Surface-anchored luminous samples. Stable geometry and a bounded analytic flow
// retain the landscape while lighting and grazing-angle highlights reveal relief.
export function buildTDLandscape(positions, colors, zones, heightAt, {dense=true}={}) {
 const p=[],c=[],n=[],seeds=[],kinds=[];
 const limit=dense?65000:32000;
 for(let i=0;i<zones.length&&seeds.length<limit;i++) {
  const zone=zones[i];if(zone!==0&&zone!==1)continue;
  const x=positions[i*3],y=positions[i*3+1],z=positions[i*3+2];
  const ground=heightAt(x,z),cliff=y-ground>1.8;
  // Sample all distant relief; thin the already dense foreground meadow.
  if(!cliff&&z>-85&&i%3!==0)continue;
  let nx,ny,nz;
  if(cliff){nx=z<-315?0:-Math.sign(x);ny=.18;nz=z<-315?1:0;}
  else {nx=-(heightAt(x+.55,z)-heightAt(x-.55,z))/1.1;ny=1;nz=-(heightAt(x,z+.55)-heightAt(x,z-.55))/1.1;}
  const length=Math.hypot(nx,ny,nz)||1;
  p.push(x,y+.035,z);n.push(nx/length,ny/length,nz/length);
  const source=colors.slice(i*3,i*3+3),peak=Math.max(...source,.001);
  const tint=cliff?[1,.64,.35]:zone===1?[.36,.72,.57]:[.65,.73,.78];
  for(let k=0;k<3;k++)c.push(source[k]/peak*.25+tint[k]*.75);
  seeds.push(((Math.imul(i+1,1597334677)>>>0)%65521)/65521);kinds.push(cliff?1:zone===1?2:0);
 }
 const geometry=new THREE.BufferGeometry();
 for(const [name,values,size] of [['position',p,3],['color',c,3],['aSurfaceNormal',n,3],['aSeed',seeds,1],['aKind',kinds,1]])geometry.setAttribute(name,new THREE.Float32BufferAttribute(values,size));
 geometry.computeBoundingSphere();
 const material=new THREE.ShaderMaterial({transparent:true,depthTest:true,depthWrite:false,vertexColors:true,blending:THREE.AdditiveBlending,
  uniforms:{uTime:{value:0},uPixelRatio:{value:1},uDim:{value:0},uMotion:{value:1}},
  vertexShader:`attribute vec3 aSurfaceNormal;attribute float aSeed,aKind;
   uniform float uTime,uPixelRatio,uMotion;varying vec3 vColor;varying float vAlpha,vHalo;
   void main(){
    vec3 n=normalize(aSurfaceNormal);float t=uTime*.17;
    vec3 tangent=normalize(cross(n,vec3(.17,.13,1.)));
    float wave=sin(position.x*.11+position.z*.08-t)*cos(position.y*.23+t*.7);
    vec3 p=position+tangent*wave*.09*uMotion+n*sin(t+position.z*.12)*.025*uMotion;
    vec4 world=modelMatrix*vec4(p,1.);vec3 eye=normalize(cameraPosition-world.xyz);
    float rim=pow(1.-abs(dot(n,eye)),2.5);
    float key=max(0.,dot(n,normalize(vec3(-.55,.85,.35))));
    float band=pow(.5+.5*cos(position.y*(aKind<.5?6.5:3.2)+position.z*.045),16.);
    float spark=step(.985,aSeed)*(.65+.35*sin(uTime*.65+aSeed*80.));
    vHalo=.2+rim*.45+band*.4;
    vAlpha=(.10+key*.14+rim*.12+band*.10+spark*.12)*(aKind>1.5?.85:1.);
    vColor=mix(color,vec3(1.,.92,.76),min(.24,band*.14+rim*.1+spark*.1));
    vColor*=.62+key*.25+band*.16;
    vec4 mv=viewMatrix*world;gl_Position=projectionMatrix*mv;
    float distanceFade=exp(-max(0.,-mv.z-60.)*.0017);vAlpha*=distanceFade;
    gl_PointSize=clamp(310./max(15.,-mv.z),1.8,3.8)*uPixelRatio*(.8+aSeed*.35);
   }`,
  fragmentShader:`uniform float uDim;varying vec3 vColor;varying float vAlpha,vHalo;
   void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;
    float core=exp(-r*r*13.);float halo=exp(-r*r*3.8)*.12*vHalo;
    float alpha=(core+halo)*vAlpha*(1.-uDim);if(alpha<.003)discard;
    gl_FragColor=vec4(vColor,alpha);
    #include <colorspace_fragment>
   }`
 });
 const points=new THREE.Points(geometry,material);points.layers.disable(1);
 points.name='TD曲面点云·亮部层';points.userData.pointCount=seeds.length;
 const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion:reduce)').matches;
 material.uniforms.uMotion.value=reduced?0:1;
 points.onBeforeRender=renderer=>{material.uniforms.uPixelRatio.value=Math.min(renderer.getPixelRatio(),1.6);};
 return points;
}
