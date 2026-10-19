import * as THREE from '../lib/three/three.module.js';

// Approved source imagery is the shape/motion authority. This module changes only
// sampling, framing and playback; it never invents limbs, poses or a back surface.
export const REFERENCE_CLIPS={
 '蒙古马':{file:'horse.mp4',start:3.90,end:4.90,crop:[0,0,1,1]},
 '绵羊':{file:'sheep.mp4',start:.16,end:7.80,crop:[0,0,1,1]},
 '蒙古牛':{file:'cow.mp4',start:.12,end:5.78,crop:[0,0,1,1]},
 '山羊':{file:'goat.mp4',start:1.65,end:7.72,crop:[0,0,1,1]},
 '骆驼':{file:'camel.mp4',start:.12,end:2.65,crop:[0,0,1,1]}
};
function grid(width,height){
 const position=[],uv=[];
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const u=(x+.5)/width,v=(y+.5)/height;
  position.push(u-.5,v-.5,0);uv.push(u,v);
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(position,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.computeBoundingSphere();return geometry;
}
function createResource(name,spec){
 const video=document.createElement('video');video.muted=true;video.playsInline=true;video.loop=false;video.preload='auto';
 video.src=new URL('./reference-frames/videos/'+spec.file,import.meta.url).href;
 const texture=new THREE.VideoTexture(video);texture.colorSpace=THREE.NoColorSpace;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;
 const resource={name,spec,video,texture,ready:false,error:null,wanted:false,disposed:false,frameHandle:null,pendingSeek:false,lastFrameTime:-1,frameCount:0,loopCount:0,instances:[]};
 video.addEventListener('error',()=>{resource.error='原视频无法解码';});
 video.addEventListener('loadeddata',()=>{
  resource.pendingSeek=true;
  video.addEventListener('seeked',()=>{resource.ready=true;},{once:true});
  video.currentTime=spec.start;
 });
 video.addEventListener('seeked',()=>{resource.pendingSeek=false;});
 const probe=document.createElement('canvas');probe.width=96;probe.height=54;
 const probeContext=probe.getContext('2d',{willReadFrequently:true});resource.groundRow=.96;let lastProbe=-1;
 const frame=(now,metadata)=>{
  if(resource.disposed)return;
  if(metadata.mediaTime-lastProbe>.18||metadata.mediaTime<lastProbe){
   lastProbe=metadata.mediaTime;
   try{const [x,y,w,h]=spec.crop;probeContext.drawImage(video,x*video.videoWidth,y*video.videoHeight,w*video.videoWidth,h*video.videoHeight,0,0,96,54);
    const pixels=probeContext.getImageData(0,0,96,54).data;let bottom=0;
    for(let row=0;row<54;row++)for(let col=0;col<96;col++){const i=(row*96+col)*4;if(Math.max(pixels[i],pixels[i+1],pixels[i+2])>38)bottom=Math.max(bottom,row);}
    if(bottom>5)resource.groundRow=Math.min(1,(bottom+1)/54);
   }catch{}
  }
  resource.frameCount++;resource.lastFrameTime=metadata.mediaTime;
  if(video.currentTime>=spec.end&&!resource.pendingSeek){resource.pendingSeek=true;video.currentTime=spec.start;resource.loopCount++;}
  resource.frameHandle=video.requestVideoFrameCallback(frame);
 };
 if(video.requestVideoFrameCallback)resource.frameHandle=video.requestVideoFrameCallback(frame);
 return resource;
}
export function createReferenceAnimalMotion(forms,{dense=true}={}){
 const geometryHigh=grid(dense?320:256,dense?180:144),geometryMid=grid(192,108),geometryLow=grid(96,54);
 const resources=new Map(),instances=new Map(),size=new THREE.Vector2();let focused=null,focusedPlaying=false;
 const viewProjection=new THREE.Matrix4(),frustum=new THREE.Frustum(),bounds=new THREE.Sphere(),centre=new THREE.Vector3();
 for(const form of forms){
  if(!form.userData.animal)continue;
  const source=form.userData.ambientPlacement?form.name.includes('绵羊')?'绵羊':form.name.includes('蒙古马')?'蒙古马':form.name.includes('蒙古牛')?'蒙古牛':form.name.includes('山羊')?'山羊':'骆驼':form.name;
  const spec=REFERENCE_CLIPS[source];if(!spec)continue;
  let resource=resources.get(source);if(!resource){resource=createResource(source,spec);resources.set(source,resource);}
  const width=form.userData.width/form.scale.x;
  const frameRatio=(16*spec.crop[2])/(9*spec.crop[3]),height=width/frameRatio;
  const material=new THREE.ShaderMaterial({transparent:true,depthTest:true,depthWrite:false,blending:THREE.NormalBlending,toneMapped:false,
   uniforms:{uFrame:{value:resource.texture},uCrop:{value:new THREE.Vector4(...spec.crop)},uWidth:{value:width},uHeight:{value:height},uViewport:{value:600},uColumns:{value:dense?320:256}},
   vertexShader:`uniform sampler2D uFrame;uniform vec4 uCrop;uniform float uWidth,uHeight,uViewport,uColumns;varying vec3 vColor;varying float vAlpha;
    vec3 toLinear(vec3 c){return mix(pow((c+.055)/1.055,vec3(2.4)),c/12.92,step(c,vec3(.04045)));}
    void main(){vec2 sampleUV=vec2(uCrop.x+uv.x*uCrop.z,1.-uCrop.y-uCrop.w+uv.y*uCrop.w);
     vec3 rgb=texture2D(uFrame,sampleUV).rgb;float light=max(max(rgb.r,rgb.g),rgb.b);
     vAlpha=smoothstep(.035,.11,light);vColor=toLinear(rgb);
     vec3 p=vec3(position.x*uWidth,position.y*uHeight,.03);
     vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
     float worldScale=length(modelMatrix[0].xyz);float projected=uWidth/uColumns*worldScale*uViewport*projectionMatrix[1][1]/max(1.,-mv.z);
     gl_PointSize=clamp(projected*1.65,.8,3.5);
    }`,
   fragmentShader:`varying vec3 vColor;varying float vAlpha;void main(){if(vAlpha<.04)discard;float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;
    float soft=1.-smoothstep(.55,1.,r);gl_FragColor=vec4(vColor,soft*vAlpha);
    #include <colorspace_fragment>
   }`
  });
  const points=new THREE.Points(geometryHigh,material);points.frustumCulled=false;points.name='原视频逐帧粒子 · '+source;points.visible=false;
  points.onBeforeRender=renderer=>{renderer.getDrawingBufferSize(size);material.uniforms.uViewport.value=size.y*.5;};
  form.add(points);form.userData.referenceVideo=true;form.userData.referenceSource=source;form.userData.referencePaused=false;
  const instance={form,points,resource,staticMaterial:form.material};instances.set(form,instance);resource.instances.push(instance);
 }
 const playResource=resource=>{
  if(!resource.ready||document.hidden){resource.video.pause();return;}
  if(resource.wanted&&resource.video.paused)resource.video.play().catch(()=>{resource.error='等待点击启动视频';});
  if(!resource.wanted&&!resource.video.paused)resource.video.pause();
 };
 const onVisibility=()=>{if(document.hidden)for(const r of resources.values())r.video.pause();};
 const api={
  update(camera){
   camera.updateMatrixWorld();viewProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(viewProjection);
   for(const resource of resources.values())resource.wanted=false;
   for(const {form,points,resource,staticMaterial} of instances.values()){
    const visible=form.visible&&form.parent?.visible;
    const distance=camera.position.distanceTo(form.position);
    points.visible=resource.ready&&visible&&!resource.error;
    staticMaterial.visible=!resource.ready||!!resource.error;
    if(points.visible){
     const close=focused===form||distance<55,mid=distance<110;points.geometry=close?geometryHigh:mid?geometryMid:geometryLow;points.material.uniforms.uColumns.value=close?(dense?320:256):mid?192:96;
     // A view-facing point field faithfully preserves the camera already in the original clip.
     points.position.y=-form.userData.height/(2*form.scale.x)+(resource.groundRow-.5)*points.material.uniforms.uHeight.value;
     points.rotation.y=Math.atan2(camera.position.x-form.position.x,camera.position.z-form.position.z)-form.rotation.y;
     if(!focused||focused===form&&focusedPlaying)resource.wanted=true;
    }
   }
   for(const resource of resources.values()){
    if(resource.video.currentTime>=resource.spec.end&&!resource.pendingSeek){resource.pendingSeek=true;resource.video.currentTime=resource.spec.start;resource.loopCount++;}
    playResource(resource);
   }
  },
  focus(form){focused=form?.userData.referenceVideo?form:null;focusedPlaying=false;},
  setFocusedPlaying(value){focusedPlaying=!!value;},
  restart(form){const r=instances.get(form)?.resource;if(r){r.pendingSeek=true;r.video.currentTime=r.spec.start;}},
  unlock(){for(const r of resources.values()){r.error=null;if(r.ready)r.video.play().then(()=>{if(!r.wanted)r.video.pause();}).catch(()=>{});}},
  stats(){return [...resources.values()].map(r=>({name:r.name,ready:r.ready,error:r.error,currentTime:r.video.currentTime,paused:r.video.paused,decodedFrames:r.frameCount,loops:r.loopCount,start:r.spec.start,end:r.spec.end}));},
  dispose(){document.removeEventListener('visibilitychange',onVisibility);for(const r of resources.values()){r.disposed=true;if(r.frameHandle!==null)r.video.cancelVideoFrameCallback?.(r.frameHandle);r.video.pause();r.video.removeAttribute('src');r.video.load();r.texture.dispose();}for(const i of instances.values())i.points.material.dispose();geometryHigh.dispose();geometryMid.dispose();geometryLow.dispose();}
 };
 document.addEventListener('visibilitychange',onVisibility);
 return api;
}
