import type { PropertyMediaPortfolioItem } from "@/data/property-media-portfolio";

export const showcaseDisclosure = {
  watermark: "作品展示範例｜E.X Property Media",
  purpose: "本影片僅供影音製作成果與技術展示，非本頁之物件銷售資訊。",
  permission: "如需轉載或另作使用，請先確認並取得必要授權。",
  simulation: "含 AI 視覺模擬，非物件實際現況或完工承諾。",
};

// Only the verified spatial-staging category establishes this claim. Generic
// AI tool use and Land Visual labels alone do not establish spatial simulation.
export function hasSpatialSimulation(item: PropertyMediaPortfolioItem) {
  return item.category === "AI_STAGING";
}

export function containedVideoRect(width: number, height: number, videoWidth: number, videoHeight: number) {
  if (![width, height, videoWidth, videoHeight].every(value => Number.isFinite(value) && value > 0)) return null;
  const scale = Math.min(width / videoWidth, height / videoHeight);
  const contentWidth = videoWidth * scale, contentHeight = videoHeight * scale;
  return { left: (width - contentWidth) / 2, top: (height - contentHeight) / 2, width: contentWidth, height: contentHeight };
}
