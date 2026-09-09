"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PropertyMediaPortfolioItem } from "@/data/property-media-portfolio";
import { propertyMediaIntro } from "@/data/property-media";
import { AIStagingShowcase } from "./AIStagingShowcase";
import { PropertyMediaLightbox } from "./PropertyMediaLightbox";
import { PropertyMediaPortfolio } from "./PropertyMediaPortfolio";
import { PropertyMediaServices } from "./PropertyMediaServices";
import styles from "./property-media.module.css";

type IntroState = "playing" | "handoff" | "complete";

export function PropertyMediaExperience() {
  const [introState, setIntroState] = useState<IntroState>("playing");
  const [introFailed, setIntroFailed] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PropertyMediaPortfolioItem | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const transitionTimer = useRef<number | null>(null);
  const fallbackTimer = useRef<number | null>(null);

  const finishIntro = useCallback(() => {
    if (fallbackTimer.current !== null) {
      window.clearTimeout(fallbackTimer.current);
      fallbackTimer.current = null;
    }
    setIntroState((current) => {
      if (current !== "playing") return current;
      videoRef.current?.pause();
      transitionTimer.current = window.setTimeout(() => setIntroState("complete"), 780);
      return "handoff";
    });
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) {
      setIntroState("complete");
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    const play = () => void video.play().catch(() => {
      setIntroFailed(true);
      finishIntro();
    });
    const armFallback = () => {
      const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration * 1000 : 15000;
      if (fallbackTimer.current !== null) window.clearTimeout(fallbackTimer.current);
      fallbackTimer.current = window.setTimeout(() => {
        setIntroFailed(true);
        finishIntro();
      }, Math.max(12000, duration + 5000));
    };
    if (video.readyState >= 2) {
      play();
      armFallback();
    }
    const onLoadedData = () => {
      play();
      armFallback();
    };
    video.addEventListener("loadeddata", onLoadedData, { once: true });
    return () => {
      video.removeEventListener("loadeddata", onLoadedData);
      if (fallbackTimer.current !== null) window.clearTimeout(fallbackTimer.current);
    };
  }, [finishIntro]);

  useEffect(() => () => {
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
    if (fallbackTimer.current !== null) window.clearTimeout(fallbackTimer.current);
  }, []);

  return (
    <div className={`${styles.page} ${introState === "handoff" ? styles.pageHandoff : ""} ${introState === "complete" ? styles.pageReady : ""}`}>
      <section className={styles.hero} aria-labelledby="property-media-title">
        <div className={styles.heroBackground} aria-hidden="true" />
        <div className={styles.heroAtmosphere} aria-hidden="true" />
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <div className={styles.heroTextPlate}>
            <p className={styles.kicker}>REAL ESTATE MEDIA</p>
            <h1 id="property-media-title"><span>房產影音服務</span><small>E.X Property Media</small></h1>
            <p className={styles.supporting}>實拍・口播・AI 變裝・土地模擬</p>
            <p className={styles.bodyCopy}>讓每一個物件，都有更完整的故事與生活想像。</p>
            <a className={styles.primaryCta} href="#property-media-selected-works">查看作品 <span>Selected works</span><b aria-hidden="true">↘</b></a>
          </div>
        </div>
        <div className={styles.heroMark} aria-hidden="true"><span>E.X</span><small>PROPERTY MEDIA / 01</small></div>
      </section>

      <div className={styles.content}>
        <PropertyMediaPortfolio onOpen={setSelectedItem} />
        <AIStagingShowcase onOpen={setSelectedItem} />
        <PropertyMediaServices />
      </div>

      <PropertyMediaLightbox item={selectedItem} onClose={() => setSelectedItem(null)} />

      {introState !== "complete" ? <div className={`${styles.intro} ${introState === "handoff" ? styles.introHandoff : ""}`} aria-label="房產影音服務開場動畫"><video ref={videoRef} autoPlay muted playsInline preload="auto" onEnded={finishIntro} onError={() => { setIntroFailed(true); finishIntro(); }} src={propertyMediaIntro} /><div className={styles.introBloom} aria-hidden="true" /><div className={styles.introStatus}>{introFailed ? "WELCOME" : "E.X PROPERTY MEDIA"}</div></div> : null}
    </div>
  );
}
