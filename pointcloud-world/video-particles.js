import * as THREE from '../lib/three/three.module.js';

// HTMLVideoElement 只用作本地解码器，从不加入画面；每一帧的亮度/色彩被重建为微纹样点。
export function createVideoParticlePlayer(scene, atlas) {
  const width = 384, height = 216, count = width * height;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      const n = (row * width + col) * 3;
      const u = col / (width - 1) - 0.5;
      const v = 0.5 - row / (height - 1);
      positions[n] = u;
      positions[n + 1] = v;
      positions[n + 2] = Math.cos(u * Math.PI) * 0.12;
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const colorAttribute = new THREE.BufferAttribute(colors, 3);
  colorAttribute.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('color', colorAttribute);
  geometry.computeBoundingSphere();
  const material = new THREE.ShaderMaterial({
    vertexColors: true, transparent: true, depthTest: false, depthWrite: false,
    uniforms: { uAtlas: { value: atlas }, uGlyph: { value: 2 }, uMotifMix: { value: 0 }, uTime: { value: 0 } },
    vertexShader: `
      varying vec3 vColor;
      varying float vLight;
      uniform float uTime;
      void main() {
        vColor = color;
        vLight = max(max(color.r, color.g), color.b);
        vec3 p = position;
        // The source frame supplies the motion; no synthetic jitter is added.
        vec4 view = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * view;
        gl_PointSize = clamp(31.0 / max(1.0, -view.z), .9, 3.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uAtlas;
      uniform float uGlyph;
      uniform float uMotifMix;
      varying vec3 vColor;
      varying float vLight;
      void main() {
        if (vLight < .105) discard;
        vec2 uv = (vec2(mod(uGlyph, 4.0), floor(uGlyph / 4.0)) + vec2(.04) + gl_PointCoord * .92) / vec2(4.0, 2.0);
        float motif = texture2D(uAtlas, uv).a;
        float circle = 1.0 - smoothstep(.25, .49, length(gl_PointCoord - vec2(.5)));
        float shape = mix(circle, max(motif, circle * .38), uMotifMix);
        if (shape < .14) discard;
        vec3 bright = vColor;
        gl_FragColor = vec4(bright, shape);
      }
    `
  });
  const points = new THREE.Points(geometry, material);
  points.name = 'video-decoded-motif-particles';
  points.visible = false;
  points.frustumCulled = false;
  points.renderOrder = 30;
  scene.add(points);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.loop = true;
  video.preload = 'auto';
  const surface = document.createElement('canvas');
  surface.width = width; surface.height = height;
  const context = surface.getContext('2d', { willReadFrequently: true });
  let lastSample = -1;
  let request = 0;
  let activeForm = null;
  let pendingLoad = null;
  let trackedCrop = null;

  function stop() {
    request += 1;
    pendingLoad?.abort();
    pendingLoad = null;
    video.pause();
    video.removeAttribute('src');
    video.load();
    points.visible = false;
    activeForm = null;
    trackedCrop = null;
    colors.fill(0);
    colorAttribute.needsUpdate = true;
  }

  async function play(form, file) {
    stop();
    const token = request;
    activeForm = form;
    material.uniforms.uGlyph.value = form.geometry.getAttribute('glyph').getX(0);
    points.position.copy(form.position);
    points.scale.set(form.userData.width, form.userData.width * 9 / 16, 1);
    video.src = `./reference-frames/videos/${file}`;
    try {
      const load = new AbortController();
      pendingLoad = load;
      await new Promise((resolve, reject) => {
        if (video.readyState >= 2) { resolve(); return; }
        video.addEventListener('loadeddata', resolve, { once: true, signal: load.signal });
        video.addEventListener('error', () => reject(new Error('视频帧无法解码')), { once: true, signal: load.signal });
        load.signal.addEventListener('abort', () => reject(new DOMException('视频已切换', 'AbortError')), { once: true });
      });
      if (pendingLoad === load) pendingLoad = null;
      if (token !== request) return false;
      video.currentTime = 0;
      await video.play();
      if (token !== request) return false;
      points.visible = true;
      form.visible = false;
      lastSample = -1;
      return true;
    } catch (error) {
      if (token === request) stop();
      if (error.name !== 'AbortError') console.warn(`${form.name} 动态粒子播放失败`, error);
      return false;
    }
  }

  function update(time) {
    if (!points.visible || !activeForm || video.readyState < 2) return;
    material.uniforms.uTime.value = time;
    points.position.copy(activeForm.position);
    points.rotation.copy(activeForm.rotation);
    if (video.currentTime - lastSample < 1 / 24 && video.currentTime >= lastSample) return;
    lastSample = video.currentTime;
    const crop = activeForm.userData.videoCrop || [0, 0, 1, 1];
    context.drawImage(video, crop[0] * video.videoWidth, crop[1] * video.videoHeight,
      crop[2] * video.videoWidth, crop[3] * video.videoHeight, 0, 0, width, height);
    const image = context.getImageData(0, 0, width, height).data;
    if (activeForm.name === '骆驼行进') {
      let minX = width, minY = height, maxX = 0, maxY = 0, visible = 0;
      for (let y = 2; y < height - 4; y += 2) for (let x = 2; x < width - 2; x += 2) {
        const k = (y * width + x) * 4;
        if (Math.max(image[k], image[k + 1], image[k + 2]) < 45) continue;
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        visible += 1;
      }
      if (visible > 38) {
        const centerX = (minX + maxX) / (2 * width);
        const centerY = (minY + maxY) / (2 * height);
        const span = Math.min(1, Math.max(.27, (maxX - minX) / width * 1.22,
          (maxY - minY) / height * 1.22));
        const measured = { x: centerX, y: centerY, size: span };
        if (!trackedCrop) trackedCrop = measured;
        else for (const key of ['x', 'y', 'size']) trackedCrop[key] += (measured[key] - trackedCrop[key]) * .24;
        const sx = Math.max(0, Math.min(1 - trackedCrop.size, trackedCrop.x - trackedCrop.size * .5));
        const sy = Math.max(0, Math.min(1 - trackedCrop.size, trackedCrop.y - trackedCrop.size * .5));
        context.drawImage(video, sx * video.videoWidth, sy * video.videoHeight,
          trackedCrop.size * video.videoWidth, trackedCrop.size * video.videoHeight, 0, 0, width, height);
        const zoomed = context.getImageData(0, 0, width, height).data;
        image.set(zoomed);
      }
    }
    for (let n = 0; n < count; n += 1) {
      const from = n * 4, to = n * 3;
      const light = Math.max(image[from], image[from + 1], image[from + 2]);
      const fade = light < 24 ? 0 : 1;
      // 短时明暗交叉混合，保留动作连续性，但不会把原视频铺成一张贴图。
      colors[to] = image[from] / 255 * fade;
      colors[to + 1] = image[from + 1] / 255 * fade;
      colors[to + 2] = image[from + 2] / 255 * fade;
    }
    colorAttribute.needsUpdate = true;
  }
  return { play, stop, update, setMotifs(value) { material.uniforms.uMotifMix.value = 0; },
    get playing() { return points.visible && !video.paused; }, get currentTime() { return video.currentTime; } };
}
