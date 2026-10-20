import Link from "next/link";
import { HandbookBook } from "./HandbookBook";
import { HandbookIntroLink } from "./HandbookIntroPlayer";
import styles from "./editing-handbook.module.css";

type EntryVariant = "hero" | "resources" | "academy" | "directory";

export function HandbookEntry({ variant }: { variant: EntryVariant }) {
  const resource = variant === "resources" || variant === "directory";
  return <HandbookIntroLink entry={variant} className={`${styles.entry} ${styles[`${variant}Entry`]}`}>
    <HandbookBook priority={variant === "hero"} original={variant === "hero"} sizes={variant === "hero" ? "160px" : variant === "academy" ? "(max-width: 639px) 88px, 128px" : "(max-width: 639px) 256px, 360px"} />
    <span className={styles.entryCopy}>
      {resource && <span className={styles.kicker}>EDITING HANDBOOK / FREE PREVIEW</span>}
      {variant === "academy" && <strong>不懂剪輯術語？</strong>}
      {variant !== "academy" && <strong>剪片說明書</strong>}
      {resource && <><span className={styles.entryDescription}>看圖、看短影音，<br />快速理解常用剪輯術語。</span><span className={styles.termTeasers}>景別 · 運鏡 · 轉場<br />B-roll · 跳剪 · 時間軸</span></>}
      {variant === "academy" && <span className={styles.entryDescription}>打開剪片說明書，<br />快速理解常用剪輯語言。</span>}
      <span className={styles.entryAction}>{variant === "hero" ? "開啟 →" : resource ? "開啟剪片說明書 →" : "查看剪片說明書 →"}</span>
    </span>
  </HandbookIntroLink>;
}

export function TeachingResources() {
  return <section className={`glass ${styles.resourcesArea}`} aria-labelledby="teaching-resources-heading">
    <p className="eyebrow">TEACHING RESOURCES</p>
    <h2 id="teaching-resources-heading" className={styles.resourcesTitle}>教學資源</h2>
    <HandbookEntry variant="resources" />
    <div className={styles.legacyResources}>
      <h3>免費資源庫</h3><p>精選工具、模板與下載素材，將逐步開放。</p>
      <Link href="/resources" className={styles.legacyLink}>查看資源 →</Link>
    </div>
  </section>;
}
