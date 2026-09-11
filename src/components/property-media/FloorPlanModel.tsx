"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type ModelAction = { kind: "left" | "right" | "reset" | "in" | "out"; sequence: number };
export type FloorPlanModelProps = { active: boolean; reduced: boolean; action: ModelAction; onReady: () => void; onError: () => void };
const MODEL_SOURCE = "/models/property-media/floor-plan/floor-plan-showcase.glb";

/** Real geometry only. Rendering is requested by resize, loading and control changes. */
export default function FloorPlanModel({ active, reduced, action, onReady, onError }: FloorPlanModelProps) {
  const host = useRef<HTMLDivElement>(null);
  const runtime = useRef<{ controls: OrbitControls; invalidate: () => void; reset: () => void; camera: THREE.PerspectiveCamera } | null>(null);
  const flags = useRef({ active, reduced });
  flags.current = { active, reduced };
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const container = element;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); }
    catch { onError(); return; }
    let disposed = false;
    let frame = 0;
    let ready = false;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 200);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    element.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-label", "住宅視覺化 3D 模型；可拖曳旋轉，亦可使用下方旋轉與縮放按鈕");
    renderer.domElement.setAttribute("role", "img");
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.autoRotate = false;
    controls.minPolarAngle = .18;
    controls.maxPolarAngle = Math.PI * .46;
    controls.dampingFactor = .12;
    controls.rotateSpeed = .6;
    controls.zoomSpeed = .65;
    scene.add(new THREE.HemisphereLight(0xfff5e6, 0x55545b, 2.4));
    const key = new THREE.DirectionalLight(0xfff2df, 3);
    key.position.set(5, 12, 8); scene.add(key);
    const fill = new THREE.DirectionalLight(0xe9efff, 1.2);
    fill.position.set(-8, 7, -4); scene.add(fill);
    const center = new THREE.Vector3();
    let radius = 8;
    let defaultDistance = 25;
    function invalidate() {
      if (disposed || frame || !flags.current.active) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        controls.enableDamping = !flags.current.reduced;
        controls.update();
        renderer.render(scene, camera);
      });
    }
    function reset() {
      // Clear any remaining damping delta before restoring the exact default view.
      controls.enableDamping = false; controls.update();
      controls.target.copy(center);
      camera.position.copy(center).add(new THREE.Vector3(1, 1.1, 1.4).normalize().multiplyScalar(defaultDistance));
      controls.update(); invalidate();
    }
    function resize() {
      if (disposed) return;
      const width = container.clientWidth, height = container.clientHeight;
      if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      const vertical = THREE.MathUtils.degToRad(camera.fov / 2);
      const limitingFov = Math.min(vertical, Math.atan(Math.tan(vertical) * camera.aspect));
      defaultDistance = radius / Math.sin(limitingFov) * 1.08;
      controls.minDistance = radius * 1.8;
      controls.maxDistance = defaultDistance * 1.7;
      camera.near = radius / 100;
      camera.far = controls.maxDistance * 4;
      camera.updateProjectionMatrix(); invalidate();
    }
    controls.addEventListener("change", invalidate);
    const observer = new ResizeObserver(resize); observer.observe(element);
    const contextLost = (event: Event) => { event.preventDefault(); onError(); };
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    function disposeObject(object: THREE.Object3D) {
      object.traverse(node => {
        if (!(node instanceof THREE.Mesh)) return;
        node.geometry.dispose();
        for (const material of Array.isArray(node.material) ? node.material : [node.material]) material.dispose();
      });
    }
    new GLTFLoader().load(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}${MODEL_SOURCE}`, gltf => {
      if (disposed) { disposeObject(gltf.scene); return; }
      const bounds = new THREE.Box3().setFromObject(gltf.scene);
      if (bounds.isEmpty()) { onError(); return; }
      bounds.getCenter(center); radius = bounds.getBoundingSphere(new THREE.Sphere()).radius;
      if (!Number.isFinite(radius) || radius <= 0) { onError(); return; }
      scene.add(gltf.scene);
      // Auxiliary presentation base only; the GLB's architectural floor stays opaque.
      const base = new THREE.Mesh(new THREE.CylinderGeometry(radius * .88, radius * .88, .08, 64), new THREE.MeshStandardMaterial({ color: 0x292722, roughness: .88, transparent: true, opacity: .14, depthWrite: false }));
      base.position.set(center.x, bounds.min.y - .09, center.z); scene.add(base);
      runtime.current = { controls, camera, invalidate, reset };
      ready = true; resize(); reset(); renderer.render(scene, camera); onReady();
    }, undefined, () => { if (!disposed) onError(); });
    resize();
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect();
      controls.removeEventListener("change", invalidate); controls.dispose();
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      if (ready) runtime.current = null;
      disposeObject(scene); renderer.dispose(); renderer.domElement.remove();
    };
  }, [onReady, onError]);
  useEffect(() => {
    const state = runtime.current;
    if (!state) return;
    state.controls.enabled = active;
    state.controls.enableDamping = !reduced;
    if (active) state.invalidate();
  }, [active, reduced]);
  useEffect(() => {
    const state = runtime.current;
    if (!state) return;
    if (action.kind === "reset") { state.reset(); return; }
    const offset = state.camera.position.clone().sub(state.controls.target);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    if (action.kind === "left" || action.kind === "right") spherical.theta += (action.kind === "left" ? -1 : 1) * Math.PI / 4;
    else spherical.radius = THREE.MathUtils.clamp(spherical.radius * (action.kind === "in" ? .9 : 1.1), state.controls.minDistance, state.controls.maxDistance);
    state.camera.position.copy(state.controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
    state.controls.update(); state.invalidate();
  }, [action]);
  return <div ref={host} style={{ position: "absolute", inset: 0 }} />;
}
