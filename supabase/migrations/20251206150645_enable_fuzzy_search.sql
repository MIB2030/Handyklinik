/*
  # Enable Fuzzy Search for Repair Prices

  1. Extensions
    - Enable pg_trgm extension for trigram similarity search
    - Allows fuzzy matching with typo tolerance

  2. Index
    - Create GIN index on combined search fields
    - Improves search performance for manufacturer, model, and repair type

  3. Notes
    - Trigram similarity helps find matches even with spelling errors
    - Similarity threshold can be adjusted (default 0.3)
*/

-- Enable trigram extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create index for faster fuzzy search
CREATE INDEX IF NOT EXISTS repair_prices_search_idx ON repair_prices 
USING gin ((hersteller || ' ' || modell || ' ' || reparatur) gin_trgm_ops);