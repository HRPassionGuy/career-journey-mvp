-- Career Journey MVP - Supabase Database Schema
-- Copy/paste this into Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessment responses
CREATE TABLE public.assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Questions
  employment_status TEXT NOT NULL, -- 'employed', 'unemployed', 'underemployed'
  target_role TEXT,
  biggest_obstacle TEXT NOT NULL, -- 'interviews', 'direction', 'networking', 'salary'
  timeline TEXT NOT NULL, -- '0-30days', '1-3months', '3-6months', 'exploring'
  target_salary_range TEXT,
  coached_before BOOLEAN DEFAULT FALSE,
  
  -- Results
  breakthrough_type TEXT, -- 'interviewer', 'seeker', 'negotiator', 'pivoter'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module purchases
CREATE TABLE public.purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Module info
  module_name TEXT NOT NULL, -- 'strengths', 'resume', 'networking', 'innervue', 'annual'
  amount_paid INTEGER NOT NULL, -- in cents
  
  -- Stripe info
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'refunded'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module progress/completion
CREATE TABLE public.module_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  module_name TEXT NOT NULL,
  is_unlocked BOOLEAN DEFAULT FALSE,
  is_completed BOOLEAN DEFAULT FALSE,
  progress_percent INTEGER DEFAULT 0,
  
  unlocked_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(user_id, module_name)
);

-- Resume uploads and analysis
CREATE TABLE public.resumes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Resume file info
  original_filename TEXT NOT NULL,
  file_url TEXT, -- Supabase storage URL
  file_text TEXT, -- Extracted text
  
  -- Claude analysis
  analysis_result JSONB, -- Store Claude's full response
  strengths TEXT[],
  improvement_areas TEXT[],
  ats_score INTEGER, -- 0-100
  
  -- Status
  analysis_status TEXT DEFAULT 'pending', -- 'pending', 'analyzing', 'completed', 'failed'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analyzed_at TIMESTAMP WITH TIME ZONE
);

-- Inner Vue interview practice sessions
CREATE TABLE public.interview_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Session details
  job_title TEXT,
  company_name TEXT,
  session_type TEXT, -- 'behavioral', 'technical', 'executive'
  
  -- Q&A data
  questions_answered INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 10,
  session_data JSONB, -- Store Q&A pairs and feedback
  
  -- Scoring
  overall_score INTEGER, -- 0-100
  
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email tracking (optional but helpful)
CREATE TABLE public.email_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  email_type TEXT NOT NULL, -- 'welcome', 'purchase_confirmation', 'module_unlock', etc.
  subject TEXT,
  sent_to TEXT NOT NULL,
  
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Subscription tracking (for annual renewal)
CREATE TABLE public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Subscription info
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due'
  
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies

-- Profiles: Users can only see/edit their own
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Assessments: Users can only see their own
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assessments" 
  ON public.assessments FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments" 
  ON public.assessments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Purchases: Users can only see their own
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases" 
  ON public.purchases FOR SELECT 
  USING (auth.uid() = user_id);

-- Module Progress: Users can only see/update their own
ALTER TABLE public.module_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" 
  ON public.module_progress FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" 
  ON public.module_progress FOR UPDATE 
  USING (auth.uid() = user_id);

-- Resumes: Users can only see their own
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resumes" 
  ON public.resumes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes" 
  ON public.resumes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Interview Sessions: Users can only see their own
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" 
  ON public.interview_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" 
  ON public.interview_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Subscriptions: Users can only see their own
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" 
  ON public.subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

-- Email logs: Users can view their own (optional)
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email logs" 
  ON public.email_logs FOR SELECT 
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX idx_purchases_stripe_payment_intent ON public.purchases(stripe_payment_intent_id);
CREATE INDEX idx_module_progress_user_id ON public.module_progress(user_id);
CREATE INDEX idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX idx_interview_sessions_user_id ON public.interview_sessions(user_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_email_logs_user_id ON public.email_logs(user_id);

-- Functions

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  
  -- Initialize module progress for all modules
  INSERT INTO public.module_progress (user_id, module_name, is_unlocked)
  VALUES 
    (NEW.id, 'assessment', TRUE),     -- Free
    (NEW.id, 'strengths', FALSE),     -- $29
    (NEW.id, 'resume', FALSE),        -- $150
    (NEW.id, 'networking', FALSE),    -- Free (unlocked after assessment)
    (NEW.id, 'innervue', FALSE);      -- $100
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to unlock module after purchase
CREATE OR REPLACE FUNCTION public.unlock_module(
  p_user_id UUID,
  p_module_name TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.module_progress
  SET 
    is_unlocked = TRUE,
    unlocked_at = NOW()
  WHERE 
    user_id = p_user_id 
    AND module_name = p_module_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has access to module
CREATE OR REPLACE FUNCTION public.has_module_access(
  p_user_id UUID,
  p_module_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_unlocked BOOLEAN;
BEGIN
  SELECT is_unlocked INTO v_is_unlocked
  FROM public.module_progress
  WHERE user_id = p_user_id AND module_name = p_module_name;
  
  RETURN COALESCE(v_is_unlocked, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Storage bucket for resume uploads (run this in Supabase Storage UI or via SQL)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('resumes', 'resumes', false);

-- Storage policy: Users can only upload their own resumes
-- CREATE POLICY "Users can upload own resumes"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'resumes' 
--   AND auth.uid()::text = (storage.foldername(name))[1]
-- );

-- CREATE POLICY "Users can view own resumes"
-- ON storage.objects FOR SELECT
-- USING (
--   bucket_id = 'resumes'
--   AND auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Seed data for testing (optional)
-- INSERT INTO public.profiles (id, email, full_name)
-- VALUES (uuid_generate_v4(), 'test@example.com', 'Test User');
