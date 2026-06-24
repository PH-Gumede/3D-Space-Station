import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';

// ─── Scene, Camera, Renderer ──────────────────────────────────────────────

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

// ─── OrbitControls ────────────────────────────────────────────────────────
//
// OrbitControls gives us mouse-drag orbiting and scroll-to-zoom for free.
// It attaches to the camera and listens to mouse events on the renderer canvas.

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;   // adds smooth inertia (feels much nicer)
controls.dampingFactor = 0.05;
controls.minDistance = 15;       // can't zoom in past 15 units
controls.maxDistance = 400;      // can't zoom out past 400 units

// ─── Lighting ─────────────────────────────────────────────────────────────

scene.add(new THREE.AmbientLight(0x223344, 0.8));

const sunLight = new THREE.DirectionalLight(0xfff5e0, 2.0);
sunLight.position.set(100, 60, 80);
scene.add(sunLight);

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

// ─── Shared materials ─────────────────────────────────────────────────────

const metalMat = new THREE.MeshPhongMaterial({ color: 0x8899aa, specular: 0x334455, shininess: 60 });
const darkMat  = new THREE.MeshPhongMaterial({ color: 0x445566 });
const panelMat = new THREE.MeshPhongMaterial({ color: 0x1a3a88, emissive: 0x0a1a44 });
const dishMat  = new THREE.MeshPhongMaterial({ color: 0xaabbcc, side: THREE.DoubleSide });

// ─────────────────────────────────────────────────────────────────────────
// SPACE STATION
// ─────────────────────────────────────────────────────────────────────────

const stationGroup = new THREE.Group();
scene.add(stationGroup);

// Central hub
stationGroup.add(new THREE.Mesh(new THREE.SphereGeometry(6, 32, 32), metalMat));
stationGroup.add(new THREE.Mesh(
  new THREE.CylinderGeometry(14, 14, 2.5, 64, 1, true),
  new THREE.MeshPhongMaterial({ color: 0x667788, side: THREE.DoubleSide })
));

// 6 docking modules
const dockingModules = [];
for (let i = 0; i < 6; i++) {
  const angle = (i / 6) * Math.PI * 2;
  const mg = new THREE.Group();

  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 6, 8), metalMat);
  arm.rotation.z = Math.PI / 2;
  arm.position.x = 3;
  mg.add(arm);

  const bay = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 3), darkMat);
  bay.position.x = 7;
  mg.add(bay);

  const port = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16), metalMat);
  port.rotation.z = Math.PI / 2;
  port.position.x = 10;
  mg.add(port);

  mg.position.set(Math.cos(angle) * 14, 0, Math.sin(angle) * 14);
  mg.rotation.y = -angle;
  stationGroup.add(mg);
  dockingModules.push(mg);
}

// 4 solar panel arrays
const solarPanelGroups = [];
[
  { y:  10, ry: 0 },
  { y:  10, ry: Math.PI / 2 },
  { y: -10, ry: 0 },
  { y: -10, ry: Math.PI / 2 },
].forEach(cfg => {
  const pg = new THREE.Group();
  pg.position.y = cfg.y;
  pg.rotation.y = cfg.ry;

  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 22, 8), metalMat);
  arm.rotation.z = Math.PI / 2;
  pg.add(arm);

  [-7, 7].forEach(x => {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(8, 0.15, 4), panelMat);
    panel.position.x = x;
    pg.add(panel);
  });

  stationGroup.add(pg);
  solarPanelGroups.push(pg);
});

// 2 communication towers
[-1, 1].forEach(side => {
  const tg = new THREE.Group();
  tg.position.set(side * 5, 0, 0);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 14, 8), metalMat);
  pole.position.y = 13;
  tg.add(pole);

  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(2.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    dishMat
  );
  dish.position.y = 21;
  dish.rotation.x = Math.PI;
  tg.add(dish);

  const stub = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.5, 8), metalMat);
  stub.position.y = 22.5;
  tg.add(stub);

  stationGroup.add(tg);
});

// ─── Planet ───────────────────────────────────────────────────────────────

const planet = new THREE.Mesh(
  new THREE.SphereGeometry(45, 64, 64),
  new THREE.MeshPhongMaterial({ color: 0x1a5c44, emissive: 0x051a0d, specular: 0x336655, shininess: 30 })
);
planet.position.set(0, -130, -250);
scene.add(planet);

// ─────────────────────────────────────────────────────────────────────────
// SPACECRAFT
//
// Each ship is built from a few simple shapes grouped together.
// The createShip() function returns a Group we can reuse for each ship.
// ─────────────────────────────────────────────────────────────────────────

function createShip(bodyColor) {
  const sg = new THREE.Group();
  const mat = new THREE.MeshPhongMaterial({ color: bodyColor, specular: 0x333333, shininess: 80 });

  // Body (cone — tip will point in the direction of travel)
  const body = new THREE.Mesh(new THREE.ConeGeometry(1.2, 5, 8), mat);
  body.rotation.z = Math.PI / 2; // rotate so tip points along +x axis
  sg.add(body);

  // Wings (flat boxes on each side)
  const wingMat = new THREE.MeshPhongMaterial({ color: 0x333344 });
  [-1, 1].forEach(side => {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.2, 1.5), wingMat);
    wing.position.set(-0.5, side * 1.8, 0);
    sg.add(wing);
  });

  // Engine glow (small sphere at the back that emits light)
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 12, 12),
    new THREE.MeshPhongMaterial({
      color: 0xff8800,
      emissive: 0xff4400,       // emissive makes it glow regardless of lighting
      emissiveIntensity: 1.5,
    })
  );
  glow.position.x = -3.2; // back of the cone
  sg.add(glow);

  return sg;
}

// Define 4 ships with different orbit parameters
// radius: how far from the station centre
// speed:  how fast they orbit (radians per second)
// yOff:   vertical offset from the equator
// tilt:   causes slight up-down bobbing during orbit
const shipConfigs = [
  { color: 0xccddee, radius: 38, speed: 0.40, yOff:  5, tilt: 0.20 },
  { color: 0xeeddcc, radius: 52, speed: 0.25, yOff: -8, tilt: 0.30 },
  { color: 0xcceecc, radius: 44, speed: 0.35, yOff: 12, tilt: 0.50 },
  { color: 0xeeccee, radius: 62, speed: 0.18, yOff:  0, tilt: 0.10 },
];

const ships = shipConfigs.map(cfg => {
  const mesh = createShip(cfg.color);
  scene.add(mesh);
  return { mesh, ...cfg }; // spread: { mesh, color, radius, speed, yOff, tilt }
});

// ─────────────────────────────────────────────────────────────────────────
// KEYBOARD INPUT + VIEW MODES
// ─────────────────────────────────────────────────────────────────────────

// Track which keys are currently held down
const keys = {};
window.addEventListener('keydown', e => { keys[e.key] = true; });
window.addEventListener('keyup',   e => { keys[e.key] = false; });

let shipsPaused    = false;
let firstPerson    = false;

// Listen for special toggle keys (P and V)
window.addEventListener('keydown', e => {
  if (e.key === 'p' || e.key === 'P') {
    shipsPaused = !shipsPaused;
    refreshUI();
  }
  if (e.key === 'v' || e.key === 'V') {
    firstPerson = !firstPerson;
    controls.enabled = !firstPerson; // disable mouse orbit in first-person mode
    refreshUI();
  }
});

// Update the on-screen controls display
function refreshUI() {
  document.getElementById('ui').innerHTML = `
    <p>WASD / Arrows &nbsp;— move &nbsp;|&nbsp; Mouse drag — orbit</p>
    <p>Q / E &nbsp;— up/down &nbsp;|&nbsp; Scroll — zoom</p>
    <p><strong>V</strong> — View: ${firstPerson ? '🔴 First-person docking' : '🟢 External orbit'}</p>
    <p><strong>P</strong> — Ships: ${shipsPaused ? '⏸ Paused' : '▶ Moving'}</p>
  `;
}
refreshUI(); // run once on load to show initial state

// ─── WASD free camera movement ────────────────────────────────────────────
//
// camera.getWorldDirection(dir) fills 'dir' with the vector the camera is facing.
// crossVectors gives us the 'right' direction (perpendicular to forward+up).
// addScaledVector(direction, amount) moves the camera in that direction.

const _dir   = new THREE.Vector3(); // reusable vectors (avoids creating garbage)
const _right = new THREE.Vector3();

function handleMovement() {
  if (firstPerson) return; // WASD disabled in first-person mode

  const speed = 0.5;
  camera.getWorldDirection(_dir);
  _right.crossVectors(_dir, camera.up).normalize();

  if (keys['w'] || keys['ArrowUp'])    camera.position.addScaledVector(_dir, speed);
  if (keys['s'] || keys['ArrowDown'])  camera.position.addScaledVector(_dir, -speed);
  if (keys['a'] || keys['ArrowLeft'])  camera.position.addScaledVector(_right, -speed);
  if (keys['d'] || keys['ArrowRight']) camera.position.addScaledVector(_right, speed);
  if (keys['q'])                        camera.position.y += speed;
  if (keys['e'])                        camera.position.y -= speed;
}

// ─── First-person docking view ────────────────────────────────────────────
//
// When V is pressed, we smoothly orbit the camera close to the station
// at docking-bay height and always point it at the hub.
// lerp() = "linear interpolation" — smoothly moves from current to target.

const _fpTarget = new THREE.Vector3();

function handleFirstPerson(t) {
  if (!firstPerson) return;

  // Slowly orbit close to the station
  const angle = t * 0.12;
  _fpTarget.set(
    Math.cos(angle) * 25,
    6,
    Math.sin(angle) * 25
  );
  camera.position.lerp(_fpTarget, 0.025); // 0.025 = interpolation speed
  camera.lookAt(0, 0, 0); // always look at station centre
}

// ─── Resize ───────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─────────────────────────────────────────────────────────────────────────
// ANIMATION LOOP — everything that moves goes here
// ─────────────────────────────────────────────────────────────────────────

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime(); // seconds since start

  // ── Station ──────────────────────────────────────────────────────────────
  stationGroup.rotation.y = t * 0.05;

  // ── Solar panels — each tilts at a slightly different rate ───────────────
  solarPanelGroups.forEach((pg, i) => {
    pg.rotation.x = t * (0.15 + i * 0.03);
  });

  // ── Planet ───────────────────────────────────────────────────────────────
  planet.rotation.y = t * 0.008;

  // ── Ships ─────────────────────────────────────────────────────────────────
  //
  // Each ship's position on its circular orbit is: (cos(angle)*r, y, sin(angle)*r)
  // To make the ship FACE the direction it's travelling, we look at a point
  // slightly ahead on the orbit (angle + 0.05 radians further along).

  if (!shipsPaused) {
    ships.forEach(ship => {
      const angle = t * ship.speed;

      // Current position
      ship.mesh.position.set(
        Math.cos(angle) * ship.radius,
        ship.yOff + Math.sin(t * 0.3 + ship.tilt) * 3, // slight vertical bob
        Math.sin(angle) * ship.radius
      );

      // Look at a point slightly ahead on the orbit (so ship faces forward)
      const nextAngle = angle + 0.05;
      ship.mesh.lookAt(
        Math.cos(nextAngle) * ship.radius,
        ship.yOff,
        Math.sin(nextAngle) * ship.radius
      );
    });
  }

  // ── Camera ────────────────────────────────────────────────────────────────
  handleMovement();
  handleFirstPerson(t);

  // OrbitControls needs update() each frame for smooth damping to work
  if (!firstPerson) controls.update();

  renderer.render(scene, camera);
}

animate();