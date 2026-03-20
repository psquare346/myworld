/* ============================================
   Globe – Three.js Interactive Globe
   ============================================ */

(function () {
  const container = document.getElementById('globe-container');
  if (!container) return;

  // --- Scene Setup ---
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 3.2;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // --- Globe (dot matrix sphere) ---
  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // Create dotted sphere
  const dotGeo = new THREE.BufferGeometry();
  const positions = [];
  const radius = 1.2;
  const dotCount = 3000;

  for (let i = 0; i < dotCount; i++) {
    const phi = Math.acos(-1 + (2 * i) / dotCount);
    const theta = Math.sqrt(dotCount * Math.PI) * phi;
    const x = radius * Math.cos(theta) * Math.sin(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(phi);
    positions.push(x, y, z);
  }

  dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  const dotMat = new THREE.PointsMaterial({
    color: 0x00f0ff,
    size: 0.012,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
  });

  const dotSphere = new THREE.Points(dotGeo, dotMat);
  globeGroup.add(dotSphere);

  // Wireframe rings
  const ringGeo = new THREE.RingGeometry(1.35, 1.37, 80);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x8b5cf6,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
  });

  const ring1 = new THREE.Mesh(ringGeo, ringMat);
  ring1.rotation.x = Math.PI / 2;
  globeGroup.add(ring1);

  const ring2 = new THREE.Mesh(ringGeo.clone(), ringMat.clone());
  ring2.rotation.x = Math.PI / 3;
  ring2.rotation.z = Math.PI / 4;
  globeGroup.add(ring2);

  // Outer glow sphere
  const glowGeo = new THREE.SphereGeometry(1.5, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.03,
    side: THREE.BackSide,
  });
  const glowSphere = new THREE.Mesh(glowGeo, glowMat);
  globeGroup.add(glowSphere);

  // --- Project Tile Markers ---
  const projects = [
    { name: 'QuantBot ML Trading', lat: 40, lng: -74, id: 'quantbot' },
    { name: 'QRForge', lat: 51, lng: 0, id: 'qrforge' },
    { name: "B's Grocery Ordering", lat: 35, lng: -119, id: 'bsgrocery' },
    { name: 'HTF Scanner', lat: 48, lng: 2, id: 'htfscanner' },
    { name: 'SAP BTP App', lat: -33, lng: 151, id: 'sapbtp' },
    { name: 'OptiFlow Optimizer', lat: 55, lng: 37, id: 'optiflow' },
    { name: 'Discord Signal Trader', lat: 25, lng: 55, id: 'discordtrader' },
    { name: 'NQ Futures Backtester', lat: -22, lng: -43, id: 'nqbacktest' },
  ];

  const markers = [];
  const markerGroup = new THREE.Group();
  globeGroup.add(markerGroup);

  projects.forEach((proj) => {
    const pos = latLngToVector3(proj.lat, proj.lng, radius + 0.02);
    
    // Marker dot
    const markerGeo = new THREE.SphereGeometry(0.025, 8, 8);
    const markerMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.9,
    });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.copy(pos);
    marker.userData = proj;
    markerGroup.add(marker);
    markers.push(marker);

    // Glow ring around marker
    const pulseGeo = new THREE.RingGeometry(0.03, 0.05, 16);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const pulseRing = new THREE.Mesh(pulseGeo, pulseMat);
    pulseRing.position.copy(pos);
    pulseRing.lookAt(0, 0, 0);
    markerGroup.add(pulseRing);
  });

  function latLngToVector3(lat, lng, r) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  }

  // --- Raycaster for Click Detection ---
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let tooltip = null;

  // Create tooltip
  tooltip = document.createElement('div');
  tooltip.className = 'globe-tooltip';
  tooltip.style.cssText = `
    position: absolute;
    padding: 6px 14px;
    background: rgba(10, 10, 30, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 240, 255, 0.3);
    border-radius: 6px;
    color: #00f0ff;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 100;
    white-space: nowrap;
  `;
  container.appendChild(tooltip);
  container.style.position = 'relative';

  function onMouseMove(e) {
    const rect = container.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(markers);

    if (intersects.length > 0) {
      const proj = intersects[0].object.userData;
      tooltip.textContent = proj.name;
      tooltip.style.opacity = '1';
      tooltip.style.left = (e.clientX - rect.left + 15) + 'px';
      tooltip.style.top = (e.clientY - rect.top - 10) + 'px';
      container.style.cursor = 'pointer';
    } else {
      tooltip.style.opacity = '0';
      container.style.cursor = 'grab';
    }
  }

  function onClick(e) {
    const rect = container.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(markers);

    if (intersects.length > 0) {
      const proj = intersects[0].object.userData;
      if (typeof openModal === 'function') {
        openModal(proj.id);
      }
    }
  }

  container.addEventListener('mousemove', onMouseMove);
  container.addEventListener('click', onClick);

  // --- Mouse Drag Rotation ---
  let isDragging = false;
  let prevMouse = { x: 0, y: 0 };
  let rotationVelocity = { x: 0, y: 0 };

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMouse = { x: e.clientX, y: e.clientY };
    container.style.cursor = 'grabbing';
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    container.style.cursor = 'grab';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
    rotationVelocity.y = dx * 0.005;
    rotationVelocity.x = dy * 0.005;
    prevMouse = { x: e.clientX, y: e.clientY };
  });

  // --- Touch support ---
  container.addEventListener('touchstart', (e) => {
    isDragging = true;
    prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });

  container.addEventListener('touchend', () => { isDragging = false; });

  container.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - prevMouse.x;
    const dy = e.touches[0].clientY - prevMouse.y;
    rotationVelocity.y = dx * 0.005;
    rotationVelocity.x = dy * 0.005;
    prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });

  // --- Animation Loop ---
  function animate() {
    requestAnimationFrame(animate);

    // Auto rotation
    if (!isDragging) {
      globeGroup.rotation.y += 0.003;
      rotationVelocity.x *= 0.95;
      rotationVelocity.y *= 0.95;
    }

    globeGroup.rotation.y += rotationVelocity.y;
    globeGroup.rotation.x += rotationVelocity.x;

    // Clamp vertical rotation
    globeGroup.rotation.x = Math.max(-0.8, Math.min(0.8, globeGroup.rotation.x));

    // Pulse markers
    const time = Date.now() * 0.003;
    markers.forEach((m, i) => {
      const scale = 1 + 0.3 * Math.sin(time + i);
      m.scale.setScalar(scale);
    });

    renderer.render(scene, camera);
  }

  animate();

  // --- ISS Live Marker ---
  const issGeo = new THREE.SphereGeometry(0.04, 12, 12);
  const issMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 1.0,
  });
  const issMarker = new THREE.Mesh(issGeo, issMat);
  issMarker.visible = false;
  globeGroup.add(issMarker);

  // ISS glow ring
  const issRingGeo = new THREE.RingGeometry(0.05, 0.08, 24);
  const issRingMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  });
  const issRing = new THREE.Mesh(issRingGeo, issRingMat);
  issRing.visible = false;
  globeGroup.add(issRing);

  // Expose update function for nasa.js to call
  let lastISSLat = 0, lastISSLng = 0;
  window.updateISSPosition = function (lat, lng) {
    lastISSLat = lat;
    lastISSLng = lng;
    const pos = latLngToVector3(lat, lng, radius + 0.03);
    issMarker.position.copy(pos);
    issMarker.visible = true;
    issRing.position.copy(pos);
    issRing.lookAt(0, 0, 0);
    issRing.visible = true;
  };

  // Focus globe on ISS when badge is clicked
  window.focusISSOnGlobe = function () {
    // Scroll to hero
    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });

    // Rotate globe to show ISS position
    const targetRotationY = -(lastISSLng + 180) * (Math.PI / 180) + Math.PI;
    const targetRotationX = lastISSLat * (Math.PI / 180) * 0.3;

    // Animate rotation
    const startY = globeGroup.rotation.y;
    const startX = globeGroup.rotation.x;
    const duration = 1200;
    const startTime = Date.now();

    function animateFocus() {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - t, 3);

      globeGroup.rotation.y = startY + (targetRotationY - startY) * ease;
      globeGroup.rotation.x = startX + (targetRotationX - startX) * ease;

      if (t < 1) requestAnimationFrame(animateFocus);
    }

    animateFocus();

    // Flash the ISS marker
    let flashes = 0;
    const flashInterval = setInterval(() => {
      issMarker.visible = !issMarker.visible;
      issRing.visible = !issRing.visible;
      flashes++;
      if (flashes >= 8) {
        clearInterval(flashInterval);
        issMarker.visible = true;
        issRing.visible = true;
      }
    }, 150);
  };

  // --- Resize ---
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
})();
