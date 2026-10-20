import type { Metadata } from "next";
import { HandbookPage } from "@/components/editing-handbook/HandbookPage";

export const metadata: Metadata = {
  title: "剪片說明書｜圖解六個常用剪輯術語 · E.X Creator Studio",
  description: "以景別、運鏡、轉場、B-roll、跳剪與時間軸圖解，建立與 AI 溝通創作想法的入門語言。",
  alternates: { canonical: "/ex-ai/editing/handbook/" },
  openGraph: { title: "剪片說明書｜看懂剪輯語言，讓創作更簡單。", url: "/ex-ai/editing/handbook/", images: [{ url: "/images/editing-handbook/book-512.webp", width: 512, height: 512, alt: "剪片說明書的藍色發光數位書" }] },
};

export default function EditingHandbookPage() { return <HandbookPage />; }
