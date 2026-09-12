import Link from "next/link";
import Image from "next/image";
import { universeCore } from "@/data/universe-navigation";
import styles from "@/app/universe-preview/universe-preview.module.css";

export function UniverseCore({ focused = false }: { focused?: boolean }) {
  return (
    <div className={`${styles.core} ${focused ? styles.coreFocused : ""}`} data-testid="universe-core">
      <div className={styles.coreHalo} aria-hidden="true" />
      <div className={styles.coreLens} data-depth-layer="core-lens" aria-hidden="true" />
      <Link className={styles.coreLink} href={universeCore.href} aria-label="進入 E.X 創作中心 × 創作者學院">
        <Image className={styles.coreImage} src="/images/universe/core-v2.png" alt="" width={1254} height={1254} sizes="(max-width: 767px) 300px, 430px" priority unoptimized />
        <span className={styles.coreMark}>{universeCore.title}</span>
        <span className={styles.coreSubtitle}>{universeCore.subtitle}</span>
      </Link>
    </div>
  );
}
