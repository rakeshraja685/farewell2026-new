import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export default function Classroom() {
  const navigate = useNavigate();
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const composerRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const animFrameRef = useRef(null);
  
  // Desktop input
  const keysRef = useRef({ w: false, a: false, s: false, d: false, q: false, e: false });
  
  // Physics & movement
  const velocityRef = useRef(new THREE.Vector3());
  const directionRef = useRef(new THREE.Vector3());
  const clockRef = useRef(new THREE.Clock());

  // Mobile Touch Input
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const eulerRef = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const joystickRef = useRef({ active: false, id: null, origin: { x: 0, y: 0 }, current: { x: 0, y: 0 }, delta: { x: 0, y: 0 } });
  const lookRef = useRef({ active: false, id: null, last: { x: 0, y: 0 } });
  
  // React State for Joystick UI
  const [joystickUI, setJoystickUI] = useState({ active: false, origin: { x: 0, y: 0 }, current: { x: 0, y: 0 } });

  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [locked, setLocked] = useState(false);
  const [tip, setTip] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const tips = [
    '🎓 Welcome to the Class Farewell Explorer!',
    '💡 Look around – every corner holds a memory.',
    '🖥️ Press F to enter fullscreen.',
    '🚶 Move around and explore the classroom.',
  ];

  // Check for touch device on mount
  useEffect(() => {
    const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    setIsTouchDevice(hasTouch);
  }, []);

  // cycle tips every 4 s
  useEffect(() => {
    let i = 0;
    setTip(tips[0]);
    const id = setInterval(() => { i = (i + 1) % tips.length; setTip(tips[i]); }, 4000);
    return () => clearInterval(id);
  }, []);

  const handleFullscreen = useCallback(() => {
    const el = mountRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen().catch(()=>{});
    else document.exitFullscreen().catch(()=>{});
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Detect mobile/touch (kept for consistency, though visual downgrades are removed)
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // ── Renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.7;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ── Scene ────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030305);
    scene.fog = new THREE.FogExp2(0x030305, 0.06); // Denser, darker fog to hide raw edges
    sceneRef.current = scene;

    // ── Camera ───────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(72, mount.clientWidth / mount.clientHeight, 0.05, 200);
    camera.position.set(0, 1.65, 5);
    cameraRef.current = camera;

    // ── Post-processing ───────────
    let composer = null;
    if (!isMobile) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));

      const bloom = new UnrealBloomPass(
        new THREE.Vector2(mount.clientWidth, mount.clientHeight),
        0.1,   // strength
        0.3,   // radius
        0.95   // threshold
      );
      composer.addPass(bloom);

      const smaa = new SMAAPass(mount.clientWidth * renderer.getPixelRatio(), mount.clientHeight * renderer.getPixelRatio());
      composer.addPass(smaa);
      composer.addPass(new OutputPass());
    }
    composerRef.current = composer;

    // ── Lighting ─────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x334466, 0.15);
    scene.add(ambientLight);

    // Hemisphere sky / ground
    const hemi = new THREE.HemisphereLight(0x4466aa, 0x221100, 0.1);
    scene.add(hemi);

    // Main classroom overhead fluorescent lights (warm white)
    const makeFluorescent = (x, y, z) => {
      const light = new THREE.PointLight(0xfff5e0, 0.5, 20, 1.5);
      light.position.set(x, y, z);
      if (!isMobile) {
        light.castShadow = true;
        light.shadow.mapSize.set(512, 512);
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 15;
      }
      scene.add(light);

      // glow sphere
      const geo = new THREE.SphereGeometry(0.07, 8, 8);
      const mat = new THREE.MeshStandardMaterial({ color: 0xfff5e0, emissive: 0xfff5e0, emissiveIntensity: 1 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      scene.add(mesh);
    };

    makeFluorescent(-2.5, 4, -3);
    makeFluorescent( 2.5, 4, -3);
    makeFluorescent(-2.5, 4,  2);
    makeFluorescent( 2.5, 4,  2);

    // Warm teacher desk spotlight
    const spotDesk = new THREE.SpotLight(0xffd080, 1.5, 14, Math.PI / 5, 0.4, 1.5);
    spotDesk.position.set(0, 6, -8);
    spotDesk.target.position.set(0, 1, -6);
    if (!isMobile) {
      spotDesk.castShadow = true;
      spotDesk.shadow.mapSize.set(1024, 1024);
    }
    scene.add(spotDesk);
    scene.add(spotDesk.target);

    // Window sunlight rim (golden)
    const sunRim = new THREE.DirectionalLight(0xffcc77, 0.6);
    sunRim.position.set(-10, 8, 5);
    if (!isMobile) {
      sunRim.castShadow = true;
      sunRim.shadow.mapSize.set(2048, 2048);
      sunRim.shadow.camera.near = 0.5;
      sunRim.shadow.camera.far = 60;
      sunRim.shadow.camera.left = -20;
      sunRim.shadow.camera.right = 20;
      sunRim.shadow.camera.top = 20;
      sunRim.shadow.camera.bottom = -20;
      sunRim.shadow.bias = -0.001;
    }
    scene.add(sunRim);

    // Cool fill from opposite side (window reflection)
    const fillLight = new THREE.DirectionalLight(0x88aaff, 0.2);
    fillLight.position.set(10, 5, 5);
    scene.add(fillLight);

    // ── Particle dust motes ───────────────────────────────────────────────────
    const dustGeo = new THREE.BufferGeometry();
    const dustCount = 300;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i++) dustPos[i] = (Math.random() - 0.5) * 20;
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({ color: 0xffee99, size: 0.025, transparent: true, opacity: 0.5, sizeAttenuation: true });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);
    
    // ── Ground Plane ────────────────────────────────────────────────────────
    // Grounds the raw model and hides uneven bottom edges with a sleek reflective floor
    const floorGeo = new THREE.PlaneGeometry(150, 150);
    const floorMat = new THREE.MeshStandardMaterial({ 
      color: 0x050505, 
      roughness: 0.1, 
      metalness: 0.8 
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.05; // Slightly below model
    floor.receiveShadow = true;
    scene.add(floor);

    // ── Load 3D model ─────────────────────────────────────────────────────────
    const loader = new GLTFLoader();
    loader.load(
      '/3d-model/model.glb',
      (gltf) => {
        const model = gltf.scene;

        // Build PMREMGenerator env map FIRST so materials can use it
        const pmremGen = new THREE.PMREMGenerator(renderer);
        pmremGen.compileEquirectangularShader();
        const envTexture = pmremGen.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = envTexture;
        // Don't override the cinematic dark background
        pmremGen.dispose();

        // Traverse – upgrade all materials
        const maxAnisotropy = isMobile ? Math.min(2, renderer.capabilities.getMaxAnisotropy()) : renderer.capabilities.getMaxAnisotropy();
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow    = true;
            child.receiveShadow = true;
            
            // Recompute vertex normals to smooth out faceted geometry bumps
            if (child.geometry) {
              child.geometry.computeVertexNormals();
            }

            const applyAniso = (tex) => {
              if (!tex) return;
              tex.anisotropy  = maxAnisotropy;
              tex.minFilter   = THREE.LinearMipmapLinearFilter;
              tex.magFilter   = THREE.LinearFilter;
              tex.needsUpdate = true;
            };

            // Support both single and multi-material meshes
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((mat) => {
              if (!mat || !mat.isMeshStandardMaterial) return;

              // Max texture quality
              applyAniso(mat.map);
              applyAniso(mat.normalMap);
              applyAniso(mat.roughnessMap);
              applyAniso(mat.metalnessMap);
              applyAniso(mat.aoMap);
              applyAniso(mat.emissiveMap);

              // Make the material double-sided so the room is never invisible from the outside
              mat.side = THREE.DoubleSide;

              // Almost completely disable normal map bumpiness to smoothen photogrammetry artifacts
              if (mat.normalMap) mat.normalScale.set(0.05, 0.05);

              // Make the material very matte so light doesn't catch on tiny geometry bumps
              mat.roughness       = 0.95; 
              mat.metalness       = 0.0;  // Remove any shininess
              mat.envMapIntensity = 0.2;  // Very low env reflections
              
              // Ensure smooth shading
              mat.flatShading = false;

              // Ensure colours are in correct colour space
              if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
              if (mat.emissiveMap) mat.emissiveMap.colorSpace = THREE.SRGBColorSpace;

              mat.needsUpdate = true;
            });
          }
        });

        // Auto-fit: centre and scale to fill ~8 units
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const centre = new THREE.Vector3();
        box.getCenter(centre);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale  = 8 / maxDim;
        model.scale.setScalar(scale);
        model.position.sub(centre.multiplyScalar(scale));

        // Sit on ground
        const box2 = new THREE.Box3().setFromObject(model);
        model.position.y -= box2.min.y;

        scene.add(model);

        // Spawn camera safely inside the classroom, not outside the walls
        const safeZ = box2.max.z > 2 ? box2.max.z - 2.5 : 0;
        camera.position.set(0, 1.65, safeZ);
        
        // Setup initial euler rotation for mobile
        eulerRef.current.set(0, 0, 0, 'YXZ');
        camera.quaternion.setFromEuler(eulerRef.current);

        setLoading(false);
      },
      (progress) => {
        if (progress.total > 0) {
          setLoadProgress(Math.round((progress.loaded / progress.total) * 100));
        }
      },
      (error) => {
        console.error('GLB load error:', error);
        setLoading(false);
      }
    );

    // ── Desktop Pointer Lock Controls ──────────────────────────────────────────
    const controls = new PointerLockControls(camera, renderer.domElement);
    controls.addEventListener('lock',   () => setLocked(true));
    controls.addEventListener('unlock', () => setLocked(false));
    controlsRef.current = controls;

    // ── Input Event Listeners ────────────────────────────────────────────────
    const onKey = (e, down) => {
      const k = keysRef.current;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') k.w = down;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') k.a = down;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') k.s = down;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') k.d = down;
      if (e.code === 'KeyQ') k.q = down;
      if (e.code === 'KeyE') k.e = down;
      if (e.code === 'KeyF' && down) handleFullscreen();
    };
    document.addEventListener('keydown', (e) => onKey(e, true));
    document.addEventListener('keyup',   (e) => onKey(e, false));

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (composer) composer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ── Animation loop ────────────────────────────────────────────────────────
    // Adjusted physics for a realistic, relaxed human walking pace
    const SPEED = 16.0; 
    const DAMP  = 10.0; 
    const MOBILE_SPEED = 12.0;

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      
      // Cap delta time to prevent physics explosions (violent shaking) on low framerates
      const rawDelta = clockRef.current.getDelta();
      const delta = Math.min(rawDelta, 0.05);

      // Determine movement environment
      const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

      // Animate dust motes
      const t = clockRef.current.elapsedTime;
      if (!hasTouch) {
        const pos = dust.geometry.attributes.position.array;
        for (let i = 0; i < dustCount; i++) {
          pos[i * 3 + 1] += Math.sin(t * 0.5 + i) * 0.0005;
        }
        dust.geometry.attributes.position.needsUpdate = true;
      }
      dust.rotation.y += 0.00015;
      
      const vel = velocityRef.current;
      const dir = directionRef.current;

      if (!hasTouch && controls.isLocked) {
        // --- Desktop FPS movement ---
        const k = keysRef.current;
        dir.set(
          (k.d ? 1 : 0) - (k.a ? 1 : 0),
          (k.e ? 1 : 0) - (k.q ? 1 : 0),
          (k.s ? 1 : 0) - (k.w ? 1 : 0)
        ).normalize();

        vel.x -= vel.x * DAMP * delta;
        vel.z -= vel.z * DAMP * delta;
        vel.y -= vel.y * DAMP * delta;

        if (k.w || k.s) vel.z -= dir.z * SPEED * delta;
        if (k.a || k.d) vel.x -= dir.x * SPEED * delta;
        if (k.q || k.e) vel.y += dir.y * SPEED * delta;

        controls.moveRight(-vel.x * delta);
        controls.moveForward(-vel.z * delta);
        camera.position.y += vel.y * delta;

        if (camera.position.y < 1.0) camera.position.y = 1.0;
      } 
      else if (hasTouch) {
        // --- Mobile Touch Movement ---
        const joy = joystickRef.current;
        
        vel.x -= vel.x * DAMP * delta;
        vel.z -= vel.z * DAMP * delta;
        
        if (joy.active) {
          // delta is capped at 50, so divide by 50 to get -1 to 1 normalized range
          const nx = joy.delta.x / 50;
          const ny = joy.delta.y / 50;
          
          dir.set(nx, 0, ny);
          
          vel.x -= dir.x * MOBILE_SPEED * delta;
          vel.z -= dir.z * MOBILE_SPEED * delta;
        }

        // Apply movement relative to current camera yaw
        const vec = new THREE.Vector3(-vel.x * delta, 0, -vel.z * delta);
        vec.applyAxisAngle(new THREE.Vector3(0, 1, 0), eulerRef.current.y);
        camera.position.add(vec);

        if (camera.position.y < 1.0) camera.position.y = 1.0;
      }

      // Use plain renderer on mobile (no heavy post-processing)
      if (composerRef.current) {
        composerRef.current.render();
      } else {
        renderer.render(scene, camera);
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('keydown', (e) => onKey(e, true));
      document.removeEventListener('keyup',   (e) => onKey(e, false));
      controls.dispose();
      if (composer) composer.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  const enterExplore = () => {
    if (!isTouchDevice) {
      controlsRef.current?.lock();
    }
  };

  // ── Mobile Touch Event Handlers ──────────────────────────────────────────
  const handleTouchStart = (e) => {
    if (!isTouchDevice || loading) return;
    
    const halfWidth = window.innerWidth / 2;
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      
      // Left side = Movement Joystick
      if (t.clientX < halfWidth && !joystickRef.current.active) {
        joystickRef.current = {
          active: true,
          id: t.identifier,
          origin: { x: t.clientX, y: t.clientY },
          current: { x: t.clientX, y: t.clientY },
          delta: { x: 0, y: 0 }
        };
        setJoystickUI({ active: true, origin: { x: t.clientX, y: t.clientY }, current: { x: t.clientX, y: t.clientY } });
      }
      // Right side = Look Around
      else if (t.clientX >= halfWidth && !lookRef.current.active) {
        lookRef.current = {
          active: true,
          id: t.identifier,
          last: { x: t.clientX, y: t.clientY }
        };
      }
    }
  };

  const handleTouchMove = (e) => {
    if (!isTouchDevice || loading) return;
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      
      // Update Movement Joystick
      if (joystickRef.current.active && t.identifier === joystickRef.current.id) {
        const origin = joystickRef.current.origin;
        let dx = t.clientX - origin.x;
        let dy = t.clientY - origin.y;
        
        // Cap the joystick distance to 50px
        const dist = Math.hypot(dx, dy);
        if (dist > 50) {
          dx = (dx / dist) * 50;
          dy = (dy / dist) * 50;
        }
        
        joystickRef.current.current = { x: t.clientX, y: t.clientY };
        joystickRef.current.delta = { x: dx, y: dy };
        setJoystickUI({ active: true, origin, current: { x: origin.x + dx, y: origin.y + dy } });
      }
      
      // Update Look Camera
      if (lookRef.current.active && t.identifier === lookRef.current.id) {
        const dx = t.clientX - lookRef.current.last.x;
        const dy = t.clientY - lookRef.current.last.y;
        
        lookRef.current.last = { x: t.clientX, y: t.clientY };
        
        const euler = eulerRef.current;
        const camera = cameraRef.current;
        
        // Adjust sensitivity here
        euler.y -= dx * 0.005;
        euler.x -= dy * 0.005;
        // Clamp pitch to not flip upside down
        euler.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, euler.x));
        
        camera.quaternion.setFromEuler(euler);
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (!isTouchDevice) return;
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      
      if (joystickRef.current.active && t.identifier === joystickRef.current.id) {
        joystickRef.current.active = false;
        joystickRef.current.delta = { x: 0, y: 0 };
        setJoystickUI(prev => ({ ...prev, active: false }));
      }
      if (lookRef.current.active && t.identifier === lookRef.current.id) {
        lookRef.current.active = false;
      }
    }
  };

  return (
    <div 
      className="relative w-full min-h-screen bg-black overflow-hidden touch-none" 
      style={{ fontFamily: 'Manrope, sans-serif' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >

      {/* ── Back button (always visible) ─────────────────────────────── */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-5 left-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl
                   bg-white/5 border border-white/10 backdrop-blur-xl
                   text-on-surface-variant text-xs font-bold uppercase tracking-widest font-sans
                   hover:bg-white/10 hover:border-primary/40 hover:text-white
                   transition-all duration-300 cursor-pointer pointer-events-auto glass-card shadow-lg"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Back
      </button>

      {/* ── Canvas mount ─────────────────────────────────────────────────── */}
      <div
        ref={mountRef}
        className="w-full h-screen"
        style={{ cursor: (!isTouchDevice && locked) ? 'none' : 'default' }}
      />

      {/* ── Loading screen ───────────────────────────────────────────────── */}
      {loading && (
        <div className="absolute inset-0 bg-background flex flex-col items-center justify-center z-50 gap-6">
          <div className="relative w-28 h-28">
            {/* outer ring */}
            <svg className="w-full h-full animate-spin" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
              <circle cx="50" cy="50" r="44" fill="none" stroke="#06B6D4" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="276"
                strokeDashoffset={276 - (276 * loadProgress) / 100}
                style={{ transition: 'stroke-dashoffset 0.3s ease', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-accent-cyan font-bold text-xl">
              {loadProgress}%
            </span>
          </div>
          <div className="text-center space-y-2">
            <p className="font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-cyan text-3xl tracking-wide">Classroom Explorer</p>
            <p className="text-on-surface-variant text-sm tracking-widest uppercase font-sans">Loading classroom…</p>
          </div>
          {/* bar */}
          <div className="w-72 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary via-accent-rose to-accent-cyan rounded-full transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Desktop Click-to-enter overlay (when not locked and not touch) ─────────────────────── */}
      {!loading && !locked && !isTouchDevice && (
        <div
          className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-8 backdrop-blur-sm"
          style={{ background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.15) 0%, rgba(10,10,10,0.85) 100%)' }}
        >
          {/* title */}
          <div className="text-center space-y-2">
            <p className="font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent-rose to-accent-cyan text-5xl md:text-6xl tracking-wide drop-shadow-lg">
              Class Explorer
            </p>
            <p className="text-on-surface-variant text-base tracking-widest uppercase font-sans font-medium">Farewell 2026 · Interactive 3D</p>
          </div>

          {/* enter button */}
          <button
            onClick={enterExplore}
            className="group relative overflow-hidden px-12 py-4 rounded-2xl border border-white/10
                       bg-white/5 hover:bg-white/10 transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.2)]
                       text-white font-sans font-bold uppercase tracking-widest text-sm cursor-pointer glass-card bouncy-hover"
          >
            <span className="relative z-10 flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px] text-primary">view_in_ar</span>
              Enter Classroom
            </span>
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700
                             bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />
          </button>

          {/* controls cheatsheet */}
          <div className="grid grid-cols-2 gap-3 text-xs text-stone-400 border border-stone-700/50
                          bg-black/40 rounded-xl px-8 py-5 backdrop-blur-sm max-w-sm w-full">
            {[
              ['W / S', 'Move forward / back'],
              ['A / D', 'Move left / right'],
              ['Q / E', 'Fly up / down'],
              ['Mouse', 'Look around'],
              ['F',     'Fullscreen'],
              ['ESC',   'Exit explore mode'],
            ].map(([key, desc]) => (
              <div key={key} className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 bg-stone-800 border border-stone-600 rounded text-yellow-400 font-mono text-xs">{key}</kbd>
                <span>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Mobile HUD (Active immediately on load for touch devices) ─────────────────────── */}
      {!loading && isTouchDevice && (
        <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between">
          
          {/* Top Bar Hints */}
          <div className="flex justify-between p-6 opacity-70">
            <div className="text-accent-cyan text-[10px] font-bold tracking-widest uppercase bg-white/5 px-4 py-2 rounded-full backdrop-blur-xl border border-white/10 glass-card">
              Drag left side to move
            </div>
            <div className="text-accent-cyan text-[10px] font-bold tracking-widest uppercase bg-white/5 px-4 py-2 rounded-full backdrop-blur-xl border border-white/10 glass-card">
              Drag right side to look
            </div>
          </div>
          
          {/* Virtual Joystick UI (Rendered where thumb is) */}
          {joystickUI.active && (
            <div 
              className="absolute w-24 h-24 border border-white/20 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none backdrop-blur-md"
              style={{ left: joystickUI.origin.x, top: joystickUI.origin.y }}
            >
              <div 
                className="absolute w-10 h-10 bg-gradient-to-br from-primary to-accent-cyan rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)] -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  left: 48 + (joystickUI.current.x - joystickUI.origin.x), 
                  top: 48 + (joystickUI.current.y - joystickUI.origin.y) 
                }}
              />
            </div>
          )}

          {/* Crosshair */}
          <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-accent-cyan rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
        </div>
      )}

      {/* ── Desktop In-game HUD (when locked) ─────────────────────────────────────── */}
      {!loading && locked && !isTouchDevice && (
        <>
          {/* crosshair */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
            <div className="relative w-6 h-6">
              <div className="absolute left-1/2 top-0 w-px h-full bg-accent-cyan/60 -translate-x-1/2" />
              <div className="absolute top-1/2 left-0 h-px w-full bg-accent-cyan/60 -translate-y-1/2" />
              <div className="absolute left-1/2 top-1/2 w-1.5 h-1.5 border border-accent-cyan rounded-full -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* tip bar */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div className="px-6 py-3 rounded-full bg-white/5 border border-white/10 glass-card
                            text-white text-sm font-sans font-medium backdrop-blur-xl tracking-wide transition-all duration-500 shadow-lg">
              {tip}
            </div>
          </div>

          {/* ESC hint (top right) */}
          <div className="absolute top-6 right-6 z-30 pointer-events-none">
            <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10
                            rounded-xl text-xs text-on-surface-variant backdrop-blur-xl glass-card font-sans shadow-lg">
              <kbd className="px-2 py-1 bg-white/10 border border-white/10 rounded text-accent-cyan font-mono font-bold">ESC</kbd>
              <span className="uppercase tracking-widest font-bold text-[10px]">Exit Explore</span>
            </div>
          </div>

          {/* compass / help toggle */}
          <div className="absolute top-6 left-6 z-30">
            <button
              className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 bg-white/5 border
                         border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-on-surface-variant backdrop-blur-xl glass-card hover:bg-white/10 hover:text-white transition-all cursor-pointer shadow-lg"
              onClick={() => setShowHelp(h => !h)}
            >
              <span className="material-symbols-outlined text-[16px] text-primary">help</span>
              Controls
            </button>
            {showHelp && (
              <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-on-surface-variant border border-white/10
                              bg-white/5 rounded-[1.2rem] px-6 py-5 backdrop-blur-xl glass-card shadow-xl">
                {[['W/S','Forward/Back'],['A/D','Left/Right'],['Q/E','Up/Down'],['F','Fullscreen']].map(([k,d])=>(
                  <div key={k} className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-white/10 border border-white/10 rounded text-accent-cyan font-mono font-bold text-[10px]">{k}</kbd>
                    <span className="font-sans font-medium">{d}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
