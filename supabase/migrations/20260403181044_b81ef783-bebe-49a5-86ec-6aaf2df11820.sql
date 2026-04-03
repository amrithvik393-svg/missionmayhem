
ALTER TABLE public.team_scores ADD CONSTRAINT team_scores_team_id_room_id_key UNIQUE (team_id, room_id);
