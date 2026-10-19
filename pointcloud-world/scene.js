import * as THREE from '../lib/three/three.module.js';
import {buildDreamMeadow} from './dream-meadow.js?v=3';
import {dreamSkyFragment} from './dream-sky.js?v=3';
import { buildTDLandscape } from './td-landscape.js?v=3';
import { createSelectiveGlow } from './selective-glow.js?v=3';
import { buildLandscapeStructure } from './terrain-network.js?v=4';
import { applyLuminousPreset } from './luminous-surface.js?v=8';
import { installLibraryMotifs } from './motifs.js?v=6';
import { installLivingMotifs } from './living-motifs.js?v=36';
import { createGestureControl } from './gesture-control.js?v=1';
import { createVideoParticlePlayer } from './video-particles.js?v=7';
import { installFiveVolcanoes } from './volcano-world.js?v=86';

const canvas = document.querySelector('#world');
const playButton = document.querySelector('#play');
const travelMenuToggle = document.querySelector('#travel-menu-toggle');
let travelExpanded = false;
const restartButton = document.querySelector('#restart');
const freeButton = document.querySelector('#free');
const glideButton = document.querySelector('#glide');
const gestureButton = document.querySelector('#gesture');
const gestureView = document.querySelector('#gesture-view');
const gestureStatus = document.querySelector('#gesture-status');
const gaze = document.querySelector('#gaze');
const motifsButton = document.querySelector('#motifs');
const paletteButton = document.querySelector('#palette');
const controlSettings = document.querySelector('#control-settings');
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
const focusActivity=document.querySelector('#focus-activity');
const volcanoJump = document.querySelector('#volcano-jump');
const coCreateEmbedded = new URLSearchParams(location.search).get('embed') === 'co-create';
// 草原知识与现代纹样转译分开呈现；设计图不是品种图鉴，五峰也不是真实地形扫描。
const focusStories = {
  '蒙古马': {
    fact: '蒙古马体格紧实，以耐力和适应草原环境见长。看它奔跑时，头颈、鬃毛与四肢会形成连续的方向线。',
    design: '青绿、米金色纹样沿胸肩和躯干展开。粒子保留原稿的鬃尾和装饰，动作逐帧取自你提供的原视频，不重建肢体、不改写纹样。',
    observe: '点击“播放原片动作”查看原视频中的奔跑，暂停后观察原稿纹样，退出特写继续在场景播放。',
    source: 'https://nmt.nmg.gov.cn/xw/msdt/xlgl/202510/t20251031_2810851.html'
  },
  '蒙古牛': {
    fact: '蒙古牛体躯结实、额部宽阔，角向前上方伸展；长期放牧使它具有适应草原环境的特点。',
    design: '画面以朱红和深蓝塑造两头牛，角与肩背保留有力轮廓，云纹和回纹则把厚重的身体转译成可以流动的装饰面。',
    observe: '播放原片动作，观察两头牛的低头、抬头和身体转向；暂停后可以细看肩背、角与云纹。',
    source: 'https://nmt.nmg.gov.cn/yw/nszd/xlgl/202205/t20220525_2061381.html'
  },
  '绵羊': {
    fact: '蒙古羊是适应草原放牧的地方绵羊，体质结实；公羊常见弯曲的角。这里的“绵羊”与山羊是两种不同的形象。',
    design: '原画把丰厚被毛处理为蓝白相间的卷云纹团，柔软的曲线与山羊较利落的身形形成对照。',
    observe: '近看卷云纹如何围合圆润被毛，再点击“播放原片动作”查看原视频中的吃草和慢步。羊角与原稿配色保持一致。',
    source: 'https://nmt.nmg.gov.cn/yw/pzzy/cqpz/202502/t20250227_2673221.html'
  },
  '山羊': {
    fact: '内蒙古部分绒山羊品种以细软羊绒见长，身形紧凑，能适应草原放牧。画中的盘角与颜色经过艺术夸张，不指认某个具体品种。',
    design: '青绿身体、橙金盘角与身上的花形、几何纹样共同表现山羊形象，动作与配色沿用原片。',
    observe: '先看盘角与头颈，再看前腿收放和躯干重心。动作由参考视频逐帧转成粒子，停顿处更容易辨认纹样结构。',
    source: 'https://nmj.xlgl.gov.cn/nmj/nmyw/syjs/dea954244c2f47bab7a40f7ce3c49dc3/index.html'
  },
  '骆驼': {
    fact: '草原地区的双峰驼以两座驼峰、长颈和宽厚足掌辨识，能适应干旱与寒冷环境。',
    design: '原画用深蓝与朱红安排两匹驼，云纹穿过驼峰，飘带延长行进方向；它是带地域意象的当代插画，不是动物标本。',
    observe: '注意驼峰随步态轻微起伏、前后肢交替落地；近景应先读出双峰轮廓，再看到身上的细纹。',
    source: 'https://www.sntzq.gov.cn/eportal/ui?articleKey=7977af9c2e8b469781ed16a32f2eca94b5&columnId=bd9019f528324c03ad77bc5f2eca94b5&pageId=96e9e64587e3455aa7cc4b5ef92ee23a'
  },
  '设计峰01 · 黑脑包（景区4号）· 蝶莲焰': {
    fact: '黑脑包是乌兰哈达火山群的火山名称，对应景区编号4号。这里的“设计峰01”只是作品内的展示顺序；模型按宽肩缓坡做艺术化表达，不代表实地位置或地形复原。',
    design: '第一张原画的宽阔山肩、双蝶与火口莲焰被拆为有纵深的粒子层；蓝底云纹沿山坡绕行，暖金色把视线引向火口。',
    observe: '从正面辨认双蝶，再拖拽镜头看山身纹带如何绕到侧面。',
    source: 'https://www.spp.gov.cn/spp/zdgz/202410/t20241031_670524.shtml'
  },
  '设计峰02 · 北炼丹炉（景区3号）· 双翼宝石': {
    fact: '北炼丹炉对应景区编号3号，是乌兰哈达火山群中锥体保存较完整的火山之一。这里的“设计峰02”仅表示作品中的排列顺序；模型以收束锥坡作视觉呼应，不是实地测绘复原。',
    design: '第二张原画的菱格坡面成为层层抬升的山体，一对赤色蝠纹贴着上段坡面向两侧展开，火口菱形花纹收住视线；青、金纹线在侧面仍连续。',
    observe: '绕到侧面看蝠纹如何贴合锥坡转折、火口花纹与山体的层次，以及菱格如何连续环绕。',
    source: 'https://www.spp.gov.cn/spp/zdgz/202410/t20241031_670524.shtml'
  },
  '设计峰03 · 中炼丹炉（景区5号）· 龙凤日轮': {
    fact: '中炼丹炉对应景区编号5号；景区3号火山的名称是北炼丹炉。这里的“设计峰03”是作品展示序号，并非景区编号。模型的高度、坡面与龙凤日轮均为艺术化表达，不是实测数据。',
    design: '日轮与卷云构成顶部视觉中心；蓝色山体承接米金色云涡纹与回纹边饰，表面以曲面粒子表达凹凸层次。',
    observe: '先看日轮尖瓣与卷云环，再从斜侧观察纹样的弧面、浮雕起伏与前后层次。',
    source: 'https://www.spp.gov.cn/spp/zdgz/202410/t20241031_670524.shtml'
  },
  '设计峰04 · 南炼丹炉（景区6号）· 蝶火脉': {
    fact: '南炼丹炉对应景区编号6号。这里的“设计峰04”只是作品展示序号；阶梯坡面、红色火脉与蝶纹来自设计稿，红脉不代表真实裂缝或正在喷发。',
    design: '第四张原画的阶梯山形被重建为层层退进的坡面；中央红色火脉沿坡面上升，四只橙金蝶纹取自原稿并以圆润粒子贴坡错层展开。',
    observe: '沿火脉从山脚看到火口，再旋转镜头观察四只蝶纹如何贴合不同坡段。',
    source: 'https://www.spp.gov.cn/spp/zdgz/202410/t20241031_670524.shtml'
  },
  '设计峰05 · 北尖山（景区7号）· 夜翼回纹': {
    fact: '北尖山对应景区编号7号。这里的“设计峰05”是作品展示序号；收尖山顶、夜翼与回纹都属于艺术设计表达，不是实测地形或真实位置标注。',
    design: '第五张原画用三角山身承载连续回纹，四只青色蝠纹沿坡面错层呼应，火口花形与原稿颜色、轮廓对应，形成由下而上的视觉路径。',
    observe: '拖拽观察回纹在山体侧面的延续、四只蝠纹贴坡的前后层次和火口花形的位置。',
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
  // Diagnostic URL exercises the desktop particle/glow path in a narrow review panel.
  const motionAuditEnabled=new URLSearchParams(location.search).get('motion-audit')==='1';let lastMotionAudit=0;
  const verifyDesktopEffects=new URLSearchParams(location.search).get('desktop-effects')==='1';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  renderer.info.autoReset=false;
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const world = new THREE.Scene();
  const coCreateContributionGroup = new THREE.Group();
  world.add(coCreateContributionGroup);
  world.background = new THREE.Color(0x06142a);
  const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.12, 650);
  const brightnessControl=document.querySelector('#scene-brightness'),brightnessValue=document.querySelector('#scene-brightness-value');
  let sceneBrightness=1;
  try{const saved=Number(localStorage.getItem('mongol-scene-brightness'));if(saved>=.6&&saved<=1.5)sceneBrightness=saved;}catch{}
  function applySceneBrightness(){
    canvas.style.filter=`brightness(${sceneBrightness})`;
    if(brightnessControl)brightnessControl.value=sceneBrightness;
    if(brightnessValue)brightnessValue.textContent=`${Math.round(sceneBrightness*100)}%`;
  }
  applySceneBrightness();
  brightnessControl?.addEventListener('input',()=>{sceneBrightness=Math.max(.6,Math.min(1.5,Number(brightnessControl.value)));applySceneBrightness();try{localStorage.setItem('mongol-scene-brightness',String(sceneBrightness));}catch{}});
  const localGlow = createSelectiveGlow(renderer,world,camera);
  localGlow.enabled = verifyDesktopEffects; // Surface shaders supply the glow; avoid an empty extra scene pass.
  // 星云绘制在球形天穹上，转向和飞行时不会露出黑色盒子的边界。
  const skyMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthTest: false, depthWrite: false, fog: false,
    uniforms: { uTime: { value: 0 }, uColorMix: { value: 1 } },
    vertexShader: `varying vec3 vSky; void main() { vSky = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: dreamSkyFragment
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(450, 40, 24), skyMaterial);
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
    grass: ['草地 · 卷草纹转译', '草地微粒改用连续枝蔓、回旋卷须与叶片组成的卷草纹单元，沿地表疏密铺排。这是本项目的形态转译，不冒称历史纹样原件。', '../pattern_visuals/grass-scroll-modern-v1.svg'],
  river: ['河流 · 流水与踏石', '河面保留蓝青色流动粒子和浅色踏石，不叠加纹样。', '../pattern_visuals/river-stones-modern-v1.svg'],
    cloud: ['云层 · 卷云纹粒子', '云团使用相连云头与回旋云涡组成的卷云纹微粒；哈木尔鼻纹是另一类素材，不再当作云纹展示。', '../pattern_visuals/cloud-scroll-modern-v1.svg'],
    volcano: ['03火山 · 日轮与环形云纹', '山顶中心是带放射尖瓣的太阳纹（日轮），外圈由连续卷云纹围合；山身蓝底承接云涡纹与几何回纹边饰。目前保留日轮与云纹，龙凤装饰暂时移除。', './reference-frames/volcano-3.jpg'],
    herd: ['五畜 · 彩色粒子群', '马、牛、绵羊、山羊、骆驼从你提供的五张设计图提取形态与颜色，用微纹样粒子聚形；目前是有厚度的粒子雕塑，并非完整360°动物建模。', './reference-frames/horse.jpg'],
  rock: ['红层台地 · 地貌意象', '两翼高崖借鉴乌兰察布红崖台地的赭红层理与侵蚀轮廓，是与五座纹样火山并置的艺术化场景，不代表两处地貌真实相邻。', '../pattern_visuals/redbed-cliffs-modern-v1.svg']
  };
  function reveal(key) {
    const [title, copy, source] = discoveries[key];
    foundPlaces.add(key);
    foundLabel.textContent = `已发现 ${foundPlaces.size} / 7 处纹样`;
    discoveryImage.src = source;
    discoveryImage.alt = title;
    discoveryImage.style.filter = ['herd', 'volcano', 'river', 'rock'].includes(key) ? 'none' : 'brightness(0) invert(1) drop-shadow(0 0 5px #d6b574)';
    discoveryTitle.textContent = title;
    discoveryCopy.textContent = copy;
    discoveryCard.hidden = false;
  }

  function rawTerrainHeight(x, z) {
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

  const volcanoGroundExclusions = [
    [-62, -153, 32], [75, -200, 30], [0, -250, 40], [110, -100, 29], [-85, -52, 28]
  ];
  function terrainHeight(x, z) {
    let height = rawTerrainHeight(x, z);
    for (const [cx, cz, radius] of volcanoGroundExclusions) {
      const distance = Math.hypot(x - cx, z - cz);
      if (distance >= radius + 16) continue;
      const t = clamp((distance - radius - 2) / 14, 0, 1);
      const blend = t * t * (3 - 2 * t);
      height = rawTerrainHeight(cx, cz) * (1 - blend) + height * blend;
    }
    return height;
  }
  const underVolcanoBase = (x, z) => volcanoGroundExclusions.some(([cx, cz, radius]) => Math.hypot(x - cx, z - cz) < radius);

  const pathCentreAt = z => Math.sin(z * 0.095) * 2.5;
  const riverCentreAt = z => 8 + Math.sin(z * 0.09 + 0.8) * 2.3;

  // A quiet, continuous substrate fills the gap beneath the particle landscape.
  // Its height uses the same terrain function as the volcano bases and cliff feet.
  const terrainBedGeometry = new THREE.PlaneGeometry(410, 530, 136, 176);
  const bedPositions = terrainBedGeometry.attributes.position;
  const bedColors = new Float32Array(bedPositions.count * 3);
  const bedZ = new Float32Array(bedPositions.count);
  const bedBackground = new THREE.Color(0x06142a);
  const bedGrass = new THREE.Color(0x203d32);
  const bedRock = new THREE.Color(0x272d36);
  const bedColor = new THREE.Color();
  for (let i = 0; i < bedPositions.count; i += 1) {
    const x = bedPositions.getX(i);
    const z = bedPositions.getY(i) - 120;
    bedZ[i] = z;
    const radial = (Math.abs(x / 204) ** 4) + (Math.abs((z + 120) / 265) ** 4);
    const edge = clamp((1 - radial) / .12, 0, 1);
    const meadow = Math.sin(x * .105 + z * .043) + Math.cos(z * .08 - x * .06) > .48;
    const groundColor = meadow ? bedGrass : bedRock;
    const variation = .72 + .15 * Math.sin(x * .07 + z * .035) + .12 * Math.cos(z * .06 - x * .08);
    // Keep the visual substrate beneath point-built volcano bases; the old -.22
    // offset intersected their roots and produced the broad dark wedge in orbit view.
    bedPositions.setXYZ(i, x, terrainHeight(x, z) - .62, z);
    bedColor.copy(bedBackground).lerp(groundColor, edge * variation);
    bedColors.set([bedColor.r, bedColor.g, bedColor.b], i * 3);
  }
  terrainBedGeometry.setAttribute('color', new THREE.BufferAttribute(bedColors, 3));
  // Clip the outer grid to an oval boundary so the ground fades into the sky rather than ending as a rectangle.
  const bedSourceIndices = terrainBedGeometry.index.array;
  const bedIndices = [];
  for (let i = 0; i < bedSourceIndices.length; i += 3) {
    const a = bedSourceIndices[i], b = bedSourceIndices[i + 1], c = bedSourceIndices[i + 2];
    const cx = (bedPositions.getX(a) + bedPositions.getX(b) + bedPositions.getX(c)) / 3;
    const cz = (bedZ[a] + bedZ[b] + bedZ[c]) / 3;
    if ((Math.abs(cx / 204) ** 4) + (Math.abs((cz + 120) / 265) ** 4) <= 1.015) bedIndices.push(a, b, c);
  }
  terrainBedGeometry.setIndex(bedIndices);
  terrainBedGeometry.computeVertexNormals();
  const terrainBed = new THREE.Mesh(terrainBedGeometry, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, color:0xb4c5bc }));
  terrainBed.position.y = 0;
  terrainBed.renderOrder = -2;
  terrainBed.frustumCulled = false;
  world.add(terrainBed);

  function add(x, y, z, r, g, b, zone = 'rock') {
    positions.push(x, y, z);
    // A fixed grazing light follows the real ground normal; the same samples feed the local structure lines.
    if(zone==='grass'||zone==='rock') {
      const sx=(terrainHeight(x+.4,z)-terrainHeight(x-.4,z))/.8;
      const sz=(terrainHeight(x,z+.4)-terrainHeight(x,z-.4))/.8;
      const light=clamp((.78+sx*.28-sz*.32)/Math.sqrt(1+sx*sx+sz*sz),.3,1.18);
      r*=light;g*=light;b*=light;
    }
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
      : zone === 'grass' ? 7 : zone === 'cloud' ? 1 : variation > 0.35 ? 1 : 0);
    zoneIds.push(({ rock: 0, grass: 1, river: 2, cloud: 3, volcano: 4, lava: 5, path: 6, sky: 7, redbed: 0 })[zone] ?? 0);
  }

  const dense = window.innerWidth >= 900 || verifyDesktopEffects;
  const groundCount = dense ? 120000 : 65000;
  for (let i = 0; i < groundCount; i += 1) {
    let x = (random() - 0.5) * 77;
    let z = -83 + random() * 135;
    const edgeFade = clamp(Math.min((38.5 - Math.abs(x)) / 10, (z + 83) / 17, (52 - z) / 17), 0, 1);
    if (random() > edgeFade) continue;
    // 局部扫描行和断裂空白让点云接近参考视频的“扫描地貌”，避免机械均匀噪点。
    if (random() < 0.64) z = Math.round(z / 0.13) * 0.13 + (random() - 0.5) * 0.037;
    if (random() < 0.045 && Math.sin(x * 0.86 + z * 0.28) < 0.4) continue;
    x += (random() - 0.5) * 0.035;
    if (underVolcanoBase(x, z)) continue;
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
    const zone = Math.abs(x - riverCentre) < 1.8 ? 'river' : Math.abs(x - pathCentre) < 3.25 ? 'path' : Math.abs(x) < 24 ? 'grass' : 'rock';
    add(x, y, z, value * (warm ? 1.02 : 0.83), value * (warm ? 0.94 : 0.89), value * (warm ? 0.73 : 1.02), zone);
  }

  // A continuous low particle terrain carries all five volcanoes and joins the
  // red cliffs to the same ground. The earlier canyon-only patch stopped at
  // z≈52/x≈38, leaving the rear peaks and outer walls visibly detached.
  const extendedTerrainCount = dense ? 140000 : 72000;
  for (let i = 0; i < extendedTerrainCount; i += 1) {
    const x = (random() - .5) * 408;
    const z = -120 + (random() - .5) * 530;
    const radial = (Math.abs(x / 204) ** 4) + (Math.abs((z + 120) / 265) ** 4);
    if (radial > 1 || random() > clamp((1 - radial) * 8.5, .06, 1)) continue;
    if (underVolcanoBase(x, z)) continue;
    const surface = terrainHeight(x, z);
    const routeVisible = z > -83 && z < 112;
    const waterX = riverCentreAt(z), roadX = pathCentreAt(z);
    const approach = clamp((z - 30) / 82, 0, 1);
    const riverHalfWidth = 1.8 - approach * .8;
    const pathHalfWidth = 2.5 - approach * 1.1;
    const isRiver = routeVisible && Math.abs(x - waterX) < riverHalfWidth;
    const isPath = routeVisible && !isRiver && Math.abs(x - roadX) < pathHalfWidth;
    const meadowSignal = Math.sin(x * .105 + z * .043) + Math.cos(z * .08 - x * .06);
    const isGrass = !isRiver && !isPath && meadowSignal > .48 && random() < .76;
    const zone = isRiver ? 'river' : isPath ? 'path' : isGrass ? 'grass' : 'rock';
    const y = surface + (random() - .5) * .045;
    const shade = .25 + random() * .22 + Math.max(0, meadowSignal) * .045;
    const green = isGrass ? .42 + random() * .13 : .29 + random() * .10;
    add(x, y, z, shade * (isGrass ? .56 : .88), shade * green, shade * (isGrass ? .66 : .76), zone);
  }

  // U-shaped red cliffs frame the volcano group on three sides. The near (+Z)
  // edge stays open as the entrance; each cliff foot sits slightly into the bed.
  const cliffSegments = [
    { kind: 'side', side: -1, count: dense ? 31000 : 14500 },
    { kind: 'side', side: 1, count: dense ? 31000 : 14500 },
    { kind: 'back', count: dense ? 28000 : 13000 }
  ];
  for (const segment of cliffSegments) {
    for (let i = 0; i < segment.count; i += 1) {
      const t = random();
      let x, z, crest;
      if (segment.kind === 'side') {
        z = -330 + random() * 343;
        const wallBand = random();
        const edgeLimit = 204 * Math.pow(Math.max(.05, 1 - Math.abs((z + 120) / 265) ** 4), .25);
        const inner = Math.max(155, edgeLimit - 44);
        const outer = Math.max(inner + 3, Math.min(edgeLimit - 5, inner + 19));
        const crumble = Math.sin(z * .12 + wallBand * 17) * 3.6 + Math.sin(z * .31 - wallBand * 23) * 1.25;
        const wallX = clamp(inner + wallBand * (outer - inner) + 3.2 * Math.sin(z * .028 + segment.side) + crumble, inner, edgeLimit - 5);
        x = segment.side * (wallX + (random() - .5) * .55);
        crest = 12 + 10 * Math.exp(-(((z + 160) / 92) ** 2)) + 7 * Math.exp(-(((z + 18) / 42) ** 2));
      } else {
        x = -158 + random() * 316;
        z = -330 - t * 13 + Math.sin(x * .045) * 3.4 + Math.sin(x * .16 + t * 12) * 1.0;
        crest = 11 + 11 * Math.exp(-((x / 92) ** 2)) + 6 * Math.exp(-(((x - 95) / 34) ** 2));
      }
      const y = terrainHeight(x, z) - .3 + t * crest;
      if (random() < .065 + t * .05) continue;
      const band = Math.sin(y * .63 + z * .026 + Math.sin(z * .11) * .43 + x * .025);
      const light = (.53 + random() * .34) * (band > .55 ? 1.31 : band < -.48 ? .63 : .96);
      add(x, y, z, Math.min(1, light * 1.42), light * .55, light * .30, 'redbed');
    }
  }

  // 近景只保留低矮圆钝岩簇，不让高石柱挡住牧群、道路和河流的全景关系。
  const monoliths = [
    [-158, 23, 5.4, 3.4], [160, 4, 5.8, 3.8], [-162, -15, 4.8, 3.1]
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

  // 外围断裂台地与崖壁相连，和火山主体之间留出清晰的草原间隔。
  const ledges = [
    [-1, 31, 8.2, 13], [1, 9, 9.4, 15], [-1, -12, 7.8, 12]
  ];
  for (const [side, cz, height, length] of ledges) {
    const n = dense ? 1800 : 900;
    for (let i = 0; i < n; i += 1) {
      const along = (random() - 0.5) * length;
      const reach = random();
      const z = cz + along;
      const x = side * (164 + Math.sin(z * 0.1) * 2.2 + reach * (5.5 + Math.sin(z * 0.37) * 1.2));
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
  const pathCount = dense ? 36000 : 16800;
  for (let i = 0; i < pathCount; i += 1) {
    const z = -80 + random() * 192;
    const centre = pathCentreAt(z);
    const approach = clamp((z - 30) / 82, 0, 1);
    const width = 5.0 - approach * 2.2;
    const across = (random() - 0.5) * width;
    const wheelRuts = Math.abs(Math.abs(across) - width * .18) < width * .025;
    const x = centre + across + (random() - 0.5) * 0.04;
    const y = terrainHeight(x, z) + 0.075 + (random() - 0.5) * 0.035;
    const grit = wheelRuts ? 0.84 + random() * 0.18 : 0.62 + random() * 0.25;
    add(x, y, z, grit, grit * (wheelRuts ? 0.50 : 0.56), grit * 0.25, 'path');
  }

  const riverCount = dense ? 48000 : 18000;
  for (let i = 0; i < riverCount; i += 1) {
    const z = -77 + random() * 189;
    const centre = riverCentreAt(z);
    const approach = clamp((z - 30) / 82, 0, 1);
    const width = 3.6 - approach * 1.6;
    const x = centre + (random() - 0.5) * width;
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
    const z = -73 + random() * 178;
    const riverCentre = riverCentreAt(z);
    const approach = clamp((z - 30) / 82, 0, 1);
    if (Math.abs(x - riverCentre) < 1.2 + (1 - approach) * .6 || Math.abs(x - pathCentreAt(z)) < 1.4 + (1 - approach) * 1.1) continue;
    const h = 0.13 + random() * 0.56;
    const y = terrainHeight(x, z) + h;
    add(x + Math.sin(z * 3.2) * h * 0.3, y, z, 0.24, 0.53 + random() * 0.22, 0.35, 'grass');
  }
  // 云纹贴近远处地平线成带，不在火山或动物旁悬成独立团块。
  const clouds = [[17, 29, -29, 11, 1.8, 6], [-18, 31, -58, 10, 1.7, 6]];
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
  // 草地拆成沿步道、河谷和火山间隙分布的草甸斑块，避免后半部铺成一整片绿毯。
  const meadows = [
    [-31, 20, 18, 16], [34, 12, 20, 15], [-40, -27, 19, 16], [43, -49, 19, 15],
    [-38, -91, 20, 15], [44, -123, 21, 16], [-14, -173, 20, 18], [35, -214, 20, 17],
    [-104, -144, 17, 22], [108, -248, 16, 18],
    [-32, 61, 24, 18], [36, 80, 24, 20], [-35, 105, 23, 19], [38, 128, 22, 17]
  ];
  const peakClearances = [[-62, -153, 36], [75, -200, 33], [0, -250, 44], [110, -100, 32], [-85, -52, 31]];
  const basinCount = dense ? 72000 : 38000;
  for (let i = 0; i < basinCount; i += 1) {
    const patch = meadows[Math.floor(random() * meadows.length)];
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random());
    const x = patch[0] + Math.cos(angle) * patch[2] * radius;
    const z = patch[1] + Math.sin(angle) * patch[3] * radius;
    const edge = clamp((1 - radius) / .18, 0, 1);
    if (random() > edge) continue;
    if (peakClearances.some(([px, pz, r]) => (x - px) ** 2 + (z - pz) ** 2 < r ** 2)) continue;
    const routeX = pathCentreAt(z);
    const waterX = riverCentreAt(z);
    const approach = clamp((z - 30) / 82, 0, 1);
    const routeVisible = z < 112;
    const river = routeVisible && Math.abs(x - waterX) < 1.0 + (1 - approach) * .8;
    const path = routeVisible && !river && Math.abs(x - routeX) < 1.4 + (1 - approach) * 1.1;
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
  for (const [cx, cy, cz, sx, sz] of [[-58, 31, -288, 22, 8], [-5, 28, -300, 30, 9], [50, 32, -286, 24, 9]]) {
    for (let i = 0; i < (dense ? 2400 : 1000); i += 1) {
      const x = cx + (random() - .5) * sx * 2;
      const z = cz + (random() - .5) * sz * 2;
      const y = cy + (random() - .5) * 2.5 + Math.sin(x * .2 + z * .11) * .45;
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
  for (let i = 0; i < (dense ? 39000 : 14500); i += 1) {
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
  for (let i = 0; i < (dense ? 9000 : 3200); i += 1) {
    const angle = random() * Math.PI * 2;
    const elevation = 0.10 + random() * 1.14;
    const radius = 170 + random() * 49;
    const x = Math.cos(angle) * Math.cos(elevation) * radius;
    const z = -67 + Math.sin(angle) * Math.cos(elevation) * radius;
    const y = Math.sin(elevation) * radius;
    const band = Math.sin(angle * 14 + elevation * 6) > 0.86 ? 1.12 : 0.30;
    const light = (0.12 + random() * 0.21) * band;
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
    transparent: true,
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
      varying float vGlyphRotation;
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
        if(zoneId<1.5)vColor*=.52;
        vGlyph = glyph;
        vGlyphRotation = fract(sin(dot(position.xz, vec2(12.9898, 78.233))) * 43758.5453) * 6.2831853;
        vZone = zoneId;
        vGlow = zoneId > 4.5 && zoneId < 5.5 ? .27 + .22 * sin(uTime * 2.7 + position.y * 3.1)
          : zoneId > 1.5 && zoneId < 2.5 ? .22 + .24 * sin(uTime * 3.2 - position.z * 1.3) : 0.0;
        gl_Position = projectionMatrix * view;
        vPointSize = clamp(86.0 / max(1.0, vDepth), 1.15, 6.2) * uPixelRatio;
        gl_PointSize = vPointSize;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vDepth;
      varying float vGlyph;
      varying float vGlyphRotation;
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
        float core = exp(-r * r * 32.0);
        float shape = core;
        if (vZone < 1.5 || vZone > 2.5) if (uGlyphReady > .5 && uGlyphMix > .01) {
          vec2 local = vec2(.04) + gl_PointCoord * .92;
          if ((vZone > .5 && vZone < 1.5) || (vZone > 2.5 && vZone < 3.5)) {
            vec2 centered = local - .5;
            float angle = vGlyphRotation;
            local = clamp(mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * centered + .5,
              vec2(.045), vec2(.955));
          }
          vec2 uv = (vec2(mod(vGlyph, 4.0), floor(vGlyph / 4.0)) + local) / vec2(4.0, 2.0);
          float motif = texture2D(uMotifAtlas, uv).a;
          float close = ((vZone > .5 && vZone < 1.5) || (vZone > 2.5 && vZone < 3.5))
            ? smoothstep(1.9, 4.8, vPointSize) * uGlyphMix
            : smoothstep(3.0, 7.5, vPointSize) * uGlyphMix;
          shape = mix(core, motif, close * .96);
        }
        if (shape < .045) discard;
        float fog = exp(-vDepth * .0045);
        vec3 color = pow(vColor, vec3(.69)) * (0.72 + shape * .55 + vPulse * .42 + vGlow) * fog * (1.0 - uStageDim);
        gl_FragColor = vec4(color, min(.92, shape * .85 + .07));
      }
    `
  });
  const cloud = new THREE.Points(geometry, material);
  cloud.frustumCulled = false;
  world.add(cloud);
  const tdLandscape=buildTDLandscape(positions,colors,zoneIds,terrainHeight,{dense});
  world.add(tdLandscape);
  const dreamMeadow=buildDreamMeadow(terrainHeight,underVolcanoBase,{dense});
  world.add(dreamMeadow.group);

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
  function syncParticleStyle(){
    if(!volcanoLayer?.peaks?.length)return;
    const recipe={mode:0,speed:.35,flow:.035,size:.86,brightness:1.08,density:1,tintMix:0,rim:.55,glow:.16};
    volcanoLayer.peaks.forEach(peak=>applyLuminousPreset(peak,recipe));
    localGlow.strength=Math.min(.22,recipe.glow*.20);localGlow.trail=.18;localGlow.reset();
  }
  // Experimental preset storage is intentionally isolated from the exhibition.
  let videoLayer = null;
  let livingNames = [];
  let pendingCoPeakFocus = null;
  installLibraryMotifs(world, terrainHeight).then(result => {
    motifLayer = result.group;
    motifCount = result.count;
    motifLayer.visible = motifsButton.getAttribute('aria-pressed') === 'true';
    material.uniforms.uMotifAtlas.value = result.atlas;
    material.uniforms.uGlyphReady.value = 1;
    videoLayer = createVideoParticlePlayer(world, result.atlas);
    try {
      volcanoLayer = installFiveVolcanoes(world, terrainHeight, result.atlas, dense);
      syncParticleStyle();
      motifCount += volcanoLayer.pointCount;
      if (pendingCoPeakFocus != null && volcanoLayer.peaks[pendingCoPeakFocus]) {
        focusForm(volcanoLayer.peaks[pendingCoPeakFocus]);
        pendingCoPeakFocus = null;
      }
    } catch (error) {
      console.error('五座火山载入失败', error);
      statusLabel.textContent = '五座火山未能载入';
    }
    motifsButton.title = '草地为枝蔓卷草纹转译、步道为盘长结、云层为卷云纹；河流只保留水流粒子与踏石';
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
    mode: 'overview', overviewZoom: 1, freeYaw: 0, freePitch: 0, targetYaw: 0, targetPitch: 0,
    freePosition: new THREE.Vector3(), gliding: true, focusHold: false, focusTarget: null, focusStart: 0,
    focusOrbitYaw: 0, focusOrbitPitch: 0, focusManual: false,
    focusFrom: new THREE.Vector3(), focusFromQuaternion: new THREE.Quaternion(), resumePosition: new THREE.Vector3(), resumeQuaternion: new THREE.Quaternion(),
    resumeFrom: new THREE.Vector3(), resumeFromQuaternion: new THREE.Quaternion(), resumeStart: 0,
    resumeYaw: 0, resumePitch: 0, resuming: false,
    glideSpeed: 0.035, keys: new Set(), downX: 0, downY: 0,
    gestureMoveX: 0, gestureMoveY: 0, gestureMoveSmoothX: 0, gestureMoveSmoothY: 0,
    parentGestureOpen: false, parentGestureFist: false, parentGesturePinch: false };
  function drawFreeCamera() {
    const direction = new THREE.Vector3(Math.sin(state.freeYaw) * Math.cos(state.freePitch), Math.sin(state.freePitch), -Math.cos(state.freeYaw) * Math.cos(state.freePitch));
    camera.position.copy(state.freePosition);
    camera.lookAt(state.freePosition.clone().add(direction));
    camera.rotateZ(clamp((state.targetYaw - state.freeYaw) * -0.05, -0.025, 0.025));
    if (!state.focusHold) statusLabel.textContent = state.gliding ? '自由遨游' : '已停止滑翔';
  }
  function constrainFreePosition() {
    state.freePosition.x = clamp(state.freePosition.x, -190, 190);
    state.freePosition.z = clamp(state.freePosition.z, -360, 110);
    const radial = (Math.abs(state.freePosition.x / 204) ** 4) + (Math.abs((state.freePosition.z + 120) / 265) ** 4);
    if (radial > .92) {
      const scale = Math.pow(.92 / radial, .25);
      state.freePosition.x *= scale;
      state.freePosition.z = (state.freePosition.z + 120) * scale - 120;
    }
    // Keep the traveller above the same ground surface used by volcano roots and cliffs.
    const floor = terrainHeight(state.freePosition.x, state.freePosition.z);
    state.freePosition.y = clamp(state.freePosition.y, floor + 2.15, 46);
    avoidVolcanoes(state.freePosition);
    state.freePosition.y = Math.max(state.freePosition.y, terrainHeight(state.freePosition.x, state.freePosition.z) + 2.15);
  }
  function avoidVolcanoes(position) {
    for (const peak of volcanoLayer?.peaks || []) {
      const height = peak.userData.height;
      const level = (position.y - peak.position.y) / height;
      if (level < -.06 || level > 1.08) continue;
      const profile = peak.userData.radiusProfile;
      const t = clamp(level, 0, .999);
      let radius = peak.userData.localRadius;
      for (let i = 1; i < profile.length; i++) {
        if (t > profile[i][0]) continue;
        const [a, ra] = profile[i-1], [b, rb] = profile[i];
        radius = ra + (rb-ra) * clamp((t-a)/Math.max(.0001,b-a),0,1); break;
      }
      radius = radius * peak.userData.monumentScale + 3.2;
      const dx = position.x-peak.position.x, dz = position.z-peak.position.z;
      const distance = Math.hypot(dx,dz);
      if (distance < radius) {
        const heading = distance > .001 ? Math.atan2(dx,dz) : state.freeYaw + Math.PI;
        position.x = peak.position.x + Math.sin(heading) * radius;
        position.z = peak.position.z + Math.cos(heading) * radius;
      }
    }
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
    form.userData.activityPreview=false;
    focusActivity.hidden=!form.userData.referenceVideo;focusActivity.textContent="播放原片动作";focusActivity.setAttribute("aria-pressed","false");
    state.focusStart = performance.now();
    state.focusOrbitYaw = state.focusOrbitPitch = 0;
    state.focusManual = false;
    state.focusFrom.copy(camera.position);
    state.focusFromQuaternion.copy(camera.quaternion);
    focusPanel.classList.remove('focus-settled');
    focusPanel.classList.add('focus-arriving');
    material.uniforms.uStageDim.value = 0.48;
    livingLayer?.focus(form, state.focusStart * 0.001);
    if (volcanoLayer) {
      const volcanoFocus = form.userData.kind === 'volcano';
      volcanoLayer.setVisible(volcanoFocus);
      if (volcanoFocus) volcanoLayer.focus(form);
    }
    if (videoLayer) videoLayer.stop();
    glideButton.textContent = '▶ 继续遨游';
    focusTitle.textContent = form.name;
    focusReplay.textContent = form.userData.kind === 'volcano' ? '↺ 再看山体' : form.userData.referenceVideo ? '↺ 重播原片动作' : form.userData.video ? '↺ 重播动作' : '↺ 重播聚形';
    const story = focusStories[form.name];
    focusCopy.replaceChildren();
    if (story) {
      const labels = form.userData.kind === 'volcano'
        ? ['地貌资料与命名', '设计图转译', '观看线索'] : ['草原原型', '纹样转译', '观看线索'];
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
    focusPanel.classList.toggle('reference-focus', !!form.userData.referenceVideo);
    if (form.userData.video && !form.userData.referenceVideo && videoLayer) {
      const focusToken = state.focusStart;
      videoLayer.play(form, form.userData.video).then(ready => {
        if (state.focusTarget !== form || state.focusStart !== focusToken) return;
        const motion = focusCopy.querySelector('[data-focus-motion]');
        const status = ready ? '视频已载入，可重播观看。' : '视频暂未载入，当前显示静态设计图的粒子动作。';
        if (motion) motion.textContent = `${story.observe} ${status}`;
      });
    }
    statusLabel.textContent = form.userData.referenceVideo?`${form.name} · ${form.userData.activityPreview?'原片动作播放中':'原片动作已暂停'}`:`观察 · ${form.name}`;
    sightlines.open = false;
  }
  function exitFocus() {
    if (!state.focusHold) return;
    if(state.focusTarget)state.focusTarget.userData.activityPreview=false;
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
  function makeCoCreateSpriteTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 31);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(.22, 'rgba(255,255,255,.96)');
    gradient.addColorStop(.62, 'rgba(255,255,255,.36)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  function createCoCreateParticle(item, onReady) {
    const payload = item.particleCloud;
    const image = new Image();
    image.onload = () => {
      try {
        let positions, colors, sizes, uvs, morph = 0, size = .22, wave = .5, heartbeat = 1, rotate = .12;
        if (payload && payload.image && payload.positions && payload.uvs && payload.sizes) {
          positions = payload.positions instanceof Float32Array ? payload.positions : new Float32Array(payload.positions);
          colors = payload.colors instanceof Float32Array ? payload.colors : new Float32Array(payload.colors || positions.length);
          sizes = payload.sizes instanceof Float32Array ? payload.sizes : new Float32Array(payload.sizes);
          uvs = payload.uvs instanceof Float32Array ? payload.uvs : new Float32Array(payload.uvs);
          morph = Number(payload.morph) || 0;
          size = Number(payload.size) || .22;
          wave = Number(payload.wave) || 0;
          heartbeat = Number(payload.heartbeat) || 0;
          rotate = Number(payload.rotate) || .12;
        } else {
          // 旧作品回退时也按创作页的“像素采样→24单位坐标→弧面Z厚度”规则重建。
          const canvas = document.createElement('canvas');
          const dimension = 256;
          canvas.width = canvas.height = dimension;
          const context = canvas.getContext('2d', { willReadFrequently: true });
          const ratio = Math.min(dimension / image.naturalWidth, dimension / image.naturalHeight);
          const width = image.naturalWidth * ratio, height = image.naturalHeight * ratio;
          context.drawImage(image, (dimension - width) / 2, (dimension - height) / 2, width, height);
          const data = context.getImageData(0, 0, dimension, dimension).data;
          const valid = [];
          for (let y = 0; y < dimension; y++) for (let x = 0; x < dimension; x++) {
            const offset = (y * dimension + x) * 4;
            if (data[offset + 3] > 8 && (data[offset] + data[offset + 1] + data[offset + 2] > 24 || data[offset + 3] < 250)) valid.push([x, y, offset]);
          }
          const count = Math.min(32000, valid.length);
          positions = new Float32Array(count * 3); colors = new Float32Array(count * 3);
          sizes = new Float32Array(count); uvs = new Float32Array(count * 2);
          const randomness = Math.max(0, Math.min(1, Number(item.parameters?.sizeRnd ?? 3.5) / 10));
          for (let i = 0; i < count; i++) {
            const [x, y, offset] = valid[Math.floor((i + .5) * valid.length / count)];
            const scale = 24 / dimension;
            const px = (x - dimension / 2) * scale + (Math.random() - .5) * scale * .15;
            const py = (y - dimension / 2) * scale + (Math.random() - .5) * scale * .15;
            positions.set([px, py, Math.cos(Math.hypot(px, py) * .15) * 2.5 + (Math.random() - .5)], i * 3);
            colors.set([data[offset] / 255, data[offset + 1] / 255, data[offset + 2] / 255], i * 3);
            const randomSize = ((i * 1664525 + 1013904223) >>> 0) / 4294967296;
            sizes[i] = 1 * (1 - randomness) + (.1 + Math.pow(randomSize, 1.5) * 3) * randomness;
            uvs.set([x / dimension, y / dimension], i * 2);
          }
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('aUV', new THREE.BufferAttribute(uvs, 2));
        geometry.computeBoundingSphere();
        const patternTexture = new THREE.Texture(image);
        patternTexture.colorSpace = THREE.SRGBColorSpace;
        patternTexture.minFilter = THREE.LinearFilter;
        patternTexture.magFilter = THREE.LinearFilter;
        patternTexture.needsUpdate = true;
        const particleTexture = makeCoCreateSpriteTexture();
        const material = new THREE.ShaderMaterial({
          uniforms: {
            uSize: { value: size * .34 }, uOpacity: { value: .92 }, uPattern: { value: patternTexture },
            uSprite: { value: particleTexture }, uPixelRatio: { value: Math.max(renderer.getPixelRatio(), 1.5) },
            uHalfH: { value: window.innerHeight * .5 }, uTime: { value: 0 },
            uWaveSpeed: { value: wave }, uHeartbeatSpeed: { value: heartbeat }, uMorph: { value: morph }
          },
          vertexShader: `
            attribute float aSize; attribute vec3 color; attribute vec2 aUV;
            varying vec3 vColor; varying vec2 vUV; varying float vMorph;
            uniform float uSize, uPixelRatio, uHalfH, uTime, uWaveSpeed, uHeartbeatSpeed, uMorph;
            void main() {
              vColor = color; vUV = aUV; vMorph = uMorph;
              vec3 pos = position;
              float wave = sin(pos.x * .2 + uTime * uWaveSpeed) * cos(pos.y * .2 + uTime * uWaveSpeed);
              pos.z += wave * .6; pos.x += cos(pos.z * .4 + uTime) * .15; pos.y += sin(pos.z * .4 + uTime) * .15;
              float beat = 0.0;
              if (uHeartbeatSpeed > 0.0) {
                float rawBeat = sin(uTime * 3.0 * uHeartbeatSpeed);
                beat = smoothstep(0.0, 1.0, pow(abs(rawBeat), 16.0) * .5);
              }
              pos *= 1.0 + beat * .1;
              vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
              float sizeMorph = .6 + .4 * uMorph;
              float rawSize = uSize * aSize * sizeMorph * uPixelRatio * (uHalfH / -mvPos.z) * (1.0 + beat * 1.5);
              gl_PointSize = clamp(rawSize, 1.2, 18.0);
              vColor *= clamp(100.0 / -mvPos.z, .5, 2.0) * (.5 + .5 * uMorph);
              gl_Position = projectionMatrix * mvPos;
            }`,
          fragmentShader: `
            uniform sampler2D uPattern; uniform sampler2D uSprite; uniform float uOpacity;
            varying vec3 vColor; varying vec2 vUV; varying float vMorph;
            void main() {
              vec4 sprite = texture2D(uSprite, gl_PointCoord);
              if (sprite.a < .05) discard;
              vec3 sampled = texture2D(uPattern, vUV).rgb;
              vec3 gathered = sprite.rgb * sampled * 2.2;
              vec3 scattered = sprite.rgb * vColor;
              vec3 finalColor = mix(gathered, scattered, vMorph);
              gl_FragColor = vec4(finalColor, sprite.a * uOpacity * (.6 + .4 * vMorph));
            }`,
          transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
        });
        const cloud = new THREE.Points(geometry, material);
        cloud.scale.setScalar(.34);
        cloud.userData.coCreateId = item.id;
        cloud.userData.workTitle = item.workTitle;
        cloud.userData.destination = item.destination;
        cloud.userData.coCreateMaterial = material;
        cloud.userData.coCreateRotateSpeed = rotate;
        cloud.userData.coCreateTextures = [patternTexture, particleTexture];
        cloud.frustumCulled = false;
        onReady(cloud);
      } catch (error) { console.warn('共创纹样粒子采样失败', error); onReady(null); }
    };
    image.onerror = () => onReady(null);
    image.src = payload?.image || item.thumb || '';
  }

  function contributionAttachment(item) {
    if (!item || item.destination !== 'grass') return null;
    const targetId = item.targetId || `volcano:${Number.isInteger(item.peakIndex) ? item.peakIndex : 2}`;
    const [targetType, targetValue] = String(targetId).split(':');
    if (targetType === 'animal' && livingLayer) {
      const form = livingLayer.group.children.find(object => object.userData.animal && !object.userData.ambientPlacement
        && object.name === targetValue);
      if (!form) return null;
      const width = Number(form.userData.width) || 16;
      const height = Number(form.userData.height) || 11;
      const position = new THREE.Vector3(0, height * .025, Math.max(1.55, width * .105));
      return { parent: form, position, rotation: new THREE.Euler(), scale: .19, worldPosition: () => {
        form.updateWorldMatrix(true, false);
        return form.localToWorld(position.clone());
      } };
    }
    const index = targetType === 'volcano' ? Number(targetValue) : Number.isInteger(item.peakIndex) ? item.peakIndex : 2;
    const peak = Number.isInteger(index) ? volcanoLayer?.peaks[index] : null;
    if (!peak) return null;
    const fraction = .48;
    const profile = peak.userData.radiusProfile || [[0, peak.userData.localRadius || 10], [1, 1.5]];
    let radius = profile[profile.length - 1][1];
    for (let i = 1; i < profile.length; i += 1) {
      if (fraction > profile[i][0]) continue;
      const [t0, r0] = profile[i - 1], [t1, r1] = profile[i];
      radius = r0 + (r1 - r0) * (fraction - t0) / Math.max(.0001, t1 - t0);
      break;
    }
    const localHeight = peak.userData.localHeight || peak.userData.height / (peak.userData.monumentScale || 3);
    const position = new THREE.Vector3(0, localHeight * fraction, radius + .08);
    const rotation = new THREE.Euler(-Math.atan2(radius, localHeight), 0, 0);
    const scale = .34 / (peak.userData.monumentScale || 3);
    return { parent: peak, position, rotation, scale, worldPosition: () => {
      peak.updateWorldMatrix(true, false);
      return peak.localToWorld(position.clone());
    } };
  }

  function mountCoCreateContribution(cloud, item) {
    const attachment = contributionAttachment(item);
    if (!attachment) {
      coCreateContributionGroup.add(cloud);
      coCreateContributionGroup.userData[item.id] = cloud;
      return;
    }
    attachment.parent.add(cloud);
    cloud.position.copy(attachment.position);
    cloud.rotation.copy(attachment.rotation);
    cloud.scale.setScalar(attachment.scale);
    cloud.userData.coCreateAttached = true;
    cloud.userData.coCreateRotateSpeed = 0;
    coCreateContributionGroup.userData[item.id] = cloud;
  }

  function clearCoCreateContributions() {
    const registered = new Set(Object.values(coCreateContributionGroup.userData).filter(value => value?.isObject3D));
    coCreateContributionGroup.children.forEach(cloud => registered.add(cloud));
    registered.forEach(cloud => {
      cloud.parent?.remove(cloud);
      cloud.geometry?.dispose();
      cloud.material?.dispose();
      cloud.userData.coCreateTextures?.forEach(texture => texture.dispose());
    });
    coCreateContributionGroup.clear();
    for (const key of Object.keys(coCreateContributionGroup.userData)) delete coCreateContributionGroup.userData[key];
  }

  function beginCoCreateFlight(item) {
    if (!item || state.coFlight) return;
    document.documentElement.classList.add('co-flight-active');
    setPlaying(false);
    if (state.focusHold) exitFocus();
    state.resuming = false;
    state.focusHold = false;
    focusPanel.hidden = true;
    material.uniforms.uStageDim.value = 0;
    if (videoLayer) videoLayer.stop();
    if (livingLayer) livingLayer.focus(null, performance.now() * 0.001);
    volcanoLayer?.setVisible(true);
    volcanoLayer?.focus(null);
    const start = camera.position.clone();
    const attachment = contributionAttachment(item);
    const landing = item.destination === 'grass'
      ? attachment?.worldPosition() || new THREE.Vector3(0, terrainHeight(0, -250) + 8, -250)
      : new THREE.Vector3(2, 37, -166);
    const cameraEnd = landing.clone().add(new THREE.Vector3(0, item.destination === 'sky' ? -2.8 : 4.2, 10));
    const curve = new THREE.CatmullRomCurve3([
      start,
      start.clone().lerp(cameraEnd, 0.22).add(new THREE.Vector3(0, item.destination === 'sky' ? 11 : 4, 0)),
      start.clone().lerp(cameraEnd, 0.53).add(new THREE.Vector3(0, item.destination === 'sky' ? 15 : 1.4, 0)),
      start.clone().lerp(cameraEnd, 0.82).add(new THREE.Vector3(0, item.destination === 'sky' ? 5 : -1.2, 0)),
      cameraEnd
    ], false, 'centripetal');
    const attach = cloud => {
      if (!cloud) {
        const geometry = new THREE.BufferGeometry(), points = [], colors = [];
        for (let i = 0; i < 760; i += 1) {
          const angle = i * 2.399963, radius = 3.1 * Math.sqrt(i / 760);
          points.push(Math.cos(angle) * radius, Math.sin(angle) * radius, Math.sin(i * 0.13) * 0.28);
          colors.push(0.94, 0.72 + (i % 7) * 0.025, 0.32);
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        cloud = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.22, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      }
      state.mode = 'co-create';
      state.gliding = false;
      state.coFlight = { id: item.id, curve, cloud, landing, cameraEnd, startTime: performance.now(), duration: 7200, item };
      world.add(cloud);
    };
    createCoCreateParticle(item, attach);
  }

  window.addEventListener('message', event => {
    if (event.source !== parent || event.data?.channel !== 'mongol-pattern-co-create') return;
    const message = event.data;
    if (message.type === 'layout-mode') {
      document.documentElement.classList.toggle('co-layout-browse', message.mode === 'browse');
      return;
    }
    if (message.type === 'pause-travel') { setPlaying(false); return; }
    if (message.type === 'compose-panel-height') {
      const offset = Math.max(150, Math.min(520, Number(message.offset) || 284));
      document.documentElement.style.setProperty('--co-compose-panel-offset', `${offset}px`);
      return;
    }
    if (message.type === 'gesture-frame') {
      if (!message.active) {
        state.gestureMoveX = state.gestureMoveY = 0;
        state.parentGestureOpen = state.parentGestureFist = state.parentGesturePinch = false;
        return;
      }
      const axis = (offset, deadZone = .15) => Math.abs(offset) <= deadZone ? 0
        : clamp((offset - Math.sign(offset) * deadZone) / (.5 - deadZone), -1, 1);
      state.gestureMoveX = message.open ? axis(Number(message.x) - .5) : 0;
      state.gestureMoveY = message.open ? axis(.5 - Number(message.y)) : 0;
      if (message.open && !state.parentGestureOpen) handleSceneGestureOpen();
      if (message.fist && !state.parentGestureFist) handleSceneGestureFist();
      if (message.pinch && !state.parentGesturePinch) handleSceneGesturePinch();
      state.parentGestureOpen = !!message.open;
      state.parentGestureFist = !!message.fist;
      state.parentGesturePinch = !!message.pinch;
      return;
    }
    if (message.type === 'focus') {
      const index = Number.isInteger(message.peakIndex) ? message.peakIndex : null;
      if (index == null) { if (state.focusHold) exitFocus(); return; }
      const peak = volcanoLayer?.peaks[index];
      if (peak) focusForm(peak); else pendingCoPeakFocus = index;
    }
    if (message.type === 'focus-animal') {
      const animal = livingLayer?.group.children.find(form => form.userData.animal && !form.userData.ambientPlacement && form.name === message.animalName);
      if (animal) focusForm(animal);
    }
    if (message.type === 'destination' && message.destination === 'sky' && state.focusHold) exitFocus();
    if (message.type === 'flight') beginCoCreateFlight(message.item);
    if (message.type === 'clear-contributions') {
      clearCoCreateContributions();
      if (state.focusHold) exitFocus();
      livingLayer?.focus(null, performance.now() * .001);
      volcanoLayer?.setVisible(true);
      volcanoLayer?.focus(null);
    }
    if (message.type === 'restore-contributions' && Array.isArray(message.items)) {
      message.items.slice(-36).forEach(item => {
        if (!item || !item.id || coCreateContributionGroup.userData[item.id]) return;
        createCoCreateParticle(item, cloud => {
          if (!cloud) return;
          if (item.destination === 'sky') {
            const hash = String(item.id).split('').reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 7);
            cloud.position.set(-17 + hash % 35, 15 + (hash >>> 4) % 20, -155 - (hash >>> 8) % 35);
            coCreateContributionGroup.add(cloud);
            coCreateContributionGroup.userData[item.id] = cloud;
          } else mountCoCreateContribution(cloud, item);
        });
      });
    }
  });

  focusActivity.addEventListener('click',()=>{
    const form=state.focusTarget;if(!form?.userData.referenceVideo)return;
    form.userData.activityPreview=!form.userData.activityPreview;
    focusActivity.textContent=form.userData.activityPreview?'暂停原片动作':'播放原片动作';
    livingLayer?.setReferencePlaying(form.userData.activityPreview);
    focusActivity.setAttribute('aria-pressed',String(form.userData.activityPreview));
  });
  focusExit.addEventListener('click', exitFocus);
  focusReplay.addEventListener('click',()=>{if(state.focusTarget?.userData.referenceVideo){livingLayer?.restartReference(state.focusTarget);state.focusTarget.userData.activityPreview=true;livingLayer?.setReferencePlaying(true);focusActivity.textContent='暂停原片动作';focusActivity.setAttribute('aria-pressed','true');}else if(state.focusTarget)focusForm(state.focusTarget);});
  function updateFocusCamera(time) {
    const form = state.focusTarget;
    if (!form) return;
    const age = Math.max(0, (time - state.focusStart) * 0.001);
    const duration = matchMedia('(prefers-reduced-motion:reduce)').matches ? .01 : form.userData.kind === 'volcano' ? 1.65 : 1.25;
    const progress = Math.min(1, age / duration);
    const ease = progress * progress * (3 - 2 * progress);
    if (progress >= 1 && focusPanel.classList.contains('focus-arriving')) {
      focusPanel.classList.remove('focus-arriving'); focusPanel.classList.add('focus-settled');
    }
    const narrow = window.innerWidth < 900;
    const volcano = form.userData.kind === 'volcano';
    const distance = form.userData.animal?Math.max(form.userData.width*1.55,form.userData.height*1.9,form.userData.width/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect)*1.35):volcano ? (form.userData.index === 2 ? narrow ? 130 : 110 : narrow ? 104 : 90) : form.userData.kind === 'sun' ? 22 : form.userData.kind === 'emblem' ? 12.5 : narrow ? 10.8 : form.userData.animal ? 9.5 : 9.2;
    const targetY = form.position.y + (volcano ? form.userData.height * .63 : 0);
    // 先留出正面辨认原画的时间，再慢速环看背面与浮雕厚度。
    const orbit = form.userData.proceduralAnimal?form.rotation.y:volcano ? state.focusOrbitYaw : 0;
    const destination = new THREE.Vector3(form.position.x + (volcano||form.userData.proceduralAnimal ? Math.sin(orbit) * distance : Math.sin(age * .45) * .38),
      targetY + (volcano ? 15.9 + state.focusOrbitPitch * distance * .32 + Math.sin(age * .31) * .75 : form.userData.animal ? .35 : .1),
      form.position.z + Math.cos(orbit) * distance);
    camera.position.copy(state.focusFrom).lerp(destination, ease);
    const horizontalAim = form.userData.referenceVideo ? distance*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect*.30 : narrow ? volcano ? form.userData.index === 2 ? 19 : 5.5 : 2.8 : 0;
    camera.lookAt(form.position.x - horizontalAim, targetY, form.position.z);
    const aimedQuaternion = camera.quaternion.clone();
    camera.quaternion.copy(state.focusFromQuaternion).slerp(aimedQuaternion, ease);
    statusLabel.textContent = form.userData.referenceVideo?`${form.name} · ${form.userData.activityPreview?'原片动作播放中':'原片动作已暂停'}`:`观察 · ${form.name}`;
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
    if (state.mode === 'overview') {
      const target = new THREE.Vector3(0, 10, -145);
      const horizontal = 280 / state.overviewZoom;
      const vertical = 0;
      camera.position.set(target.x + Math.sin(state.yaw) * horizontal, target.y + vertical, target.z + Math.cos(state.yaw) * horizontal);
      // 初始镜头与地平线齐平；用户拖拽后仍可主动俯仰查看地表和火山口。
      camera.lookAt(target.x, target.y - Math.sin(state.pitch)*horizontal, target.z);
      camera.fov = 52;
      camera.updateProjectionMatrix();
      progressBar.style.transform = 'scaleX(0)';
      statusLabel.textContent = '平视全景 · 火山群与草原';
      return;
    }
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
  function syncTravelUI() {
    const active = window.matchMedia('(min-width: 821px)').matches && state.playing;
    document.documentElement.classList.toggle('travel-active', active);
    document.documentElement.classList.toggle('travel-expanded', active && travelExpanded);
    travelMenuToggle.hidden = !active;
    travelMenuToggle.textContent = travelExpanded ? '收起控制 ×' : '展开控制 · Esc 暂停';
    travelMenuToggle.setAttribute('aria-expanded', String(active && travelExpanded));
    if (active) { controlSettings.open = false; sightlines.open = false; discoveryCard.hidden = true; }
    if (coCreateEmbedded) parent.postMessage({ channel: 'mongol-pattern-co-create', type: 'travel-ui', active, expanded: active && travelExpanded }, '*');
  }
  travelMenuToggle.addEventListener('click', () => { travelExpanded = !travelExpanded; syncTravelUI(); });
  document.querySelector('#travel-exit').addEventListener('click', () => {
    state.mode = 'overview'; state.progress = 0; state.yaw = state.pitch = 0;
    setPlaying(false); drawCamera(); playButton.focus({ preventScroll: true });
  });
  window.addEventListener('resize', syncTravelUI);
  const terrainNetwork=buildLandscapeStructure(positions,colors,zoneIds,{cellSize:dense?1.05:1.55,maxEdges:dense?68000:30000});
  world.add(terrainNetwork);
  const terrainStructureButton=document.querySelector('#terrain-network');
  if(terrainStructureButton){
    terrainStructureButton.textContent='地形细节：开';terrainStructureButton.setAttribute('aria-pressed','true');
    terrainStructureButton.addEventListener('click',()=>{
      terrainNetwork.visible=!terrainNetwork.visible;
      terrainStructureButton.textContent=terrainNetwork.visible?'地形细节：开':'地形细节：关';
      terrainStructureButton.setAttribute('aria-pressed',String(terrainNetwork.visible));
    });
  }
  function setPlaying(value) {
    if (value && state.mode === 'overview') { state.mode = 'route'; state.progress = 0; }
    state.playing = value;
    travelExpanded = false;
    syncTravelUI();
    if (value && !travelMenuToggle.hidden) travelMenuToggle.focus({ preventScroll: true });
    if (value && state.progress >= 1) state.progress = 0;
    playButton.textContent = value ? 'Ⅱ 暂停穿行' : state.progress >= 1 ? '▶ 再看一遍' : state.progress > 0 ? '▶ 继续穿行' : '▶ 开始穿行';
  }
  playButton.addEventListener('click', () => { if (state.mode === 'free') toggleFree(true); setPlaying(!state.playing); });
  controlSettings?.querySelector('.control-settings-menu')?.addEventListener('click', event => {
    if (event.target.closest('button')) controlSettings.open = false;
  });
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
  function handleSceneGestureOpen() {
    if (state.mode !== 'free') {
      setPlaying(false);
      toggleFree();
    }
    if (state.focusHold) exitFocus();
    state.gliding = false;
    glideButton.textContent = '▶ 继续滑翔';
    drawFreeCamera();
  }
  function handleSceneGestureFist() {
    if (state.mode !== 'free') toggleFree();
    if (state.focusHold) exitFocus();
    state.gliding = true;
    glideButton.textContent = '■ 停止滑翔';
    drawFreeCamera();
  }
  function handleSceneGesturePinch() {
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
  const gesture = createGestureControl(document.querySelector('#gesture-video'), {
    onStatus: message => { gestureStatus.textContent = message; },
    onMove: (x, y) => {
      state.gestureMoveX = x;
      state.gestureMoveY = y;
    },
    onOpen: handleSceneGestureOpen,
    onFist: handleSceneGestureFist,
    onPinch: handleSceneGesturePinch
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
  const meadowRay=new THREE.Raycaster(),meadowPointer=new THREE.Vector2(),meadowPoint=new THREE.Vector3();
  const meadowPlane=new THREE.Plane(new THREE.Vector3(0,1,0),1);let lastMeadowMove=0;
  canvas.addEventListener('pointermove', event => {
    if(!state.dragging&&performance.now()-lastMeadowMove>70){
      lastMeadowMove=performance.now();const rect=canvas.getBoundingClientRect();
      meadowPointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
      meadowRay.setFromCamera(meadowPointer,camera);
      if(meadowRay.ray.intersectPlane(meadowPlane,meadowPoint)&&Math.abs(meadowPoint.x)<204&&meadowPoint.z>-385&&meadowPoint.z<145)dreamMeadow.windAt(meadowPoint);
    }
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
        state.targetPitch = clamp(state.targetPitch + clamp(event.clientY - state.y, -80, 80) * 0.0027, -.75, 1.48);
      }
    } else {
      if (!state.dragging) return;
      state.yaw = clamp(state.yaw - (event.clientX - state.x) * 0.004, -1.05, 1.05);
      state.pitch = clamp(state.pitch + (event.clientY - state.y) * 0.003, -1.40, .65);
    }
    state.x = event.clientX; state.y = event.clientY;
    if ((state.mode === 'route' || state.mode === 'overview') && !state.playing) drawCamera();
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
    else if (state.mode === 'overview') {
      state.overviewZoom = clamp(state.overviewZoom * Math.exp(-event.deltaY * 0.001), 0.72, 1.48);
      drawCamera();
    } else { setPlaying(false); state.progress = clamp(state.progress + event.deltaY * 0.00015, 0, 1); drawCamera(); }
  }, { passive: false });
  window.addEventListener('keydown', event => {
    if (event.code === 'Escape' && state.playing) { event.preventDefault(); setPlaying(false); return; }
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
  statusLabel.textContent = '平视全景';
  window.__pointCloudStudy = { points: positions.length / 3, get motifPoints() { return motifCount; }, get livingForms() { return livingNames; },
    get volcanoes() { return volcanoLayer?.peaks.map(peak => peak.name) || []; }, get progress() { return state.progress; },
    get playing() { return state.playing; }, get mode() { return state.mode; }, get gliding() { return state.gliding; },
    get freePosition() { return state.freePosition.toArray(); },
    get animalActivity() { return livingLayer?.getAnimalStates() || []; } };
  const performanceAudit=new URLSearchParams(location.search).has('perf-audit');
  let auditStart=performance.now(),auditFrames=0,auditRenderMs=0;
  let stableFrames=0,frameCost=0;
  function frame(time) {
    const renderStart=performance.now();
    if(document.hidden){state.lastTime=0;auditStart=time;auditFrames=0;auditRenderMs=0;requestAnimationFrame(frame);return;}
    const rawDelta=state.lastTime?time-state.lastTime:0;
    const delta = Math.min(80,rawDelta);
    state.lastTime = time;
    const updateContribution = cloud => {
      const uniforms = cloud.userData.coCreateMaterial?.uniforms;
      if (uniforms?.uTime) uniforms.uTime.value = time * .001;
      if (!cloud.userData.coCreateAttached) cloud.rotation.y += delta * .001 * (cloud.userData.coCreateRotateSpeed || .12);
    };
    const contributionClouds = new Set([...coCreateContributionGroup.children,
      ...Object.values(coCreateContributionGroup.userData).filter(value => value?.isObject3D)]);
    contributionClouds.forEach(updateContribution);
    if (state.coFlight?.cloud) updateContribution(state.coFlight.cloud);
    if (state.coFlight) {
      const flight = state.coFlight;
      const raw = clamp((time - flight.startTime) / flight.duration, 0, 1);
      const eased = raw * raw * (3 - 2 * raw);
      const cameraT = eased * 0.94;
      const cameraPoint = flight.curve.getPointAt(cameraT);
      const patternPoint = raw >= 0.985 ? flight.landing : flight.curve.getPointAt(Math.min(1, cameraT + 0.055));
      camera.position.copy(cameraPoint);
      flight.cloud.position.copy(patternPoint);
      camera.lookAt(patternPoint);
      camera.fov = 68 + Math.sin(raw * Math.PI) * 8;
      camera.updateProjectionMatrix();
      if (Math.floor(time / 120) !== Math.floor((time - delta) / 120)) {
        parent.postMessage({ channel: 'mongol-pattern-co-create', type: 'flight-progress', id: flight.id, progress: raw }, '*');
      }
      if (raw >= 1) {
        flight.cloud.position.copy(flight.landing);
        mountCoCreateContribution(flight.cloud, flight.item);
        state.coFlight = null;
        state.mode = 'free';
        state.freePosition.copy(flight.cameraEnd);
        state.freeYaw = state.targetYaw = 0;
        state.freePitch = state.targetPitch = -0.12;
        state.gliding = false;
        camera.fov = 68;
        camera.updateProjectionMatrix();
        drawFreeCamera();
        document.documentElement.classList.remove('co-flight-active');
        parent.postMessage({ channel: 'mongol-pattern-co-create', type: 'flight-complete', id: flight.id }, '*');
      }
    } else if (state.playing) {
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
      const gestureBlend = 1 - Math.exp(-delta * .018);
      state.gestureMoveSmoothX += (state.gestureMoveX - state.gestureMoveSmoothX) * gestureBlend;
      state.gestureMoveSmoothY += (state.gestureMoveY - state.gestureMoveSmoothY) * gestureBlend;
      const gestureStep = delta * .013;
      moveFree((state.gliding ? state.glideSpeed * delta : 0) + forward * step,
        right * step + state.gestureMoveSmoothX * gestureStep,
        up * step + state.gestureMoveSmoothY * gestureStep);
    }
    material.uniforms.uTime.value = time * 0.001;
    tdLandscape.material.uniforms.uTime.value=time*.001;
    tdLandscape.material.uniforms.uDim.value=material.uniforms.uStageDim.value;
    skyMaterial.uniforms.uTime.value = time * 0.001;
    // Apply the ground constraint after every camera mode and transition.
    const cameraFloor=terrainHeight(camera.position.x,camera.position.z)+2.15;
    if(camera.position.y<cameraFloor){
      camera.position.y=cameraFloor;
      if(state.mode==='free'&&!state.focusHold)state.freePosition.y=Math.max(state.freePosition.y,cameraFloor);
    }
    sky.position.copy(camera.position);
    dreamMeadow.update(time*.001,material.uniforms.uStageDim.value);
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
    if(motionAuditEnabled&&livingLayer&&time-lastMotionAudit>2000){lastMotionAudit=time;console.info('[animal-motion-audit] '+JSON.stringify({animals:livingLayer.getReferenceStates(),cameraClearance:camera.position.y-terrainHeight(camera.position.x,camera.position.z)}));}
    if (volcanoLayer) volcanoLayer.update(time * 0.001, camera);
    if (videoLayer) videoLayer.update(time * 0.001);
    if(rawDelta>0&&rawDelta<250){frameCost+=delta;stableFrames++;if(stableFrames>=180){if(frameCost/stableFrames>34&&renderer.getPixelRatio()>1){renderer.setPixelRatio(1);localGlow.reset();}frameCost=0;stableFrames=0;}}
    renderer.info.reset();
    localGlow.render();
    if(performanceAudit&&!document.hidden){auditFrames++;auditRenderMs+=performance.now()-renderStart;if(time-auditStart>5000){console.info('[scene-performance] '+JSON.stringify({fps:Math.round(auditFrames*10000/(time-auditStart))/10,cpuMs:Math.round(auditRenderMs/auditFrames*10)/10,pixelRatio:renderer.getPixelRatio(),calls:renderer.info.render.calls,points:renderer.info.render.points,triangles:renderer.info.render.triangles,basePoints:positions.length/3,groundTint:terrainBed.material.color.getHexString(),forms:livingLayer?.group.children.filter(o=>o.visible).map(o=>o.name)}));auditStart=time;auditFrames=0;auditRenderMs=0;}}

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  if (coCreateEmbedded) parent.postMessage({ channel: 'mongol-pattern-co-create', type: 'ready' }, '*');
} catch (error) {
  errorBox.hidden = false;
  errorBox.textContent = `场景未能启动：${error.message}`;
  console.error(error);
}
