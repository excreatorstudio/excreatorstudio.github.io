export const HANDBOOK_HREF = "/ex-ai/editing/handbook/";

export type HandbookTermId = "shot-size" | "camera-movement" | "transition" | "b-roll" | "jump-cut" | "timeline";
export type HandbookTerm = {
  id: HandbookTermId;
  number: string;
  title: string;
  english: string;
  definition: string;
  example: string;
  takeaway: string;
};

// Deliberately public introductory copy only. Never import the private source.
export const handbookTerms: readonly HandbookTerm[] = [
  { id: "shot-size", number: "01", title: "景別", english: "Shot Size", definition: "主體在畫面裡佔多大，決定觀眾看見環境，還是注意細節。", example: "介紹一個人時，用遠景交代位置，再用特寫看清表情。", takeaway: "同一個主體，不同的觀看距離。" },
  { id: "camera-movement", number: "02", title: "運鏡", english: "Camera Movement", definition: "攝影機位置或朝向的變化，帶著觀眾的視線移動。", example: "攝影機緩緩靠近主體，是「推近」；轉動鏡頭方向則是「搖鏡」。", takeaway: "圖中的推近，是攝影機向主體移動。" },
  { id: "transition", number: "03", title: "轉場", english: "Transition", definition: "兩段畫面之間如何銜接，會影響故事的節奏與連續感。", example: "直接切換俐落明確；溶接讓前後畫面短暫重疊，逐漸交替。", takeaway: "先選擇適合故事的銜接，再考慮效果。" },
  { id: "b-roll", number: "04", title: "輔助畫面", english: "B-roll", definition: "補充主敘事的鏡頭，用來呈現環境、動作或細節。", example: "人物介紹咖啡時，穿插手沖與咖啡杯的畫面，讓內容更具體。", takeaway: "主畫面說故事，輔助畫面補上看得見的細節。" },
  { id: "jump-cut", number: "05", title: "跳剪", english: "Jump Cut", definition: "相近構圖的兩段畫面直接相接，讓主體的位置或動作產生明顯跳躍。", example: "口播刪去一段停頓後，人物動作直接接到下一句；可能形成跳剪。", takeaway: "刪除停頓是例子；畫面中的不連續才是辨識重點。" },
  { id: "timeline", number: "06", title: "時間軸", english: "Timeline", definition: "按時間排列影片、字幕與聲音的工作區，用來組織作品。", example: "同一時間點可以同時放影片、字幕與音樂，分別安排在不同軌道。", takeaway: "橫向看先後，縱向看同時出現的內容。" },
] as const;

export const handbookPremiumPreview = ["完整剪輯術語庫", "景別與運鏡指南", "剪輯工作流程", "AI 指令工具箱", "分鏡表與 JSON 範本", "進階實作教學"] as const;

// Public descriptions only. Decorative card previews contain no protected text.
export const handbookPremiumCards = [
  { id: "glossary", title: handbookPremiumPreview[0], description: "從常用詞到進階概念，建立更完整的剪輯語言。" },
  { id: "camera", title: handbookPremiumPreview[1], description: "理解畫面距離與鏡頭移動，描述更清楚的觀看方式。" },
  { id: "workflow", title: handbookPremiumPreview[2], description: "認識從素材到作品的步驟，延伸至未來 AI 剪輯協作。" },
  { id: "prompts", title: handbookPremiumPreview[3], description: "練習向 GPT、Claude 與 AI 影片工具說明創作想法。" },
  { id: "storyboard", title: handbookPremiumPreview[4], description: "將畫面想法整理成結構，認識分鏡與資料格式。" },
  { id: "practice", title: handbookPremiumPreview[5], description: "透過延伸案例，逐步理解剪輯選擇與敘事節奏。" },
] as const;

export type ApprovedHandbookMedia = { src: string; kind: "video" | "image" | "captions"; status: "APPROVED_LOCAL" | "PRODUCTION_APPROVED" };
export type HandbookVideoConfig = {
  id: string;
  title: string;
  videoStatus: "PENDING" | "AVAILABLE";
  videoSrc: string | null;
  posterSrc: string | null;
  captionsSrc: string | null;
  duration: string | null;
};

// Future media must be approved, registered here, and verified to exist by tests.
export const approvedHandbookMedia: readonly ApprovedHandbookMedia[] = [
  { src: "/media/editing-handbook/intro-24s.web.mp4", kind: "video", status: "APPROVED_LOCAL" },
  { src: "/media/editing-handbook/intro-poster.webp", kind: "image", status: "APPROVED_LOCAL" },
];
export const handbookIntroVideo: HandbookVideoConfig = {
  id: "handbook-six-terms-intro",
  title: "24 秒，看懂剪輯語言",
  videoStatus: "AVAILABLE",
  videoSrc: "/media/editing-handbook/intro-24s.web.mp4",
  posterSrc: "/media/editing-handbook/intro-poster.webp",
  captionsSrc: null,
  duration: "0:24",
};

export function isSafeHandbookMediaPath(path: string | null | undefined): path is string {
  if (!path || !path.startsWith("/media/editing-handbook/") || /[\\?#\u0000-\u0020]/.test(path)) return false;
  try { const decoded = decodeURIComponent(path); return !/[\\?#\u0000-\u0020]/.test(decoded) && !decoded.split("/").some(segment => segment === ".." || segment === "."); } catch { return false; }
}

export function resolveHandbookVideo(config: HandbookVideoConfig, registry = approvedHandbookMedia): "PENDING" | "AVAILABLE" | "FALLBACK" {
  if (config.videoStatus === "PENDING") return "PENDING";
  if (config.videoStatus !== "AVAILABLE") return "FALLBACK";
  const src = config.videoSrc;
  const approved = registry.some(asset => asset.src === src && asset.kind === "video" && ["APPROVED_LOCAL", "PRODUCTION_APPROVED"].includes(asset.status));
  return isSafeHandbookMediaPath(src) && /\.(mp4|webm)$/i.test(src) && approved ? "AVAILABLE" : "FALLBACK";
}

export function resolveHandbookAuxiliaryMedia(src: string | null, kind: "image" | "captions", registry = approvedHandbookMedia): string | undefined {
  const extension = kind === "captions" ? /\.vtt$/i : /\.(webp|avif|png|jpe?g)$/i;
  return isSafeHandbookMediaPath(src) && extension.test(src) && registry.some(asset => asset.src === src && asset.kind === kind && ["APPROVED_LOCAL", "PRODUCTION_APPROVED"].includes(asset.status)) ? src : undefined;
}
