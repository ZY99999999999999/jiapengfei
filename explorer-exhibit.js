/* One selected motif, one GPU draw call. Source alpha and colour remain authoritative. */
import * as THREE from './lib/three/three.module.js';
const $ = id => document.getElementById(id);
const stage = $('exhibitStage');
const canvas = $('exhibitCanvas');
const reference = $('exhibitReference');
const message = $('exhibitMessage');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reducedMotion.matches;
let original = false;
let visible = true;
let selectedId = '';
let imageRequest = 0;
let reading = 'meaning';
let points, material, renderer, scene, camera;
let angleX = -.13, angleY = -.24, targetX = -.13, targetY = -.24, zoom = 1;
let time = 0, reveal = 0, lastTime = 0;
let pointer = null;
let imageReady = false;
let particleReady = false;
let needsRender = true;
let disposed = false;

const detailPanel = document.querySelector('.detail-panel');
$('exhibitDetailMount').append(detailPanel);
document.querySelectorAll('.sidebar-item').forEach(item => {
  item.setAttribute('role', 'button'); item.tabIndex = 0;
  item.setAttribute('aria-pressed',String(item.classList.contains('active')));
  item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); } });
});

const readingAnimations = new Map();
function revealReading(element, delay = 0) {
  readingAnimations.get(element)?.cancel();
  if (!matchMedia('(min-width:821px)').matches || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  readingAnimations.set(element, element.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}], {duration:480,delay,easing:'cubic-bezier(.22,.61,.36,1)',fill:'backwards'}));
}
function updateReading() {
  const content = $('detail-content');
  content.dataset.reading = reading;
  revealReading(content);
  let tabs = content.querySelector('.exhibit-reading-tabs');
  if (!tabs) {
    tabs = document.createElement('div'); tabs.className = 'exhibit-reading-tabs';
    tabs.setAttribute('role', 'group'); tabs.setAttribute('aria-label', '文化解读内容');
    [['meaning', '溯源与寓意'], ['structure', '造型与构成'], ['usage', '场景与规范']].forEach(([key, label]) => {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = label; button.dataset.reading = key;
      button.addEventListener('click', () => { reading = key; updateReading(); }); tabs.append(button);
    });
    content.querySelector('.detail-header')?.after(tabs);
  }
  tabs.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.reading === reading)));
}

function allPatterns() {
  return Object.entries(window.getPatternData()).flatMap(([category, data]) => data.patterns.map(p => ({ ...p, category })));
}

function select(id) {
  const pattern = allPatterns().find(p => p.id === id);
  if (!pattern) return;
  selectedId = id;
  const group = window.getPatternData()[pattern.category].patterns;
  $('exhibitIndex').textContent = `${String(group.findIndex(p => p.id === id) + 1).padStart(2,'0')} / ${String(group.length).padStart(2,'0')}`;
  $('exhibitName').textContent = pattern.name;
  $('exhibitStructure').textContent = `${pattern.structure || ''} · ${pattern.principle || ''}`;
  canvas.setAttribute('aria-label', `${pattern.name}的立体粒子展示，可拖拽或使用方向键旋转`);
  reference.alt = `${pattern.name}的原图对照`;
  updateReading();
  $('detail-card').scrollTop = 0;
  const src = window.getExplorerImageSource(id);
  imageReady = false;
  particleReady = false;
  $('exhibitPause').disabled = true; $('exhibitReset').disabled = true;
  const request = ++imageRequest;
  message.textContent = src ? '正在聚合纹样粒子…' : '当前纹样暂无图像，可在图录中添加图片';
  if (points) points.visible = false;
  reference.hidden = true;
  if (!src) { reference.removeAttribute('src'); return; }
  reference.src = src;
  targetX = -.13; targetY = -.24; zoom = 1;
  const image = new Image();
  image.onload = () => {
    if (request !== imageRequest || disposed) return;
    imageReady = true;
    try {
      if (!renderer) throw new Error('WebGL unavailable');
      buildParticles(image);
      particleReady = true;
      setOriginal(original);
      message.textContent = '';
      revealReading(document.querySelector('.exhibit-caption'));
      revealReading($('detail-content'), 200);
    } catch (error) {
      reference.hidden = false;
      message.textContent = '粒子展示暂不可用，已为你展示原图';
      console.warn('Explorer particle preview:', error.message);
    }
  };
  image.onerror = () => { if (request === imageRequest) { message.textContent = '图像暂时无法加载，请选择另一纹样或替换图片'; reference.hidden = true; } };
  image.src = src;
}

function initRenderer() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setClearColor(0x07101d, 0);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(42, 1, .1, 40); camera.position.z = 6.7;
    material = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uReveal: { value: 0 }, uDpr: { value: renderer.getPixelRatio() } },
      vertexShader: `
        attribute vec3 aNormal; attribute float aSeed;
        uniform float uTime; uniform float uReveal; uniform float uDpr;
        varying vec3 vColor; varying float vGlow;
        void main() {
          vec3 p = position;
          float breath = sin(uTime * 1.05) * .008;
          p *= 1.0 + breath;
          p += aNormal * sin(uTime * .65 + position.y * 2.4 + aSeed * 3.0) * .012;
          float turn = aSeed * 6.283 + (1.0-uReveal)*1.5;
          vec3 drift = vec3(cos(turn), sin(turn), sin(turn*2.0)) * (2.3+aSeed);
          p = mix(drift, p, uReveal);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vec3 n = normalize(normalMatrix * aNormal);
          float light = .38 + .62 * max(dot(n, normalize(vec3(-.5,.8,1.0))),0.0);
          float rim = pow(1.0-abs(n.z),2.0);
          vColor = color * light * 1.45 + vec3(.07,.16,.17) * rim;
          vGlow = .88 + .12 * sin(uTime*.85+aSeed*28.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp((.027+aSeed*.007) * 500.0 / -mv.z * uDpr, 1.0, 4.8*uDpr);
        }`,
      fragmentShader: `
        varying vec3 vColor; varying float vGlow;
        void main() {
          float r = length(gl_PointCoord-.5)*2.0;
          if(r>1.0) discard;
          float core = exp(-r*r*5.0);
          float halo = exp(-r*r*2.3)*.12;
          gl_FragColor = vec4(vColor*vGlow, (core*.66+halo)*.8);
        }`, vertexColors: true
    });
    const resize = () => {
      if (disposed) return;
      const rect = stage.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false); camera.aspect = rect.width/rect.height; camera.updateProjectionMatrix(); needsRender=true;
    };
    new ResizeObserver(resize).observe(stage); resize();
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }, { rootMargin: '150px' }).observe(stage);
    requestAnimationFrame(animate);
  } catch (error) {
    console.warn('Explorer WebGL initialization:', error.message);
    $('exhibitPause').disabled = true; $('exhibitReset').disabled = true;
  }
}

function buildParticles(image) {
  const size = 384, sample = document.createElement('canvas'); sample.width = sample.height = size;
  const ctx = sample.getContext('2d', { willReadFrequently: true });
  // Preserve source aspect ratio, including the currentColor black strokes used by the creator.
  const scale = (size-8)/Math.max(image.naturalWidth,image.naturalHeight);
  const width = image.naturalWidth*scale, height = image.naturalHeight*scale;
  ctx.drawImage(image,(size-width)/2,(size-height)/2,width,height);
  const rgba = ctx.getImageData(0,0,size,size).data;
  const mask = new Uint8Array(size*size), distance = new Float32Array(size*size);
  // Inspect the actual image border rather than the transparent letterbox padding.
  const ix = Math.ceil((size-width)/2)+1, iy = Math.ceil((size-height)/2)+1;
  const corners = [[ix,iy],[size-ix-1,iy],[ix,size-iy-1],[size-ix-1,size-iy-1]];
  const opaqueBorder = corners.every(([x,y]) => rgba[(y*size+x)*4+3] > 240);
  const borderRGB = [0,1,2].map(c => corners.reduce((sum,[x,y]) => sum+rgba[(y*size+x)*4+c],0)/4);
  const uniformBorder = opaqueBorder && corners.every(([x,y]) => borderRGB.every((v,c) => Math.abs(rgba[(y*size+x)*4+c]-v)<24));
  let x0=size,y0=size,x1=0,y1=0;
  const valid=[];
  for(let y=1;y<size-1;y++) for(let x=1;x<size-1;x++) {
    const i=y*size+x, j=i*4;
    const difference = Math.max(...borderRGB.map((v,c) => Math.abs(rgba[j+c]-v)));
    if(rgba[j+3]>40 && (!uniformBorder || difference>34)) {
      mask[i]=1; distance[i]=size; valid.push(i); x0=Math.min(x0,x); x1=Math.max(x1,x); y0=Math.min(y0,y); y1=Math.max(y1,y);
    }
  }
  if(!valid.length) throw new Error('No visible image pixels');
  // Chamfer distance gives each stroke a rounded cross-section instead of extruding a flat plate.
  for(let y=1;y<size-1;y++) for(let x=1;x<size-1;x++) {
    const i=y*size+x;
    if(mask[i]) distance[i]=Math.min(distance[i],distance[i-1]+1,distance[i-size]+1,distance[i-size-1]+1.414,distance[i-size+1]+1.414);
  }
  for(let y=size-2;y>0;y--) for(let x=size-2;x>0;x--) {
    const i=y*size+x;
    if(mask[i]) distance[i]=Math.min(distance[i],distance[i+1]+1,distance[i+size]+1,distance[i+size+1]+1.414,distance[i+size-1]+1.414);
  }
  let seed=2166136261; for(const c of selectedId) seed=Math.imul(seed^c.charCodeAt(0),16777619);
  const random=()=>{ seed^=seed<<13; seed^=seed>>>17; seed^=seed<<5; return (seed>>>0)/4294967296; };
  const count = Math.min(65000,Math.max(20000,valid.length*2.5))|0;
  const positions=new Float32Array(count*3), colors=new Float32Array(count*3), normals=new Float32Array(count*3), seeds=new Float32Array(count);
  const extent=Math.max(x1-x0,y1-y0), units=2.9/extent;
  const depth = i => Math.sqrt(Math.max(0,distance[i]))*units*2.6;
  for(let n=0;n<count;n++) {
    const i=valid[Math.floor(random()*valid.length)], x=i%size,y=Math.floor(i/size), j=i*4, k=n*3;
    const side=random()>.17?1:-1, radius=depth(i), shell=random()>.18?(.86+random()*.14):random();
    positions[k]=(x-(x0+x1)/2+(random()-.5)) * units;
    positions[k+1]=((y0+y1)/2-y+(random()-.5)) * units;
    positions[k+2]=side*radius*shell;
    const nx=(depth(i-1)-depth(i+1))/(units*2), ny=(depth(i+size)-depth(i-size))/(units*2);
    const len=Math.hypot(nx,ny,1); normals[k]=nx/len; normals[k+1]=ny/len; normals[k+2]=side/len;
    const brightness=(rgba[j]+rgba[j+1]+rgba[j+2])/3;
    const rgb=brightness<24?[224,185,104]:[rgba[j],rgba[j+1],rgba[j+2]];
    // Same dark-stroke warm-gold treatment as the creation canvas; retain source colour elsewhere.
    for(let c=0;c<3;c++) colors[k+c]=rgb[c]/255;
    seeds[n]=random();
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3)); geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  geometry.setAttribute('aNormal',new THREE.BufferAttribute(normals,3)); geometry.setAttribute('aSeed',new THREE.BufferAttribute(seeds,1));
  if(points) { scene.remove(points); points.geometry.dispose(); }
  points=new THREE.Points(geometry,material); points.position.y=.58; scene.add(points); reveal=paused?1:0; needsRender=true;
}

function animate(now) {
  if(disposed) return;
  requestAnimationFrame(animate);
  const dt=Math.min((now-lastTime)/1000,.05); lastTime=now;
  if(!visible || document.hidden || original) return;
  if(paused && reveal===1 && Math.abs(targetX-angleX)+Math.abs(targetY-angleY)<.0001 && !needsRender) return;
  if(!paused) time+=dt;
  reveal=Math.min(1,reveal+dt*1.6);
  material.uniforms.uReveal.value=1-Math.pow(1-reveal,3); material.uniforms.uTime.value=time;
  angleX+=(targetX-angleX)*.09; angleY+=(targetY-angleY)*.09;
  if(points) {
    points.rotation.x=angleX;
    points.rotation.y=angleY+Math.sin(time*.23)*.07;
    points.scale.setScalar(zoom);
  }
  renderer.render(scene,camera);
  needsRender=false;
}

function setOriginal(value) {
  original=value; reference.hidden=!(imageReady&&(value||!particleReady));
  canvas.style.opacity=value||!particleReady?'0':'1'; needsRender=true;
  $('exhibitOriginal').setAttribute('aria-pressed',String(value)); $('exhibitParticle').setAttribute('aria-pressed',String(!value));
  $('exhibitPause').disabled=value||!particleReady; $('exhibitReset').disabled=value||!particleReady;
  $('exhibitHint').textContent=value?'原图对照 · 保留图像原有结构与配色':'拖拽观察体积 · 滚轮缩放 · 双击复位';
}
$('exhibitOriginal').addEventListener('click',()=>setOriginal(true));
$('exhibitParticle').addEventListener('click',()=>setOriginal(false));
function syncPause() { $('exhibitPause').textContent=paused?'继续动效':'暂停动效'; $('exhibitPause').setAttribute('aria-pressed',String(paused)); }
$('exhibitPause').addEventListener('click',()=>{paused=!paused;needsRender=true;syncPause();}); syncPause();
reducedMotion.addEventListener('change',()=>{paused=reducedMotion.matches;syncPause();});
const reset=()=>{ targetX=-.13;targetY=-.24;zoom=1;needsRender=true; };
$('exhibitReset').addEventListener('click',reset); canvas.addEventListener('dblclick',reset);
canvas.addEventListener('pointerdown',e=>{ pointer={id:e.pointerId,x:e.clientX,y:e.clientY}; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId)return;targetY=Math.max(-.95,Math.min(.95,targetY+(e.clientX-pointer.x)*.008));targetX=Math.max(-.55,Math.min(.55,targetX+(e.clientY-pointer.y)*.006));pointer.x=e.clientX;pointer.y=e.clientY;});
const endPointer=()=>{pointer=null;}; canvas.addEventListener('pointerup',endPointer); canvas.addEventListener('pointercancel',endPointer);
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.65,Math.min(1.55,zoom-e.deltaY*.0007));needsRender=true;},{passive:false});
canvas.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','Escape'].includes(e.key))return;
  e.preventDefault();
  if(e.key==='Escape') reset();
  if(e.key==='ArrowLeft') targetY=Math.max(-.95,targetY-.1);
  if(e.key==='ArrowRight') targetY=Math.min(.95,targetY+.1);
  if(e.key==='ArrowUp') targetX=Math.max(-.55,targetX-.1);
  if(e.key==='ArrowDown') targetX=Math.min(.55,targetX+.1);
  if(e.key==='+') zoom=Math.min(1.55,zoom+.1);
  if(e.key==='-') zoom=Math.max(.65,zoom-.1);
  needsRender=true;
});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();reference.hidden=!imageReady;message.textContent='显示连接已中断，当前展示原图；刷新页面可恢复粒子';});
window.addEventListener('explorer:select',e=>select(e.detail.id));
function step(direction) {
  const patterns=window.getPatternData()[window.currentCategory].patterns;
  if(!patterns.length)return;
  const i=patterns.findIndex(p=>p.id===selectedId);
  window.selectExplorerPattern(patterns[(i+direction+patterns.length)%patterns.length].id,false);
}
$('exhibitPrevious').addEventListener('click',()=>step(-1));
$('exhibitNext').addEventListener('click',()=>step(1));
window.addEventListener('explorer:catalog',e=>{
  document.querySelectorAll('.sidebar-item').forEach(item=>item.setAttribute('aria-pressed',String(item.classList.contains('active'))));
  const patterns=window.getPatternData()[e.detail.category].patterns;
  const next=patterns.find(p=>p.id===selectedId)||patterns[0];
  if(next) window.selectExplorerPattern(next.id,false);
  else { ++imageRequest;imageReady=false;reference.hidden=true;selectedId='';if(points)points.visible=false;message.textContent='这个分类还没有纹样，可以添加一个新纹样';$('exhibitName').textContent='等待新的纹样';$('exhibitStructure').textContent='';$('exhibitIndex').textContent='00 / 00';$('detail-content').style.display='none';$('detail-placeholder').style.display='flex'; }
});
window.addEventListener('pagehide',event=>{if(event.persisted)return;disposed=true;points?.geometry.dispose();material?.dispose();renderer?.dispose();});
initRenderer();
const initial=window.getPatternData()[window.currentCategory]?.patterns[0];
if(initial) window.selectExplorerPattern(initial.id,false);
