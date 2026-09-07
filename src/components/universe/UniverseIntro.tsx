"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "@/app/universe-preview/universe-preview.module.css";

const seenKey = "ex-creator-universe-intro-seen";

export function UniverseIntro({ onComplete, onBridge }: { onComplete: () => void; onBridge: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [source, setSource] = useState<string>();
  const [mounted, setMounted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [skipReady, setSkipReady] = useState(false);
  const [simple, setSimple] = useState(false);
  const [audioStatus, setAudioStatus] = useState("pending");
  const finishRef = useRef<() => void>(() => {});
  const progressRef = useRef<() => void>(() => {});

  useEffect(() => {
    setMounted(true);
    let finished = false;
    let fade: ReturnType<typeof setTimeout>;
    let watchdog: ReturnType<typeof setTimeout>;
    const audio = new Audio();
    audio.preload = "none";
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(watchdog);
      audio?.pause();
      video.current?.pause(); // Keep the last decoded frame throughout the bridge.
      try { sessionStorage.setItem(seenKey, "true"); } catch { /* Storage is optional. */ }
      setLeaving(true);
      const useSimple = reduced.matches || !video.current || video.current.readyState < 2;
      setSimple(useSimple);
      if (!useSimple) onBridge();
      fade = setTimeout(onComplete, useSimple ? 240 : matchMedia("(max-width: 767px)").matches ? 650 : 850);
    };
    finishRef.current = finish;
    let seen = false;
    try { seen = sessionStorage.getItem(seenKey) === "true"; } catch { /* Continue without persistence. */ }
    if (reduced.matches || (seen && new URLSearchParams(location.search).get("intro") !== "1")) {
      onComplete();
      return;
    }
    setSource(matchMedia("(max-width: 767px)").matches
      ? "/video/ex-creator-universe-intro-phone.mp4"
      : "/video/ex-creator-universe-intro.mp4");
    audio.src = "/video/ex-creator-universe-mo.WAV";
    audio.volume = .35;
    // A single autoplay attempt. Never retry on unrelated clicks or bypass policy.
    void audio.play().then(() => { if (!finished) setAudioStatus("played"); })
      .catch(() => { if (!finished) setAudioStatus("blocked-safely"); });
    const skip = setTimeout(() => setSkipReady(true), 850);
    watchdog = setTimeout(finish, 8000);
    const progress = () => { clearTimeout(watchdog); watchdog = setTimeout(finish, 8000); };
    progressRef.current = progress;
    const limit = setTimeout(finish, 120000);
    const motionChange = () => { if (reduced.matches) finish(); };
    reduced.addEventListener("change", motionChange);
    return () => {
      finished = true;
      clearTimeout(fade); clearTimeout(watchdog); clearTimeout(skip); clearTimeout(limit);
      audio?.pause();
      progressRef.current = () => {};
      reduced.removeEventListener("change", motionChange);
    };
  }, [onComplete, onBridge]);

  useEffect(() => {
    if (source) void video.current?.play().catch(() => finishRef.current());
  }, [source]);

  if (!mounted) return null;
  return createPortal(<div className={styles.introOverlay} data-leaving={leaving} data-simple={simple} data-audio-status={audioStatus} role="dialog" aria-label="E.X Creator Universe 開場動畫" aria-modal="true">
    <video ref={video} src={source} autoPlay muted playsInline preload="auto" onTimeUpdate={() => progressRef.current()} onEnded={() => finishRef.current()} onError={() => finishRef.current()} />
    <div className={styles.opticalBloom} aria-hidden="true" />
    <button autoFocus className={styles.introSkip} data-ready={skipReady} onClick={() => finishRef.current()}>略過動畫 <small>Skip intro</small></button>
  </div>, document.body);
}
