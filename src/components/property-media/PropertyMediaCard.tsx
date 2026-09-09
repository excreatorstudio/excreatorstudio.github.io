"use client";

import type { PropertyMediaPortfolioItem } from "@/data/property-media-portfolio";
import Image from "next/image";
import styles from "./property-media.module.css";

type PropertyMediaCardProps = {
  item: PropertyMediaPortfolioItem;
  featured?: boolean;
  onOpen: (item: PropertyMediaPortfolioItem) => void;
};

export function PropertyMediaCard({ item, featured = false, onOpen }: PropertyMediaCardProps) {
  return (
    <button
      className={`${styles.workCard} ${featured ? styles.featuredWorkCard : ""} ${item.aspectRatio === "landscape" ? styles.landscapeWorkCard : styles.portraitWorkCard}`}
      type="button"
      onClick={() => onOpen(item)}
      aria-label={`開啟作品：${item.title}`}
    >
      <span className={styles.workMedia}>
        <Image src={item.thumbnail} alt={`${item.title}預覽畫面`} width={900} height={featured ? 1125 : 1600} unoptimized priority={featured} />
        <span className={styles.playAffordance} aria-hidden="true">播放</span>
      </span>
      <span className={styles.workMeta}>
        <span className={styles.workCategory}>{item.type}</span>
        <strong>{item.title}</strong>
        <small>{item.subtitle}</small>
      </span>
    </button>
  );
}
