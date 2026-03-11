import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-stone-700/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-semibold text-brand-400">StampIO</span>
          <nav className="flex gap-4">
            <Link
              href="/login"
              className="text-stone-400 hover:text-white transition"
            >
              Autentificare
            </Link>
            <Link
              href="/login"
              className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-balance mb-4">
          Carduri de fidelitate în Google & Apple Wallet
        </h1>
        <p className="text-stone-400 text-center max-w-xl mb-10">
          Fără hârtie, fără card fizic, fără aplicație separată. Configurează
          programul tău în câteva minute.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/login"
            className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-medium transition"
          >
            Începe acum
          </Link>
          <Link
            href="/enroll/demo"
            className="border border-stone-600 text-stone-300 hover:border-brand-500 hover:text-brand-400 px-6 py-3 rounded-xl font-medium transition"
          >
            Vezi cum arată pentru clienți
          </Link>
        </div>
      </main>
      <footer className="border-t border-stone-700/50 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-stone-500 text-sm">
          StampIO — Digital Loyalty SaaS
        </div>
      </footer>
    </div>
  );
}
