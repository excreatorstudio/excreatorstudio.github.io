"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import type { PropertyMediaPortfolioItem } from "@/data/property-media-portfolio";
import {
  propertyMediaOrbitRing,
  toPropertyMediaPortfolioItem,
  type PropertyMediaOrbitItem,
} from "@/data/property-media-vnext";
import { PropertyMediaOrbitCard } from "./PropertyMediaOrbitCard";
import { normalizeOrbitIndex as normalizeIndex, orbitPlane, continuousOrbitPlane } from "./property-media-orbit-layout";
import { moveOrbitGesture, orbitReleaseTarget, ORBIT_CLICK_SLOP, ORBIT_SETTLE_MS, type OrbitGesture } from "./property-media-orbit-gesture";
import styles from "./property-media-orbit.module.css";

export const PROPERTY_MEDIA_ORBIT_CLICK_SLOP_PX = ORBIT_CLICK_SLOP;

type PropertyMediaOrbitProps = {
  items?: readonly PropertyMediaOrbitItem[];
  activeIndex?: number;
  defaultActiveIndex?: number;
  onActiveIndexChange?: (index: number, item: PropertyMediaOrbitItem) => void;
  onSelect?: (item: PropertyMediaOrbitItem, index: number) => void;
  onOpenMedia?: (item: PropertyMediaPortfolioItem) => void;
  ariaLabel?: string;
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
  const dragRef = useRef<OrbitGesture | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const suppressClickRef = useRef(false);
  const trackId = "property-media-vnext-orbit-track";
  const currentIndex = items.length > 0 ? normalizeIndex(activeIndex ?? internalActiveIndex, items.length) : 0;
  const committed = useRef(currentIndex);
  committed.current = currentIndex;
  const motion = useRef({ position: currentIndex, target: currentIndex, frame: 0 });

  const paint = useCallback((position: number) => {
    motion.current.position = position;
    const track = trackRef.current;
    if (track) track.dataset.visualPosition = String(position);
    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      for (const mobile of [false, true]) {
        const plane = continuousOrbitPlane(index, position, items.length, mobile);
        const prefix = mobile ? "--mobile" : "--ring";
        card.style.setProperty(`${prefix}-x`, String(plane.x));
        card.style.setProperty(`${prefix}-y`, `${plane.y}px`);
        card.style.setProperty(`${prefix}-scale`, String(plane.scale));
        card.style.setProperty(`${prefix}-yaw`, `${plane.yaw}deg`);
        card.style.setProperty(`${prefix}-opacity`, String(plane.opacity));
        if (mobile) card.dataset.mobileVisible = plane.opacity > .01 ? "true" : "false";
        else card.style.zIndex = String(plane.z);
      }
    });
  }, [items.length]);

  const halt = useCallback(() => {
    if (motion.current.frame) cancelAnimationFrame(motion.current.frame);
    motion.current.frame = 0;
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener?.("change", update);
    return () => mediaQuery.removeEventListener?.("change", update);
  }, []);

  const commitIndex = useCallback((index: number) => {
    if (items.length === 0) return;
    const nextIndex = normalizeIndex(index, items.length);
    if (nextIndex === committed.current) return;
    const item = items[nextIndex];
    if (activeIndex === undefined) setInternalActiveIndex(nextIndex);
    onActiveIndexChange?.(nextIndex, item);
    onSelect?.(item, nextIndex);
  }, [activeIndex, items, onActiveIndexChange, onSelect]);

  const dock = useCallback((target: number) => {
    halt();
    const start = motion.current.position;
    motion.current.target = target;
    const track = trackRef.current;
    if (track) track.dataset.motion = "settling";
    const finish = () => {
      paint(target);
      motion.current.frame = 0;
      if (track) track.dataset.motion = "idle";
      commitIndex(target);
    };
    if (reducedMotion || Math.abs(start - target) < .001) { finish(); return; }
    const began = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - began) / ORBIT_SETTLE_MS);
      paint(start + (target - start) * (1 - (1 - progress) ** 3));
      if (progress < 1) motion.current.frame = requestAnimationFrame(step);
      else finish();
    };
    motion.current.frame = requestAnimationFrame(step);
  }, [halt, paint, commitIndex, reducedMotion]);

  const selectIndex = useCallback((index: number) => {
    const delta = normalizeIndex(index - motion.current.position + items.length / 2, items.length) - items.length / 2;
    dock(motion.current.position + delta);
  }, [dock, items.length]);

  useEffect(() => {
    // External controlled selection uses the same docking path; callbacks commit only at rest.
    if (!dragRef.current && !motion.current.frame && normalizeIndex(motion.current.position, items.length) !== currentIndex) selectIndex(currentIndex);
  }, [currentIndex, items.length, selectIndex]);

  useEffect(() => () => {
    halt();
    const drag = dragRef.current, track = trackRef.current;
    dragRef.current = null;
    if (drag && track?.hasPointerCapture(drag.pointerId)) track.releasePointerCapture(drag.pointerId);
  }, [halt]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary) {
      const drag = dragRef.current;
      if (drag) {
        dragRef.current = null; suppressClickRef.current = true;
        if (event.currentTarget.hasPointerCapture(drag.pointerId)) event.currentTarget.releasePointerCapture(drag.pointerId);
        dock(Math.round(drag.startPosition));
      }
      return;
    }
    if (event.pointerType === "mouse" && event.button !== 0) return;
    halt(); // Keep the last painted (visible) fractional position on interruption.
    suppressClickRef.current = false;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const stride = Math.max(1, (cardRefs.current[0]?.offsetWidth || 200) * (mobile ? .99 : .92));
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY,
      deltaX: 0, startPosition: motion.current.position, stride, axis: "pending", maxTravel: 0,
      captured: false, velocity: 0, samples: [{ x: event.clientX, time: event.timeStamp }] };
    event.currentTarget.dataset.motion = "holding";
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
    const position = moveOrbitGesture(drag, event.clientX, event.clientY, event.timeStamp);
    if (drag.maxTravel >= PROPERTY_MEDIA_ORBIT_CLICK_SLOP_PX) suppressClickRef.current = true;
    if (drag.axis !== "horizontal") return;
    if (!drag.captured) {
      drag.captured = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    event.currentTarget.dataset.motion = "dragging";
    paint(position);
  };

  const resetPointer = (event: ReactPointerEvent<HTMLDivElement>, resolve = false) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    suppressClickRef.current = !resolve || drag.maxTravel >= PROPERTY_MEDIA_ORBIT_CLICK_SLOP_PX;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (resolve && drag.axis === "horizontal") dock(orbitReleaseTarget(drag, motion.current.position, event.timeStamp, reducedMotion));
    else dock(Math.round(drag.startPosition));
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
          dock(Math.round(motion.current.target) - 1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          dock(Math.round(motion.current.target) + 1);
        }
      }}
    >
      <div className={styles.controls} aria-label="作品導覽控制">
        <button type="button" className={styles.controlButton} onClick={() => dock(Math.round(motion.current.target) - 1)} aria-label="上一個精選作品" aria-controls={trackId}>
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M19 12H5m6-6-6 6 6 6" /></svg>
        </button>
        <button type="button" className={styles.controlButton} onClick={() => dock(Math.round(motion.current.target) + 1)} aria-label="下一個精選作品" aria-controls={trackId}>
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
        </button>
      </div>
      <p className={styles.status} aria-live="polite">{items[currentIndex].title} · {currentIndex + 1} / {items.length}</p>
      <div
        id={trackId}
        ref={trackRef}
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
        onLostPointerCapture={(event) => {
          const drag = dragRef.current;
          // A descendant's implicit capture is transferred to this track: its bubbling loss is NOT cancellation.
          if (drag?.captured && drag.pointerId === event.pointerId && event.target === event.currentTarget
            && !event.currentTarget.hasPointerCapture(event.pointerId)) resetPointer(event);
        }}
        onClickCapture={handleClickCapture}
      >
        {items.map((item, index) => (
          <PropertyMediaOrbitCard
            key={item.id}
            item={item}
            active={index === currentIndex}
            plane={orbitPlane(index, currentIndex, items.length)}
            mobilePlane={continuousOrbitPlane(index, currentIndex, items.length, true)}
            onSelect={() => selectIndex(index)}
            onOpenMedia={onOpenMedia ? (orbitItem) => onOpenMedia(toPropertyMediaPortfolioItem(orbitItem)) : undefined}
            ref={(element) => { cardRefs.current[index] = element; }}
          />
        ))}
      </div>
    </section>
  );
}
