import {
  AmbientLight,
  Color,
  DirectionalLight,
  GridHelper,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

type Events = { onShown: () => void; onLost: () => void };

// Read a colour token from the design system, so the 3D place follows light and dark.
function token(name: string): Color {
  return new Color(getComputedStyle(document.documentElement).getPropertyValue(name).trim());
}

// Each mesh in kaabah.glb takes its colour from its name.
const COLOURS: Record<string, string> = {
  kiswah: "--vh-kiswah",
  band: "--vh-gold",
  door: "--vh-gold",
  foot: "--vh-sunken",
  floor: "--vh-marble",
};

export async function showPlace(canvas: HTMLCanvasElement, { onShown, onLost }: Events): Promise<() => void> {
  const renderer = new WebGLRenderer({ canvas, antialias: true });
  try {
    const gltf = await new GLTFLoader().loadAsync("/models/kaabah.glb");
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new Scene();
    scene.background = token("--vh-cloth");
    // The light gives the wall with the door its token colour, and the other wall half of it, like the still picture.
    scene.add(new AmbientLight(0xffffff, 0.47));
    const sun = new DirectionalLight(0xffffff, 3.34);
    sun.position.set(-40, 25, 16.5);
    scene.add(sun);

    gltf.scene.traverse((node) => {
      if (node instanceof Mesh && COLOURS[node.name]) {
        const color = token(COLOURS[node.name]);
        node.material = node.name === "floor" ? new MeshBasicMaterial({ color }) : new MeshLambertMaterial({ color });
      }
    });
    scene.add(gltf.scene);

    const joints = new GridHelper(400, 50, token("--vh-edge"), token("--vh-edge"));
    joints.position.y = 0.01;
    joints.material.transparent = true;
    joints.material.opacity = 0.25;
    scene.add(joints);

    // One fixed view, the same as the still picture: the near corner in the middle, the horizon a third down.
    const camera = new PerspectiveCamera(40, 1, 1, 1000);
    camera.position.set(-28.7, 7.85, 33.2);
    camera.lookAt(-5.5, 4.23, 6.25);

    const fit = () => {
      const { clientWidth: width, clientHeight: height } = canvas;
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resize = new ResizeObserver(fit);
    resize.observe(canvas);
    fit();

    const lost = () => onLost();
    canvas.addEventListener("webglcontextlost", lost);

    let frame = 0;
    let frames = 0;
    let shownAt = 0;
    const draw = (now: number) => {
      renderer.render(scene, camera);
      if (shownAt === 0) {
        shownAt = now;
        performance.mark("isfar:place-shown");
        console.log(`[isfar] place shown in ${Math.round(now)} ms`);
        onShown();
      } else if (now - shownAt <= 10_000) {
        frames += 1;
      } else if (frames > 0) {
        console.log(`[isfar] ${Math.round(frames / 10)} frames a second over 10 s`);
        frames = 0;
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      canvas.removeEventListener("webglcontextlost", lost);
      renderer.dispose();
    };
  } catch (error) {
    renderer.dispose();
    throw error;
  }
}
