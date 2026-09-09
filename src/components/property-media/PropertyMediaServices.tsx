import { propertyMediaProcess, propertyMediaServices } from "@/data/property-media-portfolio";
import styles from "./property-media.module.css";

export function PropertyMediaServices() {
  return (
    <>
      <section id="property-media-services" className={styles.services} aria-labelledby="services-title">
        <div className={styles.sectionIntro}><p className={styles.kicker}>SERVICE CAPABILITIES</p><h2 id="services-title">為空間選擇合適的觀看方式。</h2><p>每一項服務保留在可替換的資料層，之後可持續補入經確認的作品與案例。</p></div>
        <div className={styles.serviceChapters}>
          {propertyMediaServices.map((service, index) => <article className={styles.serviceChapter} key={service.english}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{service.title}<small>{service.english}</small></h3><p>{service.value}</p></div><em>{service.useCase}</em></article>)}
        </div>
      </section>
      <section className={styles.process} aria-labelledby="process-title">
        <div className={styles.sectionIntro}><p className={styles.kicker}>HOW IT WORKS</p><h2 id="process-title">從理解空間開始。</h2></div>
        <ol>{propertyMediaProcess.map((item) => <li key={item.step}><span>{item.step}</span><h3>{item.title}</h3><p>{item.description}</p></li>)}</ol>
      </section>
    </>
  );
}
