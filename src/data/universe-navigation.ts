export type UniverseGalaxyStatus = "available" | "coming-soon";

export type UniverseGalaxy = {
  id: "create" | "knowledge" | "language" | "insight";
  group: "create" | "knowledge" | "language" | "insight";
  title: string;
  subtitle: string;
  description: string;
  destinations: readonly { label: string; english: string; href: string }[];
  href: string;
  status: UniverseGalaxyStatus;
  visualKey: string;
  depth: "front" | "mid" | "back";
  position: {
    x: string;
    y: string;
    z: number;
  };
};

/**
 * The renderer consumes this typed map. Routes are intentionally explicit so
 * a visual reference can never invent a product destination.
 */
export const universeGalaxies: readonly UniverseGalaxy[] = [
  {
    id: "create",
    group: "create",
    title: "創作",
    subtitle: "Create",
    description: "Auto Editing · AI Video · Creative Tools",
    href: "/creator-academy/",
    destinations: [
      { label: "AI 影音", english: "AI Video", href: "/creator-academy/ai-visual-creation/yuni-ai-video-motion-basics/" },
      { label: "攝影構圖", english: "Photography", href: "/creator-academy/photography-composition/yuni-composition-basics/" },
      { label: "創作資源", english: "Creative Resources", href: "/creator-academy/resources/" },
    ],
    status: "available",
    visualKey: "aperture",
    depth: "mid",
    position: { x: "73%", y: "24%", z: 28 },
  },
  {
    id: "knowledge",
    group: "knowledge",
    title: "知識",
    subtitle: "Knowledge",
    description: "AI Learning Station · Classroom · AI TA",
    href: "/ai-learning/",
    destinations: [
      { label: "教室", english: "Classroom", href: "/ai-learning/classroom/" },
      { label: "實作練習", english: "Practice Lab", href: "/ai-learning/practice-lab/" },
      { label: "知識庫", english: "Knowledge Hub", href: "/ai-learning/knowledge-hub/" },
    ],
    status: "available",
    visualKey: "book",
    depth: "front",
    position: { x: "23%", y: "44%", z: 72 },
  },
  {
    id: "language",
    group: "language",
    title: "語言",
    subtitle: "Language",
    description: "English · Japanese",
    href: "#language-destinations",
    destinations: [
      { label: "英文學習", english: "English", href: "/english-learning/" },
      { label: "日文學習", english: "Japanese", href: "/japanese-learning/" },
    ],
    status: "available",
    visualKey: "network",
    depth: "mid",
    position: { x: "77%", y: "73%", z: 4 },
  },
  {
    id: "insight",
    group: "insight",
    title: "洞察",
    subtitle: "Insight",
    description: "Market Radar · Research · Data",
    href: "/market-radar/",
    destinations: [{ label: "房市快報", english: "Market Radar", href: "/market-radar/" }],
    status: "available",
    visualKey: "observatory",
    depth: "back",
    position: { x: "36%", y: "83%", z: -34 },
  },
];

export const universeCore = {
  title: "E.X",
  subtitle: "創作中心 × 創作者學院",
  href: "/",
} as const;
