# 🚀 Schnellstart: Admin-Benutzer einrichten

## Schritt 1: Supabase Dashboard öffnen

1. Öffnen Sie [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Wählen Sie Ihr Projekt aus (tcdtueusoulolavxzopq)

## Schritt 2: Admin-Benutzer erstellen

### Benutzer im Dashboard anlegen:

1. Klicken Sie links auf **Authentication**
2. Klicken Sie auf **Users**
3. Klicken Sie oben rechts auf **Add User** → **Create new user**

**Erstellen Sie ZWEI Benutzer:**

**Benutzer 1 (Moritz):**
```
Email: info@mnw-mobilfunk.de
Password: Aspire5536
✓ Auto Confirm User (Häkchen setzen!)
```

**Benutzer 2 (Marc):**
```
Email: service@mnw-mobilfunk.de
Password: Aspire5536
✓ Auto Confirm User (Häkchen setzen!)
```

## Schritt 3: Admin-Rollen zuweisen

1. Klicken Sie links auf **SQL Editor**
2. Klicken Sie auf **New query**
3. Kopieren Sie folgenden SQL-Code und fügen Sie ihn ein:

```sql
-- Admin-Rolle für beide Benutzer zuweisen
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email IN ('info@mnw-mobilfunk.de', 'service@mnw-mobilfunk.de')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Prüfen, ob es funktioniert hat
SELECT
  u.email,
  ur.role,
  ur.created_at
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
ORDER BY ur.created_at DESC;
```

4. Klicken Sie auf **Run** (oder drücken Sie Cmd/Ctrl + Enter)
5. Sie sollten beide Benutzer mit der Rolle "admin" sehen

## Schritt 4: Login testen

1. Öffnen Sie Ihre Website
2. Scrollen Sie ganz nach unten zum Footer
3. Klicken Sie auf den kleinen Punkt **·** in der Link-Spalte
4. Melden Sie sich mit einem der Admin-Accounts an:
   - **info@mnw-mobilfunk.de** / Aspire5536
   - **service@mnw-mobilfunk.de** / Aspire5536

## ✅ Fertig!

Sie haben jetzt vollen Zugriff auf:
- `/admin` - Dashboard
- `/admin/content` - Texte bearbeiten
- `/admin/prices` - Preise verwalten + Excel-Import
- `/admin/services` - Dienstleistungen verwalten
- `/admin/faq` - FAQ bearbeiten
- `/admin/testimonials` - Bewertungen verwalten
- `/admin/users` - Weitere Admins hinzufügen

---

## 📤 Excel-Import für Preise

1. Gehen Sie zu `/admin/prices`
2. Klicken Sie auf **Excel importieren**
3. Wählen Sie Ihre Excel-Datei aus

Die Datei muss diese Spalten enthalten:
- Gerätekategorie / device_category
- Hersteller / manufacturer
- Modell / model
- Reparaturtyp / repair_type
- Preis / price
- Dauer / duration

---

## ❓ Probleme?

**Login funktioniert nicht:**
- Prüfen Sie, ob "Auto Confirm User" beim Erstellen aktiviert war
- Prüfen Sie im SQL Editor: `SELECT * FROM user_roles;`

**Keine Admin-Rechte:**
- Führen Sie das SQL-Statement aus Schritt 3 erneut aus

**Weitere Fragen:**
- info@mnw-mobilfunk.de
- service@mnw-mobilfunk.de
