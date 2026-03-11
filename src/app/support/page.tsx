import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white">StampIO — Support</h1>
          <p className="text-sm text-stone-400">
            Help for merchants using StampIO digital loyalty cards.
          </p>
        </div>
        <div className="rounded-xl border border-stone-700/50 bg-stone-900/40 p-6 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">
              Contact email
            </h2>
            <p className="text-sm text-stone-300">
              For any questions or issues, email us at{" "}
              <a
                href="mailto:teodordatcu.dtc@gmail.com"
                className="text-brand-400 hover:text-brand-300 underline"
              >
                teodordatcu.dtc@gmail.com
              </a>
              .
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">
              What we can help with
            </h2>
            <ul className="list-disc list-inside text-sm text-stone-300 space-y-1">
              <li>Setting up your loyalty program and QR code</li>
              <li>Issues adding cards to Google Wallet or Apple Wallet</li>
              <li>Managing locations, staff access or customer passes</li>
              <li>Billing or account questions</li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">
              Response time
            </h2>
            <p className="text-sm text-stone-300">
              We aim to respond to support requests within{" "}
              <span className="font-semibold">24 hours (business days)</span>.
            </p>
          </div>
        </div>
        <p className="text-center text-xs text-stone-500">
          <Link href="/" className="hover:text-stone-300">
            ← Back to StampIO homepage
          </Link>
        </p>
      </div>
    </div>
  );
}

