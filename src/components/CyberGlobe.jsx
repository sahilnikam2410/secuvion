import { useRef, useState, useEffect, useCallback, memo } from "react";
import * as THREE from "three";

import earthMapUrl from "../assets/earthmap.jpg";
import earthLightsUrl from "../assets/earthlights.jpg";

/*
  CyberGlobe — Real 3D Satellite Globe (pure Three.js, no R3F)
  Falls back to animated Canvas2D if WebGL is unavailable.
*/

/* ── CONSTANTS ── */
const ATTACK_COLORS = [0xff3355, 0xffd700, 0xff6b35, 0xc084fc, 0x38bdf8];
const CYAN = 0x06ffd0;

const NODES = [
  { lat: 40.7, lon: -74, label: "NYC" },
  { lat: 34, lon: -118.2, label: "LA" },
  { lat: 51.5, lon: -0.1, label: "LON" },
  { lat: 52.5, lon: 13.4, label: "BER" },
  { lat: 48.9, lon: 2.35, label: "PAR" },
  { lat: 55.8, lon: 37.6, label: "MOS" },
  { lat: 19.1, lon: 72.9, label: "MUM" },
  { lat: 28.6, lon: 77.2, label: "DEL" },
  { lat: 39.9, lon: 116.4, label: "BEI" },
  { lat: 31.2, lon: 121.5, label: "SHA" },
  { lat: 35.7, lon: 139.7, label: "TKY" },
  { lat: 37.6, lon: 127, label: "SEL" },
  { lat: 1.35, lon: 103.8, label: "SGP" },
  { lat: -23.5, lon: -46.6, label: "SAO" },
  { lat: -33.9, lon: 151.2, label: "SYD" },
  { lat: 6.5, lon: 3.4, label: "LAG" },
  { lat: 25.2, lon: 55.3, label: "DXB" },
  { lat: 30, lon: 31.2, label: "CAI" },
  { lat: 19.4, lon: -99.1, label: "MEX" },
  { lat: -1.3, lon: 36.8, label: "NBI" },
];

/* ── Helper: lat/lon to 3D position on sphere ── */
function latLonToVec3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/* ── Create attack arc curve ── */
function createArcCurve(start, end) {
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const dist = start.distanceTo(end);
  mid.normalize().multiplyScalar(2.5 + dist * 0.35);
  return new THREE.QuadraticBezierCurve3(start, mid, end);
}

/* ══════════════════════════════════════════
   3D GLOBE COMPONENT
   ══════════════════════════════════════════ */
const Globe3D = memo(function Globe3D({ size, onContextLost }) {
  const containerRef = useRef(null);
  const onContextLostRef = useRef(onContextLost);
  onContextLostRef.current = onContextLost;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = size;

    // ── Scene ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);

    // ── Camera ──
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.set(0, 0, 5.5);

    // ── Renderer ──
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "default" });
    } catch {
      onContextLostRef.current?.();
      return;
    }
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x030712, 1);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.cursor = "grab";

    // Context loss → fallback
    renderer.domElement.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      onContextLostRef.current?.();
    });

    // ── Textures ──
    const loader = new THREE.TextureLoader();

    // ── Earth ──
    const earthGeom = new THREE.SphereGeometry(2, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x225588,
      emissive: 0x112244,
      shininess: 15,
    });
    const earth = new THREE.Mesh(earthGeom, earthMat);
    scene.add(earth);

    loader.load(earthMapUrl, (tex) => {
      earthMat.map = tex;
      earthMat.color.set(0xffffff);
      earthMat.needsUpdate = true;
    });
    loader.load(earthLightsUrl, (tex) => {
      earthMat.emissiveMap = tex;
      earthMat.emissive.set(0xffcc88);
      earthMat.emissiveIntensity = 0.4;
      earthMat.needsUpdate = true;
    });

    // ── Atmosphere (fresnel rim glow) ──
    const atmosGeom = new THREE.SphereGeometry(2.04, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
          gl_FragColor = vec4(0.024, 1.0, 0.82, 1.0) * intensity * 0.6;
        }
      `,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    scene.add(new THREE.Mesh(atmosGeom, atmosMat));

    // ── Outer Halo ──
    const haloGeom = new THREE.SphereGeometry(2.3, 64, 64);
    const haloMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          gl_FragColor = vec4(0.024, 1.0, 0.82, 1.0) * intensity * 0.25;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    scene.add(new THREE.Mesh(haloGeom, haloMat));

    // ── Orbit Rings ──
    const ring1Mat = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.06, side: THREE.DoubleSide });
    const ring1 = new THREE.Mesh(new THREE.RingGeometry(2.25, 2.26, 128), ring1Mat);
    ring1.rotation.x = Math.PI * 0.45;
    ring1.rotation.z = 0.2;
    scene.add(ring1);

    const ring2 = new THREE.Mesh(
      new THREE.RingGeometry(2.5, 2.51, 128),
      new THREE.MeshBasicMaterial({ color: 0xff3355, transparent: true, opacity: 0.03, side: THREE.DoubleSide })
    );
    ring2.rotation.x = Math.PI * 0.35;
    ring2.rotation.z = -0.4;
    scene.add(ring2);

    // ── Stars ──
    const starsGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(4000 * 3);
    for (let i = 0; i < 4000; i++) {
      const r = 50 + Math.random() * 150;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);
    }
    starsGeom.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(starsGeom, new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, sizeAttenuation: true, transparent: true, opacity: 0.7 }));
    scene.add(stars);

    // ── City Nodes ──
    const nodesGroup = new THREE.Group();
    scene.add(nodesGroup);
    const nodeDots = [];

    NODES.forEach((n) => {
      const pos = latLonToVec3(n.lat, n.lon, 2.02);

      const glowMat = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.3 });
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), glowMat);
      glow.position.copy(pos);
      nodesGroup.add(glow);

      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), new THREE.MeshBasicMaterial({ color: CYAN }));
      dot.position.copy(pos);
      nodesGroup.add(dot);

      const center = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      center.position.copy(pos);
      nodesGroup.add(center);

      nodeDots.push({ glow, glowMat, phase: Math.random() * Math.PI * 2 });
    });

    // ── Arcs Group ──
    const arcsGroup = new THREE.Group();
    scene.add(arcsGroup);
    const attacks = [];

    // ── Lighting ──
    scene.add(new THREE.AmbientLight(0x334466, 0.8));
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    const backLight = new THREE.PointLight(0x06ffd0, 0.3, 50);
    backLight.position.set(-5, -3, 5);
    scene.add(backLight);

    // ── Mouse drag rotation ──
    let mouseDown = false, prevMX = 0, prevMY = 0;
    let rotY = 0, rotX = 0.3;
    const autoSpeed = 0.001;

    const onDown = (x, y) => { mouseDown = true; prevMX = x; prevMY = y; renderer.domElement.style.cursor = "grabbing"; };
    const onUp = () => { mouseDown = false; renderer.domElement.style.cursor = "grab"; };
    const onMove = (x, y) => {
      if (!mouseDown) return;
      rotY += (x - prevMX) * 0.005;
      rotX += (y - prevMY) * 0.005;
      rotX = Math.max(-1.2, Math.min(1.2, rotX));
      prevMX = x; prevMY = y;
    };

    renderer.domElement.addEventListener("mousedown", (e) => onDown(e.clientX, e.clientY));
    renderer.domElement.addEventListener("touchstart", (e) => { e.preventDefault(); onDown(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    renderer.domElement.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
    renderer.domElement.addEventListener("touchmove", (e) => { e.preventDefault(); onMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });

    // ── Spawn attack ──
    let lastAttackTime = 0;
    const spawnAttack = (now) => {
      const ai = Math.floor(Math.random() * NODES.length);
      let bi = Math.floor(Math.random() * NODES.length);
      while (bi === ai) bi = Math.floor(Math.random() * NODES.length);

      const start = latLonToVec3(NODES[ai].lat, NODES[ai].lon, 2.02);
      const end = latLonToVec3(NODES[bi].lat, NODES[bi].lon, 2.02);
      const curve = createArcCurve(start, end);
      const colorIdx = Math.floor(Math.random() * ATTACK_COLORS.length);
      const color = ATTACK_COLORS[colorIdx];

      const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7 });
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)), lineMat);
      arcsGroup.add(line);

      const particleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const particle = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), particleMat);
      arcsGroup.add(particle);

      const pGlowMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 });
      const pGlow = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), pGlowMat);
      arcsGroup.add(pGlow);

      const impactMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, side: THREE.DoubleSide });
      const impact = new THREE.Mesh(new THREE.RingGeometry(0.04, 0.06, 16), impactMat);
      impact.position.copy(end);
      impact.lookAt(new THREE.Vector3(0, 0, 0));
      arcsGroup.add(impact);

      attacks.push({ line, lineMat, particle, pGlow, pGlowMat, impact, impactMat, curve, born: now });

      if (attacks.length > 10) {
        const old = attacks.shift();
        [old.line, old.particle, old.pGlow, old.impact].forEach((m) => { arcsGroup.remove(m); m.geometry.dispose(); });
        [old.lineMat, old.pGlowMat, old.impactMat].forEach((m) => m.dispose());
        old.particle.material.dispose();
      }
    };

    // ── Resize ──
    const onResize = () => {
      const newW = container.clientWidth;
      camera.aspect = newW / size;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, size);
    };
    window.addEventListener("resize", onResize);

    // ── Render Loop ──
    const clock = new THREE.Clock();
    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const now = Date.now();

      if (!mouseDown) rotY += autoSpeed;

      earth.rotation.y = rotY;
      earth.rotation.x = rotX;
      nodesGroup.rotation.y = rotY;
      nodesGroup.rotation.x = rotX;
      arcsGroup.rotation.y = rotY;
      arcsGroup.rotation.x = rotX;

      ring1.rotation.z += delta * 0.05;
      ring2.rotation.z -= delta * 0.03;

      nodeDots.forEach((nd) => {
        nd.phase += delta * 2;
        nd.glow.scale.setScalar(1 + Math.sin(nd.phase) * 0.4);
        nd.glowMat.opacity = 0.15 + Math.sin(nd.phase) * 0.1;
      });

      if (now - lastAttackTime > 1600) {
        spawnAttack(now);
        lastAttackTime = now;
      }

      attacks.forEach((a) => {
        const age = (now - a.born) / 1000;
        const fade = Math.max(0, 1 - age / 5);
        a.lineMat.opacity = 0.6 * fade;
        const t = (age * 0.22) % 1;
        const point = a.curve.getPoint(t);
        a.particle.position.copy(point);
        a.pGlow.position.copy(point);
        a.pGlowMat.opacity = (0.2 + Math.sin(elapsed * 6) * 0.1) * fade;
        if (age > 1) {
          a.impactMat.opacity = Math.max(0, 0.4 - (age - 1) * 0.1) * fade;
          a.impact.scale.setScalar(1 + (age - 1) * 3);
        }
      });

      stars.rotation.y += delta * 0.003;
      renderer.render(scene, camera);
    };

    // Start
    animate();
    spawnAttack(Date.now());
    setTimeout(() => spawnAttack(Date.now()), 400);
    setTimeout(() => spawnAttack(Date.now()), 800);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
      if (renderer.domElement.parentNode) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [size]);

  return <div ref={containerRef} style={{ width: "100%", height: size, background: "#030712" }} />;
});

/* ══════════════════════════════════════════
   CANVAS 2D FALLBACK
   ══════════════════════════════════════════ */
const FB_NODES = [
  { x: 0.24, y: 0.37, label: "NYC" }, { x: 0.47, y: 0.27, label: "LON" },
  { x: 0.50, y: 0.26, label: "BER" }, { x: 0.58, y: 0.24, label: "MOS" },
  { x: 0.66, y: 0.48, label: "MUM" }, { x: 0.83, y: 0.34, label: "TKY" },
  { x: 0.75, y: 0.55, label: "SGP" }, { x: 0.31, y: 0.66, label: "SAO" },
  { x: 0.87, y: 0.73, label: "SYD" }, { x: 0.61, y: 0.42, label: "DXB" },
];

function FallbackGlobe({ size }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let raf;
    const dpr = window.devicePixelRatio || 1;
    const attacks = [];
    let lastAttack = 0, scanAngle = 0;
    const colors = ["#ef4444", "#fbbf24", "#ff7a45", "#a78bfa", "#38bdf8"];

    const resize = () => {
      const rect = c.parentElement.getBoundingClientRect();
      c.width = rect.width * dpr; c.height = rect.height * dpr;
      c.style.width = rect.width + "px"; c.style.height = rect.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize(); window.addEventListener("resize", resize);

    const draw = () => {
      const w = c.width / dpr, h = c.height / dpr, now = Date.now(), t = now * 0.001;
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.36;
      ctx.fillStyle = "#030712"; ctx.fillRect(0, 0, w, h);
      const gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.8);
      gl.addColorStop(0, "rgba(6,255,208,0.05)"); gl.addColorStop(1, "transparent");
      ctx.fillStyle = gl; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.strokeStyle = "rgba(6,255,208,0.025)"; ctx.lineWidth = 0.5;
      for (let x = 80; x < w; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 80; y < h; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.restore();
      ctx.save(); ctx.strokeStyle = "rgba(6,255,208,0.1)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      const ig = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, R * 0.1, cx, cy, R);
      ig.addColorStop(0, "rgba(6,255,208,0.06)"); ig.addColorStop(1, "rgba(3,7,18,0.4)"); ctx.fillStyle = ig; ctx.fill(); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
      ctx.strokeStyle = "rgba(6,255,208,0.04)"; ctx.lineWidth = 0.6; ctx.globalAlpha = 0.06;
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI + t * 0.15; ctx.beginPath(); ctx.ellipse(cx, cy, Math.abs(Math.cos(a)) * R, R, 0, 0, Math.PI * 2); ctx.stroke(); }
      ctx.globalAlpha = 0.04;
      for (let i = 1; i < 7; i++) { const ly = cy - R + (2 * R * i) / 7; const lr = Math.sqrt(Math.max(0, R * R - (ly - cy) * (ly - cy))); ctx.beginPath(); ctx.ellipse(cx, ly, lr, lr * 0.12, 0, 0, Math.PI * 2); ctx.stroke(); }
      ctx.restore();
      scanAngle += 0.008; ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
      const sg = ctx.createConicGradient(scanAngle % (Math.PI * 2), cx, cy);
      sg.addColorStop(0, "rgba(6,255,208,0.06)"); sg.addColorStop(0.08, "rgba(6,255,208,0.02)"); sg.addColorStop(0.15, "transparent"); sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg; ctx.fillRect(cx - R, cy - R, R * 2, R * 2); ctx.restore();
      if (now - lastAttack > 1100) {
        const ai = Math.floor(Math.random() * FB_NODES.length); let bi = Math.floor(Math.random() * FB_NODES.length); while (bi === ai) bi = Math.floor(Math.random() * FB_NODES.length);
        attacks.push({ from: FB_NODES[ai], to: FB_NODES[bi], color: colors[Math.floor(Math.random() * colors.length)], born: now });
        if (attacks.length > 12) attacks.shift(); lastAttack = now;
      }
      for (let a = attacks.length - 1; a >= 0; a--) {
        const atk = attacks[a]; const age = (now - atk.born) / 1000; if (age > 5.5) { attacks.splice(a, 1); continue; }
        const fade = Math.max(0, 1 - age / 5); const x1 = atk.from.x * w, y1 = atk.from.y * h, x2 = atk.to.x * w, y2 = atk.to.y * h;
        const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2); const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - Math.max(25, dist * 0.25);
        ctx.save(); ctx.strokeStyle = atk.color; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.5 * fade; ctx.shadowColor = atk.color; ctx.shadowBlur = 8; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(mx, my, x2, y2); ctx.stroke(); ctx.shadowBlur = 0; ctx.restore();
        const pt = (age * 0.28) % 1; const px = (1 - pt) ** 2 * x1 + 2 * (1 - pt) * pt * mx + pt ** 2 * x2; const py = (1 - pt) ** 2 * y1 + 2 * (1 - pt) * pt * my + pt ** 2 * y2;
        ctx.save(); ctx.globalAlpha = 0.3 * fade; ctx.fillStyle = atk.color; ctx.shadowColor = atk.color; ctx.shadowBlur = 12; ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.9 * fade; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(px, py, 1.8, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
      for (const n of FB_NODES) {
        const nx = n.x * w, ny = n.y * h; const breathe = 0.35 + Math.sin(t * 2 + n.x * 15) * 0.2;
        ctx.save(); ctx.globalAlpha = breathe * 0.5; ctx.fillStyle = "#06ffd0"; ctx.shadowColor = "#06ffd0"; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(nx, ny, 4, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.9; ctx.fillStyle = "#06ffd0"; ctx.beginPath(); ctx.arc(nx, ny, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(nx, ny, 1, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.4; ctx.fillStyle = "#8ba4be"; ctx.font = "600 7px 'JetBrains Mono', monospace"; ctx.fillText(n.label, nx + 7, ny + 2); ctx.restore();
      }
      ctx.save(); ctx.strokeStyle = "#06ffd0"; ctx.lineWidth = 1; ctx.globalAlpha = 0.12; const pad = 10, len = 20;
      ctx.beginPath(); ctx.moveTo(pad, pad + len); ctx.lineTo(pad, pad); ctx.lineTo(pad + len, pad); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w - pad - len, pad); ctx.lineTo(w - pad, pad); ctx.lineTo(w - pad, pad + len); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pad, h - pad - len); ctx.lineTo(pad, h - pad); ctx.lineTo(pad + len, h - pad); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w - pad - len, h - pad); ctx.lineTo(w - pad, h - pad); ctx.lineTo(w - pad, h - pad - len); ctx.stroke(); ctx.restore();
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [size]);

  return (
    <div style={{ width: "100%", height: size, background: "#030712", position: "relative" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN EXPORT
   ══════════════════════════════════════════ */
export default memo(function CyberGlobe({ size = 520 }) {
  const [useFallback, setUseFallback] = useState(() => {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      return !gl;
    } catch { return true; }
  });

  const handleContextLost = useCallback(() => setUseFallback(true), []);

  if (useFallback) {
    return <FallbackGlobe size={size} />;
  }

  return <Globe3D size={size} onContextLost={handleContextLost} />;
});
