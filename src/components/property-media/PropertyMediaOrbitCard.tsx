"use client";

import Image from "next/image";
import { forwardRef } from "react";
import type { PropertyMediaOrbitItem } from "@/data/property-media-vnext";
import styles from "./property-media-orbit.module.css";

type PropertyMediaOrbitCardProps = {
  item: PropertyMediaOrbitItem;
  active: boolean;
  onSelect: (item: PropertyMediaOrbitItem) => void;
  onOpenMedia?: (item: PropertyMediaOrbitItem) => void;
};

export const PropertyMediaOrbitCard = forwardRef<HTMLElement, PropertyMediaOrbitCardProps>(function PropertyMediaOrbitCard({ item, active, onSelect, onOpenMedia }, ref) {
  return (
    <article
      ref={ref}
      id={`property-media-orbit-card-${item.id}`}
      className={styles.cardShell}
      role="listitem"
      data-orbit-item-id={item.id}
      data-orbit-placement={item.placement}
      data-display-aspect-ratio={item.displayAspectRatio}
    >
      <button
        type="button"
        className={styles.cardSelect}
        aria-pressed={active}
        aria-label={`${active ? "目前選取" : "選取"} ${item.title}`}
        onClick={() => onSelect(item)}
      >
        <Image className={styles.cardPoster} src={item.poster} alt={`${item.title}預覽`} width={300} height={400} unoptimized />
        <span className={styles.cardMeta}>
          <strong>{item.title}</strong>
          {item.englishSubtitle ? <small>{item.englishSubtitle}</small> : null}
        </span>
      </button>
      {onOpenMedia ? (
        <button type="button" className={styles.cardOpen} onClick={() => onOpenMedia(item)} aria-label={`開啟作品：${item.title}`}>
          開啟作品
        </button>
      ) : null}
    </article>
  );
});
