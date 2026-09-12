/** Discrete ring planes; CSS interpolates every card together, with no render-time randomness. */
export function normalizeOrbitIndex(index: number, length: number) {
  return length > 0 ? ((index % length) + length) % length : 0;
}

export function orbitPlane(index: number, active: number, count: number) {
  const forward = normalizeOrbitIndex(index - active, count);
  const offset = forward > count / 2 ? forward - count : forward;
  const distance = Math.abs(offset);
  const slot = distance === 0 ? "center" : distance === 1 ? (offset < 0 ? "left" : "right") : "rear";
  if (distance < 2) return {
    slot, distance, x: offset * .92, y: distance * 17,
    scale: distance ? .89 : 1, yaw: offset * -12,
    opacity: 1, z: distance ? 90 : 100,
  } as const;
  const angle = offset * 2 * Math.PI / count;
  const depth = (1 - Math.cos(angle)) / 2;
  return {
    slot, distance, x: 1.72 * Math.sin(angle), y: -12 - depth * 58,
    scale: .84 - depth * .42, yaw: -Math.sin(angle) * 16,
    opacity: .85 - depth * .2, z: Math.round(70 - depth * 40),
  } as const;
}

/** Fractional positions use the same approved desktop stops. No active-item side effects. */
export function continuousOrbitPlane(index: number, position: number, count: number, mobile = false) {
  if (mobile) {
    const forward = normalizeOrbitIndex(index - position, count);
    const offset = forward > count / 2 ? forward - count : forward;
    const distance = Math.abs(offset), side = Math.sign(offset);
    const front = Math.min(1, distance), rear = Math.min(1, Math.max(0, distance - 1));
    return {
      x: side * (.99 * front + .49 * rear), y: 12 * front - 16 * rear,
      scale: 1 - .09 * front - .21 * rear, yaw: side * -6 * rear,
      opacity: 1 - rear, z: Math.round(100 - Math.min(distance, 4) * 12),
    };
  }
  const lower = Math.floor(position), amount = position - lower;
  const a = orbitPlane(index, lower, count), b = orbitPlane(index, lower + 1, count);
  const mix = (start: number, end: number) => start + (end - start) * amount;
  return { x: mix(a.x, b.x), y: mix(a.y, b.y), scale: mix(a.scale, b.scale),
    yaw: mix(a.yaw, b.yaw), opacity: mix(a.opacity, b.opacity), z: Math.round(mix(a.z, b.z)) };
}
