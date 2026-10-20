"use client";

import { useId, useRef } from "react";
import { handbookPremiumCards } from "@/data/editing-handbook";
import styles from "./editing-handbook.module.css";

function Lock() {
  return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><path d="M12 14v3" /></svg>;
}

export function PremiumPreview() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const title = useId();
  const description = useId();

  return <section id="premium-preview" className={styles.premiumCardsSection} aria-labelledby="premium-heading">
    <div className={styles.sectionHeading}><div><p className={styles.kicker}>THE NEXT CHAPTER / PREMIUM</p><h2 id="premium-heading">完整剪片說明書</h2></div><span className={styles.premiumStatus}>規劃中，尚未開放訂閱</span></div>
    <p className={styles.premiumSummary}>更多術語、鏡頭語言、AI 剪輯指令與分鏡工具，將逐步開放。</p>
    <div className={styles.premiumCardGrid}>{handbookPremiumCards.map(card => <button key={card.id} type="button" className={styles.premiumCard} data-premium-card={card.id} aria-haspopup="dialog" onClick={event => { trigger.current = event.currentTarget; dialog.current?.showModal(); }}>
      <span className={styles.premiumDecoration} aria-hidden="true"><i /><i /><i /><i /></span>
      <span className={styles.premiumBadge}><Lock /> PREMIUM <span>尚未開放</span></span>
      <strong>{card.title}</strong><span className={styles.premiumCardDescription}>{card.description}</span><span className={styles.premiumCardAction}>查看開放說明 <span aria-hidden="true">↗</span></span>
    </button>)}</div>
    <p className={styles.premiumNote}>未來手冊會員與剪輯學院的付費實作課程分別規劃；本頁提供入門內容與功能介紹。</p>
    <dialog ref={dialog} className={styles.premiumDialog} aria-labelledby={title} aria-describedby={description} data-premium-dialog
      onCancel={event => { event.preventDefault(); dialog.current?.close(); }}
      onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}
      onClose={() => { if (trigger.current?.isConnected) trigger.current.focus({ preventScroll: true }); }}>
      <div className={styles.premiumDialogContent}><span className={styles.premiumBadge}><Lock /> PREMIUM HANDBOOK</span><h2 id={title}>會員專屬內容</h2><div id={description}><p>更多剪輯術語、AI 指令與實戰教學<br />正在準備中。</p><p>未來登入並取得會員權限後，<br />即可解鎖完整內容。</p></div><span className={styles.premiumStatus}>會員功能準備中</span><button type="button" className={styles.primary} onClick={() => dialog.current?.close()}>關閉</button></div>
    </dialog>
  </section>;
}
