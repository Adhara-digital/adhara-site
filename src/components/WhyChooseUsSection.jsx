import { useLang } from "../content-and-translations.jsx";

export default function WhyChooseUsSection() {
  const { t } = useLang();
  return (
    <section className="section" id="why">
      <div className="wrap">
        <div className="sec-head">
          <p className="eyebrow reveal">{t.why.label}</p>
          <h2 className="section__title reveal">{t.why.title}</h2>
        </div>
        <div className="why">
          {t.why.items.map((it, i) => (
            <article className="why__item reveal" style={{ "--d": `${i * 0.08}s` }} key={i}>
              <span className="why__k">{it.k}</span>
              <div>
                <h3>{it.name}</h3>
                <p>{it.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
