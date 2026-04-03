import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { playSuccess, playFail, playMissionFailed } from '@/lib/sounds';
import { MissionFailedFlash } from '@/components/MissionFailedFlash';
import { getRoomColor } from '@/lib/roomColors';
import { startBgMusic, stopBgMusic } from '@/lib/bgMusic';

const RoomTimerPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { state, awardPoints, calculateCompletionPoints } = useGame();
  const room = state.rooms.find(r => r.id === roomId);

  const [phase, setPhase] = useState<'timer' | 'success' | 'timeout'>('timer');
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pwdInput, setPwdInput] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [showFailFlash, setShowFailFlash] = useState(false);

  // Timestamp-based timer refs to prevent drift
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const totalPausedRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const timedOutRef = useRef(false);

  const roomColor = getRoomColor(roomId || '');
  const activeTeam = room ? state.teams.find(t => t.id === room.activeTeamId) : undefined;
  const activeTeamName = activeTeam?.teamName || '';

  // Initialize total from room config
  useEffect(() => {
    if (room && !started) {
      const total = room.timeMinutes * 60 + room.timeSeconds;
      setTotalSeconds(total);
      setRemaining(total);
      setElapsed(0);
    }
  }, [room, started]);

  // Cleanup bg music on unmount
  useEffect(() => {
    return () => { stopBgMusic(); };
  }, []);

  // Core timer loop using timestamps (no drift)
  const tick = useCallback(() => {
    if (timedOutRef.current) return;
    const now = Date.now();
    const elapsedMs = now - startTimeRef.current - totalPausedRef.current;
    const elapsedSec = Math.floor(elapsedMs / 1000);
    const total = totalSeconds;
    const rem = Math.max(0, total - elapsedSec);

    setElapsed(elapsedSec);
    setRemaining(rem);

    if (rem <= 0) {
      timedOutRef.current = true;
      setShowFailFlash(true);
      stopBgMusic();
      playMissionFailed();
      setTimeout(() => {
        setShowFailFlash(false);
        setPhase('timeout');
      }, 1500);
      return;
    }

    rafRef.current = requestAnimationFrame(() => {
      // Schedule next check ~200ms later to save CPU but still be responsive
      setTimeout(() => {
        tick();
      }, 200);
    });
  }, [totalSeconds]);

  // Start/stop the tick loop based on started + paused state
  useEffect(() => {
    if (started && !paused && phase === 'timer') {
      timedOutRef.current = false;
      tick();
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [started, paused, phase, tick]);

  const startTimer = useCallback(() => {
    const total = room ? room.timeMinutes * 60 + room.timeSeconds : 360;
    setTotalSeconds(total);
    setRemaining(total);
    setElapsed(0);
    startTimeRef.current = Date.now();
    totalPausedRef.current = 0;
    pausedAtRef.current = 0;
    timedOutRef.current = false;
    setPaused(false);
    setStarted(true);
    setPhase('timer');
    if (roomId) startBgMusic(roomId);
  }, [room, roomId]);

  const togglePause = useCallback(() => {
    if (paused) {
      // Resuming — add paused duration
      totalPausedRef.current += Date.now() - pausedAtRef.current;
      setPaused(false);
    } else {
      // Pausing
      pausedAtRef.current = Date.now();
      setPaused(true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
  }, [paused]);

  const elapsedRef = useRef(elapsed);
  elapsedRef.current = elapsed;

  const checkPassword = useCallback(() => {
    if (!room) return;
    const val = pwdInput.trim().toUpperCase();
    if (val === room.password.toUpperCase()) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      timedOutRef.current = true;
      setPhase('success');
      stopBgMusic();
      playSuccess();
      if (activeTeamName) {
        awardPoints(activeTeamName, room.id, room.points, elapsedRef.current);
      }
      setPwdInput('');
    } else {
      playFail();
      setPwdError('// INCORRECT PASSWORD');
      setPwdInput('');
      setTimeout(() => setPwdError(''), 1500);
    }
  }, [pwdInput, room, activeTeamName, awardPoints]);

  const reset = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    timedOutRef.current = true;
    setPaused(false);
    setStarted(false);
    setPhase('timer');
    setPwdInput('');
    setPwdError('');
    setShowFailFlash(false);
    stopBgMusic();
    if (room) {
      const total = room.timeMinutes * 60 + room.timeSeconds;
      setTotalSeconds(total);
      setRemaining(total);
      setElapsed(0);
    }
  }, [room]);

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-24">
        <div className="text-destructive font-display tracking-[4px]">ROOM NOT FOUND</div>
      </div>
    );
  }

  const pct = totalSeconds > 0 ? remaining / totalSeconds : 1;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const awardedPoints = calculateCompletionPoints(room.id, room.points, elapsed);

  const isLow = pct <= 0.15;
  const isMid = pct <= 0.33;
  const colorClass = isLow ? 'text-destructive animate-critical' : isMid ? 'text-warning' : roomColor.base;
  const barColor = isLow ? 'bg-destructive shadow-[0_0_10px_hsl(var(--destructive))]' : isMid ? 'bg-warning shadow-[0_0_10px_hsl(var(--warning))]' : roomColor.bar;

  if (phase === 'success') {
    return (
      <div className="fixed inset-0 bg-background/95 flex flex-col items-center justify-center z-[9999] gap-5">
        <div className="text-[10px] tracking-[4px] text-secondary-foreground">{room.name} ROOM — PASSWORD ACCEPTED</div>
        <div className="h-0.5 bg-foreground shadow-[0_0_20px_hsl(var(--primary)),0_0_60px_hsl(var(--primary))] animate-flat-draw" />
        <div className="font-display text-[42px] font-black text-foreground tracking-[8px] text-center glow-green animate-fade-up" style={{ animationDelay: '0.5s', opacity: 0 }}>
          CLEARED
        </div>
        {activeTeamName && (
          <div className="text-[12px] text-secondary-foreground tracking-[3px] animate-fade-up" style={{ animationDelay: '0.8s', opacity: 0 }}>
            +{awardedPoints} POINTS → {activeTeamName}
          </div>
        )}
        <div className="text-[12px] text-secondary-foreground tracking-[4px] text-center animate-fade-up" style={{ animationDelay: '0.9s', opacity: 0 }}>
          SPEED BONUS: {pct > 0.75 ? 'MAXIMUM' : pct > 0.5 ? 'HIGH' : pct > 0.25 ? 'MODERATE' : 'MINIMAL'}
        </div>
        <div className="text-[12px] text-secondary-foreground tracking-[4px] text-center animate-fade-up" style={{ animationDelay: '1s', opacity: 0 }}>
          COMPLETED IN {String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')} — TEAM ADVANCES
        </div>
        <div className="flex gap-4 mt-6 animate-fade-up" style={{ animationDelay: '1.5s', opacity: 0 }}>
          <button onClick={reset} className="px-7 py-3 border border-muted-foreground text-muted-foreground font-display text-[11px] tracking-[3px] hover:border-secondary-foreground hover:text-secondary-foreground transition-all">
            ↺ RUN NEXT TEAM
          </button>
          <button onClick={() => navigate('/volunteer')} className="px-7 py-3 border border-foreground text-foreground font-display text-[11px] tracking-[3px] hover:bg-foreground hover:text-background transition-all">
            ← BACK TO VOLUNTEER
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'timeout') {
    return (
      <div className="fixed inset-0 bg-[rgba(20,0,0,0.97)] flex flex-col items-center justify-center z-[9998] gap-4">
        <div className="font-display text-[52px] font-black text-destructive tracking-[6px] glow-red animate-critical">
          MISSION FAILED
        </div>
        <div className="text-[12px] text-destructive/60 tracking-[4px] text-center">{room.name} ROOM — TIME EXPIRED</div>
        <div className="text-[11px] text-destructive/30 tracking-[3px] mt-2">NO POINTS AWARDED — PROCEED TO OUTSIDE TASKS</div>
        <div className="flex gap-4 mt-8">
          <button onClick={reset} className="px-7 py-3 border border-destructive/30 text-destructive font-display text-[11px] tracking-[3px] hover:border-destructive hover:text-destructive transition-all">
            ↺ RESET ROOM
          </button>
          <button onClick={() => navigate('/volunteer')} className="px-7 py-3 border border-muted-foreground text-muted-foreground font-display text-[11px] tracking-[3px] hover:border-foreground hover:text-foreground transition-all">
            ← BACK TO VOLUNTEER
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-24 gap-6 px-6">
        <div className="font-display text-[13px] font-bold tracking-[5px] text-secondary-foreground text-center">
          {room.name} ROOM — READY
        </div>
        {activeTeamName && (
          <div className="text-[10px] tracking-[3px] text-muted-foreground">
            TEAM: <span className={roomColor.base}>{activeTeamName}</span> — UP TO {room.points} PTS
          </div>
        )}
        <div className="border border-border bg-card p-8 w-full max-w-md flex flex-col gap-5 panel-glow">
          <div className="text-center">
            <div className={`font-display text-5xl font-black tracking-[-2px] ${roomColor.base}`} style={{ textShadow: roomColor.glowLg }}>
              {String(room.timeMinutes).padStart(2, '0')}:{String(room.timeSeconds).padStart(2, '0')}
            </div>
            <div className="text-[10px] tracking-[3px] text-muted-foreground mt-2">TIME LIMIT</div>
          </div>
          <div className="text-[9px] tracking-[2px] text-muted-foreground text-center border border-border p-3">
            ⚡ SPEED SCORING: Finish faster = more points!<br/>
            100% time left = {room.points} pts → 0% time left = {Math.max(1, Math.round(room.points * 0.25))} pts
          </div>
          <button onClick={startTimer} className="w-full py-4 border border-foreground text-foreground font-display text-[13px] font-bold tracking-[5px] relative overflow-hidden group transition-all hover:text-background hover:shadow-[0_0_20px_hsl(var(--primary))]">
            <span className="absolute inset-0 bg-foreground transform -translate-x-full group-hover:translate-x-0 transition-transform z-0" />
            <span className="relative z-10">▶ INITIATE SEQUENCE</span>
          </button>
        </div>
        <button onClick={() => navigate('/volunteer')} className="text-muted-foreground text-[10px] tracking-[2px] hover:text-foreground">← BACK TO VOLUNTEER</button>
      </div>
    );
  }

  return (
    <>
      <MissionFailedFlash show={showFailFlash} />
      <div className="flex flex-col items-center justify-center min-h-screen pt-24 gap-0 px-6">
        <div className="font-display text-[11px] tracking-[8px] text-secondary-foreground mb-2 text-center">{room.name} ROOM</div>
        <div className={`font-display font-black leading-none tracking-[-2px] text-center transition-all duration-500 ${colorClass}`} style={{ fontSize: 'clamp(72px, 18vw, 160px)', textShadow: isLow ? undefined : isMid ? undefined : roomColor.glowLg }}>
          {timeStr}
        </div>
        <div className="text-muted-foreground text-[14px] tracking-[4px] text-center -mt-1 mb-2">
          POTENTIAL POINTS: <span className={roomColor.base}>{awardedPoints}</span> / {room.points}
        </div>
        <div className="w-[60%] h-[3px] bg-muted-foreground mb-8 relative">
          <div className={`h-full transition-all duration-300 linear ${barColor}`} style={{ width: `${pct * 100}%` }} />
        </div>
        <div className="flex gap-4 mb-8">
          <button onClick={togglePause} className="px-6 py-2 border border-warning text-warning font-display text-[11px] tracking-[3px] hover:bg-warning hover:text-warning-foreground transition-all">
            {paused ? '▶ RESUME' : '⏸ PAUSE'}
          </button>
          <button onClick={reset} className="px-6 py-2 border border-muted-foreground text-muted-foreground font-display text-[11px] tracking-[3px] hover:border-foreground hover:text-foreground transition-all">
            ↺ RESET
          </button>
        </div>

        <div className="w-full max-w-md border border-border bg-card p-6 panel-glow">
          <div className="text-[9px] tracking-[3px] text-secondary-foreground mb-3 text-center">ENTER ROOM PASSWORD TO COMPLETE</div>
          <div className="flex gap-3">
            <input
              type="text"
              value={pwdInput}
              onChange={e => setPwdInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') checkPassword(); }}
              placeholder="PASSWORD"
              className="flex-1 bg-background border border-muted-foreground text-foreground font-display text-xl p-3 tracking-[5px] text-center outline-none uppercase focus:border-foreground focus:shadow-[0_0_15px_hsla(152,100%,50%,0.15)]"
            />
            <button onClick={checkPassword} className="px-5 py-3 border border-foreground text-foreground font-display text-[11px] tracking-[3px] hover:bg-foreground hover:text-background transition-all">
              SUBMIT
            </button>
          </div>
          {pwdError && <div className="text-destructive text-[10px] tracking-[2px] text-center mt-2">{pwdError}</div>}
        </div>

        {activeTeamName && (
          <div className="text-[10px] text-muted-foreground tracking-[2px] mt-4">
            ACTIVE TEAM: <span className={roomColor.base}>{activeTeamName}</span>
          </div>
        )}

        <button onClick={() => navigate('/volunteer')} className="text-muted-foreground text-[9px] tracking-[2px] hover:text-foreground mt-4">← BACK TO VOLUNTEER</button>
      </div>
    </>
  );
};

export default RoomTimerPage;
