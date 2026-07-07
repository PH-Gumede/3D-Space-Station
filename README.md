# 3D Space Station

An interactive, fully procedural 3D space station scene built with Three.js and Vite — no external 3D models, just primitive geometries assembled in code, with free-fly and orbital camera modes and animated spacecraft.

![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat&logo=three.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## Overview

This project renders an animated 3D space station — complete with docking modules, rotating solar panels, communication towers, orbiting spacecraft, and a distant planet — entirely from primitive Three.js geometries, with no imported 3D model files.

- **What it does** — builds and animates a full space-station scene in the browser: a rotating station, four ships on independent orbits, a background planet, and an 8,000-point starfield, all navigable with the mouse or keyboard.
- **Who it's for** — reviewers assessing 3D graphics fundamentals: scene composition, camera control, procedural geometry construction, and performance-conscious animation — this project (COS3712) was built specifically to demonstrate those skills.
- **Why it exists** — as a university coursework project to apply 3D graphics theory (transformation matrices, camera projection, scene graphs) in a real, interactive WebGL application using Three.js.
- **The problem it solves** — demonstrates that a convincing, animated 3D scene can be built entirely from code — spheres, cylinders, boxes — without needing external modelling software or asset pipelines.

## Features

- 🛰️ **Procedurally-built space station** — a central hub, six radially-arranged docking modules, four solar panel arrays, and two communication towers, all assembled from primitive geometries and grouped hierarchically.
- 🚀 **Four animated spacecraft** — each on its own circular orbit with a unique radius, speed, and vertical bob, and correctly oriented to face its direction of travel.
- 🌌 **8,000-point starfield** — a single efficient particle system rather than thousands of individual objects.
- 🪐 **Background planet** — a large, subtly glowing sphere positioned far from the station for scale and atmosphere.
- 🖱️ **Orbit camera controls** — drag to orbit, scroll to zoom, with smooth inertia/damping.
- ⌨️ **Free-fly camera** — WASD/arrow-key movement plus Q/E for vertical movement, computed relative to the direction the camera is actually facing.
- 📷 **First-person "docking view" mode** — toggle (**V**) into a smooth, automatically-orbiting close-up camera near the station.
- ⏸️ **Pause/resume ship animation** — toggle (**P**) to freeze or resume the orbiting spacecraft.
- 📟 **Live on-screen controls overlay** — updates in real time to reflect the current view mode and ship-animation state.
- 📱 **Responsive canvas** — automatically resizes and adjusts the camera's aspect ratio on window resize.

## Screenshots / Demo

No screenshots are currently included in this repository. Given the interactive, animated nature of this project, a short **screen recording** (10–20 seconds) showing the orbit controls, the WASD free-fly movement, and the "V" first-person docking mode would demonstrate this project far better than static screenshots — see the **Assets Checklist** for full recommendations.

## Live Demo

🔗 **[3-d-space-station.vercel.app](https://3-d-space-station.vercel.app/)**

*(This link is referenced from the developer's own portfolio site as the deployed version of this project. Please verify it is still live before sharing it with recruiters.)*

## Tech Stack

| Category | Technology |
|---|---|
| **3D Graphics** | [Three.js](https://threejs.org/) `^0.184.0` — `WebGLRenderer`, `PerspectiveCamera`, `OrbitControls`, `BufferGeometry` |
| **Language** | JavaScript (ES Modules) |
| **Build Tool / Dev Server** | [Vite](https://vitejs.dev/) `^8.0.12` |
| **Styling** | Plain CSS (fixed-position UI overlay) |
| **Package Manager** | npm |

## Project Structure

```
3D-Space-Station/
└── space-station/
    ├── index.html            # Entry HTML — mounts the canvas and the #ui overlay
    ├── package.json           # Dependencies: three, vite
    ├── src/
    │   ├── main.js            # All scene setup, geometry, controls, and the animation loop
    │   ├── style.css           # Fullscreen canvas + on-screen controls overlay styling
    │   └── assets/             # Vite starter-template assets (currently unused — see below)
    └── .gitignore
```

> **Note:** the repository root also contains `space-station-submission.zip`, a duplicate archive of this same project (likely left over from preparing a university submission package). It isn't part of the working application — see **Recommended Improvements**.

## Installation

**Prerequisites:** [Node.js](https://nodejs.org/) (LTS) and npm.

```bash
git clone https://github.com/PH-Gumede/3D-Space-Station.git
cd 3D-Space-Station/space-station

npm install
npm run dev
```

Vite will start a local dev server (typically `http://localhost:5173`) and print the URL to your terminal.

To build a production-ready static bundle:

```bash
npm run build      # outputs to space-station/dist
npm run preview     # serves the production build locally
```

## Usage

| Input | Action |
|---|---|
| **Mouse drag** | Orbit the camera around the station |
| **Scroll wheel** | Zoom in/out |
| **W / A / S / D** or **Arrow keys** | Fly the camera forward/back/left/right |
| **Q / E** | Move the camera down/up |
| **V** | Toggle first-person "docking view" mode |
| **P** | Pause/resume the orbiting spacecraft |

The on-screen overlay in the top-left always reflects the current view mode and animation state.

## Key Technical Concepts

**Fully procedural construction — no external 3D models.** Every visible object — the station hub, docking modules, solar panels, communication towers, ships, and the planet — is built from Three.js primitive geometries (`SphereGeometry`, `CylinderGeometry`, `BoxGeometry`, `ConeGeometry`) combined into `THREE.Group` hierarchies, rather than imported from `.glb`/`.gltf`/`.obj` files. For example, each of the six docking modules is its own group of three meshes (arm, bay, port), positioned radially around the hub using basic trigonometry:

```javascript
const angle = (i / 6) * Math.PI * 2;
mg.position.set(Math.cos(angle) * 14, 0, Math.sin(angle) * 14);
mg.rotation.y = -angle;
```

**An efficient particle-based starfield.** Rather than creating 8,000 individual mesh objects (which would be extremely expensive to render), the starfield is a single `THREE.Points` object backed by one `BufferGeometry`:

```javascript
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 })));
```

This is the correct, idiomatic way to render large numbers of simple points in Three.js — a single draw call instead of 8,000.

**Data-driven object instantiation.** The four spacecraft aren't hand-duplicated in the code — they're generated from a small config array via a factory function and `.map()`:

```javascript
const shipConfigs = [
  { color: 0xccddee, radius: 38, speed: 0.40, yOff:  5, tilt: 0.20 },
  { color: 0xeeddcc, radius: 52, speed: 0.25, yOff: -8, tilt: 0.30 },
  // ...
];
const ships = shipConfigs.map(cfg => ({ mesh: createShip(cfg.color), ...cfg }));
```

Adding a fifth ship means adding one line to the config array, not duplicating a block of mesh-construction code.

**Orientation via "look-ahead" targeting.** Each ship doesn't just follow its circular orbit — it visibly faces the direction it's travelling, by computing its position slightly further along the orbit and calling `.lookAt()` toward that point rather than its current position:

```javascript
const nextAngle = angle + 0.05;
ship.mesh.lookAt(
  Math.cos(nextAngle) * ship.radius,
  ship.yOff,
  Math.sin(nextAngle) * ship.radius
);
```

**Camera movement relative to actual view direction.** The free-fly camera doesn't move along fixed world axes — "forward" is derived from where the camera is genuinely pointing, and "right" is computed as the cross product of that direction and the camera's up vector, so movement always feels correct no matter how the camera has been orbited:

```javascript
camera.getWorldDirection(_dir);
_right.crossVectors(_dir, camera.up).normalize();
```

**Smooth mode transitions via linear interpolation.** Switching into "docking view" mode doesn't snap the camera instantly — it eases toward a computed target position every frame using `Vector3.lerp()`, producing a gentle glide rather than a jarring cut:

```javascript
camera.position.lerp(_fpTarget, 0.025);
```

**Framerate-independent animation.** All motion is driven by `THREE.Clock`'s elapsed time (`clock.getElapsedTime()`), not by counting animation frames — so the station rotates, panels tilt, and ships orbit at the same real-world speed regardless of the viewer's screen refresh rate.

**Avoiding per-frame garbage collection.** The reusable direction/target vectors (`_dir`, `_right`, `_fpTarget`) are declared once, outside the animation loop, and mutated in place every frame rather than being freshly allocated — a deliberate optimization to avoid creating (and then garbage-collecting) new `Vector3` objects 60 times a second.

## Challenges & Solutions

- **Challenge:** making four independently-orbiting ships visibly face their direction of travel, without manually computing rotation angles for each one.
  **Solution:** since each ship's future position on its own circular orbit is trivial to compute (`angle + small increment`), simply calling `.lookAt()` toward that near-future point lets Three.js handle the rotation math correctly and automatically.

- **Challenge:** supporting two very different camera behaviours (free orbit via `OrbitControls`, and free-fly WASD movement) without them fighting for control of the camera.
  **Solution:** `OrbitControls` is explicitly disabled (`controls.enabled = false`) whenever first-person mode is active, and the WASD handler explicitly returns early during first-person mode — only one system ever has control of the camera's position at a time.

## Known Limitations

In the interest of being upfront about the current state of the project:

- The repository root contains a redundant `space-station-submission.zip` archive of the same project — this bloats the repository unnecessarily and should be removed from version control.
- Several files under `src/assets/` (`hero.png`, `javascript.svg`, `vite.svg`) are leftover default assets from the Vite project scaffold and are never actually imported or referenced anywhere in the code.
- Student name and number are present as comments in `index.html`, `main.js`, and `style.css` — appropriate for a university submission, but worth reconsidering for a public portfolio repository.
- There is no on-canvas collision detection — ships and the station can visually overlap depending on camera angle, since this is a visual demonstration rather than a physics simulation.

## Future Improvements

- Remove `space-station-submission.zip` from the repository (and from git history, if repository size matters) — the working source is already tracked as plain files.
- Remove the unused Vite starter-template assets from `src/assets/`.
- Add post-processing effects (e.g., bloom on the ship engine glow and communication dish) via Three.js's `EffectComposer`.
- Add a loading screen or progress indicator, in preparation for a future version that uses imported 3D models or textures.
- Extract scene-construction code (station, ships, starfield) into separate modules rather than one large `main.js`, as the scene grows in complexity.
- Add basic UI controls (sliders or buttons) for adjusting ship speed or camera parameters, rather than requiring keyboard shortcuts alone.
- Consider adding mobile/touch controls, since the current control scheme is keyboard-and-mouse only.

## Skills Demonstrated

- 3D Graphics Programming (Three.js, WebGL fundamentals)
- Scene graph composition (`THREE.Group` hierarchies)
- Procedural geometry generation
- Camera systems (orbit controls, free-fly, smooth mode transitions via interpolation)
- Performance Optimization (buffer geometries, object reuse, framerate-independent timing)
- Vector math applied practically (cross products, look-at targeting, trigonometric positioning)
- Modern JavaScript tooling (Vite, ES Modules, npm)
- Git & GitHub-based project delivery

## Credits

Built with [Three.js](https://threejs.org/) and [Vite](https://vitejs.dev/).

## License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2026 Philasande Gumede

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
