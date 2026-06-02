-- Starter schema for this template. Replace or extend this for your specific project.

CREATE TABLE public.items (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL    DEFAULT now(),
  name       text        NOT NULL,
  owner_id   uuid        REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Allow users to read only their own items.
CREATE POLICY "items: select own"
  ON public.items
  FOR SELECT
  USING (auth.uid() = owner_id);

-- Allow users to insert rows only when they are the owner.
CREATE POLICY "items: insert own"
  ON public.items
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Allow users to update only their own items.
CREATE POLICY "items: update own"
  ON public.items
  FOR UPDATE
  USING     (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Allow users to delete only their own items.
CREATE POLICY "items: delete own"
  ON public.items
  FOR DELETE
  USING (auth.uid() = owner_id);
