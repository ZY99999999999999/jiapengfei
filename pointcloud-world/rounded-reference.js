import {makeLuminousSurface} from './luminous-surface.js?v=8';
import * as THREE from '../lib/three/three.module.js';

// Close tiny gaps between painted scale/feather lines, retaining large negative spaces.
export function closePaintedSilhouette(mask, width, height) {
  const morph = (input, dilate) => {
    const horizontal = new Uint8Array(input.length), output = new Uint8Array(input.length);
    for (let y=0;y<height;y++) for(let x=0;x<width;x++) {
      let value = dilate ? 0 : 1;
      for(let dx=-3;dx<=3;dx++) {
        const sample = x+dx>=0 && x+dx<width ? input[y*width+x+dx] : 0;
        value = dilate ? value|sample : value&sample;
      }
      horizontal[y*width+x]=value;
    }
    for (let y=0;y<height;y++) for(let x=0;x<width;x++) {
      let value = dilate ? 0 : 1;
      for(let dy=-3;dy<=3;dy++) {
        const sample = y+dy>=0 && y+dy<height ? horizontal[(y+dy)*width+x] : 0;
        value = dilate ? value|sample : value&sample;
      }
      output[y*width+x]=value;
    }
    return output;
  };
  const closed = morph(morph(mask,true),false);
  const seen = new Uint8Array(mask.length), queue = new Int32Array(mask.length);
  for(let start=0;start<closed.length;start++) {
    if(closed[start] || seen[start]) continue;
    let head=0,tail=1,touchesBorder=false; queue[0]=start;seen[start]=1;
    while(head<tail) {
      const i=queue[head++],x=i%width,y=(i/width)|0;
      if(!x||!y||x===width-1||y===height-1)touchesBorder=true;
      for(const next of [x?i-1:-1,x<width-1?i+1:-1,y?i-width:-1,y<height-1?i+width:-1]) {
        if(next>=0&&!closed[next]&&!seen[next]) {seen[next]=1;queue[tail++]=next;}
      }
    }
    if(!touchesBorder && tail<1500) for(let i=0;i<tail;i++) closed[queue[i]]=1;
  }
  // Never trim the painted contour in the closing operation.
  for(let i=0;i<mask.length;i++)mask[i]=mask[i]||closed[i];
}

export function localStrokeRadii(distance, width, height, range=36) {
  const horizontal=new Float32Array(distance.length),result=new Float32Array(distance.length);
  const filter=(input,output,count,length,indexOf)=>{
    const deque=new Int32Array(length);
    for(let line=0;line<count;line++) {
      let head=0,tail=0,next=0;
      for(let at=0;at<length;at++) {
        const end=Math.min(length-1,at+range);
        while(next<=end) {
          const value=input[indexOf(line,next)];
          while(tail>head&&input[indexOf(line,deque[tail-1])]<=value)tail--;
          deque[tail++]=next++;
        }
        while(tail>head&&deque[head]<at-range)head++;
        output[indexOf(line,at)]=input[indexOf(line,deque[head])];
      }
    }
  };
  filter(distance,horizontal,height,width,(line,index)=>line*width+index);
  filter(horizontal,result,width,height,(line,index)=>index*width+line);
  return result;
}

export function makeRoundedReferenceCloud(positions, colors, normals, sizes, scale) {
  const points=makeLuminousSurface(positions,colors,normals,sizes,scale);
  const u=points.material.uniforms;u.uColorRetention.value=1;u.uBrightness.value=1.08;
  u.uCore.value=.68;u.uSurfaceFill.value=1.4;u.uFlow.value=.035;u.uSize.value=.86;u.uRim.value=.55;u.uGlow.value=.16;u.uSpeed.value=.35;
  points.userData.roundedSurface=true;
  return points;
}
