import { useLang } from "../content-and-translations.jsx";

export default function ServicesSection() {
  const { t } = useLang();
  return (
    <section className="section" id="services">
      <div className="wrap">
        <div className="sec-head">
          <p className="eyebrow reveal">{t.services.label}</p>
          <h2 className="section__title reveal">{t.services.title}</h2>
        </div>
        <div className="cards cards--3">
          {t.services.items.map((it, i) => (
            <article className="card reveal" style={{ "--d": `${i * 0.08}s` }} key={i}>
              <span className="card__icon">{it.icon}</span>
              <h3>{it.name}</h3>
              <p>{it.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
