import type { Metadata } from "next";
import { UniversePreview } from "@/components/universe/UniversePreview";

export const metadata: Metadata = {
  title: "E.X Creator Universe｜Premium Spatial Entrance",
  description: "E.X Creator Universe 的空間入口原型：從世界進入 Galaxy，再抵達產品與學習目的地。",
  alternates: { canonical: "/universe-preview/" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "E.X Creator Universe",
    description: "A premium spatial entrance for the E.X digital universe.",
    url: "/universe-preview/",
  },
};

export default function UniversePreviewPage() {
  return <UniversePreview />;
}
