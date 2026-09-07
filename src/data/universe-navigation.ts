export type UniverseGalaxyStatus = "available" | "coming-soon";

export type UniverseGalaxy = {
  id: "create" | "knowledge" | "language" | "insight";
  group: "create" | "knowledge" | "language" | "insight";
  title: string;
  subtitle: string;
  description: string;
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
    href: "/video-production/",
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
    href: "/japanese-learning/",
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
    status: "available",
    visualKey: "observatory",
    depth: "back",
    position: { x: "36%", y: "83%", z: -34 },
  },
];

export const universeCore = {
  title: "E.X",
  subtitle: "CREATOR UNIVERSE",
  href: "/",
} as const;
