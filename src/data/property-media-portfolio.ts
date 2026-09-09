export type PropertyMediaPortfolioCategory =
  | "PROPERTY_VIDEO"
  | "PRESENTER"
  | "AI_STAGING"
  | "LAND_VISUAL"
  | "AI_VISUAL";

export type PropertyMediaPortfolioItem = {
  id: string;
  title: string;
  subtitle: string;
  category: PropertyMediaPortfolioCategory;
  type: string;
  thumbnail: string;
  poster: string;
  media: string;
  aspectRatio: "portrait" | "landscape";
  description: string;
  tags: string[];
  featured: boolean;
  status: "SHOWCASE" | "AI_DEMO";
};

export const propertyMediaPortfolioFilters: Array<{ id: "ALL" | PropertyMediaPortfolioCategory; label: string; english: string }> = [
  { id: "ALL", label: "全部", english: "All" },
  { id: "PROPERTY_VIDEO", label: "房屋導覽", english: "Property tour" },
  { id: "PRESENTER", label: "現場口播", english: "Presenter" },
  { id: "AI_STAGING", label: "AI 空間展示", english: "AI staging" },
  { id: "LAND_VISUAL", label: "土地呈現", english: "Land visual" },
  { id: "AI_VISUAL", label: "其他 AI 作品", english: "Other AI" },
];

const media = (folder: string, file: string) => `/media/property-media/${folder}/${file}.mp4`;
const poster = (folder: string, file: string) => `/images/property-media/posters/${folder}/${file}.jpg`;

const immersive = Array.from({ length: 7 }, (_, index): PropertyMediaPortfolioItem => {
  const number = String(index + 1).padStart(2, "0");
  const file = `immersive-${number}`;
  return {
    id: file,
    title: index === 0 ? "沉浸式物件導覽" : `沉浸式導覽 ${number}`,
    subtitle: "Property tour",
    category: "PROPERTY_VIDEO",
    type: "房屋導覽",
    thumbnail: poster("immersive", file),
    poster: poster("immersive", file),
    media: media("immersive", file),
    aspectRatio: "portrait",
    description: "以直式影像呈現空間節奏與觀看視角。",
    tags: ["Showcase", "Vertical"],
    featured: index === 0,
    status: "SHOWCASE",
  };
});

const presenter = Array.from({ length: 8 }, (_, index): PropertyMediaPortfolioItem => {
  const number = String(index + 1).padStart(2, "0");
  const file = `presenter-${number}`;
  return {
    id: file,
    title: index === 0 ? "現場口播呈現" : `現場口播 ${number}`,
    subtitle: "Presenter-led media",
    category: "PRESENTER",
    type: "現場口播",
    thumbnail: poster("presenter", file),
    poster: poster("presenter", file),
    media: media("presenter", file),
    aspectRatio: "portrait",
    description: "以人物說明建立物件與觀看者之間的理解節奏。",
    tags: ["Showcase", "Vertical"],
    featured: index === 0,
    status: "SHOWCASE",
  };
});

export const propertyMediaPortfolio: PropertyMediaPortfolioItem[] = [
  ...immersive,
  ...presenter,
  {
    id: "ai-staging-01",
    title: "AI 空間展示示意",
    subtitle: "AI Space Presentation",
    category: "AI_STAGING",
    type: "AI 空間展示",
    thumbnail: poster("ai-staging", "ai-staging-01"),
    poster: poster("ai-staging", "ai-staging-01"),
    media: media("ai-staging", "ai-staging-01"),
    aspectRatio: "landscape",
    description: "以影像示意協助理解空間可能性；非裝修成果或承諾。",
    tags: ["AI demo", "Landscape"],
    featured: true,
    status: "AI_DEMO",
  },
  {
    id: "land-ai-01",
    title: "土地視覺呈現",
    subtitle: "Land visual",
    category: "LAND_VISUAL",
    type: "土地呈現",
    thumbnail: poster("land-ai", "land-ai-01"),
    poster: poster("land-ai", "land-ai-01"),
    media: media("land-ai", "land-ai-01"),
    aspectRatio: "portrait",
    description: "將位置、尺度與環境訊息放進更容易觀看的敘事。",
    tags: ["Showcase", "Vertical"],
    featured: false,
    status: "SHOWCASE",
  },
  ...["other-ai-01", "other-ai-02"].map((file, index): PropertyMediaPortfolioItem => ({
    id: file,
    title: `其他 AI 作品 ${String(index + 1).padStart(2, "0")}`,
    subtitle: "Other AI works",
    category: "AI_VISUAL",
    type: "其他 AI 作品",
    thumbnail: poster("other-ai", file),
    poster: poster("other-ai", file),
    media: media("other-ai", file),
    aspectRatio: "portrait",
    description: "保留為可替換的 AI 視覺展示素材。",
    tags: ["AI demo", "Vertical"],
    featured: false,
    status: "AI_DEMO",
  })),
];

export const propertyMediaServices = [
  { title: "房屋導覽", english: "Property Tour", value: "讓動線、採光與尺度在影像裡被真正理解。", useCase: "適合需要完整介紹空間的物件。" },
  { title: "現場口播", english: "Presenter-led", value: "以清楚的人物說明建立觀看節奏與信任感。", useCase: "適合需要把重點說得更明確的案件。" },
  { title: "土地呈現", english: "Land Visual", value: "把位置、環境與想像放進同一個視覺敘事。", useCase: "適合土地與環境脈絡的初步呈現。" },
  { title: "AI 空間展示", english: "AI Staging", value: "用 AI 示意輔助理解空間的下一種可能。", useCase: "適合建立家具、風格與使用情境的想像。" },
];

export const propertyMediaProcess = [
  { step: "01", title: "了解物件", description: "先確認空間條件與希望被看見的重點。" },
  { step: "02", title: "確認拍攝方向", description: "整理最適合的影像敘事與畫面節奏。" },
  { step: "03", title: "拍攝／製作", description: "依選定的呈現方式完成素材製作。" },
  { step: "04", title: "交付成品", description: "交付可用於展示與溝通的完成媒體。" },
];
