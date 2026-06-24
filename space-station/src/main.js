import * as THREE from 'three';
import './style.css';

// ─── Scene, Camera, Renderer (same as before) ────────────────────────────

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000008);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.set(0, 25, 90);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// ─── Lighting ─────────────────────────────────────────────────────────────
//
// Without lights, MeshPhongMaterial objects appear completely black.
// AmbientLight = flat light that hits everything equally (no shadows).
// DirectionalLight = like sunlight, rays are all parallel.

const ambientLight = new THREE.AmbientLight(0x223344, 0.8); // soft blue-tinted fill
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xfff5e0, 2.0); // warm white, bright
sunLight.position.set(100, 60, 80); // coming from upper-right-front
scene.add(sunLight);

// A dim fill light from the opposite side so the dark face isn't pitch black
const fillLight = new THREE.DirectionalLight(0x112244, 0.4);
fillLight.position.set(-100, -40, -80);
scene.add(fillLight);

// ─── Starfield ───────────────────────────────────────────────────────────

const starVerts = [];
for (let i = 0; i < 8000; i++) {
  starVerts.push(
    (Math.random() - 0.5) * 2000,
    (Math.random() - 0.5) * 2000,
    (Math.random() - 0.5) * 2000
  );
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 })));

// ─── Shared Materials ─────────────────────────────────────────────────────
//
// MeshPhongMaterial responds to lights (unlike MeshBasicMaterial which ignores them).
// We define materials once and reuse them on multiple meshes.

const metalMat = new THREE.MeshPhongMaterial({
  color: 0x8899aa,    // blue-grey metal
  specular: 0x334455, // specular highlight color
  shininess: 60,
});
const darkMat  = new THREE.MeshPhongMaterial({ color: 0x445566 });
const panelMat = new THREE.MeshPhongMaterial({
  color: 0x1a3a88,       // dark blue solar panels
  emissive: 0x0a1a44,    // emissive = glows slightly even in shadow
});
const dishMat  = new THREE.MeshPhongMaterial({
  color: 0xaabbcc,
  side: THREE.DoubleSide, // render both inside and outside faces
});

// ─────────────────────────────────────────────────────────────────────────
// SPACE STATION
//
// A THREE.Group is an invisible container object. Adding meshes to a Group
// means they all move/rotate together when you transform the Group.
// This is "hierarchical transformation" — exactly what the spec requires.
// ─────────────────────────────────────────────────────────────────────────

const stationGroup = new THREE.Group();
scene.add(stationGroup);

// ── Central hub: sphere + ring ────────────────────────────────────────────

// SphereGeometry(radius, widthSegments, heightSegments)
// More segments = rounder sphere, but heavier to render
const mainHub = new THREE.Mesh(new THREE.SphereGeometry(6, 32, 32), metalMat);
stationGroup.add(mainHub);

// CylinderGeometry(radiusTop, radiusBottom, height, segments, _, openEnded)
// openEnded: true = no caps (just the tube wall)
const coreRing = new THREE.Mesh(
  new THREE.CylinderGeometry(14, 14, 2.5, 64, 1, true),
  new THREE.MeshPhongMaterial({ color: 0x667788, side: THREE.DoubleSide })
);
stationGroup.add(coreRing);

// ── 6 docking modules ────────────────────────────────────────────────────
//
// We loop 6 times. Each module is its own Group placed around the ring.
// Math.cos and Math.sin place points on a circle: x = cos(angle), z = sin(angle)

const dockingModules = []; // keep references for first-person camera later

for (let i = 0; i < 6; i++) {
  const angle  = (i / 6) * Math.PI * 2; // evenly split 360° into 6 angles
  const radius = 14; // must match coreRing radius

  const moduleGroup = new THREE.Group();

  // Connection arm (horizontal cylinder)
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 6, 8), metalMat);
  arm.rotation.z = Math.PI / 2; // CylinderGeometry stands vertical by default — lay it flat
  arm.position.x = 3;           // slide it along x so it points outward
  moduleGroup.add(arm);

  // Docking bay box (BoxGeometry: width, height, depth)
  const bay = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 3), darkMat);
  bay.position.x = 7; // at the far end of the arm
  moduleGroup.add(bay);

  // Small circular docking port on the front
  const port = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16), metalMat);
  port.rotation.z = Math.PI / 2;
  port.position.x = 10;
  moduleGroup.add(port);

  // Place the whole module at its angle around the ring
  moduleGroup.position.set(
    Math.cos(angle) * radius, // x
    0,                         // y (stays on the equator)
    Math.sin(angle) * radius   // z
  );
  // rotation.y makes the module face outward from center
  moduleGroup.rotation.y = -angle;

  stationGroup.add(moduleGroup);
  dockingModules.push(moduleGroup);
}

// ── 4 solar panel arrays ──────────────────────────────────────────────────
//
// Each array: a long arm (cylinder) with two rectangular panels on it.
// 2 above the ring, 2 below. Each pair is rotated 90° from the other.

const solarPanelGroups = []; // we animate these in the loop

[
  { y:  10, ry: 0 },             // above, pointing front-back
  { y:  10, ry: Math.PI / 2 },  // above, pointing left-right
  { y: -10, ry: 0 },             // below, pointing front-back
  { y: -10, ry: Math.PI / 2 },  // below, pointing left-right
].forEach(cfg => {
  const pg = new THREE.Group();
  pg.position.y = cfg.y;
  pg.rotation.y = cfg.ry;

  // Central arm connecting to hub
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 22, 8), metalMat);
  arm.rotation.z = Math.PI / 2; // lay flat
  pg.add(arm);

  // Two panels (one on each side of the arm)
  [-7, 7].forEach(xOffset => {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(8, 0.15, 4), panelMat);
    panel.position.x = xOffset;
    pg.add(panel);
  });

  stationGroup.add(pg);
  solarPanelGroups.push(pg);
});

// ── 2 communication towers ────────────────────────────────────────────────
//
// One on each side (+x and -x). Each has a pole and a dish at the top.

[-1, 1].forEach(side => {
  const tg = new THREE.Group();
  tg.position.set(side * 5, 0, 0); // offset left or right of hub

  // Vertical pole
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 14, 8), metalMat);
  pole.position.y = 13; // lift it above the hub centre
  tg.add(pole);

  // SphereGeometry can be sliced:
  // SphereGeometry(radius, widthSeg, heightSeg, phiStart, phiLen, thetaStart, thetaLen)
  // thetaLen = Math.PI/2 gives us just the top hemisphere (a bowl shape)
  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(2.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    dishMat
  );
  dish.position.y = 21;
  dish.rotation.x = Math.PI; // flip upside down so it faces upward like a dish
  tg.add(dish);

  // Tiny stub at the dish centre
  const stub = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.5, 8), metalMat);
  stub.position.y = 22.5;
  tg.add(stub);

  stationGroup.add(tg);
});

// ─── Planet ───────────────────────────────────────────────────────────────

const planet = new THREE.Mesh(
  new THREE.SphereGeometry(45, 64, 64),
  new THREE.MeshPhongMaterial({
    color: 0x1a5c44,    // dark green
    emissive: 0x051a0d, // faint self-glow
    specular: 0x336655,
    shininess: 30,
  })
);
planet.position.set(0, -130, -250); // far below and behind the station
scene.add(planet);

// ─── Resize ───────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─────────────────────────────────────────────────────────────────────────
// ANIMATION LOOP
// clock.getElapsedTime() returns seconds since the clock started.
// Using time directly (instead of incrementing a counter) means the
// animation speed is the same regardless of frame rate.
// ─────────────────────────────────────────────────────────────────────────

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime(); // seconds since page loaded

  // Rotate the entire station group (all children rotate with it)
  stationGroup.rotation.y = t * 0.05; // very slow — about 3°/second

  // Each solar panel group tilts on its x-axis at a slightly different speed
  // This looks like the panels are tracking the sun
  solarPanelGroups.forEach((pg, i) => {
    pg.rotation.x = t * (0.15 + i * 0.03);
  });

  // Planet slowly rotates on its own
  planet.rotation.y = t * 0.008;

  renderer.render(scene, camera);
}

animate();