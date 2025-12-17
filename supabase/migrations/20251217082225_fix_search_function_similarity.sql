/*
  # Fix Search Function Similarity Access
  
  1. Issue Fixed
    - The similarity() function from pg_trgm extension wasn't accessible due to search_path
    - Update search_path to include extensions schema
  
  2. Changes
    - Modified search_path to allow access to pg_trgm functions
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
    CASE
      -- Exact match gets highest priority
      WHEN LOWER(rp.modell) = LOWER(search_query) THEN 1.0
      -- Word boundary match (e.g., "S22" in "Samsung Galaxy S22")
      WHEN LOWER(rp.modell) ~ ('(^|[^a-z0-9])' || LOWER(regexp_replace(search_query, '([.*+?^${}()|[\]\\])', '\\\1', 'g')) || '($|[^a-z0-9])') THEN 0.95
      -- Contains the search term
      WHEN LOWER(rp.modell) LIKE '%' || LOWER(search_query) || '%' THEN 0.9
      -- Fuzzy match based on similarity
      ELSE GREATEST(
        similarity(LOWER(rp.modell), LOWER(search_query)),
        similarity(LOWER(rp.hersteller), LOWER(search_query))
      )
    END as similarity_score
  FROM public.repair_prices rp
  WHERE 
    LOWER(rp.modell) LIKE '%' || LOWER(search_query) || '%'
    OR LOWER(rp.hersteller) LIKE '%' || LOWER(search_query) || '%'
    OR similarity(LOWER(rp.modell), LOWER(search_query)) > 0.2
    OR similarity(LOWER(rp.hersteller), LOWER(search_query)) > 0.2
  ORDER BY similarity_score DESC, rp.hersteller, rp.modell
  LIMIT match_limit;
END;
$$;
