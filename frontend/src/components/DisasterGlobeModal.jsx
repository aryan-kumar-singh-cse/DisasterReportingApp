import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { X, Globe, MapPin, Eye, ExternalLink, ShieldAlert, Sparkles, Navigation } from 'lucide-react';

// Convert Lat/Lng to 3D Cartesian coordinates on sphere
function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export default function DisasterGlobeModal({
  isOpen,
  onClose,
  reports = [],
  selectedReport = null,
  onSelectReport = () => {}
}) {
  const mountRef = useRef(null);
  const [hoveredReport, setHoveredReport] = useState(null);
  const [activeTarget, setActiveTarget] = useState(null);

  const initialTarget = selectedReport || reports[0] || { latitude: 19.076, longitude: 72.877 };

  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070d);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5.8);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Groups
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();
    const earthMap = textureLoader.load('/textures/earth-blue-marble.jpg');
    const cloudsMap = textureLoader.load('/textures/earth-clouds.png');
    earthMap.colorSpace = THREE.SRGBColorSpace;

    // Earth Sphere Mesh
    const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthMap,
      shininess: 12,
      specular: new THREE.Color(0x223344)
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    globeGroup.add(earthMesh);

    // Cloud Sphere Mesh
    const cloudsGeometry = new THREE.SphereGeometry(2.025, 64, 64);
    const cloudsMaterial = new THREE.MeshPhongMaterial({
      map: cloudsMap,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    globeGroup.add(cloudsMesh);

    // Atmosphere Outer Glow Shell
    const atmosphereGeo = new THREE.SphereGeometry(2.14, 48, 48);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphereMesh);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.8);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
    rimLight.position.set(-5, -2, -4);
    scene.add(rimLight);

    // Markers for Disaster Reports
    const markersGroup = new THREE.Group();
    globeGroup.add(markersGroup);

    const markerObjects = [];

    reports.forEach((rep) => {
      if (typeof rep.latitude !== 'number' || typeof rep.longitude !== 'number') return;

      const pos = latLngToVector3(rep.latitude, rep.longitude, 2.03);

      // Determine marker color based on disaster type & dissonance
      let pinColor = 0x06b6d4; // cyan
      if (rep.disasterType === 'FIRE') pinColor = 0xef4444; // red
      else if (rep.disasterType === 'FLOOD') pinColor = 0x3b82f6; // blue
      else if ((rep.dissonanceScore || 0) >= 0.7) pinColor = 0xeab308; // yellow

      // Pin stem
      const pinStemGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.12, 8);
      const pinMat = new THREE.MeshBasicMaterial({ color: pinColor });
      const pinStem = new THREE.Mesh(pinStemGeo, pinMat);

      // Pin head sphere
      const pinHeadGeo = new THREE.SphereGeometry(0.045, 16, 16);
      const pinHead = new THREE.Mesh(pinHeadGeo, pinMat);
      pinHead.position.y = 0.06;

      // Glow beacon ring
      const ringGeo = new THREE.RingGeometry(0.03, 0.07, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: pinColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;

      const marker = new THREE.Group();
      marker.add(pinStem);
      marker.add(pinHead);
      marker.add(ring);

      marker.position.copy(pos);
      marker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());

      // Store reference to report
      marker.userData = { report: rep, ring, pinHead };
      markersGroup.add(marker);
      markerObjects.push(marker);
    });

    // Target rotation to align selected (lat, lng) to face camera
    const radLat = (initialTarget.latitude * Math.PI) / 180;
    const radLng = (initialTarget.longitude * Math.PI) / 180;
    let targetRotY = -radLng - Math.PI / 2;
    let targetRotX = radLat - 0.15;

    globeGroup.rotation.y = targetRotY;
    globeGroup.rotation.x = targetRotX;

    // Drag interaction
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let dragVelocity = { x: 0, y: 0 };

    const onPointerDown = (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
      dragVelocity = { x: 0, y: 0 };
    };

    const onPointerMove = (e) => {
      if (!isDragging) {
        // Raycast for hover detection
        const rect = container.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / width) * 2 - 1,
          -((e.clientY - rect.top) / height) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(markerObjects, true);
        if (intersects.length > 0) {
          let obj = intersects[0].object;
          while (obj.parent && !obj.userData?.report) {
            obj = obj.parent;
          }
          if (obj.userData?.report) {
            setHoveredReport(obj.userData.report);
            container.style.cursor = 'pointer';
            return;
          }
        }
        setHoveredReport(null);
        container.style.cursor = 'grab';
        return;
      }

      container.style.cursor = 'grabbing';
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x += deltaY * 0.005;

      // Clamp tilt to avoid flipping
      globeGroup.rotation.x = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, globeGroup.rotation.x));

      dragVelocity = { x: deltaX * 0.005, y: deltaY * 0.005 };
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e) => {
      if (isDragging) {
        isDragging = false;
        container.style.cursor = 'grab';

        // Check click on marker
        const rect = container.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / width) * 2 - 1,
          -((e.clientY - rect.top) / height) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(markerObjects, true);
        if (intersects.length > 0) {
          let obj = intersects[0].object;
          while (obj.parent && !obj.userData?.report) {
            obj = obj.parent;
          }
          if (obj.userData?.report) {
            onSelectReport(obj.userData.report);
          }
        }
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Cloud slow planetary drift
      cloudsMesh.rotation.y += 0.0008;

      // Inertial damping if not dragging
      if (!isDragging) {
        globeGroup.rotation.y += dragVelocity.x;
        globeGroup.rotation.x += dragVelocity.y;
        dragVelocity.x *= 0.92;
        dragVelocity.y *= 0.92;

        // Idle slow rotation when resting
        if (Math.abs(dragVelocity.x) < 0.0001 && Math.abs(dragVelocity.y) < 0.0001) {
          globeGroup.rotation.y += 0.0004;
        }
      }

      // Animate pulsing rings on pins
      markerObjects.forEach((m, idx) => {
        if (m.userData?.ring) {
          const s = 1.0 + Math.sin(elapsed * 4 + idx) * 0.35;
          m.userData.ring.scale.set(s, s, s);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      earthGeometry.dispose();
      cloudsGeometry.dispose();
      atmosphereGeo.dispose();
      earthMaterial.dispose();
      cloudsMaterial.dispose();
      atmosphereMat.dispose();
    };
  }, [isOpen, reports, initialTarget]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/90 backdrop-blur-2xl animate-fade-in">
      <div className="relative w-full max-w-5xl rounded-3xl bg-zinc-950 border border-cyan-500/40 shadow-2xl shadow-cyan-500/15 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Globe className="w-5 h-5 animate-spin" style={{ animationDuration: '24s' }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <span>TwoTruths Planetary 3D Disaster Globe</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  NASA BLUE MARBLE
                </span>
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Click & drag to rotate Earth • Click any glowing pin to inspect incident
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D Canvas Viewport */}
        <div className="relative flex-1 min-h-[440px] md:min-h-[500px] w-full bg-[#05070d] overflow-hidden flex items-center justify-center">
          <div ref={mountRef} className="w-full h-full min-h-[440px] md:min-h-[500px] cursor-grab" />

          {/* Floating Hover Card HUD */}
          {hoveredReport && (
            <div className="absolute top-4 left-4 z-20 p-3.5 rounded-2xl bg-zinc-950/90 border border-cyan-500/50 backdrop-blur-xl shadow-2xl max-w-xs animate-fade-in pointer-events-none">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold text-white font-mono">{hoveredReport.disasterType}</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-zinc-900 border border-zinc-700 text-zinc-300">
                  {hoveredReport.userSeverity}
                </span>
              </div>
              <p className="text-xs text-cyan-300 font-semibold mb-1">{hoveredReport.locationName}</p>
              <p className="text-[11px] text-zinc-400 line-clamp-2 italic mb-2">"{hoveredReport.description}"</p>
              <div className="text-[10px] text-zinc-500 font-mono">
                Dissonance: {Math.round((hoveredReport.dissonanceScore || 0) * 100)}% • Click to open
              </div>
            </div>
          )}

          {/* Quick Active Incident Navigation Pills */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-mono text-zinc-400 shrink-0 flex items-center gap-1 bg-zinc-900/80 px-2 py-1 rounded-lg border border-zinc-800">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Active Hotspots:</span>
            </span>

            {reports.slice(0, 6).map((rep) => (
              <button
                key={rep.reportId}
                onClick={() => {
                  onSelectReport(rep);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-900/85 hover:bg-cyan-950/80 border border-zinc-700/80 hover:border-cyan-400/60 text-zinc-200 hover:text-cyan-200 text-xs font-mono font-medium shrink-0 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <MapPin className="w-3 h-3 text-cyan-400" />
                <span>{rep.locationName.split(',')[0]}</span>
                <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                  rep.disasterType === 'FIRE' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {rep.disasterType}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
