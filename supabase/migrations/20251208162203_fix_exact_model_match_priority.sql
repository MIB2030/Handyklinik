/*
  # Fix: Exakte Modell-Übereinstimmung vor allen anderen

  1. Problem
    - "iPhone 14 Pro Display" erscheint vor "iPhone 14 Kamera"
    - Grund: "iPhone 14 Pro" beginnt mit "iPhone 14" und Display hat höhere Priorität

  2. Lösung
    - Stufe 1: EXAKT "iPhone 14" (ohne weitere Zeichen)
    - Stufe 2: Beginnt mit "iPhone 14 " (mit Leerzeichen, z.B. "iPhone 14 Plus")
    - Stufe 3: Enthält "iPhone 14" irgendwo
    
  3. Neue Sortierlogik
    - Erst werden ALLE Reparaturen vom exakten Modell gezeigt
    - Dann erst ähnliche Modelle mit Display-Priorität

  Beispiel "iPhone 14":
  1. iPhone 14 Display
  2. iPhone 14 Akku  
  3. iPhone 14 Kamera
  4. iPhone 14 Lautsprecher
  5. iPhone 14 Plus Display (erst jetzt kommen andere 14er Modelle)
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
    -- Stufe 1: Exakte Modell-Übereinstimmung (HÖCHSTE Priorität - alle Reparaturen dieses Modells zuerst)
    CASE 
      WHEN LOWER(rp.modell) = LOWER(search_query) THEN 1
      WHEN LOWER(rp.modell) LIKE LOWER(search_query) || ' %' THEN 2
      WHEN rp.modell ILIKE '%' || search_query || '%' THEN 3
      ELSE 4
    END,
    -- Stufe 2: Reparatur-Priorität (nur innerhalb derselben Modell-Ebene)
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