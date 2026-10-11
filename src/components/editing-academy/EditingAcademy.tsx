"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { editingAssets, editingCourses, editingFaq, editingPortfolio, editingStarterLesson, getEditingLessonVideoPresentation, isApprovedEditingLessonStill, isLocalEditingMediaPath, type EditingCourse, type EditingLesson, type EditingLessonStep } from "@/data/editing-academy";
import { publicAssetPath } from "@/lib/paths";
import styles from "./editing-academy.module.css";

type Theme = "system" | "light" | "dark";

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true">{diagonal ? "↗" : "→"}</span>;
}

/** Deliberate UI artwork, not a playable video or a real portfolio sample. */
export function EditingArtwork({ variant, compact = false }: { variant: EditingCourse["thumbnail"]; compact?: boolean }) {
  return <div className={`${styles.artwork} ${styles[variant]} ${compact ? styles.compact : ""}`} role="img" aria-label={({ timeline: "剪接片段與時間軸示意", sound: "字幕與聲音波形示意", property: "房屋空間分鏡示意", color: "剪輯與調色流程示意", ai: "AI 首尾幀連接示意" })[variant]} data-asset-status="MOCK_ONLY">
    <div className={styles.artTop} aria-hidden="true"><span>{({ timeline: "THE FIRST CUT", sound: "FIND THE RHYTHM", property: "SPACE & STORY", color: "COLOR & CRAFT", ai: "FRAME TO FILM" })[variant]}</span><span>EX / EDIT</span></div>
    <div className={styles.artScene} aria-hidden="true"><i /><i /><i /><b /><span>{variant === "sound" ? "讓故事，有自己的節奏。" : ""}</span></div>
    <div className={styles.artTracks} aria-hidden="true"><i /><i /><i /><b /></div>
    <span className={styles.artLabel}>構圖示意</span>
  </div>;
}

export function EditingCourseCard({ course, onOpen }: { course: EditingCourse; onOpen: (course: EditingCourse, trigger: HTMLButtonElement) => void }) {
  return <article className={styles.courseCard} data-course-id={course.id}>
    <EditingArtwork variant={course.thumbnail} />
    <div className={styles.cardBody}>
      <div className={styles.meta}><span>{course.id} / {course.software ?? (course.category === "free" ? "FREE LESSON" : "AI WORKFLOW")}</span><span>{course.difficulty}</span></div>
      <h3>{course.title}</h3><p>{course.description}</p>
      <div className={styles.cardBottom}><span className={styles.status}>COMING SOON</span><button type="button" onClick={event => onOpen(course, event.currentTarget)} aria-label={`查看${course.title}課綱`}>課綱預覽 <Arrow /></button></div>
    </div>
  </article>;
}

function LessonStepIcon({ icon }: { icon: EditingLessonStep["icon"] }) {
  if (icon === "media") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" /></svg>;
  if (icon === "trim") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="m8.1 8.1 12.4 12.4M8.1 15.9 15 9m3-3 2-2" /></svg>;
  if (icon === "captions") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M7 10h4m-4 4h3m4-4h3m-3 4h4" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l11-2v13M9 8l11-2" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /><path d="M12 20h9" /></svg>;
}

export function EditingLessonSection({ lesson = editingStarterLesson }: { lesson?: EditingLesson }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);
  const [failedStills, setFailedStills] = useState<string[]>([]);
  const stepButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const activeStep = lesson.steps[activeIndex] ?? lesson.steps[0];
  const mediaState = videoFailed ? "FALLBACK" : getEditingLessonVideoPresentation(lesson);

  useEffect(() => {
    setActiveIndex(0);
    setVideoFailed(false);
    setFailedStills([]);
  }, [lesson.lessonId, lesson.videoSrc]);

  if (!activeStep) return null;

  function selectStep(index: number) {
    setActiveIndex(index);
  }

  function moveStepFocus(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const lastIndex = lesson.steps.length - 1;
    let nextIndex = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % lesson.steps.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + lesson.steps.length) % lesson.steps.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = lastIndex;
    else return;
    event.preventDefault();
    selectStep(nextIndex);
    stepButtons.current[nextIndex]?.focus();
  }

  const hasApprovedStill = isApprovedEditingLessonStill(activeStep) && !failedStills.includes(activeStep.imageSrc!);
  const pendingLabel = mediaState === "PENDING" ? "VIDEO_PENDING" : "VIDEO_UNAVAILABLE";
  const videoFallbackTitle = mediaState === "PENDING" ? "教學影片準備中" : "教學影片暫時無法播放";

  return <section id="learning-steps" className={`${styles.section} ${styles.lessonSection}`} aria-labelledby="lesson-heading" data-lesson-id={lesson.lessonId} data-video-state={mediaState}>
    <div className={styles.lessonHeading}><div><p className={styles.eyebrow}>學習步驟 <span aria-hidden="true">·</span> FIRST EDIT</p><h2 id="lesson-heading">{lesson.title}</h2></div><p>從素材到作品，跟著四個步驟慢慢完成。</p></div>
    <div className={styles.lessonGrid}>
      <div className={styles.lessonMedia}>
        {mediaState === "AVAILABLE" && isLocalEditingMediaPath(lesson.videoSrc) ? <video className={styles.lessonVideo} controls playsInline preload="metadata" width="1280" height="720" aria-label={`${lesson.title}教學影片`} poster={isLocalEditingMediaPath(lesson.posterSrc) ? publicAssetPath(lesson.posterSrc) : undefined} src={publicAssetPath(lesson.videoSrc)} onError={() => setVideoFailed(true)} /> : <>
          <div className={styles.lessonAmbient} aria-hidden="true">
            <span className={styles.lessonGlow} />
            <div className={styles.lessonFrameArt}><span className={styles.lessonFrameNumber}>{activeStep.number}</span><span className={styles.lessonFrameIcon}><LessonStepIcon icon={activeStep.icon} /></span><div className={styles.lessonFrameLines}><i /><i /><i /></div></div>
          </div>
          {hasApprovedStill && isLocalEditingMediaPath(activeStep.imageSrc) ? <figure className={styles.lessonStill}>
            <Image unoptimized src={publicAssetPath(activeStep.imageSrc)} alt={activeStep.imageAlt!} width={1280} height={720} loading="lazy" onError={() => setFailedStills(current => [...current, activeStep.imageSrc!])} />
            <figcaption>核准教學截圖 · 步驟 {activeStep.number}</figcaption>
          </figure> : null}
          <div className={styles.lessonPending}>
            <span className={styles.lessonVideoStatus}>{pendingLabel}</span>
            <h3>{videoFallbackTitle}</h3>
            <p>{mediaState === "PENDING" ? lesson.description : "目前沒有可播放的本機影片素材，課程說明與步驟仍可正常使用。"}</p>
            <span className={styles.lessonNoPlayer}>{mediaState === "PENDING" ? "影片尚未上架 · 此區沒有播放功能" : "媒體備援畫面 · 不會載入未核准內容"}</span>
          </div>
          <div className={styles.lessonFocus} aria-hidden="true"><span>STEP {activeStep.number} / 04</span><strong>{activeStep.title}</strong></div>
          {!hasApprovedStill && <span className={styles.lessonDisclosure}>步驟構圖示意 · 非剪輯軟體畫面</span>}
        </>}
      </div>

      <div className={styles.lessonStepsPanel}>
        <div className={styles.lessonStepsHeading}><span className={styles.eyebrow}>THE FIRST EDIT</span><span>4 STEPS</span></div>
        <div className={styles.lessonStepList} role="group" aria-label="選擇學習步驟">
          {lesson.steps.map((step, index) => <button key={step.number} ref={element => { stepButtons.current[index] = element; }} className={styles.lessonStepButton} type="button" aria-label={`步驟 ${step.number}：${step.title}`} aria-pressed={activeIndex === index} aria-current={activeIndex === index ? "step" : undefined} aria-describedby={activeIndex === index ? "lesson-step-instruction" : undefined} onClick={() => selectStep(index)} onKeyDown={event => moveStepFocus(event, index)}>
            <span className={styles.lessonStepNumber}>{step.number}</span><span className={styles.lessonStepIcon}><LessonStepIcon icon={step.icon} /></span><span className={styles.lessonStepTitle}>{step.title}</span><span className={styles.lessonStepArrow} aria-hidden="true">↗</span>
          </button>)}
        </div>
        <div id="lesson-step-instruction" className={styles.lessonInstruction} aria-live="polite" aria-atomic="true">
          <span>STEP {activeStep.number} / 04</span>
          <h3>{activeStep.title}</h3>
          <p>{activeStep.instruction}</p>
        </div>
        <p className={styles.lessonKeyboardHint}>可用方向鍵切換步驟</p>
      </div>
    </div>
    <div className={styles.lessonOutcome} aria-labelledby="lesson-outcome-heading">
      <div className={styles.lessonOutcomeHeading}><p className={styles.eyebrow}>WHAT YOU WILL LEARN</p><h3 id="lesson-outcome-heading">完成這堂課，你將學會</h3></div>
      <ul>{[["整理素材", "media"], ["剪輯影片", "trim"], ["加入字幕", "captions"], ["搭配音樂", "export"], ["輸出作品", "export"]].map(([label, icon]) => <li key={label}><span><LessonStepIcon icon={icon as EditingLessonStep["icon"]} /></span>{label}</li>)}</ul>
    </div>
  </section>;
}

export function EditingAcademy() {
  const [theme, setTheme] = useState<Theme>("system");
  const [heroFailed, setHeroFailed] = useState(false);
  const [selected, setSelected] = useState<EditingCourse | null>(null);
  const heroImage = useRef<HTMLImageElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const inquiry = useRef<HTMLDivElement>(null);
  const moveToInquiry = useRef(false);

  useEffect(() => {
    // A static image may fail before hydration installs its React error handler.
    if (heroImage.current?.complete && heroImage.current.naturalWidth === 0) setHeroFailed(true);
    try {
      const stored = localStorage.getItem("ex-editing-theme");
      if (stored === "light" || stored === "dark" || stored === "system") setTheme(stored);
    } catch { /* Theme remains usable when storage is unavailable. */ }
  }, []);

  useEffect(() => {
    if (!selected) return;
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [selected]);

  function changeTheme(next: Theme) {
    setTheme(next);
    try { localStorage.setItem("ex-editing-theme", next); } catch { /* No persistence is required to browse. */ }
  }
  function openCourse(course: EditingCourse, opener: HTMLButtonElement) {
    trigger.current = opener;
    setSelected(course);
  }
  function closeCourse() {
    dialog.current?.close();
    onClose();
  }
  function onClose() {
    setSelected(null);
    if (moveToInquiry.current) {
      moveToInquiry.current = false;
      inquiry.current?.focus();
      inquiry.current?.scrollIntoView({ block: "center" });
    } else trigger.current?.focus();
  }

  return <div className={styles.academy} data-editing-academy data-theme={theme}>
    <a className={styles.skip} href="#editing-content">跳至課程內容</a>
    <header className={styles.header}>
      <Link href="/ex-ai/" prefetch={false} className={styles.brand} aria-label="返回 EX AI"><b>E.X</b><span>EDITING<br />ACADEMY</span></Link>
      <nav aria-label="剪輯學院導覽"><a href="#free-lessons">免費教學</a><a href="#paid-courses">進階課程</a><a href="#portfolio">作品方向</a><a href="#coaching">教學指導</a></nav>
      <div className={styles.themes} role="group" aria-label="頁面外觀">
        {(["light", "dark", "system"] as const).map(value => <button key={value} type="button" aria-label={({ light: "淺色模式", dark: "深色模式", system: "跟隨系統" })[value]} aria-pressed={theme === value} onClick={() => changeTheme(value)}>{({ light: "淺", dark: "深", system: "自動" })[value]}</button>)}
      </div>
    </header>

    <section className={styles.hero} aria-labelledby="editing-heading">
      <div className={styles.heroMedia} data-media-fallback={heroFailed}>
        {!heroFailed && <picture>
          <source media="(max-width: 767px)" srcSet={publicAssetPath(editingAssets[1].src)} />
          {/* Optimized local static derivatives: no image service or external request. */}
          <img ref={heroImage} src={publicAssetPath(editingAssets[0].src)} srcSet={`${publicAssetPath(editingAssets[1].src)} 800w, ${publicAssetPath(editingAssets[0].src)} 1600w`} sizes="100vw" width="1600" height="900" alt={editingAssets[0].alt} loading="eager" fetchPriority="high" onError={() => setHeroFailed(true)} />
        </picture>}
        {heroFailed && <span className={styles.fallbackLabel}>EDITING STUDIO / 工作室影像暫時無法載入</span>}
      </div>
      <div className={styles.heroVeil} aria-hidden="true" />
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}><span /> E.X CREATOR STUDIO · 剪輯學院</p>
        <h1 id="editing-heading">從零剪出<br />第一支<span>代表作。</span></h1>
        <p className={styles.heroSubtitle}>剪輯技巧 × 實戰作品 × AI 影像製作</p>
        <div className={styles.heroActions}><a className={styles.primary} href="#free-lessons">免費開始學習 <Arrow /></a><a className={styles.secondary} href="#paid-courses">探索付費課程 <Arrow diagonal /></a></div>
        <p className={styles.heroNote}>從一個鏡頭開始，把想法剪成故事。</p>
      </div>
      <div className={styles.heroCaption}><span>THE ART OF THE EDIT</span><span>工作室視覺示意 · 非實拍教室</span></div>
      <div className={styles.heroRail} aria-hidden="true"><span>01 — 看見故事</span><i /><span>02 — 掌握節奏</span><i /><span>03 — 完成作品</span></div>
    </section>

    <div id="editing-content" className={styles.content}>
      <EditingLessonSection />

      <section id="free-lessons" className={styles.section} aria-labelledby="free-heading">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>01 / START CREATING</p><h2 id="free-heading">第一刀，從這裡開始。</h2></div><p>三個免費單元，建立剪輯的第一步。<br /><span>影片準備中 · 可先查看學習目標與課綱</span></p></div>
        <div className={styles.courseGrid}>{editingCourses.filter(course => course.category === "free").map(course => <EditingCourseCard key={course.id} course={course} onOpen={openCourse} />)}</div>
      </section>

      <section id="paid-courses" className={styles.section} aria-labelledby="paid-heading">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>02 / GO BEYOND THE BASICS</p><h2 id="paid-heading">不只會剪，更能完成作品。</h2></div><p>從短影音到商業交付，選擇適合的進階方向。<br /><span>付費課程規劃中 · 尚未開放報名</span></p></div>
        <div className={`${styles.courseGrid} ${styles.paidGrid}`}>{editingCourses.filter(course => course.category === "paid").map(course => <EditingCourseCard key={course.id} course={course} onOpen={openCourse} />)}</div>
        <a className={styles.textLink} href="#inquiry">查看開課與詢問狀態 <Arrow /></a>
      </section>

      <section id="portfolio" className={`${styles.section} ${styles.portfolio}`} aria-labelledby="portfolio-heading">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>03 / MADE TO BE SEEN</p><h2 id="portfolio-heading">讓作品，說下一句話。</h2></div><p>四種作品方向，從剪輯練習走向實際應用。<br /><span>全區為構圖示意 · 非學員作品</span></p></div>
        <div className={styles.portfolioGrid}>{editingPortfolio.map((work, index) => <article key={work.id} className={styles.portfolioItem}>
          <EditingArtwork variant={work.artwork} compact />
          <div className={styles.portfolioCopy}><span className={styles.workNumber}>0{index + 1}</span><div><p>{work.subtitle}</p><h3>{work.title}</h3></div><span className={styles.workStatus}>案例待補</span></div>
          <details><summary>素材狀態與預計內容 <span aria-hidden="true">+</span></summary><p>{work.description}</p></details>
        </article>)}</div>
      </section>

      <section id="coaching" className={`${styles.section} ${styles.coaching}`} aria-labelledby="coaching-heading">
        <div className={styles.coachingIntro}><p className={styles.eyebrow}>04 / CREATE WITH GUIDANCE</p><h2 id="coaching-heading">卡住的地方，<br />一起剪開。</h2><p>從正在做的作品出發，<br />把方法變成下一次能獨立完成的能力。</p><a className={styles.primary} href="#inquiry">了解教學詢問方式 <Arrow /></a></div>
        <div className={styles.coachingOptions}><article><span className={styles.coachingMark} aria-hidden="true">1 : 1</span><div><h3>一對一剪輯指導</h3><p>適合有明確作品目標、需要個別回饋的學習者。</p><dl><dt>規劃形式</dt><dd>個別作品檢視與實作指導</dd><dt>預計產出</dt><dd>作品修整方向與下一步練習清單</dd></dl></div></article><article><span className={styles.coachingMark} aria-hidden="true">＋</span><div><h3>小班實作教學</h3><p>適合想透過共同練習，建立剪輯流程的學習者。</p><dl><dt>規劃形式</dt><dd>主題示範、分段實作與回饋</dd><dt>預計產出</dt><dd>一段完整的主題練習作品</dd></dl></div></article></div>
      </section>

      <div id="inquiry" className={styles.inquiry} ref={inquiry} tabIndex={-1}>
        <span className={styles.status}>INQUIRY · PENDING</span><h3>詢問管道準備中</h3><p>正式聯絡方式、開課日期與費用尚未核准。目前不接受報名、付款或預約，也不收集個人資料。</p><a className={styles.textLink} href="#paid-courses">先比較課程方向 <Arrow /></a>
      </div>

      <section id="faq" className={`${styles.section} ${styles.faq}`} aria-labelledby="faq-heading">
        <div><p className={styles.eyebrow}>05 / A FEW THINGS TO KNOW</p><h2 id="faq-heading">開始之前，<br />可能想知道。</h2></div>
        <div>{editingFaq.map((item, index) => <details key={item.question}><summary><span className={styles.faqNumber}>0{index + 1}</span>{item.question}<span className={styles.plus} aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div>
      </section>
    </div>

    <footer className={styles.footer}><div><b>E.X</b><span>EDITING ACADEMY<br /><small>從想法，到代表作。</small></span></div><nav aria-label="頁尾導覽"><Link href="/ex-ai/" prefetch={false}>返回 EX AI <Arrow diagonal /></Link><a href="#free-lessons">免費教學</a><a href="#faq">常見問題</a></nav><p>E.X Creator Studio · 課程內容與正式案例準備中</p></footer>

    <dialog className={styles.dialog} ref={dialog} aria-labelledby="course-dialog-title" onCancel={event => { event.preventDefault(); closeCourse(); }} onClick={event => { if (event.target === event.currentTarget) closeCourse(); }} onKeyDown={event => {
      if (event.key !== "Tab") return;
      const controls = event.currentTarget.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]");
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}>
      {selected && <div className={styles.dialogContent}>
        <button className={styles.close} type="button" onClick={closeCourse} aria-label="關閉課程預覽" autoFocus>✕</button>
        <p className={styles.eyebrow}>{selected.id} / {selected.software ?? "EDITING ACADEMY"}</p><span className={styles.status}>COMING SOON</span>
        <h2 id="course-dialog-title">{selected.title}</h2><p>{selected.description}</p>
        <h3>預計學習成果</h3><ul>{selected.learningOutcomes.map(outcome => <li key={outcome}>{outcome}</li>)}</ul>
        <h3>課綱預覽</h3><ol>{selected.syllabus.map(chapter => <li key={chapter}>{chapter}</li>)}</ol>
        <dl><dt>適合對象</dt><dd>{selected.audience}</dd><dt>教學形式</dt><dd>{selected.deliveryMode}</dd></dl>
        <p className={styles.dialogNotice}>{selected.category === "free" ? "影片尚未上架，無可播放預覽；課程時長待核定。" : "尚未開放報名。價格、日期與詢問管道待確認。"}</p>
        {selected.category === "paid" && <button className={styles.primary} type="button" onClick={() => { moveToInquiry.current = true; closeCourse(); }}>查看詢問狀態 <Arrow /></button>}
        <button className={styles.secondary} type="button" onClick={closeCourse}>返回課程列表 <Arrow /></button>
      </div>}
    </dialog>
  </div>;
}
