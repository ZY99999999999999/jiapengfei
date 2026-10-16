(function () {
  'use strict';

  // The source drawing defines the motifs and palette. These coordinates are
  // generated in 3D; no image pixels or planes are used by this sculpture.
  function buildFirstPeak({ THREE, spec, texture, mobile, makePointCloud, peakRadiusAt }) {
    const group = new THREE.Group();
    group.name = 'butterfly-lotus-volumetric-sculpture';
    const movingWings = [];
    const movingButterflies = [];
    const responsiveClouds = [];
    const TAU = Math.PI * 2;
    const cream = [0.98, 0.88, 0.64];
    const teal = [0.08, 0.48, 0.43];
    const blue = [0.12, 0.22, 0.52];
    const orange = [1.0, 0.38, 0.10];
    const gold = [0.98, 0.59, 0.13];

    function cloud(parent, positions, colors, size, opacity, glow) {
      const points = makePointCloud(positions, colors, {
        size: mobile ? size * 1.25 : size,
        texture,
        opacity,
        additive: glow,
        depthWrite: !glow
      });
      points.material.fog = false;
      points.userData.baseOpacity = opacity;
      points.userData.baseSize = points.material.size;
      parent.add(points);
      responsiveClouds.push(points);
      return points;
    }

    function pushPoint(positions, colors, x, y, z, color) {
      positions.push(x, y, z);
      colors.push(color[0], color[1], color[2]);
    }

    function slopePoint(angle, heightRatio, extra) {
      const t = Math.max(0.035, Math.min(0.94, heightRatio));
      const r = peakRadiusAt(spec, 0, t) + extra;
      return [Math.sin(angle) * r, spec.height * t, Math.cos(angle) * r];
    }

    // Wide bands and curled cloud lines really run around the entire cone.
    // The lines stay attached to the cone when seen from above or behind.
    const pathPositions = [];
    const pathColors = [];
    for (const band of [0.12, 0.26, 0.70]) {
      const count = mobile ? 420 : 900;
      for (let i = 0; i < count; i += 1) {
        const a = i / count * TAU;
        const wave = band < 0.2 ? Math.sin(a * 18) * 0.016 : Math.sin(a * 12) * 0.026;
        const point = slopePoint(a, band + wave, 0.36);
        pushPoint(pathPositions, pathColors, ...point, band > 0.6 ? cream : teal);
        if (i % 5 === 0) {
          const outer = slopePoint(a, band + wave + 0.014, 0.39);
          pushPoint(pathPositions, pathColors, ...outer, cream);
        }
      }
    }
    for (let sector = 0; sector < 13; sector += 1) {
      const center = sector / 13 * TAU;
      const baseHeight = 0.38 + (sector % 3) * 0.055;
      const count = mobile ? 105 : 230;
      for (let i = 0; i < count; i += 1) {
        const u = i / (count - 1);
        const turns = u * Math.PI * 3.7;
        const radius = 0.02 + u * 0.17;
        const angle = center + Math.cos(turns) * radius;
        const t = baseHeight + Math.sin(turns) * radius * 0.49;
        pushPoint(pathPositions, pathColors, ...slopePoint(angle, t, 0.45), cream);
      }
    }
    // Repeating lozenges recall the inner geometric lines of the reference.
    for (let repeat = 0; repeat < 18; repeat += 1) {
      const center = repeat / 18 * TAU;
      const count = mobile ? 40 : 80;
      for (let i = 0; i < count; i += 1) {
        const u = i / (count - 1);
        const a = center + (u < 0.5 ? -1 + u * 4 : 3 - u * 4) * 0.079;
        const t = 0.57 + Math.sin(u * TAU) * 0.046;
        pushPoint(pathPositions, pathColors, ...slopePoint(a, t, 0.46), i % 7 === 0 ? teal : cream);
      }
    }
    const mountainPatterns = cloud(group, pathPositions, pathColors, 0.14, 0.86, false);

    // Short luminous arcs make the orbit legible even from a fixed front view.
    // They follow the cone instead of forming a flat halo in front of it.
    const orbitPositions = [];
    const orbitColors = [];
    for (let band = 0; band < 3; band += 1) {
      const height = [0.23, 0.47, 0.65][band];
      const count = mobile ? 110 : 230;
      for (let i = 0; i < count; i += 1) {
        const u = i / (count - 1);
        const angle = band * 2.15 + u * (1.05 + band * 0.12);
        const t = height + Math.sin(u * Math.PI * 2) * 0.012;
        pushPoint(orbitPositions, orbitColors, ...slopePoint(angle, t, 0.62), i % 6 === 0 ? gold : cream);
      }
    }
    const orbitTraces = cloud(group, orbitPositions, orbitColors, 0.18, 0.72, true);

    // Lotus petals form radial, curved shells around the crater. Every petal
    // has a coloured outer face, a second inner layer, and a raised vein.
    const petalPositions = [];
    const petalColors = [];
    for (let tier = 0; tier < 2; tier += 1) {
      const petals = tier ? 5 : 7;
      for (let petal = 0; petal < petals; petal += 1) {
        const baseAngle = (petal + tier * 0.5) / petals * TAU;
        const rows = mobile ? 25 : 37;
        const cols = mobile ? 11 : 17;
        for (let row = 0; row < rows; row += 1) {
          const u = row / (rows - 1);
          const spread = Math.pow(Math.sin(Math.PI * u), 0.8);
          for (let col = 0; col < cols; col += 1) {
            const v = col / (cols - 1) * 2 - 1;
            const angle = baseAngle + v * spread * (tier ? 0.24 : 0.36);
            const r = spec.lip * (tier ? 0.65 : 0.95) + u * (tier ? 1.45 : 2.20)
              + spread * (tier ? 0.25 : 0.46) * (1 - v * v);
            const y = spec.height - 0.15 + u * (tier ? 3.65 : 2.95)
              + spread * (tier ? 0.30 : 0.46) - Math.abs(v) * spread * 0.32;
            const edge = col === 0 || col === cols - 1 || row === rows - 1;
            const vein = Math.abs(v) < 0.09 && row % 2 === 0;
            const color = edge || vein ? cream : tier ? gold : orange;
            pushPoint(petalPositions, petalColors, Math.sin(angle) * r, y, Math.cos(angle) * r, color);
            if ((row + col) % 7 === 0 && !edge) {
              // A rear skin makes the petal visibly curved from a side view.
              pushPoint(petalPositions, petalColors,
                Math.sin(angle) * (r - 0.24), y - 0.08, Math.cos(angle) * (r - 0.24), orange);
            }
          }
        }
      }
    }
    const lotus = cloud(group, petalPositions, petalColors, 0.19, 0.97, false);

    const emberPositions = [];
    const emberColors = [];
    const emberCount = mobile ? 180 : 380;
    for (let i = 0; i < emberCount; i += 1) {
      const u = i / (emberCount - 1);
      const a = u * TAU * 4.5;
      const r = (1 - u) * (0.80 + Math.sin(u * Math.PI * 6) * 0.13);
      pushPoint(emberPositions, emberColors,
        Math.sin(a) * r, spec.height + u * 5.15, Math.cos(a) * r,
        i % 4 === 0 ? cream : orange);
    }
    const flame = cloud(group, emberPositions, emberColors, 0.22, 0.69, true);

    // A small, reusable buffer gives the crater a living particle fountain.
    const sparkPositions = [];
    const sparkColors = [];
    const sparkCount = mobile ? 70 : 140;
    for (let i = 0; i < sparkCount; i += 1) {
      pushPoint(sparkPositions, sparkColors, 0, spec.height, 0, i % 5 === 0 ? cream : gold);
    }
    const sparks = cloud(group, sparkPositions, sparkColors, 0.16, 0.78, true);
    const sparkAttribute = sparks.geometry.attributes.position;
    sparkAttribute.setUsage(THREE.DynamicDrawUsage);

    function butterfly(sign) {
      const body = new THREE.Group();
      body.name = sign < 0 ? 'left-sculpted-butterfly' : 'right-sculpted-butterfly';
      body.position.set(sign * (spec.radius + 4.55), spec.height * 0.96, 3.6);
      body.rotation.y = -sign * 0.24;
      group.add(body);
      movingButterflies.push({ body, sign, baseY: body.position.y, baseZ: body.position.z });

      const torsoPositions = [];
      const torsoColors = [];
      for (let i = 0; i < 300; i += 1) {
        const u = i / 299;
        const a = i * 2.39996;
        const r = 0.28 * Math.sqrt(1 - Math.pow(u * 2 - 1, 2)) + 0.04;
        pushPoint(torsoPositions, torsoColors,
          Math.cos(a) * r, -1.28 + u * 2.7, Math.sin(a) * r * 0.7 + 0.12,
          i % 8 < 2 ? cream : teal);
      }
      for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 100; i += 1) {
          const u = i / 99;
          const a = side * (0.12 + u * 1.3);
          pushPoint(torsoPositions, torsoColors,
            Math.sin(a) * u * 1.1, 1.27 + u * 1.4, 0.15 - u * 0.42, cream);
        }
      }
      cloud(body, torsoPositions, torsoColors, 0.13, 0.96, true);

      for (let side = -1; side <= 1; side += 2) {
        const wing = new THREE.Group();
        wing.userData.side = side;
        body.add(wing);
        movingWings.push(wing);
        const positions = [];
        const colors = [];
        for (let lower = 0; lower < 2; lower += 1) {
          const rows = mobile ? 43 : 65;
          const cols = mobile ? 17 : 25;
          for (let row = 0; row < rows; row += 1) {
            const u = row / (rows - 1);
            const serration = 1 - Math.abs(Math.sin(u * Math.PI * (lower ? 7 : 9))) * 0.17;
            const half = Math.pow(Math.sin(Math.PI * u), 0.72) * (lower ? 0.90 : 1.38) * serration;
            for (let col = 0; col < cols; col += 1) {
              const v = col / (cols - 1) * 2 - 1;
              const x = side * (0.18 + u * (lower ? 2.75 : 3.55));
              const y = lower ? -0.20 - u * 0.84 + v * half : 0.30 + u * 0.70 + v * half;
              const bow = Math.sin(Math.PI * u) * (1 - v * v);
              const z = 0.10 + bow * (lower ? 0.68 : 1.02) + u * u * 0.36;
              const edge = row === rows - 1 || col === 0 || col === cols - 1;
              const geometricLine = Math.abs(v) < 0.08 ||
                (Math.abs(v) > 0.48 && Math.abs(v) < 0.59 && row % 2 === 0) ||
                (u > 0.43 && u < 0.50 && col % 2 === 0);
              const color = edge || geometricLine ? cream : (row + col) % 9 === 0 ? blue : teal;
              pushPoint(positions, colors, x, y, z, color);
              if ((row + col) % 6 === 0 && !edge) {
                // Curved rear face, separated in depth from the front face.
                pushPoint(positions, colors, x, y, z - 0.35 - bow * 0.16, teal);
              }
            }
          }
        }
        cloud(wing, positions, colors, 0.16, 0.95, false);
      }
    }

    butterfly(-1);
    butterfly(1);

    return {
      group,
      update(seconds, focus) {
        const pulse = Math.sin(seconds * 1.1);
        lotus.material.size = lotus.userData.baseSize * (1 + pulse * 0.08);
        mountainPatterns.rotation.y = seconds * 0.14;
        orbitTraces.rotation.y = -seconds * 0.23;
        orbitTraces.material.opacity = orbitTraces.userData.baseOpacity * (0.72 + Math.sin(seconds * 2.2) * 0.18) * focus;
        lotus.rotation.y = -seconds * 0.075;
        lotus.position.y = Math.sin(seconds * 1.25) * 0.09;
        flame.rotation.y = seconds * 0.39;
        flame.material.size = flame.userData.baseSize * (1 + Math.sin(seconds * 2.7) * 0.15);
        movingButterflies.forEach(({ body, sign, baseY, baseZ }, i) => {
          const phase = seconds * (0.85 + i * 0.08) + i * 1.8;
          body.position.y = baseY + Math.sin(phase) * 0.22;
          body.position.z = baseZ + Math.cos(phase * 0.75) * 0.13;
          body.rotation.y = -sign * 0.24 + Math.sin(phase * 0.64) * 0.11;
          body.rotation.z = Math.sin(phase * 1.2) * 0.035;
        });
        movingWings.forEach((wing, i) => {
          wing.rotation.y = wing.userData.side * (0.15 + Math.sin(seconds * 2.4 + Math.floor(i / 2) * 0.62) * 0.27);
        });
        for (let i = 0; i < sparkCount; i += 1) {
          const progress = (seconds * (0.28 + i % 5 * 0.018) + i / sparkCount) % 1;
          const angle = i * 2.39996 + seconds * 0.48;
          const radius = 0.3 + progress * (1.0 + i % 4 * 0.18);
          const offset = i * 3;
          sparkAttribute.array[offset] = Math.sin(angle) * radius;
          sparkAttribute.array[offset + 1] = spec.height + progress * 5.2 + Math.sin(progress * Math.PI) * 0.55;
          sparkAttribute.array[offset + 2] = Math.cos(angle) * radius;
        }
        sparkAttribute.needsUpdate = true;
        sparks.material.opacity = sparks.userData.baseOpacity * (0.75 + Math.sin(seconds * 2.1) * 0.13) * focus;
        responsiveClouds.forEach(points => {
          if (points === orbitTraces || points === sparks) return;
          points.material.opacity = points.userData.baseOpacity * focus;
        });
      }
    };
  }

  window.CoCreateSculptures = { buildFirstPeak };
})();
