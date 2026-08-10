import { useEffect, useState } from "react";
import { useLang } from "../content-and-translations.jsx";
import AdharaLogoIcon from "./AdharaLogoIcon.jsx";

export default function HeaderBar() {
  const { t, lang, toggle } = useLang();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? "nav--solid" : ""}`}>
      <div className="wrap nav__inner">
        <a href="#top" className="nav__brand"><AdharaLogoIcon /></a>
        <nav className="nav__links">
          <a href="#services">{t.nav.services}</a>
          <a href="#apps">{t.nav.apps}</a>
          <a href="#why">{t.nav.why}</a>
          <a href="#about">{t.nav.about}</a>
        </nav>
        <div className="nav__actions">
          <button className="langtoggle" onClick={toggle} aria-label="Changer de langue">
            <span className={lang === "fr" ? "on" : ""}>FR</span>
            <span className="langtoggle__sep">/</span>
            <span className={lang === "en" ? "on" : ""}>EN</span>
          </button>
          <a href="#contact" className="btn btn--primary nav__cta">{t.nav.cta}</a>
        </div>
      </div>
    </header>
  );
}
