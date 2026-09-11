"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import type { PropertyMediaPortfolioItem } from "@/data/property-media-portfolio";
import {
  propertyMediaOrbitRing,
  toPropertyMediaPortfolioItem,
  type PropertyMediaOrbitItem,
} from "@/data/property-media-vnext";
import { PropertyMediaOrbitCard } from "./PropertyMediaOrbitCard";
import { normalizeOrbitIndex as normalizeIndex, orbitPlane } from "./property-media-orbit-layout";
import styles from "./property-media-orbit.module.css";

export const PROPERTY_MEDIA_ORBIT_DRAG_THRESHOLD_PX = 48;
export const PROPERTY_MEDIA_ORBIT_CLICK_SLOP_PX = 8;

type PropertyMediaOrbitProps = {
  items?: readonly PropertyMediaOrbitItem[];
  activeIndex?: number;
  defaultActiveIndex?: number;
  onActiveIndexChange?: (index: number, item: PropertyMediaOrbitItem) => void;
  onSelect?: (item: PropertyMediaOrbitItem, index: number) => void;
  onOpenMedia?: (item: PropertyMediaPortfolioItem) => void;
  ariaLabel?: string;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  deltaX: number;
  moved: boolean;
};

const initialIndexFor = (items: readonly PropertyMediaOrbitItem[], requested?: number) => {
  if (items.length === 0) return 0;
  if (requested !== undefined) return normalizeIndex(requested, items.length);
  const defaultIndex = items.findIndex((item) => item.defaultActive);
  return defaultIndex >= 0 ? defaultIndex : 0;
};

export function PropertyMediaOrbit({
  items = propertyMediaOrbitRing,
  activeIndex,
  defaultActiveIndex,
  onActiveIndexChange,
  onSelect,
  onOpenMedia,
  ariaLabel = "Property Media 精選作品導覽",
}: PropertyMediaOrbitProps) {
  const [internalActiveIndex, setInternalActiveIndex] = useState(() => initialIndexFor(items, defaultActiveIndex));
  const [reducedMotion, setReducedMotion] = useState(false);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const dragRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);
  const trackId = "property-media-vnext-orbit-track";
  const currentIndex = items.length > 0 ? normalizeIndex(activeIndex ?? internalActiveIndex, items.length) : 0;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener?.("change", update);
    return () => mediaQuery.removeEventListener?.("change", update);
  }, []);

  const selectIndex = useCallback((index: number) => {
    if (items.length === 0) return;
    const nextIndex = normalizeIndex(index, items.length);
    const item = items[nextIndex];
    if (activeIndex === undefined) setInternalActiveIndex(nextIndex);
    onActiveIndexChange?.(nextIndex, item);
    onSelect?.(item, nextIndex);
  }, [activeIndex, items, onActiveIndexChange, onSelect]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    suppressClickRef.current = false;
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, deltaX: 0, moved: false };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag && !reducedMotion && event.pointerType === "mouse" && window.matchMedia("(min-width: 768px) and (hover: hover)").matches) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
      event.currentTarget.style.setProperty("--cursor-x", `${x * 4}px`);
      event.currentTarget.style.setProperty("--cursor-y", `${y * 3}px`);
      event.currentTarget.style.setProperty("--cursor-yaw", `${x * 1.2}deg`);
    }
    if (!drag || drag.pointerId !== event.pointerId) return;
    drag.deltaX = event.clientX - drag.startX;
    const vertical = Math.abs(event.clientY - drag.startY);
    if (!drag.moved && vertical > Math.abs(drag.deltaX) && vertical > PROPERTY_MEDIA_ORBIT_CLICK_SLOP_PX) {
      suppressClickRef.current = true;
      dragRef.current = null;
      return;
    }
    if (Math.abs(drag.deltaX) >= PROPERTY_MEDIA_ORBIT_CLICK_SLOP_PX) {
      drag.moved = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      event.currentTarget.style.setProperty("--drag-offset", `${Math.max(-32, Math.min(32, drag.deltaX * .18))}px`);
    }
  };

  const resetPointer = (event: ReactPointerEvent<HTMLDivElement>, resolve = false) => {
    if (!resolve) suppressClickRef.current = true;
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (resolve && Math.abs(drag.deltaX) >= PROPERTY_MEDIA_ORBIT_DRAG_THRESHOLD_PX) {
      selectIndex(currentIndex + (drag.deltaX < 0 ? 1 : -1));
    }
    suppressClickRef.current = !resolve || drag.moved;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    event.currentTarget.style.setProperty("--drag-offset", "0px");
  };

  const handleClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    // Native Enter/Space activation must remain usable after a cancelled gesture.
    if (event.detail === 0 || !suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  };

  if (items.length === 0) return null;

  return (
    <section
      className={styles.orbit}
      tabIndex={0}
      aria-label={ariaLabel}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          selectIndex(currentIndex - 1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          selectIndex(currentIndex + 1);
        }
      }}
    >
      <div className={styles.controls} aria-label="作品導覽控制">
        <button type="button" className={styles.controlButton} onClick={() => selectIndex(currentIndex - 1)} aria-label="上一個精選作品" aria-controls={trackId}>
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M19 12H5m6-6-6 6 6 6" /></svg>
        </button>
        <button type="button" className={styles.controlButton} onClick={() => selectIndex(currentIndex + 1)} aria-label="下一個精選作品" aria-controls={trackId}>
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
        </button>
      </div>
      <p className={styles.status} aria-live="polite">{items[currentIndex].title} · {currentIndex + 1} / {items.length}</p>
      <div
        id={trackId}
        className={styles.track}
        role="list"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={(event) => {
          event.currentTarget.style.setProperty("--cursor-x", "0px");
          event.currentTarget.style.setProperty("--cursor-y", "0px");
          event.currentTarget.style.setProperty("--cursor-yaw", "0deg");
        }}
        onPointerUp={(event) => resetPointer(event, true)}
        onPointerCancel={(event) => resetPointer(event)}
        onLostPointerCapture={(event) => { if (dragRef.current) resetPointer(event); }}
        onClickCapture={handleClickCapture}
      >
        {items.map((item, index) => (
          <PropertyMediaOrbitCard
            key={item.id}
            item={item}
            active={index === currentIndex}
            plane={orbitPlane(index, currentIndex, items.length)}
            onSelect={() => selectIndex(index)}
            onOpenMedia={onOpenMedia ? (orbitItem) => onOpenMedia(toPropertyMediaPortfolioItem(orbitItem)) : undefined}
            ref={(element) => { cardRefs.current[index] = element; }}
          />
        ))}
      </div>
    </section>
  );
}
