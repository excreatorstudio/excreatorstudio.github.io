"use client";

import { useEffect, useRef, useState } from "react";
import type { UniverseGalaxy } from "@/data/universe-navigation";
import { universeGalaxies } from "@/data/universe-navigation";

type GalaxyId = UniverseGalaxy["id"];
export type MotionMode = "full" | "low-gpu" | "mobile-safe" | "reduced";

/** One demand-driven frame loop owns all spatial transforms. No React updates per frame. */
export function useUniverseMotion() {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const controller = useRef<{ focus: (id: GalaxyId | null) => void }>({ focus: () => {} });
  const [activeGalaxy, setActiveGalaxy] = useState<GalaxyId | null>(null);
  const [motionMode, setMotionMode] = useState<MotionMode>("reduced");

  useEffect(() => {
    const element = sceneRef.current;
    if (!element) return;
    const root: HTMLDivElement = element;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = matchMedia("(max-width: 767px)");
    const hardware = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const lowGpu = hardware.connection?.saveData === true || (hardware.deviceMemory ?? 8) <= 4 || navigator.hardwareConcurrency <= 4;
    const nodes = universeGalaxies.map(galaxy => ({
      galaxy, element: root.querySelector<HTMLElement>(`[data-galaxy="${galaxy.id}"]`)!, weight: 0,
      x: parseFloat(galaxy.position.x) / 50 - 1, y: parseFloat(galaxy.position.y) / 50 - 1,
    }));
    let mode: MotionMode = "reduced";
    let active: GalaxyId | null = null;
    let bounds = root.getBoundingClientRect();
    const target = { x: 0, y: 0, focusX: 0, focusY: 0, engaged: 0, lightX: 0, lightY: 0, gravity: 0, velocityX: 0, velocityY: 0 };
    const current = { ...target };
    let frame = 0;
    let previousTime = 0;
    let inside = false;
    let lastPointer: { x: number; y: number; time: number } | null = null;
    let touchOrigin: { x: number; y: number } | null = null;

    function wake() {
      if (!frame && !document.hidden) { previousTime = performance.now(); frame = requestAnimationFrame(tick); }
    }
    function focus(id: GalaxyId | null) {
      if (id === active) return;
      active = id;
      const node = nodes.find(item => item.galaxy.id === id);
      target.focusX = node?.x ?? 0;
      target.focusY = node?.y ?? 0;
      target.lightX = target.focusX;
      target.lightY = target.focusY;
      target.engaged = node ? 1 : 0;
      target.gravity = node ? 1 : 0;
      setActiveGalaxy(id);
      wake();
    }
    function tick(time: number) {
      frame = 0;
      // Exponential damping is stable on 30, 60 and 120 Hz displays; no overshoot.
      // Exponential damping needs real elapsed time: capping dt would prolong
      // settling on busy/low-frame-rate devices. This interpolation cannot overshoot.
      const dt = Math.max(1, time - previousTime);
      previousTime = time;
      const alpha = mode === "reduced" ? 1 : 1 - Math.exp(-dt / 150);
      // Velocity is a bounded accent, not a spring force. Decay even without new events.
      for (const key of ["velocityX", "velocityY"] as const) {
        target[key] = mode === "full" ? target[key] * Math.exp(-dt / 90) : 0;
        if (Math.abs(target[key]) < 0.0005) target[key] = 0;
      }
      let unsettled = target.velocityX !== 0 || target.velocityY !== 0;
      for (const key of Object.keys(target) as (keyof typeof target)[]) {
        const damping = key === "lightX" || key === "lightY" ? (alpha === 1 ? 1 : 1 - Math.exp(-dt / 180)) : alpha;
        current[key] += (target[key] - current[key]) * damping;
        if (Math.abs(target[key] - current[key]) < 0.0005) current[key] = target[key];
        else unsettled = true;
      }
      // Full spatial tension +40%; phone and low GPU keep a smaller envelope.
      const driftGain = mode === "full" ? 1.4 : mode === "mobile-safe" ? 1.2 : 1;
      root.style.setProperty("--pointer-x", (current.x * driftGain).toFixed(4));
      root.style.setProperty("--pointer-y", (current.y * driftGain).toFixed(4));
      root.style.setProperty("--focus-x", current.focusX.toFixed(4));
      root.style.setProperty("--focus-y", current.focusY.toFixed(4));
      root.style.setProperty("--engaged", current.engaged.toFixed(4));
      root.style.setProperty("--light-x", current.lightX.toFixed(4));
      root.style.setProperty("--light-y", current.lightY.toFixed(4));
      root.style.setProperty("--gravity", current.gravity.toFixed(4));
      root.style.setProperty("--velocity-x", current.velocityX.toFixed(4));
      root.style.setProperty("--velocity-y", current.velocityY.toFixed(4));
      for (const node of nodes) {
        const destination = node.galaxy.id === active ? 1 : 0;
        // Attention arrives before the previous world fully releases it.
        // Both are monotonic exponential curves, never elastic or overshooting.
        const focusDamping = alpha === 1 ? 1 : 1 - Math.exp(-dt / (destination ? 170 : 190));
        node.weight += (destination - node.weight) * focusDamping;
        if (Math.abs(destination - node.weight) < 0.0005) node.weight = destination;
        else unsettled = true;
        node.element.style.setProperty("--focus-weight", node.weight.toFixed(4));
      }
      if (unsettled) frame = requestAnimationFrame(tick);
    }
    function updateMode() {
      mode = reduced.matches ? "reduced" : lowGpu ? "low-gpu" : mobile.matches ? "mobile-safe" : "full";
      setMotionMode(mode);
      target.x = target.y = 0;
      target.velocityX = target.velocityY = current.velocityX = current.velocityY = 0;
      lastPointer = null;
      touchOrigin = null;
      wake();
    }
    function measure() {
      bounds = root.getBoundingClientRect();
      root.style.setProperty("--field-half-width", `${root.clientWidth / 2}px`);
      root.style.setProperty("--field-half-height", `${root.clientHeight / 2}px`);
      for (const node of nodes) {
        const parent = node.element.offsetParent as HTMLElement | null;
        if (parent?.clientWidth && parent.clientHeight) {
          node.x = node.element.offsetLeft / parent.clientWidth * 2 - 1;
          node.y = node.element.offsetTop / parent.clientHeight * 2 - 1;
          // Use untransformed layout geometry: the animated hit box must not
          // feed back into staging. Mobile worlds have a top-left anchor.
          const isStack = mobile.matches;
          const centerX = node.element.offsetLeft + (isStack ? node.element.offsetWidth / 2 : 0);
          const centerY = node.element.offsetTop + (isStack ? node.element.offsetHeight / 2 : 0);
          const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));
          node.element.style.setProperty("--center-shift-x", `${clamp((parent.clientWidth / 2 - centerX) * .13, isStack ? 14 : 36.4)}px`);
          node.element.style.setProperty("--center-shift-y", `${isStack ? -6 : clamp((parent.clientHeight / 2 - centerY) * .104, 23.4)}px`);
          // A Z lift otherwise projects off-centre worlds further OUTWARD.
          // Cancel that displacement before adding the small inward staging.
          const depthRatio = 247 / (1400 - node.galaxy.position.z);
          node.element.style.setProperty("--depth-compensation-x", `${isStack ? 0 : -(centerX - parent.clientWidth / 2) * depthRatio}px`);
          node.element.style.setProperty("--depth-compensation-y", `${isStack ? 0 : -(centerY - parent.clientHeight * .46) * depthRatio}px`);
        }
      }
    }
    function move(event: PointerEvent) {
      if (event.pointerType === "touch") {
        if (!touchOrigin || mode === "reduced" || lowGpu) return;
        target.x = Math.max(-1, Math.min(1, (event.clientX - touchOrigin.x) / 120));
        target.y = Math.max(-1, Math.min(1, (event.clientY - touchOrigin.y) / 160));
        wake();
        return; // Passive: scrolling remains owned by the browser, no proximity selection.
      }
      if (mode === "mobile-safe") return;
      inside = true;
      const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      const now = performance.now();
      if (lastPointer && mode === "full") {
        const elapsed = Math.max(16, now - lastPointer.time);
        target.velocityX = Math.max(-1, Math.min(1, (x - lastPointer.x) * 80 / elapsed));
        target.velocityY = Math.max(-1, Math.min(1, (y - lastPointer.y) * 80 / elapsed));
      }
      lastPointer = { x, y, time: now };
      target.x = mode === "reduced" || Math.abs(x) < 0.025 ? 0 : x;
      target.y = mode === "reduced" || Math.abs(y) < 0.025 ? 0 : y;
      const hit = (event.target as Element).closest<HTMLElement>("[data-galaxy]");
      if (hit) focus(hit.dataset.galaxy as GalaxyId);
      else if ((event.target as Element).closest("a")) focus(null);
      else {
        // Stable layout anchors avoid feedback from the animated element bounds.
        const distances = nodes.map(node => ({ id: node.galaxy.id, distance: Math.hypot((x - node.x) * bounds.width / bounds.height, y - node.y) }));
        distances.sort((a, b) => a.distance - b.distance);
        const nearest = distances[0];
        const incumbent = distances.find(item => item.id === active);
        focus(nearest.distance < 0.52 ? (incumbent && incumbent.distance < nearest.distance + 0.10 ? incumbent.id : nearest.id) : null);
      }
      const focusedNode = nodes.find(node => node.galaxy.id === active);
      target.gravity = focusedNode ? Math.max(0.3, 1 - Math.hypot((x - focusedNode.x) * bounds.width / bounds.height, y - focusedNode.y) / 0.7) : 0;
      wake();
    }
    function touchStart(event: PointerEvent) {
      if (event.pointerType === "touch") touchOrigin = { x: event.clientX, y: event.clientY };
    }
    function touchEnd() {
      if (!touchOrigin) return;
      touchOrigin = null;
      target.x = target.y = 0;
      wake();
    }
    function leave() {
      inside = false;
      lastPointer = null;
      target.velocityX = target.velocityY = 0;
      target.x = target.y = 0;
      const focused = root.querySelector<HTMLElement>("[data-galaxy]:focus");
      focus((focused?.dataset.galaxy as GalaxyId) ?? null);
      wake();
    }
    function focusIn(event: FocusEvent) {
      const node = (event.target as Element).closest<HTMLElement>("[data-galaxy]");
      focus((node?.dataset.galaxy as GalaxyId) ?? null);
      target.gravity = node ? 1 : 0;
      wake();
    }
    function focusOut(event: FocusEvent) {
      if (!inside && !root.contains(event.relatedTarget as Node | null)) focus(null);
    }
    function visibility() {
      cancelAnimationFrame(frame); frame = 0;
      if (!document.hidden) { measure(); wake(); }
    }
    controller.current = { focus };
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    root.addEventListener("pointermove", move, { passive: true });
    root.addEventListener("pointerdown", touchStart, { passive: true });
    root.addEventListener("pointerup", touchEnd, { passive: true });
    root.addEventListener("pointercancel", touchEnd, { passive: true });
    root.addEventListener("pointerenter", measure, { passive: true });
    root.addEventListener("pointerleave", leave, { passive: true });
    root.addEventListener("focusin", focusIn);
    root.addEventListener("focusout", focusOut);
    window.addEventListener("scroll", measure, { passive: true });
    reduced.addEventListener("change", updateMode);
    mobile.addEventListener("change", updateMode);
    document.addEventListener("visibilitychange", visibility);
    updateMode();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controller.current = { focus: () => {} };
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerdown", touchStart);
      root.removeEventListener("pointerup", touchEnd);
      root.removeEventListener("pointercancel", touchEnd);
      root.removeEventListener("pointerenter", measure);
      root.removeEventListener("pointerleave", leave);
      root.removeEventListener("focusin", focusIn);
      root.removeEventListener("focusout", focusOut);
      window.removeEventListener("scroll", measure);
      reduced.removeEventListener("change", updateMode);
      mobile.removeEventListener("change", updateMode);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  return { sceneRef, activeGalaxy, motionMode, focusGalaxy: (id: GalaxyId) => controller.current.focus(id) };
}
