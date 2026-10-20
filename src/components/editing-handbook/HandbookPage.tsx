"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { handbookIntroVideo, handbookTerms, resolveHandbookAuxiliaryMedia, resolveHandbookVideo, type HandbookVideoConfig } from "@/data/editing-handbook";
import { publicAssetPath } from "@/lib/paths";
import { HandbookBook } from "./HandbookBook";
import { TermIllustration } from "./TermIllustration";
import { HandbookIntroLink, HandbookIntroPlayer } from "./HandbookIntroPlayer";
import { PremiumPreview } from "./PremiumPreview";
import styles from "./editing-handbook.module.css";

type Theme = "light" | "dark" | "system";

export function HandbookVideo({ config = handbookIntroVideo }: { config?: HandbookVideoConfig }) {
  const state = resolveHandbookVideo(config);
  const poster = resolveHandbookAuxiliaryMedia(config.posterSrc, "image");

  return <section id="handbook-video" className={styles.section} aria-labelledby="handbook-video-title" data-handbook-video={state}>
    <div className={styles.sectionHeading}><div><p className={styles.kicker}>WATCH & UNDERSTAND</p><h2 id="handbook-video-title">{config.title}</h2></div><p>Yuni 介紹 · 約 24 秒</p></div>
    {state === "AVAILABLE" ? <HandbookIntroLink className={styles.videoTeaser} entry="handbook-video">
      <span className={styles.videoPoster}>{poster && <Image unoptimized src={publicAssetPath(poster)} width={540} height={960} loading="lazy" alt="Yuni 介紹剪輯術語的影片畫面" onError={event => { event.currentTarget.style.visibility = "hidden"; }} />}</span>
      <span className={styles.videoTeaserCopy}><span className={styles.kicker}>YUNI / A BETTER WAY TO DESCRIBE</span><strong>先說清楚，<br />AI 才更懂畫面。</strong><span>用更精準的術語，向 GPT、Claude<br />與 AI 影片工具說明創作想法。</span><b>播放 24 秒介紹 <span aria-hidden="true">↗</span></b><small>點擊後開啟有聲影片，可隨時開始閱讀。</small></span>
    </HandbookIntroLink> : <div className={styles.videoUnavailable}><h3>{state === "PENDING" ? "教學影片準備中" : "介紹影片暫時無法播放"}</h3><p>仍可從下方六個免費圖解開始。</p></div>}
  </section>;
}

export function HandbookPage() {
  const [theme, setTheme] = useState<Theme>("system");
  const [activeIndex, setActiveIndex] = useState(0);
  const [verticalIndex, setVerticalIndex] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const term = handbookTerms[activeIndex];

  useEffect(() => {
    try { const stored = localStorage.getItem("ex-handbook-theme"); if (["light", "dark", "system"].includes(stored ?? "")) setTheme(stored as Theme); } catch { /* Reading works without storage. */ }
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setVerticalIndex(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  function changeTheme(value: Theme) {
    setTheme(value);
    try { localStorage.setItem("ex-handbook-theme", value); } catch { /* Optional preference persistence. */ }
  }

  function moveTerm(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (["ArrowDown", "ArrowRight"].includes(event.key)) next = (index + 1) % handbookTerms.length;
    else if (["ArrowUp", "ArrowLeft"].includes(event.key)) next = (index - 1 + handbookTerms.length) % handbookTerms.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = handbookTerms.length - 1;
    else return;
    event.preventDefault();
    setActiveIndex(next);
    tabs.current[next]?.focus();
  }

  return <HandbookIntroPlayer><div className={styles.handbook} data-editing-handbook data-theme={theme}>
    <a href="#handbook-terms" className={styles.skip}>跳至術語圖解</a>
    <header className={styles.header}>
      <Link href="/ex-ai/" prefetch={false} className={styles.brand}><b>E.X</b><span>EDITING<br />HANDBOOK</span></Link>
      <nav aria-label="手冊導覽"><Link href="/ex-ai/editing/" prefetch={false}>返回剪輯學院 <span aria-hidden="true">↗</span></Link><Link href="/ex-ai/" prefetch={false}>返回 EX AI <span aria-hidden="true">↗</span></Link></nav>
      <div className={styles.themes} role="group" aria-label="手冊外觀">{(["light", "dark", "system"] as const).map(value => <button key={value} type="button" aria-label={({ light: "淺色模式", dark: "深色模式", system: "跟隨系統" })[value]} aria-pressed={theme === value} onClick={() => changeTheme(value)}>{({ light: "淺", dark: "深", system: "自動" })[value]}</button>)}</div>
    </header>

    <div className={styles.readingArea}>
      <section className={styles.handbookHero} aria-labelledby="handbook-heading">
        <div className={styles.heroCopy}><p className={styles.kicker}>EX AI · 教學資源 / VOL. 01</p><h1 id="handbook-heading">剪片說明書</h1><h2>看懂剪輯語言，<br />讓創作更簡單。</h2><p className={styles.heroDescription}>從常用剪輯術語開始，<br />用圖像與短影音，<br />學會與 AI 溝通你的創作想法。</p><a className={styles.primary} href="#handbook-terms">打開六個圖解 <span aria-hidden="true">↓</span></a><span className={styles.freeNote}>六個入門術語 · 公開閱讀</span></div>
        <div className={styles.heroBook}><HandbookBook priority sizes="(max-width: 639px) 320px, (max-width: 1023px) 440px, 560px" /><span className={styles.bookCaption}>THE LANGUAGE OF YOUR NEXT CUT</span></div>
      </section>

      <HandbookVideo />

      <section id="handbook-terms" className={styles.section} aria-labelledby="terms-heading">
        <div className={styles.sectionHeading}><div><p className={styles.kicker}>SIX TERMS / A CLEARER START</p><h2 id="terms-heading">先看懂，才更好剪。</h2></div><p>選一個詞，看一個例子。</p></div>
        <div className={styles.learningGrid}>
          <div className={styles.termIndex} role="tablist" aria-label="六個免費剪輯術語" aria-orientation={verticalIndex ? "vertical" : "horizontal"}>{handbookTerms.map((item, index) => <button key={item.id} ref={element => { tabs.current[index] = element; }} id={`handbook-tab-${item.id}`} type="button" role="tab" aria-selected={index === activeIndex} aria-controls="handbook-term-panel" tabIndex={index === activeIndex ? 0 : -1} onClick={() => setActiveIndex(index)} onKeyDown={event => moveTerm(event, index)}><span className={styles.termNumber}>{item.number}</span><span><strong>{item.title}</strong><small>{item.english}</small></span><span className={styles.termArrow} aria-hidden="true">↗</span></button>)}</div>
          <div id="handbook-term-panel" role="tabpanel" aria-labelledby={`handbook-tab-${term.id}`} tabIndex={0} className={styles.termPanel} data-active-term={term.id}>
            <div className={styles.termPanelHeading}><span className={styles.kicker}>{term.english}</span><span className={styles.pageNumber}>{term.number} / 06</span></div>
            <h3>{term.title}</h3>
            <div key={term.id} className={styles.diagram}><TermIllustration term={term.id} /><span className={styles.diagramCaption}>原創教學圖解 · 非剪輯軟體畫面</span></div>
            <div className={styles.termCopy} aria-live="polite" aria-atomic="true"><p className={styles.definition}>{term.definition}</p><div className={styles.example}><span>簡單例子</span><p>{term.example}</p></div><p className={styles.takeaway}>{term.takeaway}</p></div>
          </div>
        </div>
        <p className={styles.keyboardHint}>鍵盤可用方向鍵、Home 與 End 選擇術語。</p>
      </section>

      <PremiumPreview />

      <footer className={styles.footer}><div><p className={styles.kicker}>FROM WORDS TO YOUR FIRST CUT</p><h2>看懂了，就回到作品裡。</h2></div><Link href="/ex-ai/editing/" prefetch={false} className={styles.primary}>返回剪輯學院 <span aria-hidden="true">→</span></Link><Link href="/ex-ai/" prefetch={false} className={styles.backLink}>返回 EX AI ↗</Link></footer>
    </div>
  </div></HandbookIntroPlayer>;
}
