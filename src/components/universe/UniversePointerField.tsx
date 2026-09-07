import type { ReactNode, RefObject } from "react";
import styles from "@/app/universe-preview/universe-preview.module.css";

type PointerFieldProps = {
  sceneRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
};

export function UniversePointerField({ sceneRef, children }: PointerFieldProps) {
  return (
    <div
      ref={sceneRef}
      className={styles.pointerField}
      data-testid="universe-pointer-field"
    >
      {children}
    </div>
  );
}
