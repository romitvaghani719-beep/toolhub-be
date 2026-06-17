-- Browse tools: additional sort indexes (used by GET /api/tools)

-- Sort: votes (no category filter) → ORDER BY votes DESC, created_at DESC
CREATE INDEX IF NOT EXISTS idx_tools_votes_created_at
  ON public.tools(votes DESC, created_at DESC);

-- Sort: A → Z (no category filter) → ORDER BY name ASC
CREATE INDEX IF NOT EXISTS idx_tools_name_asc
  ON public.tools(name ASC);

-- Sort: A → Z with category filter → WHERE category = ? ORDER BY name ASC
CREATE INDEX IF NOT EXISTS idx_tools_category_name
  ON public.tools(category, name ASC);

-- Related tools on detail page: same category, newest first
-- (covered by idx_tools_category_created_at in 005; keep planner stats fresh)
ANALYZE public.tools;
