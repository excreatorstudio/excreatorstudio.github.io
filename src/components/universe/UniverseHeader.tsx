import Link from "next/link";
import styles from "@/app/universe-preview/universe-preview.module.css";

export function UniverseHeader() {
  return <header className={styles.utilityHeader}>
    <Link href="/" className={styles.utilityBrand} aria-label="回到 E.X 主站">E.X <span>CREATOR UNIVERSE</span></Link>
    <nav className={styles.utilityDesktop} aria-label="宇宙全域導覽">
      <Link href="/universe-preview/" aria-current="page">宇宙入口</Link>
      <Link href="/about/">關於 E.X</Link>
    </nav>
    <details className={styles.utilityMobile}>
      <summary aria-label="開啟全域選單">選單</summary>
      <nav aria-label="手機全域導覽"><Link href="/universe-preview/" aria-current="page">宇宙入口</Link><Link href="/about/">關於 E.X</Link></nav>
    </details>
  </header>;
}
