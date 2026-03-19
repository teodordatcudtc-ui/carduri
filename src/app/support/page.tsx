import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="type-display-md">StampIO — Support</h1>
          <p className="text-[var(--c-ink-60)] text-sm">
            Help for merchants using StampIO digital loyalty cards.
          </p>
        </div>

        <div className="card card-sm" style={{ padding: "var(--s6)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <h2 className="type-heading" style={{ fontSize: 14, marginBottom: 6 }}>
                Contact email
              </h2>
              <p className="type-body" style={{ margin: 0 }}>
                Pentru întrebări sau probleme, scrie-ne la{" "}
                <a
                  href="mailto:teodordatcu.dtc@gmail.com"
                  style={{
                    color: "var(--c-accent)",
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                  }}
                >
                  teodordatcu.dtc@gmail.com
                </a>
                .
              </p>
            </div>

            <div>
              <h2 className="type-heading" style={{ fontSize: 14, marginBottom: 6 }}>
                Cu ce te ajutăm
              </h2>
              <ul style={{ margin: 0, paddingLeft: 18, color: "var(--c-ink-60)" }}>
                <li style={{ marginBottom: 6 }}>Setezi programul loyalty și QR-ul</li>
                <li style={{ marginBottom: 6 }}>Probleme la adăugarea cardului în Google Wallet / Apple Wallet</li>
                <li style={{ marginBottom: 6 }}>Locații, acces staff și carduri clienți</li>
                <li style={{ marginBottom: 6 }}>Billing / întrebări cont</li>
              </ul>
            </div>

            <div>
              <h2 className="type-heading" style={{ fontSize: 14, marginBottom: 6 }}>
                Răspuns rapid
              </h2>
              <p className="type-body" style={{ margin: 0 }}>
                Ne propunem să răspundem în termen de{" "}
                <span style={{ fontWeight: 700 }}>24 ore (zile lucrătoare)</span>.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs" style={{ color: "var(--c-muted)" }}>
          <Link href="/" className="hover:text-[var(--c-black)] transition" style={{ textDecoration: "none" }}>
            ← Înapoi la prima pagină
          </Link>
        </p>
      </div>
    </div>
  );
}

