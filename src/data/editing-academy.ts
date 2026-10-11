export type CourseStatus = "FREE_AVAILABLE" | "COMING_SOON" | "INQUIRY_OPEN" | "ENROLLMENT_OPEN";
export type AssetStatus = "REFERENCE_ONLY" | "MOCK_ONLY" | "APPROVED_LOCAL" | "PRODUCTION_APPROVED";
export type EditingCourse = {
  id: string;
  slug: string;
  title: string;
  category: "free" | "paid";
  difficulty: string;
  description: string;
  learningOutcomes: readonly string[];
  syllabus: readonly string[];
  thumbnail: "timeline" | "sound" | "property" | "color" | "ai";
  status: CourseStatus;
  software?: string;
  audience: string;
  price?: { amount: number; currency: "TWD"; approved: true };
  durationMinutes?: number;
  deliveryMode?: string;
};

export const editingCourses: readonly EditingCourse[] = [
  {
    id: "F01", slug: "first-short-film", title: "第一次剪出 30 秒短影音", category: "free",
    difficulty: "入門", description: "從素材挑選開始，建立一段有開頭、有重點的短片。",
    learningOutcomes: ["規劃 30 秒作品的開頭、主體與收尾", "完成素材排序與基本剪接"],
    syllabus: ["挑選三個重點鏡頭", "整理時間軸與刪除空拍", "檢查節奏與輸出設定"],
    thumbnail: "timeline", status: "COMING_SOON", audience: "尚未完成第一支短影音的初學者", deliveryMode: "規劃為免費影片單元；影片尚未上架",
  },
  {
    id: "F02", slug: "captions-rhythm-music", title: "字幕、節奏與背景音樂", category: "free",
    difficulty: "入門", description: "讓文字看得清楚，讓聲音與畫面一起說故事。",
    learningOutcomes: ["建立清楚可讀的字幕層級", "讓剪接點配合語意與音樂節奏"],
    syllabus: ["字幕字級與安全範圍", "語意停頓與節奏", "音樂音量與授權檢查"],
    thumbnail: "sound", status: "COMING_SOON", audience: "想改善字幕與聲音搭配的創作者", deliveryMode: "規劃為免費影片單元；影片尚未上架",
  },
  {
    id: "F03", slug: "property-film-basics", title: "房屋影片剪輯入門", category: "free",
    difficulty: "入門", description: "依照看屋動線組織鏡頭，讓空間介紹更容易理解。",
    learningOutcomes: ["用動線安排空間鏡頭", "用字幕補充必要資訊，不遮住空間"],
    syllabus: ["建立看屋順序", "銜接全景與細節", "核對資訊與素材使用權"],
    thumbnail: "property", status: "COMING_SOON", audience: "需要製作房屋介紹影片的初學者", deliveryMode: "規劃為免費影片單元；影片尚未上架",
  },
  {
    id: "P01", slug: "capcut-practice", title: "零基礎短影音剪輯實戰", category: "paid",
    difficulty: "零基礎", description: "把分散的素材，剪成一支完整的短影音。",
    learningOutcomes: ["建立從匯入到輸出的 CapCut 工作流程", "完成一支可整理進作品集的練習短片"],
    syllabus: ["素材整理與故事結構", "剪接、字幕與聲音", "節奏修整與輸出檢查"],
    thumbnail: "timeline", software: "CapCut", status: "COMING_SOON", audience: "第一次接觸剪輯，想建立完整工作流程的學習者", deliveryMode: "實作課程規劃中；上課形式、日期與費用待確認",
  },
  {
    id: "P02", slug: "davinci-commercial-film", title: "專業剪輯與商業影片實戰", category: "paid",
    difficulty: "進階", description: "從故事到色彩，讓商業影片有一致的完成度。",
    learningOutcomes: ["建立 DaVinci Resolve 的剪輯與調色流程", "完成一份商業影片練習交付包"],
    syllabus: ["專案管理與剪輯結構", "色彩一致性與聲音整理", "交付規格與版本檢查"],
    thumbnail: "color", software: "DaVinci Resolve", status: "COMING_SOON", audience: "已有基本剪輯經驗，想練習商業交付的創作者", deliveryMode: "實作課程規劃中；上課形式、日期與費用待確認",
  },
  {
    id: "P03", slug: "ai-video-practice", title: "AI 影片創作實戰", category: "paid",
    difficulty: "跨工具實作", description: "把 AI 鏡頭融入故事，而不是停在生成一段影片。",
    learningOutcomes: ["規劃圖生影片、首尾幀與運鏡", "整合 AI 素材與後期剪輯，完成連貫片段"],
    syllabus: ["圖生影片與素材治理", "首尾幀、運鏡與連續性", "後期整合、聲音與輸出"],
    thumbnail: "ai", status: "COMING_SOON", audience: "想整合 AI 影像與既有剪輯技能的創作者", deliveryMode: "實作課程規劃中；工具、上課形式與費用待確認",
  },
];

export const editingAssets = [
  { id: "studio-wide", src: "/images/editing-academy/studio-1600.webp", width: 1600, height: 900, status: "MOCK_ONLY" as AssetStatus, source: "/images/creator-studio/hero-showcase-v1.png", alt: "剪輯工作室視覺示意：攝影機、剪輯工作站與多螢幕監看牆", focalPoint: "68% 50%" },
  { id: "studio-small", src: "/images/editing-academy/studio-800.webp", width: 800, height: 450, status: "MOCK_ONLY" as AssetStatus, source: "/images/creator-studio/hero-showcase-v1.png", alt: "剪輯工作室視覺示意：攝影機、剪輯工作站與多螢幕監看牆", focalPoint: "68% 50%" },
] as const;

export type EditingLessonStep = {
  number: "01" | "02" | "03" | "04";
  title: string;
  instruction: string;
  icon: "media" | "trim" | "captions" | "export";
  imageSrc?: string | null;
  imageAlt?: string;
  imageStatus?: AssetStatus;
  hotspots?: readonly { x: number; y: number; label: string }[];
};

export type EditingLesson = {
  lessonId: string;
  title: string;
  description: string;
  videoStatus: "PENDING" | "AVAILABLE";
  videoSrc?: string | null;
  posterSrc?: string | null;
  videoAssetStatus?: AssetStatus;
  duration?: string | null;
  steps: readonly EditingLessonStep[];
};

export function isLocalEditingMediaPath(path: string | null | undefined): path is string {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//") && !path.includes("\\") && !/[\u0000-\u001f]/.test(path);
}

export function isApprovedEditingLessonStill(step: EditingLessonStep): boolean {
  const approved = step.imageStatus === "APPROVED_LOCAL" || step.imageStatus === "PRODUCTION_APPROVED";
  return approved && isLocalEditingMediaPath(step.imageSrc) && Boolean(step.imageAlt?.trim());
}

export function getEditingLessonVideoPresentation(lesson: EditingLesson): "PENDING" | "AVAILABLE" | "FALLBACK" {
  if (lesson.videoStatus === "PENDING") return "PENDING";
  const approved = lesson.videoAssetStatus === "APPROVED_LOCAL" || lesson.videoAssetStatus === "PRODUCTION_APPROVED";
  return approved && isLocalEditingMediaPath(lesson.videoSrc) ? "AVAILABLE" : "FALLBACK";
}

export const editingStarterLesson: EditingLesson = {
  lessonId: "first-short-video",
  title: "一支影片，快速學會簡單剪輯",
  description: "即將帶你完成第一支短影片，從匯入素材到輸出作品。",
  videoStatus: "PENDING",
  videoSrc: null,
  posterSrc: null,
  duration: null,
  steps: [
    { number: "01", title: "匯入影片素材", instruction: "將影片加入剪輯軟體，拖曳到時間軸。", icon: "media", imageSrc: null },
    { number: "02", title: "剪掉多餘片段", instruction: "保留精彩畫面，移除不需要的部分。", icon: "trim", imageSrc: null },
    { number: "03", title: "加入字幕", instruction: "加入簡單文字，讓影片更容易理解。", icon: "captions", imageSrc: null },
    { number: "04", title: "加入音樂並輸出", instruction: "調整背景音樂，輸出完成的影片。", icon: "export", imageSrc: null },
  ],
};

export const editingInquiry = { status: "PENDING", destination: null } as const;

export const editingPortfolio = [
  { id: "before-after", title: "Before / After", subtitle: "從素材到故事", artwork: "color" as const, description: "等待同一素材的剪輯前後對照；目前為構圖示意，非成效證明。" },
  { id: "reels", title: "Reels 短影音", subtitle: "把注意力留在畫面裡", artwork: "timeline" as const, description: "等待正式直式短影音與展示授權；目前為時間軸示意。" },
  { id: "real-estate", title: "房屋影片", subtitle: "讓空間動線更清楚", artwork: "property" as const, description: "等待經核准的房屋剪輯案例；目前為空間構圖示意。" },
  { id: "ai-film", title: "AI 影像剪輯", subtitle: "讓想像成為連貫的鏡頭", artwork: "ai" as const, description: "等待有來源紀錄的 AI 後期作品；目前為鏡頭構圖示意。" },
] as const;

export const editingFaq = [
  { question: "完全沒有剪輯經驗，也能開始嗎？", answer: "可以先從 F01 的學習方向開始了解。免費教學影片目前準備中；正式上架後，會提供可直接觀看的內容。" },
  { question: "免費課程現在可以播放嗎？", answer: "目前三個單元均標示 COMING SOON，尚無可播放影片。頁面提供學習目標與課綱預覽，不會以示意畫面冒充教學影片。" },
  { question: "付費課程如何報名？費用是多少？", answer: "課程仍在規劃，尚未開放報名或付款。正式費用、日期與詢問管道待確認，現階段不收集聯絡資料。" },
  { question: "需要先購買剪輯軟體嗎？", answer: "先確認預計學習的課程與設備。各課程使用工具已列於課程規劃；實際版本、授權需求與設備規格，將於正式開課前確認。" },
  { question: "作品區展示的是學員作品嗎？", answer: "不是。現階段為明確標示的視覺示意與案例預留位置。正式案例需完成來源與展示授權確認，不會宣稱是學員成果。" },
  { question: "一對一與小班教學可以預約嗎？", answer: "目前可查看教學形式與預計產出，尚未開放排程。詢問管道仍待核准，因此不提供假預約或送出成功訊息。" },
] as const;
