"use client";

import { useMemo, useState } from "react";
import { propertyMediaPortfolio, propertyMediaPortfolioFilters, type PropertyMediaPortfolioItem } from "@/data/property-media-portfolio";
import { PropertyMediaCard } from "./PropertyMediaCard";
import styles from "./property-media.module.css";

type PropertyMediaPortfolioProps = { onOpen: (item: PropertyMediaPortfolioItem) => void };

export function PropertyMediaPortfolio({ onOpen }: PropertyMediaPortfolioProps) {
  const [activeFilter, setActiveFilter] = useState<(typeof propertyMediaPortfolioFilters)[number]["id"]>("ALL");
  const featured = propertyMediaPortfolio.filter((item) => item.featured).slice(0, 3);
  const visibleItems = useMemo(
    () => activeFilter === "ALL" ? propertyMediaPortfolio : propertyMediaPortfolio.filter((item) => item.category === activeFilter),
    [activeFilter],
  );

  return (
    <>
      <section id="property-media-selected-works" className={styles.selectedWorks} aria-labelledby="selected-works-title">
        <div className={styles.sectionIntro}>
          <p className={styles.kicker}>SELECTED WORKS</p>
          <h2 id="selected-works-title">精選作品</h2>
          <p>以實際影音素材整理的展示選輯；未標示客戶、地址或交易資訊。</p>
        </div>
        <div className={styles.featuredWorks}>
          {featured.map((item) => <PropertyMediaCard item={item} featured key={item.id} onOpen={onOpen} />)}
        </div>
      </section>

      <section className={styles.portfolio} aria-labelledby="portfolio-title">
        <div className={styles.portfolioHeading}>
          <div><p className={styles.kicker}>PORTFOLIO LIBRARY</p><h2 id="portfolio-title">以影像探索服務的不同面向。</h2></div>
          <p>影片只會在開啟播放器後才載入，避免作品牆拖慢首次瀏覽。</p>
        </div>
        <div className={styles.filterRail} aria-label="作品分類篩選">
          {propertyMediaPortfolioFilters.map((filter) => (
            <button key={filter.id} className={activeFilter === filter.id ? styles.filterActive : styles.filterButton} type="button" aria-pressed={activeFilter === filter.id} onClick={() => setActiveFilter(filter.id)}>
              {filter.label}<small>{filter.english}</small>
            </button>
          ))}
        </div>
        <div className={styles.gallery} aria-live="polite">
          {visibleItems.map((item) => <PropertyMediaCard item={item} key={item.id} onOpen={onOpen} />)}
        </div>
      </section>
    </>
  );
}
