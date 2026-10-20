import type { IntroPlaybackState } from "@/lib/handbook-intro";

export function HandbookPlaybackFeedback({ state, onPlay, className, buttonClassName }: { state: IntroPlaybackState; onPlay: () => void; className?: string; buttonClassName?: string }) {
  return <div className={className} aria-live="polite" aria-atomic="true">
    {state === "blocked" ? <><p>瀏覽器尚未允許有聲播放。</p><button type="button" className={buttonClassName} onClick={onPlay}>點擊播放影片</button></> : state === "ended" ? <p>介紹結束，下一頁從六個圖解開始。</p> : state === "starting" ? <p>正在準備播放，可隨時開始閱讀。</p> : state === "error" ? <p>可關閉影片，或直接進入剪片說明書。</p> : <p>可使用原生控制項調整播放與音量。</p>}
  </div>;
}
