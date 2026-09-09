import type { Metadata } from "next";
import { PropertyMediaExperience } from "@/components/property-media/PropertyMediaExperience";

export const metadata: Metadata = {
  title: "E.X Property Media｜房產影音與空間視覺服務",
  description: "E.X Property Media：以房屋導覽、現場口播、土地呈現與 AI 空間展示，協助理解空間的影像服務展示。",
  alternates: { canonical: "/property-media/" },
  openGraph: { title: "E.X Property Media｜房產影音與空間視覺服務", description: "房屋導覽、現場口播、土地呈現與 AI 空間展示。", url: "/property-media/" },
};

export default function PropertyMediaPage() {
  return <PropertyMediaExperience />;
}
