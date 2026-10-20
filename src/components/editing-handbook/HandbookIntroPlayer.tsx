"use client";

import Link from "next/link";
import Image from "next/image";
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { HANDBOOK_HREF, handbookIntroVideo, resolveHandbookVideo, resolveHandbookAuxiliaryMedia } from "@/data/editing-handbook";
import { attemptHandbookPlayback, isPlainHandbookActivation, type IntroPlaybackState } from "@/lib/handbook-intro";
import { publicAssetPath } from "@/lib/paths";
import { HandbookPlaybackFeedback } from "./HandbookPlaybackFeedback";
import styles from "./handbook-intro.module.css";

const IntroContext = createContext<((trigger: HTMLElement) => void) | null>(null);

export function HandbookIntroLink({ children, className, entry }: { children: ReactNode; className?: string; entry?: string }) {
  const openIntro = useContext(IntroContext);
  function open(event: MouseEvent<HTMLAnchorElement>) {
    if (!openIntro || !isPlainHandbookActivation(event, event.currentTarget.getAttribute("target"), event.currentTarget.hasAttribute("download"))) return;
    event.preventDefault();
    openIntro(event.currentTarget);
  }
  return <Link href={HANDBOOK_HREF} prefetch={false} className={className} data-handbook-entry={entry} data-intro-trigger onClick={open} aria-haspopup="dialog">{children}</Link>;
}

export function HandbookIntroPlayer({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const attempt = useRef(0);
  const [state, setState] = useState<IntroPlaybackState>("idle");
  const titleId = useId();
  const descriptionId = useId();
  const ready = resolveHandbookVideo(handbookIntroVideo) === "AVAILABLE";
  const poster = resolveHandbookAuxiliaryMedia(handbookIntroVideo.posterSrc, "image");

  const play = useCallback(() => {
    const element = video.current;
    if (!element || !dialog.current?.open) return;
    const ticket = ++attempt.current;
    element.muted = false;
    element.volume = 1;
    setState("starting");
    attemptHandbookPlayback(element, () => {
      if (ticket === attempt.current && dialog.current?.open) setState(element.error ? "error" : "blocked");
    });
  }, []);

  const open = useCallback((element: HTMLElement) => {
    if (!dialog.current) return;
    trigger.current = element;
    if (!dialog.current.open) dialog.current.showModal();
    if (!ready) { setState("error"); return; }
    if (video.current) video.current.currentTime = 0;
    play(); // Same user gesture; no effect/navigation/async wait before play().
  }, [play, ready]);

  function close() {
    ++attempt.current;
    video.current?.pause();
    dialog.current?.close();
  }

  useEffect(() => {
    const element = video.current;
    return () => { element?.pause(); };
  }, []);

  return <IntroContext.Provider value={open}>{children}
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId} aria-describedby={descriptionId} data-handbook-intro data-playback={state}
      onCancel={event => { event.preventDefault(); close(); }}
      onClick={event => { if (event.target === event.currentTarget) close(); }}
      onClose={() => { ++attempt.current; video.current?.pause(); setState("idle"); if (trigger.current?.isConnected) trigger.current.focus({ preventScroll: true }); }}>
      <div className={styles.content}>
        <header className={styles.heading}><div><p>EX AI · HANDBOOK INTRO</p><h2 id={titleId}>先看 24 秒，再打開創作。</h2></div><button type="button" className={styles.close} onClick={close} aria-label="關閉介紹影片">✕</button></header>
        <p id={descriptionId} className={styles.description}>Yuni 帶路，學會用剪輯術語說清楚畫面。</p>
        <div className={styles.portrait}>
          {ready ? <video ref={video} src={publicAssetPath(handbookIntroVideo.videoSrc!)} poster={poster ? publicAssetPath(poster) : undefined} width="1080" height="1920" controls playsInline preload="none" aria-label="Yuni 剪片說明書介紹影片，約 24 秒"
            onPlaying={() => { if (dialog.current?.open) setState("playing"); }}
            onPause={() => { if (dialog.current?.open) setState(current => current === "ended" || current === "error" ? current : "paused"); }}
            onEnded={() => setState("ended")} onError={() => setState("error")} /> : null}
          {state === "ended" && poster && <Image unoptimized className={styles.endPoster} src={publicAssetPath(poster)} width={540} height={960} alt="" />}
          {state === "error" && <div className={styles.mediaError}><strong>影片暫時無法播放</strong><p>仍可直接閱讀六個免費術語。</p></div>}
        </div>
        <HandbookPlaybackFeedback state={state} onPlay={play} className={styles.feedback} buttonClassName={styles.playPrompt} />
        <footer className={styles.actions}>
          <div className={styles.playActions}>
            {state !== "error" && <button type="button" onClick={() => { if (state === "playing") { ++attempt.current; video.current?.pause(); } else play(); }}>{state === "playing" ? "暫停" : "播放"}</button>}
            {state !== "error" && <button type="button" onClick={() => { if (video.current) video.current.currentTime = 0; play(); }}>重新觀看</button>}
          </div>
          <Link href={HANDBOOK_HREF} prefetch={false} className={styles.read} onClick={close}>開始閱讀剪片說明書 →</Link>
        </footer>
      </div>
    </dialog>
  </IntroContext.Provider>;
}
