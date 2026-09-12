"use client";

import { useEffect, useRef, useState } from "react";
import type { UniverseGalaxy } from "@/data/universe-navigation";
import { universeGalaxies } from "@/data/universe-navigation";

type GalaxyId = UniverseGalaxy["id"];
export type MotionMode = "full" | "low-gpu" | "mobile-safe" | "reduced";

// A bounded viewport-relative depth signal, never a navigation/active-state decision.
export function corridorProgress(center: number, scrollY: number, viewportHeight: number) {
  return Math.max(-1, Math.min(1, (scrollY + viewportHeight * .48 - center) / Math.max(240, viewportHeight * .7)));
}

/** One demand-driven frame loop owns all spatial transforms. No React updates per frame. */
export function useUniverseMotion(enabled = true) {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const controller = useRef<{ focus: (id: GalaxyId | null) => void }>({ focus: () => {} });
  const [activeGalaxy, setActiveGalaxy] = useState<GalaxyId | null>(null);
  const [motionMode, setMotionMode] = useState<MotionMode>("reduced");
  const [gyroActive, setGyroActive] = useState(false);
  const [sensorPrompt, setSensorPrompt] = useState(false);
  const sensorRequest = useRef<() => void>(() => {});

  useEffect(() => {
    const element = sceneRef.current;
    if (!element) return;
    const root: HTMLDivElement = element;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = matchMedia("(max-width: 767px)");
    const hardware = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    // Missing capability hints default to standard. Four cores alone are not low GPU.
    const lowGpu = hardware.connection?.saveData === true || ((hardware.deviceMemory ?? 8) <= 2 && (navigator.hardwareConcurrency || 8) <= 2);
    const nodes = universeGalaxies.map(galaxy => ({
      galaxy, element: root.querySelector<HTMLElement>(`[data-galaxy="${galaxy.id}"]`)!, weight: 0,
      layoutCenter: 0, scroll: 0, scrollTarget: 0, emphasis: 0, emphasisTarget: 0,
      x: parseFloat(galaxy.position.x) / 50 - 1, y: parseFloat(galaxy.position.y) / 50 - 1,
    }));
    let mode: MotionMode = "reduced";
    let active: GalaxyId | null = null;
    let bounds = root.getBoundingClientRect();
    let documentTop = bounds.top + (window.scrollY || 0);
    const target = { x: 0, y: 0, focusX: 0, focusY: 0, engaged: 0, lightX: 0, lightY: 0, gravity: 0, velocityX: 0, velocityY: 0 };
    const current = { ...target };
    let frame = 0;
    let previousTime = 0;
    let inside = false;
    let lastPointer: { x: number; y: number; time: number } | null = null;
    let touchOrigin: { x: number; y: number } | null = null;
    const sensor = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
    const permissionKey = "ex-universe-gyro-permission";
    let permission = "";
    try { permission = sessionStorage.getItem(permissionKey) ?? ""; } catch { /* Storage is optional. */ }
    let disposed = false;
    let listening = false;
    let baseline: { beta: number; gamma: number } | null = null;
    let lastSensorTime = 0;
    let lastSensorTarget = { x: 0, y: 0 };
    function orientation(event: DeviceOrientationEvent) {
      if (!enabled || document.hidden || mode !== "mobile-safe" || event.beta === null || event.gamma === null || !Number.isFinite(event.beta) || !Number.isFinite(event.gamma)) return;
      const now = performance.now();
      if (now - lastSensorTime < 32) return;
      lastSensorTime = now;
      baseline ??= { beta: event.beta, gamma: event.gamma };
      const clamp = (value: number) => Math.max(-1, Math.min(1, value));
      const wrap = (value: number) => ((value + 540) % 360) - 180;
      const x = clamp(wrap(event.gamma - baseline.gamma) / 24);
      const y = clamp(wrap(event.beta - baseline.beta) / 28);
      // Deadband prevents sensor noise from keeping the settled loop awake.
      if (Math.abs(x - lastSensorTarget.x) < .015 && Math.abs(y - lastSensorTarget.y) < .015) return;
      lastSensorTarget = { x, y };
      if (!touchOrigin) { target.x = x; target.y = y; wake(); }
    }
    function syncSensor() {
      const allowed = enabled && mode === "mobile-safe" && !document.hidden && !!sensor;
      const permitted = !sensor?.requestPermission || permission === "granted";
      if (allowed && permitted && !listening) {
        window.addEventListener("deviceorientation", orientation, { passive: true });
        listening = true;
        baseline = null;
      } else if ((!allowed || !permitted) && listening) {
        window.removeEventListener("deviceorientation", orientation);
        listening = false;
      }
      setGyroActive(listening);
      setSensorPrompt(allowed && !!sensor?.requestPermission && !permission);
    }
    sensorRequest.current = () => {
      if (!enabled || mode !== "mobile-safe" || permission || !sensor?.requestPermission) return;
      permission = "requested";
      try { sessionStorage.setItem(permissionKey, permission); } catch { /* Optional. */ }
      setSensorPrompt(false);
      // Called directly from the button gesture, never retried on denial.
      try {
        void sensor.requestPermission().then(result => {
          permission = result === "granted" ? "granted" : "denied";
          try { sessionStorage.setItem(permissionKey, permission); } catch { /* Optional. */ }
          if (!disposed) syncSensor();
        }).catch(() => { permission = "denied"; try { sessionStorage.setItem(permissionKey, permission); } catch { /* Optional. */ } });
      } catch { permission = "denied"; }
    };

    function wake() {
      if (enabled && !frame && !document.hidden) { previousTime = performance.now(); frame = requestAnimationFrame(tick); }
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
      const driftGain = mode === "full" ? 1.4 : mode === "mobile-safe" ? (listening ? 2.1 : 1.8) : 1;
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
        // Reuse this loop; no layout reads and no React focus updates while scrolling.
        for (const key of ["scroll", "emphasis"] as const) {
          const destination = key === "scroll" ? node.scrollTarget : node.emphasisTarget;
          node[key] += (destination - node[key]) * alpha;
          if (Math.abs(destination - node[key]) < .0005) node[key] = destination;
          else unsettled = true;
        }
        node.element.style.setProperty("--scroll-depth", node.scroll.toFixed(4));
        node.element.style.setProperty("--corridor-emphasis", node.emphasis.toFixed(4));
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
      syncSensor();
      measure();
      wake();
    }
    function measure() {
      bounds = root.getBoundingClientRect();
      documentTop = bounds.top + (window.scrollY || 0);
      root.style.setProperty("--field-half-width", `${root.clientWidth / 2}px`);
      root.style.setProperty("--field-half-height", `${root.clientHeight / 2}px`);
      for (const node of nodes) {
        let offset = 0;
        let ancestor: HTMLElement | null = node.element;
        while (ancestor && ancestor !== root) {
          offset += ancestor.offsetTop || 0;
          ancestor = ancestor.offsetParent as HTMLElement | null;
        }
        node.layoutCenter = offset + (node.element.offsetHeight || 0) * .4;
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
          node.element.style.setProperty("--center-shift-x", `${clamp((parent.clientWidth / 2 - centerX) * (isStack ? .195 : .13), isStack ? 21 : 36.4)}px`);
          node.element.style.setProperty("--center-shift-y", `${isStack ? -6 : clamp((parent.clientHeight / 2 - centerY) * .104, 23.4)}px`);
          // A Z lift otherwise projects off-centre worlds further OUTWARD.
          // Cancel that displacement before adding the small inward staging.
          const depthRatio = 247 / (1400 - node.galaxy.position.z);
          node.element.style.setProperty("--depth-compensation-x", `${isStack ? 0 : -(centerX - parent.clientWidth / 2) * depthRatio}px`);
          node.element.style.setProperty("--depth-compensation-y", `${isStack ? 0 : -(centerY - parent.clientHeight * .46) * depthRatio}px`);
        }
      }
      updateScroll();
    }
    function updateScroll() {
      const dynamic = enabled && mobile.matches && mode === "mobile-safe" && !document.hidden;
      for (const node of nodes) {
        const progress = dynamic ? corridorProgress(documentTop + node.layoutCenter, window.scrollY || 0, window.innerHeight || 1) : 0;
        node.scrollTarget = progress;
        node.emphasisTarget = dynamic ? Math.max(0, 1 - Math.abs(progress) / .65) : 0;
      }
      if (dynamic) wake();
    }
    function scroll() {
      if (mobile.matches) updateScroll(); // Cached layout geometry; native scrolling owns the page.
      else measure(); // Preserve desktop pointer-space measurement.
    }
    function move(event: PointerEvent) {
      if (!enabled) return;
      if (event.pointerType === "touch") {
        if (!touchOrigin || mode === "reduced" || lowGpu) return;
        target.x = Math.max(-1, Math.min(1, (event.clientX - touchOrigin.x) / 120));
        target.y = Math.max(-1, Math.min(1, (event.clientY - touchOrigin.y) / 160));
        wake();
        return; // Passive: scrolling remains owned by the browser, no proximity selection.
      }
      if (mode === "mobile-safe") {
        if (listening) return;
        target.x = Math.max(-1, Math.min(1, event.clientX / window.innerWidth * 2 - 1));
        target.y = Math.max(-1, Math.min(1, event.clientY / window.innerHeight * 2 - 1));
        wake();
        return;
      }
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
      target.x = listening ? lastSensorTarget.x : 0;
      target.y = listening ? lastSensorTarget.y : 0;
      wake();
    }
    function leave() {
      inside = false;
      lastPointer = null;
      target.velocityX = target.velocityY = 0;
      target.x = listening ? lastSensorTarget.x : 0;
      target.y = listening ? lastSensorTarget.y : 0;
      const focused = root.querySelector<HTMLElement>("[data-galaxy]:focus-within");
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
      syncSensor();
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
    window.addEventListener("scroll", scroll, { passive: true });
    reduced.addEventListener("change", updateMode);
    mobile.addEventListener("change", updateMode);
    document.addEventListener("visibilitychange", visibility);
    updateMode();
    return () => {
      disposed = true;
      window.removeEventListener("deviceorientation", orientation);
      sensorRequest.current = () => {};
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
      window.removeEventListener("scroll", scroll);
      reduced.removeEventListener("change", updateMode);
      mobile.removeEventListener("change", updateMode);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [enabled]);

  return { sceneRef, activeGalaxy, motionMode, gyroActive, sensorPrompt, enableGyro: () => sensorRequest.current(), focusGalaxy: (id: GalaxyId) => controller.current.focus(id) };
}
