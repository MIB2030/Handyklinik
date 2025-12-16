#!/bin/bash

# KOMPLETTES Projekt-Backup Script
# Erstellt ein vollständiges Archiv mit Frontend, Backend, Datenbank, Bilder, etc.

echo "Starte KOMPLETTES Projekt-Backup..."

# Datum für Dateinamen
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME_TAR="projekt_komplett_${BACKUP_DATE}.tar.gz"
BACKUP_NAME_ZIP="projekt_komplett_${BACKUP_DATE}.zip"

# Wechsle zum Projekt-Verzeichnis
cd "$(dirname "$0")/.." || exit 1

# Erstelle TAR.GZ-Archiv mit ALLEM
echo "Erstelle TAR.GZ Backup-Archiv: ${BACKUP_NAME_TAR}"
tar -czf "${BACKUP_NAME_TAR}" \
    --exclude="node_modules" \
    --exclude="dist" \
    --exclude="*.tar.gz" \
    --exclude="*.zip" \
    --exclude=".git" \
    src/ \
    public/ \
    backup/ \
    scripts/ \
    supabase/ \
    *.md \
    *.json \
    *.js \
    *.ts \
    *.sql \
    *.html \
    .env \
    .gitignore \
    chunk_* 2>/dev/null

# Erstelle ZIP-Archiv mit ALLEM
echo "Erstelle ZIP Backup-Archiv: ${BACKUP_NAME_ZIP}"
zip -r -q "${BACKUP_NAME_ZIP}" \
    src/ \
    public/ \
    backup/ \
    scripts/ \
    supabase/ \
    *.md \
    *.json \
    *.js \
    *.ts \
    *.sql \
    *.html \
    .env \
    .gitignore \
    chunk_* \
    -x "node_modules/*" "dist/*" "*.tar.gz" "*.zip" ".git/*" 2>/dev/null

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ KOMPLETTES Projekt-Backup erfolgreich erstellt!"
    echo ""
    echo "Backup enthält:"
    echo "  📁 src/ (Frontend-Code komplett)"
    echo "  📁 public/ (Alle Bilder, favicon, robots.txt, sitemap.xml)"
    echo "  📁 backup/ (SQL-Daten & Dokumentation)"
    echo "  📁 scripts/ (Import- & Admin-Scripts)"
    echo "  📁 supabase/"
    echo "     ├─ migrations/ (17 Datenbank-Migrationen)"
    echo "     └─ functions/ (Backend/Edge Functions)"
    echo "  📄 Alle Konfig-Dateien (package.json, vite.config.ts, tailwind, etc.)"
    echo "  📄 .env (Umgebungsvariablen)"
    echo "  📄 Dokumentation (*.md Dateien)"
    echo "  📄 SQL-Dateien & Chunks"
    echo ""
    echo "Dateien:"
    echo "  📦 ${BACKUP_NAME_TAR} ($(du -h "${BACKUP_NAME_TAR}" | cut -f1))"
    echo "  📦 ${BACKUP_NAME_ZIP} ($(du -h "${BACKUP_NAME_ZIP}" | cut -f1))"
    echo ""
    echo "Speicherort: $(pwd)/"
else
    echo "✗ Fehler beim Erstellen des Backups!"
    exit 1
fi
