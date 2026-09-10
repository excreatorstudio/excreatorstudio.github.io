export type PropertyMediaItem = {
  id: string;
  title: string;
  src: string;
};

export type PropertyMediaCategory = {
  id: "immersive" | "presenter" | "ai-staging" | "land-ai" | "other-ai";
  label: string;
  english: string;
  folder: string;
  items: readonly PropertyMediaItem[];
};

const items = (category: string, count: number, label: string): PropertyMediaItem[] =>
  Array.from({ length: count }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return {
      id: `${category}-${number}`,
      title: `${label} ${number}`,
      src: `/media/property-media/${category}/${category}-${number}.mp4`,
    };
  });

export const propertyMediaIntro = "/media/property-media/intro/property-media-intro.mp4";
// Registered for the vNext foundation only; Stage 1 production continues to use propertyMediaIntro.
export const propertyMediaIntroV2 = "/media/property-media/intro/property-media-intro-v2.mp4";

export const propertyMediaCategories: readonly PropertyMediaCategory[] = [
  { id: "immersive", label: "沉浸式實屋", english: "Immersive Tour", folder: "immersive", items: items("immersive", 7, "沉浸式實屋") },
  { id: "presenter", label: "口播實屋", english: "Presenter Tour", folder: "presenter", items: items("presenter", 8, "口播實屋") },
  { id: "ai-staging", label: "AI 空間變裝", english: "AI Staging", folder: "ai-staging", items: items("ai-staging", 1, "AI 空間變裝") },
  { id: "land-ai", label: "土地 AI 模擬", english: "Land Visualisation", folder: "land-ai", items: items("land-ai", 1, "土地 AI 模擬") },
  { id: "other-ai", label: "其他 AI 作品", english: "Other AI Works", folder: "other-ai", items: items("other-ai", 2, "其他 AI 作品") },
];
