// Grulla de origami low-poly que se transforma con el scroll.
// Estados de forma (s): 0 = papeles sueltos (caos) · 1 = hoja ordenada · 2 = grulla.
// Además, la grulla se mueve/rota por la página según "escenas" (data-scene en cada <section>).
import { ACESFilmicToneMapping, BufferAttribute, BufferGeometry, Color, DirectionalLight, DoubleSide, Group, HemisphereLight, LineBasicMaterial, LineSegments, Mesh, MeshStandardMaterial, PerspectiveCamera, PointLight, Points, PointsMaterial, Quaternion, SRGBColorSpace, Scene, Vector3, WebGLRenderer } from 'three';

// ---------- Geometría de la grulla (hecha a mano) ----------
const P = {
  F: [0.55, 0, 0], K: [-0.55, 0, 0], T: [0, 0.32, 0],
  L: [0, -0.12, 0.2], R: [0, -0.12, -0.2], U: [0, -0.3, 0],
  NL: [0.35, -0.05, 0.06], NR: [0.35, -0.05, -0.06], N: [1.25, 1.02, 0],
  H: [1.58, 0.84, 0], HL: [1.3, 0.94, 0.035], HR: [1.3, 0.94, -0.035],
  KL: [-0.35, -0.05, 0.06], KR: [-0.35, -0.05, -0.06], Tt: [-1.38, 0.98, 0],
  WML: [0.05, 0.5, 0.85], WL: [-0.4, 0.62, 1.8],
  WMR: [0.05, 0.5, -0.85], WR: [-0.4, 0.62, -1.8],
};
const WING = new Set(['WML', 'WL', 'WMR', 'WR']);
const TRIS = [
  // cuerpo
  ['F', 'T', 'L'], ['K', 'L', 'T'], ['F', 'R', 'T'], ['K', 'T', 'R'],
  ['F', 'L', 'U'], ['K', 'U', 'L'], ['F', 'U', 'R'], ['K', 'R', 'U'],
  // cuello + cabeza
  ['F', 'N', 'NL'], ['F', 'NR', 'N'], ['NL', 'N', 'NR'], ['N', 'H', 'HL'], ['N', 'HR', 'H'],
  // cola
  ['K', 'KL', 'Tt'], ['K', 'Tt', 'KR'], ['KL', 'KR', 'Tt'],
  // alas
  ['F', 'T', 'WML'], ['T', 'K', 'WML'], ['F', 'WML', 'WL'], ['WML', 'K', 'WL'],
  ['F', 'WMR', 'T'], ['T', 'WMR', 'K'], ['F', 'WR', 'WMR'], ['WMR', 'WR', 'K'],
];
const N = TRIS.length; // 24 = rejilla 4x3 de la hoja (2 triángulos por celda)

const rand = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

function buildStates(aspect) {
  // Crane: triángulos ordenados por x para que la hoja se doble con coherencia espacial
  const order = TRIS.map((t, i) => ({ t, i, cx: t.reduce((a, k) => a + P[k][0], 0) / 3, cy: t.reduce((a, k) => a + P[k][1], 0) / 3 }))
    .sort((a, b) => a.cx - b.cx || a.cy - b.cy);

  const crane = [], sheet = [], chaos = [], wingMask = [];
  const S = 2.6, cols = 4, rows = 3, cw = S / cols, ch = S / rows;
  const spreadX = 4.6 * Math.min(1.25, Math.max(0.55, aspect / 1.6));

  order.forEach((o, n) => {
    const tri = o.t;
    const cv = tri.map((k) => P[k]);
    crane.push(cv);
    wingMask.push(tri.map((k) => (WING.has(k) ? (k.startsWith('WM') ? 0.45 : 1) * (k.endsWith('L') ? 1 : -1) : 0)));

    // hoja: celda (c, r), triángulo a/b
    const cell = n >> 1, c = cell % cols, r = Math.floor(cell / cols);
    const x0 = -S / 2 + c * cw, x1 = x0 + cw, y0 = -S / 2 + r * ch, y1 = y0 + ch;
    const tri2 = n % 2 === 0 ? [[x0, y0, 0], [x1, y0, 0], [x1, y1, 0]] : [[x0, y0, 0], [x1, y1, 0], [x0, y1, 0]];
    sheet.push(tri2);

    // caos: trozo suelto con rotación aleatoria, repartido por la pantalla
    const ang = rand() * Math.PI * 2, rad = 0.35 + rand() * 0.65;
    const pos = [Math.cos(ang) * spreadX * rad, Math.sin(ang) * 2.5 * rad, -2.5 + rand() * 3.2];
    const axis = new Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
    chaos.push({ pos, axis, base: rand() * Math.PI * 2, speed: (rand() - 0.5) * 0.9, bob: rand() * Math.PI * 2, scale: 0.9 + rand() * 0.6 });
  });
  return { crane, sheet, chaos, wingMask };
}

export function createOrigami(canvas, { reduced = false } = {}) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  // Luces: frías, con contraluz cian (mundo azul de la marca)
  scene.add(new HemisphereLight(0xbfd4ff, 0x0a1230, 0.9));
  const key = new DirectionalLight(0xffffff, 2.4); key.position.set(3, 4, 5); scene.add(key);
  const rim = new DirectionalLight(0x38bdf8, 3.2); rim.position.set(-4, 1.5, -3); scene.add(rim);
  const fill = new PointLight(0x3b82f6, 18, 20); fill.position.set(-2, -2, 3); scene.add(fill);

  const group = new Group();
  scene.add(group);

  // Malla de papel (no indexada → caras planas)
  const geo = new BufferGeometry();
  const pos = new Float32Array(N * 9);
  const col = new Float32Array(N * 9);
  geo.setAttribute('position', new BufferAttribute(pos, 3));
  geo.setAttribute('color', new BufferAttribute(col, 3));
  const palette = [0xe8f0ff, 0xd6e4ff, 0xc7dbff, 0xf2f6ff, 0xbfd3ff].map((c) => new Color(c));
  for (let i = 0; i < N; i++) {
    const c = palette[i % palette.length];
    for (let v = 0; v < 3; v++) col.set([c.r, c.g, c.b], i * 9 + v * 3);
  }
  const mat = new MeshStandardMaterial({ vertexColors: true, flatShading: true, side: DoubleSide, roughness: 0.6, metalness: 0.05 });
  const mesh = new Mesh(geo, mat);
  group.add(mesh);

  // Aristas (pliegues)
  const epos = new Float32Array(N * 18);
  const egeo = new BufferGeometry();
  egeo.setAttribute('position', new BufferAttribute(epos, 3));
  const edges = new LineSegments(egeo, new LineBasicMaterial({ color: 0x9cc7ff, transparent: true, opacity: 0.55 }));
  group.add(edges);

  // Polvo de luz para dar profundidad
  const DUST = 260;
  const dgeo = new BufferGeometry();
  const dpos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) dpos.set([(rand() - 0.5) * 18, (rand() - 0.5) * 11, -6 + rand() * 7], i * 3);
  dgeo.setAttribute('position', new BufferAttribute(dpos, 3));
  const dust = new Points(dgeo, new PointsMaterial({ color: 0x7cc4ff, size: 0.025, transparent: true, opacity: 0.6, depthWrite: false }));
  scene.add(dust);

  let states = buildStates(1.6);
  const tmp = new Vector3(), q = new Quaternion();

  // Estado animable (lo que el scroll pide) y estado actual (suavizado)
  const target = { s: 0, x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, sc: 1, flap: 0, op: 1 };
  const cur = { ...target };
  const pointer = { x: 0, y: 0, cx: 0, cy: 0 };

  function shape(time) {
    const { crane, sheet, chaos, wingMask } = states;
    const s = cur.s;
    const flap = Math.sin(time * 5.2) * 0.55 * cur.flap;
    for (let i = 0; i < N; i++) {
      const d = (i / (N - 1)) * 0.5; // escalonado: cada trozo se dobla con un pequeño retraso
      const ch = chaos[i];
      // centroide de la grulla para rotar el trozo suelto alrededor de sí mismo
      const cc = [0, 1, 2].map((a) => (crane[i][0][a] + crane[i][1][a] + crane[i][2][a]) / 3);
      q.setFromAxisAngle(ch.axis, ch.base + time * ch.speed);
      const e1 = smooth(clamp01(Math.min(s, 1) * 1.5 - d));
      const e2 = smooth(clamp01(Math.max(0, Math.min(s - 1, 1)) * 1.5 - d));
      for (let v = 0; v < 3; v++) {
        // caos
        tmp.set(crane[i][v][0] - cc[0], crane[i][v][1] - cc[1], crane[i][v][2] - cc[2]).multiplyScalar(ch.scale * 0.8).applyQuaternion(q);
        const bob = Math.sin(time * 0.8 + ch.bob) * 0.12;
        let x = ch.pos[0] + tmp.x, y = ch.pos[1] + tmp.y + bob, z = ch.pos[2] + tmp.z;
        // → hoja
        const sv = sheet[i][v];
        x = lerp(x, sv[0], e1); y = lerp(y, sv[1], e1); z = lerp(z, sv[2], e1) + Math.sin(e1 * Math.PI) * 0.8;
        // → grulla (con aleteo)
        const cv = crane[i][v];
        const w = wingMask[i][v];
        const cy = cv[1] + Math.abs(w) * flap * 1.1;
        const cz = cv[2] - Math.sign(w) * Math.abs(w) * Math.max(0, flap) * 0.35;
        x = lerp(x, cv[0], e2); y = lerp(y, cy, e2); z = lerp(z, cz, e2) + Math.sin(e2 * Math.PI) * 0.6;
        pos[i * 9 + v * 3] = x; pos[i * 9 + v * 3 + 1] = y; pos[i * 9 + v * 3 + 2] = z;
      }
      // aristas
      for (let k = 0; k < 3; k++) {
        const a = i * 9 + k * 3, b = i * 9 + ((k + 1) % 3) * 3, o = i * 18 + k * 6;
        epos[o] = pos[a]; epos[o + 1] = pos[a + 1]; epos[o + 2] = pos[a + 2];
        epos[o + 3] = pos[b]; epos[o + 4] = pos[b + 1]; epos[o + 5] = pos[b + 2];
      }
    }
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
    egeo.attributes.position.needsUpdate = true;
  }

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, w < 768 ? 1.5 : 1.75));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < 768 ? 48 : 35;
    camera.updateProjectionMatrix();
    states = buildStates(camera.aspect);
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
    const k = reduced ? 1 : 1 - Math.exp(-dt * 4.5);
    for (const key in target) cur[key] += (target[key] - cur[key]) * k;
    pointer.cx += (pointer.x - pointer.cx) * (1 - Math.exp(-dt * 3));
    pointer.cy += (pointer.y - pointer.cy) * (1 - Math.exp(-dt * 3));

    shape(time);
    const mobile = window.innerWidth < 768;
    group.position.set(cur.x * (mobile ? 0.35 : 1), cur.y + (reduced ? 0 : Math.sin(time * 0.9) * 0.06), cur.z);
    group.rotation.set(cur.rx + pointer.cy * 0.12, cur.ry + pointer.cx * 0.25 + (reduced ? 0 : time * 0.04), cur.rz);
    group.scale.setScalar(cur.sc * (mobile ? 0.8 : 1));
    mat.opacity = cur.op; mat.transparent = cur.op < 0.99;
    edges.material.opacity = 0.55 * cur.op;
    dust.rotation.y = time * 0.01; dust.position.y = -window.scrollY * 0.0006;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return { target, snap() { Object.assign(cur, target); } };
}
