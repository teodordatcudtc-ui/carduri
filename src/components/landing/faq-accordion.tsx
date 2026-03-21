"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type FaqItem = { q: string; a: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q} className="card card-sm" style={{ padding: 0, overflow: "hidden" }}>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={`faq-panel-${i}`}
              id={`faq-trigger-${i}`}
              onClick={() => setOpenIndex(open ? null : i)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "20px 24px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
                font: "inherit",
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 14, color: "var(--c-black)", lineHeight: 1.45, flex: 1 }}>
                {item.q}
              </span>
              <ChevronDown
                aria-hidden
                style={{
                  width: 18,
                  height: 18,
                  color: "var(--c-muted)",
                  flexShrink: 0,
                  marginTop: 2,
                  transform: open ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              />
            </button>
            <div
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-trigger-${i}`}
              aria-hidden={!open}
              style={{
                display: open ? "block" : "none",
                padding: open ? "0 24px 20px" : 0,
                fontSize: 13,
                color: "var(--c-ink-60)",
                lineHeight: 1.65,
                borderTop: open ? "1px solid var(--c-border)" : "none",
                marginTop: open ? -1 : 0,
                paddingTop: open ? 16 : 0,
              }}
            >
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
