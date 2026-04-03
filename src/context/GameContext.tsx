import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RoomConfig {
  id: string;
  name: string;
  password: string;
  points: number;
  timeMinutes: number;
  timeSeconds: number;
  volunteerName: string;
  volunteerName2: string;
  activeTeamId: string | null;
}

// Team rotation flow: { teamId: [roomId1, roomId2, ...] }
export type TeamRotationFlow = Record<string, string[]>;

export interface IntelligenceConfig {
  gateCode: string;
  correctNumber: string;
  roomPassword: string;
  points: number;
  timeMinutes: number;
  timeSeconds: number;
  categories: { letter: string; name: string; items: string[] }[];
}

export interface BossConfig {
  password: string;
  vitalHr: number;
  vitalBp: number;
  vitalO2: number;
  vitalNr: number;
  points: number;
  timeMinutes: number;
  timeSeconds: number;
  volunteer1: string;
  volunteer2: string;
  volunteer3: string;
}

export interface TeamMember {
  member1: string;
  member2: string;
  member3: string;
  member4: string;
}

export interface TeamScore {
  id: string;
  teamName: string;
  members: TeamMember;
  rooms: Record<string, { completed: boolean; timeElapsed: number; points: number }>;
  totalPoints: number;
}

export interface PointAdjustment {
  id: string;
  teamId: string;
  adjustedBy: string;
  points: number;
  reason: string;
  createdAt: string;
}

export interface Volunteer {
  id: string;
  name: string;
  password: string;
}

interface GameState {
  rooms: RoomConfig[];
  intelligence: IntelligenceConfig;
  boss: BossConfig;
  teams: TeamScore[];
  currentTeam: string;
  adminPassword: string;
  adjustments: PointAdjustment[];
  volunteers: Volunteer[];
  bossActiveTeamId: string | null;
  teamRotationFlow: TeamRotationFlow;
  loaded: boolean;
}

interface GameContextType {
  state: GameState;
  updateRoom: (roomId: string, config: Partial<RoomConfig>) => void;
  updateIntelligence: (config: Partial<IntelligenceConfig>) => void;
  updateBoss: (config: Partial<BossConfig>) => void;
  addTeam: (name: string, members?: TeamMember) => void;
  removeTeam: (name: string) => void;
  updateTeamMembers: (teamName: string, members: TeamMember) => void;
  setCurrentTeam: (name: string) => void;
  setRoomActiveTeam: (roomId: string, teamId: string | null) => void;
  setBossActiveTeam: (teamId: string | null) => void;
  calculateCompletionPoints: (roomId: string, basePoints: number, timeElapsed: number) => number;
  awardPoints: (teamName: string, roomId: string, points: number, timeElapsed: number) => void;
  adjustPoints: (teamName: string, adjustedBy: string, points: number, reason: string) => void;
  resetTeamScores: () => void;
  setAdminPassword: (pw: string) => void;
  addVolunteer: (name: string, password: string) => void;
  removeVolunteer: (id: string) => void;
  updateVolunteer: (id: string, data: Partial<{ name: string; password: string }>) => void;
  updateTeamRotationFlow: (flow: TeamRotationFlow) => void;
  refreshData: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>({
    rooms: [],
    intelligence: { gateCode: 'MONK', correctNumber: '9884512345', roomPassword: 'ENIGMA', points: 100, timeMinutes: 6, timeSeconds: 0, categories: [] },
    boss: { password: 'GENESIS', vitalHr: 57, vitalBp: 145, vitalO2: 91, vitalNr: 44, points: 200, timeMinutes: 10, timeSeconds: 0 },
    teams: [],
    currentTeam: '',
    adminPassword: 'admin',
    adjustments: [],
    volunteers: [],
    bossActiveTeamId: null,
    teamRotationFlow: {},
    loaded: false,
  });

  const loadData = useCallback(async () => {
    try {
      const { data: config } = await supabase.from('game_config').select('id, current_team, boss_active_team_id, boss_room_password, boss_vital_hr, boss_vital_bp, boss_vital_o2, boss_vital_nr, boss_points, boss_time_minutes, boss_time_seconds, boss_volunteer_1, boss_volunteer_2, boss_volunteer_3, intelligence_gate_code, intelligence_correct_number, intelligence_room_password, intelligence_points, intelligence_time_minutes, intelligence_time_seconds, intelligence_categories, team_rotation_flow').eq('id', 'main').single();
      const { data: rooms } = await supabase.from('rooms').select('*').order('sort_order');
      const { data: teams } = await supabase.from('teams').select('*');
      const { data: scores } = await supabase.from('team_scores').select('*');
      const { data: adjustments } = await supabase.from('point_adjustments').select('*').order('created_at', { ascending: false });
      const { data: volunteers } = await supabase.from('volunteers').select('id, name, created_at').order('created_at');

      if (!config || !rooms) return;

      const categories = (config.intelligence_categories as any[]) || [];

      const teamList: TeamScore[] = (teams || []).map(t => {
        const teamScores = (scores || []).filter(s => s.team_id === t.id);
        const roomMap: Record<string, { completed: boolean; timeElapsed: number; points: number }> = {};
        teamScores.forEach(s => {
          roomMap[s.room_id] = { completed: s.completed || false, timeElapsed: s.time_elapsed || 0, points: s.points || 0 };
        });
        const teamAdjustments = (adjustments || []).filter(a => a.team_id === t.id);
        const adjustmentTotal = teamAdjustments.reduce((sum, a) => sum + a.points, 0);
        const scoreTotal = Object.values(roomMap).reduce((sum, r) => sum + r.points, 0);
        return {
          id: t.id,
          teamName: t.team_name,
          members: { member1: t.member1 || '', member2: t.member2 || '', member3: t.member3 || '', member4: t.member4 || '' },
          rooms: roomMap,
          totalPoints: scoreTotal + adjustmentTotal,
        };
      });

      setState({
        rooms: rooms.map(r => ({
          id: r.id,
          name: r.name,
          password: r.password || '',
          points: r.points || 100,
          timeMinutes: r.time_minutes || 6,
          timeSeconds: r.time_seconds || 0,
          volunteerName: r.volunteer_name || '',
          volunteerName2: r.volunteer_name_2 || '',
          activeTeamId: r.active_team_id || null,
        })),
        intelligence: {
          gateCode: config.intelligence_gate_code || 'MONK',
          correctNumber: config.intelligence_correct_number || '',
          roomPassword: config.intelligence_room_password || '',
          points: config.intelligence_points || 100,
          timeMinutes: config.intelligence_time_minutes || 6,
          timeSeconds: config.intelligence_time_seconds || 0,
          categories,
        },
        boss: {
          password: config.boss_room_password || 'GENESIS',
          vitalHr: config.boss_vital_hr || 57,
          vitalBp: config.boss_vital_bp || 145,
          vitalO2: config.boss_vital_o2 || 91,
          vitalNr: config.boss_vital_nr || 44,
          points: config.boss_points || 200,
          timeMinutes: config.boss_time_minutes || 10,
          timeSeconds: config.boss_time_seconds || 0,
          volunteer1: (config as any).boss_volunteer_1 || '',
          volunteer2: (config as any).boss_volunteer_2 || '',
          volunteer3: (config as any).boss_volunteer_3 || '',
        },
        teams: teamList,
        currentTeam: config.current_team || '',
        adminPassword: '',
        adjustments: (adjustments || []).map(a => ({
          id: a.id,
          teamId: a.team_id,
          adjustedBy: a.adjusted_by,
          points: a.points,
          reason: a.reason || '',
          createdAt: a.created_at || '',
        })),
        volunteers: (volunteers || []).map(v => ({
          id: v.id,
          name: v.name,
          password: '',
        })),
        bossActiveTeamId: config.boss_active_team_id || null,
        teamRotationFlow: (config.team_rotation_flow as TeamRotationFlow) || {},
        loaded: true,
      });
    } catch (err) {
      console.error('Failed to load game data:', err);
    }
  }, []);

  const runMutationAndRefresh = useCallback(async (mutation: PromiseLike<{ error: unknown }>) => {
    const result = await mutation;

    if (result.error) {
      console.error('Game mutation failed:', result.error);
      throw result.error;
    }

    await loadData();
  }, [loadData]);

  const shouldSuspendLiveRefresh = useCallback(() => {
    const path = window.location.pathname;
    return path.startsWith('/room/') || path === '/boss/vitals' || path === '/boss/files';
  }, []);

  const calculateCompletionPoints = useCallback((roomId: string, basePoints: number, timeElapsed: number) => {
    const totalSeconds = roomId === 'boss-room'
      ? (state.boss.timeMinutes || 10) * 60 + (state.boss.timeSeconds || 0)
      : roomId === 'intelligence-task'
        ? (state.intelligence.timeMinutes || 6) * 60 + (state.intelligence.timeSeconds || 0)
        : (() => {
            const room = state.rooms.find(r => r.id === roomId);
            return room ? room.timeMinutes * 60 + room.timeSeconds : 0;
          })();

    if (totalSeconds <= 0) return basePoints;

    const clampedElapsed = Math.min(Math.max(timeElapsed, 0), totalSeconds);
    const remainingRatio = (totalSeconds - clampedElapsed) / totalSeconds;
    const minimumPoints = Math.max(1, Math.round(basePoints * 0.25));
    const scaledPoints = Math.round(basePoints * (0.25 + remainingRatio * 0.75));

    return Math.max(minimumPoints, Math.min(basePoints, scaledPoints));
  }, [state.boss.timeMinutes, state.boss.timeSeconds, state.intelligence.timeMinutes, state.intelligence.timeSeconds, state.rooms]);

  useEffect(() => {
    loadData();

    const refresh = () => {
      if (shouldSuspendLiveRefresh()) return;
      void loadData();
    };

    const channel = supabase.channel('game-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_config' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_scores' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'point_adjustments' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'volunteers' }, refresh)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData, shouldSuspendLiveRefresh]);

  useEffect(() => {
    if (!state.loaded) return;

    let inFlight = false;
    const intervalId = window.setInterval(async () => {
      if (document.visibilityState !== 'visible' || inFlight || shouldSuspendLiveRefresh()) return;

      inFlight = true;
      try {
        await loadData();
      } finally {
        inFlight = false;
      }
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [state.loaded, loadData, shouldSuspendLiveRefresh]);

  const updateRoom = useCallback(async (roomId: string, config: Partial<RoomConfig>) => {
    const update: any = {};
    if (config.password !== undefined) update.password = config.password;
    if (config.points !== undefined) update.points = config.points;
    if (config.timeMinutes !== undefined) update.time_minutes = config.timeMinutes;
    if (config.timeSeconds !== undefined) update.time_seconds = config.timeSeconds;
    if (config.volunteerName !== undefined) update.volunteer_name = config.volunteerName;
    if (config.volunteerName2 !== undefined) update.volunteer_name_2 = config.volunteerName2;
    if (config.name !== undefined) update.name = config.name;
    if (config.activeTeamId !== undefined) update.active_team_id = config.activeTeamId;
    await runMutationAndRefresh(supabase.from('rooms').update(update).eq('id', roomId));
  }, [runMutationAndRefresh]);

  const updateIntelligence = useCallback(async (config: Partial<IntelligenceConfig>) => {
    const update: any = {};
    if (config.gateCode !== undefined) update.intelligence_gate_code = config.gateCode;
    if (config.correctNumber !== undefined) update.intelligence_correct_number = config.correctNumber;
    if (config.roomPassword !== undefined) update.intelligence_room_password = config.roomPassword;
    if (config.points !== undefined) update.intelligence_points = config.points;
    if (config.timeMinutes !== undefined) update.intelligence_time_minutes = config.timeMinutes;
    if (config.timeSeconds !== undefined) update.intelligence_time_seconds = config.timeSeconds;
    if (config.categories !== undefined) update.intelligence_categories = config.categories;
    await runMutationAndRefresh(supabase.from('game_config').update(update).eq('id', 'main'));
  }, [runMutationAndRefresh]);

  const updateBoss = useCallback(async (config: Partial<BossConfig>) => {
    const update: any = {};
    if (config.password !== undefined) update.boss_room_password = config.password;
    if (config.vitalHr !== undefined) update.boss_vital_hr = config.vitalHr;
    if (config.vitalBp !== undefined) update.boss_vital_bp = config.vitalBp;
    if (config.vitalO2 !== undefined) update.boss_vital_o2 = config.vitalO2;
    if (config.vitalNr !== undefined) update.boss_vital_nr = config.vitalNr;
    if (config.points !== undefined) update.boss_points = config.points;
    if (config.timeMinutes !== undefined) update.boss_time_minutes = config.timeMinutes;
    if (config.timeSeconds !== undefined) update.boss_time_seconds = config.timeSeconds;
    if (config.volunteer1 !== undefined) update.boss_volunteer_1 = config.volunteer1;
    if (config.volunteer2 !== undefined) update.boss_volunteer_2 = config.volunteer2;
    if (config.volunteer3 !== undefined) update.boss_volunteer_3 = config.volunteer3;
    await runMutationAndRefresh(supabase.from('game_config').update(update).eq('id', 'main'));
  }, [runMutationAndRefresh]);

  const addTeam = useCallback(async (name: string, members?: TeamMember) => {
    await runMutationAndRefresh(supabase.from('teams').insert({
      team_name: name.toUpperCase(),
      member1: members?.member1 || '',
      member2: members?.member2 || '',
      member3: members?.member3 || '',
      member4: members?.member4 || '',
    }));
  }, [runMutationAndRefresh]);

  const removeTeam = useCallback(async (name: string) => {
    await runMutationAndRefresh(supabase.from('teams').delete().eq('team_name', name));
  }, [runMutationAndRefresh]);

  const updateTeamMembers = useCallback(async (teamName: string, members: TeamMember) => {
    await runMutationAndRefresh(supabase.from('teams').update({
      member1: members.member1,
      member2: members.member2,
      member3: members.member3,
      member4: members.member4,
    }).eq('team_name', teamName));
  }, [runMutationAndRefresh]);

  const setCurrentTeam = useCallback(async (name: string) => {
    await runMutationAndRefresh(supabase.from('game_config').update({ current_team: name }).eq('id', 'main'));
  }, [runMutationAndRefresh]);

  const setRoomActiveTeam = useCallback(async (roomId: string, teamId: string | null) => {
    await runMutationAndRefresh(supabase.from('rooms').update({ active_team_id: teamId }).eq('id', roomId));
  }, [runMutationAndRefresh]);

  const setBossActiveTeam = useCallback(async (teamId: string | null) => {
    await runMutationAndRefresh(supabase.from('game_config').update({ boss_active_team_id: teamId }).eq('id', 'main'));
  }, [runMutationAndRefresh]);

  const awardPoints = useCallback(async (teamName: string, roomId: string, points: number, timeElapsed: number) => {
    const team = state.teams.find(t => t.teamName === teamName);
    if (!team) return;

    const awardedPoints = calculateCompletionPoints(roomId, points, timeElapsed);

    await runMutationAndRefresh(supabase.from('team_scores').upsert({
      team_id: team.id,
      room_id: roomId,
      completed: true,
      time_elapsed: timeElapsed,
      points: awardedPoints,
    }, { onConflict: 'team_id,room_id' }));
  }, [state.teams, calculateCompletionPoints, runMutationAndRefresh]);

  const adjustPoints = useCallback(async (teamName: string, adjustedBy: string, points: number, reason: string) => {
    const team = state.teams.find(t => t.teamName === teamName);
    if (!team) return;

    await runMutationAndRefresh(supabase.from('point_adjustments').insert({
      team_id: team.id,
      adjusted_by: adjustedBy,
      points,
      reason,
    }));
  }, [state.teams, runMutationAndRefresh]);

  const resetTeamScores = useCallback(async () => {
    const results = await Promise.all(
      state.teams.flatMap(team => [
        supabase.from('team_scores').delete().eq('team_id', team.id),
        supabase.from('point_adjustments').delete().eq('team_id', team.id),
      ])
    );

    const failedResult = results.find(result => result.error);
    if (failedResult?.error) {
      console.error('Game mutation failed:', failedResult.error);
      throw failedResult.error;
    }

    await loadData();
  }, [state.teams, loadData]);

  const setAdminPassword = useCallback(async (pw: string) => {
    await runMutationAndRefresh(supabase.from('game_config').update({ admin_password: pw }).eq('id', 'main'));
  }, [runMutationAndRefresh]);

  const addVolunteer = useCallback(async (name: string, password: string) => {
    await runMutationAndRefresh(supabase.from('volunteers').insert({ name: name.toUpperCase(), password }));
  }, [runMutationAndRefresh]);

  const removeVolunteer = useCallback(async (id: string) => {
    await runMutationAndRefresh(supabase.from('volunteers').delete().eq('id', id));
  }, [runMutationAndRefresh]);

  const updateVolunteer = useCallback(async (id: string, data: Partial<{ name: string; password: string }>) => {
    const update: any = {};
    if (data.name !== undefined) update.name = data.name.toUpperCase();
    if (data.password !== undefined) update.password = data.password;
    await runMutationAndRefresh(supabase.from('volunteers').update(update).eq('id', id));
  }, [runMutationAndRefresh]);

  const updateTeamRotationFlow = useCallback(async (flow: TeamRotationFlow) => {
    await runMutationAndRefresh(supabase.from('game_config').update({ team_rotation_flow: flow }).eq('id', 'main'));
  }, [runMutationAndRefresh]);

  return (
    <GameContext.Provider value={{
      state, updateRoom, updateIntelligence, updateBoss, addTeam, removeTeam,
      updateTeamMembers, setCurrentTeam, setRoomActiveTeam, setBossActiveTeam, calculateCompletionPoints, awardPoints, adjustPoints,
      resetTeamScores, setAdminPassword, addVolunteer, removeVolunteer, updateVolunteer,
      updateTeamRotationFlow, refreshData: loadData,
    }}>
      {children}
    </GameContext.Provider>
  );
}
