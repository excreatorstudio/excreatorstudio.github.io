"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState, type ComponentType, type CSSProperties, type PointerEvent } from "react";
import type { ModelAction, FloorPlanModelProps } from "./FloorPlanModel";
import { clampFloorPlanView, dragFloorPlanView, INITIAL_FLOOR_PLAN_VIEW, type FloorPlanView } from "./floor-plan-state";
import styles from "./floor-plan-showcase.module.css";

const rooms = ["Living Room", "Master Bedroom", "Bedroom", "Kitchen", "Bath"] as const;
const source = "/images/floor-plan-showcase.png";
/** Image mode deliberately provides bounded perspective, not model geometry or a full rotation. */
export function FloorPlanShowcase({ mode = "image" }: { mode?: "image" | "model" }) {
  const [Model, setModel] = useState<ComponentType<FloorPlanModelProps> | null>(null);
  const [modelFailed, setModelFailed] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [action, setAction] = useState<ModelAction>({ kind: "reset", sequence: 0 });
  const modelMode = mode === "model" && !modelFailed;
  const onModelReady = useCallback(() => setModelReady(true), []);
  const onModelError = useCallback(() => { setModelFailed(true); setModelReady(false); }, []);
  const [view, setView] = useState<FloorPlanView>(INITIAL_FLOOR_PLAN_VIEW);
  const [room, setRoom] = useState<string>(rooms[0]);
  const [entered, setEntered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const expandButton = useRef<HTMLButtonElement>(null);
  const gesture = useRef<{ id: number; x: number; y: number; view: FloorPlanView } | null>(null);
  const id = useId();
  useEffect(() => {
    if (!entered || !modelMode) return;
    let cancelled = false;
    let requested = false;
    const load = () => {
      if (requested || root.current?.closest("[inert]")) return;
      requested = true;
      // Client-only import: no WebGL bundle or GLB request during the Intro.
      import("./FloorPlanModel").then(loadedModule => { if (!cancelled) setModel(() => loadedModule.default); }).catch(() => { if (!cancelled) onModelError(); });
    };
    const observer = new MutationObserver(load);
    observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["inert"] });
    load();
    return () => { cancelled = true; observer.disconnect(); };
  }, [entered, modelMode, onModelError]);
  const command = (kind: ModelAction["kind"]) => setAction(current => ({ kind, sequence: current.sequence + 1 }));
  const expand = (value: boolean) => { setModelReady(false); setExpanded(value); };
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { setReduced(query.matches); };
    update(); query.addEventListener("change", update);
    const observer = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting); if (entry.isIntersecting) setEntered(true);
    }, { threshold: 0.12 }) : null;
    if (observer && root.current) observer.observe(root.current);
    else { setEntered(true); setVisible(true); }
    return () => { query.removeEventListener("change", update); observer?.disconnect(); };
  }, []);
  useEffect(() => {
    if (!expanded || !dialog.current) return;
    const modal = dialog.current;
    const restoreFocus = expandButton.current;
    const overflow = document.body.style.overflow;
    modal.showModal(); document.body.style.overflow = "hidden";
    return () => { modal.close(); document.body.style.overflow = overflow; restoreFocus?.focus(); };
  }, [expanded]);
  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (gesture.current?.id !== event.pointerId) return;
    gesture.current = null; setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const preset = (yaw: number) => setView((current) => clampFloorPlanView({ ...current, yaw, pitch: 0 }));
  const zoom = (amount: number) => setView((current) => clampFloorPlanView({ ...current, zoom: current.zoom + amount }));
  const reset = () => setView(INITIAL_FLOOR_PLAN_VIEW);
  const renderViewer = (enlarged: boolean) => (
    <div className={styles.viewer} data-mode={modelMode ? "model" : "image"} data-model-ready={modelReady} data-dragging={dragging} data-reduced-motion={reduced} data-visible={enlarged || (visible && !expanded)}>
      <header className={styles.header}><div><span>360° VIEW</span><small>{modelMode ? "Interactive 3D Floor Plan" : "Interactive Floor Plan · 2.5D"}</small></div>
        {enlarged ? <button type="button" onClick={() => expand(false)} aria-label="關閉放大格局">關閉</button> : <button ref={expandButton} type="button" onClick={() => expand(true)} aria-label="放大格局檢視">放大</button>}
      </header>
      {modelMode ? <div className={styles.modelStage}>
        <div className={styles.modelPoster} data-hidden={modelReady && (enlarged || !expanded)}><Image src={source} alt="住宅格局載入預覽" width={1448} height={1086} unoptimized loading="lazy" className={styles.plan} /></div>
        {Model && (enlarged || !expanded) ? <Model active={enlarged || visible} reduced={reduced} action={action} onReady={onModelReady} onError={onModelError} /> : null}
        {!modelReady ? <span className={styles.modelLoading} role="status">空間模型準備中</span> : null}
      </div> : <div className={styles.stage} onPointerLeave={(event) => {
        for (const name of ["--hover-x", "--hover-y", "--hover-pitch", "--hover-yaw"]) event.currentTarget.style.removeProperty(name);
      }} onPointerDown={(event) => {
        if (reduced || event.pointerType === "touch" || !event.isPrimary || event.button !== 0) return;
        gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, view };
        event.currentTarget.setPointerCapture(event.pointerId); setDragging(true);
      }} onPointerMove={(event) => {
        const start = gesture.current;
        if (reduced || event.pointerType === "touch") return;
        if (!start) {
          if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
          const y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
          event.currentTarget.style.setProperty("--hover-x", `${x * 4}px`);
          event.currentTarget.style.setProperty("--hover-y", `${y * 3}px`);
          event.currentTarget.style.setProperty("--hover-pitch", `${-y * 2}deg`);
          event.currentTarget.style.setProperty("--hover-yaw", `${x * 4}deg`);
          return;
        }
        if (start.id !== event.pointerId) return;
        setView(dragFloorPlanView(start.view, event.clientX - start.x, event.clientY - start.y));
      }} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={() => { gesture.current = null; setDragging(false); }}>
        <div className={styles.guide} aria-hidden="true" />
        <div className={styles.base} aria-hidden="true" />
        <div className={styles.contactShadow} aria-hidden="true" style={{ "--shadow-x": `${view.yaw * -.8}px`, "--shadow-y": `${view.pitch * .6}px` } as CSSProperties} />
        <div className={styles.breath}><div className={styles.imagePlane} style={{ "--plan-x": `${reduced ? 0 : view.pitch}deg`, "--plan-y": `${reduced ? 0 : view.yaw}deg`, "--plan-zoom": view.zoom } as CSSProperties}>
          <Image src={source} alt="住宅格局平面展示，包含客廳、臥室、廚房與衛浴" width={1448} height={1086} unoptimized loading="lazy" draggable={false} className={styles.plan} />
        </div></div>
      </div>}
      <div className={styles.controls} aria-label="格局檢視控制">
        <button type="button" onClick={() => modelMode ? command("left") : preset(-5)} aria-label="Rotate Left：向左旋轉" disabled={modelMode ? !modelReady : reduced}>←</button>
        <button type="button" onClick={() => modelMode ? command("reset") : reset()} aria-label="Center / Reset View：重設視角及縮放">置中</button>
        <button type="button" onClick={() => modelMode ? command("right") : preset(5)} aria-label="Rotate Right：向右旋轉" disabled={modelMode ? !modelReady : reduced}>→</button>
        <span className={styles.controlDivider} aria-hidden="true" />
        <button type="button" onClick={() => modelMode ? command("out") : zoom(-0.02)} disabled={modelMode ? !modelReady : view.zoom <= 0.92001} aria-label="縮小格局">−</button>
        {!modelMode ? <output aria-label="縮放比例">{Math.round(view.zoom * 100)}%</output> : null}
        <button type="button" onClick={() => modelMode ? command("in") : zoom(0.02)} disabled={modelMode ? !modelReady : view.zoom >= 1.07999} aria-label="放大格局">+</button>
      </div>
      <div className={styles.rooms} aria-label="空間類型（尚未提供定位）">{rooms.map((name) => <button type="button" key={name} disabled={modelMode} aria-pressed={room === name} onClick={() => setRoom(name)}>{name}</button>)}</div>
      <p className={styles.note}>{modelMode ? "視覺化 3D 重建，非建築測量／施工模型。房間定位尚未開放。" : "靜態影像・2.5D 微角度檢視，非完整 3D 模型。空間按鈕僅標記類型，定位功能尚未開放。"}</p>
      <span className={styles.hint}>{modelMode ? "DRAG TO ORBIT · 拖曳旋轉 / 雙指縮放" : "DRAG TO EXPLORE · 手機請使用下方控制"}</span>
    </div>
  );
  return <div ref={root} className={styles.showcase} data-entered={entered}>
    {renderViewer(false)}
    {expanded ? <dialog ref={dialog} className={styles.dialog} aria-labelledby={`${id}-title`} onCancel={() => expand(false)} onClose={() => expand(false)} onClick={(event) => { if (event.target === event.currentTarget) expand(false); }}>
      <div className={styles.dialogBody}><h3 id={`${id}-title`}>{modelMode ? "Interactive 3D Floor Plan" : "Interactive 2.5D Floor Plan"}</h3>{renderViewer(true)}</div>
    </dialog> : null}
  </div>;
}
