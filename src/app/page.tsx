import type { Metadata } from "next";
import { UniversePreview } from "@/components/universe/UniversePreview";

export const metadata: Metadata = {
  title: "E.X Creator Universe｜創作、學習、語言與洞察",
  description: "E.X Creator Universe 是 E.X 生態系的入口，從創作、知識、語言與洞察前往各個產品世界。",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "E.X Creator Universe",
    description: "從創作、知識、語言與洞察進入 E.X 的 AI 工作宇宙。",
    url: "/",
  },
};

export default function Home() {
  return <UniversePreview showPropertyMediaEntry />;
}
