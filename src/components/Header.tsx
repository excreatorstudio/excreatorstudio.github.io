"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UniverseHeader } from "./universe/UniverseHeader";

const EX_CREATOR_STUDIO_URL = "https://excreatorstudio.com/";

export function Header() {
  const pathname = usePathname();
  if (pathname === "/universe-preview" || pathname === "/universe-preview/") return <UniverseHeader />;
  return (
    <header className="creator-header">
      <div className="creator-header__inner">
        <a href={EX_CREATOR_STUDIO_URL} className="creator-brand" aria-label="前往 E.X 主站"><span className="creator-brand__mark">E.X</span><span className="creator-brand__name">CREATOR STUDIO</span></a>
        <nav aria-label="主要導覽" className="creator-header__nav">
          <Link href="/ai-tutorials">探索</Link>
          <Link href="/video-production">課程</Link>
          <Link href="/resources">資源</Link>
          <Link href="/about">關於</Link>
        </nav>
        <nav aria-label="產品化入口" className="creator-header__account">
          <Link href="/#membership">登入</Link>
          <Link href="/#membership">會員中心</Link>
          <Link href="/#membership">點數</Link>
          <Link href="/#membership" className="creator-header__subscribe">訂閱</Link>
        </nav>
        <details className="creator-mobile-nav">
          <summary aria-label="開啟主要導覽"><span /><span /><span /></summary>
          <nav aria-label="手機主要導覽" className="creator-mobile-nav__panel">
            <Link href="/ai-tutorials">探索</Link>
            <Link href="/video-production">課程</Link>
            <Link href="/resources">資源</Link>
            <Link href="/about">關於</Link>
            <span className="creator-mobile-nav__divider" aria-hidden="true" />
            <Link href="/#membership">登入</Link>
            <Link href="/#membership">會員中心</Link>
            <Link href="/#membership">點數</Link>
            <Link href="/#membership" className="creator-mobile-nav__subscribe">訂閱</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
