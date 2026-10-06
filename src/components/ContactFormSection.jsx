import { useState } from "react";
import { useLang } from "../content-and-translations.jsx";

/* Adresse du service qui reçoit le formulaire et le transfère par e-mail.
   Elle se règle dans Vercel (variable d'environnement VITE_FORM_ENDPOINT),
   pas dans le code : changer de service ou de destinataire ne demande
   alors aucune modification ni aucun commit.

   L'adresse e-mail qui REÇOIT les messages n'est pas dans ce fichier :
   elle se configure dans le compte du service de formulaire.

   Tant que la variable n'est pas définie, le formulaire retombe sur le
   comportement d'avant (ouverture du client mail du visiteur). */
const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT || "";

const EMPTY = { name: "", email: "", message: "", website: "" };

export default function ContactFormSection() {
  const { t } = useLang();
  const [form, setForm] = useState(EMPTY);
  // idle | sending | success | error
  const [status, setStatus] = useState("idle");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;

    /* Champ piège : invisible pour une personne, rempli par la plupart
       des robots. S'il est rempli, on feint le succès sans rien envoyer. */
    if (form.website) {
      setStatus("success");
      return;
    }

    const subject = `Adhara — ${form.name || "contact"}`;

    /* Pas de service configuré : ancien comportement. */
    if (!ENDPOINT) {
      const body = `${form.message}\n\n— ${form.name} (${form.email})`;
      window.location.href =
        `mailto:${t.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      return;
    }

    setStatus("sending");
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("email", form.email);
      data.append("message", form.message);
      data.append("_subject", subject);

      const res = await fetch(ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setForm(EMPTY);
      setStatus("success");
    } catch {
      /* On garde le texte saisi : perdre un message à cause d'une
         erreur réseau est ce qu'il y a de pire pour un visiteur. */
      setStatus("error");
    }
  };

  const sending = status === "sending";

  return (
    <section className="section section--alt contact" id="contact">
      <div className="wrap contact__inner">
        <div className="contact__head">
          <p className="eyebrow reveal">{t.contact.label}</p>
          <h2 className="section__title reveal">{t.contact.title}</h2>
          <p className="contact__lead reveal">{t.contact.lead}</p>
          <a href={`mailto:${t.contact.email}`} className="contact__email reveal">{t.contact.email}</a>
        </div>
        <form className="contact__form reveal" onSubmit={onSubmit}>
          <label htmlFor="contact-name" className="sr-only">{t.contact.fields.name}</label>
          <input id="contact-name" name="name" type="text" required autoComplete="name"
            placeholder={t.contact.fields.name} value={form.name} onChange={set("name")} disabled={sending} />

          <label htmlFor="contact-email" className="sr-only">{t.contact.fields.email}</label>
          <input id="contact-email" name="email" type="email" required autoComplete="email"
            placeholder={t.contact.fields.email} value={form.email} onChange={set("email")} disabled={sending} />

          <label htmlFor="contact-message" className="sr-only">{t.contact.fields.message}</label>
          <textarea id="contact-message" name="message" required rows="4"
            placeholder={t.contact.fields.message} value={form.message} onChange={set("message")} disabled={sending} />

          {/* Champ piège anti-robots — voir onSubmit. */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
            className="contact__hp" value={form.website} onChange={set("website")} />

          <button type="submit" className="btn btn--primary" disabled={sending}>
            {sending ? t.contact.status.sending : t.contact.fields.send}
          </button>

          {/* Annonce vocale du résultat pour les lecteurs d'écran. */}
          <p className={`contact__status contact__status--${status}`}
            role={status === "error" ? "alert" : "status"} aria-live="polite">
            {status === "success" && t.contact.status.success}
            {status === "error" && (
              <>
                {t.contact.status.error}{" "}
                <a href={`mailto:${t.contact.email}`}>{t.contact.email}</a>
              </>
            )}
          </p>
        </form>
      </div>
    </section>
  );
}
