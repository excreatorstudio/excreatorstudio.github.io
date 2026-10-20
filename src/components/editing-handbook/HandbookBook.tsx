"use client";

import { useEffect, useRef, useState } from "react";
import { publicAssetPath } from "@/lib/paths";
import styles from "./editing-handbook.module.css";

export function HandbookBook({ priority = false, sizes = "(max-width: 639px) 256px, 512px", original = false }: { priority?: boolean; sizes?: string; original?: boolean }) {
  const [failed, setFailed] = useState(false);
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => { if (image.current?.complete && !image.current.naturalWidth) setFailed(true); }, []);

  return <span className={styles.book} data-handbook-book data-media-fallback={failed}>
    <span className={styles.bookHalo} aria-hidden="true" />
    {!failed ? <picture>
      {!original && <source type="image/webp" srcSet={[256, 512, 960].map(width => `${publicAssetPath(`/images/editing-handbook/book-${width}.webp`)} ${width}w`).join(", ")} sizes={sizes} />}
      {/* Approved local transparent derivatives; the owner source stays unchanged. */}
      <img ref={image} src={publicAssetPath(original ? "/images/editing-handbook/book-entry.png" : "/images/editing-handbook/book-512.webp")} width={original ? 1254 : 960} height={original ? 1254 : 960} alt="剪片說明書的藍色發光數位書" loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} onError={() => setFailed(true)} />
    </picture> : <span className={styles.bookFallback} role="img" aria-label="剪片說明書，書本圖片暫時無法載入"><b>剪片說明書</b><small>書本圖片暫時無法載入</small></span>}
  </span>;
}
