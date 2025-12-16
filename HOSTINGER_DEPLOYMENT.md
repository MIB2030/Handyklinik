# Hostinger Deployment Anleitung

## Deployment-Paket bereit

**Datei:** `phone-klinik-hostinger-final-20251215_093537.zip` (2.3 MB)

## Was ist enthalten?

### Saubere Struktur:
- **Alle optimierten Build-Dateien** (HTML, CSS, JS)
- **Bilder (bereinigt):**
  - `handyklinik_logo.png` - Header Logo
  - `wertgarantie_logo_1.jpg` - Wertgarantie Partner Logo
  - `slide_1.jpg` - Hero Slider Bild 1
  - `slide_2.jpg` - Hero Slider Bild 2
- **SEO-Dateien:**
  - `robots.txt`
  - `sitemap.xml`
- **Apache-Konfiguration:**
  - `.htaccess` (für SPA-Routing und Caching)

### Keine Duplicate/Copy-Dateien mehr!

## Deployment-Schritte bei Hostinger

### 1. Bei Hostinger einloggen
- Gehe zu hPanel
- Wähle deine Domain aus

### 2. File Manager öffnen
- Navigiere zu `public_html/`

### 3. Alte Dateien löschen (WICHTIG!)
- Lösche alle alten Dateien im `public_html/` Ordner
- Behalte nur: `.htaccess` (falls vorhanden), `cgi-bin/` Ordner

### 4. Upload des neuen Builds
- Lade `phone-klinik-hostinger-final-20251215_093537.zip` hoch
- Entpacke die ZIP-Datei
- Verschiebe den Inhalt von `dist/` direkt nach `public_html/`
  - Struktur sollte sein: `public_html/index.html`, `public_html/assets/`, etc.
  - NICHT: `public_html/dist/index.html`

### 5. Berechtigungen prüfen
- Dateien: 644
- Ordner: 755

### 6. .env Variablen prüfen
Stelle sicher, dass folgende Environment Variables bei Hostinger gesetzt sind:

```
VITE_SUPABASE_URL=https://dein-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=dein-anon-key
VITE_TURNSTILE_SITE_KEY=dein-turnstile-key
VITE_LEGAL_API_KEY=dein-legal-api-key
VITE_LEGAL_API_USER_ID=dein-legal-user-id
```

**WICHTIG:** Da diese eine Static Site ist, müssen die Werte bereits beim Build gesetzt sein!

### 7. Testen
- Öffne deine Domain
- Prüfe alle Seiten
- Teste das Routing (alle URLs sollten funktionieren)
- Verifiziere, dass alle Bilder laden

## Wichtige Hinweise

### Apache .htaccess
Die `.htaccess` Datei sorgt für:
- **SPA Routing:** Alle URLs werden zu index.html weitergeleitet
- **Browser Caching:** Bilder, CSS und JS werden gecacht
- **HTML nicht cachen:** Damit Updates sofort sichtbar sind

### Bilder-Optimierung
Alle Bilder sind jetzt sauber benannt und eingebunden:
- Keine Duplikate mehr
- Konsistente Namenskonvention mit Unterstrichen
- Optimierte Dateigröße

## Fehlerbehebung

### Problem: Bilder werden nicht angezeigt
- Prüfe, ob die Dateien im richtigen Ordner liegen
- Pfad sollte sein: `public_html/slide_1.jpg` (nicht in einem Unterordner)

### Problem: Routing funktioniert nicht
- Prüfe, ob `.htaccess` im Root-Verzeichnis liegt
- Stelle sicher, dass `mod_rewrite` aktiviert ist

### Problem: Seite zeigt alte Version
- Leere den Browser-Cache (Strg + Shift + R)
- Prüfe, ob die neuen Dateien wirklich hochgeladen wurden

## Support-Kontakt

Bei Problemen:
1. Prüfe die Browser-Konsole auf Fehler
2. Prüfe die Apache Error Logs bei Hostinger
3. Stelle sicher, dass alle Supabase-Verbindungen funktionieren
