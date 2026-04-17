ALTER TABLE public.performance_campanhas ADD COLUMN IF NOT EXISTS id uuid PRIMARY KEY DEFAULT gen_random_uuid();
ALTER TABLE public.performance_campanhas ADD COLUMN IF NOT EXISTS ordem integer DEFAULT 0;

DROP POLICY IF EXISTS "performance_campanhas_all_auth" ON public.performance_campanhas;
CREATE POLICY "performance_campanhas_all_auth" ON public.performance_campanhas 
  FOR ALL TO authenticated 
  USING (true) 
  WITH CHECK (true);
