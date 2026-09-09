"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent, PointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { UniverseIntro } from "./UniverseIntro";
import { universeGalaxies, type UniverseGalaxy } from "@/data/universe-navigation";
import { GalaxyNode } from "@/components/universe/GalaxyNode";
import { UniverseCore } from "@/components/universe/UniverseCore";
import { UniverseOrbit } from "@/components/universe/UniverseOrbit";
import { UniversePointerField } from "@/components/universe/UniversePointerField";
import { PropertyMediaEntry } from "@/components/PropertyMediaEntry";
import styles from "@/app/universe-preview/universe-preview.module.css";
import { useUniverseMotion } from "./useUniverseMotion";

export function UniversePreview({ showPropertyMediaEntry = false }: { showPropertyMediaEntry?: boolean }) {
  const router = useRouter();
  const [introActive, setIntroActive] = useState(true);
  const { sceneRef, activeGalaxy, motionMode, focusGalaxy, gyroActive, sensorPrompt, enableGyro } = useUniverseMotion(!introActive);
  const navigationTimer = useRef<number | null>(null);
  const touchSelection = useRef<{ id: UniverseGalaxy["id"]; alreadyFocused: boolean } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [ambientReady, setAmbientReady] = useState(false);
  const [bridging, setBridging] = useState(false);
  const beginBridge = useCallback(() => setBridging(true), []);
  const completeIntro = useCallback(() => setIntroActive(false), []);

  useEffect(() => {
    if (introActive) return;
    const timer = window.setTimeout(() => setAmbientReady(true), 450);
    return () => window.clearTimeout(timer);
  }, [introActive]);

  useEffect(() => {
    return () => {
      if (navigationTimer.current !== null) window.clearTimeout(navigationTimer.current);
    };
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLAnchorElement>, id: UniverseGalaxy["id"]) => {
    touchSelection.current = event.pointerType === "touch" ? { id, alreadyFocused: activeGalaxy === id } : null;
    if (event.pointerType === "touch") focusGalaxy(id);
  };

  const enterGalaxy = (event: MouseEvent<HTMLAnchorElement>, galaxy: UniverseGalaxy) => {
    if (galaxy.status !== "available" || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (galaxy.href.startsWith("#")) { focusGalaxy(galaxy.id); return; }
    const touch = touchSelection.current;
    touchSelection.current = null;
    // First tap awakens the world; the next tap follows its real semantic link.
    // Keyboard activation (detail=0) never requires a second activation.
    if (event.detail !== 0 && touch?.id === galaxy.id && !touch.alreadyFocused) {
      focusGalaxy(galaxy.id);
      return;
    }
    if (navigationTimer.current !== null) window.clearTimeout(navigationTimer.current);
    focusGalaxy(galaxy.id);
    setIsTransitioning(true);
    navigationTimer.current = window.setTimeout(() => router.push(galaxy.href), motionMode === "reduced" ? 0 : 320);
  };

  return (
    <div className={`${styles.page} ${isTransitioning ? styles.pageTransitioning : ""}`} data-motion-mode={motionMode} data-runtime-tier={motionMode === "full" ? "DESKTOP_FULL" : motionMode === "mobile-safe" ? (gyroActive ? "MOBILE_GYRO" : "MOBILE_TOUCH") : motionMode === "low-gpu" ? "LOW_GPU" : "REDUCED_MOTION"} data-ambient-ready={ambientReady} data-intro-active={introActive} data-bridging={bridging && introActive}>
      {introActive ? <UniverseIntro onComplete={completeIntro} onBridge={beginBridge} /> : null}
      <div className={styles.atmosphere} aria-hidden="true">
        <span className={styles.atmosphereNebulaOne} />
        <span className={styles.atmosphereNebulaTwo} />
        <span className={styles.atmosphereStarField} />
      </div>

      <section className={styles.hero} aria-labelledby="universe-title" inert={introActive}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>WORLDS WITHIN REACH</p>
          <h1 id="universe-title"><span>E.X</span> CREATOR UNIVERSE</h1>
          <p className={styles.valueProposition}>創作、學習、語言與洞察，<br />匯聚成你的 AI 工作宇宙。</p>
          <p className={styles.valueEnglish}>Create · Learn · Connect · Discover</p>
          <button type="button" className={styles.exploreButton} data-primary-cta="true" onClick={() => {
            focusGalaxy("knowledge");
            sceneRef.current?.querySelector<HTMLAnchorElement>('[data-galaxy-main="knowledge"]')?.focus({ preventScroll: true });
            if (window.matchMedia("(max-width: 767px)").matches) sceneRef.current?.querySelector('[data-galaxy="knowledge"]')?.scrollIntoView({ block: "center", behavior: motionMode === "reduced" ? "instant" : "smooth" });
          }}>開始探索 <small>Start Exploring</small></button>
          {sensorPrompt ? <button type="button" className={styles.spatialEnable} onClick={enableGyro}>啟用 3D 空間感 <small>3D Spatial</small></button> : null}
        </div>

        <UniversePointerField sceneRef={sceneRef}>
          <div className={styles.sceneWorld} data-active-galaxy={activeGalaxy ?? "none"}>
            <div className={styles.depthFar} data-depth-layer="deep" aria-hidden="true" />
            <div className={styles.galacticMist} data-depth-layer="galactic-mist" aria-hidden="true" />
            <div className={styles.farGalaxies} data-depth-layer="far-galaxies" aria-hidden="true" />
            <div className={styles.depthBack} data-depth-layer="back" aria-hidden="true" />
            <div className={styles.distantStreak} aria-hidden="true" />
            <div className={`${styles.distantStreak} ${styles.streakSecond}`} aria-hidden="true" />
            <div className={`${styles.distantStreak} ${styles.streakThird}`} aria-hidden="true" />
            <div className={styles.mobileFlow} aria-hidden="true" />
            <div className={styles.twinkles} aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            <div className={styles.focusField} data-depth-layer="light" aria-hidden="true" />
            <div className={styles.localOrbit} data-depth-layer="local-orbit" aria-hidden="true" />
            <div className={styles.depthFront} data-depth-layer="front" aria-hidden="true" />
            <UniverseOrbit />
            <UniverseCore focused={activeGalaxy === null} />
            <div className={styles.galaxyLayer}>
              {universeGalaxies.map((galaxy) => (
                <GalaxyNode
                  key={galaxy.id}
                  galaxy={galaxy}
                  active={activeGalaxy === galaxy.id}
                  dimmed={activeGalaxy !== null && activeGalaxy !== galaxy.id}
                  onFocusGalaxy={focusGalaxy}
                  onEnterGalaxy={enterGalaxy}
                  onPointerDown={handlePointerDown}
                />
              ))}
            </div>
          </div>
        </UniversePointerField>

        <div className={styles.lowerBand}>
          <span className={styles.touchHint}>點選聚焦，再次點選進入</span>
          <details className={styles.destinationDirectory}>
            <summary>目的地索引</summary>
            <nav className={styles.textNav} aria-label="宇宙目的地文字導覽">
              {universeGalaxies.map((galaxy) => <Link href={galaxy.href} key={galaxy.id}>{galaxy.title}</Link>)}
            </nav>
          </details>
          <Link className={styles.homeLink} href="/">回到 E.X 主站 <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
      {showPropertyMediaEntry && !introActive ? <div className={styles.productionSecondaryEntry}><PropertyMediaEntry /></div> : null}
    </div>
  );
}
