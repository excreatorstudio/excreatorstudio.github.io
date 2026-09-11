export const FLOOR_PLAN_LIMITS = { pitch: 3, yaw: 6, minZoom: 0.92, maxZoom: 1.08 } as const;
export type FloorPlanView = { pitch: number; yaw: number; zoom: number };
export const INITIAL_FLOOR_PLAN_VIEW: FloorPlanView = { pitch: 0, yaw: 0, zoom: 1 };
export function clampFloorPlanView(view: FloorPlanView): FloorPlanView {
  const safe = (value: number, min: number, max: number, fallback: number) => Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
  return { pitch: safe(view.pitch, -FLOOR_PLAN_LIMITS.pitch, FLOOR_PLAN_LIMITS.pitch, 0), yaw: safe(view.yaw, -FLOOR_PLAN_LIMITS.yaw, FLOOR_PLAN_LIMITS.yaw, 0), zoom: safe(view.zoom, FLOOR_PLAN_LIMITS.minZoom, FLOOR_PLAN_LIMITS.maxZoom, 1) };
}
export function dragFloorPlanView(view: FloorPlanView, deltaX: number, deltaY: number): FloorPlanView {
  return clampFloorPlanView({ ...view, yaw: view.yaw + deltaX / 28, pitch: view.pitch - deltaY / 50 });
}
