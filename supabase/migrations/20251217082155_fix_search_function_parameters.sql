/*
  # Fix Search Function Parameters
  
  1. Issues Fixed
    - Update search_repairs_fuzzy function to accept correct parameter names
    - Change parameter name from search_term to search_query (to match frontend)
    - Add match_limit parameter (to match frontend call)
    - Fix column names to match actual database schema (German names)
    - Update return type to use German column names matching the frontend interface
  
  2. Changes
    - Function now accepts: search_query (text) and match_limit (integer)
    - Uses correct column names: hersteller, modell, reparatur, preis
    - Returns: id, hersteller, modell, reparatur, preis, similarity_score
*/

-- Drop existing function first
DROP FUNCTION IF EXISTS public.search_repairs_fuzzy(text);
DROP FUNCTION IF EXISTS public.search_repairs_fuzzy(text, integer);

-- Create new function with correct parameters and return type
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
SET search_path = public, pg_temp
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
