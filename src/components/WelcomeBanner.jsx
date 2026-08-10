import { useLang } from "../content-and-translations.jsx";

export default function WelcomeBanner() {
  const { t } = useLang();
  return (
    <section className="hero" id="top">
      <div className="wrap hero__inner">
        <p className="eyebrow reveal">{t.hero.eyebrow}</p>
        <h1 className="hero__title">
          {t.hero.title.map((line, i) => (
            <span key={i} className="reveal" style={{ "--d": `${0.08 * i}s` }}>
              {i === 1 ? <em className="grad">{line}</em> : line}{" "}
            </span>
          ))}
        </h1>
        <p className="hero__lead reveal" style={{ "--d": ".28s" }}>{t.hero.lead}</p>
        <div className="hero__cta reveal" style={{ "--d": ".38s" }}>
          <a href="#apps" className="btn btn--primary">{t.hero.ctaPrimary}</a>
          <a href="#contact" className="btn btn--ghost">{t.hero.ctaSecondary}</a>
        </div>
      </div>
      <div className="hero__scroll" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}
