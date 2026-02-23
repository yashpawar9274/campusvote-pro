
-- Fix elections INSERT policy to use has_role
DROP POLICY "Admins can insert elections" ON public.elections;
CREATE POLICY "Admins can insert elections" ON public.elections FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix elections UPDATE policy
DROP POLICY "Admins can update elections" ON public.elections;
CREATE POLICY "Admins can update elections" ON public.elections FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Fix candidates INSERT policy
DROP POLICY "Admins can insert candidates" ON public.candidates;
CREATE POLICY "Admins can insert candidates" ON public.candidates FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix candidates UPDATE policy
DROP POLICY "Admins can update candidates" ON public.candidates;
CREATE POLICY "Admins can update candidates" ON public.candidates FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
