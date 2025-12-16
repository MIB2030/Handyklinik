/*
  # Update Fuzzy Search with Priority Sorting

  1. Changes
    - Modified search_repairs_fuzzy function to prioritize Display and Akku repairs
    - Display repairs appear first, followed by Akku, then all others
    - Maintains fuzzy search capability while respecting priority order

  2. Priority Order
    - Display repairs (Displaytausch, Display, etc.)
    - Akku repairs (Akkutausch, Akku, etc.)
    - All other repairs sorted by price
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
    CASE 
      WHEN rp.reparatur ILIKE '%display%' THEN 1
      WHEN rp.reparatur ILIKE '%akku%' THEN 2
      ELSE 3
    END,
    similarity(rp.hersteller || ' ' || rp.modell || ' ' || rp.reparatur, search_query) DESC,
    rp.preis ASC
  LIMIT match_limit;
END;
$$;