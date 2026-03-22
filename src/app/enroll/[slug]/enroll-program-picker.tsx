import Link from "next/link";

type ProgramRow = {
  id: string;
  card_name: string | null;
  stamps_required: number;
  reward_description: string;
};

export function EnrollProgramPicker({
  slug,
  businessName,
  programs,
}: {
  slug: string;
  businessName: string;
  programs: ProgramRow[];
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-[var(--c-border)] bg-[var(--c-white)] p-6 space-y-4">
          <h1 className="type-heading text-center" style={{ fontSize: 18 }}>
            {businessName}
          </h1>
          <p className="text-sm text-center text-[var(--c-muted)] leading-relaxed">
            Locația are mai multe carduri. Alege cardul pentru care vrei să te înrolezi — fiecare
            QR de la casă duce la un card diferit.
          </p>
          <ul className="space-y-2">
            {programs.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/enroll/${slug}?program=${encodeURIComponent(p.id)}`}
                  className="block rounded-lg border border-[var(--c-border)] px-4 py-3 text-sm hover:bg-[var(--c-sand)] transition-colors"
                >
                  <span className="font-semibold block">{p.card_name ?? "Card fidelitate"}</span>
                  <span className="text-[var(--c-muted)] text-xs">
                    {p.stamps_required} ștampile → {p.reward_description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
