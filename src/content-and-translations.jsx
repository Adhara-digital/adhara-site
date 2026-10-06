import { createContext, useContext, useEffect, useState } from "react";

/* ============================================================
   Contenu bilingue FR / EN — une seule source de vérité.
   Pour éditer le site : modifier les textes ici.
   ============================================================ */
export const CONTENT = {
  fr: {
    nav: { services: "Services", apps: "Applications", why: "Pourquoi nous", about: "À propos", contact: "Contact", cta: "Nous contacter" },
    hero: {
      eyebrow: "Studio high-tech · logiciels & applications",
      title: ["Nous concevons", "des applications", "qui vont vite."],
      // Slogan à définir plus tard — accroche provisoire
      lead: "Adhara est un jeune studio qui crée des logiciels et des applications mobiles pour le monde entier. De l'idée au Play Store, avec audace.",
      ctaPrimary: "Découvrir nos apps",
      ctaSecondary: "Démarrer un projet"
    },
    services: {
      label: "Ce que nous faisons",
      title: "Trois savoir-faire, un seul niveau d'exigence.",
      items: [
        { icon: "▲", name: "Applications mobiles", desc: "Des apps Android (et iOS) publiées sur les stores, pensées pour l'échelle mondiale et des millions d'utilisateurs." },
        { icon: "◆", name: "Logiciels sur mesure", desc: "Des outils et plateformes web robustes, taillés pour vos besoins métier, du prototype à la production." },
        { icon: "●", name: "Services d'automatisation", desc: "Des mini-agents ultra ciblés qui prennent en charge vos tâches répétitives, pour vous rendre du temps et de la précision." }
      ]
    },
    apps: {
      label: "Notre produit",
      title: "Le premier d'une série.",
      note: "",
      cards: [
        { name: "Proserpine", tag: "Écologie · Scan", desc: "Triez vos déchets en un scan. Première application du studio, actuellement en développement.", status: "En développement" }
      ],
      store: "En savoir plus"
    },
    why: {
      label: "Pourquoi Adhara",
      title: "Jeunes, rapides, sans compromis.",
      items: [
        { k: "01", name: "Jeunesse & dynamisme", desc: "Une équipe qui vit avec son temps, à l'affût des dernières technologies et tendances d'usage." },
        { k: "02", name: "Portée internationale", desc: "Nos apps parlent à tout le monde. On pense multi-langues, multi-cultures, dès le premier écran." },
        { k: "03", name: "Qualité produit", desc: "Du code propre, des interfaces soignées, des mises à jour régulières. La qualité n'est pas une option." }
      ]
    },
    /* Section « En chiffres » retirée le 6 octobre 2026 : les valeurs
       affichées (1,7 M+ téléchargements, 4.8 de note, 40+ pays, 3 apps
       publiées) étaient inventées. Elles reviendront quand il y aura
       des chiffres réels à montrer. */
    about: {
      label: "À propos",
      title: "Une étoile montante\ndu logiciel.",
      body: [
        "Adhara — comme l'étoile — est né d'une conviction simple : le logiciel de qualité ne devrait pas être réservé aux grands groupes.",
        "Nous sommes un studio jeune et ambitieux, basé sur l'audace et la vitesse d'exécution. Nous transformons des idées en produits que des utilisateurs du monde entier ouvrent chaque jour."
      ]
    },
    contact: {
      label: "Contact",
      // tiret insécable (‑) : empêche la césure "Parlons-/en." — si la
      // ligne doit se couper, ce sera après "Un projet ?" (seul point
      // de coupure restant), jamais au milieu du mot.
      title: "Un projet ? Parlons‑en.",
      lead: "Écrivez-nous, on répond vite. C'est notre truc.",
      fields: { name: "Votre nom", email: "Votre e-mail", message: "Votre message", send: "Envoyer" },
      status: {
        sending: "Envoi…",
        success: "Merci, votre message est bien parti. Nous revenons vers vous très vite.",
        error: "L'envoi a échoué. Votre message est conservé ci-dessus — vous pouvez réessayer, ou nous écrire directement à"
      },
      email: "adhara.information@gmail.com"
    },
    footer: { rights: "Tous droits réservés.", tagline: "Studio de création logicielle." }
  },

  en: {
    nav: { services: "Services", apps: "Apps", why: "Why us", about: "About", contact: "Contact", cta: "Get in touch" },
    hero: {
      eyebrow: "High-tech studio · software & apps",
      title: ["We build", "applications", "that move fast."],
      lead: "Adhara is a young studio crafting software and mobile apps for the whole world. From idea to the Play Store, boldly.",
      ctaPrimary: "See our apps",
      ctaSecondary: "Start a project"
    },
    services: {
      label: "What we do",
      title: "Three crafts, one standard.",
      items: [
        { icon: "▲", name: "Mobile apps", desc: "Android (and iOS) apps shipped to the stores, built for global scale and millions of users." },
        { icon: "◆", name: "Custom software", desc: "Robust web tools and platforms, tailored to your business, from prototype to production." },
        { icon: "●", name: "Product design (UX/UI)", desc: "Clear, bold interfaces. We design experiences people actually want to use." }
      ]
    },
    apps: {
      label: "Our product",
      title: "The first of a series.",
      note: "",
      cards: [
        { name: "Proserpine", tag: "Ecology · Scan", desc: "Sort your waste in a single scan. The studio's first application, currently in development.", status: "In development" }
      ],
      store: "Learn more"
    },
    why: {
      label: "Why Adhara",
      title: "Young, fast, no compromise.",
      items: [
        { k: "01", name: "Youth & drive", desc: "A team that lives in the present, on top of the latest tech and the way people actually use it." },
        { k: "02", name: "Global reach", desc: "Our apps speak to everyone. We think multi-language, multi-culture from the very first screen." },
        { k: "03", name: "Product quality", desc: "Clean code, polished interfaces, regular updates. Quality is never optional." }
      ]
    },
    /* Section « By the numbers » retirée — voir la note côté FR. */
    about: {
      label: "About",
      title: "A rising star in software.",
      body: [
        "Adhara — like the star — was born from a simple belief: great software shouldn't be reserved for big corporations.",
        "We're a young, ambitious studio built on boldness and speed of execution. We turn ideas into products that people around the world open every day."
      ]
    },
    contact: {
      label: "Contact",
      title: "Got a project? Let's talk.",
      lead: "Drop us a line, we reply fast. It's kind of our thing.",
      fields: { name: "Your name", email: "Your email", message: "Your message", send: "Send" },
      status: {
        sending: "Sending…",
        success: "Thank you, your message has been sent. We'll get back to you very soon.",
        error: "Sending failed. Your message is kept above — you can try again, or write to us directly at"
      },
      email: "adhara.information@gmail.com"
    },
    footer: { rights: "All rights reserved.", tagline: "Software creation studio." }
  }
};

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = typeof localStorage !== "undefined" && localStorage.getItem("adhara-lang");
    if (saved) return saved;
    const nav = typeof navigator !== "undefined" ? navigator.language : "fr";
    return nav && nav.toLowerCase().startsWith("en") ? "en" : "fr";
  });

  useEffect(() => {
    localStorage.setItem("adhara-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const toggle = () => setLang((l) => (l === "fr" ? "en" : "fr"));
  return (
    <LangContext.Provider value={{ lang, setLang, toggle, t: CONTENT[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
