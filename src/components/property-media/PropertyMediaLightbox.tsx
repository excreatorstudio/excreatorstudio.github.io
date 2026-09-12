"use client";

import { useEffect, useRef } from "react";
import type { PropertyMediaPortfolioItem } from "@/data/property-media-portfolio";
import styles from "./property-media.module.css";
import { containedVideoRect, hasSpatialSimulation, showcaseDisclosure } from "./property-media-disclosure";

type PropertyMediaLightboxProps = {
  item: PropertyMediaPortfolioItem | null;
  onClose: () => void;
};

export function PropertyMediaLightbox({ item, onClose }: PropertyMediaLightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current, watermark = watermarkRef.current;
    if (!item || !video || !watermark) return;
    let active = true;
    const update = () => {
      if (!active) return;
      const rect = containedVideoRect(video.clientWidth, video.clientHeight, video.videoWidth, video.videoHeight);
      watermark.style.visibility = rect ? "visible" : "hidden";
      if (rect) Object.assign(watermark.style, {
        left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`,
      });
    };
    const observer = new ResizeObserver(update);
    observer.observe(video);
    video.addEventListener("loadedmetadata", update);
    video.addEventListener("resize", update);
    document.addEventListener("fullscreenchange", update);
    update();
    return () => {
      active = false;
      observer.disconnect();
      video.removeEventListener("loadedmetadata", update);
      video.removeEventListener("resize", update);
      document.removeEventListener("fullscreenchange", update);
    };
  }, [item]);

  useEffect(() => {
    if (!item) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button, video");
        if (!focusable?.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
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
    <div ref={dialogRef} className={styles.lightbox} role="dialog" aria-modal="true" aria-label={`${item.title}影片播放`} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className={`${styles.lightboxInner} ${item.aspectRatio === "portrait" ? styles.lightboxPortrait : styles.lightboxLandscape}`}>
        <button ref={closeRef} type="button" className={styles.lightboxClose} onClick={onClose} aria-label="關閉影片播放">關閉 <span aria-hidden="true">×</span></button>
        <div className={styles.lightboxFrame}>
          <video key={item.id} ref={videoRef} className={styles.lightboxVideo} src={item.media} poster={item.poster} controls autoPlay playsInline preload="metadata" />
          <div ref={watermarkRef} className={styles.watermarkBounds} aria-hidden="true">
            <span className={styles.showcaseWatermark}>{showcaseDisclosure.watermark}</span>
          </div>
        </div>
        <div className={styles.lightboxCaption}>
          <p>{item.type}</p>
          <h2>{item.title}</h2>
          <span>{item.description}</span>
          <div className={styles.showcaseDisclosure}>
            <p>{showcaseDisclosure.purpose}</p>
            <small>{showcaseDisclosure.permission}</small>
            {hasSpatialSimulation(item) && <p>{showcaseDisclosure.simulation}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
