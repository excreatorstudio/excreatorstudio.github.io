import Link from "next/link";

const editingAcademyTags = ["免費學習", "剪輯實作", "AI 影片"] as const;

export function EditingAcademyEntry() {
  return (
    <section
      aria-labelledby="editing-academy-entry-title"
      className="mt-7 overflow-hidden rounded-[1.6rem] border border-cyan-300/20 bg-[radial-gradient(circle_at_12%_8%,rgba(34,211,238,0.15),transparent_34%),linear-gradient(135deg,rgba(10,27,58,0.9),rgba(12,12,42,0.82))] p-4 shadow-[0_24px_70px_rgba(5,6,29,0.24)] sm:mt-8 sm:p-6 lg:p-7"
    >
      <div className="grid min-w-0 gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-10">
        <div
          aria-label="剪輯流程視覺示意：素材、剪輯、字幕與音樂"
          className="relative flex min-h-[15rem] min-w-0 flex-col justify-between overflow-hidden rounded-[1.2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(10,24,48,0.96),rgba(10,14,31,0.94))] p-4 sm:min-h-[18rem] sm:p-6 lg:min-h-[20rem]"
          role="img"
        >
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-14 h-48 w-48 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="relative flex items-center justify-between gap-3">
            <span className="text-[0.62rem] font-semibold tracking-[0.2em] text-cyan-100/70 sm:text-xs">EX EDITING ACADEMY</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.62rem] tracking-[0.12em] text-slate-300 sm:text-[0.68rem]">剪輯流程示意</span>
          </div>

          <div aria-hidden="true" className="relative my-5 grid grid-cols-[auto_1fr] items-center gap-3 sm:gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-200/20 bg-cyan-200/[0.08] text-cyan-100 sm:h-[4.5rem] sm:w-[4.5rem]">
              <svg viewBox="0 0 40 40" fill="none" className="h-7 w-7 sm:h-9 sm:w-9" aria-hidden="true">
                <path d="M7 11.5h26v17H7z" stroke="currentColor" strokeWidth="1.6" />
                <path d="m17 15.5 8 4.5-8 4.5v-9Z" fill="currentColor" />
                <path d="M11 7.5h18M11 32.5h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[0.62rem] font-medium tracking-[0.16em] text-slate-400 sm:text-xs">FROM CLIPS TO STORY</p>
              <p className="mt-1 text-sm font-semibold text-white sm:text-lg">素材 → 剪輯 → 字幕 → 音樂</p>
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">四個清楚步驟，完成第一支短影音</p>
            </div>
          </div>

          <div aria-hidden="true" className="relative space-y-2.5">
            <div className="flex items-center gap-2 text-[0.56rem] font-semibold tracking-[0.12em] text-slate-500 sm:text-[0.62rem]">
              <span className="w-8 shrink-0">VIDEO</span>
              <div className="flex h-7 min-w-0 flex-1 gap-1.5 overflow-hidden rounded-md border border-white/[0.06] bg-slate-950/50 p-1">
                <span className="w-[30%] shrink-0 rounded-sm bg-cyan-300/30" />
                <span className="w-[19%] shrink-0 rounded-sm bg-sky-200/25" />
                <span className="w-[27%] shrink-0 rounded-sm bg-cyan-200/20" />
                <span className="w-[16%] shrink-0 rounded-sm bg-sky-300/30" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-[0.56rem] font-semibold tracking-[0.12em] text-slate-500 sm:text-[0.62rem]">
              <span className="w-8 shrink-0">TEXT</span>
              <div className="h-5 min-w-0 flex-1 overflow-hidden rounded-md border border-violet-200/10 bg-slate-950/50 p-1">
                <span className="block h-full w-[38%] rounded-sm bg-violet-300/25" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-[0.56rem] font-semibold tracking-[0.12em] text-slate-500 sm:text-[0.62rem]">
              <span className="w-8 shrink-0">AUDIO</span>
              <div className="flex h-5 min-w-0 flex-1 items-center gap-[3px] overflow-hidden rounded-md border border-emerald-200/10 bg-slate-950/50 px-1.5">
                <span className="h-1/3 w-1 rounded-full bg-emerald-200/40" />
                <span className="h-2/3 w-1 rounded-full bg-emerald-200/50" />
                <span className="h-full w-1 rounded-full bg-emerald-200/35" />
                <span className="h-1/2 w-1 rounded-full bg-emerald-200/50" />
                <span className="h-3/4 w-1 rounded-full bg-emerald-200/35" />
                <span className="h-1/3 w-1 rounded-full bg-emerald-200/55" />
                <span className="h-full w-1 rounded-full bg-emerald-200/35" />
                <span className="h-1/2 w-1 rounded-full bg-emerald-200/50" />
                <span className="h-2/3 w-1 rounded-full bg-emerald-200/40" />
                <span className="h-1/3 w-1 rounded-full bg-emerald-200/55" />
                <span className="h-full w-1 rounded-full bg-emerald-200/35" />
                <span className="h-1/2 w-1 rounded-full bg-emerald-200/50" />
                <span className="h-3/4 w-1 rounded-full bg-emerald-200/40" />
                <span className="h-1/3 w-1 rounded-full bg-emerald-200/55" />
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 px-1 pb-1 sm:px-2 lg:py-4">
          <p className="eyebrow text-cyan-100/75">EX EDITING ACADEMY</p>
          <h2 id="editing-academy-entry-title" className="mt-3 text-[1.7rem] font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-[2.15rem]">剪輯實戰學院</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300 sm:mt-4 sm:text-base">
            從第一支短影音開始，<br className="hidden sm:block" />透過圖像步驟與實際練習，<br className="hidden sm:block" />逐步掌握影片剪輯。
          </p>
          <ul aria-label="學院內容" className="mt-4 flex flex-wrap gap-2">
            {editingAcademyTags.map((tag) => (
              <li key={tag} className="rounded-full border border-cyan-100/15 bg-cyan-100/[0.06] px-3 py-1.5 text-xs font-medium text-cyan-50/90">{tag}</li>
            ))}
          </ul>
          <Link
            href="/ex-ai/editing/"
            className="mt-5 inline-flex min-h-12 max-w-full items-center justify-center rounded-full border border-cyan-200/35 bg-cyan-200/15 px-5 py-3 text-sm font-bold text-cyan-50 transition duration-200 hover:border-cyan-100/70 hover:bg-cyan-200 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-100 motion-reduce:transition-none sm:mt-6 sm:px-6"
          >
            進入剪輯學院 →
          </Link>
        </div>
      </div>
    </section>
  );
}
