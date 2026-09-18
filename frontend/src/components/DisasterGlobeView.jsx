import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Globe,
  MapPin,
  Sparkles,
  Navigation,
  Loader2,
  CloudRain,
  Zap,
  Bot,
  ExternalLink,
  LocateFixed,
  ZoomIn,
  ZoomOut,
  X
} from 'lucide-react';

function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export default function DisasterGlobeView({
  reports = [],
  selectedReport = null,
  onSelectReport = () => {},
  onOpenRadar = null,
  onOpenLightning = null,
  onOpenChat = null,
  userGPS = null,
  onUserLocationFound = null,
  searchLocation = null
}) {
  const mountRef = useRef(null);
  const globeGroupRef = useRef(null);
  const cameraRef = useRef(null);
  const [hoveredReport, setHoveredReport] = useState(null);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [activeUserGPS, setActiveUserGPS] = useState(userGPS || null);
  const [liveGpsNotification, setLiveGpsNotification] = useState(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  const rotateToCoordsRef = useRef(null);

  // Sync external userGPS prop into local active state and focus
  useEffect(() => {
    if (userGPS) {
      setActiveUserGPS(userGPS);
      if (rotateToCoordsRef.current) {
        rotateToCoordsRef.current(userGPS.lat, userGPS.lng);
      }
      if (cameraRef.current) {
        cameraRef.current.position.z = 3.9;
      }
    }
  }, [userGPS]);

  // Sync external searchLocation prop and smoothly fly to & zoom on searched location
  useEffect(() => {
    if (searchLocation && typeof searchLocation.lat === 'number' && typeof searchLocation.lng === 'number') {
      if (rotateToCoordsRef.current) {
        rotateToCoordsRef.current(searchLocation.lat, searchLocation.lng);
      }
      if (cameraRef.current) {
        cameraRef.current.position.z = 3.8;
      }
      setLiveGpsNotification({
        title: `📍 Searched: ${searchLocation.name}`,
        coords: `${searchLocation.lat.toFixed(4)}°N, ${searchLocation.lng.toFixed(4)}°E`,
        lat: searchLocation.lat,
        lng: searchLocation.lng,
        isSearched: true,
        report: {
          locationName: searchLocation.name,
          latitude: searchLocation.lat,
          longitude: searchLocation.lng,
          disasterType: 'SEARCH TARGET',
          description: `Focused search: ${searchLocation.name} (${[searchLocation.district, searchLocation.state, searchLocation.country].filter(Boolean).join(', ')})`
        }
      });
    }
  }, [searchLocation]);

  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(2.8, cameraRef.current.position.z - 0.6);
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.min(8.0, cameraRef.current.position.z + 0.6);
    }
  };

  // Live GPS locator on the 3D globe (WeatherGPT behavior)
  const handleGlobeGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const gpsObj = { lat: latitude, lng: longitude, accuracy, locationName: 'Your Live GPS Location' };
        setActiveUserGPS(gpsObj);
        setIsLocatingGPS(false);

        // Smoothly rotate globe to face user
        if (rotateToCoordsRef.current) {
          rotateToCoordsRef.current(latitude, longitude);
        }

        if (onUserLocationFound) {
          onUserLocationFound(gpsObj);
        }

        // Show live radar prompt / notification
        setLiveGpsNotification({
          title: "🎯 Located at Your Live GPS Position",
          coords: `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`,
          lat: latitude,
          lng: longitude
        });

        // Automatically trigger radar update if available
        if (onOpenRadar) {
          setTimeout(() => {
            onOpenRadar({
              locationName: 'Your Live Location',
              latitude,
              longitude
            });
          }, 800);
        }
      },
      (err) => {
        setIsLocatingGPS(false);
        console.warn(err);
        alert("Could not access your GPS location. Please check browser permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    let renderer, animId;
    let earthGeometry, cloudsGeometry, atmosphereGeo;
    let earthMaterial, cloudsMaterial, atmosphereMat;

    try {
      const width = container.clientWidth || 800;
      const height = container.clientHeight || 600;

      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x05070d);

      // Camera setup
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      const initialZ = searchLocation ? 3.8 : 5.7;
      camera.position.set(0, 0, initialZ);
      cameraRef.current = camera;

      // Renderer setup
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

    // Globe Group
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
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
      shininess: 14,
      specular: new THREE.Color(0x223344)
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    globeGroup.add(earthMesh);

    // Cloud Sphere Mesh
    const cloudsGeometry = new THREE.SphereGeometry(2.025, 64, 64);
    const cloudsMaterial = new THREE.MeshPhongMaterial({
      map: cloudsMap,
      transparent: true,
      opacity: 0.44,
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.8);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
    rimLight.position.set(-5, -2, -4);
    scene.add(rimLight);

    // Disaster Markers
    const markersGroup = new THREE.Group();
    globeGroup.add(markersGroup);
    const markerObjects = [];

    reports.forEach((rep) => {
      if (typeof rep.latitude !== 'number' || typeof rep.longitude !== 'number') return;
      const pos = latLngToVector3(rep.latitude, rep.longitude, 2.03);

      let pinColor = 0x06b6d4; // cyan
      if (rep.disasterType === 'FIRE') pinColor = 0xef4444; // red
      else if (rep.disasterType === 'FLOOD') pinColor = 0x3b82f6; // blue
      else if ((rep.dissonanceScore || 0) >= 0.7) pinColor = 0xeab308; // yellow

      const pinStemGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.12, 8);
      const pinMat = new THREE.MeshBasicMaterial({ color: pinColor });
      const pinStem = new THREE.Mesh(pinStemGeo, pinMat);

      const pinHeadGeo = new THREE.SphereGeometry(0.045, 16, 16);
      const pinHead = new THREE.Mesh(pinHeadGeo, pinMat);
      pinHead.position.y = 0.06;

      const ringGeo = new THREE.RingGeometry(0.03, 0.07, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: pinColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;

      const marker = new THREE.Group();
      marker.add(pinStem);
      marker.add(pinHead);
      marker.add(ring);

      marker.position.copy(pos);
      marker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
      marker.userData = { report: rep, ring };

      markersGroup.add(marker);
      markerObjects.push(marker);
    });

    // User GPS 3D Marker on Globe
    let userGpsMarker = null;
    if (activeUserGPS) {
      const uPos = latLngToVector3(activeUserGPS.lat, activeUserGPS.lng, 2.035);
      const uRingGeo = new THREE.RingGeometry(0.04, 0.1, 28);
      const uRingMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
      const uRing = new THREE.Mesh(uRingGeo, uRingMat);
      uRing.rotation.x = Math.PI / 2;

      const uDotGeo = new THREE.SphereGeometry(0.055, 16, 16);
      const uDotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const uDot = new THREE.Mesh(uDotGeo, uDotMat);
      uDot.position.y = 0.06;

      userGpsMarker = new THREE.Group();
      userGpsMarker.add(uRing);
      userGpsMarker.add(uDot);
      userGpsMarker.position.copy(uPos);
      userGpsMarker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), uPos.clone().normalize());
      userGpsMarker.userData = {
        isUserGPS: true,
        ring: uRing,
        report: {
          locationName: 'Your Live GPS Location',
          latitude: activeUserGPS.lat,
          longitude: activeUserGPS.lng,
          disasterType: 'LIVE GPS',
          description: 'Live GPS Pin located on 3D Planetary Globe',
          createdAt: new Date().toISOString()
        }
      };
      globeGroup.add(userGpsMarker);
      markerObjects.push(userGpsMarker);
    }

    // Searched Location 3D Beacon on Globe
    let searchMarker = null;
    if (searchLocation && typeof searchLocation.lat === 'number' && typeof searchLocation.lng === 'number') {
      const sPos = latLngToVector3(searchLocation.lat, searchLocation.lng, 2.038);
      const sRingGeo = new THREE.RingGeometry(0.045, 0.12, 32);
      const sRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
      const sRing = new THREE.Mesh(sRingGeo, sRingMat);
      sRing.rotation.x = Math.PI / 2;

      const sStemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.18, 12);
      const sStemMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
      const sStem = new THREE.Mesh(sStemGeo, sStemMat);

      const sDotGeo = new THREE.SphereGeometry(0.065, 16, 16);
      const sDotMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const sDot = new THREE.Mesh(sDotGeo, sDotMat);
      sDot.position.y = 0.09;

      searchMarker = new THREE.Group();
      searchMarker.add(sRing);
      searchMarker.add(sStem);
      searchMarker.add(sDot);
      searchMarker.position.copy(sPos);
      searchMarker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), sPos.clone().normalize());
      searchMarker.userData = {
        isSearchedLocation: true,
        ring: sRing,
        report: {
          locationName: searchLocation.name,
          latitude: searchLocation.lat,
          longitude: searchLocation.lng,
          disasterType: 'SEARCH TARGET',
          description: `Searched location: ${searchLocation.name} (${[searchLocation.district, searchLocation.state, searchLocation.country].filter(Boolean).join(', ')})`,
          createdAt: new Date().toISOString()
        }
      };
      globeGroup.add(searchMarker);
      markerObjects.push(searchMarker);
    }

    // Default rotation centering (searched location first, or selected report, or first report)
    const initialTarget = (searchLocation && typeof searchLocation.lat === 'number')
      ? { latitude: searchLocation.lat, longitude: searchLocation.lng }
      : (selectedReport || reports[0] || { latitude: 28.8354, longitude: 77.5847 });
    const radLat = (initialTarget.latitude * Math.PI) / 180;
    const radLng = (initialTarget.longitude * Math.PI) / 180;
    globeGroup.rotation.y = -radLng - Math.PI / 2;
    globeGroup.rotation.x = radLat - 0.15;

    // Smooth rotation function to face coordinates
    rotateToCoordsRef.current = (tLat, tLng) => {
      const rLat = (tLat * Math.PI) / 180;
      const rLng = (tLng * Math.PI) / 180;
      const tY = -rLng - Math.PI / 2;
      const tX = rLat - 0.15;
      globeGroup.rotation.y = tY;
      globeGroup.rotation.x = tX;
    };

    // Drag interaction
    let isDragging = false;
    let dragStartPos = { x: 0, y: 0 };
    let prevMousePos = { x: 0, y: 0 };
    let dragVelocity = { x: 0, y: 0 };

    const onPointerDown = (e) => {
      isDragging = true;
      dragStartPos = { x: e.clientX, y: e.clientY };
      prevMousePos = { x: e.clientX, y: e.clientY };
      dragVelocity = { x: 0, y: 0 };
    };

    const onPointerMove = (e) => {
      if (!isDragging) {
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
          while (obj.parent && !obj.userData?.report && !obj.userData?.isUserGPS && !obj.userData?.isSearchedLocation) {
            obj = obj.parent;
          }
          const rep = obj.userData?.report;
          if (rep) {
            setHoveredReport(rep);
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
      globeGroup.rotation.x = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, globeGroup.rotation.x));

      dragVelocity = { x: deltaX * 0.005, y: deltaY * 0.005 };
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e) => {
      if (isDragging) {
        isDragging = false;
        container.style.cursor = 'grab';

        const moveDist = Math.hypot(e.clientX - dragStartPos.x, e.clientY - dragStartPos.y);
        // Only trigger click if movement was under 8px
        if (moveDist < 8) {
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
            while (obj.parent && !obj.userData?.report && !obj.userData?.isUserGPS && !obj.userData?.isSearchedLocation) {
              obj = obj.parent;
            }
            const rep = obj.userData?.report;
            if (rep) {
              onSelectReport(rep);
              // Open radar directly on pin click just like WeatherGPT
              if (onOpenRadar) {
                onOpenRadar(rep);
              }
              setLiveGpsNotification({
                title: rep.locationName,
                coords: `${rep.latitude?.toFixed(4)}°N, ${rep.longitude?.toFixed(4)}°E`,
                lat: rep.latitude,
                lng: rep.longitude,
                report: rep
              });
            }
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
      const elapsed = clock.getElapsedTime();

      cloudsMesh.rotation.y += 0.0008;

      if (!isDragging) {
        globeGroup.rotation.y += dragVelocity.x;
        globeGroup.rotation.x += dragVelocity.y;
        dragVelocity.x *= 0.92;
        dragVelocity.y *= 0.92;

        if (Math.abs(dragVelocity.x) < 0.0001 && Math.abs(dragVelocity.y) < 0.0001) {
          globeGroup.rotation.y += 0.0004;
        }
      }

      markerObjects.forEach((m, idx) => {
        if (m.userData?.ring) {
          const s = 1.0 + Math.sin(elapsed * 4 + idx) * 0.35;
          m.userData.ring.scale.set(s, s, s);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

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
        if (animId) cancelAnimationFrame(animId);
        container.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('resize', onResize);
        if (renderer) renderer.dispose();
        if (earthGeometry) earthGeometry.dispose();
        if (cloudsGeometry) cloudsGeometry.dispose();
        if (atmosphereGeo) atmosphereGeo.dispose();
        if (earthMaterial) earthMaterial.dispose();
        if (cloudsMaterial) cloudsMaterial.dispose();
        if (atmosphereMat) atmosphereMat.dispose();
      };
    } catch (err) {
      console.warn('WebGL initialization caught error, falling back:', err);
      setWebGlSupported(false);
    }
  }, [reports, activeUserGPS, searchLocation]);

  if (!webGlSupported) {
    return (
      <div className="w-full h-full min-h-[440px] flex flex-col items-center justify-center bg-zinc-950 p-6 text-center text-zinc-300">
        <Globe className="w-12 h-12 text-cyan-400 mb-3 animate-pulse" />
        <h3 className="text-base font-bold text-white mb-1">3D Globe Renderer</h3>
        <p className="text-xs text-zinc-400 max-w-sm mb-4">
          WebGL hardware acceleration is disabled in this browser. Use the 2D Satellite / Streets map or launch Doppler Radar directly.
        </p>
        <button
          onClick={() => {
            if (onOpenRadar) onOpenRadar(selectedReport || reports[0]);
          }}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md cursor-pointer transition"
        >
          🌧️ Open Live Radar & Maps
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[440px] relative z-0 flex-1 overflow-hidden bg-[#05070d] select-none font-sans">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full min-h-[440px] cursor-grab" />

      {/* Floating Tactical Controls Toolbar (WeatherGPT Style) */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2 bg-zinc-950/85 backdrop-blur-md p-1.5 rounded-xl border border-zinc-800 shadow-2xl flex-wrap justify-end">
        {/* Zoom In / Zoom Out Controls */}
        <div className="flex items-center bg-zinc-900 rounded-lg border border-zinc-800 p-0.5">
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In 3D Globe"
            className="p-1 rounded text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out 3D Globe"
            className="p-1 rounded text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>

        {/* Live GPS Button (Moves Globe to User & Opens Radar) */}
        <button
          type="button"
          onClick={handleGlobeGPS}
          disabled={isLocatingGPS}
          title="Fly to your exact live GPS location and open radar"
          className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-md ${
            isLocatingGPS
              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 animate-pulse'
              : 'bg-zinc-900 hover:bg-cyan-950/60 text-cyan-300 border-zinc-800 hover:border-cyan-500/50'
          }`}
        >
          {isLocatingGPS ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
          ) : (
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span>{isLocatingGPS ? 'Locating GPS...' : '🎯 My Live GPS'}</span>
        </button>

        {/* Live Radar Button */}
        {onOpenRadar && (
          <button
            type="button"
            onClick={() => onOpenRadar(selectedReport || reports[0])}
            title="Open Live Doppler Weather Radar"
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm"
          >
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
            <span>🌧️ Live Radar</span>
          </button>
        )}

        {/* Live Lightning Button */}
        {onOpenLightning && (
          <button
            type="button"
            onClick={() => onOpenLightning(selectedReport || reports[0])}
            title="Open IITM / DAMINI Lightning Scope"
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-yellow-950/60 text-yellow-300 border border-yellow-500/30 hover:border-yellow-400 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>⚡ Lightning</span>
          </button>
        )}

        {/* Crisis GPT Button */}
        {onOpenChat && (
          <button
            type="button"
            onClick={onOpenChat}
            title="Chat with ResQ Crisis AI (Groq 120B / Gemini)"
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold flex items-center gap-1.5 text-xs shadow-md transition-all cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>💬 Crisis GPT</span>
          </button>
        )}
      </div>

      {/* GPS / Location Acquired Notification Card */}
      {liveGpsNotification && (
        <div className="absolute top-16 left-4 z-30 p-3.5 rounded-2xl bg-zinc-950/90 border border-cyan-500/50 backdrop-blur-xl shadow-2xl max-w-sm animate-fade-in flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>{liveGpsNotification.title}</span>
            </div>
            <p className="text-[11px] font-mono text-zinc-400">{liveGpsNotification.coords}</p>
            <p className="text-[11px] text-zinc-300 mt-1 mb-2">
              3D Globe centered and focused on coordinates.
            </p>
            {onOpenRadar && (
              <button
                type="button"
                onClick={() => {
                  if (liveGpsNotification.report) onOpenRadar(liveGpsNotification.report);
                  else if (liveGpsNotification.lat && liveGpsNotification.lng) {
                    onOpenRadar({
                      locationName: liveGpsNotification.title,
                      latitude: liveGpsNotification.lat,
                      longitude: liveGpsNotification.lng
                    });
                  }
                }}
                className="py-1 px-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow transition"
              >
                <span>🌧️ Open Live Radar Here</span>
              </button>
            )}
          </div>
          <button
            onClick={() => setLiveGpsNotification(null)}
            className="text-zinc-500 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
            Dissonance: {Math.round((hoveredReport.dissonanceScore || 0) * 100)}% • Click to open details
          </div>
        </div>
      )}

      {/* Quick Active Incident Hotspots Strip at bottom */}
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
              if (rotateToCoordsRef.current) {
                rotateToCoordsRef.current(rep.latitude, rep.longitude);
              }
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
  );
}
