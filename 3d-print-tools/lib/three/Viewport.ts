import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type ViewPreset = "front" | "back" | "left" | "right" | "top" | "bottom" | "iso";
export type Shading = "smooth" | "flat" | "wireframe";

export interface ViewMesh {
  positions: Float32Array;
  indices?: Uint32Array;
  /** Optional per-vertex RGB (0–1). */
  colors?: Float32Array;
  /** Render vertex colours without lighting (e.g. light shining through). */
  unlit?: boolean;
  color?: string;
}

const DIRS: Record<ViewPreset, [number, number, number]> = {
  front: [0, -1, 0],
  back: [0, 1, 0],
  left: [-1, 0, 0],
  right: [1, 0, 0],
  top: [0, 0.0001, 1],
  bottom: [0, -0.0001, -1],
  iso: [1, -1, 0.8],
};

/**
 * Framework-free three.js viewport. Z is up (build-plate convention), units
 * are millimetres. Renders on demand only — no idle animation loop.
 */
export class Viewport {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100000);
  readonly controls: OrbitControls;
  private group = new THREE.Group();
  private grid: THREE.GridHelper | null = null;
  private axes: THREE.AxesHelper | null = null;
  private measureGroup = new THREE.Group();
  private ro: ResizeObserver;
  private frame = 0;
  private shading: Shading = "smooth";
  private modelColor = "#d8dde6";
  private showGrid = true;
  private showAxes = false;
  private measuring = false;
  private measurePts: THREE.Vector3[] = [];
  private downAt: { x: number; y: number } | null = null;
  onMeasure?: (distance: number | null, points: THREE.Vector3[]) => void;

  constructor(private container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.display = "block";
    this.renderer.domElement.style.touchAction = "none";
    this.renderer.domElement.setAttribute("aria-label", "3D preview. Drag to rotate, scroll to zoom.");
    this.renderer.domElement.setAttribute("role", "img");

    this.camera.up.set(0, 0, 1);
    this.camera.position.set(150, -150, 120);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.addEventListener("change", () => this.requestRender());

    this.scene.background = new THREE.Color("#eef2f7");
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x8090a0, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(1, -1.5, 2);
    this.camera.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.5);
    fill.position.set(-2, 1, -1);
    this.camera.add(fill);
    this.scene.add(this.camera, this.group, this.measureGroup);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(container);
    this.resize();
    this.setGrid(true);

    const el = this.renderer.domElement;
    el.addEventListener("pointerdown", this.onDown);
    el.addEventListener("pointerup", this.onUp);
  }

  private resize() {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.requestRender();
  }

  requestRender() {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.renderer.render(this.scene, this.camera);
    });
  }

  private material(m: ViewMesh) {
    if (m.colors && m.unlit) {
      return new THREE.MeshBasicMaterial({ vertexColors: true, wireframe: this.shading === "wireframe", side: THREE.DoubleSide });
    }
    return new THREE.MeshStandardMaterial({
      color: m.colors ? 0xffffff : (m.color ?? this.modelColor),
      vertexColors: !!m.colors,
      roughness: 0.65,
      metalness: 0.05,
      flatShading: this.shading === "flat",
      wireframe: this.shading === "wireframe",
      side: THREE.DoubleSide,
    });
  }

  private meshes: ViewMesh[] = [];

  /** Replace the displayed meshes. `fit` re-frames the camera. */
  setMeshes(meshes: ViewMesh[], fit = true) {
    this.meshes = meshes;
    this.clearGroup();
    for (const m of meshes) {
      let g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(m.positions, 3));
      if (m.indices) g.setIndex(new THREE.BufferAttribute(m.indices, 1));
      if (m.colors) g.setAttribute("color", new THREE.BufferAttribute(m.colors, 3));
      // Keep hard edges crisp on indexed meshes (shared vertices would otherwise smooth across them).
      if (m.indices && m.indices.length < 6_000_000) g = toCreasedNormals(g, Math.PI / 6);
      else g.computeVertexNormals();
      g.computeBoundingBox();
      this.group.add(new THREE.Mesh(g, this.material(m)));
    }
    this.clearMeasure();
    this.updateGrid();
    if (fit) this.fit();
    this.requestRender();
  }

  private replaceMaterial(mesh: THREE.Mesh, m: ViewMesh) {
    (mesh.material as THREE.Material).dispose();
    mesh.material = this.material(m);
  }

  private clearGroup() {
    for (const obj of [...this.group.children]) {
      const mesh = obj as THREE.Mesh;
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
      this.group.remove(mesh);
    }
  }

  bounds(): THREE.Box3 {
    const box = new THREE.Box3();
    this.group.children.forEach((c) => box.expandByObject(c));
    return box;
  }

  fit(preset: ViewPreset = "iso") {
    const box = this.bounds();
    if (box.isEmpty()) return;
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const r = Math.max(sphere.radius, 1);
    const dist = r / Math.sin(THREE.MathUtils.degToRad(this.camera.fov / 2)) * 1.25;
    const d = new THREE.Vector3(...DIRS[preset]).normalize();
    this.camera.position.copy(sphere.center).addScaledVector(d, dist);
    this.camera.near = Math.max(dist / 1000, 0.01);
    this.camera.far = dist * 100;
    this.camera.updateProjectionMatrix();
    this.controls.target.copy(sphere.center);
    this.controls.update();
    this.requestRender();
  }

  setShading(s: Shading) {
    this.shading = s;
    this.group.children.forEach((o, i) => this.replaceMaterial(o as THREE.Mesh, this.meshes[i]));
    this.requestRender();
  }

  setModelColor(c: string) {
    this.modelColor = c;
    this.group.children.forEach((o, i) => this.replaceMaterial(o as THREE.Mesh, this.meshes[i]));
    this.requestRender();
  }

  setBackground(c: string) {
    this.scene.background = new THREE.Color(c);
    this.requestRender();
  }

  setGrid(on: boolean) {
    this.showGrid = on;
    this.updateGrid();
  }

  private updateGrid() {
    if (this.grid) {
      this.scene.remove(this.grid);
      this.grid.geometry.dispose();
      (this.grid.material as THREE.Material).dispose();
      this.grid = null;
    }
    if (this.axes) {
      this.scene.remove(this.axes);
      this.axes.dispose();
      this.axes = null;
    }
    const box = this.bounds();
    const extent = box.isEmpty() ? 200 : Math.max(box.max.x - box.min.x, box.max.y - box.min.y) * 1.6;
    const step = extent > 400 ? 50 : extent > 100 ? 10 : 5;
    const sizeMm = Math.max(step * 4, Math.ceil(extent / step) * step);
    const z = box.isEmpty() ? 0 : box.min.z;
    if (this.showGrid) {
      this.grid = new THREE.GridHelper(sizeMm, sizeMm / step, 0x8899aa, 0xc4ccd6);
      this.grid.rotation.x = Math.PI / 2;
      if (!box.isEmpty()) this.grid.position.set((box.min.x + box.max.x) / 2, (box.min.y + box.max.y) / 2, z);
      this.scene.add(this.grid);
    }
    if (this.showAxes) {
      this.axes = new THREE.AxesHelper(sizeMm / 2);
      this.axes.position.set(0, 0, z + 0.01);
      this.scene.add(this.axes);
    }
    this.requestRender();
  }

  setAxes(on: boolean) {
    this.showAxes = on;
    this.updateGrid();
  }

  setDark(dark: boolean, bg?: string) {
    this.setBackground(bg ?? (dark ? "#0f172a" : "#eef2f7"));
  }

  // ---- measuring -------------------------------------------------------
  setMeasuring(on: boolean) {
    this.measuring = on;
    this.clearMeasure();
    this.renderer.domElement.style.cursor = on ? "crosshair" : "";
  }

  clearMeasure() {
    for (const o of [...this.measureGroup.children]) {
      this.measureGroup.remove(o);
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      (m.material as THREE.Material)?.dispose();
    }
    this.measurePts = [];
    this.onMeasure?.(null, []);
    this.requestRender();
  }

  private onDown = (e: PointerEvent) => {
    this.downAt = { x: e.clientX, y: e.clientY };
  };

  private onUp = (e: PointerEvent) => {
    if (!this.measuring || !this.downAt) return;
    if (Math.hypot(e.clientX - this.downAt.x, e.clientY - this.downAt.y) > 4) return; // was a drag
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    const hit = ray.intersectObjects(this.group.children, false)[0];
    if (!hit) return;
    if (this.measurePts.length >= 2) this.clearMeasure();
    this.measurePts.push(hit.point.clone());
    const r = this.bounds().getBoundingSphere(new THREE.Sphere()).radius * 0.012;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(Math.max(r, 0.2), 16, 12), new THREE.MeshBasicMaterial({ color: 0xf97316, depthTest: false }));
    dot.renderOrder = 10;
    dot.position.copy(hit.point);
    this.measureGroup.add(dot);
    if (this.measurePts.length === 2) {
      const g = new THREE.BufferGeometry().setFromPoints(this.measurePts);
      const line = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xf97316, depthTest: false }));
      line.renderOrder = 10;
      this.measureGroup.add(line);
      this.onMeasure?.(this.measurePts[0].distanceTo(this.measurePts[1]), this.measurePts);
    } else this.onMeasure?.(null, this.measurePts);
    this.requestRender();
  };

  // ---- output ------------------------------------------------------------
  screenshot(): Promise<Blob | null> {
    this.renderer.render(this.scene, this.camera);
    return new Promise((res) => this.renderer.domElement.toBlob(res, "image/png"));
  }

  dispose() {
    cancelAnimationFrame(this.frame);
    this.ro.disconnect();
    this.controls.dispose();
    this.clearGroup();
    this.clearMeasure();
    this.renderer.domElement.removeEventListener("pointerdown", this.onDown);
    this.renderer.domElement.removeEventListener("pointerup", this.onUp);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
