import "./style.css";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import GUI from "lil-gui";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/**
 * Debug
 */
const gui = new GUI();
gui.hide();

const parameters = {
  bloomStrength: 1.2, // Slightly lowered for better readability
  bloomRadius: 0.6,
  particleSize: 40.0,
  explosionStrength: 2.5,
  cycleDuration: 8.0,
};

/**
 * Base
 */
const canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;
const scene = new THREE.Scene();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  composer.setSize(sizes.width, sizes.height);
  updateNavIndicator();
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.z = 7;
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x080808, 1);

/**
 * Post Processing
 */
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(sizes.width, sizes.height),
  1.5,
  0.4,
  0.85,
);
bloomPass.threshold = 0.15;
bloomPass.strength = parameters.bloomStrength;
bloomPass.radius = parameters.bloomRadius;

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

/**
 * Particles
 */
const count = 40000;
const logoCount = 20000; // Particles used for logos
const geometry = new THREE.BufferGeometry();

const positions = new Float32Array(count * 3);
const nextPositions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);
const nextColors = new Float32Array(count * 3);
const sizesArray = new Float32Array(count);

// Shape Generators
const getVortex = (
  arr: Float32Array,
  start: number = 0,
  end: number = count,
) => {
  for (let i = start; i < end; i++) {
    const i3 = i * 3;
    const radius = Math.random() * 8;
    const angle = Math.random() * Math.PI * 2 + radius * 1.5;
    arr[i3] = Math.cos(angle) * radius;
    arr[i3 + 1] = (Math.random() - 0.5) * 12;
    arr[i3 + 2] = Math.sin(angle) * radius;
  }
};

const getSoftwareEngineer = (arr: Float32Array, _colArr?: Float32Array) => {
  for (let i = 0; i < logoCount; i++) {
    const i3 = i * 3;
    if (i < logoCount * 0.3) {
      if (i < logoCount * 0.15) {
        arr[i3] = (Math.random() - 0.5) * 4.0;
        arr[i3 + 1] = 0.5 + Math.random() * 2.5;
        arr[i3 + 2] = -0.5;
      } else {
        arr[i3] = (Math.random() - 0.5) * 4.2;
        arr[i3 + 1] = 0.5 - Math.random() * 0.5;
        arr[i3 + 2] = Math.random() * 2.0;
      }
    } else if (i < logoCount * 0.5) {
      const angle = Math.random() * Math.PI * 2,
        r = 3.8 + (Math.sin(angle * 10) > 0 ? 0.5 : 0);
      arr[i3] = Math.cos(angle) * r;
      arr[i3 + 1] = Math.sin(angle) * r + 1.2;
      arr[i3 + 2] = -1.5;
    } else {
      const side = Math.random() > 0.5 ? 1 : -1,
        t = (Math.random() - 0.5) * 2;
      arr[i3] = side * 4.5 + (Math.random() - 0.5) * 1.5;
      arr[i3 + 1] = t * 3.0 + 1.5;
      arr[i3 + 2] = (Math.random() - 0.5) * 3.0;
    }
  }
  getVortex(arr, logoCount, count);
};

const getMERN = (arr: Float32Array, _colArr?: Float32Array) => {
  for (let i = 0; i < logoCount; i++) {
    const i3 = i * 3;
    const section = Math.floor(i / (logoCount / 4)),
      offX = section % 2 === 0 ? -1.8 : 1.8,
      offY = section < 2 ? 1.8 : -1.8;
    if (section === 0) {
      const a = Math.random() * Math.PI * 2,
        r = Math.sqrt(Math.random()) * 1.2;
      arr[i3] = Math.cos(a) * r * (1.0 + Math.sin(a)) + offX;
      arr[i3 + 1] = Math.sin(a) * r * 1.5 + offY;
    } else if (section === 1) {
      const a = Math.random() * Math.PI * 2,
        r = 1.0;
      arr[i3] = Math.cos(a) * r + offX;
      arr[i3 + 1] = Math.sin(a) * r + offY;
    } else if (section === 2) {
      const rIdx = Math.floor(Math.random() * 3),
        a = Math.random() * Math.PI * 2,
        tilt = (rIdx / 3) * Math.PI,
        x = Math.cos(a) * 1.2,
        y = Math.sin(a) * 0.4;
      arr[i3] = x * Math.cos(tilt) - y * Math.sin(tilt) + offX;
      arr[i3 + 1] = x * Math.sin(tilt) + y * Math.cos(tilt) + offY;
    } else {
      const side = Math.floor(Math.random() * 6),
        a = (side / 6) * Math.PI * 2,
        na = ((side + 1) / 6) * Math.PI * 2,
        t = Math.random();
      arr[i3] = Math.cos(a) * 1.2 * (1 - t) + Math.cos(na) * 1.2 * t + offX;
      arr[i3 + 1] = Math.sin(a) * 1.2 * (1 - t) + Math.sin(na) * 1.2 * t + offY;
    }
    arr[i3 + 2] = (Math.random() - 0.5) * 0.5;
  }
  getVortex(arr, logoCount, count);
};

const getSocketWebRTC = (arr: Float32Array, _colArr?: Float32Array) => {
  for (let i = 0; i < logoCount; i++) {
    const i3 = i * 3;
    const rand = Math.random();

    if (rand < 0.2) {
      // Central Node (The Hub)
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 0.8;
      arr[i3] = Math.cos(a) * r;
      arr[i3 + 1] = Math.sin(a) * r;
      arr[i3 + 2] = (Math.random() - 0.5) * 0.2;
    } else {
      // Signal Arcs (Connectivity)
      const arcIdx = Math.floor(Math.random() * 3) + 1;
      const side = Math.random() > 0.5 ? 1 : -1;
      const a = (Math.random() - 0.5) * Math.PI * 0.8; // Open arcs
      const r = arcIdx * 1.2;
      arr[i3] = side * (Math.cos(a) * r + 0.5);
      arr[i3 + 1] = Math.sin(a) * r;
      arr[i3 + 2] = (Math.random() - 0.5) * 0.5;
    }
  }
  getVortex(arr, logoCount, count);
};

const getDocker = (arr: Float32Array, colArr?: Float32Array) => {
  const containerCount = 6;
  const pPerContainer = Math.floor(logoCount / containerCount);
  const W = 1.4,
    H = 1.0,
    D = 3.2;

  const containerData = [
    { cx: -1.6, cy: -0.8, cz: 0.8, color: "#0ea5e9" }, // Bottom Left (Sky Blue - Brighter)
    { cx: 0, cy: -0.8, cz: 0, color: "#0ea5e9" }, // Bottom Center
    { cx: 1.6, cy: -0.8, cz: -0.8, color: "#0ea5e9" }, // Bottom Right
    { cx: 0, cy: 0.4, cz: 0, color: "#7dd3fc" }, // Middle Center (Cyan Blue)
    { cx: 1.6, cy: 0.4, cz: -0.8, color: "#7dd3fc" }, // Middle Right
    { cx: 1.6, cy: 1.6, cz: -0.8, color: "#f0f9ff" }, // Top Right (Glowing White-Blue)
  ];

  for (let c = 0; c < containerCount; c++) {
    const data = containerData[c];
    const color = new THREE.Color(data.color);
    for (let i = 0; i < pPerContainer; i++) {
      const i3 = (c * pPerContainer + i) * 3;
      const rand = Math.random();
      let x = 0,
        y = 0,
        z = 0;

      if (rand < 0.25) {
        // 1. MAIN FRAME EDGES (Higher density for visibility)
        const edge = Math.floor(Math.random() * 12);
        const t = Math.random() - 0.5;
        if (edge === 0) {
          x = t * W;
          y = H / 2;
          z = D / 2;
        } else if (edge === 1) {
          x = t * W;
          y = -H / 2;
          z = D / 2;
        } else if (edge === 2) {
          x = t * W;
          y = H / 2;
          z = -D / 2;
        } else if (edge === 3) {
          x = t * W;
          y = -H / 2;
          z = -D / 2;
        } else if (edge === 4) {
          x = W / 2;
          y = t * H;
          z = D / 2;
        } else if (edge === 5) {
          x = -W / 2;
          y = t * H;
          z = D / 2;
        } else if (edge === 6) {
          x = W / 2;
          y = t * H;
          z = -D / 2;
        } else if (edge === 7) {
          x = -W / 2;
          y = t * H;
          z = -D / 2;
        } else if (edge === 8) {
          x = W / 2;
          y = H / 2;
          z = t * D;
        } else if (edge === 9) {
          x = -W / 2;
          y = H / 2;
          z = t * D;
        } else if (edge === 10) {
          x = W / 2;
          y = -H / 2;
          z = t * D;
        } else {
          x = -W / 2;
          y = -H / 2;
          z = t * D;
        }
      } else if (rand < 0.85) {
        // 2. RIBBED SIDES (Increased density)
        const face = Math.floor(Math.random() * 4);
        const ribCount = face < 2 ? 16 : 8;
        const ribIdx = Math.floor(Math.random() * ribCount);
        const t = ribIdx / (ribCount - 1) - 0.5;
        y = (Math.random() - 0.5) * H;
        if (face === 0) {
          x = W / 2;
          z = t * D;
        } else if (face === 1) {
          x = -W / 2;
          z = t * D;
        } else if (face === 2) {
          z = D / 2;
          x = t * W;
        } else {
          z = -D / 2;
          x = t * W;
        }
      } else {
        // 3. TOP/BOTTOM SURFACE
        const isTop = Math.random() > 0.5;
        x = (Math.random() - 0.5) * W;
        z = (Math.random() - 0.5) * D;
        y = isTop ? H / 2 : -H / 2;
      }

      // ISOMETRIC PROJECTION
      const rotY = Math.PI / 6;
      const rotX = Math.PI / 12;
      const x1 = x * Math.cos(rotY) + z * Math.sin(rotY);
      const z1 = -x * Math.sin(rotY) + z * Math.cos(rotY);
      const y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
      const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);

      arr[i3] = x1 + data.cx;
      arr[i3 + 1] = y2 + data.cy;
      arr[i3 + 2] = z2 + data.cz;

      if (colArr) {
        const var_ = (Math.random() - 0.5) * 0.1;
        colArr[i3] = color.r + var_;
        colArr[i3 + 1] = color.g + var_;
        colArr[i3 + 2] = color.b + var_;
      }
    }
  }
  getVortex(arr, logoCount, count);
};

const getCloud = (arr: Float32Array, _colArr?: Float32Array) => {
  // ═══ REFINED CLOUD PATH PARAMETERS ═══
  const BASE_Y = -0.8;

  // 4 Domes for the requested "4 curve" look
  const domes = [
    { cx: -1.6, cy: 0.1, r: 1.0 }, // Far Left
    { cx: -0.5, cy: 0.5, r: 1.6 }, // Center Left
    { cx: 0.8, cy: 0.4, r: 1.4 }, // Center Right
    { cx: 1.9, cy: 0.0, r: 0.9 }, // Far Right
  ];

  for (let i = 0; i < logoCount; i++) {
    const i3 = i * 3;
    const rand = Math.random();

    if (rand < 0.15) {
      // 1. PIN-SHARP BOTTOM LINE (Precisely aligned with outer dome edges)
      const startX = -2.05;
      const endX = 2.35;
      arr[i3] = startX + Math.random() * (endX - startX);
      arr[i3 + 1] = BASE_Y;
      arr[i3 + 2] = (Math.random() - 0.5) * 0.1;
    } else {
      // 2. SMOOTH DOME SILHOUETTE
      let x,
        y,
        isExposed = false;
      let attempts = 0;

      while (!isExposed && attempts < 10) {
        const dIdx = Math.floor(Math.random() * domes.length);
        const d = domes[dIdx];
        const angle = Math.random() * Math.PI * 2;
        x = d.cx + Math.cos(angle) * d.r;
        y = d.cy + Math.sin(angle) * d.r;

        if (y >= BASE_Y) {
          isExposed = true;
          for (let j = 0; j < domes.length; j++) {
            if (j === dIdx) continue;
            const dx = x - domes[j].cx;
            const dy = y - domes[j].cy;
            if (dx * dx + dy * dy < domes[j].r * domes[j].r * 0.99) {
              isExposed = false;
              break;
            }
          }
        }
        attempts++;
      }

      arr[i3] = x || 0;
      arr[i3 + 1] = y || BASE_Y;
      arr[i3 + 2] = (Math.random() - 0.5) * 0.15;
    }
  }
  getVortex(arr, logoCount, count);
};

const getSQL = (arr: Float32Array, _colArr?: Float32Array) => {
  const pPerSec = Math.floor(logoCount / 3);

  // 1. SQL (The Classic Stack - Left)
  for (let i = 0; i < pPerSec; i++) {
    const i3 = i * 3;
    const layer = Math.floor(Math.random() * 4);
    const a = Math.random() * Math.PI * 2;
    const r = layer === 0 || layer === 3 ? 1.0 : 1.1;
    arr[i3] = Math.cos(a) * r - 2.8;
    arr[i3 + 1] = (layer - 1.5) * 0.7;
    arr[i3 + 2] = Math.sin(a) * r;
  }

  // 2. NoSQL (The Distributed Cluster - Center)
  for (let i = pPerSec; i < pPerSec * 2; i++) {
    const i3 = i * 3;
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = 1.0 * Math.pow(Math.random(), 0.3); // Distributed sphere
    arr[i3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    arr[i3 + 2] = r * Math.cos(phi);
  }

  // 3. Time Series (The Temporal Wave - Right)
  for (let i = pPerSec * 2; i < logoCount; i++) {
    const i3 = i * 3;
    const t = (i - pPerSec * 2) / (logoCount - pPerSec * 2);
    const x = t * 3.0 + 1.2;
    // Create a series of vertical pulses representing data points
    const pulse = Math.floor(t * 12);
    const yBase = Math.sin(pulse * 0.8) * 0.8;
    const yHeight = (Math.random() - 0.5) * 1.5;
    arr[i3] = x;
    arr[i3 + 1] = yBase + yHeight * 0.2;
    arr[i3 + 2] = (Math.random() - 0.5) * 0.5;
  }
  getVortex(arr, logoCount, count);
};

const getProblemSolving = (arr: Float32Array, _colArr?: Float32Array) => {
  const BULB_R = 2.4;
  const BULB_Y = 1.8;
  const NECK_R = 1.0;

  for (let i = 0; i < logoCount; i++) {
    const i3 = i * 3;
    const rand = Math.random();

    if (rand < 0.5) {
      // ═══ BULB SHELL ═══
      const t = Math.random();
      const angle = Math.random() * Math.PI * 2;
      let x, y, r;

      if (t < 0.6) {
        // Dome
        const theta = (t / 0.6) * Math.PI * 0.8;
        r = BULB_R * Math.sin(theta);
        y = BULB_R * Math.cos(theta) + BULB_Y;
      } else if (t < 0.8) {
        // Taper to neck
        const s = (t - 0.6) / 0.2;
        r = BULB_R * Math.sin(Math.PI * 0.8) * (1 - s * 0.5);
        y = BULB_R * Math.cos(Math.PI * 0.8) + BULB_Y - s * 1.5;
      } else {
        // Neck
        const n = (t - 0.8) / 0.2;
        r = NECK_R;
        y = BULB_Y - 2.0 - n * 1.0;
      }

      x = r * Math.cos(angle);
      const z = r * Math.sin(angle) * 0.3;

      // Cutout logic (top-right cutout)
      const cutAngle = Math.PI * 0.25;
      const aDiff = Math.abs(
        Math.atan2(Math.sin(angle - cutAngle), Math.cos(angle - cutAngle)),
      );
      const inCutY = y > 1.8 && y < 3.2;

      if (aDiff < 0.35 && inCutY) {
        sendToVortex(arr, i3);
        continue;
      }

      arr[i3] = x;
      arr[i3 + 1] = y;
      arr[i3 + 2] = z;
    } else if (rand < 0.6) {
      // ═══ PUZZLE PIECE (hovering near cutout) ═══
      const px = (Math.random() - 0.5) * 1.2;
      const py = (Math.random() - 0.5) * 1.2;

      const inBody = Math.abs(px) < 0.4 && Math.abs(py) < 0.4;
      const inTab = Math.sqrt(px * px + (py - 0.4) * (py - 0.4)) < 0.25;

      if (inBody || inTab) {
        arr[i3] = px + 2.0;
        arr[i3 + 1] = py + 3.0;
        arr[i3 + 2] = (Math.random() - 0.5) * 0.1;
      } else {
        sendToVortex(arr, i3);
      }
    } else if (rand < 0.75) {
      // ═══ GEAR 1 (large) ═══
      drawGear(arr, i3, -0.2, 1.2, 0.9, 8);
    } else if (rand < 0.85) {
      // ═══ GEAR 2 (small) ═══
      drawGear(arr, i3, 0.7, 0.5, 0.6, 6);
    } else {
      // ═══ SCREW BASE (detailed cylinder) ═══
      const y = -1.2 - Math.random() * 1.2;
      const angle = Math.random() * Math.PI * 2;
      // Create a ribbed screw effect
      const r = NECK_R * (1.0 + Math.sin(y * 15) * 0.1);
      arr[i3] = Math.cos(angle) * r;
      arr[i3 + 1] = y;
      arr[i3 + 2] = Math.sin(angle) * r * 0.4;
    }
  }
  getVortex(arr, logoCount, count);
};

function drawGear(
  arr: Float32Array,
  i3: number,
  cx: number,
  cy: number,
  baseR: number,
  teeth: number,
) {
  const angle = Math.random() * Math.PI * 2;
  const toothAngle = (Math.PI * 2) / teeth;
  const phase = (angle % toothAngle) / toothAngle;
  const r = phase < 0.5 ? baseR * 1.15 : baseR * 0.85;

  if (r < baseR * 0.2) {
    sendToVortex(arr, i3);
    return;
  }

  arr[i3] = Math.cos(angle) * r + cx;
  arr[i3 + 1] = Math.sin(angle) * r + cy;
  arr[i3 + 2] = (Math.random() - 0.5) * 0.1;
}

function sendToVortex(arr: Float32Array, i3: number) {
  // Move MUCH further away (R=50+) so they are completely off-screen and don't ghost
  const vR = 60 + Math.random() * 40;
  const vA = Math.random() * Math.PI * 2;
  arr[i3] = Math.cos(vA) * vR;
  arr[i3 + 1] = (Math.random() - 0.5) * 100;
  arr[i3 + 2] = Math.sin(vA) * vR;
}

const getGenAI = (arr: Float32Array, _colArr?: Float32Array) => {
  for (let i = 0; i < logoCount; i++) {
    const i3 = i * 3;
    const layer = Math.floor(Math.random() * 3),
      node = Math.floor(Math.random() * 5),
      x = (layer - 1) * 2.5,
      y = (node - 2) * 1.5,
      r = 0.3 + Math.random() * 0.2,
      t = Math.random() * Math.PI * 2;
    arr[i3] = x + Math.cos(t) * r;
    arr[i3 + 1] = y + Math.sin(t) * r;
    arr[i3 + 2] = (Math.random() - 0.5) * 1.0;
    if (i > logoCount * 0.8) {
      const pt = Math.random(),
        l1 = Math.floor(Math.random() * 2),
        n1 = Math.floor(Math.random() * 5),
        n2 = Math.floor(Math.random() * 5);
      arr[i3] = (l1 - 1) * 2.5 * (1 - pt) + l1 * 2.5 * pt;
      arr[i3 + 1] = (n1 - 2) * 1.5 * (1 - pt) + (n2 - 2) * 1.5 * pt;
    }
  }
  getVortex(arr, logoCount, count);
};

const setTargetColor = (
  arr: Float32Array,
  color: THREE.Color,
  start: number = 0,
  end: number = count,
) => {
  for (let i = start; i < end; i++) {
    const i3 = i * 3;
    const var_ = (Math.random() - 0.5) * 0.2;
    arr[i3] = color.r + var_;
    arr[i3 + 1] = color.g + var_;
    arr[i3 + 2] = color.b + var_;
  }
};

// Initial State - Now Software Engineer
getSoftwareEngineer(positions);
getSoftwareEngineer(nextPositions);
const initialColor = new THREE.Color("#ffffff");
setTargetColor(colors, initialColor, 0, logoCount);
setTargetColor(nextColors, initialColor, 0, logoCount);
setTargetColor(colors, new THREE.Color("#333333"), logoCount, count);
setTargetColor(nextColors, new THREE.Color("#333333"), logoCount, count);
for (let i = 0; i < count; i++) sizesArray[i] = Math.random();

geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
geometry.setAttribute(
  "aNextPosition",
  new THREE.BufferAttribute(nextPositions, 3),
);
geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
geometry.setAttribute("aNextColor", new THREE.BufferAttribute(nextColors, 3));
geometry.setAttribute("aSize", new THREE.BufferAttribute(sizesArray, 1));

// Material
const material = new THREE.ShaderMaterial({
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexColors: true,
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uSize: { value: parameters.particleSize },
    uExplosionStrength: { value: parameters.explosionStrength },
  },
  vertexShader: `
    attribute vec3 aNextPosition; attribute vec3 aNextColor; attribute float aSize;
    varying vec3 vColor; uniform float uTime; uniform float uProgress; uniform float uSize; uniform float uExplosionStrength;
    float random (vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }
    void main() {
        vColor = mix(color, aNextColor, uProgress);
        float flicker = random(vec2(aSize, uTime * 0.1));
        vColor *= (0.8 + flicker * 0.4);
        vec3 mixedPosition = mix(position, aNextPosition, uProgress);
        float explosion = sin(uProgress * 3.14159);
        float noise = random(vec2(aSize, uTime * 0.001));
        mixedPosition += normalize(mixedPosition + vec3(noise)) * explosion * uExplosionStrength;
        mixedPosition.x += sin(uTime * 0.5 + aSize * 100.0) * 0.05;
        mixedPosition.y += cos(uTime * 0.5 + aSize * 100.0) * 0.05;
        vec4 mvPosition = modelViewMatrix * vec4(mixedPosition, 1.0);
        gl_PointSize = uSize * aSize * (1.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    void main() {
        float strength = distance(gl_PointCoord, vec2(0.5));
        strength = 1.0 - strength;
        strength = pow(strength, 4.0);
        if (strength < 0.1) discard;
        gl_FragColor = vec4(vColor, strength);
    }
  `,
});

const points = new THREE.Points(geometry, material);
scene.add(points);

/**
 * Ambient Background Dots (Bokeh & Dust)
 */
const ambientCount = 300;
const ambientGeometry = new THREE.BufferGeometry();
const ambientPositions = new Float32Array(ambientCount * 3);
const ambientSizes = new Float32Array(ambientCount);
const ambientColors = new Float32Array(ambientCount * 3);
const ambientTypes = new Float32Array(ambientCount); // 0 for bokeh, 1 for dark dust

for (let i = 0; i < ambientCount; i++) {
  const i3 = i * 3;
  const radius = 10 + Math.random() * 30;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI;

  ambientPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
  ambientPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  ambientPositions[i3 + 2] = radius * Math.cos(phi);

  const isDark = Math.random() > 0.8;
  ambientTypes[i] = isDark ? 1.0 : 0.0;
  ambientSizes[i] = isDark ? 5 + Math.random() * 10 : 20 + Math.random() * 60;

  const color = isDark
    ? new THREE.Color("#000000")
    : Math.random() > 0.8
      ? new THREE.Color("#222222") // Very dark glow
      : new THREE.Color("#444444"); // Dim grey glow
  ambientColors[i3] = color.r;
  ambientColors[i3 + 1] = color.g;
  ambientColors[i3 + 2] = color.b;
}

ambientGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(ambientPositions, 3),
);
ambientGeometry.setAttribute(
  "aSize",
  new THREE.BufferAttribute(ambientSizes, 1),
);
ambientGeometry.setAttribute(
  "color",
  new THREE.BufferAttribute(ambientColors, 3),
);
ambientGeometry.setAttribute(
  "aType",
  new THREE.BufferAttribute(ambientTypes, 1),
);

const ambientMaterial = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  vertexColors: true,
  blending: THREE.NormalBlending,
  uniforms: {
    uTime: { value: 0 },
  },
  vertexShader: `
    uniform float uTime;
    attribute float aSize;
    attribute float aType;
    varying vec3 vColor;
    varying float vType;
    varying float vDist;
    void main() {
        vColor = color;
        vType = aType;
        vec3 pos = position;
        pos.x += sin(uTime * 0.1 + position.z) * 0.5;
        pos.y += cos(uTime * 0.1 + position.x) * 0.5;
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        vDist = -mvPosition.z;
        gl_PointSize = aSize * (100.0 / vDist);
        gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vType;
    varying float vDist;
    void main() {
        float dist = distance(gl_PointCoord, vec2(0.5));
        float strength = 1.0 - (dist * 2.0);
        if (strength < 0.1) discard;
        
        if (vType > 0.5) {
            strength = pow(strength, 4.0); // Dark dust stays sharp
            gl_FragColor = vec4(vColor, strength * 0.6);
        } else {
            // Nearer to screen = more blur
            float blur = mix(1.2, 4.0, clamp((vDist - 5.0) / 15.0, 0.0, 1.0));
            strength = pow(strength, blur);
            gl_FragColor = vec4(vColor, strength * 0.4);
        }
    }
  `,
});

const ambientPoints = new THREE.Points(ambientGeometry, ambientMaterial);
scene.add(ambientPoints);

/**
 * Control Logic
 */
const softwareEngineerShape = {
  title: "Software Engineer",
  desc: "Architecting the future through Abstract Data Engines.",
  gen: getSoftwareEngineer,
  color: "#ffffff",
};

const skillShapes = [
  {
    title: "MERN Stack",
    navLabel: "MERN",
    desc: "Building high-performance fullstack applications.",
    gen: getMERN,
    color: "#2d8a50", // Muted Green
  },
  {
    title: "Real-time Systems",
    navLabel: "Real-time",
    desc: "Implementing low-latency connectivity with Socket.io & WebRTC.",
    gen: getSocketWebRTC,
    color: "#01b4e4", // Socket.io Blue
  },
  {
    title: "Cloud Computing",
    navLabel: "Cloud",
    desc: "Orchestrating resilient global infrastructure on AWS & GCP.",
    gen: getCloud,
    color: "#cc7a00", // Muted Orange
  },
  {
    title: "Containerization",
    navLabel: "Containerization",
    desc: "Architecting scalable environments with Docker & Kubernetes.",
    gen: getDocker,
    color: "#0a8ab3",
    customColor: true,
  },
  {
    title: "Database Architecture",
    navLabel: "Database",
    desc: "Architecting high-performance systems across SQL, NoSQL, and Time-Series environments.",
    gen: getSQL,
    color: "#00758f",
  },
  {
    title: "Problem Solving",
    navLabel: "Problem Solving",
    desc: "Decoding complex challenges with elegant algorithmic solutions.",
    gen: getProblemSolving,
    color: "#6366f1",
  },
  {
    title: "Gen AI",
    navLabel: "Gen AI",
    desc: "Integrating neural intelligence into modern workflows.",
    gen: getGenAI,
    color: "#ff00ff",
  },
];

let currentIdx = 0;
let autoCycleInterval: any;
let hasVisitedSkills = false;
const titleElement = document.getElementById("engine-title")!;
const descElement = document.getElementById("engine-description")!;

// ═══ SKILL CAROUSEL UI INJECTION ═══
const skillNav = document.createElement("div");
skillNav.className = "skill-nav";
document.getElementById("skills")?.appendChild(skillNav);

const skillTabs: HTMLElement[] = [];
skillShapes.forEach((s, i) => {
  const tab = document.createElement("div");
  tab.className = "skill-tab";
  tab.innerHTML = `
    <span>${s.navLabel}</span>
    <div class="skill-progress-bg"><div class="skill-progress-fill"></div></div>
  `;
  tab.onclick = () => {
    morphToSkill(i, true); // Force morph on user interaction
    startAutoCycle();
  };
  skillNav.appendChild(tab);
  skillTabs.push(tab);
});

function updateSkillTabs(idx: number) {
  skillTabs.forEach((tab, i) => {
    tab.classList.toggle("active", i === idx);
    const fill = tab.querySelector(".skill-progress-fill") as HTMLElement;
    gsap.killTweensOf(fill);
    if (i === idx) {
      gsap.fromTo(
        fill,
        { width: "0%" },
        { width: "100%", duration: parameters.cycleDuration, ease: "none" },
      );
    } else {
      gsap.to(fill, { width: "0%", duration: 0.3 });
    }
  });
}

function morphToShape(target: any, force: boolean = false) {
  const currentProgress = material.uniforms.uProgress.value;

  if (gsap.isTweening(material.uniforms.uProgress)) {
    if (!force) return;
    gsap.killTweensOf(material.uniforms.uProgress);
  }

  const nextPosAttr = geometry.attributes.aNextPosition;
  const posAttr = geometry.attributes.position;
  const nextColAttr = geometry.attributes.aNextColor;
  const colAttr = geometry.attributes.color;

  // SMOOTH INTERRUPTION: Prevent snapping by capturing current positions
  for (let i = 0; i < count * 3; i++) {
    posAttr.array[i] =
      posAttr.array[i] * (1 - currentProgress) +
      nextPosAttr.array[i] * currentProgress;
    colAttr.array[i] =
      colAttr.array[i] * (1 - currentProgress) +
      nextColAttr.array[i] * currentProgress;
  }
  posAttr.needsUpdate = true;
  colAttr.needsUpdate = true;

  // Only update logo particles in nextPosAttr
  target.gen(
    nextPosAttr.array as Float32Array,
    nextColAttr.array as Float32Array,
  );

  if (!target.customColor) {
    setTargetColor(
      nextColAttr.array as Float32Array,
      new THREE.Color(target.color),
      0,
      logoCount,
    );
  }

  // Background stays fixed in skill switches
  if (force || currentProgress === 0) {
    setTargetColor(
      nextColAttr.array as Float32Array,
      new THREE.Color("#333333"),
      logoCount,
      count,
    );
  }

  nextPosAttr.needsUpdate = true;
  nextColAttr.needsUpdate = true;

  material.uniforms.uProgress.value = 0;
  gsap.to(material.uniforms.uProgress, {
    value: 1,
    duration: 3.5, // Slowed down from 1.5
    ease: "expo.out",
  });

  if (
    document.getElementById("skills")?.classList.contains("active") &&
    target !== softwareEngineerShape
  ) {
    gsap.to("#skills .content", {
      opacity: 0,
      y: -20,
      duration: 0.5,
      onComplete: () => {
        titleElement.innerText = target.title;
        descElement.innerHTML = target.desc.replace(
          /highlight/g,
          `highlight" style="color: ${target.color}`,
        );
        gsap.to("#skills .content", { opacity: 1, y: 0, duration: 1.0 });
      },
    });
  }
}

function morphToSkill(nextIdx: number, force: boolean = false) {
  morphToShape(skillShapes[nextIdx], force);
  currentIdx = nextIdx;
  updateSkillTabs(nextIdx);
}

function startAutoCycle() {
  if (autoCycleInterval) clearInterval(autoCycleInterval);
  updateSkillTabs(currentIdx);
  autoCycleInterval = setInterval(() => {
    morphToSkill((currentIdx + 1) % skillShapes.length);
  }, parameters.cycleDuration * 1000);
}

/**
 * Scroll Interaction
 */
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".section");
const indicator = document.querySelector(".nav-indicator") as HTMLElement;

function updateNavIndicator() {
  const activeLink = document.querySelector(".nav-link.active") as HTMLElement;
  if (activeLink && indicator) {
    indicator.style.width = `${activeLink.offsetWidth}px`;
    indicator.style.left = `${activeLink.offsetLeft}px`;
  }
}

sections.forEach((section) => {
  ScrollTrigger.create({
    trigger: section,
    start: "top center",
    end: "bottom center",
    onEnter: () => activateSection(section.id),
    onEnterBack: () => activateSection(section.id),
  });
});

// Fade out scroll indicator on scroll
ScrollTrigger.create({
  trigger: "#intro",
  start: "top top",
  end: "bottom center",
  onLeave: () => gsap.to(".scroll-indicator", { opacity: 0, duration: 0.5 }),
  onEnterBack: () =>
    gsap.to(".scroll-indicator", { opacity: 0.8, duration: 0.5 }),
});

function activateSection(id: string) {
  sections.forEach((s) => s.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");
  navLinks.forEach((link) =>
    link.classList.toggle("active", link.getAttribute("data-section") === id),
  );
  updateNavIndicator();

  // Particle logic on scroll
  if (id === "skills") {
    // Start Skills cycle at MERN (index 0 now) if not currently cycling on skills
    if (!autoCycleInterval) {
      if (!hasVisitedSkills) {
        currentIdx = 0;
        hasVisitedSkills = true;
      }
      morphToShape(skillShapes[currentIdx], true);
      startAutoCycle();
    }
    gsap.to(material.uniforms.uSize, {
      value: parameters.particleSize,
      duration: 3.0,
    });
    gsap.to(bloomPass, { strength: parameters.bloomStrength, duration: 3.0 });
    gsap.to(points.scale, { x: 1, y: 1, z: 1, duration: 2 });
    gsap.to(camera.position, { z: 7, duration: 3.0, ease: "power2.inOut" });
    gsap.to(points.position, { y: -0.5, duration: 3.0 }); // Lowered for better text contrast
    gsap.to(points.rotation, { x: 0, duration: 3.0 });
  } else if (id === "intro") {
    if (autoCycleInterval) {
      clearInterval(autoCycleInterval);
      autoCycleInterval = null;
    }
    // Show Software Engineer shape on Intro, no rotation, force transition
    morphToShape(softwareEngineerShape, true);
    gsap.to(material.uniforms.uSize, {
      value: parameters.particleSize,
      duration: 3.0,
    });
    gsap.to(bloomPass, { strength: parameters.bloomStrength, duration: 3.0 });
    gsap.to(points.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 3.0 });
    gsap.to(camera.position, { z: 10, duration: 3.0 });
    gsap.to(points.position, { y: -2, duration: 3.0 });
    gsap.to(points.rotation, { x: 0, duration: 3.0 });
  } else {
    if (autoCycleInterval) {
      clearInterval(autoCycleInterval);
      autoCycleInterval = null;
    }
    // Subtle Mode for last 3 sections - Background texture only
    morphToBackgroundMode(true);
    gsap.to(material.uniforms.uSize, {
      value: parameters.particleSize,
      duration: 3.0,
    });
    gsap.to(bloomPass, { strength: parameters.bloomStrength, duration: 3.0 });
    gsap.to(points.scale, { x: 1, y: 1, z: 1, duration: 2 });
    gsap.to(camera.position, { z: 7, duration: 3.0 });
    gsap.to(points.position, { y: 0, duration: 3.0 });
    gsap.to(points.rotation, { x: 0, duration: 3.5 });
  }
}

function morphToBackgroundMode(force: boolean = false) {
  if (gsap.isTweening(material.uniforms.uProgress)) {
    if (!force) return;
    gsap.killTweensOf(material.uniforms.uProgress);
  }
  const nextPosAttr = geometry.attributes.aNextPosition;
  const posAttr = geometry.attributes.position;
  const nextColAttr = geometry.attributes.aNextColor;
  const colAttr = geometry.attributes.color;

  for (let i = 0; i < count * 3; i++) {
    posAttr.array[i] = nextPosAttr.array[i];
    colAttr.array[i] = nextColAttr.array[i];
  }
  posAttr.needsUpdate = true;
  colAttr.needsUpdate = true;

  // Use the same vortex as skills but for ALL particles (no logo)
  getVortex(nextPosAttr.array as Float32Array, 0, count);

  // Use a much dimmer monochromatic palette to ensure readability
  const palette = [
    new THREE.Color("#000000"), // Black dots
    new THREE.Color("#111111"), // Very dark
    new THREE.Color("#222222"), // Dark grey
    new THREE.Color("#444444"), // Subtle grey stars
  ];

  const targetColArray = nextColAttr.array as Float32Array;
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const color = palette[Math.floor(Math.random() * palette.length)];
    const var_ = (Math.random() - 0.5) * 0.05;
    targetColArray[i3] = color.r + var_;
    targetColArray[i3 + 1] = color.g + var_;
    targetColArray[i3 + 2] = color.b + var_;
  }

  nextPosAttr.needsUpdate = true;
  nextColAttr.needsUpdate = true;

  material.uniforms.uProgress.value = 0;
  gsap.to(material.uniforms.uProgress, {
    value: 1,
    duration: 4.5, // Slowed down from 2.5
    ease: "power3.inOut",
  });
}

// Intro Image Parallax / Tilt
const introImage = document.querySelector(".intro-image") as HTMLElement;
window.addEventListener("mousemove", (e) => {
  if (
    document.getElementById("intro")?.classList.contains("active") &&
    introImage
  ) {
    const x = (e.clientX / sizes.width - 0.5) * 20,
      y = (e.clientY / sizes.height - 0.5) * 20;
    gsap.to(introImage, {
      rotateY: x,
      rotateX: -y,
      duration: 1,
      ease: "power2.out",
    });
  }
});

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    const id = link.getAttribute("data-section");
    if (!id) return; // Allow external links (like Resume) to function normally

    e.preventDefault();

    // Close mobile menu on click
    mobileToggle?.classList.remove("active");
    navLinksContainer?.classList.remove("active");

    gsap.to(window, {
      scrollTo: `#${id}`,
      duration: 2.5,
      ease: "power4.inOut",
    });
  });
});

// Mobile Toggle Logic
const mobileToggle = document.getElementById("mobile-toggle");
const navLinksContainer = document.querySelector(".nav-links");

mobileToggle?.addEventListener("click", () => {
  mobileToggle.classList.toggle("active");
  navLinksContainer?.classList.toggle("active");
});

// Intro buttons smooth scroll
document.querySelector(".primary-btn")?.addEventListener("click", (e) => {
  const href = (e.currentTarget as HTMLAnchorElement).getAttribute("href");
  if (href?.startsWith("#")) {
    e.preventDefault();
    gsap.to(window, {
      scrollTo: href,
      duration: 2.5,
      ease: "power4.inOut",
    });
  }
});

document.querySelectorAll(".secondary-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const href = (btn as HTMLAnchorElement).getAttribute("href");
    if (href?.startsWith("#")) {
      e.preventDefault();
      gsap.to(window, {
        scrollTo: href,
        duration: 2.5,
        ease: "power4.inOut",
      });
    }
  });
});

updateNavIndicator();

/**
 * Animate
 */
const mouse = { x: 0, y: 0 };
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX / sizes.width - 0.5;
  mouse.y = e.clientY / sizes.height - 0.5;
});
const clock = new THREE.Clock();
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  material.uniforms.uTime.value = elapsedTime;
  material.uniforms.uExplosionStrength.value = parameters.explosionStrength;
  ambientMaterial.uniforms.uTime.value = elapsedTime;
  points.rotation.y += 0.001;
  ambientPoints.rotation.y += 0.0003;
  points.rotation.x += (mouse.y * 0.1 - points.rotation.x) * 0.05;
  points.rotation.y += (mouse.x * 0.1 - points.rotation.y) * 0.05;
  composer.render();
  window.requestAnimationFrame(tick);
};
// Preloader completion logic
const loaderBar = document.getElementById("loader-bar");
if (loaderBar) {
  gsap.to(loaderBar, {
    width: "100%",
    duration: 1.5,
    ease: "power2.inOut",
    onComplete: () => {
      setTimeout(() => {
        document.body.classList.add("loaded");
        // Trigger initial animations
        activateSection("intro");
        updateNavIndicator();
      }, 500);
    },
  });
} else {
  // Fallback if no loader
  document.body.classList.add("loaded");
  activateSection("intro");
  updateNavIndicator();
}

tick();
