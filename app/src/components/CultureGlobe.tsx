'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';
import type { Topology } from 'topojson-specification';
import { latLonToVec3 } from '../lib/globeUtils';
import type { Destination, GlobeRef } from '../lib/types';

interface CultureGlobeProps {
  destinations: Destination[];
  visibleIds: string[];
  onHover: (dest: Destination | null) => void;
  onClick: (dest: Destination) => void;
  spinSpeed?: number;
}

const CultureGlobe = forwardRef<GlobeRef, CultureGlobeProps>(
  function CultureGlobe({ destinations, visibleIds, onHover, onClick, spinSpeed = 0.0336 }, ref) {
    const mountRef = useRef<HTMLDivElement>(null);
    const [webglFailed, setWebglFailed] = useState(false);
    const spinSpeedRef = useRef(spinSpeed);
    useEffect(() => { spinSpeedRef.current = spinSpeed; }, [spinSpeed]);

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
        const phi = (90 - destination.lat) * Math.PI / 180;
        const theta = (destination.lon + 180) * Math.PI / 180;
        const targetY = -theta + Math.PI / 2;
        const targetX = Math.PI / 2 - phi;
        s.targetRot = { x: targetX, y: targetY };
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
      camera.position.z = 5.0;

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
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#070f1f';
      ctx.fillRect(0, 0, 2048, 1024);

      for (let y = 0; y < 1024; y += 8) {
        ctx.fillStyle = `rgba(30,50,90,${0.04 + 0.025 * Math.sin(y * 0.04)})`;
        ctx.fillRect(0, y, 2048, 3);
      }

      if (worldRef.current) {
        const world = worldRef.current;
        const land = topojson.feature(world, (world as any).objects.land);

        // Draw continents onto a temp canvas using standard equirectangular
        // (x=0 → lon=-180°, increasing eastward), then copy to the main canvas
        // with a mirror+offset transform so the result matches Three.js
        // SphereGeometry UV convention (u=0 → lon=0°, increasing westward).
        //
        // Two-pass copy:  x_main = (3072 - x_tmp) mod 2048
        //   Pass 1: setTransform(-1,0,0,1,3072,0) → covers canvas x=[1024,2048]
        //   Pass 2: setTransform(-1,0,0,1,1024,0) → covers canvas x=[0,1024]
        const tmp = document.createElement('canvas');
        tmp.width = 2048; tmp.height = 1024;
        const tc = tmp.getContext('2d')!;

        const projection = d3.geoEquirectangular()
          .scale(2048 / (2 * Math.PI))
          .translate([1024, 512]);
        const path = d3.geoPath(projection, tc);

        // Base continent fill
        tc.fillStyle = '#c9b99a';
        tc.beginPath(); path(land); tc.fill();

        // Hand-sketched texture (hatching + stipple, clipped to land)
        tc.save();
        tc.beginPath(); path(land); tc.clip();
        tc.strokeStyle = 'rgba(80,55,20,0.07)';
        tc.lineWidth = 0.8;
        tc.beginPath();
        for (let i = -1024; i < 3072; i += 9) {
          tc.moveTo(i, 0); tc.lineTo(i + 1024, 1024);
        }
        tc.stroke();
        tc.fillStyle = 'rgba(70,45,15,0.10)';
        for (let i = 0; i < 3000; i++) {
          tc.fillRect(Math.random() * 2048, Math.random() * 1024, 1, 1);
        }
        tc.restore();

        // Biome lat-band overlays (clipped to land)
        tc.save();
        tc.beginPath(); path(land); tc.clip();
        tc.fillStyle = 'rgba(230,220,200,0.18)';
        tc.fillRect(0, 0, 2048, 142); tc.fillRect(0, 882, 2048, 142);
        tc.fillStyle = 'rgba(195,155,70,0.22)';
        tc.fillRect(0, 330, 2048, 97);
        tc.fillStyle = 'rgba(60,50,20,0.15)';
        tc.fillRect(0, 444, 2048, 136);
        tc.fillStyle = 'rgba(195,155,70,0.18)';
        tc.fillRect(0, 597, 2048, 97);
        tc.restore();

        // Coastline stroke
        tc.strokeStyle = 'rgba(255,220,170,0.55)';
        tc.lineWidth = 2;
        tc.beginPath(); path(land); tc.stroke();

        // Copy to main canvas shifted by 1024px (180° longitude) so the seam
        // moves from canvas-center to canvas-edge, matching Three.js UV.
        // No mirror — continent shapes preserve their natural orientation.
        ctx.drawImage(tmp, -1024, 0);
        ctx.drawImage(tmp, 1024, 0);
      }

      ctx.strokeStyle = 'rgba(255,220,170,0.10)';
      ctx.lineWidth = 1;
      for (let lat = 0; lat <= 1024; lat += 1024 / 18) {
        ctx.beginPath(); ctx.moveTo(0, lat); ctx.lineTo(2048, lat); ctx.stroke();
      }
      for (let lon = 0; lon <= 2048; lon += 2048 / 36) {
        ctx.beginPath(); ctx.moveTo(lon, 0); ctx.lineTo(lon, 1024); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255,210,140,0.28)';
      ctx.lineWidth = 1.6;
      [512, 512 * (1 - 23.5 / 90), 512 * (1 + 23.5 / 90)].forEach(y => {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(2048, y); ctx.stroke();
      });

      const tex = new THREE.CanvasTexture(canvas);
      tex.anisotropy = 8;

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
          new THREE.MeshBasicMaterial({ color: 0xffd100 })
        );
        core.position.copy(pos);
        core.userData = { dest, kind: 'core' };
        hotspotGroup.add(core);
        hotspotMeshes.push(core);

        const halo = new THREE.Mesh(
          new THREE.SphereGeometry(0.028, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xffd100, transparent: true, opacity: 0.35 })
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

      let t0 = performance.now();
      let raf: number;

      function tick() {
        const t = performance.now();
        const dt = (t - t0) / 1000;
        t0 = t;
        const s = stateRef.current;

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

        hotspotGroup.children.forEach(m => {
          if (m.userData.kind === 'halo') {
            const mesh = m as THREE.Mesh;
            const mat = mesh.material as THREE.MeshBasicMaterial;
            const s2 = 1 + 0.5 * Math.sin(t * 0.003 + m.userData.seed);
            mesh.scale.setScalar(s2);
            mat.opacity = 0.2 + 0.25 * (1 - Math.abs(Math.sin(t * 0.003 + m.userData.seed)));
          }
        });

        // Apply visibleIds filtering to hotspot opacity
        hotspotGroup.children.forEach(m => {
          if (m.userData.kind === 'core' || m.userData.kind === 'halo') {
            const mesh = m as THREE.Mesh;
            const mat = mesh.material as THREE.MeshBasicMaterial;
            const visible = visibleIds.includes(m.userData.dest?.id);
            if (m.userData.kind === 'core') {
              mat.opacity = visible ? 1.0 : 0.15;
              mat.transparent = !visible;
            } else {
              if (!visible) mat.opacity = 0.04;
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
