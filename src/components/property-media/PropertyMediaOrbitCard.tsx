"use client";

import Image from "next/image";
import { forwardRef, type CSSProperties } from "react";
import type { orbitPlane } from "./property-media-orbit-layout";
import type { PropertyMediaOrbitItem } from "@/data/property-media-vnext";
import styles from "./property-media-orbit.module.css";

type PropertyMediaOrbitCardProps = {
  item: PropertyMediaOrbitItem;
  active: boolean;
  plane: ReturnType<typeof orbitPlane>;
  onSelect: (item: PropertyMediaOrbitItem) => void;
  onOpenMedia?: (item: PropertyMediaOrbitItem) => void;
};

export const PropertyMediaOrbitCard = forwardRef<HTMLElement, PropertyMediaOrbitCardProps>(function PropertyMediaOrbitCard({ item, active, plane, onSelect, onOpenMedia }, ref) {
  return (
    <article
      ref={ref}
      id={`property-media-orbit-card-${item.id}`}
      className={styles.cardShell}
      role="listitem"
      data-orbit-item-id={item.id}
      data-orbit-placement={plane.slot}
      data-orbit-distance={plane.distance}
      style={{ "--ring-x": plane.x, "--ring-y": `${plane.y}px`, "--ring-scale": plane.scale, "--ring-yaw": `${plane.yaw}deg`, "--ring-opacity": plane.opacity, zIndex: plane.z } as CSSProperties}
      data-display-aspect-ratio={item.displayAspectRatio}
    >
      <button
        type="button"
        className={styles.cardSelect}
        aria-pressed={active}
        aria-label={`${onOpenMedia ? "播放作品" : "選取"}：${item.title}`}
        aria-haspopup={onOpenMedia ? "dialog" : undefined}
        onClick={() => { onSelect(item); onOpenMedia?.(item); }}
        onFocus={(event) => { if (plane.slot === "rear" && event.currentTarget.matches(":focus-visible")) onSelect(item); }}
      >
        <Image className={styles.cardPoster} src={item.poster} alt={`${item.title}預覽`} width={300} height={400} unoptimized draggable={false} />
        <span className={styles.cardMeta}>
          <strong>{item.title}</strong>
          {item.englishSubtitle ? <small>{item.englishSubtitle}</small> : null}
        </span>
      </button>
    </article>
  );
});
