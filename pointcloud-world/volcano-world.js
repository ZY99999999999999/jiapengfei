import * as THREE from '../lib/three/three.module.js';
import { makeLuminousSurface } from './luminous-surface.js?v=8';
import './co-create-sculptures.js?v=4';
import { closePaintedSilhouette, localStrokeRadii, makeRoundedReferenceCloud } from './rounded-reference.js?v=8';

// 五张设计图的图腾次序沿用 creator.html；这里生成可环看的粒子结构，而非图像平面。
const SPECS = [
  { name: '设计峰01 · 黑脑包（景区4号）· 蝶莲焰', x: -62, z: -153, height: 11.6, radius: 10.2, lip: 1.55, tint: [0.10, 0.23, 0.46], glyph: 7,
    art: { top: 408, bottom: 806, half: 550 }, profile: [[0, 10.2], [.48, 7.8], [.82, 4.25], [1, 1.55]],
    note: '黑脑包 · 宽肩低缓的艺术峰，以双蝶与莲焰表现早期火山风化后圆浑、沉静的视觉感受。' },
  { name: '设计峰02 · 北炼丹炉（景区3号）· 双翼宝石', x: 75, z: -200, height: 14.5, radius: 9.1, lip: 1.95, tint: [0.10, 0.17, 0.39], glyph: 0,
    art: { top: 356, bottom: 865, half: 480 }, profile: [[0, 9.1], [.48, 6.0], [.83, 3.0], [1, 1.95]],
    note: '北炼丹炉 · 锥体较完整、顶部火口清晰；艺术峰以收束的锥坡、双翼和宝石回应其挺拔轮廓。' },
  { name: '设计峰03 · 中炼丹炉（景区5号）· 龙凤日轮', x: 0, z: -250, height: 16.2, radius: 12.8, lip: 3.44, tint: [0.08, 0.21, 0.43], glyph: 1,
    art: { top: 310, bottom: 1000, half: 510 }, profile: [[0, 12.8], [.46, 9.35], [.79, 5.04], [1, 3.44]],
    note: '中炼丹炉 · 火山群中代表性的炼丹炉火山之一；本峰以五峰中最高、最宽的艺术尺度呈现日轮与云纹装饰。' },
  { name: '设计峰04 · 南炼丹炉（景区6号）· 蝶火脉', x: 110, z: -100, height: 13.6, radius: 8.8, lip: 1.28, tint: [0.04, 0.12, 0.37], glyph: 0,
    art: { top: 258, bottom: 978, half: 625 }, profile: [[0, 8.8], [.12, 8.1], [.12, 7.3], [.27, 7.0], [.27, 6.2],
      [.43, 5.8], [.43, 5.1], [.59, 4.8], [.59, 4.0], [.76, 3.5], [.76, 2.8], [.91, 2.0], [1, 1.28]],
    note: '南炼丹炉 · 属北、中、南炼丹炉火山序列；阶梯状坡面与红色火脉是本峰的艺术表达，四只蝶纹取自原稿并贴坡错层展开，不把设计纹理说成真实裂缝。' },
  { name: '设计峰05 · 北尖山（景区7号）· 夜翼回纹', x: -85, z: -52, height: 14.1, radius: 8.5, lip: 1.35, tint: [0.07, 0.18, 0.40], glyph: 0,
    art: { top: 452, bottom: 1022, half: 355 }, profile: [[0, 8.5], [.35, 6.3], [.70, 3.5], [1, 1.35]],
    note: '北尖山 · 属于研究资料列出的较晚一期锥体；本峰以尖收的山顶、原稿中的四只青色夜翼和连续回纹呼应名称意象。' }
];

const C = {
  cream: [1, .88, .63], gold: [1, .56, .12], orange: [1, .34, .08], red: [.92, .07, .10],
  teal: [.05, .68, .59], cyan: [.19, .82, .90], blue: [.14, .33, .77]
};
const TAU = Math.PI * 2;
const MONUMENT_SCALE = 3;
const push = (p, c, x, y, z, color) => { p.push(x, y, z); c.push(...color); };
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const halton = (index, base) => {
  let result = 0, fraction = 1 / base;
  while (index > 0) { result += (index % base) * fraction; index = Math.floor(index / base); fraction /= base; }
  return result;
};
function roundedParticles(p, c, x, y, z, color, radius, seed, count = 5) {
  // 原图只规定母形的位置与颜色；体块由球域内分布的粒子重新搭建。
  for (let i = 0; i < count; i++) {
    const n = seed + i * 17 + 1;
    const vertical = halton(n, 2) * 2 - 1;
    const angle = halton(n, 3) * TAU;
    const r = radius * Math.cbrt(halton(n, 5));
    const radial = Math.sqrt(Math.max(0, 1 - vertical * vertical)) * r;
    push(p, c, x + Math.cos(angle) * radial, y + vertical * r, z + Math.sin(angle) * radial, color);
  }
}
const radiusAt = (spec, _index, t) => {
  const height = Math.min(.999, Math.max(0, t));
  const profile = spec.profile;
  for (let i = 1; i < profile.length; i++) {
    if (height > profile[i][0]) continue;
    const [start, r0] = profile[i - 1], [end, r1] = profile[i];
    return r0 + (r1 - r0) * (height - start) / Math.max(.0001, end - start);
  }
  return profile[profile.length - 1][1];
};

function motifTile(atlas, index) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d');
  context.drawImage(atlas.image, index % 4 * 64, Math.floor(index / 4) * 64, 64, 64, 0, 0, 128, 128);
  const pixels = context.getImageData(0, 0, 128, 128);
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = 255;
  }
  context.putImageData(pixels, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

function makeRoundParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 32;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(16, 16, 5, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(.68, 'rgba(255,255,255,.94)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 32, 32);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

export function installFiveVolcanoes(scene, terrainHeight, atlas, dense) {
  const textures = [0, 1, 7].map(i => motifTile(atlas, i));
  const roundParticle = makeRoundParticleTexture();
  const textureFor = glyph => glyph === 1 ? textures[1] : glyph === 7 ? textures[2] : textures[0];
  const peaks = [];
  let pointCount = 0;

  function cloud(p, c, { size = .19, texture = textures[0], opacity = .82, additive = false, depthWrite = false, solid = false, round = false } = {}) {
    const normals = new Float32Array(p.length);
    const sizes = new Float32Array(p.length / 3);
    for (let i = 0; i < p.length; i += 3) {
      const length = Math.hypot(p[i], .42, p[i + 2]) || 1;
      normals[i] = p[i] / length; normals[i + 1] = .42 / length; normals[i + 2] = p[i + 2] / length;
      sizes[i / 3] = Math.max(.45, Math.min(1.3, size / .19));
    }
    const points = makeLuminousSurface(p, c, normals, sizes, MONUMENT_SCALE);
    points.material.opacity = opacity;
    points.material.depthWrite=solid;
    points.userData.surfaceRole=solid?'body':'ornament';
    points.layers.disable(1);
    points.material.uniforms.uCore.value=solid?.72:.68;
    points.material.uniforms.uFlow.value = .035;
    points.material.uniforms.uBrightness.value = 1.08;
    points.material.uniforms.uSurfaceFill.value = 1.4;
    points.material.uniforms.uColorRetention.value = 1;
    points.material.uniforms.uRim.value=.55;points.material.uniforms.uGlow.value=.16;points.material.uniforms.uSpeed.value=.35;
    points.material.uniforms.uSize.value = .86;
    pointCount += p.length / 3;
    return points;
  }

  function curve(parent, fn, count, color, texture, size = .20, width = .08, additive = false) {
    const p = [], c = [];
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const [x, y, z] = fn(t);
      const before = fn(Math.max(0, t - .004)), after = fn(Math.min(1, t + .004));
      const tx = after[0] - before[0], ty = after[1] - before[1], tz = after[2] - before[2];
      const length = Math.hypot(tx, ty, tz) || 1;
      let nx = -ty, ny = tx, nz = 0;
      let nLength = Math.hypot(nx, ny, nz);
      if (nLength < .0001) { nx = 1; ny = 0; nz = 0; nLength = 1; }
      nx /= nLength; ny /= nLength; nz /= nLength;
      let bx = ty * nz - tz * ny, by = tz * nx - tx * nz, bz = tx * ny - ty * nx;
      const bLength = Math.hypot(bx, by, bz) || 1;
      bx /= bLength; by /= bLength; bz /= bLength;
      const tone = i % 9 === 0 ? C.cream : color;
      // 中心粒子加环绕粒子构成圆截面，不再用一根扁平、单层的点线表示纹带。
      push(p, c, x, y, z, tone);
      for (let bead = 0; bead < 6; bead++) {
        const a = bead / 6 * TAU;
        const r = width * .72;
        push(p, c, x + (nx * Math.cos(a) + bx * Math.sin(a)) * r,
          y + (ny * Math.cos(a) + by * Math.sin(a)) * r,
          z + (nz * Math.cos(a) + bz * Math.sin(a)) * r, tone);
      }
    }
    const object = cloud(p, c, { texture, size: size * .82, opacity: .96, additive, round: true });
    parent.add(object);
    return object;
  }

  function shell(group, spec, index, texture) {
    const p = [], c = [], glyphP = [];
    const n = dense ? 12500 : 7800;
    for (let i = 0; i < n; i++) {
      // 高度与方位分别取互不相关的低差异序列，避免退化成一条螺旋线。
      const t = Math.pow(halton(i + 1, 2), .9);
      const a = halton(i + 1, 3) * TAU;
      const r = radiusAt(spec, index, t) + Math.sin(a * (7 + index) + t * 17) * .12;
      const front = Math.max(0, Math.cos(a));
      const shade = .26 + front * .40 + t * .06;
      const color = spec.tint.map((value, channel) => value * shade + (channel === 1 ? .014 : 0));
      push(p, c, Math.sin(a) * r, t * spec.height, Math.cos(a) * r, color);
      glyphP.push(Math.sin(a) * (r + .09), t * spec.height, Math.cos(a) * (r + .09));
    }
    // 不透明粒点先读出完整锥体，外移的微纹样再呈现山身表层。
    group.add(cloud(p, c, { size: .17, opacity: 1, solid: true }));
    // The original-reference relief supplies surface motifs; avoid a second glyph coating.
    const bands = new THREE.Group();
    group.add(bands);
    const bandLevels = index === 0 ? [[.17, 18], [.32, 15], [.49, 21], [.67, 13], [.79, 16]]
      : [[.14, 10], [.84, 10]];
    for (const [level, cells] of bandLevels) {
      curve(bands, t => {
        const a = t * TAU;
        const h = level + Math.sin(a * cells) * (index === 0 ? .009 : .002);
        const r = radiusAt(spec, index, h) + .35;
        return [Math.sin(a) * r, h * spec.height, Math.cos(a) * r];
      }, dense ? 600 : 300, level < .5 && (index === 0 || index === 4) ? C.teal : C.cream, texture, .28, .045);
    }
    // 可见的短光弧和菱格随山坡反向慢转；远看与 01 的流转语言一致。
    const orbit = new THREE.Group();
    group.add(orbit);
    for (let band = 0; band < 3; band++) {
      curve(orbit, t => {
        const h = .24 + band * .18 + Math.sin(t * TAU) * .012;
        const a = band * 2.08 + t * 1.15;
        const r = radiusAt(spec, index, h) + .58;
        return [Math.sin(a) * r, h * spec.height, Math.cos(a) * r];
      }, dense ? 165 : 85, band === 1 ? C.orange : C.gold, texture, .25, .05, true);
    }
    return { bands, orbit };
  }

  function sculptedSlope(group, spec, index, texture) {
    // 每条线都贴合圆锥的三维半径；多圈独立纹带缓慢转动，背面也有相同结构。
    const patterns = new THREE.Group();
    group.add(patterns);
    const p = [], c = [];
    const at = (angle, t, lift = .46) => {
      const r = radiusAt(spec, index, t) + lift;
      return [Math.sin(angle) * r, t * spec.height, Math.cos(angle) * r];
    };
    const stroke = (fn, n, color) => {
      for (let i = 0; i < n; i++) push(p, c, ...fn(i / (n - 1)), i % 13 === 0 ? C.cream : color);
    };
    const rows = index === 1 ? [0.24, .37, .50, .63, .76] : index === 3 ? [.17, .31, .47, .62, .77]
      : index === 4 ? [.20, .34, .48, .63, .77] : [.28, .47, .65];
    rows.forEach((height, row) => {
      const cells = index === 2 ? 13 : index === 4 ? 15 : 17;
      for (let sector = 0; sector < cells; sector++) {
        const a0 = sector / cells * TAU;
        const width = TAU / cells;
        if (index === 1) {
          // 双翼宝石：菱格从所有方位重复，彼此错缝。
          const centre = a0 + (row % 2 ? width * .5 : 0);
          const diamond = [[-.42, 0], [0, .050], [.42, 0], [0, -.050], [-.42, 0]];
          stroke(u => {
            const segment = Math.min(3, Math.floor(u * 4));
            const local = u * 4 - segment;
            const a = diamond[segment], b = diamond[segment + 1];
            return at(centre + (a[0] + (b[0] - a[0]) * local) * width,
              height + a[1] + (b[1] - a[1]) * local);
          }, 64, row % 2 ? C.gold : C.cream);
          stroke(u => at(centre + Math.cos(u * TAU) * width * .17,
            height + Math.sin(u * TAU) * .018), 28, C.cyan);
        } else if (index === 2) {
          // 龙凤日轮：云涡在锥面上蜿蜒，而非贴在镜头前。
          stroke(u => at(a0 + width * (.5 + Math.cos(u * Math.PI * 3.6) * (.04 + u * .37)),
            height + Math.sin(u * Math.PI * 3.6) * (.008 + u * .04)), 46, row % 2 ? C.cyan : C.cream);
        } else if (index === 3) {
          // 蝶火脉：阶梯和红色锯齿火脉，沿坡面有实际纵深。
          stroke(u => at(a0 + u * width, height + Math.floor(u * 4) * .009), 25, row % 2 ? C.teal : C.cream);
          if (sector % 4 === 0) stroke(u => at(a0 + width * .5 + Math.sin(u * 20) * width * .11,
            Math.max(.06, height - .085 + u * .15), .62), 35, C.red);
        } else {
          // 夜翼回纹：折线回旋与菱形花心围绕整个山体。
          stroke(u => at(a0 + width * (.16 + u * .72), height + Math.sign(Math.sin(u * TAU * 1.5)) * .019),
            34, row % 2 ? C.teal : C.cream);
          stroke(u => at(a0 + width * (.5 + Math.cos(u * TAU) * .20),
            height + Math.sin(u * TAU) * .027), 27, C.gold);
        }
      }
    });
    patterns.add(cloud(p, c, { texture, size: index === 1 ? .44 : .36, opacity: .98 }));
    return patterns;
  }

  function referenceOrnaments(parent, spec, index, pixels, width, height) {
    // 装饰只从各峰自己的原画取样：以黑底分割独立纹样，再把像素投到坡面并沿法线补出圆截面。
    const layouts = index === 1 ? [
      { rect: [214, 7, 86, 103], angle: 0, y: .985, w: 2.15, h: 2.6 },
      { rect: [8, 111, 195, 101], angle: -.62, y: .71, w: 5.6, h: 2.9 },
      { rect: [309, 111, 195, 101], angle: .62, y: .71, w: 5.6, h: 2.9 }
    ] : index === 3 ? [
      { rect: [218, 4, 76, 91], angle: 0, y: .985, w: 1.9, h: 2.35 },
      { rect: [8, 12, 170, 148], angle: -.58, y: .73, w: 5.0, h: 4.2 },
      { rect: [334, 12, 174, 148], angle: .58, y: .73, w: 5.0, h: 4.2 },
      { rect: [7, 142, 170, 185], angle: -.72, y: .43, w: 5.6, h: 4.8 },
      { rect: [334, 142, 174, 185], angle: .72, y: .43, w: 5.6, h: 4.8 }
    ] : [
      { rect: [205, 75, 102, 91], angle: 0, y: .985, w: 2.2, h: 2.15 },
      { rect: [79, 50, 157, 92], angle: -.78, y: .70, w: 4.2, h: 2.45 },
      { rect: [278, 50, 155, 92], angle: .78, y: .70, w: 4.2, h: 2.45 },
      { rect: [68, 171, 169, 132], angle: -.92, y: .40, w: 4.6, h: 3.15 },
      { rect: [277, 171, 164, 132], angle: .92, y: .40, w: 4.6, h: 3.15 }
    ];
    const positions = [], colors = [];
    const srgb = value => { const v = value / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
    const step = dense ? 2 : 3;
    layouts.forEach((layout, layoutIndex) => {
      const [x0, y0, rw, rh] = layout.rect;
      const regionW = Math.min(rw, width - x0), regionH = Math.min(rh, height - y0);
      if (regionW <= 0 || regionH <= 0) return;
      const active = new Uint8Array(regionW * regionH), visited = new Uint8Array(regionW * regionH);
      for (let y = 0; y < regionH; y++) for (let x = 0; x < regionW; x++) {
        const offset = ((y0 + y) * width + x0 + x) * 4;
        const r = pixels[offset], g = pixels[offset + 1], b = pixels[offset + 2];
        const visible = Math.max(r, g, b) > 48;
        // 火口图形与山体在原稿里相连；按原图主色隔离花心/火焰，避免把山坡尖端误采成顶饰。
        const topMotif = layoutIndex === 0;
        const topColor = (r > 78 && r > g * 1.08 && r > b * 1.08)
          || (g > 52 && g > r * 1.12 && g >= b * .82)
          || (r > 145 && g > 128 && b > 90);
        active[y * regionW + x] = visible && (!topMotif || topColor) ? 1 : 0;
      }
      let largest = [];
      for (let start = 0; start < active.length; start++) {
        if (!active[start] || visited[start]) continue;
        const queue = [start], component = [];
        visited[start] = 1;
        for (let head = 0; head < queue.length; head++) {
          const at = queue[head], x = at % regionW, y = Math.floor(at / regionW);
          component.push(at);
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue;
            const xx = x + dx, yy = y + dy;
            if (xx < 0 || yy < 0 || xx >= regionW || yy >= regionH) continue;
            const next = yy * regionW + xx;
            if (!active[next] || visited[next]) continue;
            visited[next] = 1; queue.push(next);
          }
        }
        if (component.length > largest.length) largest = component;
      }
      // 每个手工裁切框对应一个主体装饰。小型分离云点、边框碎片不再被当成翼兽采样，避免远处漂浮粒团。
      const selected = largest;
      if (selected.length < 40) return;
      let minX = regionW, maxX = 0, minY = regionH, maxY = 0;
      for (const at of selected) {
        const x = at % regionW, y = Math.floor(at / regionW);
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
      const mask = new Uint8Array(active.length);
      selected.forEach(at => { mask[at] = 1; });
      const normalX = Math.sin(layout.angle), normalZ = Math.cos(layout.angle);
      const tangentX = Math.cos(layout.angle), tangentZ = -Math.sin(layout.angle);
      for (let y = minY; y <= maxY; y += step) for (let x = minX; x <= maxX; x += step) {
        if (!mask[y * regionW + x]) continue;
        const sourceX = x0 + x, sourceY = y0 + y;
        const across = ((x - minX) / Math.max(1, maxX - minX) - .5) * layout.w;
        const levelY = spec.height * layout.y + (.5 - (y - minY) / Math.max(1, maxY - minY)) * layout.h;
        const level = Math.max(.025, Math.min(.975, levelY / spec.height));
        const radius = radiusAt(spec, index, level);
        if (Math.abs(across) > radius * .94) continue;
        const pixel = (sourceY * width + sourceX) * 4;
        const base = [srgb(pixels[pixel]), srgb(pixels[pixel + 1]), srgb(pixels[pixel + 2])];
        const seed = layoutIndex * 17011 + sourceY * 733 + sourceX * 37;
        // 前后截面按球域收束，既保留原图边缘与色块，也避免做成单层彩色纸片。
        for (let slice = -2; slice <= 2; slice++) {
          const depth = slice / 2, thickness = .26 + (slice === 0 ? .12 : 0);
          const angle = halton(seed + slice + 4, 3) * TAU;
          const swell = thickness * Math.sqrt(Math.max(0, 1 - depth * depth));
          const along = across + Math.cos(angle) * swell;
          const y = levelY + Math.sin(angle) * swell;
          const t = Math.max(.025, Math.min(.975, y / spec.height));
          const r = radiusAt(spec, index, t);
          const radial = Math.sqrt(Math.max(.03, r * r - along * along)) + .42 + depth * thickness;
          const shade = depth < 0 ? .52 + (depth + 1) * .22 : .86 + depth * .14;
          push(positions, colors,
            normalX * radial + tangentX * along,
            y,
            normalZ * radial + tangentZ * along,
            base.map(value => Math.min(1, value * shade)));
        }
      }
    });
    if (positions.length) parent.add(cloud(positions, colors, { size: dense ? .16 : .18, opacity: 1, round: true }));
  }

  function sculptFromReference(group, spec, index, texture, onReady) {
    // 参考画只提供颜色/纹样坐标：按山坡半径重新放置为前后两侧的凸起粒子。
    // 不把整张 JPG 作为材质贴图、图片平面或正面点阵铺在镜头前。
    const relief = new THREE.Group();
    relief.name = '依据原画重建的环山浮雕粒子';
    group.add(relief);
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 341;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const p = [], c = [];
      const scaleX = image.width / canvas.width, scaleY = image.height / canvas.height;
      const half = spec.art.half;
      for (let row = Math.floor(spec.art.top / scaleY); row < Math.min(canvas.height, spec.art.bottom / scaleY); row += 2) {
        const artY = row * scaleY;
        const t = (spec.art.bottom - artY) / (spec.art.bottom - spec.art.top);
        if (t < .02 || t > .98) continue;
        const r = radiusAt(spec, index, t);
        // 03原画里的蓝色山身是上窄下宽的梯形；逐行按原画轮廓取样，
        // 不把两侧龙凤和外框误吸到火山坡面上。
        const sourceHalf = index === 2 ? 230 + (510 - 230) * (1 - t) : half * r / spec.radius;
        const maxPx = sourceHalf / scaleX * (index === 2 ? .99 : .98);
        const center = canvas.width * .5;
        for (let col = Math.max(1, Math.floor(center - maxPx)); col < Math.min(canvas.width - 1, center + maxPx); col += 2) {
          const offset = (row * canvas.width + col) * 4;
          const red = pixels[offset], green = pixels[offset + 1], blue = pixels[offset + 2];
          const brightMotif = index === 2
            ? red > 125 && green > 115 && blue > 82
            : red > 105 || green > 105 || (red > 62 && green > 74 && blue > 70);
          if (!brightMotif) continue;
          const x = index === 2 ? (col - center) / maxPx * r : (col - center) * scaleX / half * spec.radius;
          if (Math.abs(x) > r * .96) continue;
          const a = Math.asin(x / r);
          const rgb = [Math.min(1, red / 220), Math.min(1, green / 220), Math.min(1, blue / 220)];
          const z = Math.sqrt(r * r - x * x);
          for (const sign of [-1, 1]) {
            const extra = .33 + ((col * 13 + row * 19) % 7) * .024;
            const factor = (r + extra) / r;
            const shade = sign > 0 ? 1 : .58;
            roundedParticles(p, c, x * factor, t * spec.height, sign * z * factor,
              rgb.map(value => value * shade), .14 + ((col * 13 + row * 19) % 5) * .018,
              row * 733 + col * 37, 3);
          }
        }
      }
      if (p.length) relief.add(cloud(p, c, { texture, size: .17, opacity: 1, round: true }));
      group.userData.referenceReliefPoints = p.length / 3;
      onReady?.({ pixels, width: canvas.width, height: canvas.height });
    };
    image.onerror = () => console.warn(`第 ${index + 1} 张火山原画未能读取，保留程序化纹样`);
    image.src = `./reference-frames/volcano-${index + 1}.jpg`;
    return relief;
  }

  function star(parent, y, radius, petals, color, texture, tilt = 0) {
    const group = new THREE.Group();
    group.position.y = y;
    group.rotation.x = tilt;
    parent.add(group);
    for (let k = 0; k < petals; k++) {
      const base = k / petals * TAU;
      curve(group, t => {
        const r = .22 + Math.sin(t * Math.PI) * radius;
        const a = base + (t - .5) * .45;
        return [Math.sin(a) * r, Math.cos(a) * r + Math.cos(t * Math.PI) * radius * .58,
          Math.sin(t * Math.PI) * .34];
      }, dense ? 65 : 35, k % 2 ? C.gold : color, texture, .22, .04, true);
    }
    return group;
  }

  function crown(parent, spec, index, texture) {
    const emblem = new THREE.Group();
    emblem.position.y = spec.height + (index === 2 ? 4.3 : index === 1 ? .55 : .82);
    parent.add(emblem);
    if (index === 4) {
      // 第五张原画的八瓣花：轮廓由实体粒子瓣构成，正反面和侧面均可见。
      const petals = [], colors = [];
      for (let petal = 0; petal < 8; petal++) {
        const angle = petal / 8 * TAU;
        for (let j = 0; j < (dense ? 800 : 460); j++) {
          const u = halton(j + 1 + petal * 29, 2);
          const lateral = (halton(j + 1 + petal * 37, 3) * 2 - 1) * Math.sin(u * Math.PI) * .76;
          const radius = .50 + u * 2.16;
          const x = Math.sin(angle) * radius + Math.cos(angle) * lateral;
          const y = Math.cos(angle) * radius - Math.sin(angle) * lateral;
          const bulge = Math.sin(u * Math.PI) * (1 - Math.abs(lateral) / .78);
          const tone = Math.abs(lateral) > Math.sin(u * Math.PI) * .59 ? C.cream
            : petal % 2 ? C.orange : C.red;
          const depth = .18 + bulge * .66;
          for (const side of [-1, 1]) roundedParticles(petals, colors, x, y, side * depth * .42,
            tone, .10 + bulge * .10, petal * 13007 + j * 19 + (side > 0 ? 1 : 2), 3);
        }
      }
      emblem.add(cloud(petals, colors, { texture, size: .13, opacity: 1, solid: true }));
      const coreP = [], coreC = [];
      for (let j = 0; j < 900; j++) {
        const h = halton(j + 1, 2) * 2 - 1, a = halton(j + 1, 3) * TAU;
        const radial = Math.sqrt(1 - h * h);
        push(coreP, coreC, Math.sin(a) * radial * .63, Math.cos(a) * radial * .63,
          h * .68, j % 7 ? C.teal : C.cream);
      }
      emblem.add(cloud(coreP, coreC, { texture, size: .26, opacity: 1 }));
      return emblem;
    }
    const p = [], c = [];
    const n = dense ? 1550 : 850;
    for (let i = 0; i < n; i++) {
      const height = halton(i + 1, 2) * 2 - 1;
      const angle = halton(i + 1, 3) * TAU;
      const around = Math.sqrt(Math.max(0, 1 - height * height));
      const size = index === 1 ? (1 - Math.abs(height)) * (2.65 + .45 * Math.cos(angle * 4))
        : index === 3 ? (1 - Math.abs(height)) * (1.6 + .3 * Math.cos(angle * 7))
        : index === 4 ? 1.08 + .24 * Math.cos(angle * 8) : 2.15;
      const x = Math.sin(angle) * around * size;
      const y = index === 3 ? height * 2.75 + Math.max(0, height) * .78 : height * (index === 1 ? 3.1 : 2.25);
      const z = Math.cos(angle) * around * size;
      const palette = index === 2 ? (i % 5 ? C.orange : C.gold) : index === 4 ? (i % 3 ? C.red : C.gold)
        : index === 3 ? (i % 5 ? C.red : C.orange) : (i % 4 ? C.red : C.gold);
      push(p, c, x, y, z, palette);
    }
    emblem.add(cloud(p, c, { texture, size: .26, opacity: .98 }));
    const rays = index === 2 ? 18 : index === 4 ? 8 : index === 1 ? 8 : 7;
    for (let k = 0; k < rays; k++) {
      const a = k / rays * TAU;
      if (index === 3) {
        curve(emblem, t => [Math.sin(a + t * .32) * (.34 + t * 1.05), 1.7 + t * 2.2,
          Math.cos(a + t * .32) * (.34 + t * 1.05)], 28, k % 2 ? C.red : C.gold, texture, .28, .05, true);
      } else {
        const r = index === 2 ? 2.15 : index === 4 ? 1.35 : 1.7;
        curve(emblem, t => [Math.sin(a) * (r + Math.sin(t * Math.PI) * 1.35),
          Math.cos(a) * (r + Math.sin(t * Math.PI) * 1.35),
          Math.sin(t * Math.PI) * .72 + Math.cos(a * 3) * .25],
        34, k % 2 ? C.cream : C.gold, texture, .25, .05, true);
      }
    }
    return emblem;
  }

  function volcanoCompositeRelief(parent, spec, index, texture) {
    // 保留 image_3 原稿的构图和纹样细节，把每个图形像素映射成有起伏的三维粒子表面。
    // 01的采样思路用于点云分布；参考图只负责形状与颜色，不重新设计日轮、云纹或龙凤。
    const relief = new THREE.Group();
    relief.name = '03 原稿曲面粒子：日轮与卷云';
    parent.add(relief);
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      const width = image.naturalWidth || image.width, height = image.naturalHeight || image.height;
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0, width, height);
      const pixels = context.getImageData(0, 0, width, height).data;
      const luminance = (r, g, b) => .2126 * r + .7152 * g + .0722 * b;
      const linear = value => { const v = value / 255; return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
      const peakScale = spec.height / 690; // 原稿山体从火口 y≈310 到山脚 y≈1000。
      const stride = dense ? 3 : 6;
      const regions = [
        { name: '顶部日轮与卷云', x0: 530, x1: 1006, y0: 0, y1: 310, kind: 'sun' }
      ];
      let total = 0;
      for (const region of regions) {
        const x0 = Math.max(0, Math.floor(region.x0)), x1 = Math.min(width, Math.ceil(region.x1));
        const y0 = Math.max(0, Math.floor(region.y0)), y1 = Math.min(height, Math.ceil(region.y1));
        const w = x1 - x0, h = y1 - y0;
        const mask = new Uint8Array(w * h), distance = new Float32Array(w * h);
        const mountainHalf = y => 230 + Math.max(0,Math.min(1,(y-310)/690))*315;
        const mountainLeft = y => 768-mountainHalf(y);
        const mountainRight = y => 768+mountainHalf(y);
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const sx = x0 + x, sy = y0 + y, pixel = (sy * width + sx) * 4;
          const r = pixels[pixel], g = pixels[pixel + 1], b = pixels[pixel + 2];
          const visible = luminance(r, g, b) > 21;
          const outsideMountain = region.kind === 'dragon' ? sx < mountainLeft(sy) - 7
            : region.kind === 'phoenix' ? sx > mountainRight(sy) + 7 : true;
          const selected = visible && outsideMountain;
          const at = y * w + x;
          if (selected) mask[at] = 1;
        }
        const paintedMask = mask.slice();
        if (region.kind !== 'sun') closePaintedSilhouette(mask,w,h);
        // Distances follow the anatomical silhouette, including the small dark gaps between painted details.
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const at = y * w + x;
          if (!mask[at]) { distance[at] = 0; continue; }
          const edge = x === 0 || y === 0 || x === w - 1 || y === h - 1
            || !mask[at - 1] || !mask[at + 1] || !mask[at - w] || !mask[at + w];
          distance[at] = edge ? 1 : 1e6;
        }
        // 由边缘向形体内部传播距离，让宽轮廓形成丰满的截面、细线保持较小的圆截面。
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const at = y * w + x;
          if (!mask[at]) continue;
          let d = distance[at];
          if (x) d = Math.min(d, distance[at - 1] + 1);
          if (y) d = Math.min(d, distance[at - w] + 1);
          if (x && y) d = Math.min(d, distance[at - w - 1] + 1.414);
          if (x + 1 < w && y) d = Math.min(d, distance[at - w + 1] + 1.414);
          distance[at] = d;
        }
        for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
          const at = y * w + x;
          if (!mask[at]) continue;
          let d = distance[at];
          if (x + 1 < w) d = Math.min(d, distance[at + 1] + 1);
          if (y + 1 < h) d = Math.min(d, distance[at + w] + 1);
          if (x + 1 < w && y + 1 < h) d = Math.min(d, distance[at + w + 1] + 1.414);
          if (x && y + 1 < h) d = Math.min(d, distance[at + w - 1] + 1.414);
          distance[at] = d;
        }
        const volumeP = [], volumeC = [], volumeN = [], volumeSize = [];
        const radii = localStrokeRadii(distance,w,h,region.kind==='sun'?14:40);
        const bulge = Float32Array.from(distance,(d,i)=>Math.sqrt(Math.max(0,(d-.65)*(2*radii[i]-d)))*peakScale);
        const atDistance = (x,y) => bulge[Math.max(0,Math.min(h-1,y))*w+Math.max(0,Math.min(w-1,x))];
        const bodyAt = (sx,sy,d,farWing=false) => {
          let x=(sx-768)*peakScale, y=(1000-sy)*peakScale;
          const wing = region.kind==='phoenix' && sx>=1205 && sy<560;
          let radius=d*1.05;
          let centre;
          if(region.kind==='sun') {
            y=spec.height+(310-sy)*peakScale;
            const solarRadius=Math.hypot(sx-768,sy-200);
            // The central sun is an ellipsoid; individual rays and cloud strokes
            // keep their own rounded cross sections instead of a capped slab.
            radius=solarRadius<68?Math.sqrt(Math.max(0,1-(solarRadius/68)**2))*1.65:Math.max(0,d*.85);
            const arch=Math.sin(Math.max(0,Math.min(1,(sx-530)/476))*Math.PI);
            centre=radiusAt(spec,index,.995)+1.6+(solarRadius>115?arch*1.35:0);

          } else {
            const t=(sy-108)/900;
            x+=region.kind==='dragon'?-1.25:1.25;
            centre=region.kind==='dragon'?4.4+Math.sin(t*TAU*1.25+.25)*1.8:4.5+Math.sin(t*Math.PI)*.9;
            if(wing) {
              const spread=Math.max(0,(sx-1195)/340);
              centre+=Math.sin(spread*Math.PI*.85)*3.1+(500-sy)*.002;
              radius=Math.min(.58,radius*.42);
              if(farWing) {
                const shoulder=(1195-768)*peakScale+1.25;
                x=shoulder-(x-shoulder)*.72-.6;
                y+=.55+spread*.5;
                centre-=3.0+spread*.9;
              }
            } else radius=Math.min(2.5,radius*(sy>640?.85:1));
            const level=Math.max(.015,Math.min(.995,y/spec.height));
            const slope=radiusAt(spec,index,level)+.8;
            centre=Math.max(centre,Math.sqrt(Math.max(0,slope*slope-x*x))+radius+.45);
          }
          return {x,y,centre,radius};
        };
        for (let y = 0; y < h; y += stride) for (let x = 0; x < w; x += stride) {
          const at = y * w + x;
          if (!mask[at]) continue;
          const sx = x0 + x, sy = y0 + y, pixel = (sy * width + sx) * 4;
          const r = pixels[pixel], g = pixels[pixel + 1], b = pixels[pixel + 2];
          const baseColor = paintedMask[at] ? [linear(r),linear(g),linear(b)]
            : region.kind==='dragon'?[.015,.11,.075]:[.12,.012,.008];
          const emitSurface = farWing => {
            const body=bodyAt(sx,sy,bulge[at],farWing);
            const neighbours=[bodyAt(sx-1,sy,atDistance(x-1,y),farWing),bodyAt(sx+1,sy,atDistance(x+1,y),farWing),
              bodyAt(sx,sy-1,atDistance(x,y-1),farWing),bodyAt(sx,sy+1,atDistance(x,y+1),farWing)];
            for(const side of [1,-1]) {
              const zOf = v=>v.centre+side*v.radius;
              const nx=-(zOf(neighbours[1])-zOf(neighbours[0]))/(2*peakScale);
              const ny=(zOf(neighbours[3])-zOf(neighbours[2]))/(2*peakScale);
              const normal=new THREE.Vector3(nx,ny,1).normalize().multiplyScalar(side);
              const seed=at*7+(side>0?3:11);
              push(volumeP,volumeC,body.x+(halton(seed,2)-.5)*peakScale*1.2,
                body.y+(halton(seed,3)-.5)*peakScale*1.2,zOf(body),baseColor);
              volumeN.push(normal.x,normal.y,normal.z);
              volumeSize.push(.72+Math.min(1,distance[at]/10)*.38);
            }
            // Sparse continuous core points close grazing-angle gaps without repeating flat slices.
            if(at%7<2) {
              push(volumeP,volumeC,body.x,body.y,body.centre+(halton(at+1,5)*2-1)*body.radius,baseColor.map(v=>v*.55));
              volumeN.push(0,0,1);volumeSize.push(.78);
            }
          };
          emitSurface(false);
          if(region.kind==='phoenix'&&sx>=1210&&sy<=500)emitSurface(true);
        }
        if(volumeP.length) {
          const rounded=makeRoundedReferenceCloud(volumeP,volumeC,volumeN,volumeSize,MONUMENT_SCALE);
          rounded.name=region.name;relief.add(rounded);pointCount+=volumeP.length/3;
        }
        total += volumeP.length / 3;
      }
      relief.userData.pointCount = total;
      relief.userData.source = 'reference-frames/volcano-3.jpg';
    };
    image.onerror = () => console.warn('03 原稿粒子采样失败：reference-frames/volcano-3.jpg 未能读取');
    image.src = './reference-frames/volcano-3.jpg';
    return relief;
  }

  function buildTotem(group, spec, index, texture) {
    const totem = new THREE.Group();
    group.add(totem);
    if (index === 2) {
      volcanoCompositeRelief(totem, spec, index, texture);

    }
    // 02/04/05 的火口与翼纹均由原稿像素重建；不再叠加与原画无关的通用环线和火脉。
    return { totem };
  }

  SPECS.forEach((spec, index) => {
    const group = new THREE.Group();
    group.name = spec.name;
    // Put the particle-built base just above the sampled terrain. The previous
    // -.4 placed the volcano roots below the ground substrate and exposed a
    // large triangular-looking cut when the camera orbited.
    group.position.set(spec.x, terrainHeight(spec.x, spec.z) + .12, spec.z);
    group.scale.setScalar(MONUMENT_SCALE);
    group.userData = { kind: 'volcano', width: spec.radius * 2 * MONUMENT_SCALE, height: spec.height * MONUMENT_SCALE,
      localRadius: spec.radius, localHeight: spec.height, radiusProfile: spec.profile, monumentScale: MONUMENT_SCALE, note: spec.note, index,
      baseY: group.position.y };
    scene.add(group);
    const texture = textureFor(spec.glyph);
    const shellMotion = shell(group, spec, index, texture);
    shellMotion.orbit.visible=false;
    const slopeMotion = null; // Original-reference relief is the single slope ornament layer.
    let sculpture = null;
    let totemMotion = null;
    if (index === 0) {
      sculpture = window.CoCreateSculptures?.buildFirstPeak({ THREE, spec, texture, mobile: !dense,
        makePointCloud: (positions, colors, options) => cloud(positions, colors, options), peakRadiusAt: radiusAt });
      if (sculpture) group.add(sculpture.group);
    } else totemMotion = buildTotem(group, spec, index, texture);
    // 远峰先读作山体，接近时才逐渐显露悬浮图腾；不隐藏原画山身纹样。
    const ornamentOpacities = new WeakMap();
    let lastOrnamentFade = -Infinity;
    const referenceRelief = sculptFromReference(group, spec, index, texture, sample => {
      if (totemMotion && (index === 1 || index === 3 || index === 4)) {
        referenceOrnaments(totemMotion.totem, spec, index, sample.pixels, sample.width, sample.height);
      }
      // 原画浮雕给颜色与形态，程序纹带补足环山的真实三维走势和持续旋转。
      if (index !== 0) shellMotion.bands.visible = false;
    });
    peaks.push(group);
    group.userData.update = (seconds, camera) => {
      group.position.y = group.userData.baseY + Math.sin(seconds * .79 + index * 1.3) * .035;
      shellMotion.bands.rotation.y = seconds * (.09 + index * .013);
      shellMotion.orbit.rotation.y = -seconds * (.20 + index * .018);
      sculpture?.update(seconds, 1);
      if (sculpture) sculpture.group.rotation.y = Math.sin(seconds * .11) * .36;
      if (slopeMotion) slopeMotion.rotation.y = seconds * (.09 + index * .008);
      referenceRelief.rotation.y = 0; // Motifs stay registered to the mountain; the viewer orbits the form.
      if (totemMotion) {
        if (camera && seconds - lastOrnamentFade > .12) {
          const distance = Math.hypot(camera.position.x - group.position.x, camera.position.z - group.position.z);
          const near = 90, far = 210;
          const t = Math.max(0, Math.min(1, (distance - near) / (far - near)));
          const fade = 1 - (t * t * (3 - 2 * t)) * .18;
          totemMotion.totem.traverse(object => {
            const material = object.material;
            if (!material || !('opacity' in material)) return;
            if (!ornamentOpacities.has(material)) ornamentOpacities.set(material, material.opacity);
            material.opacity = ornamentOpacities.get(material) * fade;
          });
          lastOrnamentFade = seconds;
        }
      }
    };
  });
  return { peaks, pointCount, update(time, camera) { peaks.forEach(peak => peak.userData.update(time, camera)); },
    focus(selected) { peaks.forEach(peak => { peak.visible = !selected || peak === selected; }); },
    setVisible(visible) { peaks.forEach(peak => { peak.visible = visible; }); } };
}
