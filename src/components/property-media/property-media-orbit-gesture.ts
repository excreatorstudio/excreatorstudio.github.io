export const ORBIT_CLICK_SLOP = 8;
export const ORBIT_SETTLE_MS = 280;
export type OrbitGesture = {
  pointerId: number; startX: number; startY: number; deltaX: number;
  startPosition: number; stride: number; axis: "pending" | "horizontal" | "vertical";
  maxTravel: number; captured: boolean; velocity: number;
  samples: { x: number; time: number }[];
};

export function moveOrbitGesture(drag: OrbitGesture, x: number, y: number, time: number) {
  drag.deltaX = x - drag.startX;
  const vertical = Math.abs(y - drag.startY);
  drag.maxTravel = Math.max(drag.maxTravel, Math.hypot(drag.deltaX, vertical));
  if (drag.axis === "pending" && drag.maxTravel >= ORBIT_CLICK_SLOP) {
    drag.axis = vertical > Math.abs(drag.deltaX) ? "vertical" : "horizontal";
  }
  drag.samples.push({ x, time });
  drag.samples = drag.samples.filter(sample => time - sample.time <= 100).slice(-12);
  const first = drag.samples[0];
  drag.velocity = time > first.time ? (x - first.x) / (time - first.time) : 0;
  return drag.startPosition - drag.deltaX / drag.stride;
}

export function orbitReleaseTarget(drag: OrbitGesture, position: number, time: number, reduced: boolean) {
  const recent = time - drag.samples[drag.samples.length - 1].time < 100;
  const inertia = reduced || !recent ? 0 : Math.max(-.65, Math.min(.65, -drag.velocity * 120 / drag.stride));
  const projected = position + inertia;
  let target = Math.round(projected);
  const anchor = Math.round(drag.startPosition);
  // A deliberate short swipe advances; tiny slow drags dock back. Long drags may pass many stops.
  if (target === anchor && Math.abs(projected - anchor) >= .24) target += Math.sign(projected - anchor);
  return target;
}
