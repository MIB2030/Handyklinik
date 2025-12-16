/*
  # Verbesserte Suchlogik für exakte Modell-Übereinstimmung

  1. Änderungen
    - Modifiziert search_repairs_fuzzy Funktion für bessere Sortierung
    - Exakte Modell-Übereinstimmungen werden höher priorisiert
    - Verhindert, dass "iPhone 14 Pro" vor anderen "iPhone 14" Reparaturen erscheint

  2. Neue Sortierlogik
    - Stufe 1: Exakte Modell-Übereinstimmung (z.B. "iPhone 14" matched "iPhone 14", nicht "iPhone 14 Pro")
    - Stufe 2: Reparatur-Priorität (Display > Akku > Andere)
    - Stufe 3: Ähnlichkeit zum Suchbegriff
    - Stufe 4: Preis

  Beispiel für Suche "iPhone 14":
  1. iPhone 14 Display
  2. iPhone 14 Akku
  3. iPhone 14 Kamera
  4. iPhone 14 Pro Display (nur wenn noch Platz in Ergebnissen)
*/

CREATE OR REPLACE FUNCTION search_repairs_fuzzy(
  search_query TEXT,
  match_limit INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  hersteller TEXT,
  modell TEXT,
  reparatur TEXT,
  preis NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rp.id,
    rp.hersteller,
    rp.modell,
    rp.reparatur,
    rp.preis
  FROM repair_prices rp
  WHERE 
    similarity(rp.hersteller || ' ' || rp.modell || ' ' || rp.reparatur, search_query) > 0.1
    OR rp.hersteller ILIKE '%' || search_query || '%'
    OR rp.modell ILIKE '%' || search_query || '%'
    OR rp.reparatur ILIKE '%' || search_query || '%'
  ORDER BY 
    -- Stufe 1: Exakte Modell-Übereinstimmung (höchste Priorität)
    CASE 
      WHEN LOWER(rp.modell) = LOWER(search_query) THEN 1
      WHEN rp.modell ILIKE search_query || '%' THEN 2
      WHEN rp.modell ILIKE '%' || search_query || '%' THEN 3
      ELSE 4
    END,
    -- Stufe 2: Reparatur-Priorität (Display, dann Akku)
    CASE 
      WHEN rp.reparatur ILIKE '%display%' THEN 1
      WHEN rp.reparatur ILIKE '%akku%' THEN 2
      ELSE 3
    END,
    -- Stufe 3: Ähnlichkeit zum Suchbegriff
    similarity(rp.hersteller || ' ' || rp.modell || ' ' || rp.reparatur, search_query) DESC,
    -- Stufe 4: Preis
    rp.preis ASC
  LIMIT match_limit;
END;
$$;