import * as THREE from '../lib/three/three.module.js';
import { installLibraryMotifs } from './motifs.js?v=4';
import { installLivingMotifs } from './living-motifs.js?v=22';
import { createGestureControl } from './gesture-control.js?v=1';
import { createVideoParticlePlayer } from './video-particles.js?v=6';
import { installFiveVolcanoes } from './volcano-world.js?v=35';

const canvas = document.querySelector('#world');
const playButton = document.querySelector('#play');
const restartButton = document.querySelector('#restart');
const freeButton = document.querySelector('#free');
const glideButton = document.querySelector('#glide');
const gestureButton = document.querySelector('#gesture');
const gestureView = document.querySelector('#gesture-view');
const gestureStatus = document.querySelector('#gesture-status');
const gaze = document.querySelector('#gaze');
const motifsButton = document.querySelector('#motifs');
const paletteButton = document.querySelector('#palette');
const progressBar = document.querySelector('#progress');
const statusLabel = document.querySelector('#status');
const errorBox = document.querySelector('#error');
const discoveryCard = document.querySelector('#discovery');
const discoveryImage = document.querySelector('#discovery-image');
const discoveryTitle = document.querySelector('#discovery-title');
const discoveryCopy = document.querySelector('#discovery-copy');
const foundLabel = document.querySelector('#found');
const sightlines = document.querySelector('#sightlines');
const sightlineList = document.querySelector('#sightline-list');
const focusPanel = document.querySelector('#focus-panel');
const focusTitle = document.querySelector('#focus-title');
const focusCopy = document.querySelector('#focus-copy');
const focusSource = document.querySelector('#focus-source');
const focusExit = document.querySelector('#focus-exit');
const focusReplay = document.querySelector('#focus-replay');
const volcanoJump = document.querySelector('#volcano-jump');
// 草原知识与现代纹样转译分开呈现；设计图不是品种图鉴，五峰也不是真实地形扫描。
const focusStories = {
  '蒙古马': {
    fact: '蒙古马体格紧实，以耐力和适应草原环境见长。看它奔跑时，头颈、鬃毛与四肢会形成连续的方向线。',
    design: '这组现代纹样以青绿和深蓝区分前后两匹马，让卷云、回纹顺着胸肩与躯干流动，表现奔跑的风势，而不是复刻真实毛色。',
    observe: '留意鬃毛向后展开、前后腿交替伸缩，以及两匹马在纵深中的先后关系。',
    source: 'https://nmt.nmg.gov.cn/xw/msdt/xlgl/202510/t20251031_2810851.html'
  },
  '蒙古牛': {
    fact: '蒙古牛体躯结实、额部宽阔，角向前上方伸展；长期放牧使它具有适应草原环境的特点。',
    design: '画面以朱红和深蓝塑造两头牛，角与肩背保留有力轮廓，云纹和回纹则把厚重的身体转译成可以流动的装饰面。',
    observe: '聚焦时看头部下探、颈肩承重和再抬起的节奏；这是由参考视频重建的动作，不是整只牛上下漂浮。',
    source: 'https://nmt.nmg.gov.cn/yw/nszd/xlgl/202205/t20220525_2061381.html'
  },
  '绵羊': {
    fact: '蒙古羊是适应草原放牧的地方绵羊，体质结实；公羊常见弯曲的角。这里的“绵羊”与山羊是两种不同的形象。',
    design: '原画把丰厚被毛处理为蓝白相间的卷云纹团，柔软的曲线与山羊较利落的身形形成对照。',
    observe: '近看羊角的回旋、羊毛纹样的疏密，以及奔跑时轮廓如何在粒子间重新聚合。',
    source: 'https://nmt.nmg.gov.cn/yw/pzzy/cqpz/202502/t20250227_2673221.html'
  },
  '山羊': {
    fact: '内蒙古部分绒山羊品种以细软羊绒见长，身形紧凑，能适应草原放牧。画中的盘角与颜色经过艺术夸张，不指认某个具体品种。',
    design: '这里用青绿身体、橙金盘角和跃起的前肢，突出山羊轻捷、善于攀跃的视觉印象；花形与几何纹样沿躯干组织，而不是把整张图贴在表面。',
    observe: '先看盘角与头颈，再看前腿收放和躯干重心。动作由参考视频逐帧转成粒子，停顿处更容易辨认纹样结构。',
    source: 'https://nmj.xlgl.gov.cn/nmj/nmyw/syjs/dea954244c2f47bab7a40f7ce3c49dc3/index.html'
  },
  '骆驼': {
    fact: '草原地区的双峰驼以两座驼峰、长颈和宽厚足掌辨识，能适应干旱与寒冷环境。',
    design: '原画用深蓝与朱红安排两匹驼，云纹穿过驼峰，飘带延长行进方向；它是带地域意象的当代插画，不是动物标本。',
    observe: '注意驼峰随步态轻微起伏、前后肢交替落地；近景应先读出双峰轮廓，再看到身上的细纹。',
    source: 'https://www.sntzq.gov.cn/eportal/ui?articleKey=7977af9c2e8b469781ed16a32f2eca94b5&columnId=bd9019f528324c03ad77bc5f2eca94b5&pageId=96e9e64587e3455aa7cc4b5ef92ee23a'
  },
  '01 · 蝶莲焰': {
    fact: '乌兰哈达可见火山锥与火山口；眼前这座是以地貌为骨架的艺术火山，不对应某一座真实山峰。',
    design: '第一张原画的宽阔山肩、双蝶与火口莲焰被拆为有纵深的粒子层；蓝底云纹沿山坡绕行，暖金色把视线引向火口。',
    observe: '从正面辨认双蝶，再拖拽镜头看山身纹带如何绕到侧面。',
    source: 'https://www.spp.gov.cn/spp/zdgz/202410/t20241031_670524.shtml'
  },
  '02 · 双翼宝石': {
    fact: '真实火山的锥体、火口和熔岩构成空间起伏；这里借用这一结构，不复原卫星地形。',
    design: '第二张原画的菱格坡面成为层层抬升的山体，红色双翼与顶端宝石形成左右对称的视觉仪式；青、金纹线在侧面仍连续。',
    observe: '绕到侧面看翼面厚度、宝石悬浮层次，以及菱格如何随山坡转折。',
    source: 'https://www.spp.gov.cn/spp/zdgz/202410/t20241031_670524.shtml'
  },
  '03 · 龙凤日轮': {
    fact: '乌兰哈达的火山群并非只有五座；这五座是五张设计图对应的艺术峰，不是现实山峰编号。',
    design: '第三张原画让青龙与赤凤分守两翼，日轮压在山顶，云纹密布坡面。场景把它们组织成有厚度的环山形体与旋转纹样。',
    observe: '先从正面看龙凤相向，再环看它们与日轮、火口的前后关系。',
    source: 'https://www.spp.gov.cn/spp/zdgz/202410/t20241031_670524.shtml'
  },
  '04 · 蝶火脉': {
    fact: '火山熔岩与碎屑地貌给了这座山“内部能量向外展开”的灵感，红色火脉是设计表达，不是实时喷发。',
    design: '第四张原画的阶梯山形被加厚成层层退进的坡面；中央红色裂脉向上贯通，四只蝶围绕山体错层浮游。',
    observe: '沿火脉从山脚看到火口，再旋转镜头辨认蝶翼与山体的距离。',
    source: 'https://www.spp.gov.cn/spp/zdgz/202410/t20241031_670524.shtml'
  },
  '05 · 夜翼回纹': {
    fact: '火山口与锥坡提供了可环看的三维骨架；此峰的花冠与夜翼属于艺术纹样，不是自然地貌。',
    design: '第五张原画用三角山身承载连续回纹，四只青色夜翼围成上升的弧线，花形纹样悬于火口，形成由下而上的视觉路径。',
    observe: '拖拽观察回纹在山体侧面的延续、夜翼错开的前后层次和花冠的悬浮高度。',
    source: 'https://www.spp.gov.cn/spp/zdgz/202410/t20241031_670524.shtml'
  }
};
const emblemStories = {
  '莲焰纹样': '莲瓣的尖形轮廓与云纹、回纹组合，是这组现代插画里的火焰与生长意象。场景只保留主形，不把整张图片贴成平面。',
  '莲心纹样': '放射式莲瓣层层展开，红、青、金三色让中心与外圈保持清晰层级。它是现代设计母题，不作为历史纹样实物陈列。',
  '蝴蝶纹样': '左右对称的蝶翼以云纹、回纹和水波纹分区，缓慢摆动以维持轮廓辨识度。',
  '夜翼纹样': '夜翼的双翼弧线、翼尖和回纹构成辨识轮廓；此处采用缓慢浮动，不把图案压缩成远处杂点。',
  '龙凤汇聚纹样': '龙与凤分居两侧，围绕中央纹样形成环形叙事；青绿与朱红各自成组，便于在场景中辨认。'
};
document.querySelector('#discovery-close').addEventListener('click', () => { discoveryCard.hidden = true; });

try {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const world = new THREE.Scene();
  world.background = new THREE.Color(0x06142a);
  const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.12, 650);
  // 星云绘制在球形天穹上，转向和飞行时不会露出黑色盒子的边界。
  const skyMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthTest: false, depthWrite: false, fog: false,
    uniforms: { uTime: { value: 0 }, uColorMix: { value: 1 } },
    vertexShader: `varying vec3 vSky; void main() { vSky = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      varying vec3 vSky;
      uniform float uTime;
      uniform float uColorMix;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        vec3 d = normalize(vSky);
        float n = sin(d.x * 18.0 + sin(d.z * 13.0) * 1.9 + uTime * .025)
          * sin(d.z * 14.0 - d.y * 9.0) * .5 + .5;
        float veil = pow(max(0.0, n), 2.4) * (.44 + .56 * pow(1.0 - abs(d.y - .16), 2.0));
        float horizon = pow(max(0.0, 1.0 - abs(d.y - .07)), 5.0);
        vec3 base = mix(vec3(.014,.040,.092), vec3(.052,.076,.17), horizon);
        vec3 nebula = mix(vec3(.035,.19,.30), vec3(.19,.075,.27), smoothstep(-.65,.72,d.x));
        vec3 col = base + nebula * veil * .72 + vec3(.025,.10,.13) * horizon * .28;
        vec2 cell = floor(vec2(atan(d.z,d.x) * 400.0, d.y * 980.0));
        float star = step(.9981, hash(cell));
        col += vec3(.51,.77,1.0) * star * (.38 + .36 * sin(uTime * 1.1 + hash(cell + 2.0) * 6.28));
        col = mix(vec3(.015,.018,.030) + star * .25, col, uColorMix);
        gl_FragColor = vec4(col, 1.0);
      }
    `
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 40, 24), skyMaterial);
  sky.position.set(0, 0, -65);
  sky.renderOrder = -1000;
  world.add(sky);

  // 固定种子让用户每次评估到同一个空间。所有结构都是真实三维点坐标，并参与深度遮挡。
  let seed = 20261014;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) | 0; return (seed >>> 0) / 4294967296; };
  const positions = [];
  const colors = [];
  const zoneColors = [];
  const glyphs = [];
  const zoneIds = [];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const gaussian = (x, z, cx, cz, sx, sz) => Math.exp(-((x - cx) ** 2 / (sx * sx) + (z - cz) ** 2 / (sz * sz)));
  const foundPlaces = new Set();
  const discoveries = {
    path: ['步道 · 盘长结', '盘长结的连续结构转化为引导观众穿行的步道。', '../wenyang_svg/rel/盘长结变体F1.svg'],
    grass: ['草地 · 卷草纹微粒', '以平台的卷草纹变体为微观单元，沿草地起伏和随风的方向重复生长；不再把盘长结误当草叶。', '../wenyang_svg/bio/卷草纹变体F1.svg'],
    river: ['河流 · 流水与踏石', '河面保留蓝青色流动粒子和浅色踏石，不叠加纹样。', '../pattern_visuals/hamuur-modern-v1.svg'],
    cloud: ['云层 · 哈木尔纹', '云团由细小曲线纹样铺开，缓缓漂移；这是一种现代转译。', '../pattern_visuals/hamuur-modern-v1.svg'],
    volcano: ['五座纹样火山', '五张设计图分别转译为可环看的三维粒子火山；相对位置参考景区导览图与地质资料，非精确地理复原。', '../wenyang_svg/rel/盘长结变体F1.svg'],
    herd: ['五畜 · 彩色粒子群', '马、牛、绵羊、山羊、骆驼从你提供的五张设计图提取形态与颜色，用微纹样粒子聚形；目前是有厚度的粒子雕塑，并非完整360°动物建模。', './reference-frames/horse.jpg'],
    rock: ['红层台地 · 地貌意象', '两翼高崖借鉴乌兰察布红崖台地的赭红层理与侵蚀轮廓，是与五座纹样火山并置的艺术化场景，不代表两处地貌真实相邻。', '../pattern_visuals/hamuur-modern-v1.svg']
  };
  function reveal(key) {
    const [title, copy, source] = discoveries[key];
    foundPlaces.add(key);
    foundLabel.textContent = `已发现 ${foundPlaces.size} / 7 处纹样`;
    discoveryImage.src = source;
    discoveryImage.alt = title;
    discoveryImage.style.filter = key === 'herd' ? 'none' : 'brightness(0) invert(1) drop-shadow(0 0 5px #d6b574)';
    discoveryTitle.textContent = title;
    discoveryCopy.textContent = copy;
    discoveryCard.hidden = false;
  }

  function terrainHeight(x, z) {
    const wash = Math.sin(z * 0.18 + x * 0.09) * 0.7 + Math.sin(x * 0.41 - z * 0.11) * 0.37;
    const fine = Math.sin(x * 1.24 + Math.cos(z * 0.3)) * Math.cos(z * 0.83) * 0.13;
    const side = Math.max(0, Math.abs(x) - 8) * 0.17;
    const mounds = 3.2 * gaussian(x, z, -12, 1, 7, 11) + 2.8 * gaussian(x, z, 13, -31, 9, 12);
    const sink = 2.1 * gaussian(x, z, 1, -13, 10, 9) + 1.5 * gaussian(x, z, -3, -50, 9, 7);
    const canyon = -1.3 + wash + fine + side + mounds - sink;
    const prairie = -2.0 + Math.sin(x * .095 + z * .037) * .62 + Math.cos(z * .105 - x * .04) * .42
      + 1.8 * gaussian(x, z, -72, -189, 21, 18) + 1.45 * gaussian(x, z, 75, -198, 25, 22);
    const blend = clamp((-z - 75) / 23, 0, 1);
    return canyon * (1 - blend) + prairie * blend;
  }

  const pathCentreAt = z => Math.sin(z * 0.095) * 2.5;
  const riverCentreAt = z => 8 + Math.sin(z * 0.09 + 0.8) * 2.3;

  function add(x, y, z, r, g, b, zone = 'rock') {
    positions.push(x, y, z);
    colors.push(r, g, b);
    const variation = Math.abs(Math.sin(x * 12.87 + z * 8.31 + y * 3.97));
    const palette = zone === 'grass' ? [0.16, 0.70, 0.35]
      : zone === 'path' ? [0.87, 0.67, 0.39]
      : zone === 'river' ? [0.12, 0.69, 0.98]
      : zone === 'cloud' ? [0.68 + variation * .25, 0.82 + variation * .15, 1.0]
      : zone === 'volcano' ? [0.33, 0.34, 0.39]
      : zone === 'lava' ? [0.95, 0.30, 0.12]
      : zone === 'sky' ? [0.30, 0.47, 0.70]
      : zone === 'redbed' ? [0.64, 0.27, 0.15]
      : [0.27, 0.34, 0.40];
    const brightness = Math.max(r, g, b);
    zoneColors.push(...palette.map(value => value * brightness * 1.18));
    glyphs.push(zone === 'river' || zone === 'path' || zone === 'volcano' || zone === 'lava' ? 0
      : zone === 'grass' ? 7 : variation > 0.35 ? 1 : 0);
    zoneIds.push(({ rock: 0, grass: 1, river: 2, cloud: 3, volcano: 4, lava: 5, path: 6, sky: 7, redbed: 0 })[zone] ?? 0);
  }

  const dense = window.innerWidth >= 900;
  const groundCount = dense ? 255000 : 126000;
  for (let i = 0; i < groundCount; i += 1) {
    let x = (random() - 0.5) * 77;
    let z = -83 + random() * 135;
    const edgeFade = clamp(Math.min((38.5 - Math.abs(x)) / 10, (z + 83) / 17, (52 - z) / 17), 0, 1);
    if (random() > edgeFade) continue;
    // 局部扫描行和断裂空白让点云接近参考视频的“扫描地貌”，避免机械均匀噪点。
    if (random() < 0.64) z = Math.round(z / 0.13) * 0.13 + (random() - 0.5) * 0.037;
    if (random() < 0.045 && Math.sin(x * 0.86 + z * 0.28) < 0.4) continue;
    x += (random() - 0.5) * 0.035;
    const y = terrainHeight(x, z) + (random() - 0.5) * 0.08;
    const slopeX = terrainHeight(x + 0.3, z) - terrainHeight(x - 0.3, z);
    const slopeZ = terrainHeight(x, z + 0.3) - terrainHeight(x, z - 0.3);
    const facing = clamp(0.71 + slopeX * -0.21 + slopeZ * 0.22, 0.2, 1.1);
    const ripple = 0.68 + 0.26 * Math.sin(x * 0.19 + z * 0.25) ** 2;
    const shine = random() < 0.13 ? 1.26 : 0.78 + random() * 0.34;
    const lightPool = gaussian(x, z, 10, -28, 13, 20) * 1.2 + gaussian(x, z, -7, 9, 11, 15) * 0.65;
    const value = facing * ripple * shine * (1 + lightPool);
    const warm = Math.sin(x * 0.12 - z * 0.045) > 0.22;
    const pathCentre = pathCentreAt(z);
    const riverCentre = riverCentreAt(z);
    const zone = Math.abs(x - riverCentre) < 1.8 ? 'river' : Math.abs(x - pathCentre) < 2.5 ? 'path' : Math.abs(x) < 24 ? 'grass' : 'rock';
    add(x, y, z, value * (warm ? 1.02 : 0.83), value * (warm ? 0.94 : 0.89), value * (warm ? 0.73 : 1.02), zone);
  }

  // 红崖台地是湖相/河流相沉积红层，不是玄武岩；借其宏大层理作艺术化空间边界。
  // 两翼错列、主体远离路径，保留可见天空和五峰，不再以白崖封闭镜头。
  for (const side of [-1, 1]) {
    const wallCount = dense ? side < 0 ? 43000 : 33500 : side < 0 ? 21000 : 16000;
    for (let i = 0; i < wallCount; i += 1) {
      const z = -79 + random() * 135;
      const t = random();
      const crest = side < 0
        ? 13 + 16 * Math.exp(-(((z + 18) / 25) ** 2)) + 8 * Math.exp(-(((z + 62) / 16) ** 2))
        : 10 + 15 * Math.exp(-(((z + 43) / 26) ** 2)) + 5 * Math.exp(-(((z - 21) / 16) ** 2));
      const y = terrainHeight(side * 40, z) + t * crest;
      const crumble = Math.sin(z * 0.24 + t * 17) * 1.1 + Math.sin(z * 0.64 - t * 23) * .43;
      const x = side * (37 + 4.6 * Math.sin(z * 0.036 + side) + t * 4.5 + crumble + (random() - .5) * .42);
      if (random() < .08 + t * .06) continue;
      const band = Math.sin(y * 1.08 + z * .026 + Math.sin(z * .11) * .43);
      const light = (.53 + random() * .34) * (band > .55 ? 1.31 : band < -.48 ? .63 : .96);
      add(x, y, z, light * (band > .55 ? 1.12 : .85), light * .48, light * .31, 'redbed');
    }
  }

  // 高低错落的独立石柱、断块与沉积裙边，镜头经过时提供强烈近远视差。
  const monoliths = [
    [-40, 9, 3.8, 10.8], [39, -24, 4.2, 13.1], [-43, -59, 4.3, 11.6]
  ];
  for (let k = 0; k < monoliths.length; k += 1) {
    const [cx, cz, radius, height] = monoliths[k];
    const count = dense ? 3300 : 1600;
    for (let i = 0; i < count; i += 1) {
      const t = random();
      const angle = random() * Math.PI * 2;
      const taper = 0.62 + 0.38 * Math.sin((1 - t) * Math.PI * 0.72);
      const relief = Math.sin(angle * 7 + t * 19 + k) * 0.12 + Math.sin(angle * 13 - t * 32) * 0.07;
      const x = cx + Math.cos(angle) * radius * (taper + relief);
      const z = cz + Math.sin(angle) * radius * (taper + relief);
      const y = terrainHeight(cx, cz) + t * height + Math.sin(angle * 4 + t * 15) * 0.16;
      const sideLit = clamp(0.65 - Math.cos(angle) * 0.31 + Math.sin(t * 37) * 0.14, 0.13, 1);
      const fleck = random() > 0.9 ? 1.45 : 0.78 + random() * 0.22;
      const light = sideLit * fleck * .57;
      add(x, y, z, light * 1.26, light * .58, light * .38, 'redbed');
    }
  }

  // 崖壁的断裂台地与散落岩块打破左右对称，低机位可从它们之间穿过去。
  const ledges = [
    [-1, 24, 9.4, 13], [1, -19, 12.2, 15], [-1, -56, 8.7, 12]
  ];
  for (const [side, cz, height, length] of ledges) {
    const n = dense ? 1800 : 900;
    for (let i = 0; i < n; i += 1) {
      const along = (random() - 0.5) * length;
      const reach = random();
      const z = cz + along;
      const x = side * (38 + Math.sin(z * 0.1) * 2.2 - reach * (5.5 + Math.sin(z * 0.37) * 1.2));
      const y = terrainHeight(x, z) + height + Math.sin(along * 0.8 + reach * 5) * 0.6 + (random() - 0.5) * 0.32;
      if (random() < reach * 0.09) continue;
      const rim = reach > 0.75 ? 1.2 : 0.7;
      const light = rim * (side < 0 ? 0.48 : 0.43) * (0.72 + random() * 0.42);
      add(x, y, z, light * 1.27, light * .56, light * .34, 'redbed');
    }
  }

  const boulders = [
    [-33, 19, 3.0, 2.8], [32, 8, 2.7, 3.1], [-36, -8, 3.2, 3.3],
    [35, -37, 3.6, 3.5], [-37, -63, 2.9, 3.0],
    // Smaller low stones sit along the grass edges, between the new grazing groups.
    [-22, 16, 1.6, 1.05], [22, 2, 1.5, 1.1], [-22, -18, 1.8, 1.2],
    [22, -36, 1.6, 1.05], [-22, -53, 1.8, 1.15], [22, -70, 1.6, 1.0]
  ];
  for (let k = 0; k < boulders.length; k += 1) {
    const [cx, cz, radius, height] = boulders[k];
    const n = dense ? 2100 : 1100;
    for (let i = 0; i < n; i += 1) {
      const angle = random() * Math.PI * 2;
      const elevation = random() * Math.PI * 0.5;
      const r = radius * Math.cos(elevation) * (1 + Math.sin(angle * 6 + k) * 0.11 + Math.sin(angle * 13 + elevation * 9) * 0.06);
      const x = cx + Math.cos(angle) * r;
      const z = cz + Math.sin(angle) * r * (0.76 + (k % 3) * 0.08);
      const y = terrainHeight(cx, cz) + Math.sin(elevation) * height + Math.sin(angle * 8 + elevation * 12) * 0.16;
      const light = (0.43 + Math.sin(elevation) * 0.28 - Math.cos(angle) * 0.18) * (0.83 + random() * 0.43);
      add(x, y, z, light * 1.32, light * .61, light * .40, 'redbed');
    }
  }

  // 岩谷与开阔草原由纹样粒子汇成水流、卷草纹草地、蓝白云和五峰基底。
  // 将步道作为连续的暖赭色粒子带单独铺出，和草地粒点拉开色相、明度与边界。
  const pathCount = dense ? 24000 : 11200;
  for (let i = 0; i < pathCount; i += 1) {
    const z = -80 + random() * 123;
    const centre = pathCentreAt(z);
    const across = (random() - 0.5) * 5.0;
    const wheelRuts = Math.abs(Math.abs(across) - 0.88) < 0.12;
    const x = centre + across + (random() - 0.5) * 0.04;
    const y = terrainHeight(x, z) + 0.075 + (random() - 0.5) * 0.035;
    const grit = wheelRuts ? 0.84 + random() * 0.18 : 0.62 + random() * 0.25;
    add(x, y, z, grit, grit * (wheelRuts ? 0.50 : 0.56), grit * 0.25, 'path');
  }

  const riverCount = dense ? 32000 : 12000;
  for (let i = 0; i < riverCount; i += 1) {
    const z = -77 + random() * 118;
    const centre = riverCentreAt(z);
    const x = centre + (random() - 0.5) * 3.6;
    const y = terrainHeight(x, z) + 0.06 + Math.sin(z * 1.9 + x * 2) * 0.04;
    const sparkle = random() < 0.16 ? 1.40 : 0.68 + random() * 0.42;
    add(x, y, z, sparkle * 0.26, sparkle * 0.79, sparkle, 'river');
  }

  // 三处错落的浅色踏石让河面多一个可读的尺度，也呼应草原步道的穿行关系。
  for (let crossing = 0; crossing < 3; crossing += 1) {
    const z = [-57, -17, 23][crossing];
    const centre = riverCentreAt(z);
    for (let stone = 0; stone < 3; stone += 1) {
      const lateral = (stone - 1) * 1.05 + (crossing % 2 ? 0.18 : -0.12);
      const cx = centre + lateral;
      const cz = z + (stone - 1) * 0.20;
      const radius = 0.39 + random() * 0.10;
      const count = dense ? 210 : 105;
      for (let i = 0; i < count; i += 1) {
        const angle = random() * Math.PI * 2;
        const r = Math.sqrt(random());
        const x = cx + Math.cos(angle) * radius * r;
        const zz = cz + Math.sin(angle) * radius * r * 0.76;
        const y = terrainHeight(x, zz) + 0.14 + (1 - r) * 0.12 + (random() - 0.5) * 0.04;
        const shade = 0.64 + random() * 0.26;
        add(x, y, zz, shade, shade * 0.92, shade * 0.78, 'rock');
      }
    }
  }

  const grassCount = dense ? 19500 : 7300;
  for (let i = 0; i < grassCount; i += 1) {
    const x = (random() - 0.5) * 34;
    const z = -73 + random() * 110;
    const riverCentre = riverCentreAt(z);
    if (Math.abs(x - riverCentre) < 2.25 || Math.abs(x - pathCentreAt(z)) < 3.0) continue;
    const h = 0.13 + random() * 0.56;
    const y = terrainHeight(x, z) + h;
    add(x + Math.sin(z * 3.2) * h * 0.3, y, z, 0.24, 0.53 + random() * 0.22, 0.35, 'grass');
  }
  // 云纹退到动物和火山上方，避免近景白色点团吞掉形体轮廓。
  const clouds = [[17, 48, -29, 11, 3.0, 6], [-18, 51, -58, 10, 2.8, 6]];
  for (const [cx, cy, cz, sx, sy, sz] of clouds) {
    const n = dense ? 3800 : 1700;
    for (let i = 0; i < n; i += 1) {
      const angle = random() * Math.PI * 2;
      const r = Math.sqrt(random());
      const x = cx + Math.cos(angle) * r * sx;
      const z = cz + Math.sin(angle) * r * sz;
      const billow = Math.sin(x * 0.55) * 0.7 + Math.cos(z * 0.5) * 0.9;
      const y = cy + (random() - 0.5) * sy + billow;
      const light = 0.30 + random() * 0.43;
      add(x, y, z, light, light, light, 'cloud');
    }
  }
  const basinCount = dense ? 174000 : 80000;
  for (let i = 0; i < basinCount; i += 1) {
    const x = (random() - .5) * 190;
    const z = -250 + random() * 175;
    const edge = clamp(Math.min((95 - Math.abs(x)) / 20, (z + 250) / 20, (-75 - z) / 12), 0, 1);
    if (random() > edge) continue;
    const routeX = Math.sin(z * .052) * 9;
    const waterX = 23 + Math.sin(z * .063 + 1.7) * 7;
    const river = Math.abs(x - waterX) < 3.7;
    const path = !river && Math.abs(x - routeX) < 4.7;
    const zone = river ? 'river' : path ? 'path' : 'grass';
    const y = terrainHeight(x, z) + (random() - .5) * .08;
    const glow = .46 + random() * .39 + Math.max(0, Math.sin(x * .13 - z * .07)) * .20;
    add(x, y, z, glow * (river ? .28 : path ? .93 : .39), glow * (river ? .70 : path ? .71 : .87),
      glow * (river ? 1.1 : path ? .48 : .60), zone);
  }
  for (let i = 0; i < (dense ? 13500 : 6000); i += 1) {
    const x = (random() - .5) * 160;
    const z = -242 + random() * 155;
    const h = .22 + random() * .73;
    add(x, terrainHeight(x, z) + h, z, .25, .64 + random() * .18, .39, 'grass');
  }
  for (const [cx, cy, cz, sx, sz] of [[-49, 61, -138, 20, 9], [44, 65, -182, 25, 11], [1, 72, -231, 30, 12]]) {
    for (let i = 0; i < (dense ? 4200 : 1800); i += 1) {
      const x = cx + (random() - .5) * sx * 2;
      const z = cz + (random() - .5) * sz * 2;
      const y = cy + (random() - .5) * 3.8 + Math.sin(x * .2 + z * .11) * .8;
      const light = .44 + random() * .4;
      add(x, y, z, light, light, light * 1.1, 'cloud');
    }
  }
  // 远山接续五峰后方，减少“模型摆在黑色空盒里”的断裂感。
  for (let i = 0; i < (dense ? 44000 : 16500); i += 1) {
    const x = (random() - 0.5) * 150;
    const z = -305 + random() * 57;
    const ridge = 7.8 * gaussian(x, z, -37, -282, 31, 24) + 11 * gaussian(x, z, 39, -291, 27, 18);
    const y = -1.8 + Math.sin(x * 0.12 + z * 0.16) * 0.9 + ridge + (random() - 0.5) * 0.15;
    const light = 0.20 + random() * 0.28;
    add(x, y, z, light * 0.72, light * 0.85, light, 'rock');
  }
  // 岩谷外仍有可见地平线与天穹，转向时不再落入空白盒子。
  for (let i = 0; i < (dense ? 63000 : 23000); i += 1) {
    const x = (random() - 0.5) * 184;
    const z = (random() - 0.5) * 300 - 30;
    if ((Math.abs(x) < 39 && z > -84 && z < 54) || (Math.abs(x) < 96 && z <= -75 && z > -251)) continue;
    const d = Math.hypot(x * 0.75, z * 0.55);
    const fade = clamp((135 - d) / 65, 0, 1);
    if (random() > fade) continue;
    const y = -2.7 + Math.sin(x * 0.14 + z * 0.06) * 0.62 + Math.cos(z * 0.11) * 0.48;
    const light = (0.20 + random() * 0.26) * fade;
    add(x, y, z, light * 0.72, light * 0.94, light * 0.82, 'grass');
  }
  for (let i = 0; i < (dense ? 23000 : 8000); i += 1) {
    const angle = random() * Math.PI * 2;
    const elevation = 0.10 + random() * 1.14;
    const radius = 170 + random() * 49;
    const x = Math.cos(angle) * Math.cos(elevation) * radius;
    const z = -67 + Math.sin(angle) * Math.cos(elevation) * radius;
    const y = Math.sin(elevation) * radius;
    const band = Math.sin(angle * 14 + elevation * 6) > 0.78 ? 1.5 : 0.42;
    const light = (0.15 + random() * 0.29) * band;
    add(x, y, z, light * 0.75, light * 0.9, light, 'sky');
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('zoneColor', new THREE.Float32BufferAttribute(zoneColors, 3));
  geometry.setAttribute('glyph', new THREE.Float32BufferAttribute(glyphs, 1));
  geometry.setAttribute('zoneId', new THREE.Float32BufferAttribute(zoneIds, 1));
  geometry.computeBoundingSphere();
  const material = new THREE.ShaderMaterial({
    vertexColors: true,
    transparent: false,
    depthTest: true,
    depthWrite: true,
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: renderer.getPixelRatio() }, uPaletteMix: { value: 0.62 }, uStageDim: { value: 0 },
      uMotifAtlas: { value: null }, uGlyphReady: { value: 0 }, uGlyphMix: { value: 1 },
      uPulseOrigin: { value: new THREE.Vector3(0, -100, 0) }, uPulseStart: { value: -100 } },
    vertexShader: `
      attribute vec3 zoneColor;
      attribute float glyph;
      attribute float zoneId;
      varying vec3 vColor;
      varying float vDepth;
      varying float vGlyph;
      varying float vZone;
      varying float vPointSize;
      varying float vPulse;
      varying float vGlow;
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uPaletteMix;
      uniform vec3 uPulseOrigin;
      uniform float uPulseStart;
      void main() {
        vec3 moving = position;
        moving.y += sin(uTime * .63 + position.x * .22 + position.z * .17) * .035;
        if (zoneId > .5 && zoneId < 1.5) {
          moving.x += sin(uTime * 1.3 + position.z * 1.15) * .055;
        } else if (zoneId > 1.5 && zoneId < 2.5) {
          float phase = fract(sin(dot(position.xz, vec2(12.71, 78.23))) * 43758.5);
          moving.z += fract(uTime * .21 + phase) * 2.1;
          moving.x += sin(uTime * 2.2 + position.z * .75) * .12;
          moving.y += sin(uTime * 4.3 - position.z * 1.15 + position.x * 1.2) * .10;
        } else if (zoneId > 2.5 && zoneId < 3.5) {
          moving.x += sin(uTime * .24 + position.z * .12) * .28;
          moving.y += sin(uTime * .45 + position.x * .28) * .11;
        } else if (zoneId > 4.5 && zoneId < 5.5) {
          moving.y += sin(uTime * 2.1 + position.x * 1.9 + position.z) * .13;
        }
        float age = uTime - uPulseStart;
        float dist = distance(position.xz, uPulseOrigin.xz);
        vPulse = age > 0.0 && age < 3.5 ? exp(-pow((dist - age * 8.0) / 2.4, 2.0)) * (1.0 - age / 3.5) : 0.0;
        moving.y += vPulse * .54;
        vec4 view = modelViewMatrix * vec4(moving, 1.0);
        vDepth = -view.z;
        vColor = mix(color, zoneColor, uPaletteMix) + vec3(.38, .27, .11) * vPulse;
        vGlyph = glyph;
        vZone = zoneId;
        vGlow = zoneId > 4.5 && zoneId < 5.5 ? .27 + .22 * sin(uTime * 2.7 + position.y * 3.1)
          : zoneId > 1.5 && zoneId < 2.5 ? .22 + .24 * sin(uTime * 3.2 - position.z * 1.3) : 0.0;
        gl_Position = projectionMatrix * view;
        vPointSize = clamp(118.0 / max(1.0, vDepth), 2.1, 10.8) * uPixelRatio;
        gl_PointSize = vPointSize;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vDepth;
      varying float vGlyph;
      varying float vZone;
      varying float vPointSize;
      varying float vPulse;
      varying float vGlow;
      uniform sampler2D uMotifAtlas;
      uniform float uGlyphReady;
      uniform float uGlyphMix;
      uniform float uStageDim;
      void main() {
        float r = length(gl_PointCoord - vec2(.5));
        if (r > .48) discard;
        float core = 1.0 - smoothstep(.09, .48, r);
        float shape = core;
        if (vZone < 1.5 || vZone > 2.5) if (uGlyphReady > .5 && uGlyphMix > .01) {
          vec2 local = vec2(.04) + gl_PointCoord * .92;
          vec2 uv = (vec2(mod(vGlyph, 4.0), floor(vGlyph / 4.0)) + local) / vec2(4.0, 2.0);
          float motif = texture2D(uMotifAtlas, uv).a;
          float close = smoothstep(3.0, 7.5, vPointSize) * uGlyphMix;
          shape = mix(core, motif, close * .96);
        }
        if (shape < .18) discard;
        float fog = exp(-vDepth * .0045);
        vec3 color = pow(vColor, vec3(.69)) * (0.72 + shape * .55 + vPulse * .42 + vGlow) * fog * (1.0 - uStageDim);
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
  const cloud = new THREE.Points(geometry, material);
  cloud.frustumCulled = false;
  world.add(cloud);

  const dustPositions = [];
  for (let i = 0; i < (dense ? 1800 : 800); i += 1) {
    const x = (random() - 0.5) * 40;
    const z = (random() - 0.5) * 110 - 18;
    dustPositions.push(x, terrainHeight(x, z) + 0.8 + random() * 16, z);
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: 0xd7c9a8, size: 0.07, transparent: true, opacity: 0.38, sizeAttenuation: true, depthWrite: false }));
  world.add(dust);
  let motifLayer = null;
  let motifCount = 0;
  let livingLayer = null;
  let volcanoLayer = null;
  let videoLayer = null;
  let livingNames = [];
  installLibraryMotifs(world, terrainHeight).then(result => {
    motifLayer = result.group;
    motifCount = result.count;
    motifLayer.visible = motifsButton.getAttribute('aria-pressed') === 'true';
    material.uniforms.uMotifAtlas.value = result.atlas;
    material.uniforms.uGlyphReady.value = 1;
    videoLayer = createVideoParticlePlayer(world, result.atlas);
    try {
      volcanoLayer = installFiveVolcanoes(world, terrainHeight, result.atlas, dense);
      motifCount += volcanoLayer.pointCount;
    } catch (error) {
      console.error('五座火山载入失败', error);
      statusLabel.textContent = '五座火山未能载入';
    }
    motifsButton.title = '草地为卷草纹、步道为盘长结、云层为哈木尔纹；河流只保留水流粒子与踏石';
    installLivingMotifs(world, terrainHeight, result.atlas).then(living => {
      livingLayer = living;
      livingNames = living.loaded;
      motifCount += living.count;
      living.setMotifs(motifsButton.getAttribute('aria-pressed') === 'true');
      sightlineList.replaceChildren();
      for (const form of living.group.children) {
        if (form.userData.ambientPlacement) continue;
        if (form.userData.kind === 'emblem' && !sightlineList.querySelector('.emblem-group-title')) {
          const title = document.createElement('span');
          title.className = 'sightline-group-title emblem-group-title';
          title.textContent = '新加入的纹样母题';
          sightlineList.append(title);
        }
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = form.name;
        button.addEventListener('click', () => focusForm(form));
        sightlineList.append(button);
      }
      if (volcanoLayer) {
        const title = document.createElement('span');
        title.className = 'sightline-group-title';
        title.textContent = '五座纹样火山 · 点击近看';
        sightlineList.append(title);
        for (const peak of volcanoLayer.peaks) {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = peak.name;
          button.addEventListener('click', () => focusForm(peak));
          sightlineList.append(button);
        }
      }
      if (living.failed.length) statusLabel.textContent = `部分动态粒子未载入（${living.failed.length} 项）`;
    }).catch(error => {
      console.error('生命纹样粒子未能载入', error);
      statusLabel.textContent = '部分动态粒子未载入';
    });
  }).catch(error => {
    motifsButton.disabled = true;
    motifsButton.title = `纹样素材加载失败：${error.message}`;
    console.error('纹样素材加载失败', error);
  });

  const route = new THREE.CatmullRomCurve3([
    [0, 34, 59], [-7, 27, 39], [-2, 17, 25], [2, 8, 11],
    [-2, 4.2, -7], [3, 4.7, -24], [-3, 5.6, -42], [0, 7, -61],
    [-2, 9, -77], [0, 17, -89], [0, 24, -100]
  ].map(p => new THREE.Vector3(...p)), false, 'centripetal');

  const state = { progress: 0, playing: false, duration: 34000, lastTime: 0, yaw: 0, pitch: 0, dragging: false, x: 0, y: 0,
    mode: 'route', freeYaw: 0, freePitch: 0, targetYaw: 0, targetPitch: 0,
    freePosition: new THREE.Vector3(), gliding: true, focusHold: false, focusTarget: null, focusStart: 0,
    focusOrbitYaw: 0, focusOrbitPitch: 0, focusManual: false,
    focusFrom: new THREE.Vector3(), resumePosition: new THREE.Vector3(), resumeQuaternion: new THREE.Quaternion(),
    resumeFrom: new THREE.Vector3(), resumeFromQuaternion: new THREE.Quaternion(), resumeStart: 0,
    resumeYaw: 0, resumePitch: 0, resuming: false,
    glideSpeed: 0.035, keys: new Set(), downX: 0, downY: 0 };
  function drawFreeCamera() {
    const direction = new THREE.Vector3(Math.sin(state.freeYaw) * Math.cos(state.freePitch), Math.sin(state.freePitch), -Math.cos(state.freeYaw) * Math.cos(state.freePitch));
    camera.position.copy(state.freePosition);
    camera.lookAt(state.freePosition.clone().add(direction));
    camera.rotateZ(clamp((state.targetYaw - state.freeYaw) * -0.05, -0.025, 0.025));
    if (!state.focusHold) statusLabel.textContent = state.gliding ? '自由遨游' : '已停止滑翔';
  }
  function constrainFreePosition() {
    state.freePosition.x = clamp(state.freePosition.x, -101, 101);
    state.freePosition.z = clamp(state.freePosition.z, -260, 81);
    const insideValley = Math.abs(state.freePosition.x) < 38 && state.freePosition.z > -83 && state.freePosition.z < 52;
    const floor = insideValley ? terrainHeight(state.freePosition.x, state.freePosition.z) : -2.0;
    state.freePosition.y = clamp(state.freePosition.y, floor + 2.15, 46);
  }
  function moveFree(forward, right, up) {
    const look = new THREE.Vector3(Math.sin(state.freeYaw) * Math.cos(state.freePitch), Math.sin(state.freePitch), -Math.cos(state.freeYaw) * Math.cos(state.freePitch));
    const lateral = new THREE.Vector3(Math.cos(state.freeYaw), 0, Math.sin(state.freeYaw));
    state.freePosition.addScaledVector(look, forward).addScaledVector(lateral, right);
    state.freePosition.y += up;
    constrainFreePosition();
    drawFreeCamera();
  }
  function toggleFree(forceRoute = false) {
    state.resuming = false;
    const enter = !forceRoute && state.mode !== 'free';
    if (enter) {
      state.focusHold = false;
      setPlaying(false);
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      state.freePosition.copy(camera.position);
      constrainFreePosition();
      state.freeYaw = Math.atan2(direction.x, -direction.z);
      state.freePitch = Math.asin(clamp(direction.y, -1, 1));
      state.targetYaw = state.freeYaw;
      state.targetPitch = state.freePitch;
      state.gliding = true;
      state.mode = 'free';
      freeButton.textContent = '↩ 返回路线';
      freeButton.setAttribute('aria-pressed', 'true');
      glideButton.hidden = false;
      glideButton.textContent = '■ 停止滑翔';
      drawFreeCamera();
    } else {
      exitFocus();
      material.uniforms.uStageDim.value = 0;
      state.mode = 'route';
      state.keys.clear();
      freeButton.textContent = '✧ 自由遨游';
      freeButton.setAttribute('aria-pressed', 'false');
      glideButton.hidden = true;
      drawCamera();
    }
  }
  function focusForm(form) {
    if (state.mode !== 'free') toggleFree();
    if (!form) return;
    if (!state.focusHold && !state.resuming) {
      state.resumePosition.copy(state.freePosition);
      state.resumeQuaternion.copy(camera.quaternion);
      state.resumeYaw = state.freeYaw;
      state.resumePitch = state.freePitch;
    }
    state.resuming = false;
    setPlaying(false);
    state.gliding = false;
    state.focusHold = true;
    state.focusTarget = form;
    state.focusStart = performance.now();
    state.focusOrbitYaw = state.focusOrbitPitch = 0;
    state.focusManual = false;
    state.focusFrom.copy(camera.position);
    material.uniforms.uStageDim.value = 0.82;
    livingLayer?.focus(form, state.focusStart * 0.001);
    if (volcanoLayer) {
      const volcanoFocus = form.userData.kind === 'volcano';
      volcanoLayer.setVisible(volcanoFocus);
      if (volcanoFocus) volcanoLayer.focus(form);
    }
    if (videoLayer) videoLayer.stop();
    glideButton.textContent = '▶ 继续遨游';
    focusTitle.textContent = form.name;
    focusReplay.textContent = form.userData.kind === 'volcano' ? '↺ 再看山体' : form.userData.video ? '↺ 重播动作' : '↺ 重播聚形';
    const story = focusStories[form.name];
    focusCopy.replaceChildren();
    if (story) {
      const labels = form.userData.kind === 'volcano'
        ? ['地貌灵感', '纹样转译', '观看线索'] : ['草原原型', '纹样转译', '观看线索'];
      for (const [index, key] of ['fact', 'design', 'observe'].entries()) {
        const section = document.createElement('section');
        section.className = 'focus-section';
        const heading = document.createElement('h3');
        heading.textContent = labels[index];
        const copy = document.createElement('p');
        copy.textContent = story[key];
        if (key === 'observe') copy.dataset.focusMotion = '';
        section.append(heading, copy);
        focusCopy.append(section);
      }
      focusSource.href = story.source;
      focusSource.hidden = false;
    } else {
      const copy = document.createElement('p');
      copy.textContent = form.userData.kind === 'volcano' ? form.userData.note
        : emblemStories[form.name] || (form.userData.kind === 'sun'
          ? '你提供的莲形纹样被采样为带厚度的彩色太阳粒子，持续旋转与发光。'
          : '从原视频的三个关键姿态采样，粒子在姿态间流动、聚散。');
      focusCopy.append(copy);
      focusSource.hidden = true;
    }
    focusPanel.hidden = false;
    focusPanel.classList.toggle('volcano-focus', form.userData.kind === 'volcano');
    if (form.userData.video && videoLayer) {
      const focusToken = state.focusStart;
      videoLayer.play(form, form.userData.video).then(ready => {
        if (state.focusTarget !== form || state.focusStart !== focusToken) return;
        const motion = focusCopy.querySelector('[data-focus-motion]');
        const status = ready ? '视频已载入，可重播观看。' : '视频暂未载入，当前显示静态设计图的粒子动作。';
        if (motion) motion.textContent = `${story.observe} ${status}`;
      });
    }
    statusLabel.textContent = `观察 · ${form.name}`;
    sightlines.open = false;
  }
  function exitFocus() {
    if (!state.focusHold) return;
    state.focusHold = false;
    state.focusTarget = null;
    focusPanel.hidden = true;
    focusPanel.classList.remove('volcano-focus');
    if (videoLayer) videoLayer.stop();
    material.uniforms.uStageDim.value = 0;
    if (livingLayer) livingLayer.focus(null, performance.now() * 0.001);
    if (volcanoLayer) {
      volcanoLayer.setVisible(true);
      volcanoLayer.focus(null);
    }
    state.resumeFrom.copy(camera.position);
    state.resumeFromQuaternion.copy(camera.quaternion);
    state.resumeStart = performance.now();
    state.resuming = true;
    glideButton.textContent = '▶ 继续滑翔';
    statusLabel.textContent = '返回遨游';
  }
  focusExit.addEventListener('click', exitFocus);
  focusReplay.addEventListener('click', () => { if (state.focusTarget) focusForm(state.focusTarget); });
  function updateFocusCamera(time) {
    const form = state.focusTarget;
    if (!form) return;
    const age = Math.max(0, (time - state.focusStart) * 0.001);
    const ease = 1 - Math.pow(1 - Math.min(1, age / (form.userData.kind === 'volcano' ? 2.25 : 1.45)), 3);
    const narrow = window.innerWidth < 900;
    const volcano = form.userData.kind === 'volcano';
    const distance = volcano ? (form.userData.index === 2 ? narrow ? 96 : 92 : narrow ? 104 : 90) : form.userData.kind === 'sun' ? 22 : form.userData.kind === 'emblem' ? 12.5 : narrow ? 10.8 : form.userData.animal ? 9.5 : 9.2;
    const targetY = form.position.y + (volcano ? form.userData.height * .63 : 0);
    // 先留出正面辨认原画的时间，再慢速环看背面与浮雕厚度。
    const orbit = volcano ? state.focusManual ? state.focusOrbitYaw : Math.max(0, age - 5) * .024 : 0;
    const destination = new THREE.Vector3(form.position.x + (volcano ? Math.sin(orbit) * distance : Math.sin(age * .45) * .38),
      targetY + (volcano ? 15.9 + state.focusOrbitPitch * distance * .32 + Math.sin(age * .31) * .75 : form.userData.animal ? .35 : .1),
      form.position.z + Math.cos(orbit) * distance);
    camera.position.copy(state.focusFrom).lerp(destination, ease);
    const horizontalAim = narrow ? volcano ? form.userData.index === 2 ? 9.5 : 5.5 : 2.8 : 0;
    camera.lookAt(form.position.x - horizontalAim, targetY, form.position.z);
    statusLabel.textContent = `观察 · ${form.name}`;
  }
  function pickLivingForm(clientX, clientY) {
    if (!livingLayer && !volcanoLayer) return null;
    world.updateMatrixWorld(true);
    let best = null, bestScore = Infinity;
    const candidates = [...(livingLayer?.group.visible ? livingLayer.group.children : []), ...(volcanoLayer?.peaks || [])];
    for (const form of candidates) {
      if (!form.visible || form.userData.ambientPlacement) continue;
      const centre = form.getWorldPosition(new THREE.Vector3());
      if (form.userData.kind === 'volcano') centre.y += form.userData.height * .55;
      const projected = centre.clone().project(camera);
      if (projected.z < -1 || projected.z > 1) continue;
      const distance = camera.position.distanceTo(centre);
      const pixelsPerUnit = window.innerHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * distance);
      const halfW = Math.max(23, form.userData.width * pixelsPerUnit * (form.userData.kind === 'volcano' ? .64 : .48));
      const halfH = Math.max(23, form.userData.height * pixelsPerUnit * .55);
      const dx = (clientX - (projected.x + 1) * window.innerWidth * 0.5) / halfW;
      const dy = (clientY - (1 - projected.y) * window.innerHeight * 0.5) / halfH;
      const score = dx * dx + dy * dy;
      if (score < 1.0 && score < bestScore) { best = form; bestScore = score; }
    }
    return best;
  }
  function drawCamera() {
    const t = state.progress;
    const position = route.getPointAt(t);
    const direction = t >= .98
      ? position.clone().sub(route.getPointAt(Math.max(0, t - .021))).normalize()
      : route.getPointAt(Math.min(1, t + .021)).sub(position).normalize();
    const heading = Math.atan2(direction.x, -direction.z) + state.yaw;
    // 放大的五峰需要更高的地平线视角；仍保留下降时的草原与河流。
    const flightTilt = t < 0.2 ? -0.18 + t * 0.2 : -0.14 + Math.min(0.10, (t - 0.2) * 0.13);
    const tilt = clamp(flightTilt + state.pitch, -0.7, 0.55);
    camera.position.copy(position);
    camera.lookAt(position.x + Math.sin(heading) * Math.cos(tilt) * 14, position.y + Math.sin(tilt) * 14, position.z - Math.cos(heading) * Math.cos(tilt) * 14);
    progressBar.style.transform = `scaleX(${t})`;
    statusLabel.textContent = t < .22 ? '高空俯瞰' : t < .66 ? '近地穿行' : t < .90 ? '进入草原' : '五峰远眺';
  }
  function setPlaying(value) {
    state.playing = value;
    if (value && state.progress >= 1) state.progress = 0;
    playButton.textContent = value ? 'Ⅱ 暂停穿行' : state.progress >= 1 ? '▶ 再看一遍' : state.progress > 0 ? '▶ 继续穿行' : '▶ 开始穿行';
  }
  playButton.addEventListener('click', () => { if (state.mode === 'free') toggleFree(true); setPlaying(!state.playing); });
  restartButton.addEventListener('click', () => { state.progress = 0; setPlaying(false); state.yaw = state.pitch = 0; material.uniforms.uStageDim.value = 0; if (state.mode === 'free') toggleFree(true); drawCamera(); });
  volcanoJump.addEventListener('click', () => {
    if (state.mode === 'free') toggleFree(true);
    setPlaying(false);
    state.progress = 1;
    state.yaw = state.pitch = 0;
    drawCamera();
  });
  freeButton.addEventListener('click', () => toggleFree());
  glideButton.addEventListener('click', () => {
    if (state.focusHold) exitFocus();
    if (state.resuming) {
      state.resuming = false;
      state.freePosition.copy(state.resumePosition);
      state.freeYaw = state.targetYaw = state.resumeYaw;
      state.freePitch = state.targetPitch = state.resumePitch;
    }
    state.gliding = !state.gliding;
    glideButton.textContent = state.gliding ? '■ 停止滑翔' : '▶ 继续滑翔';
    drawFreeCamera();
  });
  motifsButton.addEventListener('click', () => {
    const visible = motifsButton.getAttribute('aria-pressed') !== 'true';
    motifsButton.setAttribute('aria-pressed', String(visible));
    motifsButton.textContent = visible ? '纹样：开' : '纹样：关';
    if (motifLayer) motifLayer.visible = visible;
    if (livingLayer) livingLayer.setMotifs(visible);
    if (videoLayer) videoLayer.setMotifs(visible);
    volcanoLayer?.setVisible(visible);
    material.uniforms.uGlyphMix.value = visible ? 1 : 0;
  });
  paletteButton.addEventListener('click', () => {
    const enabled = paletteButton.getAttribute('aria-pressed') !== 'true';
    paletteButton.setAttribute('aria-pressed', String(enabled));
    paletteButton.textContent = enabled ? '环境色：开' : '环境色：关';
    material.uniforms.uPaletteMix.value = enabled ? 0.62 : 0;
    skyMaterial.uniforms.uColorMix.value = enabled ? 1 : 0;
    world.background.setHex(enabled ? 0x06142a : 0x020203);
    dust.material.color.setHex(enabled ? 0xb5cad8 : 0xd7c9a8);
  });
  world.background.setHex(0x06142a);
  dust.material.color.setHex(0xb5cad8);
  const gesture = createGestureControl(document.querySelector('#gesture-video'), {
    onStatus: message => { gestureStatus.textContent = message; },
    onOpen: () => {
      if (state.mode === 'free') {
        if (state.focusHold) exitFocus();
        state.gliding = false;
        glideButton.textContent = '▶ 继续滑翔';
        drawFreeCamera();
      } else setPlaying(false);
    },
    onFist: () => {
      if (state.mode !== 'free') toggleFree();
      if (state.focusHold) exitFocus();
      state.gliding = true;
      glideButton.textContent = '■ 停止滑翔';
      drawFreeCamera();
    },
    onPinch: () => {
      const target = pickLivingForm(window.innerWidth * 0.5, window.innerHeight * 0.5);
      if (target) focusForm(target);
      else if (state.focusHold && state.focusTarget) focusForm(state.focusTarget);
      else {
        const ray = new THREE.Raycaster();
        ray.setFromCamera(new THREE.Vector2(0, 0), camera);
        material.uniforms.uPulseOrigin.value.copy(ray.ray.at(18, new THREE.Vector3()));
        material.uniforms.uPulseStart.value = performance.now() * 0.001;
        gestureStatus.textContent = '已确认镜头中心 · 纹样波已触发';
      }
    }
  });
  gestureButton.addEventListener('click', async () => {
    if (gesture.active) {
      gesture.stop();
      gestureButton.textContent = '手势：关';
      gestureButton.setAttribute('aria-pressed', 'false');
      gestureView.hidden = gaze.hidden = true;
      return;
    }
    gestureButton.disabled = true;
    gestureView.hidden = false;
    try {
      await gesture.start();
      gestureButton.textContent = '手势：开';
      gestureButton.setAttribute('aria-pressed', 'true');
      gaze.hidden = false;
    } catch (error) {
      gestureStatus.textContent = `无法开启：${error.message}`;
      gaze.hidden = true;
    } finally { gestureButton.disabled = false; }
  });
  window.addEventListener('pagehide', () => gesture.stop());
  canvas.addEventListener('pointerdown', event => {
    state.dragging = true;
    state.x = state.downX = event.clientX;
    state.y = state.downY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (!state.dragging) {
      canvas.classList.toggle('is-pickable', !state.focusHold && !!pickLivingForm(event.clientX, event.clientY));
      return;
    }
    if (state.mode === 'free') {
      if (!state.dragging) return;
      if (state.focusHold) {
        if (state.focusTarget?.userData.kind === 'volcano') {
          if (!state.focusManual) {
            state.focusOrbitYaw = Math.max(0, (performance.now() - state.focusStart) * .001 - 5) * .024;
            state.focusManual = true;
          }
          state.focusOrbitYaw -= clamp(event.clientX - state.x, -80, 80) * .006;
          state.focusOrbitPitch = clamp(state.focusOrbitPitch + clamp(event.clientY - state.y, -80, 80) * .0035, -.60, .60);
        }
        state.x = event.clientX; state.y = event.clientY;
        return;
      }
      if (state.dragging) {
        state.targetYaw -= clamp(event.clientX - state.x, -80, 80) * 0.0035;
        state.targetPitch = clamp(state.targetPitch + clamp(event.clientY - state.y, -80, 80) * 0.0027, -1.1, 0.88);
      }
    } else {
      if (!state.dragging) return;
      state.yaw = clamp(state.yaw - (event.clientX - state.x) * 0.004, -1.05, 1.05);
      state.pitch = clamp(state.pitch + (event.clientY - state.y) * 0.003, -0.48, 0.48);
    }
    state.x = event.clientX; state.y = event.clientY;
    if (state.mode === 'route' && !state.playing) drawCamera();
  });
  canvas.addEventListener('pointerleave', () => canvas.classList.remove('is-pickable'));
  canvas.addEventListener('pointerup', event => {
    if (state.dragging && Math.hypot(event.clientX - state.downX, event.clientY - state.downY) < 6) {
      const picked = pickLivingForm(event.clientX, event.clientY);
      if (picked) { focusForm(picked); state.dragging = false; return; }
      if (state.focusHold) { state.dragging = false; return; }
      const ndc = new THREE.Vector2(event.clientX / window.innerWidth * 2 - 1, 1 - event.clientY / window.innerHeight * 2);
      const ray = new THREE.Raycaster();
      ray.setFromCamera(ndc, camera);
      let target = ray.ray.at(18, new THREE.Vector3());
      let groundHit = false;
      for (let distance = 2; distance < 90; distance += 1.5) {
        const point = ray.ray.at(distance, new THREE.Vector3());
        if (point.y <= terrainHeight(point.x, point.z) + 0.15) { target = point; groundHit = true; break; }
      }
      if (groundHit) target.y = terrainHeight(target.x, target.z);
      material.uniforms.uPulseOrigin.value.copy(target);
      material.uniforms.uPulseStart.value = performance.now() * 0.001;
      const animalSites = [[-5.4, 7], [5.1, -9], [-5.1, -26], [5.5, -43], [-5.5, -63]];
      const riverCentre = 8 + Math.sin(target.z * 0.09 + 0.8) * 2.3;
      const key = !groundHit ? 'cloud'
        : animalSites.some(([x, z]) => Math.hypot(target.x - x, target.z - z) < 6.5) ? 'herd'
        : volcanoLayer?.peaks.some(peak => Math.hypot(target.x - peak.position.x, target.z - peak.position.z) < peak.userData.width * .5 + 3) ? 'volcano'
        : Math.abs(target.x - riverCentre) < 3 ? 'river'
        : Math.abs(target.x - Math.sin(target.z * 0.095) * 2.5) < 3.5 ? 'path'
        : Math.abs(target.x) < 24 ? 'grass' : 'rock';
      reveal(key);
    }
    state.dragging = false;
  });
  canvas.addEventListener('pointercancel', () => { state.dragging = false; });
  canvas.addEventListener('wheel', event => {
    event.preventDefault();
    if (state.mode === 'free') {
      state.glideSpeed = clamp(state.glideSpeed - event.deltaY * 0.00004, 0.003, 0.10);
    }
    else { setPlaying(false); state.progress = clamp(state.progress + event.deltaY * 0.00015, 0, 1); drawCamera(); }
  }, { passive: false });
  window.addEventListener('keydown', event => {
    if (event.code === 'Escape' && state.focusHold) { exitFocus(); return; }
    if (event.code === 'Space') {
      event.preventDefault();
      if (state.mode === 'free') glideButton.click();
      else setPlaying(!state.playing);
    }
    if (event.key.toLowerCase() === 'r') restartButton.click();
    if (state.mode === 'free' && ['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyQ','KeyE','ShiftLeft','ShiftRight'].includes(event.code)) {
      event.preventDefault(); state.keys.add(event.code);
    }
  });
  window.addEventListener('keyup', event => state.keys.delete(event.code));
  window.addEventListener('blur', () => state.keys.clear());
  window.addEventListener('resize', () => {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
    camera.aspect = window.innerWidth / Math.max(1, window.innerHeight);
    camera.updateProjectionMatrix();
  });

  drawCamera();
  statusLabel.textContent = '高空俯瞰';
  window.__pointCloudStudy = { points: positions.length / 3, get motifPoints() { return motifCount; }, get livingForms() { return livingNames; },
    get volcanoes() { return volcanoLayer?.peaks.map(peak => peak.name) || []; }, get progress() { return state.progress; },
    get playing() { return state.playing; }, get mode() { return state.mode; }, get gliding() { return state.gliding; },
    get freePosition() { return state.freePosition.toArray(); },
    get animalActivity() { return livingLayer?.getAnimalStates() || []; } };
  function frame(time) {
    const delta = state.lastTime ? Math.min(80, time - state.lastTime) : 0;
    state.lastTime = time;
    if (state.playing) {
      state.progress = Math.min(1, state.progress + delta / state.duration);
      if (state.progress >= 1) setPlaying(false);
      drawCamera();
    }
    if (state.mode === 'free' && state.focusHold) updateFocusCamera(time);
    if (state.mode === 'free' && state.resuming) {
      const t = clamp((time - state.resumeStart) / 950, 0, 1);
      const ease = t * t * (3 - 2 * t);
      camera.position.copy(state.resumeFrom).lerp(state.resumePosition, ease);
      camera.quaternion.copy(state.resumeFromQuaternion).slerp(state.resumeQuaternion, ease);
      if (t >= 1) {
        state.resuming = false;
        state.freePosition.copy(state.resumePosition);
        state.freeYaw = state.targetYaw = state.resumeYaw;
        state.freePitch = state.targetPitch = state.resumePitch;
        drawFreeCamera();
      }
    }
    if (state.mode === 'free' && !state.focusHold && !state.resuming) {
      const smooth = clamp(delta * 0.008, 0, 1);
      state.freeYaw += (state.targetYaw - state.freeYaw) * smooth;
      state.freePitch += (state.targetPitch - state.freePitch) * smooth;
      const fast = state.keys.has('ShiftLeft') || state.keys.has('ShiftRight') ? 2.5 : 1;
      const step = delta * 0.021 * fast;
      const forward = (state.keys.has('KeyW') || state.keys.has('ArrowUp') ? 1 : 0) - (state.keys.has('KeyS') || state.keys.has('ArrowDown') ? 1 : 0);
      const right = (state.keys.has('KeyD') || state.keys.has('ArrowRight') ? 1 : 0) - (state.keys.has('KeyA') || state.keys.has('ArrowLeft') ? 1 : 0);
      const up = (state.keys.has('KeyE') ? 1 : 0) - (state.keys.has('KeyQ') ? 1 : 0);
      moveFree((state.gliding ? state.glideSpeed * delta : 0) + forward * step, right * step, up * step);
    }
    material.uniforms.uTime.value = time * 0.001;
    skyMaterial.uniforms.uTime.value = time * 0.001;
    dust.rotation.y = Math.sin(time * 0.0001) * 0.005;
    if (motifLayer) motifLayer.children.forEach((form, index) => {
      if (index >= 5) {
        form.position.y = Math.sin(time * 0.0011 + index * 1.7) * 0.085;
        form.position.x = Math.sin(time * 0.00043 + index * 2.3) * 0.07;
      } else if (index >= 3) {
        form.position.x = Math.sin(time * 0.0003 + index) * 0.12;
      }
    });
    if (livingLayer) livingLayer.update(time * 0.001, camera, !state.focusHold && !state.resuming);
    if (volcanoLayer) volcanoLayer.update(time * 0.001, camera);
    if (videoLayer) videoLayer.update(time * 0.001);
    renderer.render(world, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
} catch (error) {
  errorBox.hidden = false;
  errorBox.textContent = `场景未能启动：${error.message}`;
  console.error(error);
}
