-- Read-performance indexes for browse/detail/activity queries

-- Needed for fast ILIKE search on name/description
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Browse tools: filters + sorting
CREATE INDEX IF NOT EXISTS idx_tools_category_created_at
  ON public.tools(category, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tools_category_votes
  ON public.tools(category, votes DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tools_created_at_desc
  ON public.tools(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tools_name_lower
  ON public.tools(LOWER(name));

-- ILIKE search acceleration
CREATE INDEX IF NOT EXISTS idx_tools_name_trgm
  ON public.tools USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_tools_description_trgm
  ON public.tools USING GIN (description gin_trgm_ops);

-- Array metadata lookups (tags/models/features/capabilities)
CREATE INDEX IF NOT EXISTS idx_tools_tags_gin
  ON public.tools USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_tools_models_gin
  ON public.tools USING GIN (models);

CREATE INDEX IF NOT EXISTS idx_tools_features_gin
  ON public.tools USING GIN (features);

CREATE INDEX IF NOT EXISTS idx_tools_ai_capabilities_gin
  ON public.tools USING GIN (ai_capabilities);

CREATE INDEX IF NOT EXISTS idx_tools_use_cases_gin
  ON public.tools USING GIN (use_cases);

-- Featured rails for dashboard widgets
CREATE INDEX IF NOT EXISTS idx_tools_featured_created_at
  ON public.tools(featured, created_at DESC);

-- Activities: timeline and filters
CREATE INDEX IF NOT EXISTS idx_activities_user_created_at
  ON public.activities(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activities_tool_created_at
  ON public.activities(tool_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activities_action_created_at
  ON public.activities(action, created_at DESC);
