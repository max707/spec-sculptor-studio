-- Create subscribers table
CREATE TABLE public.subscribers (
  id BIGSERIAL PRIMARY KEY,
  email CITEXT,
  phone_e164 TEXT UNIQUE,
  consent_checkbox_at TIMESTAMPTZ,
  sms_confirmed_at TIMESTAMPTZ,
  email_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscriber_districts table
CREATE TABLE public.subscriber_districts (
  subscriber_id BIGINT REFERENCES public.subscribers(id) ON DELETE CASCADE,
  chamber TEXT CHECK (chamber IN ('house','senate')),
  district_code TEXT,
  added_via TEXT CHECK (added_via IN ('exact','possible','manual')),
  PRIMARY KEY (subscriber_id, chamber, district_code)
);

-- Create notification_preferences table
CREATE TABLE public.notification_preferences (
  subscriber_id BIGINT REFERENCES public.subscribers(id) ON DELETE CASCADE PRIMARY KEY,
  mode TEXT CHECK (mode IN ('realtime','daily')) DEFAULT 'realtime',
  quiet_hours JSONB DEFAULT '{"start":"22:00","end":"07:00","tz":"America/Denver"}'::jsonb
);

-- Create legislators table
CREATE TABLE public.legislators (
  id BIGSERIAL PRIMARY KEY,
  chamber TEXT CHECK (chamber IN ('house','senate')),
  district_code TEXT UNIQUE,
  name TEXT,
  party TEXT,
  email TEXT,
  phone TEXT,
  profile_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bills table
CREATE TABLE public.bills (
  id TEXT PRIMARY KEY,
  short_code TEXT,
  session TEXT DEFAULT '2025 General',
  title TEXT,
  url TEXT,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create votes table
CREATE TABLE public.votes (
  id BIGSERIAL PRIMARY KEY,
  bill_id TEXT REFERENCES public.bills(id),
  chamber TEXT CHECK (chamber IN ('house','senate')),
  action_text TEXT,
  result TEXT CHECK (result IN ('passed','failed','other')),
  yeas INT,
  nays INT,
  excused INT,
  absent INT,
  taken_at TIMESTAMPTZ,
  source_url TEXT,
  external_key TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create member_votes table
CREATE TABLE public.member_votes (
  vote_id BIGINT REFERENCES public.votes(id) ON DELETE CASCADE,
  legislator_district TEXT,
  legislator_name TEXT,
  decision TEXT,
  PRIMARY KEY (vote_id, legislator_district)
);

-- Create outbound_dedup table
CREATE TABLE public.outbound_dedup (
  subscriber_id BIGINT REFERENCES public.subscribers(id) ON DELETE CASCADE,
  vote_id BIGINT REFERENCES public.votes(id) ON DELETE CASCADE,
  channel TEXT CHECK (channel IN ('sms','email')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (subscriber_id, vote_id, channel)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriber_districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legislators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbound_dedup ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriber data (user-specific)
CREATE POLICY "Users can view their own subscriber data" 
ON public.subscribers 
FOR SELECT 
USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own subscriber data" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own subscriber data" 
ON public.subscribers 
FOR UPDATE 
USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view their own districts" 
ON public.subscriber_districts 
FOR ALL 
USING (subscriber_id IN (SELECT id FROM public.subscribers WHERE auth.uid()::text = id::text));

CREATE POLICY "Users can manage their own preferences" 
ON public.notification_preferences 
FOR ALL 
USING (subscriber_id IN (SELECT id FROM public.subscribers WHERE auth.uid()::text = id::text));

CREATE POLICY "Users can view their own dedup records" 
ON public.outbound_dedup 
FOR SELECT 
USING (subscriber_id IN (SELECT id FROM public.subscribers WHERE auth.uid()::text = id::text));

-- RLS Policies for public legislative data (read-only for all)
CREATE POLICY "Legislators are publicly viewable" 
ON public.legislators 
FOR SELECT 
USING (true);

CREATE POLICY "Bills are publicly viewable" 
ON public.bills 
FOR SELECT 
USING (true);

CREATE POLICY "Votes are publicly viewable" 
ON public.votes 
FOR SELECT 
USING (true);

CREATE POLICY "Member votes are publicly viewable" 
ON public.member_votes 
FOR SELECT 
USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_legislators_updated_at
  BEFORE UPDATE ON public.legislators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_subscribers_phone ON public.subscribers(phone_e164);
CREATE INDEX idx_subscribers_email ON public.subscribers(email);
CREATE INDEX idx_subscriber_districts_subscriber ON public.subscriber_districts(subscriber_id);
CREATE INDEX idx_legislators_district ON public.legislators(district_code);
CREATE INDEX idx_legislators_chamber ON public.legislators(chamber);
CREATE INDEX idx_bills_session ON public.bills(session);
CREATE INDEX idx_votes_bill ON public.votes(bill_id);
CREATE INDEX idx_votes_chamber ON public.votes(chamber);
CREATE INDEX idx_votes_taken_at ON public.votes(taken_at);
CREATE INDEX idx_member_votes_district ON public.member_votes(legislator_district);