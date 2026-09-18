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

  // Smoothly rotate globe to face selected report when clicked anywhere (feed, cards, hotspots)
  useEffect(() => {
    if (selectedReport && typeof selectedReport.latitude === 'number' && typeof selectedReport.longitude === 'number') {
      if (rotateToCoordsRef.current) {
        rotateToCoordsRef.current(selectedReport.latitude, selectedReport.longitude);
      }
    }
  }, [selectedReport?.reportId]);

  // Auto-dismiss GPS/Search notification after 5 seconds to keep globe clean
  useEffect(() => {
    if (liveGpsNotification) {
      const timer = setTimeout(() => {
        setLiveGpsNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [liveGpsNotification]);

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

    // Disaster Markers (Refined, elegant pins)
    const markersGroup = new THREE.Group();
    globeGroup.add(markersGroup);
    const markerObjects = [];

    reports.forEach((rep) => {
      if (typeof rep.latitude !== 'number' || typeof rep.longitude !== 'number') return;
      const pos = latLngToVector3(rep.latitude, rep.longitude, 2.015);
      const isSelected = selectedReport?.reportId === rep.reportId;

      let pinColor = 0x06b6d4; // cyan default
      const dt = (rep.disasterType || '').toLowerCase();
      if ((rep.dissonanceScore || 0) >= 0.7) pinColor = 0xf59e0b; // amber for high dissonance
      else if (dt === 'fire') pinColor = 0xf43f5e; // vibrant red
      else if (dt === 'flood') pinColor = 0x0ea5e9; // vivid blue
      else if (dt === 'earthquake') pinColor = 0xa855f7; // purple
      else if (dt.includes('infrastructure')) pinColor = 0xeab308; // amber-yellow

      // Delicate vertical needle stem
      const pinStemGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.035, 6);
      const pinMat = new THREE.MeshBasicMaterial({ color: pinColor });
      const pinStem = new THREE.Mesh(pinStemGeo, pinMat);

      // Compact glowing gem head
      const pinHeadGeo = new THREE.SphereGeometry(isSelected ? 0.018 : 0.014, 14, 14);
      const pinHead = new THREE.Mesh(pinHeadGeo, pinMat);
      pinHead.position.y = 0.018;

      // Subtle translucent ground pulse wave
      const ringGeo = new THREE.RingGeometry(0.005, 0.015, 20);
      const ringMat = new THREE.MeshBasicMaterial({
        color: pinColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isSelected ? 0.6 : 0.35
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

    // User GPS 3D Marker on Globe (Sleek emerald beacon)
    let userGpsMarker = null;
    if (activeUserGPS) {
      const uPos = latLngToVector3(activeUserGPS.lat, activeUserGPS.lng, 2.018);
      const uRingGeo = new THREE.RingGeometry(0.006, 0.02, 24);
      const uRingMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
      const uRing = new THREE.Mesh(uRingGeo, uRingMat);
      uRing.rotation.x = Math.PI / 2;

      const uStemGeo = new THREE.CylinderGeometry(0.0025, 0.0025, 0.04, 6);
      const uStemMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const uStem = new THREE.Mesh(uStemGeo, uStemMat);

      const uDotGeo = new THREE.SphereGeometry(0.018, 16, 16);
      const uDotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const uDot = new THREE.Mesh(uDotGeo, uDotMat);
      uDot.position.y = 0.02;

      userGpsMarker = new THREE.Group();
      userGpsMarker.add(uRing);
      userGpsMarker.add(uStem);
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

    // Searched Location 3D Beacon on Globe (Sleek sky-blue pin)
    let searchMarker = null;
    if (searchLocation && typeof searchLocation.lat === 'number' && typeof searchLocation.lng === 'number') {
      const sPos = latLngToVector3(searchLocation.lat, searchLocation.lng, 2.018);
      const sRingGeo = new THREE.RingGeometry(0.006, 0.02, 24);
      const sRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
      const sRing = new THREE.Mesh(sRingGeo, sRingMat);
      sRing.rotation.x = Math.PI / 2;

      const sStemGeo = new THREE.CylinderGeometry(0.0025, 0.0025, 0.04, 6);
      const sStemMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
      const sStem = new THREE.Mesh(sStemGeo, sStemMat);

      const sDotGeo = new THREE.SphereGeometry(0.018, 16, 16);
      const sDotMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const sDot = new THREE.Mesh(sDotGeo, sDotMat);
      sDot.position.y = 0.02;

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
          const s = 1.0 + Math.sin(elapsed * 2.2 + idx) * 0.15;
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

      {/* Floating Spatial Controls (Clean, Minimal, Non-redundant) */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-zinc-950/75 backdrop-blur-xl p-1 rounded-xl border border-zinc-800/80 shadow-2xl">
        {/* My Live GPS */}
        <button
          type="button"
          onClick={handleGlobeGPS}
          disabled={isLocatingGPS}
          title="Fly to your exact live GPS location"
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            isLocatingGPS
              ? 'bg-cyan-500/20 text-cyan-300 animate-pulse'
              : 'hover:bg-cyan-950/60 text-cyan-300'
          }`}
        >
          {isLocatingGPS ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
          ) : (
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span className="text-[11px] font-medium hidden sm:inline">{isLocatingGPS ? 'Locating...' : 'My GPS'}</span>
        </button>

        <div className="w-[1px] h-4 bg-zinc-800" />

        {/* Zoom In */}
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In (+)"
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
        </button>

        {/* Zoom Out */}
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out (-)"
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5 text-zinc-400" />
        </button>

        {/* Reset Orientation */}
        <button
          type="button"
          onClick={() => {
            if (rotateToCoordsRef.current) {
              rotateToCoordsRef.current(22.5, 78.5);
            }
            if (cameraRef.current) {
              cameraRef.current.position.z = 5.7;
            }
          }}
          title="Reset Globe Orientation"
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <LocateFixed className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* GPS / Location Acquired Notification Pill (Slim, Glassmorphic) */}
      {liveGpsNotification && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-zinc-950/85 backdrop-blur-xl border border-cyan-500/40 px-3 py-1.5 rounded-full shadow-2xl animate-fade-in text-xs max-w-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
          <span className="font-semibold text-white truncate text-[11px]">{liveGpsNotification.title}</span>
          <span className="font-mono text-cyan-400 text-[10px] shrink-0">{liveGpsNotification.coords}</span>
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
              className="px-2 py-0.5 rounded-full bg-cyan-600/90 hover:bg-cyan-500 text-white text-[10px] font-bold transition shrink-0 cursor-pointer shadow-sm"
            >
              Radar
            </button>
          )}
          <button
            onClick={() => setLiveGpsNotification(null)}
            className="text-zinc-500 hover:text-white p-0.5 transition cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Floating Hover Card HUD */}
      {hoveredReport && (
        <div className="absolute top-12 left-3 z-20 p-3 rounded-xl bg-zinc-950/90 border border-cyan-500/40 backdrop-blur-xl shadow-2xl max-w-xs animate-fade-in pointer-events-none">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-white font-mono">{hoveredReport.disasterType}</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-zinc-900 border border-zinc-700 text-zinc-300">
              {hoveredReport.userSeverity}
            </span>
          </div>
          <p className="text-xs text-cyan-300 font-semibold truncate">{hoveredReport.locationName}</p>
          <div className="text-[9px] text-zinc-400 font-mono mt-1">
            Dissonance: {Math.round((hoveredReport.dissonanceScore || 0) * 100)}% • Click pin to focus
          </div>
        </div>
      )}

      {/* Quick Incident Hotspots Capsule (Centered, Dynamic Island Style) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-zinc-950/70 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-800/80 shadow-2xl max-w-[90%] overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-mono text-zinc-400 shrink-0 flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span className="hidden sm:inline">Active:</span>
        </span>
        {reports.slice(0, 5).map((rep) => {
          const isSel = selectedReport?.reportId === rep.reportId;
          return (
            <button
              key={rep.reportId}
              onClick={() => {
                onSelectReport(rep);
                if (rotateToCoordsRef.current) {
                  rotateToCoordsRef.current(rep.latitude, rep.longitude);
                }
              }}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                isSel
                  ? 'bg-cyan-500/20 border-cyan-400/80 text-cyan-200'
                  : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                (rep.dissonanceScore || 0) >= 0.7
                  ? 'bg-amber-400'
                  : (rep.disasterType || '').toLowerCase() === 'fire'
                  ? 'bg-red-400'
                  : (rep.disasterType || '').toLowerCase() === 'flood'
                  ? 'bg-blue-400'
                  : (rep.disasterType || '').toLowerCase() === 'earthquake'
                  ? 'bg-purple-400'
                  : 'bg-cyan-400'
              }`} />
              <span>{rep.locationName.split(',')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
