/*
  # Create Fuzzy Search Function

  1. Function
    - search_repairs_fuzzy: Performs fuzzy search on repair prices
    - Uses trigram similarity for typo-tolerant search
    - Searches across manufacturer, model, and repair type
    - Returns top matches sorted by relevance

  2. Security
    - Function is accessible to all users (public)
    - Only returns existing data, no modifications

  3. Notes
    - Similarity threshold set to 0.2 for lenient matching
    - Lower threshold = more lenient with typos
    - Returns maximum of match_limit results
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
    similarity(rp.hersteller || ' ' || rp.modell || ' ' || rp.reparatur, search_query) DESC,
    rp.preis ASC
  LIMIT match_limit;
END;
$$;