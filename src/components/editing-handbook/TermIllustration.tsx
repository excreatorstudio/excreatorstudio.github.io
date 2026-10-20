import { useId } from "react";
import type { HandbookTermId } from "@/data/editing-handbook";
import styles from "./editing-handbook.module.css";

function Person({ x = 0, y = 0, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}><circle cx="0" cy="-50" r="23" fill="var(--hb-figure)" /><path d="M-44 90v-71c0-25 19-39 44-39s44 14 44 39v71" fill="var(--hb-figure)" /><path d="M-22 90v55m44-55v55" stroke="var(--hb-figure)" strokeWidth="24" strokeLinecap="round" /></g>;
}

function Frame({ x, y, label, children, width = 190, height = 190 }: { x: number; y: number; label: string; children?: React.ReactNode; width?: number; height?: number }) {
  const clipId = `${useId().replace(/:/g, "")}-image`;
  return <g transform={`translate(${x} ${y})`}><defs><clipPath id={clipId}><rect width={width} height={height} rx="14" /></clipPath></defs><rect width={width} height={height} rx="14" fill="var(--hb-diagram-surface)" stroke="var(--hb-diagram-line)" /><path d={`M0 ${height * .7}h${width}`} stroke="var(--hb-diagram-line)" strokeDasharray="4 7" /><g clipPath={`url(#${clipId})`}>{children}</g><text x={width / 2} y={height + 29} textAnchor="middle">{label}</text></g>;
}

export function TermIllustration({ term }: { term: HandbookTermId }) {
  const unique = useId().replace(/:/g, "");
  const titleId = `${unique}-title`;
  const labels: Record<HandbookTermId, string> = {
    "shot-size": "同一人物由遠景、中景到特寫，主體在畫面中逐漸變大",
    "camera-movement": "推近示意，攝影機沿箭頭向人物移動，而不是只轉動方向",
    "transition": "直接切換與溶接的靜態比較，溶接包含前後畫面重疊",
    "b-roll": "人物敘事搭配手沖咖啡與咖啡杯細節的輔助畫面",
    "jump-cut": "相近構圖刪除停頓後相接，人物姿態出現可見跳躍",
    "timeline": "同一時間軸上的影片、字幕、聲音三條軌道",
  };

  return <svg className={styles.illustration} viewBox="0 0 720 350" role="img" aria-labelledby={titleId}>
    <title id={titleId}>{labels[term]}</title>
    {term === "shot-size" && <>
      <defs>{[0, 1, 2].map(index => <clipPath id={`${unique}-frame-${index}`} key={index}><rect x={42 + index * 222} y="45" width="190" height="190" rx="14" /></clipPath>)}</defs>
      {[["遠景", .55, 150], ["中景", 1.05, 200], ["特寫", 2.65, 300]].map(([label, scale, y], index) => <g key={String(label)}><Frame x={42 + index * 222} y={45} label={String(label)} /><g clipPath={`url(#${unique}-frame-${index})`}><Person x={137 + index * 222} y={Number(y)} scale={Number(scale)} /></g></g>)}
      <path d="M108 303h493m-12-7 12 7-12 7" stroke="var(--hb-figure)" fill="none" strokeWidth="2" /><text x="360" y="330" textAnchor="middle">主體佔比逐漸增加</text>
    </>}
    {term === "camera-movement" && <>
      <Frame x={340} y={40} width={280} height={215} label="主體"><Person x={140} y={120} scale={.65} /></Frame>
      <g stroke="var(--hb-figure)" strokeWidth="3" fill="var(--hb-diagram-surface)"><rect x="65" y="130" width="80" height="55" rx="9" /><path d="m145 145 26-12v49l-26-12M105 187v45m-20 0h40" /><rect x="225" y="130" width="80" height="55" rx="9" opacity=".4" /><path d="m305 145 26-12v49l-26-12" opacity=".4" /></g>
      <path d="M114 283h190m-17-10 17 10-17 10" fill="none" stroke="var(--hb-figure)" strokeWidth="4" /><text x="210" y="323" textAnchor="middle">攝影機向前推近</text>
    </>}
    {term === "transition" && <>
      <text x="50" y="62">直接切換</text><rect x="50" y="85" width="180" height="75" rx="10" fill="var(--hb-figure)" opacity=".7" /><text className={styles.onColor} x="140" y="130" textAnchor="middle">畫面 A</text><path d="M250 122h65m-10-7 10 7-10 7" stroke="var(--hb-figure)" strokeWidth="2" /><rect x="338" y="85" width="180" height="75" rx="10" fill="var(--hb-secondary)" /><text className={styles.onColor} x="428" y="130" textAnchor="middle">畫面 B</text>
      <text x="50" y="222">溶接</text><rect x="50" y="245" width="180" height="75" rx="10" fill="var(--hb-figure)" opacity=".7" /><text className={styles.onColor} x="140" y="290" textAnchor="middle">A</text><g opacity=".72"><rect x="280" y="245" width="140" height="75" rx="10" fill="var(--hb-figure)" /><rect x="340" y="245" width="140" height="75" rx="10" fill="var(--hb-secondary)" /></g><text x="380" y="233" textAnchor="middle">短暫重疊</text><rect x="530" y="245" width="140" height="75" rx="10" fill="var(--hb-secondary)" /><text className={styles.onColor} x="600" y="290" textAnchor="middle">B</text>
    </>}
    {term === "b-roll" && <>
      <Frame x={45} y={45} width={285} height={220} label="主敘事"><Person x={145} y={155} scale={.7} /><path d="M220 87h40m-40 17h55m-55 17h34" stroke="var(--hb-secondary)" strokeWidth="5" strokeLinecap="round" /></Frame>
      <Frame x={385} y={45} width={130} height={220} label="製作細節"><path d="m27 70 65 20-13 36-65-20Z" fill="var(--hb-secondary)" /><path d="m69 122-8 35m-20 0h43l-7 30H48Z" fill="none" stroke="var(--hb-figure)" strokeWidth="4" /></Frame>
      <Frame x={542} y={45} width={130} height={220} label="物件細節"><path d="M26 93h65v56a24 24 0 0 1-24 24H50a24 24 0 0 1-24-24Z" fill="var(--hb-figure)" /><path d="M91 103h13a15 15 0 0 1 0 30H91M30 190h62" stroke="var(--hb-secondary)" fill="none" strokeWidth="5" /></Frame>
    </>}
    {term === "jump-cut" && <>
      <Frame x={60} y={25} width={230} height={170} label="上一句"><Person x={110} y={113} scale={.55} /></Frame><Frame x={430} y={25} width={230} height={170} label="下一句"><Person x={128} y={103} scale={.55} /><path d="m145 95 28-20" stroke="var(--hb-figure)" strokeWidth="9" strokeLinecap="round" /></Frame>
      <path d="M320 108h80m-12-8 12 8-12 8" stroke="var(--hb-figure)" fill="none" strokeWidth="3" />
      <rect x="60" y="270" width="230" height="36" rx="7" fill="var(--hb-figure)" opacity=".8" /><rect x="430" y="270" width="230" height="36" rx="7" fill="var(--hb-secondary)" /><rect x="315" y="260" width="90" height="55" rx="8" fill="none" stroke="var(--hb-diagram-line)" strokeDasharray="5 5" /><path d="m335 270 50 35m0-35-50 35" stroke="var(--hb-warm)" strokeWidth="3" /><text x="360" y="341" textAnchor="middle">移除停頓，注意動作的跳躍</text>
    </>}
    {term === "timeline" && <>
      <text x="145" y="45">00:00</text><text x="560" y="45">00:10</text><path d="M145 60h505M145 53v14m140-14v14m150-14v14m70-14v14m145-14v14" stroke="var(--hb-diagram-line)" />
      <text x="40" y="120">影片</text><text x="40" y="200">字幕</text><text x="40" y="280">聲音</text>
      <rect x="145" y="85" width="505" height="56" rx="8" fill="var(--hb-diagram-surface)" /><rect x="151" y="91" width="175" height="44" rx="5" fill="var(--hb-figure)" opacity=".8" /><rect x="333" y="91" width="160" height="44" rx="5" fill="var(--hb-secondary)" /><rect x="500" y="91" width="144" height="44" rx="5" fill="var(--hb-figure)" opacity=".5" />
      <rect x="145" y="165" width="505" height="56" rx="8" fill="var(--hb-diagram-surface)" /><rect x="185" y="179" width="130" height="28" rx="5" fill="var(--hb-secondary)" /><rect x="350" y="179" width="170" height="28" rx="5" fill="var(--hb-secondary)" />
      <rect x="145" y="245" width="505" height="56" rx="8" fill="var(--hb-diagram-surface)" /><path d="m160 273 14-5 12 17 13-25 13 11 13-18 13 30 13-7 13 15 13-25 13 11 13-20 13 25 13-10 13 18 13-24 13 10 13-6 13 16 13-29 13 15 13-6 13 18 13-23 13 7 13-14 13 22 13-10 13 16 13-24 13 11 13-9 13 16" fill="none" stroke="var(--hb-figure)" strokeWidth="3" />
      <path d="M380 60v263" stroke="var(--hb-warm)" strokeWidth="2" /><circle cx="380" cy="60" r="5" fill="var(--hb-warm)" />
    </>}
  </svg>;
}
