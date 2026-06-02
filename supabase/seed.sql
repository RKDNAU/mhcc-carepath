-- ---------------------------------------------------------------------------
-- Seed data for local development only.
-- These rows are inserted into public.items when you run:
--   supabase db seed          (via Supabase CLI)
-- or by pasting this file into:
--   Supabase Dashboard > SQL Editor (for a remote/hosted project)
--
-- The UUIDs below are placeholder values suitable for local dev.
-- In a real environment, replace the created_by values with actual
-- user UUIDs from auth.users (e.g. copy them from Authentication > Users
-- in the Supabase Dashboard, or query: SELECT id FROM auth.users LIMIT 10;).
-- ---------------------------------------------------------------------------

INSERT INTO public.items (id, name, description, created_by, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Sample Item One',
    'First placeholder item for local development.',
    '00000000-0000-0000-0000-000000000010', -- replace with a real user ID
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Sample Item Two',
    'Second placeholder item for local development.',
    '00000000-0000-0000-0000-000000000010', -- replace with a real user ID
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Sample Item Three',
    'Third placeholder item for local development.',
    '00000000-0000-0000-0000-000000000011', -- replace with a real user ID
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'Sample Item Four',
    'Fourth placeholder item for local development.',
    '00000000-0000-0000-0000-000000000011', -- replace with a real user ID
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'Sample Item Five',
    'Fifth placeholder item for local development.',
    '00000000-0000-0000-0000-000000000012', -- replace with a real user ID
    NOW()
  );
