import * as THREE from '../lib/three/three.module.js';
import './co-create-sculptures.js?v=2';

// 五张设计图的图腾次序沿用 creator.html；这里生成可环看的粒子结构，而非图像平面。
const SPECS = [
  { name: '01 · 蝶莲焰', x: 0, z: -247, height: 11.6, radius: 10.2, lip: 1.55, tint: [0.10, 0.23, 0.46], glyph: 7,
    art: { top: 408, bottom: 806, half: 550 }, profile: [[0, 10.2], [.48, 7.8], [.82, 4.25], [1, 1.55]],
    note: '双蝶绕山、莲焰从火口升起；云纹、回纹持续沿山身流转。' },
  { name: '02 · 双翼宝石', x: 45, z: -212, height: 14.5, radius: 9.1, lip: 1.95, tint: [0.10, 0.17, 0.39], glyph: 0,
    art: { top: 356, bottom: 865, half: 480 }, profile: [[0, 9.1], [.48, 6.0], [.83, 3.0], [1, 1.95]],
    note: '两翼与宝石围绕菱格山坡，红金与青蓝纹样构成空间节奏。' },
  { name: '03 · 龙凤日轮', x: -45, z: -188, height: 16.2, radius: 10.4, lip: 2.80, tint: [0.08, 0.21, 0.43], glyph: 1,
    art: { top: 310, bottom: 1022, half: 530 }, profile: [[0, 10.4], [.46, 7.6], [.79, 4.1], [1, 2.80]],
    note: '参考原画轮廓雕刻厚层彩色粒子，叠加空间曲线与翼面骨架；龙凤在日轮两侧环山汇聚。' },
  { name: '04 · 蝶火脉', x: 39, z: -139, height: 13.6, radius: 8.8, lip: 1.28, tint: [0.04, 0.12, 0.37], glyph: 0,
    art: { top: 258, bottom: 978, half: 625 }, profile: [[0, 8.8], [.12, 8.1], [.12, 7.3], [.27, 7.0], [.27, 6.2],
      [.43, 5.8], [.43, 5.1], [.59, 4.8], [.59, 4.0], [.76, 3.5], [.76, 2.8], [.91, 2.0], [1, 1.28]],
    note: '四蝶浮游，几何纹带与炽红火脉贯穿阶梯状山体。' },
  { name: '05 · 夜翼回纹', x: -38, z: -118, height: 14.1, radius: 8.5, lip: 1.35, tint: [0.07, 0.18, 0.40], glyph: 0,
    art: { top: 452, bottom: 1022, half: 355 }, profile: [[0, 8.5], [.35, 6.3], [.70, 3.5], [1, 1.35]],
    note: '四只青色夜翼环绕回纹山坡，花形纹样悬于火口上方。' }
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

export function installFiveVolcanoes(scene, terrainHeight, atlas, dense) {
  const textures = [0, 1, 7].map(i => motifTile(atlas, i));
  const textureFor = glyph => glyph === 1 ? textures[1] : glyph === 7 ? textures[2] : textures[0];
  const peaks = [];
  let pointCount = 0;

  function cloud(p, c, { size = .19, texture = textures[0], opacity = .82, additive = false, depthWrite = false, solid = false } = {}) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
    geometry.computeBoundingSphere();
    const material = new THREE.PointsMaterial({ size: size * MONUMENT_SCALE, map: solid ? null : texture, vertexColors: true, transparent: !solid,
      opacity, alphaTest: solid ? 0 : .075, sizeAttenuation: true, depthTest: true, depthWrite: solid || depthWrite,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, fog: false });
    pointCount += p.length / 3;
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    return points;
  }

  function curve(parent, fn, count, color, texture, size = .20, width = .08, additive = false) {
    const p = [], c = [];
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const [x, y, z] = fn(t);
      for (const side of [-1, 0, 1]) push(p, c, x + side * width, y + Math.sin(t * 37 + side) * width * .3,
        z + Math.cos(t * 29 + side) * width, i % 9 === 0 ? C.cream : color);
    }
    const object = cloud(p, c, { texture, size, opacity: .92, additive });
    parent.add(object);
    return object;
  }

  function shell(group, spec, index, texture) {
    const p = [], c = [], glyphP = [];
    const n = dense ? 16000 : 10000;
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
    group.add(cloud(p, c, { size: .19, opacity: 1, solid: true }));
    group.add(cloud(glyphP, c, { texture, size: .30, opacity: .86 }));
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
        const maxPx = half * r / spec.radius / scaleX * (index === 2 ? .90 : .98);
        const center = canvas.width * .5;
        for (let col = Math.max(1, Math.floor(center - maxPx)); col < Math.min(canvas.width - 1, center + maxPx); col += 2) {
          const offset = (row * canvas.width + col) * 4;
          const red = pixels[offset], green = pixels[offset + 1], blue = pixels[offset + 2];
          const brightMotif = index === 2
            ? red > 125 && green > 115 && blue > 82
            : red > 105 || green > 105 || (red > 62 && green > 74 && blue > 70);
          if (!brightMotif) continue;
          const x = (col - center) * scaleX / half * spec.radius;
          if (Math.abs(x) > r * .96) continue;
          const a = Math.asin(x / r);
          const rgb = [Math.min(1, red / 220), Math.min(1, green / 220), Math.min(1, blue / 220)];
          const z = Math.sqrt(r * r - x * x);
          for (const sign of [-1, 1]) {
            const extra = .33 + ((col * 13 + row * 19) % 7) * .024;
            const factor = (r + extra) / r;
            push(p, c, x * factor, t * spec.height, sign * z * factor, rgb);
            if ((row + col) % 5 === 0) {
              const outer = (r + extra + .28) / r;
              push(p, c, x * outer, t * spec.height + .035, sign * z * outer, rgb);
            }
          }
        }
      }
      if (p.length) relief.add(cloud(p, c, { texture, size: .29, opacity: .97 }));
      group.userData.referenceReliefPoints = p.length / 3;
      onReady?.({ pixels, width: canvas.width, height: canvas.height });
    };
    image.onerror = () => console.warn(`第 ${index + 1} 张火山原画未能读取，保留程序化纹样`);
    image.src = `./reference-frames/volcano-${index + 1}.jpg`;
    return relief;
  }

  function sculptedFigureFromArt(totemMotion, spec, texture, source, crop, angle, y, scale, kind) {
    const { pixels, width, height } = source;
    const mount = new THREE.Group();
    const r = spec.radius + 4.0;
    mount.position.set(Math.sin(angle) * r, y, Math.cos(angle) * r);
    mount.rotation.y = 0;
    mount.scale.setScalar(scale);
    totemMotion.totem.add(mount);
    totemMotion.actors.push({ mount, baseY: y, angle });
    const p = [], c = [];
    const [left, top, right, bottom] = crop.map((value, i) => value / 3);
    const x0 = Math.max(0, Math.floor(left)), x1 = Math.min(width - 1, Math.floor(right));
    const y0 = Math.max(0, Math.floor(top)), y1 = Math.min(height - 1, Math.floor(bottom));
    const sizeX = kind === 'dragon' ? 6.4 : 6.9, sizeY = kind === 'dragon' ? 10.1 : 9.7;
    const motifColor = (x, y) => {
      if (x < x0 || x > x1 || y < y0 || y > y1) return false;
      const i = (y * width + x) * 4;
      const red = pixels[i], green = pixels[i + 1], blue = pixels[i + 2];
      return kind === 'dragon'
        ? green > 61 && blue > 60 && green > red * 1.16
        : red > 100 && red > green * 1.18;
    };
    const visible = (x, y) => {
      if (x < x0 || x > x1 || y < y0 || y > y1) return false;
      const i = (y * width + x) * 4;
      const red = pixels[i], green = pixels[i + 1], blue = pixels[i + 2];
      const artY = y * 3;
      const slope = Math.max(0, Math.min(1, (artY - 310) / 712));
      const mountainLeft = 550 - 250 * slope, mountainRight = 985 + 235 * slope;
      if (kind === 'dragon' && x * 3 > mountainLeft - 12) return false;
      if (kind === 'phoenix' && x * 3 < mountainRight + 12) return false;
      if (motifColor(x, y)) return true;
      // 原画米白描边只保留贴近龙/凤主体的部分；避免把邻近山坡误采成矩形白边。
      if (!(red > 175 && green > 160 && blue > 112)) return false;
      for (const dx of [-4, -2, 0, 2, 4]) for (const dy of [-4, -2, 0, 2, 4]) {
        if (motifColor(x + dx, y + dy)) return true;
      }
      return false;
    };
    for (let row = y0; row <= y1; row += 2) for (let col = x0; col <= x1; col += 2) {
      if (!visible(col, row)) continue;
      const u = (col - x0) / Math.max(1, x1 - x0), v = (row - y0) / Math.max(1, y1 - y0);
      const x = (u - .5) * sizeX, yy = (.5 - v) * sizeY;
      // 原画轮廓只决定龙凤的彩色外形；多层椭圆截面构成实体，侧面也有可见体积。
      const bulge = Math.max(0, Math.sin(u * Math.PI) * Math.sin(v * Math.PI));
      const depth = 1.05 + bulge * 1.15;
      const pixel = (row * width + col) * 4;
      const rgb = [pixels[pixel] / 225, pixels[pixel + 1] / 225, pixels[pixel + 2] / 225]
        .map(value => Math.min(1, value));
      for (const slice of [-1, -.55, 0, .55, 1]) {
        const shade = slice > .8 ? 1 : slice < -.8 ? .66 : .75 + (1 - Math.abs(slice)) * .15;
        const rib = Math.sin(u * Math.PI * 2.5 + v * Math.PI) * .12;
        push(p, c, x + rib * (1 - Math.abs(slice)), yy, depth * slice,
          rgb.map(value => value * shade));
      }
    }
    if (p.length) mount.add(cloud(p, c, { texture, size: .19, opacity: .98 }));
    mount.name = `立体${kind === 'dragon' ? '龙' : '凤'}·原画轮廓雕塑`;
    return mount;
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
    emblem.position.y = spec.height + (index === 2 ? 4.3 : 3.0);
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
          for (const side of [-1, 1]) push(petals, colors, x, y, side * (.16 + bulge * .48), tone);
        }
      }
      emblem.add(cloud(petals, colors, { texture, size: .27, opacity: .99 }));
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

  function wingedFigure(parent, center, color, texture, { bat = false, scale = 1 } = {}) {
    const figure = new THREE.Group();
    figure.position.set(...center);
    figure.scale.setScalar(scale);
    parent.add(figure);
    const bodyP = [], bodyC = [];
    for (let i = 0; i < 330; i++) {
      const t = i / 329;
      const a = i * 2.39996323;
      const r = .25 * Math.sqrt(Math.max(.02, 1 - (t * 2 - 1) ** 2));
      push(bodyP, bodyC, Math.cos(a) * r, (t - .5) * (bat ? 2.5 : 3.0), Math.sin(a) * r,
        i % 6 === 0 ? C.cream : color);
    }
    figure.add(cloud(bodyP, bodyC, { texture, size: .18, opacity: .95 }));
    const wings = [];
    for (const sign of [-1, 1]) {
      const wing = new THREE.Group();
      figure.add(wing);
      wings.push({ object: wing, sign });
      const p = [], c = [];
      const rows = dense ? 56 : 36, cols = dense ? 21 : 15;
      for (let i = 0; i < rows; i++) {
        const u = i / (rows - 1);
        const span = bat
          ? Math.max(.07, (u < .53 ? .20 + u * 2.65 : 1.60 - (u - .53) * 3.15))
            * (1 - .13 * Math.abs(Math.sin(u * Math.PI * 5)))
          : Math.max(.06, u < .42 ? .24 + u * 2.9 : 1.46 - (u - .42) * 2.35);
        for (let j = 0; j < cols; j++) {
          const v = j / (cols - 1) * 2 - 1;
          const x = sign * (.15 + u * (bat ? 3.8 : 4.3));
          const y = u * (bat ? .35 : .8) + v * span + (bat ? 0 : Math.abs(v) * u * .10);
          const z = Math.sin(u * Math.PI) * .72 * (1 - v * v) + u * .42 + v * v * .13;
          const outline = j === 0 || j === cols - 1 || i === rows - 1 || Math.abs(v) < .06;
          push(p, c, x, y, z, outline ? C.cream : bat && u > .63 ? C.cyan : color);
          if ((i + j) % 7 === 0) push(p, c, x, y, z - .28, color);
        }
      }
      wing.add(cloud(p, c, { texture, size: .20, opacity: .92 }));
    }
    if (!bat) for (const sign of [-1, 1]) curve(figure, t => [sign * (.05 + t * .32),
      1.3 + t * .65, .16 + Math.sin(t * Math.PI) * .18], 28, C.gold, texture, .17, .025);
    return wings;
  }

  function dragon(parent, x, y, z, texture) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    parent.add(group);
    const spine = t => [Math.sin(t * Math.PI * 3.1) * .94 - .32 + t * .6,
      (t - .5) * 6.1, Math.cos(t * Math.PI * 3.1) * .84];
    const p = [], c = [];
    const sections = dense ? 270 : 175, sides = dense ? 14 : 10;
    for (let i = 0; i < sections; i++) {
      const t = i / (sections - 1);
      const [cx, cy, cz] = spine(t);
      const radius = (.18 + Math.sin(t * Math.PI) * .25) * (t < .12 ? t / .12 : 1);
      for (let j = 0; j < sides; j++) {
        const a = j / sides * TAU;
        push(p, c, cx + Math.cos(a) * radius, cy + Math.sin(a * 2) * .045,
          cz + Math.sin(a) * radius, j < 2 || i % 11 === 0 ? C.cream : i % 5 ? C.teal : C.cyan);
      }
    }
    for (let k = 2; k < 19; k++) {
      const t = k / 20;
      const [cx, cy, cz] = spine(t);
      curve(group, u => [cx - .10 + u * (.3 + Math.sin(k * 2.2) * .13), cy + u * (.32 + t * .17),
        cz + .18 + Math.sin(u * Math.PI) * .18], 20, k % 3 ? C.cream : C.gold, texture, .21, .04);
    }
    for (const t of [.31, .58, .80]) {
      const [cx, cy, cz] = spine(t);
      for (const side of [-1, 1]) {
        curve(group, u => [cx + side * (.16 + u * .95), cy - u * .82,
          cz + .22 + Math.sin(u * Math.PI) * .34], 35, C.teal, texture, .22, .04);
        for (let claw = 0; claw < 3; claw++) curve(group, u => [cx + side * (1.0 + u * .42),
          cy - .83 - u * .23 + claw * .15, cz + .23 + claw * .12], 13, C.cream, texture, .19, .02);
      }
    }
    const [hx, hy, hz] = spine(1);
    for (let i = 0; i < (dense ? 480 : 260); i++) {
      const a = halton(i + 1, 2) * TAU, h = halton(i + 1, 3) * 2 - 1;
      const r = Math.sqrt(Math.max(0, 1 - h * h));
      push(p, c, hx + .28 + Math.cos(a) * r * .68, hy + h * .43,
        hz + Math.sin(a) * r * .39, i % 6 ? C.teal : C.cream);
    }
    group.add(cloud(p, c, { texture, size: .21, opacity: .98 }));
    // 头部前伸的吻、鹿角与眼点，让龙在侧面也有可辨认的结构。
    curve(group, u => [hx + .55 + u * 1.05, hy - .15 - Math.sin(u * Math.PI) * .19,
      hz + .1 + u * .15], 75, C.cream, texture, .26, .09);
    for (const side of [-1, 1]) curve(group, u => [hx + side * .35 + u * side * .45,
      hy + .33 + u * 1.18, hz + .12 + Math.sin(u * Math.PI) * .15], 52, C.gold, texture, .21, .05);
    group.add(cloud([hx + .62, hy + .12, hz + .42, hx + .62, hy + .12, hz - .42],
      [...C.cream, ...C.cream], { texture, size: .46, opacity: 1 }));
    return group;
  }

  function phoenix(parent, x, y, z, texture) {
    const bird = new THREE.Group();
    bird.position.set(x, y, z);
    parent.add(bird);
    const bodyP = [], bodyC = [];
    for (let i = 0; i < (dense ? 600 : 330); i++) {
      const h = halton(i + 1, 2) * 2 - 1, a = halton(i + 1, 3) * TAU;
      const r = Math.sqrt(Math.max(0, 1 - h * h));
      push(bodyP, bodyC, Math.cos(a) * r * .55, h * 1.55,
        Math.sin(a) * r * .52, i % 7 ? C.orange : C.cream);
    }
    bird.add(cloud(bodyP, bodyC, { texture, size: .22, opacity: .98 }));
    const wings = [];
    for (const sign of [-1, 1]) {
      const wing = new THREE.Group();
      bird.add(wing);
      wings.push({ object: wing, sign });
      const p = [], c = [];
      const rows = dense ? 62 : 42, cols = dense ? 19 : 13;
      for (let i = 0; i < rows; i++) {
        const u = i / (rows - 1);
        for (let j = 0; j < cols; j++) {
          const v = j / (cols - 1) * 2 - 1;
          const feather = Math.sin(u * Math.PI * 6) * .10;
          const x = sign * (.32 + u * 4.2);
          const y = .35 + u * 1.48 + v * (.14 + Math.sin(u * Math.PI) * .72) + feather;
          const z = .18 + Math.sin(u * Math.PI) * (1 - v * v) * 1.12 + v * .24;
          push(p, c, x, y, z, j < 2 || j > cols - 3 || i === rows - 1 ? C.cream : i % 7 ? C.orange : C.red);
          if ((i + j) % 4 === 0) push(p, c, x, y - .04, z - .36, C.red);
        }
      }
      wing.add(cloud(p, c, { texture, size: .23, opacity: .98 }));
    }
    for (let tail = 0; tail < 7; tail++) {
      curve(bird, t => [Math.sin(t * 2.2 + tail * .32) * (1 + t * 1.9) + tail * .11 - .35,
        -1.2 - t * 3.9, Math.sin(t * 2.7 + tail) * .8 + .3], dense ? 100 : 55,
      tail % 2 ? C.gold : C.red, texture, .20, .04, true);
    }
    curve(bird, t => [.12 + t * .15, 1.3 + t * .75, .05 + t * .22], 55, C.cream, texture, .23, .06);
    curve(bird, t => [.25 + t * .55, 2.03 - t * .21, .2 + t * .14], 35, C.gold, texture, .26, .07);
    for (let plume = -1; plume <= 1; plume++) curve(bird, t => [.13 + plume * t * .32,
      2.00 + t * (1.1 + plume * .11), .19 + Math.sin(t * Math.PI) * .2], 38, C.red, texture, .18, .04);
    return wings;
  }

  function buildTotem(group, spec, index, texture) {
    const totem = new THREE.Group();
    group.add(totem);
    const wings = [];
    const actors = [];
    const anchor = (angle, y, distance = 3.2) => {
      const mount = new THREE.Group();
      const r = spec.radius + distance;
      mount.position.set(Math.sin(angle) * r, y, Math.cos(angle) * r);
      mount.rotation.y = angle;
      totem.add(mount);
      actors.push({ mount, baseY: y, angle });
      return mount;
    };
    if (index === 1) {
      wings.push(...wingedFigure(anchor(-.94, spec.height * .78, -1.2), [0, 0, 0], C.red, texture, { scale: 1.0 }));
      wings.push(...wingedFigure(anchor(.94, spec.height * .78, -1.2), [0, 0, 0], C.red, texture, { scale: 1.0 }));
      crown(totem, spec, index, texture);
      for (let level = 0; level < 6; level++) {
        curve(totem, t => {
          const a = t * TAU + level * .22;
          const h = .22 + level * .105;
          const r = radiusAt(spec, index, h) + .42;
          return [Math.sin(a) * r, h * spec.height + Math.sin(a * 12) * .11, Math.cos(a) * r];
        }, dense ? 350 : 170, level % 2 ? C.gold : C.cream, texture, .20, .03);
      }
    } else if (index === 2) {
      dragon(anchor(-.92, spec.height * .71, 3.8), 0, 0, 0, texture);
      const farDragon = dragon(anchor(2.3, spec.height * .68, 3.7), 0, 0, 0, texture);
      farDragon.scale.setScalar(.73);
      wings.push(...phoenix(anchor(.94, spec.height * .71, 3.8), 0, 0, 0, texture));
      const farPhoenix = anchor(-2.3, spec.height * .69, 3.7);
      farPhoenix.scale.setScalar(.75);
      wings.push(...phoenix(farPhoenix, 0, 0, 0, texture));
      crown(totem, spec, index, texture);
    } else if (index === 3) {
      for (const [a, y, s] of [[-.8, spec.height * .98, .8], [.8, spec.height * .98, .8],
        [-2.4, spec.height * .43, .72], [2.4, spec.height * .43, .72]]) {
        wings.push(...wingedFigure(anchor(a, y), [0, 0, 0], C.orange, texture, { scale: s }));
      }
      for (const side of [-1, 1]) curve(totem, t => {
        const h = 1 - t;
        const a = side * .32 + Math.sin(t * 18) * .085;
        const r = radiusAt(spec, index, h) + .5;
        return [Math.sin(a) * r, h * spec.height, Math.cos(a) * r];
      }, dense ? 460 : 220, C.red, texture, .29, .11, true);
      crown(totem, spec, index, texture);
    } else if (index === 4) {
      for (const [a, y, s] of [[-.8, spec.height * .85, .69], [.8, spec.height * .85, .69],
        [-2.3, spec.height * .39, .62], [2.3, spec.height * .39, .62]]) {
        wings.push(...wingedFigure(anchor(a, y), [0, 0, 0], C.teal, texture, { bat: true, scale: s }));
      }
      crown(totem, spec, index, texture);
      for (let level = 0; level < 7; level++) curve(totem, t => {
        const a = t * TAU;
        const h = .13 + level * .10;
        const r = radiusAt(spec, index, h) + .32;
        return [Math.sin(a) * r, h * spec.height + Math.abs(Math.sin(a * 8)) * .11,
          Math.cos(a) * r];
      }, dense ? 360 : 180, level % 2 ? C.cream : C.teal, texture, .18, .035);
    }
    return { totem, wings, actors };
  }

  SPECS.forEach((spec, index) => {
    const group = new THREE.Group();
    group.name = spec.name;
    group.position.set(spec.x, terrainHeight(spec.x, spec.z) - .4, spec.z);
    group.scale.setScalar(MONUMENT_SCALE);
    group.userData = { kind: 'volcano', width: spec.radius * 2 * MONUMENT_SCALE, height: spec.height * MONUMENT_SCALE, note: spec.note, index,
      baseY: group.position.y };
    scene.add(group);
    const texture = textureFor(spec.glyph);
    const shellMotion = shell(group, spec, index, texture);
    const slopeMotion = index === 0 ? null : sculptedSlope(group, spec, index, texture);
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
    const referenceRelief = sculptFromReference(group, spec, index, texture, source => {
      // 原画浮雕给颜色与形态，程序纹带补足环山的真实三维走势和持续旋转。
      if (index !== 0) shellMotion.bands.visible = false;
      if (index === 2 && totemMotion) {
        const fallback = [...totemMotion.actors];
        const forms = [
          { crop: [36, 90, 520, 940], angle: -.92, kind: 'dragon', scale: 1 },
          { crop: [1010, 92, 1510, 945], angle: .94, kind: 'phoenix', scale: 1 }
        ];
        const extruded = forms.map(form => sculptedFigureFromArt(totemMotion, spec, texture, source,
          form.crop, form.angle, spec.height * .69, form.scale, form.kind));
        if (extruded.every(form => form.children.length)) fallback.forEach(({ mount }, i) => {
          // 留下内部立体骨架，侧视时龙凤不会退化为一张剪影；远侧重复装饰隐藏。
          mount.visible = i === 0 || i === 2;
          if (mount.visible) mount.scale.setScalar(.68);
        });
      }
    });
    peaks.push(group);
    group.userData.update = (seconds, camera) => {
      group.position.y = group.userData.baseY + Math.sin(seconds * .79 + index * 1.3) * .10;
      shellMotion.bands.rotation.y = seconds * (.09 + index * .013);
      shellMotion.orbit.rotation.y = -seconds * (.20 + index * .018);
      sculpture?.update(seconds, 1);
      if (sculpture) sculpture.group.rotation.y = Math.sin(seconds * .11) * .36;
      if (slopeMotion) slopeMotion.rotation.y = seconds * (.09 + index * .008);
      referenceRelief.rotation.y = seconds * (.055 + index * .009);
      if (totemMotion) {
        if (camera && seconds - lastOrnamentFade > .12) {
          const distance = Math.hypot(camera.position.x - group.position.x, camera.position.z - group.position.z);
          const near = 90, far = 210;
          const t = Math.max(0, Math.min(1, (distance - near) / (far - near)));
          const fade = 1 - (t * t * (3 - 2 * t)) * .58;
          totemMotion.totem.traverse(object => {
            const material = object.material;
            if (!material || !('opacity' in material)) return;
            if (!ornamentOpacities.has(material)) ornamentOpacities.set(material, material.opacity);
            material.opacity = ornamentOpacities.get(material) * fade;
          });
          lastOrnamentFade = seconds;
        }
        totemMotion.totem.position.y = Math.sin(seconds * .78 + index) * .15;
        totemMotion.totem.rotation.y = index === 2 ? 0 : Math.sin(seconds * (.23 + index * .025)) * .16;
        totemMotion.actors.forEach(({ mount, baseY, angle }, i) => {
          mount.position.y = baseY + Math.sin(seconds * (1.14 + index * .07) + i * 1.8) * .27;
          mount.rotation.z = Math.sin(seconds * 1.53 + angle * 2) * .07;
        });
        totemMotion.wings.forEach(({ object, sign }, i) => {
          object.rotation.y = sign * (Math.sin(seconds * 2.0 + Math.floor(i / 2) * .8) * .22);
        });
      }
    };
  });
  return { peaks, pointCount, update(time, camera) { peaks.forEach(peak => peak.userData.update(time, camera)); },
    focus(selected) { peaks.forEach(peak => { peak.visible = !selected || peak === selected; }); },
    setVisible(visible) { peaks.forEach(peak => { peak.visible = visible; }); } };
}
