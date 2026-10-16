(function () {
  'use strict';

  const STORAGE_KEY = 'mongolPatternCoCreateContributionsV1';
  const MAX_LOCAL_CONTRIBUTIONS = 36;

  const entry = document.createElement('button');
  entry.type = 'button';
  entry.className = 'co-create-entry';
  entry.id = 'coCreateEntry';
  entry.setAttribute('aria-haspopup', 'dialog');
  entry.setAttribute('aria-controls', 'coCreateScene');
  entry.innerHTML = `
    <span class="co-entry-mark" aria-hidden="true">纹</span>
    <span class="co-entry-copy">
      <strong>完成创作 · 加入共创</strong>
      <small>让你的纹样成为草原火山的一部分</small>
    </span>
    <span class="co-entry-arrow" aria-hidden="true">→</span>`;
  document.body.appendChild(entry);

  const scene = document.createElement('section');
  scene.className = 'co-scene';
  scene.id = 'coCreateScene';
  scene.setAttribute('role', 'dialog');
  scene.setAttribute('aria-modal', 'true');
  scene.setAttribute('aria-label', '草原火山共同景观');
  scene.setAttribute('aria-hidden', 'true');
  scene.innerHTML = `
    <canvas class="co-3d-canvas" id="co3dCanvas" aria-label="可拖拽环游的三维草原火山空间"></canvas>
    <div class="co-scene-art" aria-hidden="true">
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="coSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#071426"/>
            <stop offset=".46" stop-color="#183044"/>
            <stop offset=".72" stop-color="#66503e"/>
            <stop offset="1" stop-color="#1a211c"/>
          </linearGradient>
          <linearGradient id="coFarLand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#34483b"/>
            <stop offset="1" stop-color="#111b19"/>
          </linearGradient>
          <linearGradient id="coVolcano" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#362e2b"/>
            <stop offset=".5" stop-color="#17191b"/>
            <stop offset="1" stop-color="#4b3028"/>
          </linearGradient>
          <linearGradient id="coLava" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ffd27a"/>
            <stop offset=".28" stop-color="#ef6b39"/>
            <stop offset="1" stop-color="#8e2f25" stop-opacity=".08"/>
          </linearGradient>
          <linearGradient id="coGrass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#78875a"/>
            <stop offset="1" stop-color="#16231d"/>
          </linearGradient>
          <radialGradient id="coSun">
            <stop offset="0" stop-color="#f7d88a" stop-opacity=".88"/>
            <stop offset=".35" stop-color="#dba956" stop-opacity=".28"/>
            <stop offset="1" stop-color="#dba956" stop-opacity="0"/>
          </radialGradient>
          <filter id="coGlow"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect width="1600" height="900" fill="url(#coSky)"/>
        <circle cx="1250" cy="178" r="150" fill="url(#coSun)"/>
        <circle cx="1250" cy="178" r="24" fill="#f4d991" opacity=".75"/>
        <g fill="#fff3d2" opacity=".55">
          <circle cx="130" cy="136" r="1.8"/><circle cx="235" cy="206" r="1.2"/><circle cx="354" cy="112" r="1.6"/>
          <circle cx="472" cy="188" r="1.1"/><circle cx="585" cy="86" r="1.8"/><circle cx="715" cy="154" r="1.2"/>
          <circle cx="865" cy="94" r="1.4"/><circle cx="1012" cy="224" r="1.5"/><circle cx="1115" cy="102" r="1.1"/>
          <circle cx="1392" cy="94" r="1.8"/><circle cx="1480" cy="218" r="1.2"/><circle cx="930" cy="170" r=".9"/>
        </g>
        <g class="co-smoke" fill="none" stroke-linecap="round">
          <path d="M760 392 C716 332 750 292 712 246 C681 210 710 169 682 128" stroke="#c8d0c9" stroke-width="18" opacity=".08"/>
          <path d="M806 390 C840 332 810 286 852 247 C886 214 850 172 888 135" stroke="#e4ded1" stroke-width="11" opacity=".1"/>
        </g>
        <path d="M0 590 C210 520 335 558 515 526 C730 487 918 510 1094 475 C1280 438 1435 484 1600 432 L1600 900 L0 900Z" fill="#172622" opacity=".72"/>
        <path d="M0 660 C210 602 332 648 520 608 C745 560 935 610 1112 554 C1300 494 1450 560 1600 520 L1600 900 L0 900Z" fill="url(#coFarLand)"/>
        <path d="M356 704 C474 646 552 571 632 456 C690 372 731 337 796 352 C870 335 920 389 972 474 C1042 590 1127 654 1240 704 Z" fill="url(#coVolcano)" stroke="#6c5140" stroke-width="2"/>
        <path d="M630 457 C696 383 736 359 795 365 C853 355 908 389 972 474 C906 433 852 423 795 426 C734 422 690 431 630 457Z" fill="#0b0f12"/>
        <path d="M686 408 Q792 366 901 414 Q797 450 686 408Z" fill="#090d10" stroke="#a36542" stroke-width="4" opacity=".88"/>
        <path class="co-volcano-glow" d="M794 401 C776 470 804 514 776 568 C753 614 785 664 744 716" fill="none" stroke="url(#coLava)" stroke-width="15" stroke-linecap="round" filter="url(#coGlow)"/>
        <path class="co-volcano-glow" d="M828 408 C846 468 830 502 866 548 C897 588 880 630 927 686" fill="none" stroke="url(#coLava)" stroke-width="8" stroke-linecap="round" opacity=".72"/>
        <path d="M598 526 C682 500 742 512 808 492 C877 471 925 503 1011 526" fill="none" stroke="#d4b65f" stroke-width="2" stroke-dasharray="5 13" opacity=".34"/>
        <path d="M526 603 C664 565 725 592 824 566 C927 541 1000 580 1104 608" fill="none" stroke="#d4b65f" stroke-width="2" stroke-dasharray="4 15" opacity=".25"/>
        <image href="patterns_v2/volcano_5.png" x="720" y="472" width="160" height="160" opacity=".23"/>
        <path d="M0 721 C207 674 364 734 548 690 C725 648 944 718 1137 669 C1298 628 1455 674 1600 642 L1600 900 L0 900Z" fill="url(#coGrass)"/>
        <g class="co-grass-wave" fill="none" stroke-linecap="round">
          <path d="M58 830 Q74 770 52 728 M116 846 Q100 786 130 739 M185 844 Q206 780 186 716 M260 840 Q244 776 278 726" stroke="#91a66d" stroke-width="5" opacity=".55"/>
          <path d="M340 854 Q360 786 338 736 M426 848 Q402 786 445 724 M520 844 Q544 790 526 737" stroke="#718953" stroke-width="6" opacity=".62"/>
          <path d="M1030 852 Q1052 786 1034 726 M1120 844 Q1094 784 1140 720 M1218 852 Q1240 790 1216 734" stroke="#82975f" stroke-width="6" opacity=".6"/>
          <path d="M1318 846 Q1296 781 1338 724 M1412 854 Q1434 786 1410 716 M1510 844 Q1488 786 1530 727" stroke="#9aac70" stroke-width="5" opacity=".5"/>
        </g>
        <path d="M0 786 C220 740 384 811 585 767 C779 724 982 798 1170 752 C1342 710 1487 760 1600 738 L1600 900 L0 900Z" fill="#122019" opacity=".88"/>
      </svg>
    </div>
    <div class="co-scene-noise" aria-hidden="true"></div>
    <button class="co-back" id="coBack" type="button"><span aria-hidden="true">←</span> 返回调整</button>
    <div class="co-live-counter"><i aria-hidden="true"></i><span id="coLiveCount">正在读取共同景观</span></div>
    <aside class="co-recent-names" aria-label="最近进入共同景观的命名作品">
      <small>最近命名</small>
      <div id="coRecentNames"><span>等待第一枚命名纹样</span></div>
    </aside>
    <nav class="co-peak-rail" aria-label="探索五座纹样火山">
      <span class="co-peak-kicker">FIVE LIVING PEAKS</span>
      <button type="button" class="co-peak-button active" data-peak="all" aria-pressed="true"><b>◎</b><span>五峰总览</span></button>
      <button type="button" class="co-peak-button" data-peak="0" aria-pressed="false"><b>01</b><span>蝶莲焰</span></button>
      <button type="button" class="co-peak-button" data-peak="1" aria-pressed="false"><b>02</b><span>双翼织</span></button>
      <button type="button" class="co-peak-button" data-peak="2" aria-pressed="false"><b>03</b><span>龙凤日轮</span></button>
      <button type="button" class="co-peak-button" data-peak="3" aria-pressed="false"><b>04</b><span>蝶火脉</span></button>
      <button type="button" class="co-peak-button" data-peak="4" aria-pressed="false"><b>05</b><span>夜翼回纹</span></button>
      <small id="coPeakHint">点击火山靠近观看；拖拽绕山看立体纹样</small>
    </nav>
    <header class="co-scene-header">
      <div class="co-scene-kicker">ULAN HADA · 3D LIVING PATTERN LANDSCAPE</div>
      <h2>草原火山 · 共同生长</h2>
      <p>五座火山，各有纹样的生命 · 拖拽环游 · 滚轮穿行</p>
    </header>
    <div class="co-contributions" id="coContributions" aria-hidden="true"></div>
    <div class="co-pattern-orb" id="coPatternOrb"><img id="coPatternImage" alt="当前创作纹样"></div>
    <div class="co-pattern-caption" id="coPatternCaption">当前纹样</div>
    <div class="co-destination-panel" id="coDestinationPanel">
      <div class="co-panel-intro"><strong>为作品命名，再选择去向</strong><span>这个名字会随纹样一起留在共同景观</span></div>
      <label class="co-name-field">
        <span>作品名称</span>
        <input id="coPatternNameInput" type="text" maxlength="18" autocomplete="off" aria-label="为纹样作品命名" placeholder="例如：永恒的草原力量">
        <small><b id="coNameCount">0</b>/18</small>
      </label>
      <div class="co-destination-grid">
        <button class="co-destination" type="button" data-destination="grass">
          <span class="co-destination-icon" aria-hidden="true">〽</span>
          <span class="co-destination-copy"><strong>融入草原</strong><small>沉入草浪、山坡与熔岩地貌，成为大地纹理</small></span>
          <span class="co-recommend">推荐</span>
        </button>
        <button class="co-destination" type="button" data-destination="sky">
          <span class="co-destination-icon" aria-hidden="true">⌁</span>
          <span class="co-destination-copy"><strong>放飞天际</strong><small>升为空中的流云、风带与环山漂浮光纹</small></span>
          <span class="co-recommend">推荐</span>
        </button>
      </div>
      <div class="co-action-row">
        <div class="co-preview-note" id="coPreviewNote">正在预览纹样与景观的融合关系</div>
        <div class="co-actions">
          <button class="co-secondary" id="coChangeDestination" type="button">换个去向</button>
          <button class="co-confirm" id="coConfirmDestination" type="button">确认加入</button>
        </div>
      </div>
    </div>
    <div class="co-flight-hud" id="coFlightHud" aria-hidden="true">
      <span class="co-flight-reticle" aria-hidden="true"></span>
      <strong id="coFlightTitle">跟随纹样穿越粒子草原</strong>
      <span id="coFlightSubtitle">FPV PATTERN FLIGHT</span>
      <i><b id="coFlightProgress"></b></i>
    </div>
    <div class="co-success" id="coSuccess" role="status" aria-live="polite">
      <div class="co-success-mark" aria-hidden="true">✓</div>
      <h3 id="coSuccessTitle">纹样已融入共同景观</h3>
      <p id="coSuccessText">它将和其他参与者的纹样一起，在草原火山中继续生长。</p>
      <div class="co-success-actions">
        <button class="co-secondary" id="coStay" type="button">留在共同景观</button>
        <button class="co-confirm" id="coContinue" type="button">继续创作</button>
      </div>
    </div>`;
  document.body.appendChild(scene);

  const back = scene.querySelector('#coBack');
  const patternImage = scene.querySelector('#coPatternImage');
  const patternCaption = scene.querySelector('#coPatternCaption');
  const previewNote = scene.querySelector('#coPreviewNote');
  const confirmButton = scene.querySelector('#coConfirmDestination');
  const changeButton = scene.querySelector('#coChangeDestination');
  const contributionLayer = scene.querySelector('#coContributions');
  const liveCount = scene.querySelector('#coLiveCount');
  const recentNames = scene.querySelector('#coRecentNames');
  const peakButtons = Array.from(scene.querySelectorAll('.co-peak-button'));
  const peakHint = scene.querySelector('#coPeakHint');
  const success = scene.querySelector('#coSuccess');
  const successTitle = scene.querySelector('#coSuccessTitle');
  const successText = scene.querySelector('#coSuccessText');
  const stayButton = scene.querySelector('#coStay');
  const continueButton = scene.querySelector('#coContinue');
  const destinationButtons = Array.from(scene.querySelectorAll('.co-destination'));
  const nameInput = scene.querySelector('#coPatternNameInput');
  const nameCount = scene.querySelector('#coNameCount');
  const flightHud = scene.querySelector('#coFlightHud');
  const flightTitle = scene.querySelector('#coFlightTitle');
  const flightSubtitle = scene.querySelector('#coFlightSubtitle');
  const flightProgress = scene.querySelector('#coFlightProgress');

  let selectedDestination = '';
  let currentPatternName = '个人纹样';
  let currentPatternSource = 'patterns_v2/volcano_5.png';
  let currentRecommendation = 'grass';
  let animationTimer = null;

  // ===== 真三维草原火山共同景观 =====
  const worldCanvas = scene.querySelector('#co3dCanvas');
  let world = null;
  let worldActive = false;
  let worldFrame = 0;
  const orbit = { yaw: 0.025, pitch: 0.16, distance: 78, distanceGoal: 78, dragging: false, x: 0, y: 0, movedAt: 0 };
  const peakSpecs = [
    { x: -38, z: -19, height: 7.0, radius: 7.2, lip: 2.08, motif: '蝶莲焰', image: 'volcano-motif-01.jpg', tint: [0.19, 0.47, 0.45] },
    { x: -19, z: -37, height: 10.5, radius: 6.2, lip: 1.25, motif: '双翼织', image: 'volcano-motif-02.jpg', tint: [0.33, 0.28, 0.45] },
    { x: 0, z: -22.5, height: 11.4, radius: 8.0, lip: 1.82, motif: '龙凤日轮', image: 'volcano-motif-03.jpg', tint: [0.26, 0.39, 0.43] },
    { x: 19, z: -39, height: 9.6, radius: 7.2, lip: 1.36, motif: '蝶火脉', image: 'volcano-motif-04.jpg', tint: [0.30, 0.27, 0.43] },
    { x: 38, z: -20, height: 10.8, radius: 5.6, lip: 1.02, motif: '夜翼回纹', image: 'volcano-motif-05.jpg', tint: [0.16, 0.44, 0.47] }
  ];
  let selectedPeakIndex = null;

  function terrainHeight(x, z) {
    const wave = Math.sin(x * 0.22) * 0.38 + Math.cos(z * 0.18) * 0.32 + Math.sin((x + z) * 0.11) * 0.24;
    const distance = Math.sqrt(x * x + (z + 9) * (z + 9));
    let volcanicRidges = 0;
    peakSpecs.forEach((peak, index) => {
      const dx = x - peak.x;
      const dz = z - peak.z;
      const radius = Math.hypot(dx, dz);
      const apron = Math.max(0, 1 - radius / (peak.radius * 2.8));
      volcanicRidges += apron * apron * (0.45 + Math.sin(Math.atan2(dz, dx) * (5 + index) + radius) * 0.11);
    });
    return wave + Math.max(0, 7 - distance) * 0.075 + volcanicRidges;
  }

  function seeded(seed, offset) {
    return numberFromString(String(seed), offset || 0);
  }

  function createVolcanoGeometry() {
    const segments = 84;
    const rings = 25;
    const vertices = [];
    const colors = [];
    const indices = [];
    for (let ring = 0; ring < rings; ring += 1) {
      const t = ring / (rings - 1);
      const y = 0.15 + t * 10.2;
      const baseRadius = 8.9 * Math.pow(1 - t, 0.72) + 2.15 * t;
      for (let segment = 0; segment < segments; segment += 1) {
        const angle = segment / segments * Math.PI * 2;
        const rough = Math.sin(angle * 5 + t * 8) * 0.24 + Math.sin(angle * 11 - t * 5) * 0.11;
        const radius = baseRadius + rough * (1 - t * 0.58);
        vertices.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius - 9);
        const heat = Math.max(0, t - 0.7) / 0.3;
        colors.push(0.13 + heat * 0.17, 0.12 + heat * 0.06, 0.12 + heat * 0.01);
      }
    }
    for (let ring = 0; ring < rings - 1; ring += 1) {
      for (let segment = 0; segment < segments; segment += 1) {
        const next = (segment + 1) % segments;
        const a = ring * segments + segment;
        const b = ring * segments + next;
        const c = (ring + 1) * segments + segment;
        const d = (ring + 1) * segments + next;
        indices.push(a, c, b, b, c, d);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  function makeLavaCurve(points, radius) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p[0], p[1], p[2])));
    const geometry = new THREE.TubeGeometry(curve, 72, radius, 8, false);
    const material = new THREE.MeshBasicMaterial({ color: 0xff6b2c, transparent: true, opacity: 0.9 });
    const lava = new THREE.Mesh(geometry, material);
    lava.userData.isLava = true;
    return lava;
  }

  function createGrassField() {
    const mobile = window.innerWidth < 760;
    const bladeCount = mobile ? 360 : 980;
    const positions = new Float32Array(bladeCount * 6);
    const phases = new Float32Array(bladeCount);
    const heights = new Float32Array(bladeCount);
    for (let i = 0; i < bladeCount; i += 1) {
      let x = (Math.random() - 0.5) * 70;
      let z = (Math.random() - 0.5) * 48 + 5;
      if (Math.abs(x) < 9 && z < -1) { x += x < 0 ? -9 : 9; z += 5; }
      const y = terrainHeight(x, z);
      const h = 0.35 + Math.random() * 0.9;
      const index = i * 6;
      positions[index] = x; positions[index + 1] = y; positions[index + 2] = z;
      positions[index + 3] = x; positions[index + 4] = y + h; positions[index + 5] = z;
      phases[i] = Math.random() * Math.PI * 2;
      heights[i] = h;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.LineBasicMaterial({ color: 0x7f9560, transparent: true, opacity: 0.72 });
    const grass = new THREE.LineSegments(geometry, material);
    grass.userData.phases = phases;
    grass.userData.heights = heights;
    return grass;
  }

  function initLegacy3DWorld() {
    if (world || !worldCanvas || typeof THREE === 'undefined') return Boolean(world);
    try {
      const renderer = new THREE.WebGLRenderer({ canvas: worldCanvas, antialias: window.innerWidth > 760, alpha: false, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.25 : 1.65));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;

      const worldScene = new THREE.Scene();
      worldScene.background = new THREE.Color(0x071322);
      worldScene.fog = new THREE.FogExp2(0x0a1722, 0.018);
      const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 160);
      worldScene.add(new THREE.HemisphereLight(0x9bc8df, 0x11150d, 1.45));
      const sun = new THREE.DirectionalLight(0xffdf9d, 2.35);
      sun.position.set(16, 24, 10);
      worldScene.add(sun);
      const lavaLight = new THREE.PointLight(0xff5d21, 34, 25, 1.8);
      lavaLight.position.set(0, 9.5, -7);
      worldScene.add(lavaLight);

      const terrainGeometry = new THREE.PlaneGeometry(92, 70, 64, 50);
      terrainGeometry.rotateX(-Math.PI / 2);
      const terrainPositions = terrainGeometry.attributes.position;
      const terrainColors = [];
      for (let i = 0; i < terrainPositions.count; i += 1) {
        const x = terrainPositions.getX(i);
        const z = terrainPositions.getZ(i);
        const y = terrainHeight(x, z);
        terrainPositions.setY(i, y);
        const light = Math.max(0, Math.min(1, (y + 1.2) / 3));
        terrainColors.push(0.10 + light * 0.12, 0.18 + light * 0.16, 0.13 + light * 0.07);
      }
      terrainGeometry.setAttribute('color', new THREE.Float32BufferAttribute(terrainColors, 3));
      terrainGeometry.computeVertexNormals();
      const terrain = new THREE.Mesh(terrainGeometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, metalness: 0.02 }));
      worldScene.add(terrain);

      const distantHills = new THREE.Group();
      [
        [-21, -28, 9.8, 7.5, 0x17251f],
        [18, -31, 12.5, 8.8, 0x1b2923],
        [34, -23, 8.2, 5.9, 0x24342a],
        [-38, -21, 7.4, 5.2, 0x203027]
      ].forEach(spec => {
        const hill = new THREE.Mesh(
          new THREE.ConeGeometry(spec[2], spec[3], 28, 5),
          new THREE.MeshStandardMaterial({ color: spec[4], roughness: 1, flatShading: true })
        );
        hill.position.set(spec[0], spec[3] * 0.48 - 0.5, spec[1]);
        hill.rotation.y = spec[0] * 0.07;
        distantHills.add(hill);
      });
      worldScene.add(distantHills);

      const volcano = new THREE.Mesh(createVolcanoGeometry(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.93, metalness: 0.04, side: THREE.DoubleSide }));
      worldScene.add(volcano);
      const crater = new THREE.Mesh(new THREE.TorusGeometry(2.42, 0.34, 14, 84), new THREE.MeshStandardMaterial({ color: 0x6f3427, emissive: 0xff4a1b, emissiveIntensity: 0.44, roughness: 0.72 }));
      crater.rotation.x = Math.PI / 2;
      crater.position.set(0, 10.35, -9);
      worldScene.add(crater);
      const craterCore = new THREE.Mesh(new THREE.CircleGeometry(2.14, 72), new THREE.MeshBasicMaterial({ color: 0x100b0b, side: THREE.DoubleSide }));
      craterCore.rotation.x = -Math.PI / 2;
      craterCore.position.set(0, 10.17, -9);
      worldScene.add(craterCore);

      const lavaGroup = new THREE.Group();
      lavaGroup.add(makeLavaCurve([[0.25, 10.3, -6.75], [0.8, 8.1, -5.7], [0.1, 6.2, -4.3], [1.1, 3.5, -2.5], [0.5, 0.5, 1.2]], 0.16));
      lavaGroup.add(makeLavaCurve([[-0.65, 10.15, -7.0], [-1.2, 8.4, -6.0], [-0.9, 6.8, -4.9], [-2.2, 4.2, -3.0], [-3.1, 1.2, -0.2]], 0.09));
      worldScene.add(lavaGroup);

      const smokeGroup = new THREE.Group();
      const smokeGeometry = new THREE.SphereGeometry(0.72, 9, 7);
      for (let i = 0; i < 16; i += 1) {
        const puff = new THREE.Mesh(smokeGeometry, new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0xd6cbc0 : 0x788087, transparent: true, opacity: 0.055, depthWrite: false }));
        puff.userData = { phase: i / 16, speed: 0.025 + (i % 5) * 0.004, side: Math.sin(i * 2.1) };
        smokeGroup.add(puff);
      }
      worldScene.add(smokeGroup);

      const grass = createGrassField();
      worldScene.add(grass);
      const starsGeometry = new THREE.BufferGeometry();
      const starCount = window.innerWidth < 760 ? 260 : 620;
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i += 1) {
        const r = 42 + Math.random() * 35;
        const angle = Math.random() * Math.PI * 2;
        starPositions[i * 3] = Math.cos(angle) * r;
        starPositions[i * 3 + 1] = 9 + Math.random() * 34;
        starPositions[i * 3 + 2] = Math.sin(angle) * r - 10;
      }
      starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const stars = new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: 0xffedbd, size: 0.16, transparent: true, opacity: 0.72, sizeAttenuation: true }));
      worldScene.add(stars);

      const contributionGroup = new THREE.Group();
      worldScene.add(contributionGroup);
      world = { renderer, scene: worldScene, camera, terrain, volcano, crater, lavaGroup, smokeGroup, grass, stars, contributionGroup, target: new THREE.Vector3(0, 3.8, -7), targetGoal: new THREE.Vector3(0, 3.8, -7) };
      scene.classList.add('co-3d-ready');

      worldCanvas.addEventListener('pointerdown', event => {
        event.preventDefault();
        orbit.dragging = true; orbit.x = event.clientX; orbit.y = event.clientY; orbit.movedAt = performance.now();
        worldCanvas.setPointerCapture(event.pointerId);
      });
      worldCanvas.addEventListener('pointermove', event => {
        if (!orbit.dragging) return;
        event.preventDefault();
        orbit.yaw -= (event.clientX - orbit.x) * 0.006;
        orbit.pitch = Math.max(-0.02, Math.min(0.66, orbit.pitch + (event.clientY - orbit.y) * 0.004));
        orbit.x = event.clientX; orbit.y = event.clientY; orbit.movedAt = performance.now();
      });
      const stopDrag = () => { orbit.dragging = false; orbit.movedAt = performance.now(); };
      worldCanvas.addEventListener('pointerup', stopDrag);
      worldCanvas.addEventListener('pointercancel', stopDrag);
      worldCanvas.addEventListener('wheel', event => {
        event.preventDefault();
        orbit.distance = Math.max(14, Math.min(46, orbit.distance + event.deltaY * 0.018));
        orbit.movedAt = performance.now();
      }, { passive: false });
      window.addEventListener('resize', resize3DWorld);
      resize3DWorld();
      return true;
    } catch (error) {
      console.warn('三维共同景观初始化失败，已保留二维景观作为兼容回退。', error);
      scene.classList.add('co-3d-fallback');
      return false;
    }
  }

  function makeParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 31);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.22, 'rgba(255,255,255,.96)');
    gradient.addColorStop(0.62, 'rgba(255,255,255,.36)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  function makePointCloud(positions, colors, options) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    if (colors && colors.length) geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      size: options.size,
      map: options.texture,
      vertexColors: Boolean(colors && colors.length),
      color: options.color || 0xffffff,
      transparent: true,
      opacity: options.opacity == null ? 1 : options.opacity,
      alphaTest: options.alphaTest == null ? 0.035 : options.alphaTest,
      depthWrite: options.depthWrite !== false,
      sizeAttenuation: true,
      blending: options.additive ? THREE.AdditiveBlending : THREE.NormalBlending
    });
    return new THREE.Points(geometry, material);
  }

  function createReferenceParticleLandscape(worldScene, particleTexture) {
    const holder = new THREE.Group();
    holder.userData = { disposed: false, volumetric: true };
    worldScene.add(holder);
    const image = new Image();
    image.onload = () => {
      if (holder.userData.disposed) return;
      const width = 320;
      const height = 180;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(image, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const layers = ['sky', 'horizon', 'ground', 'aura'].map(role => ({ role, positions: [], colors: [] }));
      for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
          const offset = (y * width + x) * 4;
          const r = data[offset] / 255;
          const g = data[offset + 1] / 255;
          const b = data[offset + 2] / 255;
          const brightness = (r + g + b) / 3;
          if (data[offset + 3] < 60 || brightness < 0.15) continue;
          const u = x / (width - 1);
          const v = y / (height - 1);
          const layerIndex = v < 0.36 ? 0 : v < 0.69 ? 1 : 2;
          const theta = (u - 0.5) * Math.PI * 1.72;
          const color = [Math.min(1, r * 1.5 + 0.025), Math.min(1, g * 1.44 + 0.025), Math.min(1, b * 1.38 + 0.025)];
          let px; let py; let pz;
          if (layerIndex === 0) {
            // 天空纹样进入半球内壁；不同颜色拥有不同半径，龙凤、日轮和云纹不再共面。
            const elevation = 0.16 + (0.36 - v) / 0.36 * 0.62;
            const radius = 66 + brightness * 14 + Math.sin((r - b) * Math.PI) * 4;
            px = Math.sin(theta) * Math.cos(elevation) * radius;
            py = 7 + Math.sin(elevation) * radius;
            pz = -18 - Math.cos(theta) * Math.cos(elevation) * radius;
          } else if (layerIndex === 1) {
            // 中景围成弧形山环，颜色层决定前后深度，摄像机能从山环与五峰之间穿过。
            const band = (v - 0.36) / 0.33;
            const radius = 49 + band * 24 + (r - b) * 6 + Math.sin(u * Math.PI * 8) * 2.4;
            px = Math.sin(theta) * radius;
            pz = -17 - Math.cos(theta) * radius;
            py = terrainHeight(px, pz) + (1 - band) * 15 + brightness * 1.8;
          } else {
            // 前景被摊入连续地表，并沿道路方向拉出纵深，不再形成竖立背景板。
            const depth = (v - 0.69) / 0.31;
            px = (u - 0.5) * (78 + depth * 44);
            pz = -24 + depth * 72 + Math.sin(u * Math.PI * 5) * 1.8;
            py = terrainHeight(px, pz) + 0.1 + brightness * 0.24;
          }
          layers[layerIndex].positions.push(px, py, pz);
          layers[layerIndex].colors.push(...color);
          if (brightness > 0.55 && (x + y) % 4 === 0) {
            const length = Math.hypot(px, pz) || 1;
            const auraX = px + px / length * 0.55;
            const auraZ = pz + pz / length * 0.55;
            layers[3].positions.push(auraX, py + 0.18, auraZ);
            layers[3].colors.push(...color);
          }
        }
      }
      layers.forEach((layer, index) => {
        const cloud = makePointCloud(layer.positions, layer.colors, {
          size: index === 0 ? 0.58 : index === 1 ? 0.34 : index === 2 ? 0.24 : 0.72,
          texture: particleTexture,
          opacity: index === 3 ? 0.2 : index === 2 ? 0.76 : 0.88,
          additive: index === 3,
          depthWrite: false
        });
        cloud.material.fog = false;
        cloud.name = `volumetric-reference-${layer.role}`;
        cloud.userData = { zone: index, role: layer.role, baseSize: cloud.material.size };
        holder.add(cloud);
      });
    };
    image.onerror = () => console.warn('参考粒子景观图加载失败');
    image.src = 'lib/images/references/particle-landscape-reference.png?v=1.0';
    return holder;
  }

  function peakRadiusAt(spec, index, t) {
    const profiles = [1.05, 1.12, 0.7, 0.82, 1.32];
    const base = spec.radius * Math.pow(Math.max(0, 1 - t), profiles[index]);
    const terraces = index === 3 ? Math.floor(t * 5) * 0.075 * (1 - t) * spec.radius : 0;
    return base + spec.lip * t + terraces;
  }

  // 五张设计图的主要视觉构件。矩形只用于从原图中分离图腾，不会作为网页中的图片平面显示。
  // angle 决定粒子雕塑环山方位；detached 表示从山体纹样中抽离为独立空间构件。
  function volcanoTotemRegions(index) {
    const layouts = [
      [
        { x0: 0.03, x1: 0.35, y0: 0.08, y1: 0.62, angle: -0.52, scale: 0.92, lift: 0.2, detached: true },
        { x0: 0.65, x1: 0.97, y0: 0.08, y1: 0.62, angle: 0.52, scale: 0.92, lift: 0.2, detached: true },
        { x0: 0.34, x1: 0.66, y0: 0.02, y1: 0.55, angle: 0, scale: 0.88, lift: 1.0, detached: true }
      ],
      [
        { x0: 0.03, x1: 0.37, y0: 0.18, y1: 0.63, angle: -0.55, scale: 0.95, lift: 0.1, detached: true },
        { x0: 0.63, x1: 0.97, y0: 0.18, y1: 0.63, angle: 0.55, scale: 0.95, lift: 0.1, detached: true },
        { x0: 0.34, x1: 0.66, y0: 0.01, y1: 0.36, angle: 0.2, scale: 0.82, lift: 1.5, detached: true }
      ],
      [
        { x0: 0.0, x1: 0.37, y0: 0.03, y1: 0.96, angle: -0.66, scale: 0.78, lift: 0.5, detached: true },
        { x0: 0.63, x1: 1.0, y0: 0.03, y1: 0.96, angle: 0.66, scale: 0.78, lift: 0.5, detached: true },
        { x0: 0.35, x1: 0.65, y0: 0.0, y1: 0.34, angle: 0, scale: 0.86, lift: 2.0, detached: true }
      ],
      [
        { x0: 0.0, x1: 0.37, y0: 0.0, y1: 0.48, angle: -0.4, scale: 0.84, lift: 0.9, detached: true },
        { x0: 0.63, x1: 1.0, y0: 0.0, y1: 0.48, angle: 0.4, scale: 0.84, lift: 0.9, detached: true },
        { x0: 0.0, x1: 0.37, y0: 0.45, y1: 0.92, angle: -2.5, scale: 0.84, lift: -0.5, detached: true },
        { x0: 0.63, x1: 1.0, y0: 0.45, y1: 0.92, angle: 2.5, scale: 0.84, lift: -0.5, detached: true },
        { x0: 0.38, x1: 0.62, y0: 0.0, y1: 0.37, angle: 0, scale: 0.76, lift: 1.8, detached: true }
      ],
      [
        { x0: 0.12, x1: 0.43, y0: 0.02, y1: 0.42, angle: -0.42, scale: 0.78, lift: 1.2, detached: true },
        { x0: 0.57, x1: 0.88, y0: 0.02, y1: 0.42, angle: 0.42, scale: 0.78, lift: 1.2, detached: true },
        { x0: 0.08, x1: 0.42, y0: 0.35, y1: 0.76, angle: -2.45, scale: 0.8, lift: 0.1, detached: true },
        { x0: 0.58, x1: 0.92, y0: 0.35, y1: 0.76, angle: 2.45, scale: 0.8, lift: 0.1, detached: true },
        { x0: 0.34, x1: 0.66, y0: 0.13, y1: 0.52, angle: 0, scale: 0.82, lift: 1.8, detached: true }
      ]
    ];
    return layouts[index] || [];
  }

  // 五张图只作为形状/配色数据源：山内纹样按每一高度环绕 360°，图外元素成为有厚度的轨道图腾。
  function createPatternVolcano(spec, index, texture, mobile) {
    const holder = new THREE.Group();
    holder.position.set(spec.x, terrainHeight(spec.x, spec.z) - 0.3, spec.z);
    holder.userData = { index, spec, motifs: [], breathPhase: index * 1.31, focusMix: 1, disposed: false };

    const shellPositions = [];
    const shellColors = [];
    const shellCount = mobile ? 7800 : 18000;
    for (let i = 0; i < shellCount; i += 1) {
      const t = Math.pow(Math.random(), 0.89);
      const angle = Math.random() * Math.PI * 2;
      const radius = peakRadiusAt(spec, index, t);
      const rugged = Math.sin(angle * (5 + index) + t * 8) * 0.17 + Math.sin(angle * 13 - t * 10) * 0.1;
      const r = radius + rugged + (Math.random() - 0.5) * 0.15;
      shellPositions.push(Math.cos(angle) * r, t * spec.height, Math.sin(angle) * r);
      const light = Math.max(0, Math.sin(angle) * 0.2) + t * 0.2;
      shellColors.push(Math.min(1, spec.tint[0] + light * 0.55), Math.min(1, spec.tint[1] + light * 0.45), Math.min(1, spec.tint[2] + light * 0.42));
    }
    const shell = makePointCloud(shellPositions, shellColors, { size: mobile ? 0.18 : 0.15, texture, opacity: 0.76 });
    holder.add(shell);
    holder.userData.shell = shell;

    // 原图正面之外，五座山的背面仍延续各自的回纹、云纹或几何节奏。
    const carvedPositions = [];
    const carvedColors = [];
    for (const band of [0.17, 0.28, 0.41, 0.56, 0.72]) {
      const steps = mobile ? 360 : 760;
      for (let i = 0; i < steps; i += 1) {
        const angle = i / steps * Math.PI * 2;
        const motifWave = index === 1 || index === 4
          ? (Math.abs(Math.sin(angle * 12)) - 0.5) * 0.34
          : Math.sin(angle * (7 + index)) * 0.16 + Math.sin(angle * 14) * 0.055;
        const t = Math.max(0.03, Math.min(0.96, band + motifWave / spec.height));
        const radius = peakRadiusAt(spec, index, t) + 0.22;
        carvedPositions.push(Math.sin(angle) * radius, t * spec.height, Math.cos(angle) * radius);
        const teal = (index === 0 || index === 4) && band < 0.5;
        carvedColors.push(teal ? 0.35 : 0.94, teal ? 0.82 : 0.77, teal ? 0.76 : 0.53);
      }
    }
    const carvedBands = makePointCloud(carvedPositions, carvedColors, { size: mobile ? 0.15 : 0.13, texture, opacity: 0.83, depthWrite: false });
    holder.add(carvedBands);
    holder.userData.carvedBands = carvedBands;

    const lipPositions = [];
    const lipColors = [];
    const lipCount = mobile ? 360 : 780;
    for (let i = 0; i < lipCount; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const r = spec.lip + Math.sin(a * (4 + index)) * 0.075 + (Math.random() - 0.5) * 0.3;
      lipPositions.push(Math.cos(a) * r, spec.height + Math.sin(a * 5 + index) * 0.07, Math.sin(a) * r);
      lipColors.push(1, 0.43 + Math.random() * 0.28, 0.12 + Math.random() * 0.1);
    }
    const lip = makePointCloud(lipPositions, lipColors, { size: mobile ? 0.18 : 0.15, texture, opacity: 0.8, additive: true, depthWrite: false });
    holder.add(lip);
    holder.userData.lip = lip;

    for (let stream = 0; stream < 2; stream += 1) {
      const a = (stream ? 1.85 : 1.12) + index * 0.33;
      const positions = [];
      const colors = [];
      const count = mobile ? 180 : 420;
      for (let i = 0; i < count; i += 1) {
        const t = Math.random();
        const y = spec.height * (1 - t);
        const r = peakRadiusAt(spec, index, 1 - t);
        const winding = a + Math.sin(t * 5 + index) * 0.12;
        positions.push(Math.cos(winding) * r + (Math.random() - 0.5) * 0.1, y, Math.sin(winding) * r + (Math.random() - 0.5) * 0.1);
        colors.push(1, 0.20 + Math.random() * 0.46, 0.03);
      }
      const streamCloud = makePointCloud(positions, colors, { size: mobile ? 0.2 : 0.17, texture, opacity: 0.7, additive: true, depthWrite: false });
      holder.add(streamCloud);
      holder.userData[`stream${stream}`] = streamCloud;
    }

    if (index === 0 && window.CoCreateSculptures) {
      const sculpture = window.CoCreateSculptures.buildFirstPeak({
        THREE, spec, texture, mobile, makePointCloud, peakRadiusAt
      });
      holder.add(sculpture.group);
      holder.userData.sculpture = sculpture;
      return holder;
    }

    const image = new Image();
    image.onload = () => {
      if (holder.userData.disposed) return;
      const width = mobile ? 192 : 384;
      const height = Math.round(width * 2 / 3);
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(image, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const motifZones = ['surface', 'totem', 'glow'].map(role => ({ role, positions: [], colors: [] }));
      const crestV = [0.56, 0.64, 0.70, 0.77, 0.54][index];
      const totemRegions = volcanoTotemRegions(index);
      let sourcePoint = 0;
      const pixelStep = mobile ? 3 : 2;
      for (let y = 0; y < height; y += pixelStep) {
        for (let x = 0; x < width; x += pixelStep) {
          const offset = (y * width + x) * 4;
          const r = data[offset] / 255;
          const g = data[offset + 1] / 255;
          const b = data[offset + 2] / 255;
          const brightness = (r + g + b) / 3;
          if (brightness < 0.19) continue;
          const u = x / (width - 1) - 0.5;
          const v = 1 - y / (height - 1);
          const normalizedHeight = (v - 0.095) / (crestV - 0.095);
          const t = Math.max(0.025, Math.min(0.98, normalizedHeight));
          const py = t * spec.height;
          const surfaceRadius = peakRadiusAt(spec, index, t);
          const mountainHalfWidth = 0.07 + (1 - t) * [0.42, 0.39, 0.44, 0.46, 0.34][index];
          const baseMountain = normalizedHeight >= 0 && normalizedHeight <= 1.04 && Math.abs(u) <= mountainHalfWidth;
          const nx = x / (width - 1);
          const ny = y / (height - 1);
          const region = totemRegions.find(item => nx >= item.x0 && nx <= item.x1 && ny >= item.y0 && ny <= item.y1);
          const isTotem = Boolean(region && (region.detached || !baseMountain));
          const isMountain = baseMountain && !isTotem;
          if (!isMountain && !isTotem) continue;
          const zone = motifZones[isMountain ? 0 : 1];
          const color = [Math.min(1, r * 1.65 + 0.035), Math.min(1, g * 1.58 + 0.035), Math.min(1, b * 1.52 + 0.035)];
          let orbitAngle; let orbitRadius; let pointX; let pointZ; let totemY;
          if (isMountain) {
            // 同一高度上的山体图案横坐标被重新参数化为完整圆周，因此不存在“正面图片”。
            const rowU = u / (mountainHalfWidth * 2) + 0.5;
            orbitAngle = rowU * Math.PI * 2 + index * 0.37 + Math.sin(v * Math.PI * 4) * 0.035;
            orbitRadius = surfaceRadius + 0.3 + brightness * 0.2;
            pointX = Math.sin(orbitAngle) * orbitRadius;
            pointZ = Math.cos(orbitAngle) * orbitRadius;
            totemY = py;
          } else {
            // 图腾区块以切向坐标重建，再沿径向挤出；从正侧后方都能看到真实厚度。
            const centerX = (region.x0 + region.x1) * 0.5;
            const centerY = (region.y0 + region.y1) * 0.5;
            const localX = (nx - centerX) / Math.max(0.08, region.x1 - region.x0) * spec.radius * 1.02 * region.scale;
            const localY = (centerY - ny) / Math.max(0.08, region.y1 - region.y0) * spec.height * 0.72 * region.scale;
            orbitAngle = region.angle + index * 0.11;
            orbitRadius = spec.radius * 1.12 + 1.15 + brightness * 0.34;
            const tangentX = Math.cos(orbitAngle);
            const tangentZ = -Math.sin(orbitAngle);
            pointX = Math.sin(orbitAngle) * orbitRadius + tangentX * localX;
            pointZ = Math.cos(orbitAngle) * orbitRadius + tangentZ * localX;
            totemY = spec.height * 0.52 + region.lift + localY;
          }
          zone.positions.push(pointX, totemY, pointZ);
          zone.colors.push(...color);
          // 每隔几粒增加径向厚度和外层辉光，使图腾是体积雕塑而非一层点皮。
          if (sourcePoint % 3 === 0) {
            const depth = isMountain ? 0.2 : 0.52;
            const depthX = pointX + Math.sin(orbitAngle) * depth;
            const depthZ = pointZ + Math.cos(orbitAngle) * depth;
            zone.positions.push(depthX, totemY + (isMountain ? 0.02 : 0.08), depthZ);
            zone.colors.push(...color);
            motifZones[2].positions.push(depthX + Math.sin(orbitAngle) * 0.24, totemY + 0.12, depthZ + Math.cos(orbitAngle) * 0.24);
            motifZones[2].colors.push(Math.min(1, color[0] * 0.8 + 0.12), Math.min(1, color[1] * 0.8 + 0.12), Math.min(1, color[2] * 0.8 + 0.12));
          }
          sourcePoint += 1;
        }
      }
      motifZones.forEach((zone, zoneIndex) => {
        const motif = makePointCloud(zone.positions, zone.colors, {
          size: zoneIndex === 2 ? (mobile ? 0.38 : 0.34) : zoneIndex === 1 ? (mobile ? 0.31 : 0.27) : (mobile ? 0.25 : 0.21),
          texture,
          opacity: zoneIndex === 2 ? 0.34 : 0.96,
          depthWrite: false,
          additive: true
        });
        motif.userData = {
          role: zone.role,
          surfacePattern: zoneIndex === 0,
          floating: zoneIndex === 1,
          glow: zoneIndex === 2,
          baseSize: motif.material.size,
          baseRotation: 0,
          phase: index * 0.9 + zoneIndex * 0.7
        };
        motif.material.fog = false;
        motif.material.toneMapped = false;
        holder.add(motif);
        holder.userData.motifs.push(motif);
      });
    };
    image.onerror = () => console.warn(`火山纹样 ${index + 1} 加载失败`);
    image.src = `lib/images/references/${spec.image}?v=1.0`;
    return holder;
  }

  function init3DWorld() {
    if (world || !worldCanvas || typeof THREE === 'undefined') return Boolean(world);
    try {
      const mobile = window.innerWidth < 760;
      const renderer = new THREE.WebGLRenderer({ canvas: worldCanvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.15 : 1.55));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.18;

      const worldScene = new THREE.Scene();
      worldScene.background = new THREE.Color(0x030914);
      worldScene.fog = new THREE.FogExp2(0x050b14, 0.015);
      const camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.08, 180);
      const particleTexture = makeParticleTexture();

      // 粒子草原：规则网格加微扰，形成连续但可呼吸的地貌点云。
      const terrainPositions = [];
      const terrainColors = [];
      const terrainBaseY = [];
      const terrainPhases = [];
      const terrainCols = mobile ? 104 : 248;
      const terrainRows = mobile ? 72 : 174;
      for (let row = 0; row < terrainRows; row += 1) {
        for (let col = 0; col < terrainCols; col += 1) {
          const x = -62 + col / (terrainCols - 1) * 124 + (Math.random() - 0.5) * 0.22;
          const z = -52 + row / (terrainRows - 1) * 92 + (Math.random() - 0.5) * 0.22;
          const y = terrainHeight(x, z);
          terrainPositions.push(x, y, z);
          terrainBaseY.push(y);
          terrainPhases.push(Math.random() * Math.PI * 2);
          const light = Math.max(0, Math.min(1, (y + 1.1) / 2.8));
          const goldDust = Math.random() > 0.965 ? 0.28 : 0;
          const nearestPeak = Math.min(...peakSpecs.map(spec => Math.hypot(x - spec.x, z - spec.z)));
          const volcanic = Math.max(0, Math.min(1, (25 - nearestPeak) / 18));
          terrainColors.push(
            (0.14 + light * 0.1) * (1 - volcanic) + (0.28 + goldDust) * volcanic,
            (0.35 + light * 0.24) * (1 - volcanic) + (0.25 + goldDust * 0.45) * volcanic,
            (0.18 + light * 0.1) * (1 - volcanic) + 0.23 * volcanic
          );
        }
      }
      const terrain = makePointCloud(terrainPositions, terrainColors, { size: mobile ? 0.16 : 0.23, texture: particleTexture, opacity: 0.92 });
      terrain.geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
      terrain.userData = { baseY: Float32Array.from(terrainBaseY), phases: Float32Array.from(terrainPhases) };
      worldScene.add(terrain);

      // 玄武岩碎屑和熔岩扇从每座峰脚向草原扩散，填满原来空洞的近中景。
      const basaltPositions = [];
      const basaltColors = [];
      peakSpecs.forEach((spec, peakIndex) => {
        const count = mobile ? 850 : 2300;
        for (let i = 0; i < count; i += 1) {
          const angle = Math.random() * Math.PI * 2;
          const distance = spec.radius * (1.05 + Math.pow(Math.random(), 1.4) * 2.35);
          const x = spec.x + Math.cos(angle) * distance;
          const z = spec.z + Math.sin(angle) * distance;
          const ridge = Math.sin(distance * 1.7 + angle * (5 + peakIndex)) * 0.11;
          basaltPositions.push(x, terrainHeight(x, z) + 0.12 + ridge, z);
          const hot = Math.sin(angle * 4 + distance * 0.7 + peakIndex) > 0.89;
          basaltColors.push(hot ? 0.68 : 0.26, hot ? 0.22 : 0.31, hot ? 0.11 : 0.27);
        }
      });
      const basalt = makePointCloud(basaltPositions, basaltColors, { size: mobile ? 0.19 : 0.16, texture: particleTexture, opacity: 0.68 });
      worldScene.add(basalt);

      const volcanoPeaks = peakSpecs.map((spec, index) => createPatternVolcano(spec, index, particleTexture, mobile));
      volcanoPeaks.forEach(peak => worldScene.add(peak));

      // 像刺绣的连线穿过五座峰，近处的弯路把观众的视线引向火山群。
      const livingThreads = new THREE.Group();
      for (let link = 0; link < peakSpecs.length - 1; link += 1) {
        const from = peakSpecs[link];
        const to = peakSpecs[link + 1];
        const positions = [];
        const colors = [];
        const count = mobile ? 270 : 680;
        for (let i = 0; i < count; i += 1) {
          const t = i / (count - 1);
          const x = from.x * (1 - t) + to.x * t;
          const z = from.z * (1 - t) + to.z * t + Math.sin(t * Math.PI) * 2.6;
          const y = terrainHeight(x, z) + 0.55 + Math.sin(t * Math.PI) * (1.9 + (link % 2) * 0.7);
          positions.push(x + (Math.random() - 0.5) * 0.18, y + (Math.random() - 0.5) * 0.15, z);
          colors.push(link % 2 ? 0.95 : 0.38, link % 2 ? 0.62 : 0.82, link % 2 ? 0.26 : 0.76);
        }
        const thread = makePointCloud(positions, colors, { size: mobile ? 0.15 : 0.115, texture: particleTexture, opacity: 0.8, additive: true, depthWrite: false });
        thread.userData.phase = link * 1.3;
        livingThreads.add(thread);
      }
      const roadCurve = new THREE.CatmullRomCurve3([
        [0, 0.25, 28], [-5, 0.22, 16], [4, 0.28, 7], [-3, 0.35, -4], [0, 0.55, -15]
      ].map(p => new THREE.Vector3(p[0], p[1], p[2])));
      const roadPositions = [];
      const roadColors = [];
      const roadCount = mobile ? 440 : 950;
      for (let edge = -1; edge <= 1; edge += 2) {
        for (let i = 0; i < roadCount; i += 1) {
          const t = i / (roadCount - 1);
          const point = roadCurve.getPointAt(t);
          const x = point.x + edge * (0.52 + t * 0.35);
          roadPositions.push(x, terrainHeight(x, point.z) + 0.14, point.z);
          roadColors.push(edge < 0 ? 0.95 : 0.34, edge < 0 ? 0.75 : 0.77, edge < 0 ? 0.37 : 0.68);
        }
      }
      const road = makePointCloud(roadPositions, roadColors, { size: mobile ? 0.16 : 0.13, texture: particleTexture, opacity: 0.9, additive: true, depthWrite: false });
      road.userData.phase = 5.4;
      livingThreads.add(road);
      const wovenRoadPositions = [];
      const wovenRoadColors = [];
      const wovenRoadCount = mobile ? 3600 : 11200;
      for (let i = 0; i < wovenRoadCount; i += 1) {
        const t = Math.random();
        const p = roadCurve.getPointAt(t);
        const tangent = roadCurve.getTangentAt(t);
        const width = (1.2 + (1 - t) * 1.7) * (Math.random() - 0.5) * 2;
        const x = p.x + tangent.z * width;
        const z = p.z - tangent.x * width;
        wovenRoadPositions.push(x, terrainHeight(x, z) + 0.11, z);
        const light = Math.random();
        wovenRoadColors.push(0.63 + light * 0.27, 0.43 + light * 0.29, 0.23 + light * 0.2);
      }
      const wovenRoad = makePointCloud(wovenRoadPositions, wovenRoadColors, { size: mobile ? 0.22 : 0.23, texture: particleTexture, opacity: 0.9 });
      livingThreads.add(wovenRoad);
      worldScene.add(livingThreads);

      const motePositions = [];
      const moteColors = [];
      const motePhases = [];
      const moteCount = mobile ? 70 : 160;
      for (let i = 0; i < moteCount; i += 1) {
        motePositions.push(0, 0, 0);
        moteColors.push(i % 3 ? 1 : 0.43, i % 3 ? 0.72 : 0.9, i % 3 ? 0.28 : 0.8);
        motePhases.push(Math.random());
      }
      const roadMotes = makePointCloud(motePositions, moteColors, { size: mobile ? 0.24 : 0.18, texture: particleTexture, opacity: 0.9, additive: true, depthWrite: false });
      roadMotes.geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
      roadMotes.userData.phases = Float32Array.from(motePhases);
      worldScene.add(roadMotes);

      // 远山仍为点云，保证整个可见空间没有实体网格表面。
      const hillPositions = [];
      const hillColors = [];
      [
        [-54, -59, 18, 5], [41, -66, 23, 6], [66, -45, 16, 4.2], [-69, -42, 17, 4.6]
      ].forEach((spec, hillIndex) => {
        const count = mobile ? 900 : 2300;
        for (let i = 0; i < count; i += 1) {
          const t = Math.random();
          const angle = Math.random() * Math.PI * 2;
          const radius = spec[2] * (1 - t) + (Math.random() - 0.5) * 0.3;
          hillPositions.push(spec[0] + Math.cos(angle) * radius, t * spec[3] - 0.4, spec[1] + Math.sin(angle) * radius);
          const shade = 0.08 + t * 0.07 + hillIndex * 0.006;
          hillColors.push(shade, shade * 1.45, shade * 1.18);
        }
      });
      const hills = makePointCloud(hillPositions, hillColors, { size: mobile ? 0.19 : 0.15, texture: particleTexture, opacity: 0.72 });
      worldScene.add(hills);

      // 粒子草束：每束由四个纵向粒子组成，风场中整体摇曳。
      const grassPositions = [];
      const grassColors = [];
      const grassPhases = [];
      const grassBase = [];
      const bladeCount = mobile ? 1150 : 3600;
      for (let i = 0; i < bladeCount; i += 1) {
        let x = (Math.random() - 0.5) * 74;
        let z = (Math.random() - 0.5) * 52 + 6;
        if (Math.abs(x) < 9 && z < 0) x += x < 0 ? -10 : 10;
        const y = terrainHeight(x, z);
        const h = 0.35 + Math.random() * 0.95;
        const phase = Math.random() * Math.PI * 2;
        for (let step = 0; step < 4; step += 1) {
          const f = step / 3;
          grassPositions.push(x, y + h * f, z);
          grassBase.push(x, y + h * f, z);
          grassPhases.push(phase);
          grassColors.push(0.31 + f * 0.24, 0.46 + f * 0.25, 0.20 + f * 0.12);
        }
      }
      const grass = makePointCloud(grassPositions, grassColors, { size: mobile ? 0.16 : 0.13, texture: particleTexture, opacity: 0.83 });
      grass.geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
      grass.userData = { base: Float32Array.from(grassBase), phases: Float32Array.from(grassPhases) };
      worldScene.add(grass);

      const smokePositions = [];
      const smokeColors = [];
      const smokePhases = [];
      const smokeCount = mobile ? 500 : 1100;
      for (let i = 0; i < smokeCount; i += 1) {
        const spec = peakSpecs[i % peakSpecs.length];
        smokePositions.push(spec.x, spec.height + 0.5, spec.z);
        smokeColors.push(i % 3 ? 1 : 0.38, i % 3 ? 0.6 : 0.84, i % 3 ? 0.25 : 0.77);
        smokePhases.push(Math.random());
      }
      const smoke = makePointCloud(smokePositions, smokeColors, { size: mobile ? 0.25 : 0.2, texture: particleTexture, opacity: 0.36, additive: true, depthWrite: false });
      smoke.geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
      smoke.userData = { phases: Float32Array.from(smokePhases) };
      worldScene.add(smoke);

      const starPositions = [];
      const starColors = [];
      const starCount = mobile ? 460 : 1100;
      for (let i = 0; i < starCount; i += 1) {
        const radius = 44 + Math.random() * 42;
        const angle = Math.random() * Math.PI * 2;
        starPositions.push(Math.cos(angle) * radius, 8 + Math.random() * 42, Math.sin(angle) * radius - 12);
        const warm = Math.random() > 0.82;
        starColors.push(warm ? 1 : 0.5, warm ? 0.78 : 0.72, warm ? 0.35 : 0.9);
      }
      const stars = makePointCloud(starPositions, starColors, { size: mobile ? 0.18 : 0.14, texture: particleTexture, opacity: 0.78, additive: true, depthWrite: false });
      worldScene.add(stars);

      // 用户参考图被拆成远景彩色粒子穹幕，和五座可以环游的火山保持真实纵深。
      const referenceBackdrop = createReferenceParticleLandscape(worldScene, particleTexture);

      const contributionGroup = new THREE.Group();
      worldScene.add(contributionGroup);
      world = {
        renderer, scene: worldScene, camera, particleTexture,
        terrain, basalt, volcanoPeaks, livingThreads, roadCurve, roadMotes, hills, grass, smoke, stars, referenceBackdrop, contributionGroup,
        target: new THREE.Vector3(0, 4.1, -24), targetGoal: new THREE.Vector3(0, 4.1, -24), flight: null
      };
      scene.classList.add('co-3d-ready', 'co-particle-world');

      worldCanvas.addEventListener('pointerdown', event => {
        if (world && world.flight) return;
        event.preventDefault();
        orbit.dragging = true; orbit.x = event.clientX; orbit.y = event.clientY; orbit.movedAt = performance.now();
        worldCanvas.setPointerCapture(event.pointerId);
      });
      worldCanvas.addEventListener('pointermove', event => {
        if (!orbit.dragging || (world && world.flight)) return;
        event.preventDefault();
        orbit.yaw -= (event.clientX - orbit.x) * 0.006;
        orbit.pitch = Math.max(-0.02, Math.min(0.66, orbit.pitch + (event.clientY - orbit.y) * 0.004));
        orbit.x = event.clientX; orbit.y = event.clientY; orbit.movedAt = performance.now();
      });
      const stopDrag = () => { orbit.dragging = false; orbit.movedAt = performance.now(); };
      worldCanvas.addEventListener('pointerup', stopDrag);
      worldCanvas.addEventListener('pointercancel', stopDrag);
      worldCanvas.addEventListener('wheel', event => {
        if (world && world.flight) return;
        event.preventDefault();
        orbit.distanceGoal = Math.max(14, Math.min(67, orbit.distanceGoal + event.deltaY * 0.018));
        orbit.movedAt = performance.now();
      }, { passive: false });
      window.addEventListener('resize', resize3DWorld);
      resize3DWorld();
      return true;
    } catch (error) {
      console.warn('全粒子共同景观初始化失败，已保留二维景观作为兼容回退。', error);
      scene.classList.add('co-3d-fallback');
      return false;
    }
  }

  function resize3DWorld() {
    if (!world) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    world.renderer.setSize(width, height, false);
    world.camera.aspect = width / Math.max(1, height);
    world.camera.updateProjectionMatrix();
  }

  function set3DFocus(destination) {
    if (!world) return;
    const spec = selectedPeakIndex == null ? null : peakSpecs[selectedPeakIndex];
    if (spec) {
      world.targetGoal.set(spec.x, destination === 'sky' ? spec.height + 3 : spec.height * 0.48, spec.z);
      orbit.distanceGoal = 30;
    } else if (destination === 'grass') {
      world.targetGoal.set(0, 2.5, -20);
      orbit.distanceGoal = 48;
    } else if (destination === 'sky') {
      world.targetGoal.set(0, 11, -28);
      orbit.distanceGoal = 78;
    } else {
      world.targetGoal.set(0, 4.1, -24);
      orbit.distanceGoal = 78;
    }
  }

  function focusPeak(index) {
    if (scene.classList.contains('flying')) return;
    selectedPeakIndex = index == null ? null : Math.max(0, Math.min(peakSpecs.length - 1, Number(index)));
    peakButtons.forEach(button => {
      const active = button.dataset.peak === (selectedPeakIndex == null ? 'all' : String(selectedPeakIndex));
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    peakHint.textContent = selectedPeakIndex == null
      ? '点击火山靠近观看；拖拽绕山看立体纹样'
      : selectedPeakIndex === 0
        ? '火山 01 · 蝶莲焰立体样板 · 纹样持续环绕，拖拽观看曲面翅膀'
        : `火山 ${String(selectedPeakIndex + 1).padStart(2, '0')} · ${peakSpecs[selectedPeakIndex].motif}纹样主题 · 环山纹样持续流转`;
    set3DFocus(selectedDestination);
    if (selectedDestination) selectDestination(selectedDestination);
  }

  function peakLandingPoint(index, seed) {
    const spec = peakSpecs[index];
    const heightRatio = 0.35 + seeded(seed, 23) * 0.24;
    const angle = Math.PI * (0.28 + seeded(seed, 29) * 0.44);
    const radius = peakRadiusAt(spec, index, heightRatio) + 0.45;
    return new THREE.Vector3(
      spec.x + Math.cos(angle) * radius,
      terrainHeight(spec.x, spec.z) + spec.height * heightRatio,
      spec.z + Math.sin(angle) * radius
    );
  }

  function disposeContributionSprite(object) {
    object.userData.disposed = true;
    object.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  }

  function sync3DContributions(items, newestId) {
    if (!world) return;
    while (world.contributionGroup.children.length) {
      const sprite = world.contributionGroup.children[world.contributionGroup.children.length - 1];
      world.contributionGroup.remove(sprite);
      disposeContributionSprite(sprite);
    }
    items.slice(-24).forEach((item, index) => {
      const seed = String(item.id || index);
      const holder = new THREE.Group();
      if (item.destination === 'sky') {
        holder.position.set(-15 + seeded(seed, 3) * 30, 9 + seeded(seed, 7) * 10, -12 + seeded(seed, 11) * 14);
        holder.scale.setScalar(0.8 + seeded(seed, 13) * 0.48);
      } else if (Number.isInteger(item.peakIndex) && peakSpecs[item.peakIndex]) {
        holder.position.copy(peakLandingPoint(item.peakIndex, seed));
        holder.rotation.y = (seeded(seed, 29) - 0.5) * 0.8;
        holder.scale.setScalar(0.85 + seeded(seed, 17) * 0.28);
      } else {
        const x = -22 + seeded(seed, 5) * 44;
        const z = -1 + seeded(seed, 9) * 22;
        holder.position.set(x, terrainHeight(x, z) + 0.48, z);
        holder.rotation.x = -1.02;
        holder.scale.setScalar(0.68 + seeded(seed, 17) * 0.42);
      }
      holder.userData = { phase: seeded(seed, 19) * Math.PI * 2, destination: item.destination, newest: item.id === newestId, disposed: false, workTitle: item.workTitle || item.patternName };
      world.contributionGroup.add(holder);
      const source = item.thumb || 'patterns_v2/volcano_5.png';
      const image = new Image();
      image.onload = () => {
        if (holder.userData.disposed) return;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 56;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.clearRect(0, 0, 56, 56);
        const ratio = Math.min(50 / image.naturalWidth, 50 / image.naturalHeight);
        const width = image.naturalWidth * ratio;
        const height = image.naturalHeight * ratio;
        ctx.drawImage(image, (56 - width) / 2, (56 - height) / 2, width, height);
        const data = ctx.getImageData(0, 0, 56, 56).data;
        const positions = [];
        const colors = [];
        for (let y = 1; y < 55; y += 2) {
          for (let x = 1; x < 55; x += 2) {
            const offset = (y * 56 + x) * 4;
            const alpha = data[offset + 3] / 255;
            const brightness = (data[offset] + data[offset + 1] + data[offset + 2]) / 765;
            if (alpha < 0.16 || brightness < 0.035) continue;
            positions.push((x - 28) * 0.075, (28 - y) * 0.075, (Math.random() - 0.5) * 0.08);
            colors.push(Math.max(0.28, data[offset] / 255), Math.max(0.2, data[offset + 1] / 255), Math.max(0.08, data[offset + 2] / 255));
          }
        }
        if (!positions.length) {
          for (let i = 0; i < 180; i += 1) {
            const angle = i / 180 * Math.PI * 2;
            positions.push(Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, 0);
            colors.push(0.9, 0.68, 0.24);
          }
        }
        const cloud = makePointCloud(positions, colors, { size: item.id === newestId ? 0.17 : 0.13, texture: world.particleTexture, opacity: item.id === newestId ? 1 : 0.76, additive: true, depthWrite: false });
        holder.add(cloud);
      };
      image.onerror = () => {};
      image.src = source;
    });
  }

  function createFlightPatternCloud(source) {
    const holder = new THREE.Group();
    const fallbackPositions = [];
    const fallbackColors = [];
    for (let i = 0; i < 420; i += 1) {
      const angle = i / 420 * Math.PI * 2;
      const radius = 0.85 + Math.sin(i * 0.31) * 0.12;
      fallbackPositions.push(Math.cos(angle) * radius, Math.sin(angle) * radius, (Math.random() - 0.5) * 0.16);
      fallbackColors.push(1, 0.55 + Math.random() * 0.35, 0.06);
    }
    const fallback = makePointCloud(fallbackPositions, fallbackColors, { size: 0.13, texture: world.particleTexture, opacity: 0.9, additive: true, depthWrite: false });
    holder.add(fallback);

    const image = new Image();
    image.onload = () => {
      if (holder.userData.disposed) return;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 72;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.clearRect(0, 0, 72, 72);
      const ratio = Math.min(66 / image.naturalWidth, 66 / image.naturalHeight);
      const width = image.naturalWidth * ratio;
      const height = image.naturalHeight * ratio;
      ctx.drawImage(image, (72 - width) / 2, (72 - height) / 2, width, height);
      const data = ctx.getImageData(0, 0, 72, 72).data;
      const positions = [];
      const colors = [];
      for (let y = 1; y < 71; y += 2) {
        for (let x = 1; x < 71; x += 2) {
          const offset = (y * 72 + x) * 4;
          const alpha = data[offset + 3] / 255;
          const brightness = (data[offset] + data[offset + 1] + data[offset + 2]) / 765;
          if (alpha < 0.15 || brightness < 0.035) continue;
          positions.push((x - 36) * 0.055, (36 - y) * 0.055, (Math.random() - 0.5) * 0.14);
          colors.push(Math.max(0.38, data[offset] / 255), Math.max(0.22, data[offset + 1] / 255), Math.max(0.06, data[offset + 2] / 255));
        }
      }
      if (positions.length) {
        holder.remove(fallback);
        fallback.geometry.dispose(); fallback.material.dispose();
        holder.add(makePointCloud(positions, colors, { size: 0.12, texture: world.particleTexture, opacity: 1, additive: true, depthWrite: false }));
      }
    };
    image.onerror = () => {};
    image.src = source;
    return holder;
  }

  function startParticleFlight(item, onComplete) {
    if (!world) return false;
    const start = world.camera.position.clone();
    const seed = String(item.id);
    let end;
    let points;
    if (item.destination === 'grass') {
      if (Number.isInteger(item.peakIndex) && peakSpecs[item.peakIndex]) {
        end = peakLandingPoint(item.peakIndex, seed);
      } else {
        const x = -18 + seeded(seed, 5) * 36;
        const z = 1 + seeded(seed, 9) * 17;
        end = new THREE.Vector3(x, terrainHeight(x, z) + 0.8, z);
      }
      points = [
        start,
        new THREE.Vector3(start.x * 0.72 + end.x * 0.28, 10.5, start.z * 0.74 + end.z * 0.26),
        new THREE.Vector3(start.x * 0.48 + end.x * 0.52, 5.4, start.z * 0.46 + end.z * 0.54),
        new THREE.Vector3(end.x * 0.76, Math.max(2.2, end.y + 1.8), end.z * 0.82 + 2.0),
        new THREE.Vector3(end.x, end.y + 1.0, end.z + 2.1),
        end
      ];
      flightTitle.textContent = item.peakIndex == null
        ? `跟随《${item.workTitle}》穿越粒子草原`
        : `跟随《${item.workTitle}》飞向${peakSpecs[item.peakIndex].motif}`;
      flightSubtitle.textContent = 'FPV · LOW ALTITUDE PARTICLE FLIGHT';
    } else {
      end = new THREE.Vector3(-12 + seeded(seed, 3) * 24, 12 + seeded(seed, 7) * 7, -13 + seeded(seed, 11) * 10);
      points = [
        start,
        new THREE.Vector3(-10, 10, 11),
        new THREE.Vector3(-7, 16, 2),
        new THREE.Vector3(0, 19, -8),
        new THREE.Vector3(end.x * 0.5, end.y + 2.5, end.z - 2),
        end
      ];
      flightTitle.textContent = `跟随《${item.workTitle}》冲入粒子天际`;
      flightSubtitle.textContent = 'FPV · SKYWARD PARTICLE FLIGHT';
    }
    const cloud = createFlightPatternCloud(item.thumb || currentPatternSource);
    cloud.scale.setScalar(window.innerWidth < 760 ? 0.82 : 1);
    world.scene.add(cloud);
    world.flight = {
      curve: new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.45),
      cloud,
      startTime: performance.now(),
      duration: window.innerWidth < 760 ? 3900 : 4800,
      destination: item.destination,
      onComplete,
      completed: false
    };
    flightProgress.style.transform = 'scaleX(0)';
    flightHud.classList.add('show');
    flightHud.setAttribute('aria-hidden', 'false');
    scene.classList.add('fpv-active');
    return true;
  }

  function finishParticleFlight() {
    const flight = world && world.flight;
    if (!flight || flight.completed) return;
    flight.completed = true;
    flight.cloud.userData.disposed = true;
    world.scene.remove(flight.cloud);
    flight.cloud.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
    world.flight = null;
    world.camera.fov = 54;
    world.camera.updateProjectionMatrix();
    flightProgress.style.transform = 'scaleX(1)';
    window.setTimeout(() => {
      flightHud.classList.remove('show');
      flightHud.setAttribute('aria-hidden', 'true');
      scene.classList.remove('fpv-active');
      if (flight.onComplete) flight.onComplete();
    }, 280);
  }

  function animate3DWorld(time) {
    if (!worldActive || !world) { worldFrame = 0; return; }
    const seconds = time * 0.001;

    world.stars.rotation.y += 0.0001;
    if (world.referenceBackdrop) {
      world.referenceBackdrop.children.forEach((layer, index) => {
        const role = layer.userData.role;
        const baseOpacity = role === 'aura' ? 0.18 : role === 'ground' ? 0.72 : 0.82;
        layer.material.opacity = baseOpacity + Math.sin(seconds * (0.34 + index * 0.12) + index) * (role === 'aura' ? 0.11 : 0.055);
        layer.rotation.y = role === 'sky' ? Math.sin(seconds * 0.07) * 0.025 : role === 'horizon' ? Math.sin(seconds * 0.05) * 0.012 : 0;
        layer.position.y = role === 'sky' ? Math.sin(seconds * 0.22) * 0.08 : 0;
        if (role === 'aura') layer.material.size = layer.userData.baseSize * (1 + Math.sin(seconds * 0.8) * 0.14);
      });
    }
    world.volcanoPeaks.forEach((peak, index) => {
      const phase = peak.userData.breathPhase;
      const focusTarget = selectedPeakIndex == null || selectedPeakIndex === index ? 1 : 0.12;
      peak.userData.focusMix += (focusTarget - peak.userData.focusMix) * 0.075;
      const focusMix = peak.userData.focusMix;
      peak.scale.y = 1 + Math.sin(seconds * (0.95 + index * 0.09) + phase) * 0.012;
      peak.rotation.y = Math.sin(seconds * 0.31 + phase) * 0.008;
      peak.userData.lip.material.opacity = (0.66 + Math.sin(seconds * 2.8 + phase) * 0.21) * focusMix;
      peak.userData.shell.material.opacity = (0.48 + Math.sin(seconds * 1.18 + phase) * 0.08) * focusMix;
      peak.userData.carvedBands.material.opacity = (0.72 + Math.sin(seconds * 0.9 + phase) * 0.09) * focusMix;
      peak.userData.carvedBands.rotation.y = -seconds * (0.048 + index * 0.006);
      peak.userData.motifs.forEach(motif => {
        const motifPhase = phase + motif.userData.phase;
        if (motif.userData.surfacePattern) {
          motif.material.opacity = (0.86 + Math.sin(seconds * 1.2 + motifPhase) * 0.12) * focusMix;
          const radialPulse = 1 + Math.sin(seconds * 1.05 + motifPhase) * 0.018;
          motif.scale.set(radialPulse, 1 + Math.sin(seconds * 0.86 + motifPhase) * 0.006, radialPulse);
          motif.rotation.y = motif.userData.baseRotation + seconds * (0.075 + index * 0.009);
        } else if (motif.userData.glow) {
          motif.material.opacity = (0.2 + (Math.sin(seconds * 1.55 + motifPhase) + 1) * 0.14) * focusMix;
          motif.material.size = motif.userData.baseSize * (1 + Math.sin(seconds * 1.55 + motifPhase) * 0.18);
          motif.rotation.y = motif.userData.baseRotation - seconds * 0.018;
        } else {
          motif.material.opacity = (0.76 + Math.sin(seconds * 1.08 + motifPhase) * 0.12) * focusMix;
        }
        if (motif.userData.floating) {
          motif.position.y = Math.sin(seconds * (0.78 + index * 0.06) + motifPhase) * 0.2;
          motif.rotation.y = motif.userData.baseRotation + seconds * (0.012 + index * 0.0015);
        }
      });
      if (peak.userData.sculpture) peak.userData.sculpture.update(seconds, focusMix);
      for (let stream = 0; stream < 2; stream += 1) {
        peak.userData[`stream${stream}`].material.opacity = (0.58 + Math.sin(seconds * 3.1 + phase + stream) * 0.25) * focusMix;
      }
    });
    world.livingThreads.children.forEach((thread, index) => {
      thread.material.opacity = 0.59 + Math.sin(seconds * (1.1 + index * 0.07) + thread.userData.phase) * 0.21;
    });
    const motePosition = world.roadMotes.geometry.attributes.position;
    const motePhases = world.roadMotes.userData.phases;
    for (let i = 0; i < motePhases.length; i += 1) {
      const t = (seconds * 0.045 + motePhases[i]) % 1;
      const point = world.roadCurve.getPointAt(t);
      const offset = i * 3;
      motePosition.array[offset] = point.x + Math.sin(i * 2.4) * 0.55;
      motePosition.array[offset + 1] = terrainHeight(point.x, point.z) + 0.18 + Math.sin(seconds * 2.4 + i) * 0.07;
      motePosition.array[offset + 2] = point.z;
    }
    motePosition.needsUpdate = true;

    const terrainPosition = world.terrain.geometry.attributes.position;
    const terrainBaseY = world.terrain.userData.baseY;
    const terrainPhases = world.terrain.userData.phases;
    if (Math.floor(time / 32) % 2 === 0) {
      for (let i = 0; i < terrainBaseY.length; i += 1) {
        terrainPosition.array[i * 3 + 1] = terrainBaseY[i] + Math.sin(seconds * 0.82 + terrainPhases[i]) * 0.035;
      }
      terrainPosition.needsUpdate = true;
    }

    const grassPosition = world.grass.geometry.attributes.position;
    const grassBase = world.grass.userData.base;
    const grassPhases = world.grass.userData.phases;
    for (let i = 0; i < grassPhases.length; i += 1) {
      const offset = i * 3;
      const heightStep = (i % 4) / 3;
      grassPosition.array[offset] = grassBase[offset] + Math.sin(seconds * 1.9 + grassPhases[i]) * 0.18 * heightStep;
      grassPosition.array[offset + 2] = grassBase[offset + 2] + Math.cos(seconds * 1.35 + grassPhases[i]) * 0.07 * heightStep;
    }
    grassPosition.needsUpdate = true;

    const smokePosition = world.smoke.geometry.attributes.position;
    const smokePhases = world.smoke.userData.phases;
    for (let i = 0; i < smokePhases.length; i += 1) {
      const cycle = (seconds * (0.055 + (i % 5) * 0.004) + smokePhases[i]) % 1;
      const spread = 0.24 + cycle * 1.7;
      const spec = peakSpecs[i % peakSpecs.length];
      const offset = i * 3;
      smokePosition.array[offset] = spec.x + Math.sin(i * 2.17 + seconds * 0.38) * spread;
      smokePosition.array[offset + 1] = terrainHeight(spec.x, spec.z) + spec.height + cycle * 8.5;
      smokePosition.array[offset + 2] = spec.z + Math.cos(i * 1.71 + seconds * 0.22) * spread * 0.52;
    }
    smokePosition.needsUpdate = true;

    world.contributionGroup.children.forEach((holder, index) => {
      const phase = holder.userData.phase || index;
      if (holder.userData.destination === 'sky') {
        if (holder.userData.baseY == null) holder.userData.baseY = holder.position.y;
        holder.position.y = holder.userData.baseY + Math.sin(seconds * 0.9 + phase) * 0.22;
        holder.rotation.z = Math.sin(seconds * 0.42 + phase) * 0.08;
      }
      holder.children.forEach(cloud => {
        if (cloud.material) cloud.material.opacity = (holder.userData.newest ? 0.88 : 0.62) + Math.sin(seconds * 1.6 + phase) * 0.1;
      });
    });

    if (world.flight) {
      const flight = world.flight;
      const raw = Math.min(1, (performance.now() - flight.startTime) / flight.duration);
      const eased = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
      const cameraT = Math.min(0.975, eased * 0.965);
      const patternT = Math.min(1, cameraT + 0.032 + (1 - raw) * 0.025);
      const cameraPoint = flight.curve.getPointAt(cameraT);
      const patternPoint = flight.curve.getPointAt(patternT);
      world.camera.position.copy(cameraPoint);
      flight.cloud.position.copy(patternPoint);
      const pulse = 1 + Math.sin(seconds * 7) * 0.08;
      flight.cloud.scale.setScalar((window.innerWidth < 760 ? 0.82 : 1) * pulse);
      world.camera.lookAt(patternPoint);
      world.camera.rotation.z += Math.sin(raw * Math.PI * 4) * 0.035 + Math.sin(raw * Math.PI) * (flight.destination === 'grass' ? -0.055 : 0.065);
      world.camera.fov = 54 + Math.sin(raw * Math.PI) * 12;
      world.camera.updateProjectionMatrix();
      flightProgress.style.transform = `scaleX(${raw})`;
      if (raw >= 1) finishParticleFlight();
    } else {
      if (!orbit.dragging && performance.now() - orbit.movedAt > 2600) orbit.yaw += 0.00012;
      world.target.lerp(world.targetGoal, 0.035);
      orbit.distance += (orbit.distanceGoal - orbit.distance) * 0.045;
      const horizontal = Math.cos(orbit.pitch) * orbit.distance;
      world.camera.position.set(
        world.target.x + Math.sin(orbit.yaw) * horizontal,
        world.target.y + 4.5 + Math.sin(orbit.pitch) * orbit.distance + Math.sin(seconds * 0.7) * 0.11,
        world.target.z + Math.cos(orbit.yaw) * horizontal
      );
      world.camera.lookAt(world.target);
    }

    world.renderer.render(world.scene, world.camera);
    worldFrame = requestAnimationFrame(animate3DWorld);
  }

  function set3DActive(active) {
    worldActive = active;
    window.__coCreateWorldActive = active;
    if (active && init3DWorld()) {
      resize3DWorld();
      if (!worldFrame) worldFrame = requestAnimationFrame(animate3DWorld);
    }
  }

  function notify(message) {
    try { showToast(message); }
    catch (error) { console.info(message); }
  }

  function readGlobal(name, fallback) {
    try {
      if (name === 'activePatternId') return activePatternId;
      if (name === 'patternsList') return patternsList;
      if (name === 'patternImages') return patternImages;
      if (name === 'customImages') return customImages;
      if (name === 'currentTex') return currentTex;
      if (name === 'currentStart') return currentStart;
      if (name === 'currentEnd') return currentEnd;
      if (name === 'inputMode') return inputMode;
      if (name === 'drawLines') return drawLines;
      if (name === 'drawConfirmed') return drawConfirmed;
      if (name === 'morphAnimating') return morphAnimating;
    } catch (error) { return fallback; }
    return fallback;
  }

  function getPatternMeta() {
    const id = readGlobal('activePatternId', 'panchang');
    const list = readGlobal('patternsList', []);
    const item = Array.isArray(list) ? list.find(pattern => pattern.id === id) : null;
    return { id, name: item && item.name ? item.name : '个人纹样' };
  }

  function canvasToThumbnail(sourceCanvas, size) {
    try {
      const target = document.createElement('canvas');
      target.width = target.height = size;
      const ctx = target.getContext('2d');
      ctx.clearRect(0, 0, size, size);
      const sw = sourceCanvas.width || size;
      const sh = sourceCanvas.height || size;
      const scale = Math.min(size / sw, size / sh) * 0.9;
      const dw = sw * scale;
      const dh = sh * scale;
      ctx.drawImage(sourceCanvas, (size - dw) / 2, (size - dh) / 2, dw, dh);
      return target.toDataURL('image/png');
    } catch (error) { return ''; }
  }

  function getPatternSource() {
    const texture = readGlobal('currentTex', null);
    if (texture && texture.image) {
      const image = texture.image;
      if (typeof image.toDataURL === 'function') {
        const thumb = canvasToThumbnail(image, 180);
        if (thumb) return thumb;
      }
      if (image.src) return image.src;
    }
    const meta = getPatternMeta();
    const custom = readGlobal('customImages', {});
    const images = readGlobal('patternImages', {});
    return custom[meta.id] || images[meta.id] || 'patterns_v2/volcano_5.png';
  }

  function getRecommendation(name) {
    return /云|鹤|燕|凤|龙/.test(name) ? 'sky' : 'grass';
  }

  function getStoredContributions() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (error) { return []; }
  }

  function saveContribution(item) {
    const items = getStoredContributions();
    items.push(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(-MAX_LOCAL_CONTRIBUTIONS)));
    return items.slice(-MAX_LOCAL_CONTRIBUTIONS);
  }

  function numberFromString(value, offset) {
    let hash = 2166136261 + offset;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return Math.abs(hash % 10000) / 10000;
  }

  function contributionPosition(item) {
    const seed = String(item.id || item.createdAt || 'pattern');
    if (item.destination === 'sky') {
      return { left: 54 + numberFromString(seed, 3) * 38, top: 13 + numberFromString(seed, 7) * 31, rotate: -12 + numberFromString(seed, 11) * 24 };
    }
    return { left: 4 + numberFromString(seed, 5) * 88, top: 68 + numberFromString(seed, 9) * 16, rotate: -8 + numberFromString(seed, 13) * 16 };
  }

  function renderContributions(items, newestId) {
    contributionLayer.innerHTML = '';
    items.slice(-24).forEach((item, index) => {
      const image = document.createElement('img');
      const position = contributionPosition(item);
      image.className = `co-contribution ${item.destination === 'sky' ? 'sky' : 'grass'}${item.id === newestId ? ' just-landed' : ''}`;
      image.src = item.thumb || 'patterns_v2/volcano_5.png';
      image.alt = '';
      image.style.left = `${position.left}%`;
      image.style.top = `${position.top}%`;
      image.style.rotate = `${position.rotate}deg`;
      image.style.animationDelay = `${(index % 6) * -0.55}s`;
      contributionLayer.appendChild(image);
    });
    liveCount.textContent = `这片景观已留下 ${items.length} 个纹样`;
    recentNames.innerHTML = '';
    const namedItems = items.slice(-3).reverse();
    if (!namedItems.length) {
      const empty = document.createElement('span');
      empty.textContent = '等待第一枚命名纹样';
      recentNames.appendChild(empty);
    } else {
      namedItems.forEach(item => {
        const name = document.createElement('span');
        name.textContent = `《${item.workTitle || item.patternName || '未命名纹样'}》`;
        recentNames.appendChild(name);
      });
    }
    sync3DContributions(items, newestId);
  }

  function setRecommendation() {
    destinationButtons.forEach(button => {
      button.classList.toggle('recommended', button.dataset.destination === currentRecommendation);
    });
  }

  function clearDestination() {
    selectedDestination = '';
    scene.removeAttribute('data-destination');
    destinationButtons.forEach(button => {
      button.classList.remove('selected');
      button.setAttribute('aria-pressed', 'false');
    });
    confirmButton.textContent = '确认加入';
    previewNote.innerHTML = '正在预览纹样与景观的融合关系';
    set3DFocus('');
  }

  function selectDestination(destination) {
    const workTitle = (nameInput.value || '').trim() || currentPatternName;
    selectedDestination = destination;
    scene.dataset.destination = destination;
    destinationButtons.forEach(button => {
      const selected = button.dataset.destination === destination;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    const title = document.createElement('strong');
    title.textContent = `《${workTitle}》`;
    if (destination === 'grass') {
      confirmButton.textContent = '确认融入草原';
      const destinationText = selectedPeakIndex == null
        ? ' 将沉入草浪与火山地貌，成为大地的纹理记忆'
        : ` 将飞入火山 ${String(selectedPeakIndex + 1).padStart(2, '0')} · ${peakSpecs[selectedPeakIndex].motif}，成为山体纹样的一部分`;
      previewNote.replaceChildren(title, document.createTextNode(destinationText));
    } else {
      confirmButton.textContent = '确认放飞天际';
      previewNote.replaceChildren(title, document.createTextNode(' 将升向天空，成为环绕五座火山的流云与光迹'));
    }
    set3DFocus(destination);
  }

  function canEnterScene() {
    if (readGlobal('morphAnimating', false)) {
      notify('纹样正在生成，请稍候再加入共创');
      return false;
    }
    const mode = readGlobal('inputMode', 'mouse');
    const lines = readGlobal('drawLines', []);
    const confirmed = readGlobal('drawConfirmed', false);
    if (mode === 'draw' && Array.isArray(lines) && lines.length > 0 && !confirmed) {
      notify('请先用五指张开确认当前绘制');
      return false;
    }
    return true;
  }

  function enterScene() {
    if (!canEnterScene()) return;
    const meta = getPatternMeta();
    currentPatternName = meta.name;
    currentPatternSource = getPatternSource();
    currentRecommendation = getRecommendation(currentPatternName);
    patternImage.src = currentPatternSource;
    nameInput.value = currentPatternName;
    nameCount.textContent = String(currentPatternName.length);
    nameInput.classList.remove('invalid');
    patternCaption.textContent = `待命名作品 · ${currentPatternName}`;
    scene.classList.remove('flying', 'flying-grass', 'flying-sky', 'browse');
    success.classList.remove('show');
    clearDestination();
    orbit.yaw = 0.025;
    orbit.pitch = 0.16;
    orbit.distance = 78;
    orbit.distanceGoal = 78;
    orbit.movedAt = performance.now();
    focusPeak(null);
    setRecommendation();
    document.body.classList.add('co-scene-open');
    scene.classList.add('open');
    scene.setAttribute('aria-hidden', 'false');
    set3DActive(true);
    renderContributions(getStoredContributions());
    window.setTimeout(() => back.focus(), 420);
  }

  function exitScene() {
    if (animationTimer) window.clearTimeout(animationTimer);
    animationTimer = null;
    if (world && world.flight) {
      world.flight.cloud.userData.disposed = true;
      world.scene.remove(world.flight.cloud);
      world.flight = null;
      world.camera.fov = 54;
      world.camera.updateProjectionMatrix();
    }
    flightHud.classList.remove('show');
    flightHud.setAttribute('aria-hidden', 'true');
    scene.classList.remove('open', 'flying', 'flying-grass', 'flying-sky', 'browse');
    scene.classList.remove('fpv-active');
    scene.removeAttribute('data-destination');
    scene.setAttribute('aria-hidden', 'true');
    success.classList.remove('show');
    document.body.classList.remove('co-scene-open');
    set3DActive(false);
    window.setTimeout(() => entry.focus(), 200);
  }

  function currentParameters() {
    const ids = ['count', 'size', 'sizeRnd', 'bloom', 'wave', 'rotate', 'heartbeat', 'gapX', 'gapY', 'gapZ'];
    const values = {};
    ids.forEach(id => {
      const input = document.getElementById(`sl-${id}`);
      if (input) values[id] = Number(input.value);
    });
    return values;
  }

  function makePersistedThumb() {
    if (currentPatternSource.startsWith('data:')) {
      try {
        const source = readGlobal('currentTex', null);
        if (source && source.image && typeof source.image.toDataURL === 'function') {
          return canvasToThumbnail(source.image, 96) || currentPatternSource;
        }
      } catch (error) { /* fall through */ }
    }
    return currentPatternSource;
  }

  function confirmDestination() {
    if (!selectedDestination || scene.classList.contains('flying')) return;
    const destination = selectedDestination;
    const meta = getPatternMeta();
    const workTitle = (nameInput.value || '').trim().replace(/[<>]/g, '').slice(0, 18);
    if (!workTitle) {
      nameInput.classList.add('invalid');
      nameInput.focus();
      notify('请先为这枚纹样命名');
      return;
    }
    nameInput.classList.remove('invalid');
    const item = {
      id: `co_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      patternId: meta.id,
      patternName: meta.name,
      workTitle,
      destination,
      peakIndex: destination === 'grass' ? selectedPeakIndex : null,
      thumb: makePersistedThumb(),
      colorStart: readGlobal('currentStart', '#0066cc'),
      colorEnd: readGlobal('currentEnd', '#cc0000'),
      parameters: currentParameters(),
      createdAt: new Date().toISOString()
    };

    scene.classList.add('flying', `flying-${destination}`);
    confirmButton.disabled = true;
    const completeContribution = () => {
      const saved = saveContribution(item);
      renderContributions(saved, item.id);
      successTitle.textContent = destination === 'grass' ? `《${workTitle}》已融入草原火山` : `《${workTitle}》已放飞至火山天际`;
      successText.textContent = destination === 'grass'
        ? (item.peakIndex == null
          ? '谢谢你为这片草原火山贡献自己的纹样。它已融入草浪与岩层，和大家的作品一起生长。'
          : `谢谢你为这片草原火山贡献自己的纹样。它已在「${peakSpecs[item.peakIndex].motif}」山坡上留下属于你的印记。`)
        : '谢谢你为这片草原火山贡献自己的纹样。它已随风飞向天际，将在火山与星光之间继续闪耀。';
      success.classList.add('show');
      confirmButton.disabled = false;
      animationTimer = null;
    };
    if (!startParticleFlight(item, completeContribution)) {
      animationTimer = window.setTimeout(completeContribution, 2350);
    }
  }

  entry.addEventListener('click', enterScene);
  back.addEventListener('click', exitScene);
  peakButtons.forEach(button => button.addEventListener('click', () => focusPeak(button.dataset.peak === 'all' ? null : Number(button.dataset.peak))));
  destinationButtons.forEach(button => button.addEventListener('click', () => selectDestination(button.dataset.destination)));
  changeButton.addEventListener('click', clearDestination);
  confirmButton.addEventListener('click', confirmDestination);
  continueButton.addEventListener('click', exitScene);
  stayButton.addEventListener('click', () => {
    success.classList.remove('show');
    scene.classList.remove('flying', 'flying-grass', 'flying-sky');
    scene.classList.add('browse');
    scene.removeAttribute('data-destination');
    back.style.opacity = '';
    back.style.pointerEvents = '';
  });

  nameInput.addEventListener('input', () => {
    const value = nameInput.value.slice(0, 18);
    nameCount.textContent = String(value.length);
    nameInput.classList.remove('invalid');
    patternCaption.textContent = value.trim() ? `作品命名 · ${value.trim()}` : '等待命名';
    if (selectedDestination) selectDestination(selectedDestination);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && scene.classList.contains('open') && !scene.classList.contains('flying')) exitScene();
  });
})();
