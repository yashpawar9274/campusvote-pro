
-- Drop the overly permissive policy and keep only the admin + trigger approach
DROP POLICY "System can insert notifications for all users" ON public.notifications;

-- Enable RLS on pre-existing tables that lack it
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view departments" ON public.departments FOR SELECT USING (true);

ALTER TABLE public.voters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view voters" ON public.voters FOR SELECT TO authenticated USING (true);
