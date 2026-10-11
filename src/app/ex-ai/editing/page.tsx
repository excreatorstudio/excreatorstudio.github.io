import type { Metadata } from "next";
import { EditingAcademy } from "@/components/editing-academy/EditingAcademy";

export const metadata: Metadata = {
  title: "Editing Academy｜剪輯學院 · E.X Creator Studio",
  description: "從零剪出第一支代表作。探索短影音、商業影片與 AI 影像剪輯的學習方向。課程與詢問管道準備中。",
  alternates: { canonical: "/ex-ai/editing/" },
  openGraph: { title: "E.X Editing Academy｜從零剪出第一支代表作。", url: "/ex-ai/editing/" },
};

export default function EditingPage() {
  return <EditingAcademy />;
}
