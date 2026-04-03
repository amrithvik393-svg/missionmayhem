import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { playSuccess, playFail, playMissionFailed } from '@/lib/sounds';
import { MissionFailedFlash } from '@/components/MissionFailedFlash';

const BossVitalsPage = () => {
  const { state, awardPoints, calculateCompletionPoints } = useGame();
  const boss = state.boss;

  const [vitals, setVitals] = useState({ hr: 72, bp: 118, o2: 98, nr: 37 });
  const [matched, setMatched] = useState({ hr: false, bp: false, o2: false, nr: false });
  const [completed, setCompleted] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [showFailFlash, setShowFailFlash] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const ekgCanvasRef = useRef<HTMLCanvasElement>(null);
  const ekgOffset = useRef(0);

  useEffect(() => {
    setRemaining((boss.timeMinutes || 10) * 60 + (boss.timeSeconds || 0));
  }, [boss]);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = window.setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setTimerRunning(false);
            setShowFailFlash(true);
            playMissionFailed();
            setTimeout(() => { setShowFailFlash(false); setTimedOut(true); }, 1500);
            return 0;
          }
          return prev - 1;
        });
        setElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerRunning]);

  useEffect(() => {
    const canvas = ekgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    const draw = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const w = canvas.width, h = canvas.height, cy = h / 2;
      ctx.fillStyle = 'rgba(2,11,8,0.3)';
      ctx.fillRect(0, 0, w, h);
      ctx.beginPath();
      ctx.strokeStyle = completed ? '#ff3355' : '#00ff88';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = completed ? '#ff3355' : '#00ff88';
      ctx.shadowBlur = 8;
      for (let x = 0; x < w; x++) {
        const pos = (x + ekgOffset.current) % 120;
        let y = cy;
        if (completed) { y = cy; }
        else {
          if (pos < 10) y = cy;
          else if (pos < 15) y = cy - 5;
          else if (pos < 20) y = cy;
          else if (pos < 25) y = cy - 25;
          else if (pos < 28) y = cy + 15;
          else if (pos < 33) y = cy - 40;
          else if (pos < 38) y = cy + 10;
          else if (pos < 42) y = cy - 8;
          else if (pos < 47) y = cy;
        }
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ekgOffset.current += 2;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, [completed]);

  const startTimer = useCallback(() => {
    const total = (boss.timeMinutes || 10) * 60 + (boss.timeSeconds || 0);
    setRemaining(total);
    setElapsed(0);
    setTimerStarted(true);
    setTimerRunning(true);
  }, [boss]);

  const updateVital = useCallback((key: keyof typeof vitals, val: number) => {
    setVitals(prev => ({ ...prev, [key]: val }));
  }, []);

  const checkVitals = useCallback(() => {
    const targets = { hr: boss.vitalHr, bp: boss.vitalBp, o2: boss.vitalO2, nr: boss.vitalNr };
    const newMatched = {
      hr: Math.abs(vitals.hr - targets.hr) <= 1,
      bp: Math.abs(vitals.bp - targets.bp) <= 1,
      o2: Math.abs(vitals.o2 - targets.o2) <= 1,
      nr: Math.abs(vitals.nr - targets.nr) <= 1,
    };
    setMatched(newMatched);
    
    if (newMatched.hr && newMatched.bp && newMatched.o2 && newMatched.nr) {
      setCompleted(true);
      playSuccess();
      if (intervalRef.current) clearInterval(intervalRef.current);
      setTimerRunning(false);
      const bossTeam = state.teams.find(t => t.id === state.bossActiveTeamId);
      const bossTeamName = bossTeam?.teamName || state.currentTeam;
      if (bossTeamName) {
        awardPoints(bossTeamName, 'boss-room', boss.points || 200, elapsed);
      }
    } else {
      playFail();
    }
  }, [vitals, boss, state.bossActiveTeamId, state.teams, state.currentTeam, elapsed, awardPoints]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const totalSecs = (boss.timeMinutes || 10) * 60 + (boss.timeSeconds || 0);
  const pct = totalSecs > 0 ? remaining / totalSecs : 1;
  const awardedBossPoints = calculateCompletionPoints('boss-room', boss.points || 200, elapsed);
  const timerColor = pct <= 0.15 ? 'text-destructive glow-red animate-critical' : pct <= 0.33 ? 'text-warning glow-orange' : 'text-[hsl(50,100%,50%)]';

  if (timedOut) {
    return (
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.96)] flex flex-col items-center justify-center z-[9998] gap-4">
        <div className="font-display text-[48px] font-black text-destructive tracking-[8px] glow-red animate-critical">GENESIS RELEASED</div>
        <div className="text-[12px] text-warning tracking-[4px] text-center">⚠ BIOWEAPON DEPLOYED — CONTAINMENT FAILED</div>
        <div className="text-[11px] text-muted-foreground tracking-[1px] mt-4 text-center max-w-[520px] leading-[1.9] italic">
          "Dr. Rao's final broadcast looped across every frequency:<br /><br />
          <em>'They took my cure. I gave them evolution. What you call death, I call a beginning.'</em><br /><br />
          You were too late. Or perhaps — this is what was always going to happen."
        </div>
        <Link to="/" className="mt-8 px-7 py-3 border border-destructive/30 text-destructive font-display text-[11px] tracking-[3px] hover:border-destructive transition-all">← BACK TO HUB</Link>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[9999] gap-5">
        <div className="h-0.5 w-[80%] bg-destructive shadow-[0_0_20px_hsl(var(--destructive)),0_0_60px_hsl(var(--destructive))]" />
        <div className="font-display text-[34px] font-black text-foreground tracking-[8px] text-center glow-green animate-fade-up" style={{ animationDelay: '0.5s', opacity: 0 }}>
          FLATLINE CONFIRMED
        </div>
        <div className="text-[12px] text-secondary-foreground tracking-[4px] animate-fade-up" style={{ animationDelay: '1s', opacity: 0 }}>
          GENESIS DISARMED — SUBJECT ALIVE
        </div>
        {(() => {
          const bossTeam = state.teams.find(t => t.id === state.bossActiveTeamId);
          const bossTeamName = bossTeam?.teamName || state.currentTeam;
          return bossTeamName ? (
            <div className="text-[11px] text-secondary-foreground tracking-[3px] animate-fade-up" style={{ animationDelay: '1.3s', opacity: 0 }}>
              +{awardedBossPoints} POINTS → {bossTeamName}
            </div>
          ) : null;
        })()}
        <div className="text-[11px] text-muted-foreground tracking-[1px] mt-4 text-center max-w-[580px] leading-[1.9] italic animate-fade-up" style={{ animationDelay: '2s', opacity: 0 }}>
          "The system believes Arvind Rao is dead. He is not. His research survives.<br />
          But the weapon is silent. And maybe that is enough.<br /><br />
          <em>Was it mercy? Or just a smarter way to win?</em>"
        </div>
        <Link to="/" className="text-muted-foreground text-[9px] tracking-[2px] hover:text-foreground mt-4 animate-fade-up" style={{ animationDelay: '3s', opacity: 0 }}>← BACK TO HUB</Link>
      </div>
    );
  }

  const vitalPanels = [
    { key: 'hr' as const, icon: '❤️', name: 'Cardiac Output', unit: 'BPM — BEATS PER MINUTE', color: '#ff3355', min: 40, max: 120 },
    { key: 'bp' as const, icon: '🫀', name: 'Blood Pressure', unit: 'mmHg — SYSTOLIC', color: '#ff9900', min: 80, max: 160 },
    { key: 'o2' as const, icon: '🫁', name: 'Respiratory Rate', unit: 'SpO2 — OXYGEN SATURATION %', color: '#00ccff', min: 85, max: 100 },
    { key: 'nr' as const, icon: '🧠', name: 'Neural Response', unit: 'Hz — NEURAL FREQUENCY', color: '#00ff88', min: 20, max: 60 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <MissionFailedFlash show={showFailFlash} />
      
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-muted-foreground text-[10px] tracking-[2px] hover:text-foreground border border-border px-2 py-1">← HUB</Link>
          <div className="font-display text-[15px] font-black tracking-[3px] text-foreground glow-green">BIOSYNC v4.1</div>
        </div>
        <div className="text-[9px] text-secondary-foreground tracking-[1px] text-center flex-1 px-4">
          SUBJECT: DR. ARVIND RAO | OP: GENESIS | TRIGGER: LIVE<br />
          <span className="text-muted-foreground text-[8px]">BIOMETRIC UPLINK ACTIVE — BIOWEAPON ARMED TO CARDIAC SIGNAL</span>
          {(() => {
            const bossTeam = state.teams.find(t => t.id === state.bossActiveTeamId);
            return bossTeam ? (
              <><br /><span className="text-accent text-[8px] tracking-[2px]">● ACTIVE TEAM: {bossTeam.teamName}</span></>
            ) : null;
          })()}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="text-[7px] text-warning tracking-[3px]">⚠ TIME REMAINING</div>
          {timerStarted ? (
            <div className={`font-display text-[26px] font-black tracking-[4px] ${timerColor}`}>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </div>
          ) : (
            <button onClick={startTimer} className="px-3 py-1 border border-foreground text-foreground font-display text-[10px] tracking-[2px] hover:bg-foreground hover:text-background transition-all">START</button>
          )}
        </div>
        <div className="text-[9px] px-2 py-1 border border-destructive text-destructive tracking-[2px] animate-blink ml-3 flex-shrink-0">⚠ GENESIS ARMED</div>
      </div>

      <div className="h-[50px] bg-card border-b border-border flex-shrink-0">
        <canvas ref={ekgCanvasRef} className="w-full h-full" />
      </div>

      <div className="grid grid-cols-2 gap-[1px] flex-1 bg-border">
        {vitalPanels.map(panel => (
          <div key={panel.key} className={`bg-card p-4 flex flex-col relative ${matched[panel.key] ? 'shadow-[inset_0_0_30px_rgba(0,255,136,0.1)]' : ''}`}>
            {matched[panel.key] && (
              <div className="absolute top-2 right-3 text-[8px] text-foreground tracking-[2px] glow-green">✓ FLATLINE MATCHED</div>
            )}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[15px]">{panel.icon}</span>
              <span className="font-display text-[9px] font-bold tracking-[2px] text-secondary-foreground uppercase">{panel.name}</span>
            </div>
            <div className="font-display text-[44px] font-black leading-none my-1" style={{ color: panel.color, textShadow: `0 0 30px ${panel.color}` }}>
              {vitals[panel.key]}
            </div>
            <div className="text-[8px] text-muted-foreground tracking-[2px] mb-2">{panel.unit}</div>
            <div className="mt-auto flex items-center gap-2">
              <span className="text-[8px] text-muted-foreground w-6 text-right">{panel.min}</span>
              <input
                type="range"
                min={panel.min}
                max={panel.max}
                value={vitals[panel.key]}
                onChange={e => updateVital(panel.key, parseInt(e.target.value))}
                className="flex-1 h-1 bg-muted-foreground appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <span className="text-[8px] text-muted-foreground w-6">{panel.max}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card flex-shrink-0">
        <div className="text-[8px] text-muted-foreground tracking-[1px]">BIOMETRIC TRIGGER: ACTIVE | OVERRIDE: LOCKED</div>
        <div className="flex gap-2 items-center">
          <span className="text-[8px] text-muted-foreground tracking-[1px]">MATCH ALL 4 VITALS TO DISARM</span>
          <button onClick={checkVitals} className="font-display text-[9px] font-bold tracking-[3px] px-4 py-2 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-all">
            ATTEMPT OVERRIDE
          </button>
        </div>
        <Link to="/" className="text-muted-foreground text-[8px] tracking-[2px] hover:text-foreground">← HUB</Link>
      </div>
    </div>
  );
};

export default BossVitalsPage;
