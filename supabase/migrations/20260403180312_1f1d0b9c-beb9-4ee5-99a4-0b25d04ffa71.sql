
-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_name TEXT NOT NULL UNIQUE,
  member1 TEXT,
  member2 TEXT,
  member3 TEXT,
  member4 TEXT,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Anyone can insert teams" ON public.teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update teams" ON public.teams FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete teams" ON public.teams FOR DELETE USING (true);

-- Create rooms table
CREATE TABLE public.rooms (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  password TEXT,
  points INTEGER DEFAULT 100,
  time_minutes INTEGER DEFAULT 6,
  time_seconds INTEGER DEFAULT 0,
  sort_order INTEGER,
  volunteer_name TEXT,
  volunteer_name_2 TEXT,
  active_team_id UUID REFERENCES public.teams(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can insert rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update rooms" ON public.rooms FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete rooms" ON public.rooms FOR DELETE USING (true);

-- Create game_config table
CREATE TABLE public.game_config (
  id TEXT NOT NULL PRIMARY KEY DEFAULT 'main',
  admin_password TEXT NOT NULL DEFAULT 'admin',
  current_team TEXT,
  intelligence_gate_code TEXT DEFAULT 'MONK',
  intelligence_correct_number TEXT,
  intelligence_room_password TEXT,
  intelligence_points INTEGER DEFAULT 100,
  intelligence_time_minutes INTEGER DEFAULT 6,
  intelligence_time_seconds INTEGER DEFAULT 0,
  intelligence_categories JSONB,
  boss_room_password TEXT DEFAULT 'GENESIS',
  boss_vital_hr INTEGER DEFAULT 57,
  boss_vital_bp INTEGER DEFAULT 145,
  boss_vital_o2 INTEGER DEFAULT 91,
  boss_vital_nr INTEGER DEFAULT 44,
  boss_points INTEGER DEFAULT 200,
  boss_time_minutes INTEGER DEFAULT 10,
  boss_time_seconds INTEGER DEFAULT 0,
  boss_active_team_id TEXT,
  team_rotation_flow JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.game_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view config" ON public.game_config FOR SELECT USING (true);
CREATE POLICY "Anyone can insert config" ON public.game_config FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update config" ON public.game_config FOR UPDATE USING (true);

-- Insert default config row
INSERT INTO public.game_config (id) VALUES ('main');

-- Create team_scores table
CREATE TABLE public.team_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  room_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  time_elapsed INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.team_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view scores" ON public.team_scores FOR SELECT USING (true);
CREATE POLICY "Anyone can insert scores" ON public.team_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update scores" ON public.team_scores FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete scores" ON public.team_scores FOR DELETE USING (true);

-- Create point_adjustments table
CREATE TABLE public.point_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  adjusted_by TEXT NOT NULL,
  points INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.point_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view adjustments" ON public.point_adjustments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert adjustments" ON public.point_adjustments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete adjustments" ON public.point_adjustments FOR DELETE USING (true);

-- Create volunteers table
CREATE TABLE public.volunteers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  password TEXT NOT NULL DEFAULT '1234',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view volunteers" ON public.volunteers FOR SELECT USING (true);
CREATE POLICY "Anyone can insert volunteers" ON public.volunteers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update volunteers" ON public.volunteers FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete volunteers" ON public.volunteers FOR DELETE USING (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_config;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.point_adjustments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.volunteers;
