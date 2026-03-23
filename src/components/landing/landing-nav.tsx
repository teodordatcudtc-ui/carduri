"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, LayoutDashboard } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Funcționalități", href: "#features" },
  { label: "Cum funcționează", href: "#how-it-works" },
  { label: "Prețuri", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function LandingNav({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-16 border-b border-ink-15 bg-paper",
        scrolled && "shadow-sm"
      )}
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6 md:px-12">
        <Link href="/" className="flex items-center gap-2 no-underline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-stampy.svg"
            alt="Stampy"
            width={150}
            height={32}
            className="h-8 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-10 md:flex" aria-label="Principal">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-coral px-5 text-sm font-semibold text-paper no-underline transition hover:bg-coral-dark"
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden />
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-[10px] px-4 text-sm font-semibold text-ink-70 no-underline transition hover:bg-ink-6"
              >
                Loghează-te
              </Link>
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-[10px] bg-coral px-5 text-sm font-semibold text-paper no-underline transition hover:bg-coral-dark"
              >
                Începe trial 30 zile
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {!user && (
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-[10px] bg-coral px-3 text-xs font-semibold text-paper no-underline sm:text-sm"
            >
              Începe trial 30 zile
            </Link>
          )}
          {user && (
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center justify-center rounded-[10px] bg-coral px-3 text-xs font-semibold text-paper no-underline"
            >
              Dashboard
            </Link>
          )}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-ink"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="border-t border-ink-15 bg-paper px-6 py-4 md:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobil">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-lg py-3 text-sm font-medium text-ink-muted hover:bg-ink-6 hover:text-ink"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            {!user && (
              <Link
                href="/login"
                className="mt-2 rounded-lg py-3 text-center text-sm font-semibold text-ink hover:bg-ink-6"
                onClick={() => setOpen(false)}
              >
                Loghează-te
              </Link>
            )}
          </nav>
        </div>
      )}
    </motion.header>
  );
}
