/*
  # Fix: Exakte Wortgrenze für Modell-Matching

  1. Problem
    - "iPhone 14 Pro Display" kommt vor "iPhone 14 Akku"
    - Grund: "iPhone 14 Pro" enthält "iPhone 14" → wird als Match erkannt
    
  2. Lösung
    - Level 1: Modell endet mit Suchbegriff (z.B. "Apple iPhone 14" endet mit "iPhone 14")
    - Level 2: Modell enthält Suchbegriff + Leerzeichen danach (z.B. "iPhone 14 Plus")
    - Level 3: Modell enthält Suchbegriff irgendwo
    
  3. Ergebnis für "iPhone 14"
    - Alle "Apple iPhone 14" Reparaturen zuerst (Score: 1001-1999)
    - Dann "iPhone 14 Plus/Pro/Pro Max" (Score: 2001-2999)

  4. Beispiel
    Input: "iPhone 14"
    - "Apple iPhone 14" → Level 1 (endet mit "iPhone 14")
    - "iPhone 14 Plus" → Level 2 (enthält "iPhone 14 ")
    - "iPhone 14 Pro" → Level 2 (enthält "iPhone 14 ")
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
    -- Kombinierter Score mit Wortgrenzen-Erkennung
    (
      CASE 
        -- Level 1: Modell endet EXAKT mit Suchbegriff (z.B. "Apple iPhone 14" endet mit "iPhone 14")
        WHEN rp.modell ILIKE '%' || search_query AND 
             rp.modell NOT ILIKE '%' || search_query || ' %' THEN 1000
        
        -- Level 2: Modell enthält Suchbegriff gefolgt von Leerzeichen (z.B. "iPhone 14 Plus")
        WHEN rp.modell ILIKE '%' || search_query || ' %' THEN 2000
        
        -- Level 3: Modell enthält Suchbegriff irgendwo (Fallback)
        WHEN rp.modell ILIKE '%' || search_query || '%' THEN 3000
        
        -- Level 4: Rest (nur via Similarity gefunden)
        ELSE 4000
      END
      +
      -- Reparatur-Priorität innerhalb jedes Levels
      CASE 
        WHEN rp.reparatur ILIKE '%display%' THEN 1
        WHEN rp.reparatur ILIKE '%akku%' THEN 2
        ELSE 3
      END
    ) ASC,
    -- Ähnlichkeit als Tie-Breaker
    similarity(rp.hersteller || ' ' || rp.modell || ' ' || rp.reparatur, search_query) DESC,
    -- Preis als letztes Kriterium
    rp.preis ASC
  LIMIT match_limit;
END;
$$;