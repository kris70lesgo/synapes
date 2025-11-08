-- Phase 3: Tiger Postgres Advanced Features Setup

-- ============================================
-- 1. ENABLE EXTENSIONS
-- ============================================

-- Trigram similarity for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- B-tree GIN indexes for better performance
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Already have pgvector for semantic search
-- CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- 2. ADD SEARCH COLUMNS
-- ============================================

-- Add full-text search column to playbooks
ALTER TABLE playbooks 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Add metadata for analytics
ALTER TABLE playbooks
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMPTZ;

-- Add compression tracking
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS compressed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS compressed_at TIMESTAMPTZ;

-- ============================================
-- 3. CREATE INDEXES FOR FAST SEARCH
-- ============================================

-- Trigram index for fuzzy text search on task names
CREATE INDEX IF NOT EXISTS playbook_name_trgm_idx 
ON playbooks USING gin(task_name gin_trgm_ops);

-- Full-text search index
CREATE INDEX IF NOT EXISTS playbook_search_idx 
ON playbooks USING gin(search_vector);

-- Performance indexes
CREATE INDEX IF NOT EXISTS playbook_confidence_idx 
ON playbooks(confidence DESC);

CREATE INDEX IF NOT EXISTS playbook_created_idx 
ON playbooks(created_at DESC);

CREATE INDEX IF NOT EXISTS playbook_updated_idx 
ON playbooks(updated_at DESC);

CREATE INDEX IF NOT EXISTS document_created_idx 
ON documents(created_at DESC);

-- ============================================
-- 4. CREATE TRIGGER FOR AUTO-UPDATE SEARCH
-- ============================================

-- Function to automatically update search_vector
CREATE OR REPLACE FUNCTION update_playbook_search()
RETURNS trigger AS $$
BEGIN
  -- Combine all searchable text into one tsvector
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.task_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.task_context, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(
      ARRAY(
        SELECT jsonb_array_elements_text(
          NEW.steps::jsonb -> 'action'
        )
      ), ' '
    ), '')), 'C');
  
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS playbook_search_update ON playbooks;
CREATE TRIGGER playbook_search_update
  BEFORE INSERT OR UPDATE ON playbooks
  FOR EACH ROW
  EXECUTE FUNCTION update_playbook_search();

-- ============================================
-- 5. POPULATE SEARCH VECTORS FOR EXISTING DATA
-- ============================================

-- Update existing playbooks with search vectors
UPDATE playbooks
SET search_vector = 
  setweight(to_tsvector('english', coalesce(task_name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(task_context, '')), 'B')
WHERE search_vector IS NULL;

-- ============================================
-- 6. CREATE CONTINUOUS AGGREGATES (TimescaleDB)
-- ============================================

-- Daily playbook statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS playbook_daily_stats
WITH (timescaledb.continuous) AS
SELECT 
  time_bucket('1 day', created_at) as day,
  count(*) as total_playbooks,
  avg(confidence) as avg_confidence,
  count(DISTINCT document_id) as unique_documents,
  count(CASE WHEN confidence >= 0.8 THEN 1 END) as high_confidence_count
FROM playbooks
GROUP BY day
WITH NO DATA;

-- Refresh policy: update every hour
SELECT add_continuous_aggregate_policy('playbook_daily_stats',
  start_offset => INTERVAL '1 month',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour'
);

-- Hourly extraction statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS extraction_hourly_stats
WITH (timescaledb.continuous) AS
SELECT 
  time_bucket('1 hour', created_at) as hour,
  count(*) as documents_processed,
  sum(jsonb_array_length(COALESCE((
    SELECT jsonb_agg(p.id) 
    FROM playbooks p 
    WHERE p.document_id = documents.id
  ), '[]'::jsonb))) as playbooks_extracted
FROM documents
GROUP BY hour
WITH NO DATA;

-- ============================================
-- 7. ADD COMPRESSION POLICY (TimescaleDB)
-- ============================================

-- Enable compression on playbooks table (compress data older than 30 days)
-- This can reduce storage by 70%+
ALTER TABLE playbooks SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'document_id',
  timescaledb.compress_orderby = 'created_at DESC'
);

-- Add compression policy
SELECT add_compression_policy('playbooks', INTERVAL '30 days');

-- ============================================
-- 8. CREATE HELPER VIEWS
-- ============================================

-- View for recent playbooks with document info
CREATE OR REPLACE VIEW recent_playbooks AS
SELECT 
  p.*,
  d.title as document_title,
  d.file_path as document_path,
  EXTRACT(EPOCH FROM (NOW() - p.created_at)) as age_seconds
FROM playbooks p
LEFT JOIN documents d ON p.document_id = d.id
ORDER BY p.created_at DESC;

-- View for search statistics
CREATE OR REPLACE VIEW search_stats AS
SELECT 
  count(*) as total_playbooks,
  count(CASE WHEN search_vector IS NOT NULL THEN 1 END) as searchable_playbooks,
  avg(confidence) as avg_confidence,
  max(created_at) as last_extraction
FROM playbooks;

-- ============================================
-- 9. CREATE UTILITY FUNCTIONS
-- ============================================

-- Function to search playbooks with fuzzy matching
CREATE OR REPLACE FUNCTION search_playbooks_fuzzy(query_text TEXT, limit_count INT DEFAULT 10)
RETURNS TABLE (
  id INTEGER,
  task_name TEXT,
  similarity REAL,
  confidence REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.task_name,
    similarity(p.task_name, query_text) as similarity,
    p.confidence
  FROM playbooks p
  WHERE p.task_name % query_text  -- Trigram similarity operator
  ORDER BY similarity DESC, p.confidence DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to search with full-text search
CREATE OR REPLACE FUNCTION search_playbooks_fulltext(query_text TEXT, limit_count INT DEFAULT 10)
RETURNS TABLE (
  id INTEGER,
  task_name TEXT,
  rank REAL,
  confidence REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.task_name,
    ts_rank(p.search_vector, plainto_tsquery('english', query_text)) as rank,
    p.confidence
  FROM playbooks p
  WHERE p.search_vector @@ plainto_tsquery('english', query_text)
  ORDER BY rank DESC, p.confidence DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get analytics summary
CREATE OR REPLACE FUNCTION get_analytics_summary()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_playbooks', (SELECT count(*) FROM playbooks),
    'total_documents', (SELECT count(*) FROM documents),
    'avg_confidence', (SELECT round(avg(confidence)::numeric, 2) FROM playbooks),
    'high_confidence', (SELECT count(*) FROM playbooks WHERE confidence >= 0.8),
    'searchable', (SELECT count(*) FROM playbooks WHERE search_vector IS NOT NULL),
    'last_extraction', (SELECT max(created_at) FROM playbooks)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. GRANT PERMISSIONS
-- ============================================

-- Ensure tsdbadmin has all necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO tsdbadmin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO tsdbadmin;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO tsdbadmin;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify extensions
-- SELECT extname, extversion FROM pg_extension WHERE extname IN ('pg_trgm', 'vector', 'btree_gin', 'timescaledb');

-- Verify indexes
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename IN ('playbooks', 'documents') ORDER BY indexname;

-- Test fuzzy search
-- SELECT * FROM search_playbooks_fuzzy('deploy');

-- Test full-text search
-- SELECT * FROM search_playbooks_fulltext('kubernetes deployment');

-- Get analytics summary
-- SELECT get_analytics_summary();

-- View compression stats
-- SELECT * FROM timescaledb_information.compression_settings WHERE hypertable_name = 'playbooks';

-- ============================================
-- NOTES
-- ============================================

-- 1. Fuzzy Search: Use % operator for similarity matching
--    Example: SELECT * FROM playbooks WHERE task_name % 'deploy';

-- 2. Full-Text Search: Use @@ operator with to_tsquery or plainto_tsquery
--    Example: SELECT * FROM playbooks WHERE search_vector @@ plainto_tsquery('kubernetes');

-- 3. Vector Search: Already implemented with <=> operator
--    Example: SELECT * FROM playbooks ORDER BY embedding <=> $1::vector LIMIT 10;

-- 4. Continuous Aggregates: Auto-updating materialized views
--    Refresh manually: CALL refresh_continuous_aggregate('playbook_daily_stats', NULL, NULL);

-- 5. Compression: Automatically compresses old data to save 70%+ storage
--    Check status: SELECT * FROM timescaledb_information.compressed_chunk_stats;

-- ============================================
-- PERFORMANCE TIPS
-- ============================================

-- 1. Use trigram search (%) for user-typed fuzzy matching (e.g., autocomplete)
-- 2. Use full-text search (@@) for natural language queries
-- 3. Use vector search (<=>)  for semantic similarity
-- 4. Combine all three for hybrid search!

-- Example hybrid search:
-- SELECT 
--   p.*,
--   similarity(p.task_name, 'deploy') as fuzzy_score,
--   ts_rank(p.search_vector, plainto_tsquery('deploy')) as text_score,
--   1 - (p.embedding <=> $1::vector) as vector_score
-- FROM playbooks p
-- WHERE 
--   p.task_name % 'deploy' OR 
--   p.search_vector @@ plainto_tsquery('deploy')
-- ORDER BY (fuzzy_score + text_score + vector_score) DESC;
