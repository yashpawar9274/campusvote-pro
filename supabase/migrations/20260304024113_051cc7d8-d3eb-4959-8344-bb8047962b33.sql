
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Also allow system (service role) to insert notifications
CREATE POLICY "System can insert notifications for all users"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Function to notify all users when a new election is created
CREATE OR REPLACE FUNCTION public.notify_new_election()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, election_id)
  SELECT p.user_id, 
    '🗳️ New Election: ' || NEW.title,
    'A new ' || NEW.election_type || ' election has been created. Voting ends ' || to_char(NEW.end_date, 'Mon DD, YYYY') || '.',
    'election',
    NEW.id
  FROM public.profiles p;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_election
AFTER INSERT ON public.elections
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_election();
