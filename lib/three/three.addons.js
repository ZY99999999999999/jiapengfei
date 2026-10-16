/**
 * Three.js Addons - 传统 script 标签版本
 * 包含: Pass, FullScreenQuad, CopyShader, ShaderPass, MaskPass, ClearMaskPass,
 *       RenderPass, LuminosityHighPassShader, EffectComposer, UnrealBloomPass
 * 所有类挂载到全局 THREE 对象上
 */
(function() {

// ============ Pass & FullScreenQuad ============
const _camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

class FullscreenTriangleGeometry extends THREE.BufferGeometry {
  constructor() {
    super();
    this.setAttribute('position', new THREE.Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3));
    this.setAttribute('uv', new THREE.Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2));
  }
}
const _geometry = new FullscreenTriangleGeometry();

class Pass {
  constructor() {
    this.isPass = true;
    this.enabled = true;
    this.needsSwap = true;
    this.clear = false;
    this.renderToScreen = false;
  }
  setSize() {}
  render() { console.error('THREE.Pass: .render() must be implemented in derived pass.'); }
  dispose() {}
}

class FullScreenQuad {
  constructor(material) { this._mesh = new THREE.Mesh(_geometry, material); }
  dispose() { this._mesh.geometry.dispose(); }
  render(renderer) { renderer.render(this._mesh, _camera); }
  get material() { return this._mesh.material; }
  set material(value) { this._mesh.material = value; }
}

// ============ CopyShader ============
const CopyShader = {
  name: 'CopyShader',
  uniforms: {
    'tDiffuse': { value: null },
    'opacity': { value: 1.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
  fragmentShader: `
    uniform float opacity;
    uniform sampler2D tDiffuse;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D( tDiffuse, vUv );
      gl_FragColor = opacity * texel;
    }`
};

// ============ LuminosityHighPassShader ============
const LuminosityHighPassShader = {
  name: 'LuminosityHighPassShader',
  shaderID: 'luminosityHighPass',
  uniforms: {
    'tDiffuse': { value: null },
    'luminosityThreshold': { value: 1.0 },
    'smoothWidth': { value: 1.0 },
    'defaultColor': { value: new THREE.Color(0x000000) },
    'defaultOpacity': { value: 0.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec3 defaultColor;
    uniform float defaultOpacity;
    uniform float luminosityThreshold;
    uniform float smoothWidth;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D( tDiffuse, vUv );
      vec3 luma = vec3( 0.299, 0.587, 0.114 );
      float v = dot( texel.xyz, luma );
      vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );
      float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );
      gl_FragColor = mix( outputColor, texel, alpha );
    }`
};

// ============ ShaderPass ============
class ShaderPass extends Pass {
  constructor(shader, textureID) {
    super();
    this.textureID = (textureID !== undefined) ? textureID : 'tDiffuse';
    if (shader instanceof THREE.ShaderMaterial) {
      this.uniforms = shader.uniforms;
      this.material = shader;
    } else if (shader) {
      this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);
      this.material = new THREE.ShaderMaterial({
        name: (shader.name !== undefined) ? shader.name : 'unspecified',
        defines: Object.assign({}, shader.defines),
        uniforms: this.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader
      });
    }
    this.fsQuad = new FullScreenQuad(this.material);
  }
  render(renderer, writeBuffer, readBuffer) {
    if (this.uniforms[this.textureID]) {
      this.uniforms[this.textureID].value = readBuffer.texture;
    }
    this.fsQuad.material = this.material;
    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);
      this.fsQuad.render(renderer);
    }
  }
  dispose() { this.material.dispose(); this.fsQuad.dispose(); }
}

// ============ MaskPass & ClearMaskPass ============
class MaskPass extends Pass {
  constructor(scene, camera) {
    super();
    this.scene = scene;
    this.camera = camera;
    this.clear = true;
    this.needsSwap = false;
    this.inverse = false;
  }
  render(renderer, writeBuffer, readBuffer) {
    const context = renderer.getContext();
    const state = renderer.state;
    state.buffers.color.setMask(false);
    state.buffers.depth.setMask(false);
    state.buffers.color.setLocked(true);
    state.buffers.depth.setLocked(true);
    let writeValue, clearValue;
    if (this.inverse) { writeValue = 0; clearValue = 1; }
    else { writeValue = 1; clearValue = 0; }
    state.buffers.stencil.setTest(true);
    state.buffers.stencil.setOp(context.REPLACE, context.REPLACE, context.REPLACE);
    state.buffers.stencil.setFunc(context.ALWAYS, writeValue, 0xffffffff);
    state.buffers.stencil.setClear(clearValue);
    state.buffers.stencil.setLocked(true);
    renderer.setRenderTarget(readBuffer);
    if (this.clear) renderer.clear();
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(writeBuffer);
    if (this.clear) renderer.clear();
    renderer.render(this.scene, this.camera);
    state.buffers.color.setLocked(false);
    state.buffers.depth.setLocked(false);
    state.buffers.color.setMask(true);
    state.buffers.depth.setMask(true);
    state.buffers.stencil.setLocked(false);
    state.buffers.stencil.setFunc(context.EQUAL, 1, 0xffffffff);
    state.buffers.stencil.setOp(context.KEEP, context.KEEP, context.KEEP);
    state.buffers.stencil.setLocked(true);
  }
}

class ClearMaskPass extends Pass {
  constructor() { super(); this.needsSwap = false; }
  render(renderer) {
    renderer.state.buffers.stencil.setLocked(false);
    renderer.state.buffers.stencil.setTest(false);
  }
}

// ============ RenderPass ============
class RenderPass extends Pass {
  constructor(scene, camera, overrideMaterial, clearColor, clearAlpha) {
    super();
    this.scene = scene;
    this.camera = camera;
    this.overrideMaterial = overrideMaterial || null;
    this.clearColor = clearColor || null;
    this.clearAlpha = (clearAlpha !== undefined) ? clearAlpha : null;
    this.clear = true;
    this.clearDepth = false;
    this.needsSwap = false;
    this._oldClearColor = new THREE.Color();
  }
  render(renderer, writeBuffer, readBuffer) {
    const oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;
    let oldClearAlpha, oldOverrideMaterial;
    if (this.overrideMaterial !== null) {
      oldOverrideMaterial = this.scene.overrideMaterial;
      this.scene.overrideMaterial = this.overrideMaterial;
    }
    if (this.clearColor !== null) {
      renderer.getClearColor(this._oldClearColor);
      renderer.setClearColor(this.clearColor);
    }
    if (this.clearAlpha !== null) {
      oldClearAlpha = renderer.getClearAlpha();
      renderer.setClearAlpha(this.clearAlpha);
    }
    if (this.clearDepth == true) renderer.clearDepth();
    renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
    if (this.clear === true) renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);
    renderer.render(this.scene, this.camera);
    if (this.clearColor !== null) renderer.setClearColor(this._oldClearColor);
    if (this.clearAlpha !== null) renderer.setClearAlpha(oldClearAlpha);
    if (this.overrideMaterial !== null) this.scene.overrideMaterial = oldOverrideMaterial;
    renderer.autoClear = oldAutoClear;
  }
}

// ============ EffectComposer ============
class EffectComposer {
  constructor(renderer, renderTarget) {
    this.renderer = renderer;
    this._pixelRatio = renderer.getPixelRatio();
    if (renderTarget === undefined) {
      const size = renderer.getSize(new THREE.Vector2());
      this._width = size.width;
      this._height = size.height;
      renderTarget = new THREE.WebGLRenderTarget(this._width * this._pixelRatio, this._height * this._pixelRatio, { type: THREE.HalfFloatType });
      renderTarget.texture.name = 'EffectComposer.rt1';
    } else {
      this._width = renderTarget.width;
      this._height = renderTarget.height;
    }
    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();
    this.renderTarget2.texture.name = 'EffectComposer.rt2';
    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;
    this.renderToScreen = true;
    this.passes = [];
    this.copyPass = new ShaderPass(CopyShader);
    this.copyPass.material.blending = THREE.NoBlending;
    this.clock = new THREE.Clock();
  }
  swapBuffers() { const tmp = this.readBuffer; this.readBuffer = this.writeBuffer; this.writeBuffer = tmp; }
  addPass(pass) { this.passes.push(pass); pass.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio); }
  insertPass(pass, index) { this.passes.splice(index, 0, pass); pass.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio); }
  removePass(pass) { const i = this.passes.indexOf(pass); if (i !== -1) this.passes.splice(i, 1); }
  isLastEnabledPass(passIndex) { for (let i = passIndex + 1; i < this.passes.length; i++) { if (this.passes[i].enabled) return false; } return true; }
  render(deltaTime) {
    if (deltaTime === undefined) deltaTime = this.clock.getDelta();
    const currentRenderTarget = this.renderer.getRenderTarget();
    let maskActive = false;
    for (let i = 0, il = this.passes.length; i < il; i++) {
      const pass = this.passes[i];
      if (pass.enabled === false) continue;
      pass.renderToScreen = (this.renderToScreen && this.isLastEnabledPass(i));
      pass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive);
      if (pass.needsSwap) {
        if (maskActive) {
          const context = this.renderer.getContext();
          const stencil = this.renderer.state.buffers.stencil;
          stencil.setFunc(context.NOTEQUAL, 1, 0xffffffff);
          this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime);
          stencil.setFunc(context.EQUAL, 1, 0xffffffff);
        }
        this.swapBuffers();
      }
      if (pass instanceof MaskPass) maskActive = true;
      else if (pass instanceof ClearMaskPass) maskActive = false;
    }
    this.renderer.setRenderTarget(currentRenderTarget);
  }
  reset(renderTarget) {
    if (renderTarget === undefined) {
      const size = this.renderer.getSize(new THREE.Vector2());
      this._pixelRatio = this.renderer.getPixelRatio();
      this._width = size.width;
      this._height = size.height;
      renderTarget = this.renderTarget1.clone();
      renderTarget.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
    }
    this.renderTarget1.dispose();
    this.renderTarget2.dispose();
    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();
    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;
  }
  setSize(width, height) {
    this._width = width;
    this._height = height;
    const ew = this._width * this._pixelRatio;
    const eh = this._height * this._pixelRatio;
    this.renderTarget1.setSize(ew, eh);
    this.renderTarget2.setSize(ew, eh);
    for (let i = 0; i < this.passes.length; i++) this.passes[i].setSize(ew, eh);
  }
  setPixelRatio(pixelRatio) { this._pixelRatio = pixelRatio; this.setSize(this._width, this._height); }
  dispose() { this.renderTarget1.dispose(); this.renderTarget2.dispose(); this.copyPass.dispose(); }
}

// ============ UnrealBloomPass ============
class UnrealBloomPass extends Pass {
  constructor(resolution, strength, radius, threshold) {
    super();
    this.strength = (strength !== undefined) ? strength : 1;
    this.radius = radius;
    this.threshold = threshold;
    this.resolution = (resolution !== undefined) ? new THREE.Vector2(resolution.x, resolution.y) : new THREE.Vector2(256, 256);
    this.clearColor = new THREE.Color(0, 0, 0);
    this.renderTargetsHorizontal = [];
    this.renderTargetsVertical = [];
    this.nMips = 5;
    let resx = Math.round(this.resolution.x / 2);
    let resy = Math.round(this.resolution.y / 2);
    this.renderTargetBright = new THREE.WebGLRenderTarget(resx, resy, { type: THREE.HalfFloatType });
    this.renderTargetBright.texture.name = 'UnrealBloomPass.bright';
    this.renderTargetBright.texture.generateMipmaps = false;
    for (let i = 0; i < this.nMips; i++) {
      const rth = new THREE.WebGLRenderTarget(resx, resy, { type: THREE.HalfFloatType });
      rth.texture.name = 'UnrealBloomPass.h' + i;
      rth.texture.generateMipmaps = false;
      this.renderTargetsHorizontal.push(rth);
      const rtv = new THREE.WebGLRenderTarget(resx, resy, { type: THREE.HalfFloatType });
      rtv.texture.name = 'UnrealBloomPass.v' + i;
      rtv.texture.generateMipmaps = false;
      this.renderTargetsVertical.push(rtv);
      resx = Math.round(resx / 2);
      resy = Math.round(resy / 2);
    }
    const highPassShader = LuminosityHighPassShader;
    this.highPassUniforms = THREE.UniformsUtils.clone(highPassShader.uniforms);
    this.highPassUniforms['luminosityThreshold'].value = threshold;
    this.highPassUniforms['smoothWidth'].value = 0.01;
    this.materialHighPassFilter = new THREE.ShaderMaterial({
      uniforms: this.highPassUniforms,
      vertexShader: highPassShader.vertexShader,
      fragmentShader: highPassShader.fragmentShader
    });
    this.separableBlurMaterials = [];
    const kernelSizeArray = [3, 5, 7, 9, 11];
    resx = Math.round(this.resolution.x / 2);
    resy = Math.round(this.resolution.y / 2);
    for (let i = 0; i < this.nMips; i++) {
      this.separableBlurMaterials.push(this.getSeperableBlurMaterial(kernelSizeArray[i]));
      this.separableBlurMaterials[i].uniforms['invSize'].value = new THREE.Vector2(1 / resx, 1 / resy);
      resx = Math.round(resx / 2);
      resy = Math.round(resy / 2);
    }
    this.compositeMaterial = this.getCompositeMaterial(this.nMips);
    this.compositeMaterial.uniforms['blurTexture1'].value = this.renderTargetsVertical[0].texture;
    this.compositeMaterial.uniforms['blurTexture2'].value = this.renderTargetsVertical[1].texture;
    this.compositeMaterial.uniforms['blurTexture3'].value = this.renderTargetsVertical[2].texture;
    this.compositeMaterial.uniforms['blurTexture4'].value = this.renderTargetsVertical[3].texture;
    this.compositeMaterial.uniforms['blurTexture5'].value = this.renderTargetsVertical[4].texture;
    this.compositeMaterial.uniforms['bloomStrength'].value = strength;
    this.compositeMaterial.uniforms['bloomRadius'].value = 0.1;
    const bloomFactors = [1.0, 0.8, 0.6, 0.4, 0.2];
    this.compositeMaterial.uniforms['bloomFactors'].value = bloomFactors;
    this.bloomTintColors = [new THREE.Vector3(1,1,1), new THREE.Vector3(1,1,1), new THREE.Vector3(1,1,1), new THREE.Vector3(1,1,1), new THREE.Vector3(1,1,1)];
    this.compositeMaterial.uniforms['bloomTintColors'].value = this.bloomTintColors;
    const copyShader = CopyShader;
    this.copyUniforms = THREE.UniformsUtils.clone(copyShader.uniforms);
    this.blendMaterial = new THREE.ShaderMaterial({
      uniforms: this.copyUniforms,
      vertexShader: copyShader.vertexShader,
      fragmentShader: copyShader.fragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true
    });
    this.enabled = true;
    this.needsSwap = false;
    this._oldClearColor = new THREE.Color();
    this.oldClearAlpha = 1;
    this.basic = new THREE.MeshBasicMaterial();
    this.fsQuad = new FullScreenQuad(null);
  }
  dispose() {
    for (let i = 0; i < this.renderTargetsHorizontal.length; i++) this.renderTargetsHorizontal[i].dispose();
    for (let i = 0; i < this.renderTargetsVertical.length; i++) this.renderTargetsVertical[i].dispose();
    this.renderTargetBright.dispose();
    for (let i = 0; i < this.separableBlurMaterials.length; i++) this.separableBlurMaterials[i].dispose();
    this.compositeMaterial.dispose();
    this.blendMaterial.dispose();
    this.basic.dispose();
    this.fsQuad.dispose();
  }
  setSize(width, height) {
    let resx = Math.round(width / 2);
    let resy = Math.round(height / 2);
    this.renderTargetBright.setSize(resx, resy);
    for (let i = 0; i < this.nMips; i++) {
      this.renderTargetsHorizontal[i].setSize(resx, resy);
      this.renderTargetsVertical[i].setSize(resx, resy);
      this.separableBlurMaterials[i].uniforms['invSize'].value = new THREE.Vector2(1 / resx, 1 / resy);
      resx = Math.round(resx / 2);
      resy = Math.round(resy / 2);
    }
  }
  render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
    renderer.getClearColor(this._oldClearColor);
    this.oldClearAlpha = renderer.getClearAlpha();
    const oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;
    renderer.setClearColor(this.clearColor, 0);
    if (maskActive) renderer.state.buffers.stencil.setTest(false);
    if (this.renderToScreen) {
      this.fsQuad.material = this.basic;
      this.basic.map = readBuffer.texture;
      renderer.setRenderTarget(null);
      renderer.clear();
      this.fsQuad.render(renderer);
    }
    this.highPassUniforms['tDiffuse'].value = readBuffer.texture;
    this.highPassUniforms['luminosityThreshold'].value = this.threshold;
    this.fsQuad.material = this.materialHighPassFilter;
    renderer.setRenderTarget(this.renderTargetBright);
    renderer.clear();
    this.fsQuad.render(renderer);
    let inputRenderTarget = this.renderTargetBright;
    for (let i = 0; i < this.nMips; i++) {
      this.fsQuad.material = this.separableBlurMaterials[i];
      this.separableBlurMaterials[i].uniforms['colorTexture'].value = inputRenderTarget.texture;
      this.separableBlurMaterials[i].uniforms['direction'].value = UnrealBloomPass.BlurDirectionX;
      renderer.setRenderTarget(this.renderTargetsHorizontal[i]);
      renderer.clear();
      this.fsQuad.render(renderer);
      this.separableBlurMaterials[i].uniforms['colorTexture'].value = this.renderTargetsHorizontal[i].texture;
      this.separableBlurMaterials[i].uniforms['direction'].value = UnrealBloomPass.BlurDirectionY;
      renderer.setRenderTarget(this.renderTargetsVertical[i]);
      renderer.clear();
      this.fsQuad.render(renderer);
      inputRenderTarget = this.renderTargetsVertical[i];
    }
    this.fsQuad.material = this.compositeMaterial;
    this.compositeMaterial.uniforms['bloomStrength'].value = this.strength;
    this.compositeMaterial.uniforms['bloomRadius'].value = this.radius;
    this.compositeMaterial.uniforms['bloomTintColors'].value = this.bloomTintColors;
    renderer.setRenderTarget(this.renderTargetsHorizontal[0]);
    renderer.clear();
    this.fsQuad.render(renderer);
    this.fsQuad.material = this.blendMaterial;
    this.copyUniforms['tDiffuse'].value = this.renderTargetsHorizontal[0].texture;
    if (maskActive) renderer.state.buffers.stencil.setTest(true);
    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(readBuffer);
      this.fsQuad.render(renderer);
    }
    renderer.setClearColor(this._oldClearColor, this.oldClearAlpha);
    renderer.autoClear = oldAutoClear;
  }
  getSeperableBlurMaterial(kernelRadius) {
    const coefficients = [];
    for (let i = 0; i < kernelRadius; i++) coefficients.push(0.39894 * Math.exp(-0.5 * i * i / (kernelRadius * kernelRadius)) / kernelRadius);
    return new THREE.ShaderMaterial({
      defines: { 'KERNEL_RADIUS': kernelRadius },
      uniforms: {
        'colorTexture': { value: null },
        'invSize': { value: new THREE.Vector2(0.5, 0.5) },
        'direction': { value: new THREE.Vector2(0.5, 0.5) },
        'gaussianCoefficients': { value: coefficients }
      },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`,
      fragmentShader: `#include <common>
        varying vec2 vUv;
        uniform sampler2D colorTexture;
        uniform vec2 invSize;
        uniform vec2 direction;
        uniform float gaussianCoefficients[KERNEL_RADIUS];
        void main() {
          float weightSum = gaussianCoefficients[0];
          vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
          for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
            float x = float(i);
            float w = gaussianCoefficients[i];
            vec2 uvOffset = direction * invSize * x;
            vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
            vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
            diffuseSum += (sample1 + sample2) * w;
            weightSum += 2.0 * w;
          }
          gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
        }`
    });
  }
  getCompositeMaterial(nMips) {
    return new THREE.ShaderMaterial({
      defines: { 'NUM_MIPS': nMips },
      uniforms: {
        'blurTexture1': { value: null }, 'blurTexture2': { value: null },
        'blurTexture3': { value: null }, 'blurTexture4': { value: null },
        'blurTexture5': { value: null },
        'bloomStrength': { value: 1.0 }, 'bloomFactors': { value: null },
        'bloomTintColors': { value: null }, 'bloomRadius': { value: 0.0 }
      },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`,
      fragmentShader: `varying vec2 vUv;
        uniform sampler2D blurTexture1; uniform sampler2D blurTexture2;
        uniform sampler2D blurTexture3; uniform sampler2D blurTexture4;
        uniform sampler2D blurTexture5;
        uniform float bloomStrength; uniform float bloomRadius;
        uniform float bloomFactors[NUM_MIPS]; uniform vec3 bloomTintColors[NUM_MIPS];
        float lerpBloomFactor(const in float factor) { float mirrorFactor = 1.2 - factor; return mix(factor, mirrorFactor, bloomRadius); }
        void main() {
          gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
            lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
            lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
            lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
            lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
        }`
    });
  }
}
UnrealBloomPass.BlurDirectionX = new THREE.Vector2(1.0, 0.0);
UnrealBloomPass.BlurDirectionY = new THREE.Vector2(0.0, 1.0);

// ============ 挂载到全局 THREE ============
THREE.Pass = Pass;
THREE.FullScreenQuad = FullScreenQuad;
THREE.CopyShader = CopyShader;
THREE.ShaderPass = ShaderPass;
THREE.MaskPass = MaskPass;
THREE.ClearMaskPass = ClearMaskPass;
THREE.RenderPass = RenderPass;
THREE.LuminosityHighPassShader = LuminosityHighPassShader;
THREE.EffectComposer = EffectComposer;
THREE.UnrealBloomPass = UnrealBloomPass;

})();
