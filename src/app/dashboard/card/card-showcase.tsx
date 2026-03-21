import Link from "next/link";
import LoyaltyCard from "@/app/components/loyalty-card/LoyaltyCard";
import { CreateCardButton } from "./create-card-button";
import { DeleteProgramButton } from "./delete-program-button";
import { programRowToLoyaltyPreview } from "@/lib/card-program-preview";

type Props = {
  programs: Record<string, unknown>[];
  merchant: { business_name: string; logo_url: string | null };
  /** Nr. de clienți (wallet passes) per program */
  passCountByProgram?: Record<string, number>;
};

export function CardShowcase({ programs, merchant, passCountByProgram }: Props) {
  return (
    <div>
      <div className="dash-cards-grid">
        {programs.map((p, idx) => {
          const id = String(p.id ?? "");
          const title = ((p.card_name as string) ?? "").trim() || `Card ${idx + 1}`;
          const props = programRowToLoyaltyPreview(p, merchant);
          const stamps = Number(p.stamps_required) || 8;
          const clients = passCountByProgram?.[id] ?? 0;

          return (
            <div key={id} className="group flex min-w-0 flex-col gap-3">
              <div className="relative w-full">
                <div className="absolute right-1.5 top-1.5 z-10 max-w-[calc(100%-12px)]">
                  <DeleteProgramButton programId={id} programTitle={title} />
                </div>
                <Link
                  href={`/dashboard/card?program=${id}`}
                  className="block w-full max-w-[420px] mx-auto no-underline outline-none transition-transform duration-200 hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-[var(--c-accent)] focus-visible:ring-offset-2 rounded-[18px]"
                >
                  <LoyaltyCard {...props} />
                </Link>
              </div>
              <div className="text-center px-1">
                <div className="text-[13px] font-bold text-[var(--c-black)] transition-colors group-hover:text-[var(--c-accent)]">
                  {title}
                </div>
                <div className="mt-0.5 text-[11px] text-[var(--c-muted)]">
                  {stamps} ștampile · {clients} {clients === 1 ? "client activ" : "clienți activi"}
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 py-8">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full text-[22px] font-light leading-none"
            style={{ background: "var(--c-accent-lt)", color: "var(--c-accent)" }}
            aria-hidden
          >
            +
          </span>
          <CreateCardButton variant="primary">+ Card nou</CreateCardButton>
          <span className="text-[11px] text-[var(--c-muted)]">Adaugă program</span>
        </div>
      </div>
    </div>
  );
}
