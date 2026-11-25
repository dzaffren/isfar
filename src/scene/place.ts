import {
  AmbientLight,
  BufferGeometry,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Float32BufferAttribute,
  GridHelper,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { Rite } from "../lib/step";
import { SAI_SPOTS, groundAt, laneLine, type SaiPart } from "./masa";
import { SPOTS, onPath, type Part } from "./mataf";
import { alongHall, between, nameAnchor, namePlace, saiNameAnchor, saiNamePlace, saiViewOf, viewOf, type V3, type View } from "./views";

export type Name = { name: HTMLElement; lead: SVGLineElement };

type Events = {
  rite: Rite;
  step: number;
  names: Record<string, Name>;
  onShown: () => void;
  onLost: () => void;
  onCamera: (step: number) => void;
  onMoving: (moving: boolean) => void;
};

export type Place = { stop: () => void; goTo: (step: number) => void; setNames: (on: boolean) => void };

// Read a colour token from the design system, so the 3D place follows light and dark.
function token(name: string): Color {
  return new Color(getComputedStyle(document.documentElement).getPropertyValue(name).trim());
}

// Each mesh in mataf.glb and masa.glb takes its colour from its name.
const COLOURS: Record<string, string> = {
  kiswah: "--vh-kiswah",
  band: "--vh-gold",
  door: "--vh-gold",
  foot: "--vh-sunken",
  floor: "--vh-marble",
  stone: "--vh-on-kiswah",
  hijr: "--vh-sunken",
  maqam: "--vh-gold",
  arcade: "--vh-sunken",
  arch: "--vh-edge",
  guide: "--vh-edge",
  lamp: "--vh-lamp",
  wall: "--vh-sunken",
  rock: "--vh-edge",
  barrier: "--vh-sunken",
};
const FLAT = new Set(["floor", "guide", "lamp"]);

const MOVE_MS = 900;
const easeOut = (t: number) => 1 - (1 - t) ** 3;

// The plan is z up, and three.js is y up.
const toThree = ([x, y, z]: V3) => new Vector3(x, z, -y);

// Flat shapes on the floor, in the plan's x and y.
function floorShapes(draw: (quad: (corners: [number, number][]) => void, flat: (x: number, y: number) => void) => void): BufferGeometry {
  const points: number[] = [];
  const flat = (x: number, y: number) => points.push(x, 0.03, -y);
  const quad = (corners: [number, number][]) => {
    const [a, b, c, d] = corners;
    for (const [x, y] of [a, b, c, a, c, d]) flat(x, y);
  };
  draw(quad, flat);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
  return geometry;
}

// The path of the circuit as dashes on the floor, with an arrow for the way of the walk (D28).
const pathLine = () =>
  floorShapes((quad, flat) => {    for (let degrees = 0; degrees < 360; degrees += 6) {
      const [x, y] = onPath(degrees);
      const [nextX, nextY] = onPath(degrees + 3.5);
      const length = Math.hypot(nextX - x, nextY - y);
      const [sideX, sideY] = [(-(nextY - y) / length) * 0.2, ((nextX - x) / length) * 0.2];
      quad([[x - sideX, y - sideY], [nextX - sideX, nextY - sideY], [nextX + sideX, nextY + sideY], [x + sideX, y + sideY]]);
    }
    for (const degrees of [20, 80, 150, 210, 250, 290, 330]) {
      const [x, y] = onPath(degrees);
      const [nextX, nextY] = onPath(degrees + 1);
      const length = Math.hypot(nextX - x, nextY - y);
      const [alongX, alongY] = [(nextX - x) / length, (nextY - y) / length];
      for (const [px, py] of [
        [x + alongX * 1.4, y + alongY * 1.4],
        [x - alongX * 0.9 - alongY * 0.9, y - alongY * 0.9 + alongX * 0.9],
        [x - alongX * 0.9 + alongY * 0.9, y - alongY * 0.9 - alongX * 0.9],
      ])
        flat(px, py);
    }
  });

// The path of one sa'i walk: dashes along each part of laneLine, with arrows in the lane towards the hill of the walk (D28, D81).
export const laneLines = (towards: "marwah" | "safa") =>
  floorShapes((quad, flat) => {
    const line = laneLine(towards);
    for (let index = 1; index < line.length; index += 1) {
      const [fromX, fromY] = line[index - 1];
      const [toX, toY] = line[index];
      const length = Math.hypot(toX - fromX, toY - fromY);
      const [alongX, alongY] = [(toX - fromX) / length, (toY - fromY) / length];
      const [sideX, sideY] = [-alongY * 0.2, alongX * 0.2];
      for (let at = 0; at < length; at += 6) {
        const end = Math.min(at + 3.5, length);
        const [x, y, nextX, nextY] = [fromX + alongX * at, fromY + alongY * at, fromX + alongX * end, fromY + alongY * end];
        quad([[x - sideX, y - sideY], [nextX - sideX, nextY - sideY], [nextX + sideX, nextY + sideY], [x + sideX, y + sideY]]);
      }
    }
    // The arrow turns round in x and in y, so its corners keep their order and it still faces up.
    const way = towards === "marwah" ? 1 : -1;
    const y = line[1][1];
    for (const x of [-40, -20, 0, 20, 40]) {
      flat(x + way * 1.4, y);
      flat(x - way * 0.9, y + way * 0.9);
      flat(x - way * 0.9, y - way * 0.9);
    }
  });

// What differs between the two places: the model, the spots, the camera and the names (D76).
type Site = {
  model: string;
  joints: boolean;
  paths: () => BufferGeometry[];
  pathAt: (step: number) => number | null;
  markerAt: (step: number) => V3 | null;
  namesAt: (step: number) => string[];
  anchor: (part: string) => V3;
  push: (part: string, step: number) => readonly [number, number];
  view: (step: number) => View;
  move: (one: View, two: View, t: number) => View;
};

const SITES: Record<Rite, Site> = {
  tawaf: {
    model: "/models/mataf.glb",
    joints: true,
    paths: () => [pathLine()],
    pathAt: (step) => (SPOTS[step - 1].path ? 0 : null),
    markerAt: (step) => {
      const { at } = SPOTS[step - 1];
      return at && [at[0], at[1], 0];
    },
    namesAt: (step) => SPOTS[step - 1].names,
    anchor: (part) => nameAnchor(part as Part),
    push: (part, step) => namePlace(part as Part, SPOTS[step - 1].view),
    view: viewOf,
    move: between,
  },
  sai: {
    model: "/models/masa.glb",
    joints: false,
    paths: () => [laneLines("marwah"), laneLines("safa")],
    pathAt: (step) => ({ marwah: 0, safa: 1, none: null })[SAI_SPOTS[step - 1].towards ?? "none"],
    // On a hill, the marker stands on its slope, level with the high side of its disc.
    markerAt: (step) => {
      const { at } = SAI_SPOTS[step - 1];
      return at && [at[0], at[1], Math.max(...[-1.5, 0, 1.5].map((dx) => groundAt([at[0] + dx, at[1]])))];
    },
    namesAt: (step) => SAI_SPOTS[step - 1].names,
    anchor: (part) => saiNameAnchor(part as SaiPart),
    push: (part, step) => saiNamePlace(part as SaiPart, SAI_SPOTS[step - 1].view),
    view: saiViewOf,
    move: alongHall,
  },
};

// The gold marker on the floor, with a pole and a pin that show it from far.
function marker(): Group {
  const gold = new MeshBasicMaterial({ color: token("--vh-gold") });
  const kiswah = new MeshLambertMaterial({ color: token("--vh-kiswah") });
  const group = new Group();
  const disc = new Mesh(new CircleGeometry(1.5, 28), gold);
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.04;
  const pole = new Mesh(new CylinderGeometry(0.08, 0.08, 3, 8), kiswah);
  pole.position.y = 1.5;
  const pin = new Mesh(new SphereGeometry(0.5, 12, 8), gold);
  pin.position.y = 3;
  group.add(disc, pole, pin);
  return group;
}

export async function showPlace(canvas: HTMLCanvasElement, events: Events): Promise<Place> {
  const { names, onShown, onLost, onCamera, onMoving } = events;
  const site = SITES[events.rite];
  const renderer = new WebGLRenderer({ canvas, antialias: true });
  try {
    const gltf = await new GLTFLoader().loadAsync(site.model);
    // The device can drop 3D while the model downloads, before the listener below exists.
    if (renderer.getContext().isContextLost()) throw new Error("WebGL context lost while the model downloaded");
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new Scene();
    scene.background = token("--vh-cloth");
    // The light gives the wall with the door its token colour, and the other wall half of it, like the map.
    scene.add(new AmbientLight(0xffffff, 0.47));
    const sun = new DirectionalLight(0xffffff, 3.34);
    sun.position.set(-40, 25, 16.5);
    scene.add(sun);

    gltf.scene.traverse((node) => {
      if (node instanceof Mesh && COLOURS[node.name]) {
        const color = token(COLOURS[node.name]);
        node.material = FLAT.has(node.name) ? new MeshBasicMaterial({ color }) : new MeshLambertMaterial({ color });
        if (node.name === "arch") Object.assign(node.material, { transparent: true, opacity: 0.45 });
      }
    });
    scene.add(gltf.scene);

    // The mataf floor has joints. The mas'a floor is plain marble.
    if (site.joints) {
      const joints = new GridHelper(48, 6, token("--vh-edge"), token("--vh-edge"));
      joints.position.y = 0.01;
      joints.material.transparent = true;
      joints.material.opacity = 0.25;
      scene.add(joints);
    }

    const gold = new MeshBasicMaterial({ color: token("--vh-gold-edge") });
    const paths = site.paths().map((line) => new Mesh(line, gold));
    const pin = marker();
    scene.add(...paths, pin);

    const camera = new PerspectiveCamera(40, 1, 1, 1000);
    let step = events.step;
    let namesOn = true;
    let view: View = site.view(step);
    let move: { from: View; to: View; ms: number; start: number | null; frames: number } | null = null;

    const showStep = () => {
      const shown = site.pathAt(step);
      paths.forEach((path, index) => (path.visible = index === shown));
      const at = site.markerAt(step);
      pin.visible = at !== null;
      if (at) pin.position.copy(toThree(at));
    };
    showStep();

    // Each name sits beside the screen point of its part. Two names that would overlap move apart (D44).
    const point = new Vector3();
    const placeNames = (width: number, height: number) => {
      const named = site.namesAt(step);
      const shown = Object.keys(names)
        .map((part) => {
          const { name, lead } = names[part];
          point.copy(toThree(site.anchor(part))).project(camera);
          const visible = namesOn && named.includes(part) && point.z < 1 && Math.abs(point.x) <= 1.2 && Math.abs(point.y) <= 1.2;
          name.toggleAttribute("hidden", !visible);
          lead.toggleAttribute("hidden", !visible);
          if (!visible) return null;
          const atX = ((point.x + 1) / 2) * width;
          const atY = ((1 - point.y) / 2) * height;
          const push = site.push(part, step);
          const wide = name.offsetWidth;
          const tall = name.offsetHeight;
          const x = Math.min(Math.max(atX + push[0], wide / 2 + 4), width - wide / 2 - 4);
          const y = Math.min(Math.max(atY + push[1], tall / 2 + 4), height - tall / 2 - 4);
          return { name, lead, atX, atY, wide, tall, x, y };
        })
        .filter((name) => name !== null)
        .sort((one, two) => one.y - two.y);
      shown.forEach((one, index) => {
        for (const other of shown.slice(0, index)) {
          const gap = (one.tall + other.tall) / 2 + 6;
          if (Math.abs(one.x - other.x) >= (one.wide + other.wide) / 2 + 4 || Math.abs(one.y - other.y) >= gap) continue;
          one.y = other.y + gap > height - one.tall / 2 - 4 ? other.y - gap : other.y + gap;
        }
      });
      for (const { name, lead, atX, atY, x, y } of shown) {
        name.style.left = `${x}px`;
        name.style.top = `${y}px`;
        lead.setAttribute("x1", String(atX));
        lead.setAttribute("y1", String(atY));
        lead.setAttribute("x2", String(x));
        lead.setAttribute("y2", String(y));
      }
    };

    let frame = 0;
    let shownAt = 0;
    // The place draws only when something changes: a camera move, a resize, a new name width, or a page that shows again (D40).
    const request = () => {
      if (frame === 0) frame = requestAnimationFrame(draw);
    };
    const draw = (now: number) => {
      frame = 0;
      if (move) {
        move.start ??= now;
        const t = move.ms === 0 ? 1 : Math.min((now - move.start) / move.ms, 1);
        view = site.move(move.from, move.to, easeOut(t));
        move.frames += 1;
        if (t === 1) {
          console.log(`[isfar] camera at step ${step}: ${move.frames} frames in ${move.ms === 0 ? 0 : Math.round(now - move.start)} ms`);
          move = null;
          onMoving(false);
          onCamera(step);
        }
      }
      const { clientWidth: width, clientHeight: height } = canvas;
      camera.position.copy(toThree(view.from));
      camera.lookAt(toThree(view.to));
      renderer.render(scene, camera);
      placeNames(width, height);
      if (shownAt === 0) {
        shownAt = now;
        performance.mark("isfar:place-shown");
        console.log(`[isfar] place shown in ${Math.round(now)} ms`);
        onShown();
        onCamera(step);
      }
      if (move) request();
    };

    const fit = () => {
      const { clientWidth: width, clientHeight: height } = canvas;
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      request();
    };
    const resize = new ResizeObserver(fit);
    resize.observe(canvas);
    for (const { name } of Object.values(names)) resize.observe(name);
    fit();

    const visible = () => {
      if (document.visibilityState === "visible") request();
    };
    document.addEventListener("visibilitychange", visible);
    const lost = () => onLost();
    canvas.addEventListener("webglcontextlost", lost);
    request();

    const goTo = (next: number) => {
      if (next === step) return;
      step = next;
      showStep();
      const to = site.view(step);
      const still = JSON.stringify(to) === JSON.stringify(view) || matchMedia("(prefers-reduced-motion: reduce)").matches;
      // A new step during a move sends the camera on from where it is now.
      move = { from: view, to, ms: still ? 0 : MOVE_MS, start: null, frames: 0 };
      onMoving(true);
      request();
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      document.removeEventListener("visibilitychange", visible);
      canvas.removeEventListener("webglcontextlost", lost);
      renderer.dispose();
      // A rite change makes a new place, so free this 3D context now rather than when the browser collects it (D77).
      renderer.forceContextLoss();
    };
    // A name hides or shows with no camera move, so the place asks for one frame (D40).
    const setNames = (on: boolean) => {
      if (on === namesOn) return;
      namesOn = on;
      request();
    };

    return { stop, goTo, setNames };
  } catch (error) {
    renderer.dispose();
    throw error;
  }
}

