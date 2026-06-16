-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS users_read_own ON public.users;
CREATE POLICY users_read_own ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS users_read_admin ON public.users;
CREATE POLICY users_read_admin ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

DROP POLICY IF EXISTS users_update_own ON public.users;
CREATE POLICY users_update_own ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS users_admin_all ON public.users;
CREATE POLICY users_admin_all ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Tools policies
DROP POLICY IF EXISTS tools_public_read ON public.tools;
CREATE POLICY tools_public_read ON public.tools
  FOR SELECT USING (true);

DROP POLICY IF EXISTS tools_owner_insert ON public.tools;
CREATE POLICY tools_owner_insert ON public.tools
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS tools_owner_update ON public.tools;
CREATE POLICY tools_owner_update ON public.tools
  FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS tools_owner_delete ON public.tools;
CREATE POLICY tools_owner_delete ON public.tools
  FOR DELETE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS tools_admin_all ON public.tools;
CREATE POLICY tools_admin_all ON public.tools
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Activities policies
DROP POLICY IF EXISTS activities_read_own ON public.activities;
CREATE POLICY activities_read_own ON public.activities
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS activities_read_admin ON public.activities;
CREATE POLICY activities_read_admin ON public.activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

DROP POLICY IF EXISTS activities_insert_authenticated ON public.activities;
CREATE POLICY activities_insert_authenticated ON public.activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS activities_admin_all ON public.activities;
CREATE POLICY activities_admin_all ON public.activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );
