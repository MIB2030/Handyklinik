# Open Graph Image Anleitung

## Was ist ein Open Graph Image?

Ein Open Graph (OG) Image ist das Vorschaubild, das angezeigt wird, wenn jemand deine Website auf Social Media (Facebook, WhatsApp, LinkedIn, Twitter) teilt.

**Aktueller Status:** ⏳ Platzhalter in Meta-Tags, echtes Bild fehlt noch

---

## 📐 Technische Anforderungen

### Bildgröße (wichtig!)
- **Breite:** 1200 Pixel
- **Höhe:** 630 Pixel
- **Seitenverhältnis:** 1.91:1
- **Format:** JPG oder PNG
- **Dateigröße:** Max. 8 MB (empfohlen: unter 300 KB)

### Dateiname
- `og-image.jpg` (empfohlen) oder `og-image.png`
- Speicherort: `public/og-image.jpg`

---

## 🎨 Design-Empfehlungen

### Was sollte drauf sein?

1. **Firmenlogo** (groß und zentral)
2. **Firmenname:** "MNW Mobilfunk"
3. **Tagline:** z.B. "Professionelle Handy-Reparatur in Ottobrunn"
4. **Key-Selling-Points:**
   - Express-Service
   - 90 Tage Garantie
   - WERTGARANTIE Partner
5. **Telefonnummer:** 089 / 63 28 69 04
6. **Optional:** Smartphone-Icon oder Reparatur-Illustration

### Design-Tipps:
- ✅ Klarer, einfacher Hintergrund (kein Unruhiger)
- ✅ Hoher Kontrast (Text muss gut lesbar sein)
- ✅ Große Schrift (wird oft klein angezeigt)
- ✅ Zentriertes Design (Safe Zone beachten!)
- ✅ Branding-Farben verwenden (Blau wie auf der Website)
- ❌ Kein Text am Rand (wird oft abgeschnitten)
- ❌ Nicht zu viel Text (max. 3-4 Zeilen)

### Safe Zone
Halte wichtige Elemente in der Safe Zone (1104x527px zentriert), da manche Plattformen das Bild zuschneiden.

---

## 🛠️ Erstellung - 3 Optionen

### Option 1: Online-Generator (Einfachste Methode)
**Empfohlen für Nicht-Designer**

1. **Canva** (kostenlos): https://www.canva.com
   - Template suchen: "Facebook Post" oder "Open Graph"
   - Auf 1200x630px einstellen
   - Logo hochladen
   - Text hinzufügen
   - Als JPG exportieren

2. **Placeit** (kostenpflichtig): https://placeit.net
   - Professionelle Templates
   - Schnelle Anpassung
   - Export als JPG

3. **og-image-generator**: https://www.opengraph.xyz
   - Spezialisiert auf OG-Images
   - Viele Templates
   - Kostenlos

### Option 2: Photoshop / GIMP (Für Designer)
**Wenn du mit Bildbearbeitung vertraut bist**

1. Neues Dokument: 1200x630px
2. Hintergrund gestalten (z.B. Blau-Gradient)
3. Logo einfügen (zentriert, groß)
4. Text hinzufügen (gut lesbar, hoher Kontrast)
5. Exportieren als JPG (Qualität: 80-90%)

### Option 3: Beauftragen (Professionell)
**Für beste Qualität**

- Fiverr: Ab 5-20€
- 99designs: Ab 50€
- Lokaler Grafikdesigner: Ab 100€

---

## 📁 Installation nach Erstellung

1. **Bild erstellt?** → Als `og-image.jpg` speichern
2. **In Projekt kopieren:**
   - Datei in den `public/` Ordner kopieren
   - Pfad sollte sein: `public/og-image.jpg`
3. **Fertig!** Die Meta-Tags sind bereits in `index.html` vorbereitet

### Bereits vorbereitet in index.html:
```html
<meta property="og:image" content="https://mnw-mobilfunk.de/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:image" content="https://mnw-mobilfunk.de/og-image.jpg" />
```

Sobald du `public/og-image.jpg` hinzufügst, wird es automatisch verwendet!

---

## 🧪 Testen nach Upload

Nach dem Upload solltest du das OG-Image testen:

### 1. Facebook Sharing Debugger
- URL: https://developers.facebook.com/tools/debug/
- Eingabe: https://mnw-mobilfunk.de
- Klicke "Scrape Again" um Cache zu leeren
- Vorschau sollte dein Bild zeigen

### 2. Twitter Card Validator
- URL: https://cards-dev.twitter.com/validator
- Eingabe: https://mnw-mobilfunk.de
- Vorschau prüfen

### 3. LinkedIn Post Inspector
- URL: https://www.linkedin.com/post-inspector/
- Eingabe: https://mnw-mobilfunk.de
- Vorschau prüfen

### 4. Open Graph Check
- URL: https://www.opengraph.xyz
- Universeller Checker für alle Plattformen

---

## 🎯 Beispiel-Texte für dein OG-Image

### Variante 1 (Kurz & knackig):
```
MNW Mobilfunk
Handy-Reparatur Ottobrunn

✓ Express in 1h  ✓ 90 Tage Garantie
089 / 63 28 69 04
```

### Variante 2 (Mit Features):
```
MNW Mobilfunk
Ihr Profi für Handy-Reparatur

iPhone • Samsung • Huawei
Express-Service • 90 Tage Garantie
WERTGARANTIE Partner

089 / 63 28 69 04
```

### Variante 3 (Emotional):
```
Display kaputt?
Wir helfen sofort!

MNW Mobilfunk Ottobrunn
Reparatur in 1 Stunde
089 / 63 28 69 04
```

---

## 📊 Warum ist das OG-Image wichtig?

### Vorteile:
- ✅ **Professioneller Eindruck** beim Teilen
- ✅ **Höhere Click-Rate** (bis zu 3x mehr Klicks)
- ✅ **Brand Recognition** (Logo wird sichtbar)
- ✅ **Vertrauensbildung** (zeigt Professionalität)
- ✅ **SEO-Vorteil** (indirekt durch mehr Engagement)

### Ohne OG-Image:
- ❌ Facebook/WhatsApp zeigt irgendein Bild von der Seite
- ❌ Oder: Kein Bild → weniger Klicks
- ❌ Unprofessioneller Eindruck
- ❌ Verpasste Marketing-Chance

---

## 🎨 Beispiel-Layout (ASCII)

```
┌─────────────────────────────────────────────┐
│                                             │
│          [DEIN LOGO 300x300px]              │
│                                             │
│         MNW MOBILFUNK OTTOBRUNN            │
│                                             │
│    ✓ Express-Service  ✓ 90 Tage Garantie   │
│    ✓ WERTGARANTIE Partner                  │
│                                             │
│         089 / 63 28 69 04                   │
│                                             │
└─────────────────────────────────────────────┘
      1200px × 630px (Safe Zone beachten)
```

---

## 📝 Checkliste

Vor dem Upload:
- [ ] Bild ist genau 1200x630 Pixel
- [ ] Format ist JPG oder PNG
- [ ] Dateigröße unter 500 KB
- [ ] Logo ist gut sichtbar
- [ ] Text ist groß und lesbar
- [ ] Wichtige Elemente in Safe Zone (nicht am Rand)
- [ ] Hoher Kontrast (Text auf Hintergrund)
- [ ] Keine Rechtschreibfehler
- [ ] Branding-Farben verwendet

Nach dem Upload:
- [ ] Datei als `public/og-image.jpg` gespeichert
- [ ] Facebook Debugger getestet
- [ ] Twitter Card Validator getestet
- [ ] WhatsApp Vorschau getestet
- [ ] Cache auf allen Plattformen geleert

---

## 💡 Profi-Tipps

### Design:
1. **Keep it simple** - Weniger ist mehr
2. **Mobile-first** - Wird oft auf Smartphones angesehen
3. **A/B Testing** - Verschiedene Versionen testen
4. **Saisonal anpassen** - Zu Weihnachten anders gestalten

### Technisch:
1. **Komprimierung** - Tools wie TinyPNG nutzen
2. **WebP-Alternative** - Moderne Browser unterstützen WebP
3. **Verschiedene Größen** - Für verschiedene Plattformen
4. **Cache-Busting** - Nach Änderung URL anpassen: `og-image.jpg?v=2`

---

## ❓ Häufige Probleme

### Problem: Facebook zeigt altes Bild
**Lösung:** Facebook Debugger nutzen und "Scrape Again" klicken

### Problem: Bild wird abgeschnitten
**Lösung:** Safe Zone beachten (wichtige Elemente 50px vom Rand entfernt)

### Problem: Bild ist verschwommen
**Lösung:** Höhere Auflösung verwenden (min. 1200x630px)

### Problem: Text zu klein
**Lösung:** Mindestens 48px Schriftgröße verwenden

---

## 🚀 Quick-Start (5 Minuten)

1. Gehe zu **Canva.com**
2. Wähle "Custom size" → 1200 x 630 px
3. Füge dein Logo ein
4. Füge Text hinzu (siehe Beispiele oben)
5. Exportiere als JPG
6. Speichere als `public/og-image.jpg`
7. Teste auf Facebook Debugger
8. **Fertig!**

---

**Geschätzter Zeitaufwand:** 30-60 Minuten (mit Canva)
**Schwierigkeit:** Leicht
**Priorität:** Hoch (wichtig für Social Media Sharing)

---

**Stand:** 2025-12-06
**Status:** ⏳ Anleitung erstellt, Bild muss noch erstellt werden
**Meta-Tags:** ✅ Bereits in index.html vorbereitet
