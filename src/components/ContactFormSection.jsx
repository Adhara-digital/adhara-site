import { useState } from "react";
import { useLang } from "../content-and-translations.jsx";

export default function ContactFormSection() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Sans backend pour l'instant : on ouvre le client mail (mailto).
  const onSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Adhara — ${form.name || "contact"}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    window.location.href = `mailto:${t.contact.email}?subject=${subject}&body=${body}`;
  };

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
          <input type="text" required placeholder={t.contact.fields.name} value={form.name} onChange={set("name")} />
          <input type="email" required placeholder={t.contact.fields.email} value={form.email} onChange={set("email")} />
          <textarea required rows="4" placeholder={t.contact.fields.message} value={form.message} onChange={set("message")} />
          <button type="submit" className="btn btn--primary">{t.contact.fields.send}</button>
        </form>
      </div>
    </section>
  );
}
