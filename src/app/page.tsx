import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--c-sand)]">
      <main className="w-full pb-16 pt-0">
        <div className="lp-nav">
          <div className="nav-logo">
            <div className="nav-logo-dot" />
            StampIO
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "var(--s3)" }}>
            <Link href="/support" className="btn btn-sm btn-outline">
              Rezervă demo
            </Link>
            <Link href="/login" className="btn btn-sm btn-primary">
              Începe gratuit
            </Link>
          </div>
        </div>

        <section className="lp-hero">
          <div className="lp-hero-tag">
            <span>★</span> #1 Loyalty app în România
          </div>
          <h1>
            Fă-ți clienții să <em>se întoarcă</em>
          </h1>
          <p>
            Carduri de fidelitate digitale pentru restaurante și cafenele. Simplu, rapid, fără complicații.
          </p>

          <div className="lp-hero-cta">
            <Link href="/login" className="btn btn-xl btn-primary">
              Începe gratuit — Acum
            </Link>
            <Link href="/support" className="btn btn-xl btn-outline">
              Rezervă Demo
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "var(--s5)",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ textAlign: "left" }}>
              <div className="card" style={{ width: 200, marginBottom: "var(--s4)" }}>
                <div style={{ fontSize: 11, color: "var(--c-muted)", marginBottom: "var(--s2)" }}>
                  Medie vizite/client
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 32, lineHeight: 1, color: "var(--c-black)" }}>
                  4.2×
                </div>
                <div className="stat-card-delta delta-up" style={{ marginTop: 6, fontSize: 11 }}>
                  ↑ mai mult cu StampIO
                </div>
              </div>
              <div className="card card-sm" style={{ width: 200, display: "flex", alignItems: "center", gap: "var(--s3)" }}>
                <div style={{ fontSize: 22 }}>☕</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>Trimite link stamp</div>
                  <div style={{ fontSize: 11, color: "var(--c-muted)" }}>Via WhatsApp sau QR</div>
                </div>
              </div>
            </div>

            <div className="lp-card-preview">
              <div className="lp-card-logo">☕ Café Floreasca</div>
              <div className="lp-stamps-grid">
                {Array.from({ length: 7 }).map((_, idx) => (
                  <div key={idx} className="lp-stamp-dot active">
                    ☕
                  </div>
                ))}
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="lp-stamp-dot">
                    ☕
                  </div>
                ))}
              </div>
              <div>
                <div className="lp-card-name">Client fidel</div>
                <div className="lp-card-holder">Maria Popescu</div>
              </div>
              <span className="badge badge-amber" style={{ alignSelf: "flex-start" }}>
                3 stampe rămase
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--s4)" }}>
              <div className="card card-sm" style={{ textAlign: "center", minWidth: 140 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, lineHeight: 1, marginBottom: 4 }}>
                  2.1K+
                </div>
                <div style={{ fontSize: 11, color: "var(--c-muted)" }}>Clienți activi</div>
              </div>
              <div
                className="card card-sm"
                style={{
                  background: "var(--c-black)",
                  borderColor: "var(--c-black)",
                  textAlign: "center",
                  minWidth: 140,
                }}
              >
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, lineHeight: 1, marginBottom: 4, color: "white" }}>
                  89%
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Rată de retenție</div>
              </div>
            </div>
          </div>
        </section>

        <div className="brands-bar">
          <span className="brand-name">Caju</span>
          <span className="brand-name">Origo</span>
          <span className="brand-name">Bob Coffee</span>
          <span className="brand-name">Lente</span>
          <span className="brand-name">Shift</span>
          <span className="brand-name">Bran</span>
        </div>

        <div className="lp-features">
          <div className="lp-feature">
            <div className="lp-feature-icon">📲</div>
            <h3>Carduri digitale</h3>
            <p>Clienții colecționează ștampile pe telefon. Fără app de instalat — funcționează via link sau QR.</p>
          </div>
          <div className="lp-feature">
            <div className="lp-feature-icon">⚡</div>
            <h3>Setup în 5 minute</h3>
            <p>Crează un card, personalizezi designul și trimiți primul link. Gata.</p>
          </div>
          <div className="lp-feature">
            <div className="lp-feature-icon">📊</div>
            <h3>Analytics real</h3>
            <p>Vezi cine revine, cât de des și ce recompense sunt cele mai populare.</p>
          </div>
        </div>

        <div className="lp-stat-bar">
          <div className="lp-stat">
            <span className="lp-stat-num">4.2×</span>
            <span className="lp-stat-label">Mai multe vizite</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat-num">89%</span>
            <span className="lp-stat-label">Rată retenție</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat-num">5 min</span>
            <span className="lp-stat-label">Setup complet</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat-num">2.1K</span>
            <span className="lp-stat-label">Clienți activi</span>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--c-border)] py-6">
        <div className="text-center text-[var(--c-muted)] text-sm">
          StampIO — Digital Loyalty SaaS
        </div>
      </footer>
    </div>
  );
}
