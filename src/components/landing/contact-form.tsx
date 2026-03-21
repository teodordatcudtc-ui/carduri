"use client";

import { useState, FormEvent } from "react";

export function ContactForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !message.trim()) {
      setError("Completează emailul și mesajul.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Nu am putut trimite mesajul. Încearcă din nou.");
        return;
      }
      setSuccess(true);
      setFirstName("");
      setLastName("");
      setEmail("");
      setMessage("");
    } catch {
      setError("Eroare de rețea. Verifică conexiunea sau scrie direct pe contact@stampio.ro");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card" style={{ padding: 32 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
        Trimite-ne un mesaj
      </div>
      <p style={{ fontSize: 13, color: "var(--c-ink-60)", marginBottom: 24 }}>
        Îți răspundem în maxim 24h în zilele lucrătoare.
      </p>

      {success ? (
        <div
          role="status"
          style={{
            padding: "var(--s5)",
            borderRadius: "var(--r-md)",
            background: "var(--c-sand)",
            border: "1px solid var(--c-border)",
            fontSize: 14,
            color: "var(--c-black)",
            lineHeight: 1.6,
          }}
        >
          <strong style={{ display: "block", marginBottom: 8 }}>Mesaj trimis!</strong>
          Mulțumim — te contactăm în curând. Poți trimite și alt mesaj mai jos.
          <button
            type="button"
            className="btn btn-sm btn-outline"
            style={{ marginTop: 16 }}
            onClick={() => setSuccess(false)}
          >
            Trimite alt mesaj
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="grid-cols-1 sm:grid-cols-2">
            <div className="field-group" style={{ width: "100%" }}>
              <label className="field-label" htmlFor="contact-first">
                Prenume
              </label>
              <input
                id="contact-first"
                name="firstName"
                type="text"
                autoComplete="given-name"
                className="field-input"
                placeholder="Ion"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="field-group" style={{ width: "100%" }}>
              <label className="field-label" htmlFor="contact-last">
                Nume
              </label>
              <input
                id="contact-last"
                name="lastName"
                type="text"
                autoComplete="family-name"
                className="field-input"
                placeholder="Popescu"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="field-group" style={{ width: "100%" }}>
            <label className="field-label" htmlFor="contact-email">
              Email <span style={{ color: "var(--c-accent)" }}>*</span>
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="field-input"
              placeholder="tu@firma.ro"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field-group" style={{ width: "100%" }}>
            <label className="field-label" htmlFor="contact-message">
              Mesaj <span style={{ color: "var(--c-accent)" }}>*</span>
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              className="field-textarea"
              placeholder="Cum te putem ajuta?"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {error && <p className="field-error-msg">{error}</p>}

          <button type="submit" className="btn btn-md btn-accent btn-full" disabled={submitting} style={{ marginTop: 4 }}>
            {submitting ? "Se trimite…" : "Trimite mesajul"}
          </button>
          <p style={{ fontSize: 11, color: "var(--c-muted)", textAlign: "center", margin: 0 }}>
            Sau scrie direct pe{" "}
            <a href="mailto:contact@stampio.ro" style={{ color: "var(--c-accent)" }}>
              contact@stampio.ro
            </a>
          </p>
        </form>
      )}
    </div>
  );
}
