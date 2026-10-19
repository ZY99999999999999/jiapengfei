import * as THREE from '../lib/three/three.module.js';

// Grid topology provides bounded neighbour lookup. No all-pairs distance loop,
// no connections across a valley, and no random lines floating above the ground.
export function buildTerrainNetwork({heightAt=studyHeight,minX=-17,maxX=17,minZ=-14,maxZ=14,step=.32,world=false}={}) {
  const nx=Math.ceil((maxX-minX)/step)+1,nz=Math.ceil((maxZ-minZ)/step)+1;
  const dx=(maxX-minX)/(nx-1),dz=(maxZ-minZ)/(nz-1);
  const positions=[],colors=[],lines=[],lineColors=[];
  const points=new Array(nx*nz),tints=new Array(nx*nz);
  const low=new THREE.Color('#707c8b'),high=new THREE.Color('#eadbb5');
  for(let z=0;z<nz;z++)for(let x=0;x<nx;x++) {
    const px=minX+x*dx,pz=minZ+z*dz,py=heightAt(px,pz)+.055;
    const point=[px,py,pz],tint=low.clone().lerp(high,THREE.MathUtils.clamp((py+1)/8,0,1));
    points[z*nx+x]=point;tints[z*nx+x]=tint.toArray();
    positions.push(...point);colors.push(...tint.toArray());
  }
  const connect=(a,b)=>{
    if(Math.abs(points[a][1]-points[b][1])>step*1.8)return;
    lines.push(...points[a],...points[b]);lineColors.push(...tints[a],...tints[b]);
  };
  for(let z=0;z<nz;z++)for(let x=0;x<nx;x++) {
    const i=z*nx+x;
    if(x<nx-1)connect(i,i+1);
    if(z<nz-1)connect(i,i+nx);
    // Diagonals only in high-curvature areas: a readable irregular triangular net.
    if(x<nx-1&&z<nz-1&&((x*13+z*7)%9===0))connect(i,i+nx+1);
  }
  const group=new THREE.Group();group.name='地形点阵与局部邻接网';
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));pg.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  const pm=new THREE.PointsMaterial({size:world?.14:.036,vertexColors:true,transparent:true,opacity:world?.38:.72,depthTest:true,depthWrite:false,blending:THREE.AdditiveBlending});
  group.add(new THREE.Points(pg,pm));
  const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(lines,3));lg.setAttribute('color',new THREE.Float32BufferAttribute(lineColors,3));
  const lm=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:world?.09:.16,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending});
  group.add(new THREE.LineSegments(lg,lm));
  group.userData={pointCount:positions.length/3,edgeCount:lines.length/6,maxNeighbours:8};
  return group;
}

export function studyHeight(x,z) {
  const r=Math.hypot(x*.85,z),a=Math.atan2(z,x);
  const rim=4*Math.exp(-Math.pow((r-8.4)/2.1,2))*(1+.17*Math.sin(a*7));
  const centre=1.2*Math.exp(-Math.pow(r/5,2));
  const erosion=Math.sin(x*1.15+Math.sin(z*.8))*.17+Math.cos(z*1.65-x*.5)*.13;
  const flank=1.7*Math.exp(-Math.pow((x+11)/3.4,2)-Math.pow((z-5)/4,2));
  return Math.max(-.3,rim+centre+flank+erosion)*(1-Math.max(0,(r-15)/9));
}

// Connect the actual scene samples, including cliff faces, rather than a second height-field grid.
export function buildLandscapeStructure(positions, colors, zones, {cellSize=1.15,maxEdges=68000}={}) {
  const cells=new Map(),samples=[],edges=[],tints=[];
  const key=(x,y,z)=>`${x},${y},${z}`;
  for(let i=0;i<zones.length;i++) {
    const zone=zones[i];
    if(zone!==0&&zone!==1)continue;
    const x=positions[i*3],y=positions[i*3+1],z=positions[i*3+2];
    const ix=Math.floor(x/cellSize),iy=Math.floor(y/cellSize),iz=Math.floor(z/cellSize);
    const k=key(ix,iy,iz);
    if(cells.has(k))continue;
    const sample={i,x,y,z,ix,iy,iz,zone};cells.set(k,sample);samples.push(sample);
  }
  for(const a of samples) {
    if(edges.length/6>=maxEdges)break;
    const neighbours=[];
    for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(let dz=-1;dz<=1;dz++) {
      const b=cells.get(key(a.ix+dx,a.iy+dy,a.iz+dz));
      if(!b||b.i<=a.i||a.zone!==b.zone)continue;
      const d=Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
      if(d<cellSize*.35||d>cellSize*1.7)continue;
      // Keep meadows sparse; steep cliff samples carry more visible structure.
      if(a.zone===1&&((a.ix*17+a.iz*11)%5!==0))continue;
      neighbours.push({b,d});
    }
    neighbours.sort((u,v)=>u.d-v.d);
    for(const {b} of neighbours.slice(0,2)) {
      if(edges.length/6>=maxEdges)break;
      const slope=Math.min(1,Math.abs(a.y-b.y)/Math.max(.01,Math.hypot(a.x-b.x,a.z-b.z)));
      const gain=.36+slope*.45;
      edges.push(a.x,a.y+.018,a.z,b.x,b.y+.018,b.z);
      for(const point of [a,b])for(let c=0;c<3;c++)tints.push(colors[point.i*3+c]*gain);
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(edges,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(tints,3));
  geometry.computeBoundingSphere();
  const material=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.13,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending});
  const lines=new THREE.LineSegments(geometry,material);
  lines.name='实际地形采样·坡面与红崖局部结构';
  lines.userData={edgeCount:edges.length/6,sampleCount:samples.length,maxEdges};
  return lines;
}
