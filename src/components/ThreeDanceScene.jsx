import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { danceMannequinModelUrl, danceRigBoneNames } from '../lib/danceRig.js';

const defaultCameraPosition = new THREE.Vector3(0, 1.56, 6.8);
const defaultCameraTarget = new THREE.Vector3(0, 1.38, 0);

function makeShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(256, 128, 8, 256, 128, 236);
  gradient.addColorStop(0, 'rgba(45,45,45,0.28)');
  gradient.addColorStop(0.34, 'rgba(45,45,45,0.17)');
  gradient.addColorStop(0.7, 'rgba(45,45,45,0.055)');
  gradient.addColorStop(1, 'rgba(45,45,45,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function fitModelToStudio(model) {
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const targetHeight = 2.72;
  const scale = targetHeight / Math.max(size.y, 0.001);
  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
  model.rotation.y = Math.PI;
  model.updateMatrixWorld(true);
}

function cacheBones(model) {
  const bones = new Map();
  model.traverse((object) => {
    if (object.isBone && danceRigBoneNames.includes(object.name)) {
      bones.set(object.name, {
        bone: object,
        rotation: object.rotation.clone(),
        position: object.position.clone()
      });
    }
  });
  const missingBones = danceRigBoneNames.filter((name) => !bones.has(name));
  if (missingBones.length) {
    throw new Error(`Dance mannequin rig is missing required bones: ${missingBones.join(', ')}`);
  }
  return bones;
}

function setBone(bones, name, values) {
  const entry = bones.get(name);
  if (!entry) return;
  const { bone, rotation, position } = entry;
  bone.rotation.set(
    rotation.x + (values.x || 0),
    rotation.y + (values.y || 0),
    rotation.z + (values.z || 0)
  );
  if (values.py !== undefined) bone.position.y = position.y + values.py;
  if (values.px !== undefined) bone.position.x = position.x + values.px;
  if (values.pz !== undefined) bone.position.z = position.z + values.pz;
}

function disposeMaterialExcept(materials, preservedTexture) {
  const materialList = Array.isArray(materials) ? materials : [materials];
  materialList.forEach((material) => {
    if (!material) return;
    Object.values(material).forEach((value) => {
      if (value && value !== preservedTexture && typeof value.dispose === 'function') value.dispose();
    });
    material.dispose();
  });
}

function animateDance(model, bones, elapsed) {
  const beat = elapsed * 2.35;
  const groove = Math.sin(beat);
  const groove2 = Math.sin(beat + Math.PI * 0.5);
  const step = Math.sin(beat * 0.5);
  const quick = Math.sin(beat * 2.0);

  model.position.y = Math.max(0, 0.035 * Math.sin(beat * 2.0));
  model.rotation.y = Math.PI + groove * 0.08;
  model.rotation.z = groove * 0.025;

  setBone(bones, 'Hips', { z: groove * 0.1, y: groove2 * 0.05, py: Math.max(0, quick) * 0.012 });
  setBone(bones, 'Spine', { z: -groove * 0.07, x: groove2 * 0.025 });
  setBone(bones, 'Spine1', { z: -groove * 0.09, x: -0.03 + groove2 * 0.035 });
  setBone(bones, 'Neck', { z: groove * 0.045 });
  setBone(bones, 'Head', { z: -groove * 0.055, x: groove2 * 0.045 });

  setBone(bones, 'LeftShoulder', { z: -0.05 + groove * 0.04 });
  setBone(bones, 'LeftArm', { z: -0.08 + groove2 * 0.1, x: step * 0.04 });
  setBone(bones, 'LeftForeArm', { z: -0.04 + groove * 0.08, x: quick * 0.025 });
  setBone(bones, 'LeftHand', { z: quick * 0.08 });

  setBone(bones, 'RightShoulder', { z: 0.05 + groove * 0.04 });
  setBone(bones, 'RightArm', { z: 0.08 - groove2 * 0.1, x: -step * 0.04 });
  setBone(bones, 'RightForeArm', { z: 0.04 - groove * 0.08, x: -quick * 0.025 });
  setBone(bones, 'RightHand', { z: -quick * 0.08 });

  setBone(bones, 'LeftUpLeg', { x: 0.1 + Math.max(0, -step) * 0.22, z: -0.04 + groove * 0.05 });
  setBone(bones, 'LeftLeg', { x: -0.12 - Math.max(0, -step) * 0.26 });
  setBone(bones, 'LeftFoot', { x: 0.08 + Math.max(0, -step) * 0.12, z: groove * 0.04 });

  setBone(bones, 'RightUpLeg', { x: 0.1 + Math.max(0, step) * 0.22, z: 0.04 + groove * 0.05 });
  setBone(bones, 'RightLeg', { x: -0.12 - Math.max(0, step) * 0.26 });
  setBone(bones, 'RightFoot', { x: 0.08 + Math.max(0, step) * 0.12, z: -groove * 0.04 });
}

function applyMvntToonMaterial(model) {
  const toonGradient = new THREE.DataTexture(
    new Uint8Array([160, 160, 160, 212, 212, 212, 255, 255, 255]),
    3,
    1,
    THREE.RedFormat
  );
  toonGradient.needsUpdate = true;
  model.traverse((object) => {
    if (!object.isMesh && !object.isSkinnedMesh) return;
    object.castShadow = true;
    object.receiveShadow = true;
    object.frustumCulled = false;
    const current = object.material;
    const currentMaterials = Array.isArray(current) ? current : [current];
    const map = currentMaterials.find((material) => material?.map)?.map || null;
    const material = new THREE.MeshToonMaterial({
      color: 0xf1bd75,
      map,
      gradientMap: toonGradient
    });
    material.userData.outlineParameters = {
      thickness: 0.006,
      color: [0.035, 0.035, 0.035],
      alpha: 1,
      keepAlive: false
    };
    disposeMaterialExcept(current, map);
    object.material = material;
  });
}

export function ThreeDanceScene() {
  const mountRef = useRef(null);
  const trackingRef = useRef(true);
  const resetSceneCameraRef = useRef(() => {});
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [tracking, setTracking] = useState(true);

  useEffect(() => {
    trackingRef.current = tracking;
  }, [tracking]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let disposed = false;
    let frameId = 0;
    let model = null;
    let bones = new Map();
    const clock = new THREE.Clock();
    const desiredCameraTarget = new THREE.Vector3();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    scene.fog = new THREE.FogExp2(0xffffff, 0.018);

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.copy(defaultCameraPosition);
    camera.lookAt(defaultCameraTarget);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setClearColor(0xffffff, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(defaultCameraTarget);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.minDistance = 2.2;
    controls.maxDistance = 11;
    controls.minPolarAngle = Math.PI * 0.12;
    controls.maxPolarAngle = Math.PI * 0.92;
    controls.rotateSpeed = 0.62;
    controls.zoomSpeed = 0.82;
    controls.panSpeed = 0.72;
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN
    };
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };
    controls.update();

    function handleControlsStart() {
      setTracking(false);
    }
    controls.addEventListener('start', handleControlsStart);

    resetSceneCameraRef.current = () => {
      camera.position.copy(defaultCameraPosition);
      controls.target.copy(defaultCameraTarget);
      controls.update();
    };

    const effect = new OutlineEffect(renderer, {
      defaultThickness: 0.006,
      defaultColor: [0.035, 0.035, 0.035],
      defaultAlpha: 1,
      defaultKeepAlive: false
    });

    const hemi = new THREE.HemisphereLight(0xffffff, 0xd8d5cf, 1.55);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 3.15);
    key.position.set(4.2, 6.4, 4.8);
    key.castShadow = true;
    key.shadow.mapSize.set(4096, 4096);
    key.shadow.camera.near = 0.35;
    key.shadow.camera.far = 16;
    key.shadow.camera.left = -5.5;
    key.shadow.camera.right = 5.5;
    key.shadow.camera.top = 6;
    key.shadow.camera.bottom = -3;
    key.shadow.bias = -0.00018;
    key.shadow.normalBias = 0.018;
    key.shadow.radius = 5;
    scene.add(key);
    scene.add(key.target);

    const rim = new THREE.DirectionalLight(0xfff3df, 1.2);
    rim.position.set(-4, 2.7, -3.2);
    scene.add(rim);

    const fill = new THREE.DirectionalLight(0xdfe7ff, 0.8);
    fill.position.set(0, 2.8, 4.5);
    scene.add(fill);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(2200, 2200),
      new THREE.MeshStandardMaterial({
        color: 0xf1f0ee,
        roughness: 0.92,
        metalness: 0,
        envMapIntensity: 0.18
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.018;
    floor.receiveShadow = true;
    scene.add(floor);

    const contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.1, 1.18),
      new THREE.MeshBasicMaterial({
        map: makeShadowTexture(),
        transparent: true,
        opacity: 0.82,
        depthWrite: false,
        depthTest: true
      })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.set(-0.12, -0.014, 0.08);
    contactShadow.renderOrder = 2;
    scene.add(contactShadow);

    function resize() {
      const rect = mount.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      effect.setSize(width, height);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    new GLTFLoader().load(
      danceMannequinModelUrl,
      (gltf) => {
        if (disposed) return;
        model = gltf.scene;
        applyMvntToonMaterial(model);
        fitModelToStudio(model);
        try {
          bones = cacheBones(model);
        } catch (error) {
          setLoading(false);
          setFailed(true);
          return;
        }
        scene.add(model);
        setLoading(false);
      },
      undefined,
      () => {
        if (disposed) return;
        setLoading(false);
        setFailed(true);
      }
    );

    function render() {
      if (disposed) return;
      const elapsed = clock.getElapsedTime();
      if (model) animateDance(model, bones, elapsed);

      const followX = trackingRef.current && model ? model.rotation.z * 1.25 : controls.target.x;
      const followY = trackingRef.current && model ? 1.38 + model.position.y * 0.45 : controls.target.y;
      const followZ = trackingRef.current ? 0 : controls.target.z;
      desiredCameraTarget.set(followX, followY, 0);
      desiredCameraTarget.z = followZ;
      if (trackingRef.current) controls.target.lerp(desiredCameraTarget, 0.045);
      controls.update();
      floor.position.x = controls.target.x;
      floor.position.z = controls.target.z;

      key.target.position.set(0, 1.08, 0);
      key.target.updateMatrixWorld();
      contactShadow.scale.setScalar(1 + Math.sin(elapsed * 4.7) * 0.026);
      effect.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    }
    render();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      resetSceneCameraRef.current = () => {};
      controls.removeEventListener('start', handleControlsStart);
      controls.dispose();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            Object.values(material).forEach((value) => {
              if (value && typeof value.dispose === 'function') value.dispose();
            });
            material.dispose();
          });
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div ref={mountRef} className="three-dance-scene" aria-label="3D dancing mannequin preview">
      {loading && (
        <div className="three-dance-loading" role="status">
          <span className="three-dance-spinner" aria-hidden="true" />
          <span>Loading studio</span>
        </div>
      )}
      {failed && <div className="three-dance-loading" role="alert">3D studio failed to load</div>}
      <div className="three-dance-camera-panel" role="group" aria-label="3D camera controls">
        <button
          type="button"
          className={`three-dance-track-button ${tracking ? 'is-active' : ''}`}
          aria-pressed={tracking}
          onClick={() => setTracking((current) => !current)}
        >
          Tracking {tracking ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  );
}
