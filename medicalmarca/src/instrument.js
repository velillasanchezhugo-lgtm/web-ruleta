// Instrumento dental de doble extremo (sonda graduada + explorador) en acero, modelado por código.
// Viaja por la página según las escenas (data-scene) igual que la grulla de Umotion.
import {
  WebGLRenderer, Scene, PerspectiveCamera, PMREMGenerator, Group, Mesh, LatheGeometry, Vector2, Vector3,
  CatmullRomCurve3, TubeGeometry, CylinderGeometry, SphereGeometry, MeshPhysicalMaterial, MeshStandardMaterial,
  DirectionalLight, ACESFilmicToneMapping, SRGBColorSpace, PlaneGeometry, ShadowMaterial,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

function handleProfile() {
  // Perfil del mango (radio, posición) de un extremo a otro, a lo largo de Y; luego se tumba en X.
  const pts = [];
  const push = (r, y) => pts.push(new Vector2(r, y));
  push(0.0, -2.25); push(0.032, -2.2); push(0.06, -1.95); push(0.1, -1.62); push(0.13, -1.5);
  push(0.15, -1.42);
  // moleteado: anillos finos en la zona de agarre
  for (let y = -1.3; y <= 1.3; y += 0.055) { push(0.158, y); push(0.148, y + 0.0275); }
  push(0.15, 1.42); push(0.13, 1.5); push(0.1, 1.62); push(0.06, 1.95); push(0.032, 2.2); push(0.0, 2.25);
  return pts;
}

export function createInstrument(canvas, { reduced = false } = {}) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;

  const camera = new PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 11);

  const sun = new DirectionalLight(0xffffff, 1.4);
  sun.position.set(2, 6, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.radius = 8;
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 });
  scene.add(sun);

  const steel = new MeshPhysicalMaterial({ color: 0xe6e9ef, metalness: 1, roughness: 0.2, clearcoat: 0.4, clearcoatRoughness: 0.2 });
  const grip = new MeshPhysicalMaterial({ color: 0xd5d9e1, metalness: 1, roughness: 0.38 });
  const violet = new MeshStandardMaterial({ color: 0x6b4bb3, roughness: 0.45, metalness: 0 });
  const band = new MeshStandardMaterial({ color: 0x1c1a24, roughness: 0.35, metalness: 0.4 });

  const tool = new Group();
  // Mango
  const handle = new Mesh(new LatheGeometry(handleProfile(), 72), grip);
  handle.rotation.z = -Math.PI / 2;
  handle.castShadow = true;
  tool.add(handle);
  // Anillo de silicona violeta (código de color)
  const ring = new Mesh(new CylinderGeometry(0.168, 0.168, 0.16, 64), violet);
  ring.rotation.z = Math.PI / 2; ring.position.x = 1.0;
  tool.add(ring);

  // Puntas
  const tips = [];
  function tip(points, radius) {
    const curve = new CatmullRomCurve3(points.map((p) => new Vector3(...p)));
    const m = new Mesh(new TubeGeometry(curve, 96, radius, 20, false), steel);
    m.castShadow = true;
    tool.add(m);
    const cap = new Mesh(new SphereGeometry(radius, 20, 12), steel);
    cap.position.copy(curve.getPoint(1));
    tool.add(cap);
    tips.push(curve);
    return curve;
  }
  // Sonda graduada (extremo derecho), con bandas oscuras tipo CP15
  const probe = tip([[2.2, 0, 0], [2.6, 0.02, 0], [2.92, 0.16, 0], [3.08, 0.5, 0], [3.12, 0.95, 0]], 0.026);
  [[0.66, 0.72], [0.8, 0.86], [0.93, 0.98]].forEach(([a, b]) => {
    const pa = probe.getPointAt(a), pb = probe.getPointAt(b);
    const len = pa.distanceTo(pb);
    const c = new Mesh(new CylinderGeometry(0.03, 0.03, len, 20), band);
    c.position.copy(pa.clone().add(pb).multiplyScalar(0.5));
    c.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), pb.clone().sub(pa).normalize());
    tool.add(c);
  });
  // Explorador (extremo izquierdo), curva afilada
  tip([[-2.2, 0, 0], [-2.65, 0, 0], [-2.95, -0.12, 0.06], [-3.1, -0.42, 0.12], [-3.08, -0.78, 0.1]], 0.022);

  const group = new Group();
  group.add(tool);
  scene.add(group);

  // Sombra suave en el "paño"
  const floor = new Mesh(new PlaneGeometry(30, 30), new ShadowMaterial({ opacity: 0.12 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1.6; floor.receiveShadow = true;
  scene.add(floor);

  const target = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, sc: 1, spin: 0, shadow: 1 };
  const cur = { ...target };
  const pointer = { x: 0, y: 0, cx: 0, cy: 0 };
  let scroll = 0;

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, w < 768 ? 1.5 : 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < 768 ? 46 : 30;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  let last = performance.now(), time = 0;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    time += reduced ? 0 : dt;
    const k = reduced ? 1 : 1 - Math.exp(-dt * 4);
    for (const key in target) cur[key] += (target[key] - cur[key]) * k;
    pointer.cx += (pointer.x - pointer.cx) * (1 - Math.exp(-dt * 3));
    pointer.cy += (pointer.y - pointer.cy) * (1 - Math.exp(-dt * 3));

    const mobile = window.innerWidth < 768;
    group.position.set(cur.x * (mobile ? 0.25 : 1), cur.y + (reduced ? 0 : Math.sin(time * 0.8) * 0.05), cur.z);
    group.rotation.set(cur.rx + pointer.cy * 0.08, cur.ry + pointer.cx * 0.18, cur.rz);
    // giro sobre su propio eje ligado al scroll: los reflejos del acero "corren" al bajar
    tool.rotation.x = scroll * 0.0016 * (1 + cur.spin) + time * 0.15;
    group.scale.setScalar(cur.sc * (mobile ? 0.62 : 1));
    floor.material.opacity = 0.12 * cur.shadow;
    floor.position.y = group.position.y - 1.3 * cur.sc;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return { target, setScroll(y) { scroll = y; }, snap() { Object.assign(cur, target); } };
}
