import * as THREE from '../lib/three/three.module.js';

// 用户给出的五畜图与七段视频仅用来读取轮廓、颜色和关键姿态；场景中不渲染图片平面或视频平面。
const animals = [
  { name: '蒙古马', file: 'horse.jpg', video: 'horse.mp4', crop: [0.02, 0.17, 0.61, 0.63], x: -5.4, z: 7, width: 8.6, height: 6.1, glyph: 2, head: [.18, .25, .22, .26], gait: 3.1, stride: .22, nod: .055 },
  { name: '蒙古牛', file: 'cow.jpg', video: 'cow.mp4', crop: [0.02, 0.06, 0.74, 0.55], x: 5.1, z: -9, width: 8.4, height: 5.6, glyph: 3, head: [.18, .41, .26, .34], gait: 1.15, stride: .075, nod: .25 },
  { name: '绵羊', file: 'sheep.jpg', video: 'sheep.mp4', crop: [0.04, 0.09, 0.60, 0.63], x: -5.1, z: -26, width: 8.0, height: 5.6, glyph: 5, head: [.18, .29, .23, .28], gait: 1.75, stride: .11, nod: .075 },
  { name: '山羊', file: 'goat.jpg', video: 'goat.mp4', crop: [0.28, 0.01, 0.48, 0.62], x: 5.5, z: -43, width: 6.8, height: 6.0, glyph: 6, head: [.29, .22, .25, .30], gait: 2.25, stride: .16, nod: .09 },
  { name: '骆驼', file: 'camel.jpg', video: 'camel.mp4', crop: [0.04, 0.05, 0.64, 0.61], x: -5.5, z: -63, width: 9.1, height: 6.1, glyph: 4, head: [.18, .22, .23, .29], gait: 1.35, stride: .095, nod: .10 }
];

// 依据场景草地留白补充的远景牧群，复用原物种点阵几何，保持五个主特写入口不变。
const ambientHerd = [
  { source: '绵羊', name: '草地牧群 · 绵羊 01', x: -18, z: 34, scale: .68, yaw: .62, tint: [1.10, 1.04, .91] },
  { source: '蒙古牛', name: '草地牧群 · 蒙古牛 01', x: 18, z: 22, scale: .70, yaw: -.95, tint: [.91, 1.05, 1.12] },
  { source: '绵羊', name: '草地牧群 · 绵羊 02', x: -19, z: 5, scale: .66, yaw: 1.15, tint: [1.12, .97, .84] },
  { source: '山羊', name: '草地牧群 · 山羊 01', x: 19, z: -12, scale: .64, yaw: -.38, tint: [.91, 1.10, .96] },
  { source: '骆驼', name: '草地牧群 · 骆驼 01', x: -19, z: -30, scale: .68, yaw: -.72, tint: [1.13, 1.00, .84] },
  { source: '蒙古牛', name: '草地牧群 · 蒙古牛 02', x: 19, z: -47, scale: .70, yaw: 1.05, tint: [.91, .99, 1.12] },
  { source: '绵羊', name: '草地牧群 · 绵羊 03', x: -19, z: -68, scale: .66, yaw: .18, tint: [1.08, 1.10, .91] },
  { source: '蒙古马', name: '草地牧群 · 蒙古马 01', x: 19, z: -78, scale: .68, yaw: -1.30, tint: [1.14, .99, .86] }
];

const motionClips = [
  { name: '花形与幼虫', key: 'caterpillar-flower', x: 10, y: 10.0, z: 9, width: 6.3, glyph: 7, speed: 0.52 },
  { name: '骆驼行进', key: 'camel-motion', video: 'camel-motion.mp4', x: 10, y: 7.5, z: -67, width: 7.7, glyph: 4, speed: 0.57 }
];

// 主航线每段只保留一个偏侧的纹样锚点；重复太阳或火山主题的图只在定位列表中供单独观看。
const emblems = [
  { name: '莲焰纹样', file: 'lotus-flame.jpg', kind: 'emblem', x: 29, y: 17, z: -8, width: 10.8, height: 10.8, glyph: 7, ambientHidden: true },
  { name: '莲心纹样', file: 'lotus-sun.jpg', kind: 'emblem', x: -27, y: 27, z: -25, width: 10.3, height: 10.3, glyph: 7, ambientHidden: true },
  { name: '蝴蝶纹样', file: 'butterfly-emblem.jpg', kind: 'emblem', x: -54, y: 25, z: -78, width: 12.2, height: 12.2, glyph: 1 },
  { name: '夜翼纹样', file: 'bat-emblem.jpg', kind: 'emblem', x: 55, y: 30, z: -115, width: 11.4, height: 11.4, glyph: 0 },
  { name: '龙凤汇聚纹样', file: 'dragon-phoenix-emblem.jpg', kind: 'emblem', x: 28, y: 33, z: -98, width: 13.6, height: 13.6, glyph: 1, ambientHidden: true }
];

const sun = { name: '纹样太阳', file: 'sun.jpg', kind: 'sun', x: 3, y: 68, z: -215, width: 24, height: 24, glyph: 1 };

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`参考帧读取失败：${url}`));
    image.src = url;
  });
}

function pixels(image, crop, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, crop[0] * image.width, crop[1] * image.height,
    crop[2] * image.width, crop[3] * image.height, 0, 0, width, height);
  return context.getImageData(0, 0, width, height).data;
}

function luminance(data, index) {
  const k = index * 4;
  return Math.max(data[k], data[k + 1], data[k + 2]) / 255;
}

function colorsAt(data, index) {
  const k = index * 4;
  const gate = luminance(data, index) < 0.105 ? 0 : 1;
  return [data[k] / 255 * gate, data[k + 1] / 255 * gate, data[k + 2] / 255 * gate];
}

function makeMaterial(atlas, glyphMix) {
  return new THREE.ShaderMaterial({
    transparent: true, depthTest: true, depthWrite: true,
    blending: THREE.NormalBlending,
    uniforms: { uTime: { value: 0 }, uAtlas: { value: atlas }, uMotifMix: { value: glyphMix }, uRate: { value: 0.5 }, uOffset: { value: 0 }, uAnimal: { value: 0 }, uEmblem: { value: 0 }, uFocus: { value: 0 }, uFocusStart: { value: -100 },
      uGaze: { value: 0 }, uGaitRate: { value: 1 }, uStride: { value: 0 }, uNod: { value: 0 }, uTint: { value: new THREE.Vector3(1, 1, 1) } },
    vertexShader: `
      attribute vec3 color0;
      attribute vec3 color1;
      attribute vec3 color2;
      attribute float glyph;
      attribute float phase;
      attribute float headWeight;
      varying vec3 vColor;
      varying float vGlyph;
      varying float vLight;
      uniform float uTime;
      uniform float uRate;
      uniform float uOffset;
      uniform float uAnimal;
      uniform float uEmblem;
      uniform float uFocus;
      uniform float uFocusStart;
      uniform float uGaze;
      uniform float uGaitRate;
      uniform float uStride;
      uniform float uNod;
      uniform vec3 uTint;
      void main() {
        float cycle = mod(uTime * uRate + uOffset, 3.0);
        vec3 ca = cycle < 1.0 ? color0 : cycle < 2.0 ? color1 : color2;
        vec3 cb = cycle < 1.0 ? color1 : cycle < 2.0 ? color2 : color0;
        float blend = smoothstep(0.0, 1.0, fract(cycle));
        vColor = mix(ca, cb, blend) * uTint;
        vLight = max(max(vColor.r, vColor.g), vColor.b);
        vGlyph = glyph;
        vec3 p = position;
        p.y += sin(uTime * 1.13 + phase * 10.0) * 0.075;
        p.z += sin(uTime * 0.73 + phase * 7.0) * 0.045;
        float focusAge = max(0.0, uTime - uFocusStart);
        float entrance = uFocus > 0.5 ? 1.0 - smoothstep(0.0, 1.35, focusAge) : 0.0;
        p += vec3(sin(phase * 31.0), cos(phase * 47.0), sin(phase * 59.0)) * entrance * 2.8;
        if (uAnimal > 0.5) {
          float clock = uTime * uGaitRate + uOffset;
          float lower = 1.0 - smoothstep(-0.48, -0.08, position.y);
          float oppositeLegs = step(0.0, position.x) * 3.14159;
          float stepCycle = sin(clock + oppositeLegs);
          float ambient = mix(1.0, 0.35, uFocus);
          p.x += lower * stepCycle * uStride * ambient;
          p.y += lower * max(0.0, stepCycle) * uStride * 0.36 * ambient;
          p.y += sin(clock * 1.4) * 0.035 * ambient;
          p.y -= headWeight * (0.5 + 0.5 * sin(clock * 0.78)) * uNod * ambient;
          // 掠过时只让头部微微靠近镜头，身体轮廓仍保持原画的辨识度。
          p.x += headWeight * uGaze * 0.11;
          p.y += headWeight * uGaze * 0.045;
          p.z += headWeight * uGaze * 0.38;
        } else if (uFocus > 0.5) {
          p.z += sin(uTime * 1.8 + phase * 12.0) * 0.16;
        }
        vec4 view = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * view;
        gl_PointSize = clamp((104.0 + uFocus * 10.0) / max(1.0, -view.z), 2.0, uEmblem > 0.5 ? 6.2 : uAnimal > 0.5 ? 8.5 : 13.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uAtlas;
      uniform float uMotifMix;
      uniform float uFocus;
      varying vec3 vColor;
      varying float vGlyph;
      varying float vLight;
      void main() {
        if (vLight < 0.10) discard;
        float circle = 1.0 - smoothstep(0.28, 0.49, length(gl_PointCoord - vec2(0.5)));
        vec2 uv = (vec2(mod(vGlyph, 4.0), floor(vGlyph / 4.0)) + vec2(0.04) + gl_PointCoord * 0.92) / vec2(4.0, 2.0);
        float motif = texture2D(uAtlas, uv).a;
        float shape = max(motif * uMotifMix, circle * 0.48);
        if (shape < 0.15) discard;
        vec3 luminous = pow(vColor, vec3(uFocus > 0.5 ? 0.42 : 0.53));
        gl_FragColor = vec4(luminous * (0.87 + shape * 0.34 + uFocus * 0.28), shape * 0.98);
      }
    `
  });
}

function makeForm(images, options, atlas, terrainHeight) {
  const animal = !!options.file && options.kind !== 'sun' && options.kind !== 'emblem';
  const width = options.kind === 'sun' ? 176 : animal ? 174 : 160;
  const height = options.kind === 'sun' || options.kind === 'emblem' ? 160 : animal ? 124 : 90;
  const crop = options.crop || [0, 0, 1, 1];
  const frames = images.map(image => pixels(image, crop, width, height));
  const pos = [], c0 = [], c1 = [], c2 = [], glyph = [], phase = [], headWeight = [];
  const step = animal || options.kind === 'emblem' ? 1 : 2;
  for (let row = 1; row < height - 1; row += step) {
    for (let col = 1; col < width - 1; col += step) {
      const n = row * width + col;
      const light = Math.max(...frames.map(frame => luminance(frame, n)));
      if (light < 0.15) continue;
      const u = col / width - 0.5;
      const v = 1 - row / height;
      const size = options.width;
      const tall = options.height || size * 0.56;
      // 每个样本拥有曲率、色彩起伏和厚度，而不是全体落在同一张平面上。
      const depth = Math.sin((u + 0.5) * Math.PI) * (animal ? 0.85 : options.kind === 'sun' ? 1.6 : 0.52)
        + Math.sin(col * 1.7 + row * 0.87) * (animal ? 0.34 : 0.19)
        + (light - 0.5) * 0.46;
      pos.push(u * size, (v - 0.5) * tall, depth);
      c0.push(...colorsAt(frames[0], n));
      c1.push(...colorsAt(frames[Math.min(1, frames.length - 1)], n));
      c2.push(...colorsAt(frames[Math.min(2, frames.length - 1)], n));
      glyph.push(options.glyph);
      phase.push((col * 0.618 + row * 0.382) % 1);
      if (animal) {
        const [hx, hy, hrx, hry] = options.head;
        const distance = Math.hypot((col / width - hx) / hrx, (row / height - hy) / hry);
        headWeight.push(Math.pow(Math.max(0, 1 - distance), 1.35));
      } else headWeight.push(0);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geometry.setAttribute('color0', new THREE.Float32BufferAttribute(c0, 3));
  geometry.setAttribute('color1', new THREE.Float32BufferAttribute(c1, 3));
  geometry.setAttribute('color2', new THREE.Float32BufferAttribute(c2, 3));
  geometry.setAttribute('glyph', new THREE.Float32BufferAttribute(glyph, 1));
  geometry.setAttribute('phase', new THREE.Float32BufferAttribute(phase, 1));
  geometry.setAttribute('headWeight', new THREE.Float32BufferAttribute(headWeight, 1));
  geometry.computeBoundingSphere();
  const material = makeMaterial(atlas, 1);
  material.uniforms.uRate.value = animal || options.kind === 'sun' || options.kind === 'emblem' ? 0 : (options.speed || 0);
  material.uniforms.uAnimal.value = animal ? 1 : 0;
  material.uniforms.uEmblem.value = options.kind === 'emblem' ? 1 : 0;
  material.uniforms.uOffset.value = (options.x + options.z + 150) * 0.13;
  if (animal) {
    material.uniforms.uGaitRate.value = options.gait;
    material.uniforms.uStride.value = options.stride;
    material.uniforms.uNod.value = options.nod;
  }
  const points = new THREE.Points(geometry, material);
  points.name = options.name;
  points.position.set(options.x, animal ? terrainHeight(options.x, options.z) + (options.height || options.width * 0.56) * 0.5 + 0.15 : options.y, options.z);
  points.rotation.y = animal ? (options.x > 0 ? -0.22 : 0.22) : (options.x > 0 ? -0.15 : 0.15);
  points.userData.baseY = points.position.y;
  points.userData.baseX = points.position.x;
  points.userData.animal = animal;
  points.userData.kind = options.kind || (animal ? 'animal' : 'motion');
  points.userData.video = options.video || null;
  points.userData.videoCrop = options.videoCrop || null;
  points.userData.width = options.width;
  points.userData.height = options.height || options.width * 0.56;
  points.userData.order = options.order || 0;
  points.userData.ambientHidden = !!options.ambientHidden;
  points.userData.baseRotationY = points.rotation.y;
  points.userData.wasNearby = false;
  points.userData.reactionStart = -100;
  points.userData.lastUpdate = 0;
  points.visible = !options.ambientHidden;
  points.frustumCulled = false;
  return points;
}

export async function installLivingMotifs(scene, terrainHeight, atlas) {
  const group = new THREE.Group();
  group.name = 'user-reference-particle-forms';
  scene.add(group);
  const definitions = [
    ...animals.map(item => ({ ...item, urls: [`./reference-frames/${item.file}`] })),
    // 骆驼原片大幅拉远，三张相隔很远的关键帧会把形体撕碎；常驻形体先保持清晰，近看时播放完整视频粒子。
    ...motionClips.map(item => ({ ...item, urls: (item.key === 'camel-motion' ? [0, 0, 0] : [0, 1, 2])
      .map(n => `./reference-frames/${item.key}-${n}.jpg`), ambientHidden: true })),
    ...emblems.map(item => ({ ...item, urls: [`./reference-frames/${item.file}`] })),
    { ...sun, urls: ['./reference-frames/sun.jpg'] }
  ];
  const settled = await Promise.allSettled(definitions.map(async (def, order) => {
    const images = await Promise.all(def.urls.map(loadImage));
    return makeForm(images, { ...def, order }, atlas, terrainHeight);
  }));
  const failed = [];
  settled.forEach((item, index) => {
    if (item.status === 'fulfilled') group.add(item.value);
    else failed.push(`${definitions[index].name}: ${item.reason.message}`);
  });
  const sourceForms = new Map(group.children.filter(form => form.userData.animal).map(form => [form.name, form]));
  ambientHerd.forEach((placement, index) => {
    const source = sourceForms.get(placement.source);
    if (!source) return;
    const form = new THREE.Points(source.geometry, source.material.clone());
    form.name = placement.name;
    form.userData = { ...source.userData, ambientPlacement: true, order: source.userData.order + index * .37,
      width: source.userData.width * placement.scale, height: source.userData.height * placement.scale };
    form.material.uniforms.uOffset.value += index * .83;
    form.material.uniforms.uTint.value.set(...placement.tint);
    form.scale.setScalar(placement.scale);
    form.position.set(placement.x, terrainHeight(placement.x, placement.z) + form.userData.height * .5 + .15, placement.z);
    form.rotation.y = placement.yaw;
    form.userData.baseX = placement.x;
    form.userData.baseY = form.position.y;
    form.userData.baseRotationY = form.rotation.y;
    form.userData.wasNearby = false;
    form.userData.reactionStart = -100;
    form.userData.lastUpdate = 0;
    form.frustumCulled = false;
    group.add(form);
  });
  const sunForm = group.children.find(object => object.userData.kind === 'sun');
  if (sunForm) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const context = canvas.getContext('2d');
    const glow = context.createRadialGradient(64, 64, 4, 64, 64, 64);
    glow.addColorStop(0, 'rgba(255,213,113,.42)');
    glow.addColorStop(.36, 'rgba(255,131,54,.27)');
    glow.addColorStop(.7, 'rgba(40,211,231,.10)');
    glow.addColorStop(1, 'rgba(40,211,231,0)');
    context.fillStyle = glow;
    context.fillRect(0, 0, 128, 128);
    const texture = new THREE.CanvasTexture(canvas);
    for (const [size, opacity, depth] of [[29, .84, -1.4], [40, .54, -2.2]]) {
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, opacity,
        blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }));
      halo.position.z = depth;
      halo.scale.set(size, size, 1);
      halo.userData.baseScale = size;
      sunForm.add(halo);
    }
  }
  if (failed.length) console.warn('部分参考粒子形体未能载入', failed);
  const viewDirection = new THREE.Vector3();
  const toForm = new THREE.Vector3();
  return {
    group,
    count: group.children.reduce((sum, object) => sum + object.geometry.attributes.position.count, 0),
    loaded: group.children.map(object => object.name),
    failed,
    update(time, camera, allowReaction = true) {
      if (camera) camera.getWorldDirection(viewDirection);
      for (const object of group.children) {
        const order = object.userData.order;
        object.material.uniforms.uTime.value = time;
        const isSun = object.userData.kind === 'sun';
        object.position.y = object.userData.baseY + Math.sin(time * (isSun ? 0.18 : object.userData.animal ? 1.3 : 0.78) + order * 1.8) * (isSun ? 0.16 : object.userData.animal ? 0.09 : 0.28);
        object.position.x = object.userData.baseX + Math.sin(time * 0.37 + order * 2.1) * (isSun ? 0.04 : object.userData.animal ? 0.05 : 0.16);
        if (isSun) object.rotation.z += 0.00035;
        else if (object.userData.kind === 'emblem') {
          object.rotation.y = object.userData.baseRotationY + Math.sin(time * .43 + order) * .08;
          object.rotation.z = Math.sin(time * .62 + order * .7) * .045;
        } else if (object.userData.animal) {
          const data = object.userData;
          let gaze = 0;
          if (camera && allowReaction && group.visible && object.visible) {
            toForm.subVectors(object.position, camera.position);
            const distance = toForm.length();
            const inSight = distance > 0 && viewDirection.dot(toForm.multiplyScalar(1 / distance)) > .38;
            const nearby = distance < 20 && inSight;
            if (nearby && !data.wasNearby && time - data.reactionStart > 7.5) data.reactionStart = time;
            data.wasNearby = nearby;
            const age = time - data.reactionStart;
            if (age >= 0 && age < 2.35) {
              const rise = Math.min(1, age / .48);
              const fall = Math.max(0, Math.min(1, (age - 1.28) / 1.07));
              gaze = rise * rise * (3 - 2 * rise) * (1 - fall * fall * (3 - 2 * fall));
            }
          } else data.wasNearby = false;
          object.material.uniforms.uGaze.value = gaze;
          const desiredYaw = camera ? Math.atan2(camera.position.x - object.position.x,
            camera.position.z - object.position.z) : data.baseRotationY;
          const towardCamera = Math.max(-.33, Math.min(.33, desiredYaw - data.baseRotationY));
          const targetYaw = data.baseRotationY + towardCamera * gaze;
          const delta = Math.max(0, Math.min(.08, time - data.lastUpdate));
          object.rotation.y += (targetYaw - object.rotation.y) * Math.min(1, delta * 6);
          data.lastUpdate = time;
        } else object.rotation.y += .0023;
        if (isSun) object.children.forEach((halo, index) => {
          const size = halo.userData.baseScale * (1 + Math.sin(time * 1.15 + index) * .055);
          halo.scale.set(size, size, 1);
        });
      }
    },
    focus(object, time) {
      for (const form of group.children) {
        form.visible = object ? form === object : !form.userData.ambientHidden;
        form.material.depthTest = form !== object;
        form.material.depthWrite = form !== object;
        form.renderOrder = form === object ? 20 : 0;
        form.material.uniforms.uFocus.value = form === object ? 1 : 0;
        if (form === object) form.material.uniforms.uFocusStart.value = time;
      }
    },
    setMotifs(enabled) {
      group.visible = enabled;
    },
    getAnimalStates() {
      return group.children.filter(form => form.userData.animal && !form.userData.ambientPlacement).map(form => ({
        name: form.name, gaze: form.material.uniforms.uGaze.value,
        reactionStart: form.userData.reactionStart, visible: form.visible
      }));
    }
  };
}
