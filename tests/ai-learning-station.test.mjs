import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { access } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const exists = async (path) => { await access(new URL(path, root)); return true; };

const content = await read("src/lib/ai-learning/content.ts");
const home = await read("src/app/page.tsx");
const universeNavigation = await read("src/data/universe-navigation.ts");
const landing = await read("src/app/ai-learning/page.tsx");
const hero = await read("src/components/ai-learning/AiLearningHero.tsx");
const homeEntry = await read("src/components/AiLearningStationEntry.tsx");
const modules = await read("src/components/ai-learning/LearningModuleCard.tsx");
const classroom = await read("src/app/ai-learning/classroom/page.tsx");
const course = await read("src/app/ai-learning/classroom/how-web-works/page.tsx");
const knowledgeHub = await read("src/app/ai-learning/knowledge-hub/page.tsx");
const skillTree = await read("src/app/ai-learning/skill-tree/page.tsx");
const practiceLab = await read("src/app/ai-learning/practice-lab/page.tsx");
const lesson = await read("src/app/ai-learning/classroom/how-web-works/[lessonSlug]/page.tsx");
const aiTa = await read("src/components/ai-learning/AiTaPanel.tsx");
const style = await read("src/app/ai-learning/ai-learning.css");
const packageJson = JSON.parse(await read("package.json"));

test("AI Learning Station landing and homepage entry routes exist", async () => {
  assert.equal(await exists("src/app/ai-learning/page.tsx"), true);
  assert.equal(await exists("src/components/AiLearningStationEntry.tsx"), true);
  assert.match(home, /UniversePreview/);
  assert.match(universeNavigation, /href: "\/ai-learning\//);
  assert.match(universeNavigation, /href: "\/creator-academy\//);
  assert.match(landing, /AI 學習站/);
  assert.match(hero, /理解邏輯，<span>把執行交給 AI。<\/span>/);
  assert.match(homeEntry, /hover|tap/i);
});

test("five station modules preserve the planned information architecture", () => {
  for (const id of ["knowledge-hub", "classroom", "ai-ta", "skill-tree", "practice-lab"]) assert.match(content, new RegExp(`id: "${id}"`));
  for (const label of ["Knowledge Hub", "Classroom", "AI TA", "Skill Tree", "Practice Lab"]) assert.match(content, new RegExp(label.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")));
  assert.match(landing, /aiLearningModules\.map/);
  assert.match(modules, /href=\{module\.href\}/);
});

test("classroom and demo course routes compose the exact seven lesson curriculum", async () => {
  assert.equal(await exists("src/app/ai-learning/classroom/page.tsx"), true);
  assert.equal(await exists("src/app/ai-learning/classroom/how-web-works/page.tsx"), true);
  assert.match(classroom, /AI_LEARNING_COURSE/);
  assert.match(course, /AI_LEARNING_COURSE\.lessons\[0\]/);
  for (const topic of ["Internet", "Frontend", "Backend", "API", "Database", "Cloud", "AI in the System"]) assert.match(content, new RegExp(`title: "${topic}"`));
  assert.equal((content.match(/slug: "(?:internet|frontend|backend|api|database|cloud|ai)"/g) ?? []).length, 7);
});

test("lesson data is reusable and contains the teaching contract", () => {
  for (const field of ["id", "slug", "order", "title", "titleEn", "summary", "concept", "whyItMatters", "systemPosition", "analogy", "exExample", "aiCanDo", "humanMustUnderstand", "knowledgeCheck", "practice", "suggestedQuestions", "relatedSkills"]) assert.match(content, new RegExp(`${field}:`));
  assert.match(content, /export type AiLearningLesson/);
  assert.match(lesson, /generateStaticParams/);
  for (const section of ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"]) assert.match(lesson, new RegExp(`number=\\"${section}\\"`));
  assert.match(lesson, /LessonNavigation/);
  assert.match(lesson, /LessonSection/);
});

test("lesson routes expose static metadata and all seven params", () => {
  assert.match(lesson, /export function generateStaticParams/);
  assert.match(lesson, /AI_LEARNING_COURSE\.lessons\.map/);
  assert.match(lesson, /generateMetadata/);
  assert.doesNotMatch(lesson, /cookies\(|headers\(|server action/i);
});

test("AI TA is a context-aware static prototype with predefined responses", () => {
  assert.match(aiTa, /"use client"/);
  assert.match(aiTa, /useState/);
  assert.match(aiTa, /lesson\.suggestedQuestions/);
  assert.match(aiTa, /lesson\.aiTaResponses/);
  assert.match(aiTa, /預先撰寫的課程示範/);
  assert.doesNotMatch(aiTa, /fetch\(|openai|gemini|claude|apiKey|process\.env/i);
});

test("skill tree, practice lab and knowledge hub prototypes have routes and links", async () => {
  for (const route of ["src/app/ai-learning/skill-tree/page.tsx", "src/app/ai-learning/practice-lab/page.tsx", "src/app/ai-learning/knowledge-hub/page.tsx"]) assert.equal(await exists(route), true);
  assert.match(content, /aiLearningSkillTree/);
  assert.match(content, /knowledgeHubCategories/);
  assert.match(landing, /ai-learning\/skill-tree|LearningModuleCard/);
  assert.match(landing, /PracticeLabCard/);
  assert.match(landing, /KnowledgeHubPreview/);
});

test("AI Learning visual system is responsive, keyboard-aware and reduced-motion ready", () => {
  for (const selector of [".ai-learning-container", ".ai-learning-lesson-layout", ".ai-learning-lesson-nav", ".ai-learning-ta", ".ai-learning-module-grid", ".ai-learning-home-entry__link"]) assert.match(style, new RegExp(selector.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")));
  assert.match(style, /@media \(max-width:767px\)/);
  assert.match(style, /@media \(max-width:420px\)/);
  assert.match(style, /prefers-reduced-motion:reduce/);
  assert.match(style, /outline:2px solid var\(--ai-cyan\)/);
  assert.match(style, /grid-template-columns:14rem minmax\(0,1fr\) 13rem/);
});

test("static prototype has no auth, payment, database or real AI dependency", () => {
  const aiSources = `${landing}\n${classroom}\n${course}\n${lesson}\n${aiTa}`;
  assert.doesNotMatch(aiSources, /signIn|login|signup|checkout|payment|subscription|prisma|supabase/i);
  assert.doesNotMatch(aiSources, /openai|gemini|claude|apiKey|fetch\(/i);
  assert.match(`${landing}\n${hero}\n${aiTa}`, /static|STATIC/i);
});

test("Market Radar route remains separate while the test suite includes its regression coverage", async () => {
  assert.equal(await exists("src/app/market-radar/page.tsx"), true);
  assert.equal(await exists("src/components/MarketRadarPage.tsx"), true);
  assert.match(packageJson.scripts.test, /tests\/market-radar\.test\.mjs/);
  assert.match(packageJson.scripts.test, /tests\/ai-learning-station\.test\.mjs/);
});

test("all static routes are represented without server runtime requirements", () => {
  const routeSources = `${landing}\n${classroom}\n${course}\n${knowledgeHub}\n${skillTree}\n${practiceLab}\n${content}`;
  for (const route of ["/ai-learning/", "/ai-learning/classroom/", "/ai-learning/classroom/how-web-works/", "/ai-learning/knowledge-hub/", "/ai-learning/skill-tree/", "/ai-learning/practice-lab/"]) assert.match(routeSources, new RegExp(route.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")));
  assert.doesNotMatch(`${landing}\n${classroom}\n${course}\n${lesson}`, /dynamic = ["']force-dynamic["']|revalidate\s*:/);
});
