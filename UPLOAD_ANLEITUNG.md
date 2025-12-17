# Upload-Anleitung für Hostinger

## Problem behoben
Die .htaccess-Datei wurde erstellt und löst das 404-Problem beim Routing.

## Upload-Schritte

1. **Verbinde dich mit deinem Hostinger File Manager oder FTP**
   - Gehe zu hPanel > File Manager
   - Navigiere zum public_html Ordner

2. **Lade den gesamten Inhalt des dist/ Ordners hoch**
   - WICHTIG: Lade ALLE Dateien aus dem `dist/` Ordner hoch
   - Stelle sicher, dass auch die `.htaccess` Datei hochgeladen wird
   - Die .htaccess-Datei ist versteckt - aktiviere "Versteckte Dateien anzeigen"

3. **Überprüfe, dass folgende Dateien vorhanden sind:**
   - `.htaccess` (versteckte Datei!)
   - `index.html`
   - `assets/` Ordner mit allen JS/CSS Dateien
   - Alle Bilder und Icons

## Was die .htaccess-Datei macht

Die .htaccess-Datei sorgt dafür, dass:
- Alle Routen (z.B. `/admin`) korrekt funktionieren
- Der Browser zur index.html umgeleitet wird
- Security-Header gesetzt werden
- GZIP-Kompression aktiviert ist
- Browser-Caching optimiert wird

## Nach dem Upload

1. Lösche den Browser-Cache (Strg+Shift+R)
2. Gehe zu https://handyklinikottobrunn.de/admin
3. Login sollte jetzt funktionieren mit:
   - Benutzername: **moritz** oder **marc**
   - Passwort: **Aspire5536**

## Bei Problemen

Falls die .htaccess-Datei nicht funktioniert:
1. Prüfe ob mod_rewrite auf dem Server aktiviert ist (sollte bei Hostinger Standard sein)
2. Kontaktiere Hostinger Support falls nötig
