import styles from "@/app/universe-preview/universe-preview.module.css";

export function UniverseOrbit() {
  return (
    <div className={styles.orbitSystem} aria-hidden="true">
      <span className={`${styles.orbitRing} ${styles.orbitRingWide}`} />
    </div>
  );
}
