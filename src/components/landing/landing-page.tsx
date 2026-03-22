"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import LoyaltyCard from "@/app/components/loyalty-card/LoyaltyCard";
import type { User } from "@supabase/supabase-js";
import { LandingNav } from "./landing-nav";
import { LandingFaq } from "./landing-faq";
import {
  LOGO_BAR_BRANDS,
  HOW_STEPS,
  FEATURE_ITEMS,
  TESTIMONIALS,
} from "./landing-data";
import { cn } from "@/lib/utils";

const heroContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const sectionView = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerCards = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.06 },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function LandingPage({ user }: { user: User | null }) {
  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      <LandingNav user={user} />

      {/* Hero — conținut centrat; carduri LoyaltyCard pe margini (jumătate în afara ecranului) */}
      <section className="relative min-h-[min(88vh,760px)] bg-paper pb-24 pt-28 md:pt-36">
        {/* Carduri stânga — centrul cardului pe muchia stângă a viewport-ului → jumătate în ecran */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-0 hidden md:block"
          aria-hidden
        >
          {[
            {
              top: "10%",
              rotate: -11,
              scale: 0.88,
              props: {
                brand: "1+1 Gratis",
                holder: "Maria P.",
                reward: "1+1 cafea",
                totalStamps: 8,
                filledStamps: 5,
                accentColor: "#F26545",
                palette: "custom" as const,
                customBgColor: "#1E1B18",
                customBg2Color: "#2A2622",
                template: "minimal" as const,
                layout: "compact" as const,
              },
            },
            {
              top: "44%",
              rotate: 6,
              scale: 0.92,
              props: {
                brand: "Desert gratis",
                holder: "Andrei D.",
                reward: "Tiramisu",
                totalStamps: 6,
                filledStamps: 4,
                accentColor: "#FFFFFF",
                palette: "custom" as const,
                customBgColor: "#C84B2F",
                customBg2Color: "#A33A20",
                template: "mesh" as const,
                layout: "compact" as const,
                meshGradient: true,
              },
            },
            {
              top: "76%",
              rotate: -7,
              scale: 0.85,
              props: {
                brand: "Card fidelitate",
                holder: "Ioana M.",
                reward: "Reducere 20%",
                totalStamps: 10,
                filledStamps: 7,
                accentColor: "#F26545",
                palette: "custom" as const,
                customBgColor: "#1C2B3A",
                customBg2Color: "#142030",
                template: "lines" as const,
                layout: "compact" as const,
              },
            },
          ].map((c, i) => (
            <div
              key={`hero-l-${i}`}
              className="absolute left-0 w-[min(320px,38vw)] -translate-x-1/2"
              style={{
                top: c.top,
                transform: `translateX(-50%) rotate(${c.rotate}deg) scale(${c.scale})`,
                zIndex: 3 - i,
              }}
            >
              <div className="overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(17,17,16,0.18)]">
                <LoyaltyCard {...c.props} showSubtitle />
              </div>
            </div>
          ))}
        </div>

        {/* Carduri dreapta — centrul pe muchia dreaptă */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden md:block"
          aria-hidden
        >
          {[
            {
              top: "12%",
              rotate: 10,
              scale: 0.88,
              props: {
                brand: "Cafea #10",
                holder: "Radu T.",
                reward: "Cafea mare",
                totalStamps: 10,
                filledStamps: 9,
                accentColor: "#F26545",
                palette: "custom" as const,
                customBgColor: "#2E4D3E",
                customBg2Color: "#1E3329",
                template: "dots" as const,
                layout: "compact" as const,
              },
            },
            {
              top: "46%",
              rotate: -5,
              scale: 0.93,
              props: {
                brand: "Happy Hour",
                holder: "Elena C.",
                reward: "Cocktail",
                totalStamps: 5,
                filledStamps: 3,
                accentColor: "#F26545",
                palette: "custom" as const,
                customBgColor: "#1A1528",
                customBg2Color: "#2D2344",
                customBg3Color: "#3D2840",
                template: "mesh" as const,
                layout: "compact" as const,
                meshGradient: true,
                stampVariant: "brand" as const,
              },
            },
            {
              top: "78%",
              rotate: 8,
              scale: 0.86,
              props: {
                brand: "Colectează 8",
                holder: "Paul S.",
                reward: "Meniu lunch",
                totalStamps: 8,
                filledStamps: 8,
                accentColor: "#F26545",
                palette: "custom" as const,
                customBgColor: "#2D1B3D",
                customBg2Color: "#200F2E",
                template: "corner" as const,
                layout: "hero" as const,
                rewardAvailable: true,
              },
            },
          ].map((c, i) => (
            <div
              key={`hero-r-${i}`}
              className="absolute right-0 w-[min(320px,38vw)] translate-x-1/2"
              style={{
                top: c.top,
                transform: `translateX(50%) rotate(${c.rotate}deg) scale(${c.scale})`,
                zIndex: 3 - i,
              }}
            >
              <div className="overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(17,17,16,0.18)]">
                <LoyaltyCard {...c.props} showSubtitle />
              </div>
            </div>
          ))}
        </div>

        <motion.div
          variants={heroContainer}
          initial="hidden"
          animate="show"
          className="relative z-10 mx-auto flex max-w-[44rem] flex-col items-center px-6 text-center"
        >
          <motion.div variants={heroItem}>
            <span className="inline-block rounded-full border border-coral/20 bg-coral-light px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-coral-dark">
              Loyalty SaaS pentru HoReCa · România
            </span>
          </motion.div>
          <motion.h1
            variants={heroItem}
            className="mt-6 font-display text-[clamp(2.25rem,5.5vw,3.85rem)] font-semibold leading-[1.05] tracking-tight"
          >
            <span className="block">Clienții tăi revin.</span>
            <span className="block text-coral italic">Mereu.</span>
          </motion.h1>
          <motion.p
            variants={heroItem}
            className="mt-6 max-w-xl text-lg font-light leading-[1.65] text-ink-muted"
          >
            QR la casă, card digital pe telefon, ștampilă în 3 secunde. Fără aplicație instalată, fără
            carduri de hârtie.
          </motion.p>
          <motion.div
            variants={heroItem}
            className="mt-9 w-full max-w-lg sm:max-w-xl mx-auto px-0"
          >
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3">
              <Link
                href="/login"
                className="flex h-14 w-full min-h-[3.5rem] items-center justify-center rounded-[10px] bg-coral px-4 text-center text-base font-semibold leading-tight text-paper no-underline transition hover:bg-coral-dark sm:px-5"
              >
                Începe trial 30 zile
              </Link>
              <Link
                href="/support"
                className="flex h-14 w-full min-h-[3.5rem] items-center justify-center rounded-[10px] border border-ink-15 bg-transparent px-4 text-center text-base font-semibold leading-tight text-ink-70 no-underline transition hover:bg-ink-6 sm:px-5"
              >
                Solicită demo
              </Link>
            </div>
          </motion.div>
          <motion.p variants={heroItem} className="mt-5 text-sm text-ink-muted">
            Trial 30 zile inclus · apoi de la 19€/lună · setup în 5 minute
          </motion.p>
          <motion.div
            variants={heroItem}
            className="mt-11 flex flex-wrap justify-center gap-10 md:gap-14"
          >
            {[
              { n: "4.2×", l: "vizite recurente" },
              { n: "89%", l: "rată retenție" },
              { n: "<5 min", l: "setup complet" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="font-display text-[2rem] font-semibold leading-none tracking-tight md:text-[2.125rem]">
                  {s.n}
                </div>
                <div className="mt-1.5 text-xs font-bold uppercase tracking-wide text-ink-muted">
                  {s.l}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Logo bar */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={sectionView}
        className="border-y border-ink-15 bg-surface py-8"
      >
        <div className="mx-auto max-w-[1200px] px-6 text-center md:px-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
            Folosit de cafenele și saloane din toată România
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {LOGO_BAR_BRANDS.map((b) => (
              <span
                key={b}
                className="text-sm font-semibold text-ink-muted/80"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Cum funcționează — conținut stânga; dreapta rezervată */}
      <motion.section
        id="how-it-works"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={sectionView}
        className="bg-paper py-24"
      >
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">
          <div className="text-center">
            <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight">
              Simplu pentru tine.{" "}
              <span className="text-coral italic">Simplu pentru ei.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-ink-muted">
              De la prima scanare până la recompensă — totul durează câteva secunde.
            </p>
          </div>
          <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
            <div className="min-w-0 max-w-xl lg:max-w-none">
              <div className="relative">
                {HOW_STEPS.map((step, i) => (
                  <div key={step.title} className="flex gap-6">
                    <div className="flex w-12 shrink-0 flex-col items-center">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-coral font-display text-sm font-bold text-paper">
                        {i + 1}
                      </div>
                      {i < HOW_STEPS.length - 1 && (
                        <div
                          className="my-1 min-h-[72px] w-px flex-1 border-l border-dashed border-ink-15"
                          aria-hidden
                        />
                      )}
                    </div>
                    <div className={cn("pb-14", i === HOW_STEPS.length - 1 && "pb-0")}>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-coral-light">
                          <step.Icon className="h-5 w-5 text-coral" strokeWidth={2} />
                        </div>
                        <div>
                          <h3 className="font-display text-xl font-semibold text-ink">
                            {step.title}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Coloană dreaptă pentru conținut viitor (ilustrație, screenshot etc.) */}
            <div
              className="hidden min-h-[280px] lg:block"
              aria-hidden="true"
            />
          </div>
        </div>
      </motion.section>

      {/* Funcționalități */}
      <motion.section
        id="features"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={sectionView}
        className="bg-surface py-24"
      >
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">
          <h2 className="text-center font-display text-4xl font-semibold leading-tight tracking-tight">
            Tot ce ai nevoie.{" "}
            <span className="text-coral italic">Nimic în plus.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-base text-ink-muted">
            Un singur tool care acoperă tot fluxul: owner, staff și client.
          </p>
          <motion.div
            variants={staggerCards}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {FEATURE_ITEMS.map((f) => (
              <motion.div
                key={f.title}
                variants={cardItem}
                className="rounded-2xl border border-ink-15 bg-paper p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-coral-light">
                  <f.Icon className="h-5 w-5 text-coral" strokeWidth={2} />
                </div>
                <h3 className="mt-4 text-base font-bold text-ink">{f.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Testimoniale */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={sectionView}
        className="bg-paper py-24"
      >
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">
          <h2 className="text-center font-display text-4xl font-semibold leading-tight tracking-tight">
            Rezultate reale de la comercianți reali.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-base text-ink-muted">
            Mii de businessuri locale folosesc StampIO zilnic.
          </p>
          <motion.div
            variants={staggerCards}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {TESTIMONIALS.map((t) => (
              <motion.article
                key={t.name}
                variants={cardItem}
                className="rounded-2xl border border-ink-15 bg-surface p-6"
              >
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-coral text-coral"
                      aria-hidden
                    />
                  ))}
                </div>
                <p className="mb-4 text-sm italic leading-relaxed text-ink-70">
                  <span className="text-coral/40">&ldquo;</span>
                  {t.quote}
                  <span className="text-coral/40">&rdquo;</span>
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-coral-light font-display text-[11px] font-extrabold text-coral-dark">
                    {initials(t.name)}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-ink">{t.name}</div>
                    <div className="text-xs text-ink-muted">{t.role}</div>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Prețuri */}
      <motion.section
        id="pricing"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={sectionView}
        className="bg-surface py-24"
      >
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">
          <h2 className="text-center font-display text-4xl font-semibold leading-tight tracking-tight">
            Planuri flexibile pentru orice locație.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-base text-ink-muted">
            Trial 30 zile la înregistrare, apoi abonament Pro. Fără comisioane ascunse, fără contracte.
          </p>
          <div className="mt-14 grid gap-6 lg:mx-auto lg:max-w-[880px] lg:grid-cols-2">
            {/* Pro Lunar */}
            <div className="relative flex flex-col rounded-[20px] border-2 border-coral bg-paper px-7 pb-7 pt-9 shadow-sm">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-coral px-3 py-1 text-[11px] font-bold text-paper">
                Cel mai popular
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-coral">
                Pro Lunar
              </span>
              <div className="mt-2 font-display text-5xl font-semibold text-coral">19€</div>
              <p className="mt-1 text-xs text-ink-muted">/ lună · trial 30 zile</p>
              <div className="my-6 h-px bg-ink-15" />
              <ul className="flex flex-1 flex-col gap-3 text-[13px] text-ink">
                {[
                  "Clienți nelimitați",
                  "1 locație",
                  "Programe loyalty multiple (până la 5 carduri)",
                  "Design personalizat per card",
                  "Dashboard cu analytics 30 zile",
                  "Staff nelimitat",
                  "QR descărcare PNG + PDF A5",
                  "Remember session client",
                  "Suport prin email",
                ].map((line) => (
                  <li key={line} className="flex gap-2">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-coral"
                      strokeWidth={2.5}
                    />
                    {line}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="mt-8 flex h-11 w-full items-center justify-center rounded-[10px] bg-coral text-sm font-semibold text-paper no-underline transition hover:bg-coral-dark"
              >
                Începe trial 30 zile
              </Link>
            </div>

            {/* Pro Anual */}
            <div className="flex flex-col rounded-[20px] border border-ink-15 bg-paper p-7">
              <span className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">
                Pro Anual
              </span>
              <div className="mt-2 font-display text-5xl font-semibold text-ink">169€</div>
              <p className="mt-1 text-xs text-ink-muted">/ an</p>
              <div className="my-6 h-px bg-ink-15" />
              <p className="text-[13px] font-semibold text-ink">Tot ce include Lunar, plus:</p>
              <ul className="mt-3 flex flex-1 flex-col gap-3 text-[13px] text-ink">
                {[
                  "Economisești 59€ față de lunar (echivalent ~14€/lună)",
                  "Onboarding asistat — te ajutăm să configurezi primul card",
                  "Suport prioritar email + WhatsApp",
                  "Export CSV clienți",
                ].map((line) => (
                  <li key={line} className="flex gap-2">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-coral"
                      strokeWidth={2.5}
                    />
                    {line}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="mt-8 flex h-11 w-full items-center justify-center rounded-[10px] border border-ink-15 text-sm font-semibold text-ink-70 no-underline transition hover:bg-ink-6"
              >
                Începe trial 30 zile
              </Link>
            </div>
          </div>
          <p className="mt-10 text-center text-[13px] text-ink-muted">
            Fără comisioane ascunse · Fără contracte · Poți anula oricând
          </p>
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section
        id="faq"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={sectionView}
        className="bg-paper py-24"
      >
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">
          <h2 className="text-center font-display text-4xl font-semibold leading-tight tracking-tight">
            Întrebări frecvente.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-base text-ink-muted">
            Răspunsuri clare la cele mai comune întrebări despre StampIO.
          </p>
          <div className="mt-12">
            <LandingFaq />
          </div>
        </div>
      </motion.section>

      {/* CTA final */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={sectionView}
        className="bg-surface py-24"
      >
        <div className="mx-auto max-w-[640px] px-6 text-center md:px-12">
          <span className="inline-block rounded-full border border-coral/20 bg-coral-light px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-coral-dark">
            Setup complet în 5 minute
          </span>
          <h2 className="mt-6 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-tight tracking-tight">
            Pornești programul de fidelizare azi.
          </h2>
          <p className="mt-4 text-base text-ink-muted">
            Generezi QR-ul, îl printezi A5 și în 5 minute primești primii clienți înscriși.
          </p>
          <div className="mx-auto mt-8 flex max-w-[360px] flex-col items-center gap-3">
            <Link
              href="/login"
              className="flex h-12 w-full items-center justify-center rounded-[10px] bg-coral text-sm font-semibold text-paper no-underline transition hover:bg-coral-dark"
            >
              Începe trial 30 zile
            </Link>
            <Link
              href="/support"
              className="flex h-10 w-full items-center justify-center rounded-[10px] border border-ink-15 text-sm font-semibold text-ink-70 no-underline transition hover:bg-ink-6"
            >
              Solicită o demonstrație
            </Link>
          </div>
          <p className="mt-6 text-xs text-ink-muted">
            Fără card de credit · Fără contract · Anulezi oricând
          </p>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-ink py-12 text-paper">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-6 md:grid-cols-3 md:px-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-3 no-underline">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-coral"
                aria-hidden
              >
                <span className="h-3.5 w-3.5 rounded-full border-[2.5px] border-paper" />
              </span>
              <span className="font-display text-xl font-semibold text-paper">
                Stamp<span className="text-coral">IO</span>
              </span>
            </Link>
            <p className="mt-4 font-display text-sm italic text-white/40">
              Fă-ți clienții să se întoarcă.
            </p>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-white/30">
              Produs
            </div>
            <ul className="mt-4 flex flex-col gap-2">
              {(
                [
                  ["Funcționalități", "#features"],
                  ["Prețuri", "#pricing"],
                  ["Cum funcționează", "#how-it-works"],
                  ["FAQ", "#faq"],
                ] as const
              ).map(([label, href]) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-[13px] text-white/50 transition hover:text-white"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-white/30">
              Legal & Contact
            </div>
            <ul className="mt-4 flex flex-col gap-2 text-[13px] text-white/50">
              <li>
                <span className="cursor-default">Termeni și condiții</span>
              </li>
              <li>
                <span className="cursor-default">Politică confidențialitate</span>
              </li>
              <li>
                <a
                  href="mailto:contact@stampio.ro"
                  className="transition hover:text-white"
                >
                  contact@stampio.ro
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-[1200px] flex-wrap items-center justify-between gap-4 border-t border-white/10 px-6 pt-8 md:px-12">
          <p className="text-xs text-white/30">
            © 2025 StampIO. Toate drepturile rezervate.
          </p>
          <p className="text-xs text-white/20">Construit cu Next.js + Supabase</p>
        </div>
      </footer>
    </div>
  );
}
