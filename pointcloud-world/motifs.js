import * as THREE from '../lib/three/three.module.js';

// 从平台已经核对过的本地纹样资产提取可见像素，生成空间点云；原图片不会作为平面贴图显示。
const sources = {
  knot: '../wenyang_svg/rel/盘长结变体F1.svg',
  cloud: '../pattern_visuals/cloud-scroll-modern-v1.svg',
  herd: '../pattern_visuals/five-livestock-modern-v1.png',
  grass: '../pattern_visuals/grass-scroll-modern-v1.svg'
};

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`纹样素材读取失败：${url}`));
    image.src = url;
  });
}

function sample(image, crop = [0, 0, 1, 1]) {
  const canvas = document.createElement('canvas');
  canvas.width = 154;
  canvas.height = 154;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const sx = crop[0] * image.width;
  const sy = crop[1] * image.height;
  const sw = crop[2] * image.width;
  const sh = crop[3] * image.height;
  context.drawImage(image, sx, sy, sw, sh, 0, 0, 154, 154);
  const pixels = context.getImageData(0, 0, 154, 154).data;
  const samples = [];
  for (let y = 1; y < 153; y += 2) {
    for (let x = 1; x < 153; x += 2) {
      const offset = (y * 154 + x) * 4;
      if (pixels[offset + 3] < 130) continue;
      if ((x * 13 + y * 7) % 11 === 0) continue;
      samples.push([x, y]);
    }
  }
  if (!samples.length) return [];
  const minX = Math.min(...samples.map(p => p[0]));
  const maxX = Math.max(...samples.map(p => p[0]));
  const minY = Math.min(...samples.map(p => p[1]));
  const maxY = Math.max(...samples.map(p => p[1]));
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  return samples.map(([x, y]) => [(x - minX) / width - 0.5, 1 - (y - minY) / height]);
}

function pointCloud(points, color, size = 0.1) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  const material = new THREE.PointsMaterial({
    color, size, sizeAttenuation: true, transparent: true, opacity: 0.89,
    depthTest: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
  return new THREE.Points(geometry, material);
}

// 同一批平台素材组成微纹样图集。远看是地貌点，靠近时每一点可读作纹样单元。
function makeAtlas(knotImage, cloudImage, herdImage, grassImage) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const entries = [
    [knotImage, [0, 0, 1, 1]], [cloudImage, [0, 0, 1, 1]],
    [herdImage, [0.005, 0, 0.255, 1]], [herdImage, [0.215, 0, 0.205, 1]],
    [herdImage, [0.42, 0, 0.215, 1]], [herdImage, [0.625, 0, 0.19, 1]],
    [herdImage, [0.80, 0, 0.195, 1]], [grassImage, [0, 0, 1, 1]]
  ];
  entries.forEach(([image, crop], index) => {
    const sx = crop[0] * image.width;
    const sy = crop[1] * image.height;
    const sw = crop[2] * image.width;
    const sh = crop[3] * image.height;
    const scratch = document.createElement('canvas');
    scratch.width = scratch.height = 128;
    const scratchContext = scratch.getContext('2d', { willReadFrequently: true });
    scratchContext.drawImage(image, sx, sy, sw, sh, 0, 0, 128, 128);
    const data = scratchContext.getImageData(0, 0, 128, 128).data;
    let left = 128, top = 128, right = 0, bottom = 0;
    for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
      const k = (y * 128 + x) * 4;
      if (data[k + 3] < 75) continue;
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x); bottom = Math.max(bottom, y);
    }
    if (right < left || bottom < top) return;
    const contentWidth = right - left + 1;
    const contentHeight = bottom - top + 1;
    const scale = Math.min(58 / contentWidth, 58 / contentHeight);
    const dw = contentWidth * scale;
    const dh = contentHeight * scale;
    const dx = (index % 4) * 64 + (64 - dw) * 0.5;
    const dy = Math.floor(index / 4) * 64 + (64 - dh) * 0.5;
    ctx.drawImage(scratch, left, top, contentWidth, contentHeight, dx, dy, dw, dh);
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

export async function installLibraryMotifs(scene, terrainHeight) {
  const group = new THREE.Group();
  group.name = 'source-library-pattern-particles';
  scene.add(group);
  const [knotImage, cloudImage, herdImage, grassImage] = await Promise.all([
    loadImage(sources.knot), loadImage(sources.cloud), loadImage(sources.herd), loadImage(sources.grass)
  ]);
  const atlas = makeAtlas(knotImage, cloudImage, herdImage, grassImage);
  let pointCount = 0;

  const knot = sample(knotImage);
  for (const [cx, cz, scale] of [[-2.8, 5, 5.2], [2.9, -18, 6.4], [-3.2, -47, 5.4]]) {
    const positions = [];
    knot.forEach(([u, v], i) => {
      const x = cx + u * scale;
      const z = cz + (0.5 - v) * scale * 1.2;
      positions.push(x, terrainHeight(x, z) + 0.24 + Math.sin(i * 2.1) * 0.05, z);
    });
    pointCount += positions.length / 3;
    group.add(pointCloud(positions, 0xf3ce83, 0.11));
  }

  return { group, count: pointCount, sources: Object.values(sources), atlas };
}
