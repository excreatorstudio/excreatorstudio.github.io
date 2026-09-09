"use client";

import { propertyMediaPortfolio, type PropertyMediaPortfolioItem } from "@/data/property-media-portfolio";
import Image from "next/image";
import styles from "./property-media.module.css";

type AIStagingShowcaseProps = { onOpen: (item: PropertyMediaPortfolioItem) => void };

export function AIStagingShowcase({ onOpen }: AIStagingShowcaseProps) {
  const aiStaging = propertyMediaPortfolio.find((item) => item.category === "AI_STAGING");
  if (!aiStaging) return null;

  return (
    <section className={styles.aiStaging} aria-labelledby="ai-staging-title">
      <div className={styles.aiStagingMedia}>
        <Image src={aiStaging.poster} alt="AI 空間展示示意影片預覽" width={1600} height={1000} unoptimized />
        <button type="button" onClick={() => onOpen(aiStaging)} aria-label="播放 AI 空間展示示意影片">觀看示意 <span aria-hidden="true">↗</span></button>
      </div>
      <div className={styles.aiStagingCopy}>
        <p className={styles.kicker}>AI SPACE TRANSFORMATION</p>
        <h2 id="ai-staging-title">看見空間的下一種可能。</h2>
        <p>AI Space Presentation 協助呈現家具配置、風格方向與空間想像，讓潛在買方更快理解空間的可能性。</p>
        <p className={styles.aiDisclosure}>AI-generated spatial visualization. 本區影像為 AI 示意，不等同真實裝潢、現況或任何完工承諾。</p>
        <span className={styles.pairStatus}>目前沒有可驗證的同場景 Before / After 成對素材；滑桿比較會在取得成對素材後再加入。</span>
      </div>
    </section>
  );
}
