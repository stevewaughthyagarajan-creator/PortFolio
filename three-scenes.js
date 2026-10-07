// Three.js Interactive Scenes for Steve Justin Portfolio
// Loaded via CDN in index.html

// Global mouse tracker
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
window.addEventListener('mousemove', (e) => {
  // Normalize to -1 to 1
  mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Interpolate mouse movement for smooth parallax
function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

// Update mouse coordinates smoothly
function updateMouseInterpolation() {
  mouse.x = lerp(mouse.x, mouse.targetX, 0.08);
  mouse.y = lerp(mouse.y, mouse.targetY, 0.08);
  requestAnimationFrame(updateMouseInterpolation);
}
updateMouseInterpolation();

// Setup Helper
function createScene(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  const scene = new THREE.Scene();
  
  // Camera
  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 30;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  return { scene, camera, renderer, container };
}

// ----------------------------------------------------
// 1. HERO SCENE: Neural Network Sphere
// ----------------------------------------------------
function initHeroScene() {
  const setup = createScene('hero-three-canvas');
  if (!setup) return;

  const { scene, camera, renderer, container } = setup;
  camera.position.z = 25;

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xe11d48, 1.5); // Crimson
  dirLight1.position.set(10, 10, 10);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 1.2); // Cyan
  dirLight2.position.set(-10, -10, 10);
  scene.add(dirLight2);

  // Create Neural Network Sphere
  const particleCount = 100;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];
  const radius = 8;

  for (let i = 0; i < particleCount; i++) {
    // Distribute points spherically
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Small velocity for random wandering inside sphere
    velocities.push({
      x: (Math.random() - 0.5) * 0.02,
      y: (Math.random() - 0.5) * 0.02,
      z: (Math.random() - 0.5) * 0.02
    });
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Particle Material
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.15,
    transparent: true,
    opacity: 0.8
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Wireframe outer sphere
  const sphereGeo = new THREE.SphereGeometry(radius + 0.5, 12, 12);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0xe11d48, // Crimson
    wireframe: true,
    transparent: true,
    opacity: 0.06
  });
  const outerSphere = new THREE.Mesh(sphereGeo, sphereMat);
  scene.add(outerSphere);

  // Connection Lines Helper
  const maxConnections = 120;
  const lineGeometry = new THREE.BufferGeometry();
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x8b5cf6, // Violet
    transparent: true,
    opacity: 0.2
  });

  const linePositions = new Float32Array(maxConnections * 2 * 3);
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  // Orbiting tags nodes
  const tags = ['AI', 'Python', 'Java', '3D', 'ML', 'Web', 'Startups'];
  const tagObjects = [];
  const tagElements = document.querySelectorAll('.hero-tag-element');

  tags.forEach((tag, idx) => {
    const orbitRadius = 13;
    const angle = (idx / tags.length) * Math.PI * 2;
    
    // Group to hold mesh
    const group = new THREE.Group();
    
    // Glowing dot
    const dotGeo = new THREE.SphereGeometry(0.25, 8, 8);
    const dotMat = new THREE.MeshBasicMaterial({
      color: idx % 2 === 0 ? 0x06b6d4 : 0xe11d48, // Alternating Cyan/Crimson
      transparent: true,
      opacity: 0.9
    });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    group.add(dot);

    scene.add(group);

    tagObjects.push({
      group,
      angle,
      orbitRadius,
      speed: 0.003 + (idx * 0.0005),
      element: tagElements[idx],
      yOffset: (Math.random() - 0.5) * 4
    });
  });

  // Background dust
  const dustCount = 200;
  const dustGeometry = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 60;
    dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 60;
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
  }
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dustMaterial = new THREE.PointsMaterial({
    color: 0x06b6d4, // Cyan dust
    size: 0.08,
    transparent: true,
    opacity: 0.4
  });
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  scene.add(dust);

  // Projecting 3D tags onto DOM
  const tempV = new THREE.Vector3();

  // Visibility flag
  let isVisible = true;
  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.1 });
  observer.observe(container);

  // Animation loop
  function animate() {
    if (!isVisible) {
      requestAnimationFrame(animate);
      return;
    }

    const pos = geometry.attributes.position.array;
    let lineIdx = 0;
    const activeLines = [];

    // Update positions and find connections
    for (let i = 0; i < particleCount; i++) {
      // Wandering
      pos[i * 3] += velocities[i].x;
      pos[i * 3 + 1] += velocities[i].y;
      pos[i * 3 + 2] += velocities[i].z;

      // Keep inside sphere radius boundary
      const currentDist = Math.sqrt(pos[i * 3] ** 2 + pos[i * 3 + 1] ** 2 + pos[i * 3 + 2] ** 2);
      if (currentDist > radius) {
        // Reverse direction
        velocities[i].x *= -1;
        velocities[i].y *= -1;
        velocities[i].z *= -1;
      }

      // Check distance to other nodes to draw lines
      for (let j = i + 1; j < particleCount; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < 3.2 && activeLines.length < maxConnections) {
          activeLines.push(
            pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2],
            pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]
          );
        }
      }
    }

    geometry.attributes.position.needsUpdate = true;

    // Update lines positions
    const linePos = lineGeometry.attributes.position.array;
    for (let i = 0; i < activeLines.length; i++) {
      linePos[i] = activeLines[i];
    }
    // Zero out unused elements
    for (let i = activeLines.length; i < linePositions.length; i++) {
      linePos[i] = 0;
    }
    lineGeometry.attributes.position.needsUpdate = true;

    // Rotate core structures
    particles.rotation.y += 0.001;
    particles.rotation.x += 0.0005;
    outerSphere.rotation.y -= 0.0005;
    outerSphere.rotation.x -= 0.0002;

    // Animate orbit tags
    tagObjects.forEach((tagObj) => {
      tagObj.angle += tagObj.speed;
      
      // Compute orbits in horizontal plane with minor oscillation
      const x = Math.cos(tagObj.angle) * tagObj.orbitRadius;
      const z = Math.sin(tagObj.angle) * tagObj.orbitRadius;
      const y = tagObj.yOffset + Math.sin(tagObj.angle * 2) * 1.5;

      tagObj.group.position.set(x, y, z);

      // Project 3D tag coordinates to screen
      if (tagObj.element) {
        tempV.copy(tagObj.group.position);
        
        // Project onto screen (normalized device coordinates)
        tempV.project(camera);
        
        // Convert to percentage coordinates
        const xPercent = (tempV.x * .5 + .5) * 100;
        const yPercent = (-(tempV.y * .5) + .5) * 100;

        // Position DOM element
        tagObj.element.style.left = `${xPercent}%`;
        tagObj.element.style.top = `${yPercent}%`;
        
        // Handle depth (closer = larger/fully opaque, further = smaller/transparent)
        const depthNormalized = (tempV.z + 1) / 2; // 0 to 1
        const scale = 1 - (tempV.z * 0.5); // further items are deeper in Z NDC
        
        // Simple visibility check
        if (tempV.z > 0.98) {
          tagObj.element.style.opacity = 0;
        } else {
          tagObj.element.style.opacity = Math.max(0.1, scale);
          tagObj.element.style.transform = `translate(-50%, -50%) scale(${Math.max(0.6, scale)})`;
        }
      }
    });

    // Parallax on mouse
    camera.position.x = lerp(camera.position.x, mouse.x * 6, 0.05);
    camera.position.y = lerp(camera.position.y, mouse.y * 6 + 2, 0.05);
    camera.lookAt(new THREE.Vector3(0, 2, 0));

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}

// ----------------------------------------------------
// 2. BEYOND 2D SCENE: Interactive Torus Knot
// ----------------------------------------------------
function initBeyond2DScene() {
  const setup = createScene('beyond2d-three-canvas');
  if (!setup) return;

  const { scene, camera, renderer, container } = setup;
  camera.position.z = 24;

  // Colorful Lights
  const lightRed = new THREE.DirectionalLight(0xe11d48, 2.5); // Crimson
  lightRed.position.set(20, 10, 10);
  scene.add(lightRed);

  const lightCyan = new THREE.DirectionalLight(0x06b6d4, 2.0); // Cyan
  lightCyan.position.set(-20, -10, 10);
  scene.add(lightCyan);

  const lightViolet = new THREE.PointLight(0x8b5cf6, 3, 50); // Violet
  lightViolet.position.set(0, 0, 5);
  scene.add(lightViolet);

  // Complex Torus Knot Geometry
  const geometry = new THREE.TorusKnotGeometry(7, 2.2, 120, 16);
  
  // Custom futuristic wireframe + solid glow material blend
  const material = new THREE.MeshStandardMaterial({
    color: 0x111111,
    metalness: 0.9,
    roughness: 0.15,
    wireframe: false,
    flatShading: true
  });

  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.12
  });

  const mesh = new THREE.Mesh(geometry, material);
  const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);
  mesh.add(wireframeMesh);
  scene.add(mesh);

  // Mouse Dragging States
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  renderer.domElement.addEventListener('mousedown', (e) => {
    isDragging = true;
  });

  renderer.domElement.addEventListener('mousemove', (e) => {
    const deltaMove = {
      x: e.offsetX - previousMousePosition.x,
      y: e.offsetY - previousMousePosition.y
    };

    if (isDragging) {
      const deltaRotationQuaternion = new THREE.Quaternion()
        .setFromEuler(new THREE.Euler(
          (deltaMove.y * 2 * Math.PI / 180) * 0.2,
          (deltaMove.x * 2 * Math.PI / 180) * 0.2,
          0,
          'XYZ'
        ));
      
      mesh.quaternion.multiplyQuaternions(deltaRotationQuaternion, mesh.quaternion);
    }

    previousMousePosition = {
      x: e.offsetX,
      y: e.offsetY
    };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch support for dragging
  renderer.domElement.addEventListener('touchstart', (e) => {
    isDragging = true;
    const touch = e.touches[0];
    previousMousePosition = {
      x: touch.clientX,
      y: touch.clientY
    };
  });

  renderer.domElement.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaMove = {
      x: touch.clientX - previousMousePosition.x,
      y: touch.clientY - previousMousePosition.y
    };

    const deltaRotationQuaternion = new THREE.Quaternion()
      .setFromEuler(new THREE.Euler(
        (deltaMove.y * 2 * Math.PI / 180) * 0.2,
        (deltaMove.x * 2 * Math.PI / 180) * 0.2,
        0,
        'XYZ'
      ));
    
    mesh.quaternion.multiplyQuaternions(deltaRotationQuaternion, mesh.quaternion);

    previousMousePosition = {
      x: touch.clientX,
      y: touch.clientY
    };
  });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Visibility Check
  let isVisible = false;
  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.1 });
  observer.observe(container);

  let angle = 0;
  function animate() {
    if (!isVisible) {
      requestAnimationFrame(animate);
      return;
    }

    // Auto rotate slowly if not dragging
    if (!isDragging) {
      mesh.rotation.y += 0.005;
      mesh.rotation.x += 0.002;
    }

    // Subtle breathing light animation
    angle += 0.02;
    lightViolet.position.x = Math.sin(angle) * 8;
    lightViolet.position.y = Math.cos(angle) * 8;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}

// ----------------------------------------------------
// 3. POTHOFF SCENE: Road Hologram / Detected Points
// ----------------------------------------------------
function initPothoffScene() {
  const setup = createScene('pothoff-three-canvas');
  if (!setup) return;

  const { scene, camera, renderer, container } = setup;
  camera.position.set(0, 12, 18);
  camera.lookAt(0, 0, 0);

  // Wavy Holographic Grid
  const gridWidth = 40;
  const gridHeight = 40;
  const gridSegments = 30;
  const geometry = new THREE.PlaneGeometry(gridWidth, gridHeight, gridSegments, gridSegments);
  geometry.rotateX(-Math.PI / 2); // Make horizontal

  const material = new THREE.MeshBasicMaterial({
    color: 0x334155, // Slate wireframe
    wireframe: true,
    transparent: true,
    opacity: 0.2
  });

  const gridMesh = new THREE.Mesh(geometry, material);
  scene.add(gridMesh);

  // Glow points representing potholes
  const potholeCount = 5;
  const potholes = [];
  const colors = [0xe11d48, 0xf97316, 0xe11d48, 0xf97316, 0xe11d48]; // Crimson and Orange anomalies

  // Hardcode coordinates distributed across grid
  const potholeCoords = [
    { x: -8, z: -8 },
    { x: 5, z: -5 },
    { x: -2, z: 4 },
    { x: 8, z: 6 },
    { x: -6, z: 2 }
  ];

  potholeCoords.forEach((coord, idx) => {
    const group = new THREE.Group();
    
    // Central pulsing anomaly sphere
    const sphereGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: colors[idx],
      transparent: true,
      opacity: 0.9
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    group.add(sphere);

    // Pulsing outer ring
    const ringGeo = new THREE.RingGeometry(0.1, 1.2, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: colors[idx],
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);

    group.position.set(coord.x, 0.2, coord.z);
    scene.add(group);

    potholes.push({
      group,
      ring,
      baseScale: 1,
      pulseSpeed: 0.05 + (idx * 0.01)
    });
  });

  // Dynamic light following the scanline
  const scanLight = new THREE.PointLight(0xe11d48, 5, 20);
  scanLight.position.set(0, 3, 0);
  scene.add(scanLight);

  // Scan line helper
  const scanLineGeo = new THREE.BoxGeometry(gridWidth, 0.05, 0.1);
  const scanLineMat = new THREE.MeshBasicMaterial({
    color: 0xe11d48,
    transparent: true,
    opacity: 0.3
  });
  const scanLine = new THREE.Mesh(scanLineGeo, scanLineMat);
  scene.add(scanLine);

  // Visibility Check
  let isVisible = false;
  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.1 });
  observer.observe(container);

  let clock = 0;
  function animate() {
    if (!isVisible) {
      requestAnimationFrame(animate);
      return;
    }

    clock += 0.01;

    // Scan line sweep
    const zSweep = Math.sin(clock * 1.5) * (gridHeight / 2);
    scanLine.position.z = zSweep;
    scanLight.position.z = zSweep;
    scanLight.position.x = Math.sin(clock * 3) * 10;

    // Wave the road grid slightly
    const pos = geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      const x = pos[i];
      const z = pos[i + 2];
      // Formula to compute wave based on distance from center
      const d = Math.sqrt(x*x + z*z);
      pos[i + 1] = Math.sin(d * 0.3 - clock * 4) * 0.4;
    }
    geometry.attributes.position.needsUpdate = true;

    // Pulse the potholes
    potholes.forEach((ph, idx) => {
      // Scale pulsing ring
      const scale = 1 + Math.sin(clock * 8 + idx) * 0.4;
      ph.ring.scale.set(scale, scale, scale);
      ph.ring.material.opacity = 0.5 - (scale - 1) * 0.5;

      // Adjust coordinate Y to match the grid wave
      const gridX = ph.group.position.x;
      const gridZ = ph.group.position.z;
      const d = Math.sqrt(gridX*gridX + gridZ*gridZ);
      ph.group.position.y = Math.sin(d * 0.3 - clock * 4) * 0.4 + 0.3;
    });

    // Rotate camera very slowly around scene
    gridMesh.rotation.y = clock * 0.03;
    potholes.forEach(ph => {
      // Re-align pothole positions relative to grid rotation
      const x = ph.group.position.x;
      const z = ph.group.position.z;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}

// ----------------------------------------------------
// 4. QUADEV SCENE: Floating Tech Particle Vortex
// ----------------------------------------------------
function initQuadevScene() {
  const setup = createScene('quadev-three-canvas');
  if (!setup) return;

  const { scene, camera, renderer, container } = setup;
  camera.position.z = 25;

  // Particle vortex properties
  const count = 300;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const angles = [];
  const radii = [];
  const speeds = [];
  const ySpeeds = [];

  const color1 = new THREE.Color(0x06b6d4); // Cyan
  const color2 = new THREE.Color(0x8b5cf6); // Violet

  for (let i = 0; i < count; i++) {
    // Distributed in a cylinder/vortex format
    const radius = 3 + Math.random() * 12;
    const angle = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 15;

    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(angle) * radius;

    radii.push(radius);
    angles.push(angle);
    speeds.push(0.005 + (1 / radius) * 0.05); // Faster near center
    ySpeeds.push((Math.random() - 0.5) * 0.02);

    // Interpolated color based on radius
    const mixedColor = color1.clone().lerp(color2, radius / 15);
    colors[i * 3] = mixedColor.r;
    colors[i * 3 + 1] = mixedColor.g;
    colors[i * 3 + 2] = mixedColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Glowing point material
  const material = new THREE.PointsMaterial({
    size: 0.16,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);

  // Add subtle light
  const light = new THREE.PointLight(0x06b6d4, 3, 30);
  light.position.set(0, 0, 5);
  scene.add(light);

  // Visibility Check
  let isVisible = false;
  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.1 });
  observer.observe(container);

  function animate() {
    if (!isVisible) {
      requestAnimationFrame(animate);
      return;
    }

    const pos = geometry.attributes.position.array;

    for (let i = 0; i < count; i++) {
      // Update angles
      angles[i] += speeds[i];
      
      // Vertical wave movement
      pos[i * 3 + 1] += ySpeeds[i];
      if (Math.abs(pos[i * 3 + 1]) > 8) {
        ySpeeds[i] *= -1; // Bounce back
      }

      // Update positions
      pos[i * 3] = Math.cos(angles[i]) * radii[i];
      pos[i * 3 + 2] = Math.sin(angles[i]) * radii[i];
    }

    geometry.attributes.position.needsUpdate = true;

    // Rotate system slowly
    particleSystem.rotation.y += 0.002;

    // Camera follow mouse slightly
    camera.position.x = lerp(camera.position.x, mouse.x * 5, 0.05);
    camera.position.y = lerp(camera.position.y, mouse.y * 5, 0.05);
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}

// ----------------------------------------------------
// INITIALIZE ALL SCENES ON DOM LOAD
// ----------------------------------------------------
function startThreeScenes() {
  if (typeof THREE !== 'undefined') {
    initHeroScene();
    initBeyond2DScene();
    initPothoffScene();
    initQuadevScene();
  } else {
    console.error('Three.js library not loaded.');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startThreeScenes);
} else {
  startThreeScenes();
}
