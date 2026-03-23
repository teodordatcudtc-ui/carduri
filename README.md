# Stampy — Digital Loyalty SaaS

SaaS B2B pentru programe de fidelizare cu ștampile digitale în **Google Wallet** și **Apple Wallet**. Fără aplicație mobilă separată.

**Stack:** Next.js 15 · Supabase · (Google Wallet · Apple Wallet — stuburi pregătite)

---

## Setup rapid

1. **Clonează și instalează**
   ```bash
   cd carduri
   npm install
   ```

2. **Supabase**
   - Creează un proiect pe [supabase.com](https://supabase.com).
   - Rulează migrarea din `supabase/migrations/001_initial_schema.sql` în SQL Editor.
   - Copiază `.env.local.example` în `.env.local` și completează:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` (pentru operații server)
     - `NEXT_PUBLIC_APP_URL` (ex: `http://localhost:3000`)

3. **Pornește dev**
   ```bash
   npm run dev
   ```

4. **Auth**
   - În Supabase Dashboard → Authentication → Providers: activează Email și (opțional) Google OAuth.
   - Pentru Google: configurează redirect URL: `http://localhost:3000/auth/callback`.

---

## Fluxuri

- **Comerciant:** Înregistrare → Onboarding (nume, slug, culori, ștampile/recompensă) → Dashboard: Card, QR înrolare, Scanează.
- **Client:** Scanează QR → Formular (nume, telefon) → Prima ștampilă automată → „Add to Google/Apple Wallet” (linkuri stub) → Pagina card cu cod de afișat la casă.
- **Stampilare:** Comerciant introduce codul de pe card în Dashboard → Scanează → Adaugă ștampilă sau Acordă recompensa.

---

## Integrări Wallet

### Google Wallet (funcțional)

1. **Google Pay & Wallet Console:** [pay.google.com/business/console](https://pay.google.com/business/console) → creează un issuer → notează **Issuer ID** (numeric).
2. **Google Cloud:** același proiect → Service Accounts → creează un cont de serviciu → cheie JSON. Acordă scope `https://www.googleapis.com/auth/wallet_object.issuer` (sau activează **Google Wallet API** pentru proiect).
3. **Conectare issuer:** în Pay Console, asociază contul de serviciu cu issuer-ul (Account linking).
4. **Env:** pune în `.env.local`:
   - `GOOGLE_WALLET_ISSUER_ID` = Issuer ID-ul numeric
   - `GOOGLE_WALLET_SERVICE_ACCOUNT_JSON` = conținutul întreg al fișierului JSON (ca string, pe un rând sau escapat corect)

După ce salvezi, linkul „Add to Google Wallet” redirecționează la `https://pay.google.com/gp/v/save/<jwt>` și utilizatorul poate adăuga cardul în Wallet. `origins` în JWT include `NEXT_PUBLIC_APP_URL`; pentru producție adaugă și domeniul real (ex. `https://stampio.ro`).

**Dacă primești „Something went wrong” în Google Wallet:** folosește **Issuer ID numeric** (ex. `33880000000123456789`), **nu** Merchant ID (BCR...). În Pay & Wallet Console → secțiunea **Google Wallet API** caută „Issuer ID” sau „Account ID”; dacă vezi doar Merchant ID, contactează suportul Google Wallet sau verifică documentația de onboarding pentru Issuer ID numeric. Asigură-te că contul de serviciu e adăugat ca **Users** → Invite (Developer) și că adresa de email de test e în „Set up test accounts”.

### Apple Wallet (stub)

Completează `APPLE_WALLET_PASS_TYPE_ID`, `APPLE_WALLET_TEAM_ID`, `APPLE_WALLET_KEY_ID`, `APPLE_WALLET_PRIVATE_KEY`. Generare .pkpass în `src/lib/wallet/apple.ts` și răspuns în `src/app/api/wallet/apple/add/route.ts`.

Fără variabilele Apple, butonul „Add to Apple Wallet” duce la pagina cardului cu codul.

---

## Structură

- `src/app` — App Router: `/`, `/login`, `/dashboard`, `/dashboard/onboarding`, `/dashboard/card`, `/dashboard/qr`, `/dashboard/scan`, `/enroll/[slug]`, `/card/[passId]`
- `src/app/api` — `enroll`, `scan`, `pass/[passId]`, `wallet/google/add`, `wallet/apple/add`
- `src/lib` — Supabase client/server, utils, types, wallet stubs
- `supabase/migrations` — Schema SQL (merchants, loyalty_programs, locations, customers, wallet_passes, stamp_events, redemptions)

---

## Licență

Privat / proiect.
