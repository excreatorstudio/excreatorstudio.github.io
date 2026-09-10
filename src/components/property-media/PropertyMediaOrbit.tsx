"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import type { PropertyMediaPortfolioItem } from "@/data/property-media-portfolio";
import {
  propertyMediaVnextOrbit,
  toPropertyMediaPortfolioItem,
  type PropertyMediaOrbitItem,
} from "@/data/property-media-vnext";
import { PropertyMediaOrbitCard } from "./PropertyMediaOrbitCard";
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
  deltaX: number;
  moved: boolean;
};

const normalizeIndex = (index: number, length: number) => ((index % length) + length) % length;

const initialIndexFor = (items: readonly PropertyMediaOrbitItem[], requested?: number) => {
  if (items.length === 0) return 0;
  if (requested !== undefined) return normalizeIndex(requested, items.length);
  const defaultIndex = items.findIndex((item) => item.defaultActive);
  return defaultIndex >= 0 ? defaultIndex : 0;
};

export function PropertyMediaOrbit({
  items = propertyMediaVnextOrbit,
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
    cardRefs.current[nextIndex]?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeIndex, items, onActiveIndexChange, onSelect, reducedMotion]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    suppressClickRef.current = false;
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, deltaX: 0, moved: false };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    drag.deltaX = event.clientX - drag.startX;
    if (Math.abs(drag.deltaX) >= PROPERTY_MEDIA_ORBIT_CLICK_SLOP_PX) drag.moved = true;
  };

  const resetPointer = (event: ReactPointerEvent<HTMLDivElement>, resolve = false) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (resolve && Math.abs(drag.deltaX) >= PROPERTY_MEDIA_ORBIT_DRAG_THRESHOLD_PX) {
      selectIndex(currentIndex + (drag.deltaX < 0 ? 1 : -1));
    }
    suppressClickRef.current = drag.moved;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    dragRef.current = null;
  };

  const handleClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;
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
          上一個
        </button>
        <button type="button" className={styles.controlButton} onClick={() => selectIndex(currentIndex + 1)} aria-label="下一個精選作品" aria-controls={trackId}>
          下一個
        </button>
      </div>
      <div
        id={trackId}
        className={styles.track}
        role="list"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => resetPointer(event, true)}
        onPointerCancel={(event) => resetPointer(event)}
        onClickCapture={handleClickCapture}
      >
        {items.map((item, index) => (
          <PropertyMediaOrbitCard
            key={item.id}
            item={item}
            active={index === currentIndex}
            onSelect={() => selectIndex(index)}
            onOpenMedia={onOpenMedia ? (orbitItem) => onOpenMedia(toPropertyMediaPortfolioItem(orbitItem)) : undefined}
            ref={(element) => { cardRefs.current[index] = element; }}
          />
        ))}
      </div>
    </section>
  );
}
