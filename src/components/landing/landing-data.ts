import {
  QrCode,
  Smartphone,
  ScanLine,
  RefreshCw,
  Gift,
  BarChart3,
  CreditCard,
} from "lucide-react";

export const LOGO_BAR_BRANDS = [
  "Caffè Urban",
  "Bob Coffee",
  "Shift Bar",
  "Bran Cafe",
  "Origo",
  "Lente & Zafir",
];

export const HOW_STEPS = [
  {
    title: "Scanezi QR-ul de la casă",
    desc: "Clientul scanează QR-ul fix de pe tejghea cu camera telefonului.",
    Icon: QrCode,
  },
  {
    title: "Introduci numele și telefonul",
    desc: "O singură dată. Data viitoare browserul te recunoaște automat.",
    Icon: Smartphone,
  },
  {
    title: "Primești cardul digital instant",
    desc: "Apare direct în browser. Fără aplicație, fără instalare.",
    Icon: CreditCard,
  },
  {
    title: "Colectezi ștampile, câștigi recompense",
    desc: "La 10 ștampile, recompensa se acordă automat.",
    Icon: Gift,
  },
];

export const FEATURE_ITEMS = [
  {
    Icon: QrCode,
    title: "Înrolare instant prin QR",
    desc: "Clientul scanează, completează un formular scurt și primește cardul digital imediat.",
  },
  {
    Icon: Smartphone,
    title: "Card digital fără app",
    desc: "Funcționează direct în browser. Pe orice telefon, iOS sau Android, fără nicio instalare.",
  },
  {
    Icon: ScanLine,
    title: "Scan ultra rapid de staff",
    desc: "Angajatul scanează QR-ul clientului în 2 secunde. Fără periferce, fără aplicații speciale.",
  },
  {
    Icon: RefreshCw,
    title: "Remember session client",
    desc: "La a doua scanare, browserul recunoaște clientul și îl duce direct la cardul lui.",
  },
  {
    Icon: Gift,
    title: "Recompense automate",
    desc: "La atingerea pragului apare un popup pe ecranul admin: acordă acum sau mai târziu.",
  },
  {
    Icon: BarChart3,
    title: "Analytics real-time",
    desc: "KPI-uri live, grafic vizite 30 zile, listă clienți activi — toate într-un singur dashboard.",
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "În primele 2 săptămâni am văzut o creștere clară a clienților recurenți. Setup-ul a durat 10 minute.",
    name: "Andrei Popa",
    role: "Owner, Caffè Urban",
  },
  {
    quote:
      "Staff-ul s-a obișnuit instant cu scanarea. Nu am mai primit nicio întrebare de la angajați.",
    name: "Mara Constantin",
    role: "Manager, Bistro Central",
  },
  {
    quote:
      "Vizitele recurente se văd clar în graficul de 30 zile. Clienții sunt mai fideli.",
    name: "Paul Ionescu",
    role: "Fondator, Sweet Bakery",
  },
  {
    quote:
      "Clientele mele adoră că li se afișează cardul direct la scanare, fără să caute linkuri.",
    name: "Elena Gheorghe",
    role: "Owner, Salon Beauty",
  },
  {
    quote:
      "QR-ul printat A5 a făcut un efect vizual bun la casă. Clienții scanează curioși și se înscriu instant.",
    name: "Mihai Tudose",
    role: "Manager, Coffee Lab",
  },
  {
    quote:
      "Pot face designul cardului în culorile cofetăriei. Arată profesional și clienții îl recunosc.",
    name: "Ana Florescu",
    role: "Owner, Patiserie La Voisin",
  },
];

export const FAQ_ITEMS = [
  {
    q: "Trebuie să instaleze clienții o aplicație?",
    a: "Nu. Cardul digital se deschide direct în browser, la accesarea link-ului din QR code. Funcționează pe orice telefon, indiferent de sistem de operare.",
  },
  {
    q: "Cum scanează angajatul ștampila?",
    a: "Angajatul intră pe pagina /admin de pe telefonul lui, apasă 'Scanează client' și scanează QR-ul dinamic de pe ecranul clientului. Întreaga operațiune durează 2-3 secunde.",
  },
  {
    q: "Ce se întâmplă când un client scanează QR-ul a doua oară?",
    a: "Browserul recunoaște automat clientul prin cookie și îl duce direct la cardul lui, fără să mai completeze nimic. Dacă browserul nu ține minte, introduce numărul de telefon și găsește cardul existent.",
  },
  {
    q: "Datele clienților sunt în siguranță?",
    a: "Da. Folosim Supabase cu Row Level Security. Datele clienților tăi nu sunt vizibile altor businessuri. Suntem conformi GDPR.",
  },
  {
    q: "Pot să am mai multe tipuri de carduri?",
    a: "Da, în planul Pro poți crea programe loyalty multiple. De exemplu: un card pentru cafea și altul pentru desert, fiecare cu propriul QR și prag de recompensă.",
  },
  {
    q: "Cum anulez abonamentul?",
    a: "Poți anula oricând din setările contului, fără penalizări. Nu există contracte pe termen lung.",
  },
];
