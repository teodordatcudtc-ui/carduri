"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";

export type ClientRow = {
  id: string;
  fullName: string;
  phone: string;
  cardName: string;
  stamps: number;
  required: number;
  rewardAvailable: boolean;
  updatedAt: string;
  visitCount: number;
};

type Filter = "all" | "active" | "near" | "reward" | "inactive";

function maskPhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.length < 6) return phone;
  return `${phone.slice(0, 8)} xxx xxx`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function rowStatus(
  reward: boolean,
  stamps: number,
  required: number,
  updatedAt: string
): { cls: string; label: string } {
  if (reward) return { cls: "dash-badge dash-badge-green", label: "Recompensă" };
  const days = (Date.now() - new Date(updatedAt).getTime()) / 86400000;
  if (days > 30) return { cls: "dash-badge dash-badge-inactive", label: "Inactiv" };
  if (required > 0 && stamps >= required - 1 && stamps < required) {
    return { cls: "dash-badge dash-badge-coral", label: "Aproape" };
  }
  return { cls: "dash-badge dash-badge-neutral", label: "Activ" };
}

function formatLastVisit(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  if (sameDay) {
    return `azi, ${d.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}`;
  }
  const y = new Date(today);
  y.setDate(y.getDate() - 1);
  const yesterday =
    d.getFullYear() === y.getFullYear() && d.getMonth() === y.getMonth() && d.getDate() === y.getDate();
  if (yesterday) return "ieri";
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff < 30) return `acum ${diff} zile`;
  return `acum ${diff} zile`;
}

function avClass(i: number) {
  const cycle = ["av-c", "av-b", "av-y", "av-n", "av-g"] as const;
  return cycle[i % cycle.length];
}

function StampBar({ filled, total }: { filled: number; total: number }) {
  const dots = Array.from({ length: total }, (_, i) => i < filled);
  return (
    <div>
      <div className="dash-stamp-bar">
        {dots.map((f, i) => (
          <span key={i} className={`dash-stamp-dot ${f ? "f" : "e"}`} />
        ))}
      </div>
      <div className="mt-1 text-[10px] text-[var(--c-muted)]">
        {filled} / {total}
      </div>
    </div>
  );
}

type Props = {
  rows: ClientRow[];
  stats: {
    total: number;
    active: number;
    inactive: number;
    near: number;
    reward: number;
    redemptionsMonth: number;
  };
};

export function ClientsPageClient({ rows, stats }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      const st = rowStatus(r.rewardAvailable, r.stamps, r.required, r.updatedAt);
      if (filter === "active" && st.label !== "Activ") return false;
      if (filter === "inactive" && st.label !== "Inactiv") return false;
      if (filter === "near" && st.label !== "Aproape") return false;
      if (filter === "reward" && st.label !== "Recompensă") return false;
      if (!needle) return true;
      return (
        r.fullName.toLowerCase().includes(needle) ||
        r.phone.replace(/\s/g, "").includes(needle.replace(/\s/g, ""))
      );
    });
  }, [rows, filter, q]);

  function exportCsv() {
    const header = [
      "Nume",
      "Telefon",
      "Card",
      "Progres",
      "Vizite (ștampile acordate)",
      "Ultima vizită",
      "Status",
    ];
    const lines = filtered.map((r) => {
      const st = rowStatus(r.rewardAvailable, r.stamps, r.required, r.updatedAt);
      return [
        r.fullName,
        r.phone,
        r.cardName,
        `${r.stamps}/${r.required}`,
        String(r.visitCount),
        r.updatedAt,
        st.label,
      ]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(",");
    });
    const blob = new Blob([header.join(",") + "\n" + lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stampio-clienti-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const pills: { id: Filter; label: string }[] = [
    { id: "all", label: `Toți (${stats.total})` },
    { id: "active", label: `Activi (${stats.active})` },
    { id: "near", label: `Aproape de recompensă (${stats.near})` },
    { id: "reward", label: `Au recompensă (${stats.reward})` },
    { id: "inactive", label: `Inactivi (${stats.inactive})` },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="dash-stat-chip-row">
        <div className="dash-stat-chip">
          <div className="dash-stat-chip-val">{stats.total}</div>
          <div className="dash-stat-chip-lbl">Total înrolați</div>
        </div>
        <div className="dash-stat-chip hi">
          <div className="dash-stat-chip-val">{stats.active}</div>
          <div className="dash-stat-chip-lbl">Activi (vizită &lt;30 zile)</div>
        </div>
        <div className="dash-stat-chip">
          <div className="dash-stat-chip-val">{stats.inactive}</div>
          <div className="dash-stat-chip-lbl">Inactivi (&gt;30 zile)</div>
        </div>
        <div className="dash-stat-chip">
          <div className="dash-stat-chip-val">{stats.redemptionsMonth}</div>
          <div className="dash-stat-chip-lbl">Recompense luna aceasta</div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2.5">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Caută după nume sau telefon..."
          className="field-input min-h-[40px] min-w-[200px] flex-1"
        />
        <button type="button" onClick={exportCsv} className="btn btn-md btn-outline shrink-0 gap-2">
          <Download className="h-3.5 w-3.5" aria-hidden />
          Export CSV
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {pills.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setFilter(p.id)}
            className={`dash-filter-pill${filter === p.id ? " active" : ""}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="dash-box" style={{ marginBottom: 0 }}>
        <div className="overflow-x-auto">
          <table className="dash-table w-full min-w-[720px] border-collapse">
            <thead>
              <tr>
                <th>Client</th>
                <th>Card</th>
                <th>Progres</th>
                <th>Vizite ștampile</th>
                <th>Ultima vizită</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const st = rowStatus(r.rewardAvailable, r.stamps, r.required, r.updatedAt);
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className={`dash-av ${avClass(i)}`}>{initials(r.fullName)}</div>
                        <div>
                          <div className="font-semibold">{r.fullName}</div>
                          <div className="text-[11px] text-[var(--c-muted)]">{maskPhone(r.phone)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-[12px] text-[var(--c-muted)]">{r.cardName}</td>
                    <td>
                      <StampBar filled={r.stamps} total={r.required} />
                    </td>
                    <td className="text-[13px] font-semibold">{r.visitCount}</td>
                    <td className="text-[12px] text-[var(--c-muted)]">{formatLastVisit(r.updatedAt)}</td>
                    <td>
                      <span className={st.cls}>{st.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--c-border)] px-4 py-3">
          <div className="text-[12px] text-[var(--c-muted)]">
            Afișând {filtered.length} din {rows.length} clienți
          </div>
        </div>
      </div>
    </div>
  );
}
