import Link from "next/link";
import Image from "next/image";
import type { CSSProperties, MouseEvent, PointerEvent } from "react";
import type { UniverseGalaxy } from "@/data/universe-navigation";
import styles from "@/app/universe-preview/universe-preview.module.css";

type GalaxyNodeProps = {
  galaxy: UniverseGalaxy;
  active: boolean;
  dimmed: boolean;
  onFocusGalaxy: (id: UniverseGalaxy["id"]) => void;
  onEnterGalaxy: (event: MouseEvent<HTMLAnchorElement>, galaxy: UniverseGalaxy) => void;
  onPointerDown: (event: PointerEvent<HTMLAnchorElement>, id: UniverseGalaxy["id"]) => void;
};

export function GalaxyNode({ galaxy, active, dimmed, onFocusGalaxy, onEnterGalaxy, onPointerDown }: GalaxyNodeProps) {
  const nodeClass = [
    styles.galaxyNode,
    styles[`galaxyNode${galaxy.depth[0].toUpperCase()}${galaxy.depth.slice(1)}` as keyof typeof styles],
    active ? styles.galaxyNodeActive : "",
    dimmed ? styles.galaxyNodeDimmed : "",
  ].join(" ");

  return (
    <Link
      href={galaxy.status === "available" ? galaxy.href : "#"}
      className={nodeClass}
      style={{ "--galaxy-x": galaxy.position.x, "--galaxy-y": galaxy.position.y, "--galaxy-z": `${galaxy.position.z}px` } as CSSProperties}
      aria-label={`${galaxy.title} — ${galaxy.subtitle}`}
      data-focused={active}
      data-galaxy={galaxy.id}
      data-status={galaxy.status}
      onFocus={() => onFocusGalaxy(galaxy.id)}
      onPointerEnter={(event) => { if (event.pointerType !== "touch") onFocusGalaxy(galaxy.id); }}
      onPointerDown={(event) => onPointerDown(event, galaxy.id)}
      onClick={(event) => onEnterGalaxy(event, galaxy)}
      onKeyDown={(event) => { if (event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}
    >
      <span className={styles.galaxyVisual} aria-hidden="true">
        <Image src={`/images/universe/${galaxy.id}-v2.png`} alt="" width={1254} height={1254} sizes="(max-width: 767px) 220px, 260px" unoptimized />
      </span>
      <span className={styles.galaxyCopy}>
        <strong>{galaxy.title}</strong>
        <span>{galaxy.subtitle}</span>
        <small className={styles.galaxyReveal} aria-hidden={!active}>{galaxy.description}</small>
      </span>
      {galaxy.status === "coming-soon" ? <span className={styles.galaxyStatus}>COMING SOON</span> : null}
    </Link>
  );
}
