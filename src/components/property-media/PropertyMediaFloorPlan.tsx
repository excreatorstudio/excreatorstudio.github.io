"use client";

import { FloorPlanShowcase } from "./FloorPlanShowcase";
import styles from "./property-media-scene.module.css";

export function PropertyMediaFloorPlan() {
  return (
    <section className={styles.floorPlan} aria-labelledby="floorplan-title" data-asset-status="GLB READY" data-model-status="VERIFIED">
      <div><p>SPACE / PERSPECTIVE</p><h2 id="floorplan-title">360° 格局展示</h2><small>360° Floor Plan Experience</small></div>
      <FloorPlanShowcase mode="model" />
    </section>
  );
}
