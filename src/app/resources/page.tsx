import Link from "next/link";
import { HandbookEntry } from "@/components/editing-handbook/HandbookEntry";
import { HandbookIntroPlayer } from "@/components/editing-handbook/HandbookIntroPlayer";
import { HANDBOOK_HREF } from "@/data/editing-handbook";
import styles from "@/components/editing-handbook/editing-handbook.module.css";

export default function ResourcesPage() {
  return <HandbookIntroPlayer><div className={styles.directory}>
    <header><p className="eyebrow">LEARNING RESOURCES</p><h1>教學資源中心</h1><p className={styles.directoryDescription}>免費工具、模板、清單與下載素材的集中入口。</p></header>
    <HandbookEntry variant="directory" />
    <div className={styles.directoryLinks}><p>先看 Yuni 的 24 秒介紹，或直接從六個免費術語開始。</p><Link href={HANDBOOK_HREF} prefetch={false}>直接閱讀剪片說明書 →</Link><Link href="/ex-ai/editing/" prefetch={false}>前往剪輯學院 ↗</Link></div>
    <section className={`glass ${styles.directoryExisting}`} aria-labelledby="existing-resources-heading"><p className="eyebrow">FREE TOOLS & DOWNLOADS</p><h2 id="existing-resources-heading">內容準備中</h2><p>此分類的首批教學與資源正在整理，敬請期待。</p></section>
  </div></HandbookIntroPlayer>;
}
