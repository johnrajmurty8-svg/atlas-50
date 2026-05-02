'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';
import type { Topology } from 'topojson-specification';
import { latLonToVec3 } from '../lib/globeUtils';
import type { Destination, GlobeRef } from '../lib/types';

const INTRO_DURATION_MS = 1400;
const INTRO_START_Z = 1.8;
const INTRO_END_Z   = 5.75;

function computeGlobeRotation(lat: number, lon: number): { x: number; y: number } {
  const phi   = (90 - lat)  * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return { x: Math.PI / 2 - phi, y: theta - Math.PI / 2 };
}

interface CultureGlobeProps {
  destinations: Destination[];
  visibleIds: string[];
  onHover: (dest: Destination | null) => void;
  onClick: (dest: Destination) => void;
  spinSpeed?: number;
  startingLocation?: { lat: number; lon: number } | null;
  onIntroComplete?: () => void;
}

const CultureGlobe = forwardRef<GlobeRef, CultureGlobeProps>(
  function CultureGlobe({ destinations, visibleIds, onHover, onClick, spinSpeed = 0.0336, startingLocation, onIntroComplete }, ref) {
    const mountRef = useRef<HTMLDivElement>(null);
    const introPlayedRef = useRef(false);
    const [webglFailed, setWebglFailed] = useState(false);
    const spinSpeedRef = useRef(spinSpeed);
    useEffect(() => { spinSpeedRef.current = spinSpeed; }, [spinSpeed]);

    const visibleIdsRef = useRef(visibleIds);
    useEffect(() => { visibleIdsRef.current = visibleIds; }, [visibleIds]);

    const worldRef = useRef<Topology | null>(null);
    const [worldReady, setWorldReady] = useState(false);
    useEffect(() => {
      fetch('/data/countries-110m.json')
        .then(r => r.json())
        .then((data: Topology) => { worldRef.current = data; setWorldReady(true); })
        .catch(() => { setWorldReady(true); }); // fall through gracefully if fetch fails
    }, []);

    const stateRef = useRef<{
      group?: THREE.Group;
      camera?: THREE.PerspectiveCamera;
      userPaused: boolean;
      targetRot: { x: number; y: number } | null;
    }>({ userPaused: false, targetRot: null });

    useImperativeHandle(ref, () => ({
      flyTo(destination: Destination) {
        const s = stateRef.current;
        if (!s.group) return;
        const { x: rawTargetX, y: rawTargetY } = computeGlobeRotation(destination.lat, destination.lon);
        // Normalise accumulated rotation to [-PI, PI] then take shortest angular delta
        // to prevent multi-rotation backward spin after heavy user dragging.
        const currentY = ((s.group.rotation.y % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
        let deltaY = rawTargetY - currentY;
        if (deltaY >  Math.PI) deltaY -= Math.PI * 2;
        if (deltaY < -Math.PI) deltaY += Math.PI * 2;
        s.targetRot = { x: rawTargetX, y: s.group.rotation.y + deltaY };
        s.userPaused = true;
      },
      resume() {
        stateRef.current.userPaused = false;
        stateRef.current.targetRot = null;
      },
    }));

    useEffect(() => {
      const mount = mountRef.current;
      if (!mount) return;

      if (!window.WebGLRenderingContext) {
        setWebglFailed(true);
        return;
      }

      const W = mount.clientWidth;
      const H = mount.clientHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
      camera.position.z = INTRO_END_Z;

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        setWebglFailed(true);
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      const R = 1.4;

      const canvas = document.createElement('canvas');
      canvas.width = 4096;
      canvas.height = 2048;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#070f1f';
      ctx.fillRect(0, 0, 4096, 2048);

      for (let y = 0; y < 2048; y += 16) {
        ctx.fillStyle = `rgba(30,50,90,${0.04 + 0.025 * Math.sin(y * 0.02)})`;
        ctx.fillRect(0, y, 4096, 6);
      }

      if (worldRef.current) {
        const world = worldRef.current;
        const land = topojson.feature(world, (world as any).objects.land);

        // Draw continents onto a temp canvas using standard equirectangular
        // (x=0 → lon=-180°, increasing eastward), then copy to the main canvas
        // with a mirror+offset transform so the result matches Three.js
        // SphereGeometry UV convention (u=0 → lon=0°, increasing westward).
        //
        // Two-pass copy:  x_main = (6144 - x_tmp) mod 4096
        //   Pass 1: setTransform(-1,0,0,1,6144,0) → covers canvas x=[2048,4096]
        //   Pass 2: setTransform(-1,0,0,1,2048,0) → covers canvas x=[0,2048]
        const tmp = document.createElement('canvas');
        tmp.width = 4096; tmp.height = 2048;
        const tc = tmp.getContext('2d')!;

        const projection = d3.geoEquirectangular()
          .scale(4096 / (2 * Math.PI))
          .translate([2048, 1024]);
        const path = d3.geoPath(projection, tc);

        // Base continent fill
        tc.fillStyle = '#F1E0BA';
        tc.beginPath(); path(land); tc.fill();

        // Hand-sketched texture (hatching + stipple, clipped to land)
        tc.save();
        tc.beginPath(); path(land); tc.clip();
        tc.strokeStyle = 'rgba(80,55,20,0.07)';
        tc.lineWidth = 1.6;
        tc.beginPath();
        for (let i = -2048; i < 6144; i += 18) {
          tc.moveTo(i, 0); tc.lineTo(i + 2048, 2048);
        }
        tc.stroke();
        tc.fillStyle = 'rgba(70,45,15,0.10)';
        for (let i = 0; i < 12000; i++) {
          tc.fillRect(Math.random() * 4096, Math.random() * 2048, 2, 2);
        }
        tc.restore();

        // Biome lat-band overlays (clipped to land)
        tc.save();
        tc.beginPath(); path(land); tc.clip();
        // Arctic — full at pole, fades to zero by y=440
        const arcticGrad = tc.createLinearGradient(0, 0, 0, 440);
        arcticGrad.addColorStop(0, 'rgba(255,248,240,0.35)');
        arcticGrad.addColorStop(1, 'rgba(255,248,240,0)');
        tc.fillStyle = arcticGrad;
        tc.fillRect(0, 0, 4096, 440);
        // Antarctic — fades in from y=1608, full at pole
        const antarcticGrad = tc.createLinearGradient(0, 1608, 0, 2048);
        antarcticGrad.addColorStop(0, 'rgba(255,248,240,0)');
        antarcticGrad.addColorStop(1, 'rgba(255,248,240,0.35)');
        tc.fillStyle = antarcticGrad;
        tc.fillRect(0, 1608, 4096, 440);
        // N subtropical desert belt — peaks at Tropic of Cancer (~y=756)
        const nDesertGrad = tc.createLinearGradient(0, 460, 0, 1024);
        nDesertGrad.addColorStop(0,   'rgba(130,90,30,0)');
        nDesertGrad.addColorStop(0.5, 'rgba(163,95,0,0.42)');
        nDesertGrad.addColorStop(1,   'rgba(130,90,30,0)');
        tc.fillStyle = nDesertGrad;
        tc.fillRect(0, 460, 4096, 564);
        // Equatorial — peaks at equator (y=1024)
        const equatorialGrad = tc.createLinearGradient(0, 756, 0, 1292);
        equatorialGrad.addColorStop(0,   'rgba(80,55,15,0)');
        equatorialGrad.addColorStop(0.5, 'rgba(102,51,0,0.50)');
        equatorialGrad.addColorStop(1,   'rgba(80,55,15,0)');
        tc.fillStyle = equatorialGrad;
        tc.fillRect(0, 756, 4096, 536);
        // S subtropical desert belt — peaks at Tropic of Capricorn (~y=1292)
        const sDesertGrad = tc.createLinearGradient(0, 1024, 0, 1608);
        sDesertGrad.addColorStop(0,   'rgba(130,90,30,0)');
        sDesertGrad.addColorStop(0.5, 'rgba(163,95,0,0.36)');
        sDesertGrad.addColorStop(1,   'rgba(130,90,30,0)');
        tc.fillStyle = sDesertGrad;
        tc.fillRect(0, 1024, 4096, 584);
        tc.restore();

        // Coastline stroke
        tc.strokeStyle = 'rgba(255,220,170,0.55)';
        tc.lineWidth = 4;
        tc.beginPath(); path(land); tc.stroke();

        // Copy to main canvas with horizontal mirror (x → 2048-x mod 4096) to
        // reconcile d3's lon=-180 at x=0 with Three.js sampling lon=0 at x=0.
        ctx.save();
        ctx.setTransform(-1, 0, 0, 1, 2048, 0);
        ctx.drawImage(tmp, 0, 0);
        ctx.setTransform(-1, 0, 0, 1, 6144, 0);
        ctx.drawImage(tmp, 0, 0);
        ctx.restore();
      }

      ctx.strokeStyle = 'rgba(255,220,170,0.10)';
      ctx.lineWidth = 2;
      for (let lat = 0; lat <= 2048; lat += 2048 / 18) {
        ctx.beginPath(); ctx.moveTo(0, lat); ctx.lineTo(4096, lat); ctx.stroke();
      }
      for (let lon = 0; lon <= 4096; lon += 4096 / 36) {
        ctx.beginPath(); ctx.moveTo(lon, 0); ctx.lineTo(lon, 2048); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255,210,140,0.28)';
      ctx.lineWidth = 3.2;
      [1024, 1024 * (1 - 23.5 / 90), 1024 * (1 + 23.5 / 90)].forEach(y => {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(4096, y); ctx.stroke();
      });

      const tex = new THREE.CanvasTexture(canvas);
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

      const earth = new THREE.Mesh(
        new THREE.SphereGeometry(R, 128, 128),
        new THREE.MeshBasicMaterial({ map: tex })
      );
      group.add(earth);

      const atmo = new THREE.Mesh(
        new THREE.SphereGeometry(R * 1.08, 64, 64),
        new THREE.ShaderMaterial({
          uniforms: {},
          vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
          fragmentShader: `varying vec3 vN; void main(){ float i = pow(0.72 - dot(vN, vec3(0.,0.,1.0)), 2.0); gl_FragColor = vec4(0.95,0.78,0.35,1.0)*i; }`,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
          transparent: true,
        })
      );
      group.add(atmo);

      const dustCount = 1500;
      const dustPos = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount; i++) {
        const r = 10 + Math.random() * 8;
        const t = Math.random() * Math.PI * 2;
        const p = Math.acos(2 * Math.random() - 1);
        dustPos[i * 3] = r * Math.sin(p) * Math.cos(t);
        dustPos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
        dustPos[i * 3 + 2] = r * Math.cos(p);
      }
      const dustGeom = new THREE.BufferGeometry();
      dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
      const dust = new THREE.Points(dustGeom, new THREE.PointsMaterial({
        color: 0xfffaf0, size: 0.06, transparent: true, opacity: 1.0, sizeAttenuation: true,
      }));
      scene.add(dust);

      const hotspotGroup = new THREE.Group();
      group.add(hotspotGroup);
      const hotspotMeshes: THREE.Mesh[] = [];

      destinations.forEach((dest) => {
        const pos = latLonToVec3(dest.lat, dest.lon, R * 1.005);

        const core = new THREE.Mesh(
          new THREE.SphereGeometry(0.014, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xc8a200 })
        );
        core.position.copy(pos);
        core.userData = { dest, kind: 'core' };
        hotspotGroup.add(core);
        hotspotMeshes.push(core);

        const halo = new THREE.Mesh(
          new THREE.SphereGeometry(0.028, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xffd100, transparent: true, opacity: 0.65 })
        );
        halo.position.copy(pos);
        halo.userData = { dest, kind: 'halo', seed: Math.random() * Math.PI * 2 };
        hotspotGroup.add(halo);

        const pick = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 8, 8),
          new THREE.MeshBasicMaterial({ visible: false })
        );
        pick.position.copy(pos);
        pick.userData = { dest, kind: 'pick' };
        hotspotGroup.add(pick);
        hotspotMeshes.push(pick);
      });

      const raycaster = new THREE.Raycaster();
      const mouseNDC = new THREE.Vector2();
      const dom = renderer.domElement;
      dom.style.cursor = 'grab';
      dom.style.touchAction = 'none';

      let dragging = false, lx = 0, ly = 0, didDrag = false;

      const onPointerDown = (e: PointerEvent) => {
        dragging = true; didDrag = false;
        lx = e.clientX; ly = e.clientY;
        dom.style.cursor = 'grabbing';
        try { dom.setPointerCapture(e.pointerId); } catch { /* noop */ }
      };

      const onPointerMove = (e: PointerEvent) => {
        const rect = dom.getBoundingClientRect();
        mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        if (dragging) {
          const dx = (e.clientX - lx) * 0.005;
          const dy = (e.clientY - ly) * 0.005;
          if (Math.abs(e.clientX - lx) > 2 || Math.abs(e.clientY - ly) > 2) didDrag = true;
          group.rotation.y += dx;
          group.rotation.x = Math.max(-1.1, Math.min(1.1, group.rotation.x + dy));
          stateRef.current.userPaused = true;
          stateRef.current.targetRot = null;
          lx = e.clientX; ly = e.clientY;
          onHover(null);
        } else {
          raycaster.setFromCamera(mouseNDC, camera);
          const hits = raycaster.intersectObjects(hotspotMeshes, false);
          if (hits.length) {
            const dest = hits[0].object.userData.dest as Destination;
            dom.style.cursor = 'pointer';
            onHover(dest);
          } else {
            dom.style.cursor = 'grab';
            onHover(null);
          }
        }
      };

      const onPointerUp = (e: PointerEvent) => {
        if (dragging && !didDrag) {
          raycaster.setFromCamera(mouseNDC, camera);
          const hits = raycaster.intersectObjects(hotspotMeshes, false);
          if (hits.length) {
            onClick(hits[0].object.userData.dest as Destination);
          }
        }
        dragging = false;
        dom.style.cursor = 'grab';
        try { dom.releasePointerCapture(e.pointerId); } catch { /* noop */ }
      };

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        camera.position.z = Math.max(2.4, Math.min(6.5, camera.position.z + e.deltaY * 0.002));
      };

      dom.addEventListener('pointerdown', onPointerDown);
      dom.addEventListener('pointermove', onPointerMove);
      dom.addEventListener('pointerup', onPointerUp);
      dom.addEventListener('pointercancel', onPointerUp);
      dom.addEventListener('wheel', onWheel, { passive: false });

      const onResize = () => {
        const w = mount.clientWidth, h = mount.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(onResize);
      ro.observe(mount);

      stateRef.current = { group, camera, userPaused: false, targetRot: null };

      let introActive = false;
      let introStartT = 0;

      if (
        startingLocation &&
        !introPlayedRef.current &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        const { x: targetX, y: targetY } = computeGlobeRotation(startingLocation.lat, startingLocation.lon);
        group.rotation.x = targetX;
        group.rotation.y = targetY;
        camera.position.z = INTRO_START_Z;
        stateRef.current.userPaused = true;
        introActive = true;
        introStartT = performance.now();
      }

      if (!introActive) onIntroComplete?.();

      let t0 = performance.now();
      let raf: number;

      function tick() {
        const t = performance.now();
        const dt = (t - t0) / 1000;
        t0 = t;
        const s = stateRef.current;

        if (introActive && s.camera) {
          const elapsed = performance.now() - introStartT;
          const progress = Math.min(elapsed / INTRO_DURATION_MS, 1);
          const eased = 1 - Math.pow(1 - progress, 5);
          s.camera.position.z = INTRO_START_Z + (INTRO_END_Z - INTRO_START_Z) * eased;
          if (progress >= 1) {
            s.camera.position.z = INTRO_END_Z;
            introActive = false;
            s.userPaused = false;
            introPlayedRef.current = true;
            onIntroComplete?.();
          }
        }

        if (s.targetRot && s.group) {
          const ease = 1 - Math.pow(0.001, dt);
          s.group.rotation.x += (s.targetRot.x - s.group.rotation.x) * ease;
          s.group.rotation.y += (s.targetRot.y - s.group.rotation.y) * ease;
          if (
            Math.abs(s.targetRot.x - s.group.rotation.x) < 0.002 &&
            Math.abs(s.targetRot.y - s.group.rotation.y) < 0.002
          ) {
            s.targetRot = null;
          }
        } else if (!dragging && !s.userPaused && s.group) {
          s.group.rotation.y += spinSpeedRef.current * dt;
        }

        const vIds = visibleIdsRef.current;
        const filterActive = vIds.length < destinations.length;

        hotspotGroup.children.forEach(m => {
          const mesh = m as THREE.Mesh;
          const mat = mesh.material as THREE.MeshBasicMaterial;
          const isVisible = vIds.includes(m.userData.dest?.id);

          if (m.userData.kind === 'halo') {
            if (filterActive && isVisible) {
              // Intense pulse for matched dots — orange glow
              mat.color.setHex(0xff8c00);
              const s2 = 1 + 0.8 * Math.abs(Math.sin(t * 0.004 + m.userData.seed));
              mesh.scale.setScalar(s2);
              mat.opacity = 0.40 + 0.40 * (1 - Math.abs(Math.sin(t * 0.004 + m.userData.seed)));
            } else if (filterActive && !isVisible) {
              mesh.scale.setScalar(1);
              mat.opacity = 0.02;
            } else {
              mat.color.setHex(0xffd100);
              const s2 = 1 + 0.8 * Math.abs(Math.sin(t * 0.004 + m.userData.seed));
              mesh.scale.setScalar(s2);
              mat.opacity = 0.40 + 0.40 * (1 - Math.abs(Math.sin(t * 0.004 + m.userData.seed)));
            }
          } else if (m.userData.kind === 'core') {
            if (filterActive && isVisible) {
              mat.color.setHex(0xff8c00);
              mat.opacity = 1.0;
              mat.transparent = false;
            } else if (filterActive && !isVisible) {
              mat.color.setHex(0xc8a200);
              mat.opacity = 0.08;
              mat.transparent = true;
            } else {
              mat.color.setHex(0xc8a200);
              mat.opacity = 1.0;
              mat.transparent = false;
            }
          }
        });

        dust.rotation.y -= 0.022 * dt;
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      }
      tick();

      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        dom.removeEventListener('pointerdown', onPointerDown);
        dom.removeEventListener('pointermove', onPointerMove);
        dom.removeEventListener('pointerup', onPointerUp);
        dom.removeEventListener('pointercancel', onPointerUp);
        dom.removeEventListener('wheel', onWheel);
        renderer.dispose();
        if (dom.parentNode) dom.parentNode.removeChild(dom);
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [destinations, worldReady]);

    if (webglFailed) {
      return (
        <div style={{
          position: 'absolute', inset: 0,
          background: '#050912',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            textAlign: 'center', padding: '0 40px',
            fontFamily: 'var(--font-mono)', fontSize: 12,
            letterSpacing: '0.25em', color: 'rgba(255,220,170,0.55)',
            lineHeight: 1.8,
          }}>
            <div style={{ fontSize: 36, marginBottom: 20, fontFamily: 'var(--font-serif)', color: '#fff' }}>
              Atlas<span style={{ color: '#ffd100' }}>/</span>50
            </div>
            Your browser doesn&apos;t support WebGL.<br />
            Atlas /50 requires a modern browser.
          </div>
        </div>
      );
    }

    return (
      <div
        ref={mountRef}
        style={{ position: 'absolute', inset: 0 }}
        aria-label="Interactive 3D globe showing travel destinations"
        role="img"
      />
    );
  }
);

export default CultureGlobe;
