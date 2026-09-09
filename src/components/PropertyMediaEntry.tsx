import Link from "next/link";
import styles from "./PropertyMediaEntry.module.css";

export function PropertyMediaEntry() {
  return (
    <section className={styles.entrySection} aria-labelledby="property-media-entry-title">
      <Link href="/property-media/" className={styles.entry}>
        <span className={styles.orb} aria-hidden="true"><i /><i /><i /></span>
        <span className={styles.copy}>
          <span className={styles.eyebrow}>EXPERIMENTAL / COMPANY SHOWCASE</span>
          <strong id="property-media-entry-title">房產影音服務</strong>
          <span className={styles.english}>E.X Property Media</span>
        </span>
        <span className={styles.arrow} aria-hidden="true">↗</span>
      </Link>
    </section>
  );
}
