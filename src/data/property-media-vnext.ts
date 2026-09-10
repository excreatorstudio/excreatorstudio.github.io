import { propertyMediaIntroV2 } from "@/data/property-media";
import { propertyMediaPortfolio, type PropertyMediaPortfolioItem } from "@/data/property-media-portfolio";

export type PropertyMediaOrbitCategory = "immersive" | "presenter" | "ai-staging";
export type PropertyMediaOrbitPlacement = "left" | "center" | "right";

/** Presentation rules reserved for the Phase 2 orbit and the existing native-ratio lightbox. */
export const propertyMediaVnextDisplayContract = {
  cardAspectRatio: "3:4",
  cardObjectFit: "cover",
  lightboxObjectFit: "contain",
  openedMediaAspectRatio: "native",
} as const;

export type PropertyMediaOrbitItem = {
  id: PropertyMediaPortfolioItem["id"];
  portfolioItemId: PropertyMediaPortfolioItem["id"];
  placement: PropertyMediaOrbitPlacement;
  order: number;
  category: PropertyMediaOrbitCategory;
  title: string;
  englishSubtitle?: string;
  poster: string;
  media: string;
  displayAspectRatio: typeof propertyMediaVnextDisplayContract.cardAspectRatio;
  openedAspectRatio: typeof propertyMediaVnextDisplayContract.openedMediaAspectRatio;
  defaultActive: boolean;
  lightboxTarget: PropertyMediaPortfolioItem["id"];
};

const portfolioById = new Map(propertyMediaPortfolio.map((item) => [item.id, item] as const));

const sourceFor = (portfolioItemId: PropertyMediaPortfolioItem["id"]): PropertyMediaPortfolioItem => {
  const source = portfolioById.get(portfolioItemId);
  if (!source) throw new Error(`Missing Property Media portfolio item: ${portfolioItemId}`);
  return source;
};

const orbitItem = ({
  portfolioItemId,
  placement,
  order,
  category,
  title,
  englishSubtitle,
  defaultActive,
}: Pick<PropertyMediaOrbitItem, "portfolioItemId" | "placement" | "order" | "category" | "title" | "englishSubtitle" | "defaultActive">): PropertyMediaOrbitItem => {
  const source = sourceFor(portfolioItemId);
  return {
    id: source.id,
    portfolioItemId: source.id,
    placement,
    order,
    category,
    title,
    englishSubtitle,
    poster: source.poster,
    media: source.media,
    displayAspectRatio: propertyMediaVnextDisplayContract.cardAspectRatio,
    openedAspectRatio: propertyMediaVnextDisplayContract.openedMediaAspectRatio,
    defaultActive,
    lightboxTarget: source.id,
  };
};

/**
 * Phase 1 projection for the future Cinematic Orbit Gallery.
 * It references existing portfolio IDs and is intentionally not mounted by production UI yet.
 */
export const propertyMediaVnextOrbit = [
  orbitItem({
    portfolioItemId: "immersive-01",
    placement: "left",
    order: 0,
    category: "immersive",
    title: "沉浸式（旁白）",
    englishSubtitle: "Immersive narration",
    defaultActive: false,
  }),
  orbitItem({
    portfolioItemId: "presenter-01",
    placement: "center",
    order: 1,
    category: "presenter",
    title: "空間口播導覽",
    englishSubtitle: "Presenter-led tour",
    defaultActive: true,
  }),
  orbitItem({
    portfolioItemId: "ai-staging-01",
    placement: "right",
    order: 2,
    category: "ai-staging",
    title: "AI 空間變裝",
    englishSubtitle: "AI space staging",
    defaultActive: false,
  }),
] as const satisfies readonly PropertyMediaOrbitItem[];

export const propertyMediaVnextIntro = propertyMediaIntroV2;

/** Adapts a vNext orbit selection back to the existing Lightbox portfolio contract. */
export const toPropertyMediaPortfolioItem = (item: PropertyMediaOrbitItem): PropertyMediaPortfolioItem => sourceFor(item.portfolioItemId);
