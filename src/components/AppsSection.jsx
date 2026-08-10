import { useLang } from "../content-and-translations.jsx";

export default function AppsSection() {
  const { t } = useLang();
  return (
    <section className="section section--alt" id="apps">
      <div className="wrap">
        <div className="sec-head">
          <p className="eyebrow reveal">{t.apps.label}</p>
          <h2 className="section__title reveal">{t.apps.title}</h2>
          <p className="section__note reveal">{t.apps.note}</p>
        </div>
        <div className="cards cards--3 apps">
          {t.apps.cards.map((a, i) => (
            <article className="appcard reveal" style={{ "--d": `${i * 0.08}s` }} key={i}>
              <div className="appcard__top">
                <span className="appcard__icon" aria-hidden="true">{a.name.charAt(0)}</span>
                <div>
                  <h3>{a.name}</h3>
                  <span className="appcard__tag">{a.tag}</span>
                </div>
              </div>
              <p>{a.desc}</p>
              <div className="appcard__meta">
                <span>★ {a.rating}</span>
                <span>{a.installs}</span>
              </div>
              <a href="#contact" className="appcard__store">{t.apps.store} →</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
