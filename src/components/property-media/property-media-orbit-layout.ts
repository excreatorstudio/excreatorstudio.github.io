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
