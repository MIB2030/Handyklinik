/*
  # Improve Fuzzy Search Threshold
  
  1. Changes
    - Increase similarity threshold from 0.2 to 0.3 for better relevance
    - This prevents showing irrelevant results for non-existent models
    - Example: Searching "iPhone 28" will now show "not found" instead of weak matches
  
  2. Impact
    - More precise search results
    - Better user experience with "not found" message for truly non-existent items
*/

DROP FUNCTION IF EXISTS public.search_repairs_fuzzy(text, integer);

CREATE OR REPLACE FUNCTION public.search_repairs_fuzzy(
  search_query text,
  match_limit integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  hersteller text,
  modell text,
  reparatur text,
  preis numeric,
  preis_prefix text,
  similarity_score real
)
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rp.id,
    rp.hersteller,
    rp.modell,
    rp.reparatur,
    rp.preis,
    rp.preis_prefix,
    CASE
      -- Exact match gets highest priority
      WHEN LOWER(rp.modell) = LOWER(search_query) THEN 1.0
      -- Word boundary match (e.g., "S22" in "Samsung Galaxy S22")
      WHEN LOWER(rp.modell) ~ ('(^|[^a-z0-9])' || LOWER(regexp_replace(search_query, '([.*+?^${}()|[\]\\])', '\\\1', 'g')) || '($|[^a-z0-9])') THEN 0.95
      -- Contains the search term
      WHEN LOWER(rp.modell) LIKE '%' || LOWER(search_query) || '%' THEN 0.9
      WHEN LOWER(rp.hersteller) LIKE '%' || LOWER(search_query) || '%' THEN 0.85
      WHEN LOWER(rp.reparatur) LIKE '%' || LOWER(search_query) || '%' THEN 0.8
      -- Fuzzy match based on similarity
      ELSE GREATEST(
        similarity(LOWER(rp.modell), LOWER(search_query)),
        similarity(LOWER(rp.hersteller), LOWER(search_query)),
        similarity(LOWER(rp.reparatur), LOWER(search_query)) * 0.8
      )
    END as similarity_score
  FROM public.repair_prices rp
  WHERE 
    LOWER(rp.modell) LIKE '%' || LOWER(search_query) || '%'
    OR LOWER(rp.hersteller) LIKE '%' || LOWER(search_query) || '%'
    OR LOWER(rp.reparatur) LIKE '%' || LOWER(search_query) || '%'
    OR similarity(LOWER(rp.modell), LOWER(search_query)) > 0.3
    OR similarity(LOWER(rp.hersteller), LOWER(search_query)) > 0.3
    OR similarity(LOWER(rp.reparatur), LOWER(search_query)) > 0.3
  ORDER BY similarity_score DESC, rp.hersteller, rp.modell
  LIMIT match_limit;
END;
$$;