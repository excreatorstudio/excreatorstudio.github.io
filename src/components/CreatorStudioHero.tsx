import Image from "next/image";
import { AIVideoCenterSwitch } from "@/components/AIVideoCenterSwitch";
import { InteractiveGlassNavigator } from "@/components/InteractiveGlassNavigator";
import { PersonalBrandShowcaseFloat } from "@/components/PersonalBrandShowcaseFloat";
import { publicAssetPath } from "@/lib/paths";
import { HandbookEntry } from "@/components/editing-handbook/HandbookEntry";
import handbookStyles from "@/components/editing-handbook/editing-handbook.module.css";

export function CreatorStudioHero() {
  return (
    <section className="creator-hero" aria-labelledby="creator-studio-heading">
      <div className="creator-hero__aurora" aria-hidden="true" />
      <div className="creator-hero__grid" aria-hidden="true" />
      <div
        className="creator-hero__circuit-overlay"
        aria-hidden="true"
        style={{ backgroundImage: `url(${publicAssetPath("/images/creator-academy/hero-circuit-background.png")})` }}
      />
      <div className="creator-hero__readability-mask" aria-hidden="true" />
      <div className="creator-hero__circuit-nodes" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <div className={`creator-hero__inner ${handbookStyles.heroComposition}`}>
        <div className={`creator-hero__content ${handbookStyles.heroContent}`}>
          <p className="creator-hero__eyebrow">AI CREATIVE CENTER × CREATOR ACADEMY</p>
          <div className={handbookStyles.heroHeading}>
          <h1 id="creator-studio-heading" className="creator-hero__title" aria-label="E.X AI 創作中心 × 創作者學院">
            <span>E.X AI 創作中心</span>
            <span className={handbookStyles.heroAcademyRow}>
              <span className="creator-hero__title-accent">× 創作者學院</span>
              <HandbookEntry variant="hero" />
            </span>
          </h1>
          </div>
          <p className="creator-hero__description">整合 AI 創作、短影音製作與系統化學習的專業平台，陪伴從靈感到作品，持續創造影響力。</p>

          <div className="creator-search" role="search">
            <label className="sr-only" htmlFor="creator-site-search">搜尋課程、資源與創作主題</label>
            <svg aria-hidden="true" className="creator-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.3 4.3" /></svg>
            <input id="creator-site-search" type="search" placeholder="搜尋課程、資源與創作主題" />
            <span className="creator-search__status" aria-hidden="true">EXPLORE</span>
          </div>

          <p className="creator-hero__ticker" aria-label="AI、影音、創作者、課程、資源與生活管理分類">AI · VIDEO · CREATOR · COURSES · RESOURCES · HEALTH</p>
        </div>

        <div className="creator-hero__primary-entry"><AIVideoCenterSwitch mode="primary" /></div>
        <PersonalBrandShowcaseFloat />

        <div className="creator-hero__visual">
          <Image src={publicAssetPath("/images/creator-studio/hero-showcase-v1.png")} alt="AI 創作工作室的多螢幕監看牆、剪輯工作站與攝影機" fill priority sizes="(max-width: 899px) 70vw, 42vw" className="creator-hero__photo" />
          <div className="creator-hero__visual-tint" aria-hidden="true" />
          <div className="creator-hero__visual-frame" aria-hidden="true" />
          <div className="creator-hero__visual-label" aria-hidden="true"><span><i /> REC</span><b>AI CREATIVE ROOM</b></div>
          <InteractiveGlassNavigator />
        </div>
      </div>
    </section>
  );
}
