import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { supabase } from '@/integrations/supabase/client';
import { playSuccess, playFail, playMissionFailed, playDTMF, playKeyClick } from '@/lib/sounds';
import { MissionFailedFlash } from '@/components/MissionFailedFlash';
import { startBgMusic, stopBgMusic } from '@/lib/bgMusic';

type Phase = 'password' | 'timer' | 'success' | 'timeout';

const IntelligenceRoomPage = () => {
  const navigate = useNavigate();
  const { state, awardPoints, calculateCompletionPoints } = useGame();
  const intel = state.intelligence;

  const [phase, setPhase] = useState<Phase>('password');
  const [pwdInput, setPwdInput] = useState('');
  const [pwdError, setPwdError] = useState('');

  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showFailFlash, setShowFailFlash] = useState(false);

  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const totalPausedRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const timedOutRef = useRef(false);
  const elapsedRef = useRef(elapsed);
  elapsedRef.current = elapsed;

  const intelligenceRoom = state.rooms.find(r => r.id.toLowerCase().includes('intelligence'));
  const activeTeam = intelligenceRoom ? state.teams.find(t => t.id === intelligenceRoom.activeTeamId) : undefined;
  const activeTeamName = activeTeam?.teamName || '';

  useEffect(() => {
    if (phase === 'password') {
      const total = intel.timeMinutes * 60 + intel.timeSeconds;
      setTotalSeconds(total);
      setRemaining(total);
      setElapsed(0);
    }
  }, [intel.timeMinutes, intel.timeSeconds, phase]);

  useEffect(() => {
    return () => { stopBgMusic(); };
  }, []);

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
      setTimeout(() => tick(), 200);
    });
  }, [totalSeconds]);

  useEffect(() => {
    if (phase === 'timer' && !paused) {
      timedOutRef.current = false;
      tick();
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, paused, tick]);

  const checkRoomPassword = useCallback(async () => {
    const val = pwdInput.trim();
    if (!val) return;
    try {
      const { data, error } = await supabase.functions.invoke('verify-password', {
        body: { type: 'intelligence-room', password: val },
      });
      if (error || !data?.valid) {
        playFail();
        setPwdError('// INCORRECT PASSWORD');
        setPwdInput('');
        setTimeout(() => setPwdError(''), 1500);
        return;
      }
      // Password correct — start the timer
      playSuccess();
      const total = intel.timeMinutes * 60 + intel.timeSeconds;
      setTotalSeconds(total);
      setRemaining(total);
      setElapsed(0);
      startTimeRef.current = Date.now();
      totalPausedRef.current = 0;
      pausedAtRef.current = 0;
      timedOutRef.current = false;
      setPaused(false);
      setPhase('timer');
      startBgMusic('intelligence-task');
    } catch {
      setPwdError('// VERIFICATION ERROR');
      setTimeout(() => setPwdError(''), 1500);
    }
  }, [pwdInput, intel.timeMinutes, intel.timeSeconds]);

  const togglePause = useCallback(() => {
    if (paused) {
      totalPausedRef.current += Date.now() - pausedAtRef.current;
      setPaused(false);
    } else {
      pausedAtRef.current = Date.now();
      setPaused(true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
  }, [paused]);

  const checkPhone = useCallback(() => {
    const val = phoneInput.trim().replace(/\s+/g, '');
    const correct = intel.correctNumber.trim().replace(/\s+/g, '');
    if (val === correct) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      timedOutRef.current = true;
      setPhase('success');
      stopBgMusic();
      playSuccess();
      if (activeTeamName) {
        awardPoints(activeTeamName, 'intelligence-task', intel.points, elapsedRef.current);
      }
      setPhoneInput('');
    } else {
      playFail();
      setPhoneError('// INCORRECT NUMBER');
      setPhoneInput('');
      setTimeout(() => setPhoneError(''), 1500);
    }
  }, [phoneInput, intel.correctNumber, intel.points, activeTeamName, awardPoints]);

  const reset = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    timedOutRef.current = true;
    setPaused(false);
    setPhase('password');
    setPwdInput('');
    setPwdError('');
    setPhoneInput('');
    setPhoneError('');
    setShowFailFlash(false);
    stopBgMusic();
    const total = intel.timeMinutes * 60 + intel.timeSeconds;
    setTotalSeconds(total);
    setRemaining(total);
    setElapsed(0);
  }, [intel.timeMinutes, intel.timeSeconds]);

  const pct = totalSeconds > 0 ? remaining / totalSeconds : 1;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const awardedPoints = calculateCompletionPoints('intelligence-task', intel.points, elapsed);

  const isLow = pct <= 0.15;
  const isMid = pct <= 0.33;
  const colorClass = isLow ? 'text-destructive animate-critical' : isMid ? 'text-warning' : 'text-accent';
  const barColor = isLow ? 'bg-destructive shadow-[0_0_10px_hsl(var(--destructive))]' : isMid ? 'bg-warning shadow-[0_0_10px_hsl(var(--warning))]' : 'bg-accent shadow-[0_0_10px_hsl(var(--accent))]';

  // ─── PASSWORD PHASE ───
  if (phase === 'password') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-24 gap-6 px-6">
        <div className="font-display text-[13px] font-bold tracking-[5px] text-secondary-foreground text-center">
          INTELLIGENCE ROOM — ACCESS REQUIRED
        </div>
        {activeTeamName && (
          <div className="text-[10px] tracking-[3px] text-muted-foreground">
            TEAM: <span className="text-accent">{activeTeamName}</span> — UP TO {intel.points} PTS
          </div>
        )}
        <div className="border border-border bg-card p-8 w-full max-w-md flex flex-col gap-5 panel-glow">
          <div className="text-center">
            <div className="font-display text-5xl font-black tracking-[-2px] text-accent">
              {String(intel.timeMinutes).padStart(2, '0')}:{String(intel.timeSeconds).padStart(2, '0')}
            </div>
            <div className="text-[10px] tracking-[3px] text-muted-foreground mt-2">TIME LIMIT</div>
          </div>
          <div className="text-[9px] tracking-[2px] text-muted-foreground text-center border border-border p-3">
            🔒 ENTER ROOM PASSWORD TO BEGIN<br/>
            ⚡ SPEED SCORING: Finish faster = more points!<br/>
            📞 FIND THE CORRECT PHONE NUMBER INSIDE
          </div>
          <label className="text-[9px] tracking-[3px] text-secondary-foreground">ROOM PASSWORD</label>
          <input
            type="text"
            value={pwdInput}
            onChange={e => setPwdInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') checkRoomPassword(); }}
            placeholder="ENTER PASSWORD"
            className="w-full bg-background border border-muted-foreground text-foreground font-display text-xl p-3 tracking-[5px] text-center outline-none uppercase focus:border-foreground focus:shadow-[0_0_15px_hsla(152,100%,50%,0.15)]"
          />
          <button onClick={checkRoomPassword} className="w-full py-4 border border-foreground text-foreground font-display text-[13px] font-bold tracking-[5px] relative overflow-hidden group transition-all hover:text-background hover:shadow-[0_0_20px_hsl(var(--primary))]">
            <span className="absolute inset-0 bg-foreground transform -translate-x-full group-hover:translate-x-0 transition-transform z-0" />
            <span className="relative z-10">▶ UNLOCK & START</span>
          </button>
          {pwdError && <div className="text-destructive text-[10px] tracking-[2px] text-center">{pwdError}</div>}
        </div>
        <button onClick={() => navigate('/volunteer')} className="text-muted-foreground text-[10px] tracking-[2px] hover:text-foreground">← BACK TO VOLUNTEER</button>
      </div>
    );
  }

  // ─── SUCCESS PHASE ───
  if (phase === 'success') {
    return (
      <div className="fixed inset-0 bg-background/95 flex flex-col items-center justify-center z-[9999] gap-5">
        <div className="text-[10px] tracking-[4px] text-secondary-foreground">INTELLIGENCE ROOM — PHONE NUMBER ACCEPTED</div>
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

        {/* GATE CODE REVEAL */}
        <div className="border border-accent bg-accent/10 px-10 py-5 mt-2 animate-fade-up" style={{ animationDelay: '1.3s', opacity: 0 }}>
          <div className="text-[9px] tracking-[4px] text-accent/70 text-center mb-2">YOUR GATE CODE</div>
          <div className="font-display text-[48px] font-black text-accent tracking-[12px] text-center" style={{ textShadow: '0 0 30px hsl(var(--accent) / 0.5)' }}>
            {intel.gateCode}
          </div>
          <div className="text-[8px] tracking-[3px] text-accent/50 text-center mt-2">MEMORIZE THIS CODE — YOU WILL NEED IT</div>
        </div>

        <div className="flex gap-4 mt-6 animate-fade-up" style={{ animationDelay: '1.8s', opacity: 0 }}>
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

  // ─── TIMEOUT PHASE ───
  if (phase === 'timeout') {
    return (
      <div className="fixed inset-0 bg-[rgba(20,0,0,0.97)] flex flex-col items-center justify-center z-[9998] gap-4">
        <div className="font-display text-[52px] font-black text-destructive tracking-[6px] glow-red animate-critical">
          MISSION FAILED
        </div>
        <div className="text-[12px] text-destructive/60 tracking-[4px] text-center">INTELLIGENCE ROOM — TIME EXPIRED</div>
        <div className="text-[11px] text-destructive/30 tracking-[3px] mt-2">NO POINTS AWARDED</div>
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

  // ─── TIMER + KEYPAD PHASE ───
  return (
    <>
      <MissionFailedFlash show={showFailFlash} />
      <div className="flex flex-col items-center justify-center min-h-screen pt-24 gap-0 px-6">
        <div className="font-display text-[11px] tracking-[8px] text-secondary-foreground mb-2 text-center">INTELLIGENCE ROOM</div>
        <div className={`font-display font-black leading-none tracking-[-2px] text-center transition-all duration-500 ${colorClass}`} style={{ fontSize: 'clamp(72px, 18vw, 160px)' }}>
          {timeStr}
        </div>
        <div className="text-muted-foreground text-[14px] tracking-[4px] text-center -mt-1 mb-2">
          POTENTIAL POINTS: <span className="text-accent">{awardedPoints}</span> / {intel.points}
        </div>
        <div className="w-[60%] h-[3px] bg-muted-foreground mb-6 relative">
          <div className={`h-full transition-all duration-300 linear ${barColor}`} style={{ width: `${pct * 100}%` }} />
        </div>
        <div className="flex gap-4 mb-6">
          <button onClick={togglePause} className="px-6 py-2 border border-warning text-warning font-display text-[11px] tracking-[3px] hover:bg-warning hover:text-warning-foreground transition-all">
            {paused ? '▶ RESUME' : '⏸ PAUSE'}
          </button>
          <button onClick={reset} className="px-6 py-2 border border-muted-foreground text-muted-foreground font-display text-[11px] tracking-[3px] hover:border-foreground hover:text-foreground transition-all">
            ↺ RESET
          </button>
        </div>

        {/* PHONE KEYPAD */}
        <div className="w-full max-w-sm border border-border bg-card p-6 panel-glow">
          <div className="text-[9px] tracking-[3px] text-secondary-foreground mb-3 text-center">📞 DIAL THE CORRECT PHONE NUMBER</div>
          <div className="bg-background border border-muted-foreground text-foreground font-display text-2xl p-3 tracking-[6px] text-center mb-4 min-h-[52px] flex items-center justify-center">
            {phoneInput || <span className="text-muted-foreground text-lg tracking-[3px]">_ _ _ _ _ _ _</span>}
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {['1','2','3','4','5','6','7','8','9','*','0','#'].map(key => (
              <button
                key={key}
                onClick={() => { playDTMF(key); setPhoneInput(prev => prev + key); }}
                className="py-4 border border-muted-foreground text-foreground font-display text-xl tracking-[2px] hover:bg-foreground/10 hover:border-foreground active:bg-foreground/20 transition-all"
              >
                {key}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { playKeyClick(); setPhoneInput(prev => prev.slice(0, -1)); }}
              className="flex-1 py-3 border border-warning text-warning font-display text-[11px] tracking-[3px] hover:bg-warning hover:text-warning-foreground transition-all"
            >
              ← DELETE
            </button>
            <button
              onClick={checkPhone}
              className="flex-1 py-3 border border-foreground text-foreground font-display text-[11px] tracking-[3px] hover:bg-foreground hover:text-background transition-all"
            >
              📞 CALL
            </button>
          </div>
          {phoneError && <div className="text-destructive text-[10px] tracking-[2px] text-center mt-2">{phoneError}</div>}
        </div>

        {activeTeamName && (
          <div className="text-[10px] text-muted-foreground tracking-[2px] mt-4">
            ACTIVE TEAM: <span className="text-accent">{activeTeamName}</span>
          </div>
        )}

        <button onClick={() => navigate('/volunteer')} className="text-muted-foreground text-[9px] tracking-[2px] hover:text-foreground mt-4">← BACK TO VOLUNTEER</button>
      </div>
    </>
  );
};

export default IntelligenceRoomPage;
