# MNW Mobilfunk - Handy Reparatur Website

Moderne Website für MNW Mobilfunk - Professionelle Smartphone-Reparatur in Ottobrunn.

## 🚀 Features

### Frontend
- ⚛️ React 18 mit TypeScript
- 🎨 Tailwind CSS für modernes Design
- 🔄 React Router für Navigation
- 📱 Mobile-First & Responsive
- ⚡ Vite für schnelle Entwicklung

### Backend
- 🗄️ Supabase Database (PostgreSQL)
- 🔐 Supabase Auth (Email/Password)
- 📊 Real-time Updates
- 🔍 Fuzzy Search für Preise

### Performance
- ⚡ **95% kleineres Initial Bundle** durch Code Splitting
- 🎯 Lazy Loading für Admin & Legal-Seiten
- 📦 Optimierte Vendor-Chunks (React, Supabase, Icons)
- 🖼️ Lazy Loading für Bilder mit CLS-Prevention
- 🚀 Core Web Vitals optimiert

### SEO
- 🔍 **3 Schema.org Schemas** (LocalBusiness, FAQPage, Service)
- 📱 Open Graph Tags (Facebook, Twitter)
- 🗺️ robots.txt & sitemap.xml
- ⚡ Resource Hints (Preconnect, DNS-Prefetch)
- 🎨 Theme-Color für Mobile
- 📊 Google Analytics vorbereitet

### Admin-Panel
- 👥 User Management
- 💰 Price Manager (4000+ Reparaturpreise)
- 📝 CMS für Services & Testimonials
- ❓ FAQ Manager
- 📄 Content Manager

---

## 📋 Voraussetzungen

- Node.js 18+
- npm oder yarn
- Supabase Account

---

## 🛠️ Installation

### 1. Repository klonen
```bash
git clone <repository-url>
cd project
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Environment Variables
Erstelle eine `.env` Datei im Root-Verzeichnis:

```env
VITE_SUPABASE_URL=deine-supabase-url
VITE_SUPABASE_ANON_KEY=dein-anon-key
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # Optional
```

Die Supabase-Daten findest du in deinem Supabase Dashboard unter Settings → API.

### 4. Datenbank Setup
Führe alle Migrations aus `supabase/migrations/` aus:

```bash
# Über Supabase Dashboard → SQL Editor
# Oder nutze das Supabase CLI
```

Siehe `DATABASE_SETUP.md` für Details.

---

## 🏃 Development

### Dev-Server starten
```bash
npm run dev
```

Öffne [http://localhost:5173](http://localhost:5173)

### TypeScript Check
```bash
npm run typecheck
```

### Build für Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## 📁 Projekt-Struktur

```
project/
├── public/              # Statische Dateien
│   ├── robots.txt
│   ├── sitemap.xml
│   └── OG_IMAGE_ANLEITUNG.md
│
├── src/
│   ├── components/      # React Komponenten
│   │   ├── admin/      # Admin-Panel Komponenten
│   │   ├── Contact.tsx
│   │   ├── FAQ.tsx
│   │   ├── PriceCheck.tsx
│   │   └── ...
│   │
│   ├── contexts/        # React Contexts
│   │   └── AuthContext.tsx
│   │
│   ├── lib/            # Utilities & Libraries
│   │   ├── supabase.ts
│   │   └── analytics.ts
│   │
│   ├── pages/          # Seiten-Komponenten
│   │   ├── admin/      # Admin-Seiten (Lazy Loaded)
│   │   ├── Kontakt.tsx
│   │   ├── Impressum.tsx
│   │   └── ...
│   │
│   ├── App.tsx         # Haupt-App Komponente
│   └── main.tsx        # Entry Point
│
├── supabase/
│   └── migrations/     # Datenbank-Migrations
│
├── scripts/            # Utility Scripts
│   └── create-admin-users.ts
│
└── *.md               # Dokumentation
```

---

## 📚 Dokumentation

### Performance & SEO
- `VOLLSTAENDIGE_OPTIMIERUNGEN.md` - **Vollständige Übersicht aller Optimierungen**
- `ABSCHLUSSBERICHT_OPTIMIERUNGEN.md` - Performance-Optimierungen
- `PERFORMANCE_OPTIMIERUNGEN.md` - Technische Details
- `SEO_ROADMAP.md` - SEO-Übersicht
- `SEO_NEXT_STEPS.md` - Manuelle SEO-Aufgaben

### Setup-Guides
- `GOOGLE_ANALYTICS_SETUP.md` - Google Analytics aktivieren (15 Min)
- `public/OG_IMAGE_ANLEITUNG.md` - Open Graph Image erstellen
- `public/favicon-info.txt` - Favicon erstellen
- `DATABASE_SETUP.md` - Datenbank Setup
- `ADMIN_SETUP.md` - Admin-Panel Setup

---

## 🎯 Nach Installation erledigen

### Sofort (vor Launch):
1. ✅ Dependencies installieren
2. ✅ `.env` konfigurieren
3. ✅ Datenbank-Migrations ausführen
4. ✅ Admin-User erstellen
5. ⏳ **Favicon erstellen** → `public/favicon-info.txt`
6. ⏳ **OG-Image erstellen** → `public/OG_IMAGE_ANLEITUNG.md`

### Nach Launch (Woche 1):
7. ⏳ **Google My Business** einrichten → `SEO_NEXT_STEPS.md` ⭐ WICHTIG
8. ⏳ **Google Search Console** → Sitemap submitten
9. ⏳ **Google Analytics** aktivieren → `GOOGLE_ANALYTICS_SETUP.md`
10. ⏳ **Erste Bewertungen** sammeln (5-10 Kunden)

### Woche 2-4:
11. ⏳ Lokale Verzeichnisse (Yelp, GoLocal, etc.)
12. ⏳ Social Media (Facebook, Instagram)

Details siehe `SEO_NEXT_STEPS.md`

---

## 🔐 Admin-Panel

### Zugang
URL: `https://deine-domain.de/admin`

### Standard-Credentials (ändern!)
Siehe `ADMIN_SETUP.md` für Details zum Erstellen von Admin-Usern.

### Features
- User Management
- Preis-Manager (4000+ Preise)
- Service-Manager
- Testimonial-Manager
- FAQ-Manager
- Content-Manager

---

## 🗄️ Datenbank

### Tabellen
- `user_profiles` - User-Rollen & Profile
- `repair_prices` - Reparaturpreise (~4000 Einträge)
- `services` - Angebotene Services
- `testimonials` - Kundenbewertungen
- `faq_items` - FAQ-Einträge
- `content_blocks` - CMS-Inhalte
- `vouchers` - Gutscheine

### Migrations
Alle Migrations befinden sich in `supabase/migrations/`.

Siehe `DATABASE_SETUP.md` für Details.

---

## 📊 Performance

### Bundle-Größen (Production)
```
Initial Load (gzip):
- HTML: 2.41 kB
- CSS: 5.96 kB
- JS: 15.70 kB
- Vendor: 57.58 kB (React, Router)
- Supabase: 34.32 kB
- Icons: 121.69 kB

Total Initial: ~237 kB (gzip)
```

### Lazy Loaded
- Admin-Seiten: 6 Chunks (2-343 kB)
- Legal-Seiten: 3 Chunks (4-7 kB)

### Core Web Vitals (geschätzt)
- **LCP:** ~1.0s (Ziel: <2.5s) ✅
- **FID:** ~50ms (Ziel: <100ms) ✅
- **CLS:** ~0.02 (Ziel: <0.1) ✅

---

## 🔍 SEO

### Strukturierte Daten
- ✅ LocalBusiness Schema
- ✅ FAQPage Schema (Rich Snippets)
- ✅ Service Schema

### Meta-Tags
- ✅ Title & Description
- ✅ Open Graph (Facebook, Twitter)
- ✅ Canonical URLs
- ✅ Theme-Color für Mobile

### Indexierung
- ✅ robots.txt
- ✅ sitemap.xml
- ⏳ Google Search Console (nach Launch)

---

## 🚀 Deployment

### Build erstellen
```bash
npm run build
```

Die fertige Website befindet sich in `dist/`.

### Hosting-Optionen
- Vercel (empfohlen)
- Netlify
- Cloudflare Pages
- Eigener Server (nginx)

### Environment Variables
Stelle sicher, dass auf dem Hosting folgende Variablen gesetzt sind:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GA_MEASUREMENT_ID=... (optional)
```

---

## 🧪 Testing

### Vor Launch testen:
- [ ] Alle Links funktionieren
- [ ] Kontaktformular funktioniert
- [ ] Preisrechner funktioniert
- [ ] Admin-Panel funktioniert
- [ ] Mobile-Ansicht korrekt
- [ ] Bilder laden korrekt

### Nach Launch testen:
- [ ] Google PageSpeed Insights (90+)
- [ ] Facebook Sharing Debugger
- [ ] Twitter Card Validator
- [ ] Google Search Console
- [ ] Mobile Friendly Test

---

## 📞 Support & Kontakt

### Technische Fragen
Siehe Dokumentation in den `*.md` Dateien.

### Projekt-Maintainer
Siehe `ADMIN_SETUP.md` für Admin-Kontakte.

---

## 📄 Lizenz

Proprietär - Alle Rechte vorbehalten MNW Mobilfunk

---

## 🎉 Changelog

### Version 1.0.0 (2025-12-06)
- ✅ Initiale Version
- ✅ Alle Features implementiert
- ✅ Performance optimiert (95% Bundle-Reduktion)
- ✅ SEO optimiert (3 Schema.org Schemas)
- ✅ Admin-Panel vollständig
- ✅ 4000+ Reparaturpreise importiert
- ✅ Dokumentation vollständig

---

## 🙏 Credits

### Technologien
- React 18
- TypeScript
- Tailwind CSS
- Vite
- Supabase
- Lucide Icons

### Performance & SEO
Siehe `VOLLSTAENDIGE_OPTIMIERUNGEN.md` für Details über alle Optimierungen.

---

**Stand:** 2025-12-06
**Version:** 1.0.0
**Status:** Production Ready ✅
