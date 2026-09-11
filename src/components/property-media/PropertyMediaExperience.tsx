"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PropertyMediaPortfolioItem } from "@/data/property-media-portfolio";
import { propertyMediaVnextIntro } from "@/data/property-media-vnext";
import { AIStagingShowcase } from "./AIStagingShowcase";
import { PropertyMediaLightbox } from "./PropertyMediaLightbox";
import { PropertyMediaPortfolio } from "./PropertyMediaPortfolio";
import { PropertyMediaServices } from "./PropertyMediaServices";
import { PropertyMediaOrbit } from "./PropertyMediaOrbit";
import { PropertyMediaFloorPlan } from "./PropertyMediaFloorPlan";
import styles from "./property-media.module.css";
import scene from "./property-media-scene.module.css";

type IntroState = "ready" | "playing" | "handoff" | "background" | "orbit" | "complete";

export function PropertyMediaExperience() {
  const [introState, setIntroState] = useState<IntroState>("ready");
  const [selectedItem, setSelectedItem] = useState<PropertyMediaPortfolioItem | null>(null);
  const phase = useRef<IntroState>("ready");
  const videoRef = useRef<HTMLVideoElement>(null);
  const entryRef = useRef<HTMLButtonElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const heroRef = useRef<HTMLHeadingElement>(null);
  const reduced = useRef(false);
  const timers = useRef<number[]>([]);
  const watchdog = useRef<number | undefined>(undefined);
  const volumeRamp = useRef<number | undefined>(undefined);
  const moveTo = useCallback((state: IntroState) => { phase.current = state; setIntroState(state); }, []);

  const finishIntro = useCallback(() => {
    if (phase.current !== "ready" && phase.current !== "playing") return;
    window.clearTimeout(watchdog.current);
    window.clearInterval(volumeRamp.current);
    videoRef.current?.pause();
    moveTo("handoff");
    const duration = reduced.current ? 220 : 1500;
    timers.current.push(
      window.setTimeout(() => moveTo("background"), duration * .2),
      window.setTimeout(() => moveTo("orbit"), duration * .58),
      window.setTimeout(() => moveTo("complete"), duration),
    );
  }, [moveTo]);

  const armWatchdog = useCallback(() => {
    if (phase.current !== "playing") return;
    window.clearTimeout(watchdog.current);
    watchdog.current = window.setTimeout(finishIntro, 12000);
  }, [finishIntro]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scheduledTimers = timers.current;
    const update = () => { reduced.current = query.matches; };
    update();
    query.addEventListener("change", update);
    entryRef.current?.focus();
    return () => {
      query.removeEventListener("change", update);
      scheduledTimers.forEach(window.clearTimeout);
      window.clearTimeout(watchdog.current);
      window.clearInterval(volumeRamp.current);
    };
  }, []);

  useEffect(() => {
    if (introState === "complete") { heroRef.current?.focus({ preventScroll: true }); return; }
    const previous = document.body.style.overflow;
    if (introState === "playing") skipRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [introState]);

  const startIntro = () => {
    if (phase.current !== "ready") return;
    const video = videoRef.current;
    if (!video) { finishIntro(); return; }
    moveTo("playing");
    video.muted = false;
    video.volume = .08;
    armWatchdog();
    // play() stays inside the genuine click gesture; never synthesize permission.
    void video.play().then(() => {
      if (phase.current !== "playing") { video.pause(); return; }
      let step = 0;
      volumeRamp.current = window.setInterval(() => {
        step += 1;
        video.volume = Math.min(.55, .08 + step * .047);
        if (step >= 10) window.clearInterval(volumeRamp.current);
      }, 90);
    }).catch(finishIntro);
  };
  const closeLightbox = useCallback(() => setSelectedItem(null), []);

  return (
    <div className={scene.page} data-phase={introState}>
      <div inert={introState !== "complete"}>
        <div className={scene.room}>
          <section className={scene.hero} aria-labelledby="property-media-title">
            <div className={scene.heroBackground} aria-hidden="true" />
            <div className={scene.copy}>
              <p>E.X PROPERTY MEDIA</p>
              <h1 ref={heroRef} tabIndex={-1} id="property-media-title">讓空間・被看見</h1>
              <span>房產影音服務</span>
            </div>
            <div className={scene.orbitLayer}><PropertyMediaOrbit onOpenMedia={setSelectedItem} /></div>
            <a className={scene.explore} href="#property-media-selected-works">查看作品 <span>Selected Works ↘</span></a>
          </section>
        </div>
        <div className={scene.obsidian}>
          <PropertyMediaFloorPlan />
          <div className={scene.surfaceLight} aria-hidden="true" />
          <div className={styles.content}>
            <PropertyMediaPortfolio onOpen={setSelectedItem} />
            <AIStagingShowcase onOpen={setSelectedItem} />
            <PropertyMediaServices />
          </div>
        </div>
      </div>
      <PropertyMediaLightbox item={selectedItem} onClose={closeLightbox} />
      {introState !== "complete" ? (
        <div className={scene.intro} role="dialog" aria-modal="true" aria-label="E.X Property Media 開場"
          onKeyDown={(event) => {
            if (event.key === "Escape") finishIntro();
            if (event.key === "Tab") {
              const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>("button");
              const first = buttons[0], last = buttons[buttons.length - 1];
              if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
              else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
            }
          }}>
          <video ref={videoRef} playsInline preload="none" src={propertyMediaVnextIntro}
            onTimeUpdate={armWatchdog} onEnded={finishIntro} onError={finishIntro} />
          <div className={scene.haze} aria-hidden="true" />
          {introState === "ready" ? <button ref={entryRef} type="button" className={scene.entry} onClick={startIntro}>
            <span>進入空間</span><small>Sound On</small>
          </button> : null}
          {(introState === "ready" || introState === "playing") ? <button ref={skipRef} type="button" className={scene.skip} onClick={finishIntro}>略過 <span>Skip</span></button> : null}
        </div>
      ) : null}
    </div>
  );
}
