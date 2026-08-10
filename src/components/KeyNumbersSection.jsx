import { useLang } from "../content-and-translations.jsx";

export default function KeyNumbersSection() {
  const { t } = useLang();
  return (
    <section className="section section--alt stats" id="stats">
      <div className="wrap">
        <div className="sec-head">
          <p className="eyebrow reveal">{t.stats.label}</p>
        </div>
        <div className="stats__grid">
          {t.stats.items.map((s, i) => (
            <div className="stat reveal" style={{ "--d": `${i * 0.07}s` }} key={i}>
              <span className="stat__value grad">{s.value}</span>
              <span className="stat__label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
