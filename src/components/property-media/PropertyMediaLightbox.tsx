"use client";

import { useEffect, useRef } from "react";
import type { PropertyMediaPortfolioItem } from "@/data/property-media-portfolio";
import styles from "./property-media.module.css";

type PropertyMediaLightboxProps = {
  item: PropertyMediaPortfolioItem | null;
  onClose: () => void;
};

export function PropertyMediaLightbox({ item, onClose }: PropertyMediaLightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!item) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        event.preventDefault();
        closeRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
      previousFocus.current?.focus();
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={`${item.title}影片播放`} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className={`${styles.lightboxInner} ${item.aspectRatio === "portrait" ? styles.lightboxPortrait : styles.lightboxLandscape}`}>
        <button ref={closeRef} type="button" className={styles.lightboxClose} onClick={onClose} aria-label="關閉影片播放">關閉 <span aria-hidden="true">×</span></button>
        <video className={styles.lightboxVideo} src={item.media} poster={item.poster} controls autoPlay playsInline preload="metadata" />
        <div className={styles.lightboxCaption}>
          <p>{item.type}</p>
          <h2>{item.title}</h2>
          <span>{item.description}</span>
        </div>
      </div>
    </div>
  );
}
