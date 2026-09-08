# Phase 2D — Navigation map

Audit date: 2026-09-08. Scope: `/universe-preview/`; the production homepage and its header remain unchanged.

| Label | English Label | Navigation Level | Destination | Current Status | Recommended Status |
|---|---|---|---|---|---|
| E.X Creator Studio | Creator Studio | GLOBAL | `/` | LIVE | RENAME to E.X Creator Universe in preview; retain master-home link |
| 探索 | Explore | GLOBAL | `/ai-tutorials/` | LIVE | REMOVE from preview header; product content belongs under Create |
| 課程 | Courses | GLOBAL | `/video-production/` | LIVE route, placeholder content | REMOVE from preview header |
| 資源 | Resources | GLOBAL | `/resources/` | LIVE route | REMOVE from preview header |
| 關於 | About | UTILITY | `/about/` | LIVE | RENAME 關於 E.X |
| 登入／會員中心／點數／訂閱 | Account | ACCOUNT | `/#membership` | PLANNED, shared anchor not a platform account workflow | REMOVE from preview header; Market Radar-specific auth stays unchanged |
| 宇宙入口 | Universe entrance | UTILITY | `/universe-preview/` | LIVE | LIVE |
| 創作 | Create | PRIMARY GALAXY | `/creator-academy/` | Old `/video-production/` placeholder | LIVE, use existing course catalogue |
| 知識 | Knowledge | PRIMARY GALAXY | `/ai-learning/` | LIVE | LIVE |
| 語言 | Language | PRIMARY GALAXY | `#language-destinations` | Old Japanese-only destination | LIVE local disclosure; choose a language before navigating |
| 洞察 | Insight | PRIMARY GALAXY | `/market-radar/` | LIVE | LIVE |
| 開始探索 | Start Exploring | UTILITY | Focus Knowledge inside current scene | PLANNED | LIVE, single primary CTA |
| AI 影音 | AI Video | SECONDARY DESTINATION | `/creator-academy/ai-visual-creation/yuni-ai-video-motion-basics/` | LIVE | LIVE, Create |
| 攝影構圖 | Photography | SECONDARY DESTINATION | `/creator-academy/photography-composition/yuni-composition-basics/` | LIVE | LIVE, Create |
| 創作資源 | Creative Resources | SECONDARY DESTINATION | `/creator-academy/resources/` | LIVE | LIVE, Create |
| 教室 | Classroom | SECONDARY DESTINATION | `/ai-learning/classroom/` | LIVE | LIVE, Knowledge |
| 實作練習 | Practice Lab | SECONDARY DESTINATION | `/ai-learning/practice-lab/` | LIVE prototype | LIVE with existing prototype disclosure |
| 知識庫 | Knowledge Hub | SECONDARY DESTINATION | `/ai-learning/knowledge-hub/` | LIVE prototype | LIVE with existing prototype disclosure |
| 英文學習 | English | SECONDARY DESTINATION | `/english-learning/` | LIVE local landing | LIVE, Language |
| 日文學習 | Japanese | SECONDARY DESTINATION | `/japanese-learning/` | LIVE local landing | LIVE, Language |
| 房市快報 | Market Radar | SECONDARY DESTINATION | `/market-radar/` | LIVE | LIVE; same-world main action alias, not a second product owner |
| Auto Editing / Creative Tools | — | SECONDARY DESTINATION | none | PLANNED | COMING SOON; omitted from interactive links |
| Research / Data | — | SECONDARY DESTINATION | none | PLANNED | COMING SOON; omitted |
| Realty | Realty Operations | SECONDARY DESTINATION | separate product | LIVE elsewhere | PLANNED relationship; do not force into Insight |

## Language domain audit

`english.excreatorstudio.com`, `jp.excreatorstudio.com`, and `kana.excreatorstudio.com` were supplied as candidate/current domains. Live inspection could not confirm all three during this audit. Local language landings exist, but `learning-apps.ts` still contains legacy external URLs. No domain consolidation or shared business data is changed here. Use the two existing local landing routes until domain ownership/content acceptance is confirmed. Do not add a third Japanese link based only on the hostname.

## Interaction and ownership

Galaxy is primary product navigation. Header contains utility links only. Secondary links belong to exactly one Galaxy; the Insight main/secondary alias is intentionally the same product. Desktop hover and keyboard focus reveal destinations. First touch focuses; then a destination or a second main-link tap navigates. Language main action stays in-place to reveal its two choices. No nested anchors, false login links, new auth, or invented product routes.
