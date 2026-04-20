// 3D globe component — Nat Geo continents + deep navy ocean.
// Exports: window.CultureGlobe
(function(){
  const { useRef, useEffect, useState, useImperativeHandle, forwardRef } = React;

  // Simplified continents (normalized 0..1 in x=lon, y=lat)
  const CONTINENTS = [
    [[0.10,0.18],[0.18,0.16],[0.25,0.22],[0.28,0.32],[0.22,0.42],[0.16,0.46],[0.12,0.40],[0.08,0.30]],
    [[0.24,0.52],[0.30,0.52],[0.33,0.62],[0.30,0.76],[0.26,0.80],[0.22,0.70],[0.22,0.58]],
    [[0.47,0.24],[0.55,0.22],[0.56,0.30],[0.50,0.34],[0.46,0.32]],
    [[0.48,0.36],[0.56,0.36],[0.60,0.46],[0.56,0.62],[0.50,0.68],[0.46,0.60],[0.46,0.44]],
    [[0.56,0.22],[0.78,0.20],[0.85,0.30],[0.82,0.42],[0.70,0.46],[0.62,0.42],[0.58,0.32]],
    [[0.74,0.46],[0.82,0.48],[0.84,0.56],[0.76,0.56]],
    [[0.80,0.60],[0.88,0.60],[0.90,0.68],[0.84,0.72],[0.78,0.68]],
    [[0.40,0.08],[0.46,0.08],[0.47,0.16],[0.42,0.18]],
  ];
  const FILLS = ['#d9c79a','#c9a877','#d4bb8a','#b89566','#c6a877','#b89763','#c49a66','#e8ddc3'];

  function latLonToVec3(lat, lon, radius){
    const phi = (90-lat)*Math.PI/180;
    const theta = (lon+180)*Math.PI/180;
    return new THREE.Vector3(
      radius*Math.sin(phi)*Math.cos(theta),
      radius*Math.cos(phi),
      radius*Math.sin(phi)*Math.sin(theta)
    );
  }

  const CultureGlobe = forwardRef(function CultureGlobe({ countries, onHotspotClick, onHotspotHover, autoRotateSpeed=0.03, tweaks={} }, ref){
    const mountRef = useRef(null);
    const stateRef = useRef({});

    useImperativeHandle(ref, () => ({
      flyTo(country){
        const s = stateRef.current;
        if (!s.group) return;
        // Rotate group so this country's point faces the camera (positive z).
        const phi = (90-country.lat)*Math.PI/180;
        const theta = (country.lon+180)*Math.PI/180;
        // We want rotY and rotX such that rotated point = (0, y, +z) facing us.
        // Simple approach: tween rotation.y to -theta+Math.PI/2 and rotation.x to -( phi - Math.PI/2)
        const targetY = -theta + Math.PI/2;
        const targetX = (Math.PI/2 - phi);
        s.targetRot = { x: targetX, y: targetY };
        s.userPaused = true;
      },
      resume(){ const s = stateRef.current; s.userPaused = false; s.targetRot = null; },
    }));

    useEffect(() => {
      const mount = mountRef.current;
      if (!mount) return;
      const W = mount.clientWidth, H = mount.clientHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, W/H, 0.1, 100);
      camera.position.z = 4.0;

      const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      const R = 1.4;

      // Build texture
      const canvas = document.createElement('canvas');
      canvas.width = 2048; canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      function buildTexture(cfg){
        const { oceanColor='#070f1f', continentSaturation=1, graticule=true } = cfg;
        // Deep navy ocean base
        ctx.fillStyle = oceanColor;
        ctx.fillRect(0,0,2048,1024);
        // Subtle bathymetric bands
        for (let y=0;y<1024;y+=8){
          ctx.fillStyle = `rgba(30,50,90,${0.04 + 0.025*Math.sin(y*0.04)})`;
          ctx.fillRect(0,y,2048,3);
        }

        // Continents with region-specific fills
        CONTINENTS.forEach((poly, idx) => {
          ctx.fillStyle = FILLS[idx % FILLS.length];
          ctx.beginPath();
          poly.forEach((p,i)=>{
            const x=p[0]*2048, y=p[1]*1024;
            if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
          });
          ctx.closePath();
          ctx.fill();
          // Hachure stippling
          ctx.save();
          ctx.clip();
          ctx.fillStyle = 'rgba(90,60,30,0.10)';
          for (let i=0;i<180;i++){
            const rx = Math.random()*2048, ry = Math.random()*1024;
            ctx.fillRect(rx,ry,2,1);
          }
          // subtle highlights
          ctx.fillStyle = 'rgba(255,240,200,0.06)';
          for (let i=0;i<80;i++){
            const rx = Math.random()*2048, ry = Math.random()*1024;
            ctx.fillRect(rx,ry,2,1);
          }
          ctx.restore();
          // Coastline
          ctx.strokeStyle = 'rgba(255,220,170,0.55)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          poly.forEach((p,i)=>{
            const x=p[0]*2048, y=p[1]*1024;
            if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
          });
          ctx.closePath();
          ctx.stroke();
        });

        if (graticule){
          ctx.strokeStyle = 'rgba(255,220,170,0.10)';
          ctx.lineWidth = 1;
          for (let lat=0; lat<=1024; lat+=1024/18){
            ctx.beginPath(); ctx.moveTo(0,lat); ctx.lineTo(2048,lat); ctx.stroke();
          }
          for (let lon=0; lon<=2048; lon+=2048/36){
            ctx.beginPath(); ctx.moveTo(lon,0); ctx.lineTo(lon,1024); ctx.stroke();
          }
          // Equator + tropics slightly stronger
          ctx.strokeStyle = 'rgba(255,210,140,0.28)';
          ctx.lineWidth = 1.6;
          [512, 512*(1-23.5/90), 512*(1+23.5/90)].forEach(y=>{
            ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(2048,y); ctx.stroke();
          });
        }
      }

      buildTexture({ oceanColor: tweaks.oceanColor || '#070f1f', graticule: tweaks.graticule !== false });
      const tex = new THREE.CanvasTexture(canvas);
      tex.anisotropy = 8;

      const earth = new THREE.Mesh(
        new THREE.SphereGeometry(R, 128, 128),
        new THREE.MeshBasicMaterial({ map: tex })
      );
      group.add(earth);

      // Warm golden atmospheric halo
      const atmo = new THREE.Mesh(
        new THREE.SphereGeometry(R*1.08, 64, 64),
        new THREE.ShaderMaterial({
          uniforms:{},
          vertexShader:`varying vec3 vN; void main(){ vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
          fragmentShader:`varying vec3 vN; void main(){ float i = pow(0.72 - dot(vN, vec3(0.,0.,1.0)), 2.0); gl_FragColor = vec4(0.95,0.78,0.35,1.0)*i; }`,
          blending: THREE.AdditiveBlending, side: THREE.BackSide, transparent:true,
        })
      );
      group.add(atmo);

      // Star dust
      const dustCount = 600;
      const dustPos = new Float32Array(dustCount*3);
      for (let i=0;i<dustCount;i++){
        const r = 10 + Math.random()*8;
        const t = Math.random()*Math.PI*2;
        const p = Math.acos(2*Math.random()-1);
        dustPos[i*3]   = r*Math.sin(p)*Math.cos(t);
        dustPos[i*3+1] = r*Math.sin(p)*Math.sin(t);
        dustPos[i*3+2] = r*Math.cos(p);
      }
      const dustGeom = new THREE.BufferGeometry();
      dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPos,3));
      const dust = new THREE.Points(dustGeom, new THREE.PointsMaterial({
        color:0xf5d48a, size:0.025, transparent:true, opacity:0.5, sizeAttenuation:true,
      }));
      scene.add(dust);

      // Hotspot meshes
      const hotspotGroup = new THREE.Group();
      group.add(hotspotGroup);
      const hotspotMeshes = [];
      countries.forEach((c) => {
        const pos = latLonToVec3(c.lat, c.lon, R*1.005);
        const core = new THREE.Mesh(
          new THREE.SphereGeometry(0.014, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xffd100 })
        );
        core.position.copy(pos);
        core.userData = { country: c, kind:'core' };
        hotspotGroup.add(core);
        hotspotMeshes.push(core);

        const halo = new THREE.Mesh(
          new THREE.SphereGeometry(0.028, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xffd100, transparent:true, opacity:0.35 })
        );
        halo.position.copy(pos);
        halo.userData = { country: c, kind:'halo', seed: Math.random()*Math.PI*2 };
        hotspotGroup.add(halo);

        // Pick ring — larger invisible target for easier clicking
        const pick = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 8, 8),
          new THREE.MeshBasicMaterial({ visible:false })
        );
        pick.position.copy(pos);
        pick.userData = { country: c, kind:'pick' };
        hotspotGroup.add(pick);
        hotspotMeshes.push(pick);
      });

      // Raycast
      const raycaster = new THREE.Raycaster();
      const mouseNDC = new THREE.Vector2();

      const dom = renderer.domElement;
      dom.style.cursor = 'grab';
      dom.style.touchAction = 'none';

      let dragging = false, lx=0, ly=0;
      let didDrag = false;
      const onPointerDown = (e) => {
        dragging = true; didDrag = false;
        lx = e.clientX; ly = e.clientY;
        dom.style.cursor = 'grabbing';
        try { dom.setPointerCapture(e.pointerId); } catch(err){}
      };
      const onPointerMove = (e) => {
        const rect = dom.getBoundingClientRect();
        mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        if (dragging){
          const dx = (e.clientX - lx)*0.005;
          const dy = (e.clientY - ly)*0.005;
          if (Math.abs(e.clientX - lx) > 2 || Math.abs(e.clientY - ly) > 2) didDrag = true;
          group.rotation.y += dx;
          group.rotation.x = Math.max(-1.1, Math.min(1.1, group.rotation.x + dy));
          stateRef.current.userPaused = true;
          stateRef.current.targetRot = null;
          lx = e.clientX; ly = e.clientY;
          if (onHotspotHover) onHotspotHover(null);
        } else {
          // hover detection
          raycaster.setFromCamera(mouseNDC, camera);
          const hits = raycaster.intersectObjects(hotspotMeshes, false);
          if (hits.length){
            const c = hits[0].object.userData.country;
            dom.style.cursor = 'pointer';
            if (onHotspotHover) onHotspotHover(c);
          } else {
            dom.style.cursor = 'grab';
            if (onHotspotHover) onHotspotHover(null);
          }
        }
      };
      const onPointerUp = (e) => {
        if (dragging && !didDrag){
          // treat as click
          raycaster.setFromCamera(mouseNDC, camera);
          const hits = raycaster.intersectObjects(hotspotMeshes, false);
          if (hits.length && onHotspotClick){
            onHotspotClick(hits[0].object.userData.country);
          }
        }
        dragging = false;
        dom.style.cursor = 'grab';
        try { dom.releasePointerCapture(e.pointerId); } catch(err){}
      };

      dom.addEventListener('pointerdown', onPointerDown);
      dom.addEventListener('pointermove', onPointerMove);
      dom.addEventListener('pointerup', onPointerUp);
      dom.addEventListener('pointercancel', onPointerUp);

      // Wheel zoom
      const onWheel = (e) => {
        e.preventDefault();
        camera.position.z = Math.max(2.4, Math.min(6.5, camera.position.z + e.deltaY * 0.002));
      };
      dom.addEventListener('wheel', onWheel, { passive:false });

      // Resize handler
      const onResize = () => {
        const w = mount.clientWidth, h = mount.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w/h;
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(onResize);
      ro.observe(mount);

      stateRef.current = { group, camera, userPaused:false, targetRot:null };

      let t0 = performance.now();
      let raf;
      function tick(){
        const t = performance.now();
        const dt = (t - t0)/1000; t0 = t;
        const s = stateRef.current;

        if (s.targetRot){
          // smooth rotate to target
          const ease = 1 - Math.pow(0.001, dt);
          group.rotation.x += (s.targetRot.x - group.rotation.x) * ease;
          group.rotation.y += (s.targetRot.y - group.rotation.y) * ease;
          // stop when close
          if (Math.abs(s.targetRot.x - group.rotation.x) < 0.002 &&
              Math.abs(s.targetRot.y - group.rotation.y) < 0.002){
            s.targetRot = null;
          }
        } else if (!dragging && !s.userPaused){
          group.rotation.y += (autoRotateSpeed) * dt;
        }

        // pulse halos
        hotspotGroup.children.forEach(m => {
          if (m.userData.kind === 'halo'){
            const s2 = 1 + 0.5*Math.sin(t*0.003 + m.userData.seed);
            m.scale.setScalar(s2);
            m.material.opacity = 0.2 + 0.25*(1-Math.abs(Math.sin(t*0.003+m.userData.seed)));
          }
        });
        dust.rotation.y -= 0.012*dt;
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
    }, [countries, autoRotateSpeed, tweaks.oceanColor, tweaks.graticule]);

    return <div ref={mountRef} style={{ position:'absolute', inset:0 }} />;
  });

  window.CultureGlobe = CultureGlobe;
})();
