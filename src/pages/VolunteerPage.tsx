import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { playSuccess } from '@/lib/sounds';
import { getRoomColor } from '@/lib/roomColors';

interface RoomTimer {
  roomId: string;
  totalSeconds: number;
  remaining: number;
  elapsed: number;
  running: boolean;
  paused: boolean;
  started: boolean;
}

const VolunteerPage = () => {
  const { state, adjustPoints, setRoomActiveTeam } = useGame();
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [volName, setVolName] = useState('');
  const [volPw, setVolPw] = useState('');
  const [loginError, setLoginError] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [pointsInput, setPointsInput] = useState('');
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');

  // Timers for assigned rooms (display only, actual timer runs on room page)
  const [roomTimers, setRoomTimers] = useState<Record<string, RoomTimer>>({});
  const intervalsRef = useRef<Record<string, number>>({});

  // Get rooms assigned to this volunteer
  const assignedRooms = state.rooms.filter(
    r => r.volunteerName.toLowerCase() === volName.toLowerCase() || r.volunteerName2.toLowerCase() === volName.toLowerCase()
  );

  // Initialize timers when state loads
  useEffect(() => {
    if (state.loaded && state.rooms.length > 0) {
      const timers: Record<string, RoomTimer> = {};
      state.rooms.forEach(r => {
        if (!roomTimers[r.id]) {
          const total = r.timeMinutes * 60 + r.timeSeconds;
          timers[r.id] = { roomId: r.id, totalSeconds: total, remaining: total, elapsed: 0, running: false, paused: false, started: false };
        } else {
          timers[r.id] = roomTimers[r.id];
        }
      });
      setRoomTimers(timers);
    }
  }, [state.loaded, state.rooms.length]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(intervalsRef.current).forEach(id => clearInterval(id));
    };
  }, []);

  if (!authed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-24 gap-6 px-6">
        <div className="font-display text-[13px] tracking-[5px] text-secondary-foreground">VOLUNTEER ACCESS</div>
        <div className="border border-border bg-card p-8 w-full max-w-md flex flex-col gap-4 panel-glow">
          <label className="text-[9px] tracking-[3px] text-secondary-foreground">YOUR NAME</label>
          <input type="text" value={volName} onChange={e => setVolName(e.target.value)} placeholder="ENTER YOUR NAME" className="w-full bg-background border border-muted-foreground text-foreground font-display text-xl p-3 tracking-[4px] text-center outline-none focus:border-foreground focus:shadow-[0_0_15px_hsla(152,100%,50%,0.15)] uppercase" />
          <label className="text-[9px] tracking-[3px] text-secondary-foreground">PASSWORD</label>
          <input type="password" value={volPw} onChange={e => setVolPw(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') attemptLogin(); }} placeholder="ENTER PASSWORD" className="w-full bg-background border border-muted-foreground text-foreground font-display text-xl p-3 tracking-[4px] text-center outline-none focus:border-foreground focus:shadow-[0_0_15px_hsla(152,100%,50%,0.15)]" />
          <button onClick={attemptLogin} className="w-full py-3 border border-foreground text-foreground font-display text-[12px] tracking-[4px] hover:bg-foreground hover:text-background transition-all">ENTER</button>
          {loginError && <div className="text-destructive text-[10px] tracking-[2px] text-center">{loginError}</div>}
        </div>
        <Link to="/" className="text-muted-foreground text-[10px] tracking-[2px] hover:text-foreground">← BACK TO HUB</Link>
      </div>
    );
  }

  function attemptLogin() {
    const vol = state.volunteers.find(v => v.name.toLowerCase() === volName.trim().toLowerCase());
    if (!vol) {
      setLoginError('// VOLUNTEER NOT FOUND');
      setTimeout(() => setLoginError(''), 2000);
      return;
    }
    if (vol.password !== volPw) {
      setLoginError('// INCORRECT PASSWORD');
      setTimeout(() => setLoginError(''), 2000);
      return;
    }
    setVolName(vol.name);
    setAuthed(true);
  }

  const handleAdjust = () => {
    const pts = parseInt(pointsInput);
    if (!selectedTeam || isNaN(pts) || pts === 0 || !reason.trim()) {
      setFeedback('// FILL ALL FIELDS');
      setTimeout(() => setFeedback(''), 2000);
      return;
    }
    adjustPoints(selectedTeam, volName.toUpperCase(), pts, reason.trim());
    playSuccess();
    setFeedback(`${pts > 0 ? '+' : ''}${pts} POINTS → ${selectedTeam}`);
    setPointsInput('');
    setReason('');
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleSetActiveTeam = (roomId: string, teamId: string) => {
    setRoomActiveTeam(roomId, teamId || null);
  };

  const formatTime = (secs: number) => `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen pt-28 pb-12 px-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="font-display text-[13px] tracking-[5px] text-secondary-foreground">
          VOLUNTEER: <span className="text-foreground">{volName.toUpperCase()}</span>
        </div>
        <Link to="/" className="text-muted-foreground text-[10px] tracking-[2px] hover:text-foreground border border-border px-4 py-2">← HUB</Link>
      </div>

      {/* Assigned Room Panels */}
      <section className="border border-border bg-card p-6 mb-6 panel-glow">
        <div className="font-display text-[11px] tracking-[4px] text-secondary-foreground mb-4">
          YOUR ASSIGNED ROOMS — {assignedRooms.length} ROOM{assignedRooms.length !== 1 ? 'S' : ''}
        </div>
        {assignedRooms.length === 0 ? (
          <div className="text-[10px] text-muted-foreground tracking-[2px] text-center py-8">
            NO ROOMS ASSIGNED TO YOU — CONTACT ADMIN
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedRooms.map(r => {
              const roomColor = getRoomColor(r.id);
              const activeTeam = state.teams.find(t => t.id === r.activeTeamId);
              // Check if this room has been completed by the active team
              const teamScore = activeTeam ? state.teams.find(t => t.id === activeTeam.id)?.rooms[r.id] : null;
              const isCompleted = teamScore?.completed || false;

              return (
                <div key={r.id} className={`border bg-foreground/5 p-4 ${isCompleted ? 'border-foreground/50' : 'border-foreground/20'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`font-display text-[12px] tracking-[3px] ${roomColor.base}`}>{r.name}</div>
                    {activeTeam && (
                      <div className="text-[9px] tracking-[1px] text-accent">● {activeTeam.teamName}</div>
                    )}
                  </div>

                  <div className="text-center mb-3">
                    <div className={`font-display text-2xl font-black tracking-[2px] ${roomColor.base}`}>
                      {String(r.timeMinutes).padStart(2, '0')}:{String(r.timeSeconds).padStart(2, '0')}
                    </div>
                    <div className="text-[9px] text-muted-foreground tracking-[2px]">{r.points} PTS — TIME LIMIT</div>
                  </div>

                  {/* Team selection */}
                  <div className="mb-3">
                    <label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">SELECT ACTIVE TEAM</label>
                    <select
                      value={r.activeTeamId || ''}
                      onChange={e => handleSetActiveTeam(r.id, e.target.value)}
                      className="w-full bg-background border border-muted-foreground text-foreground font-display text-[10px] p-1.5 tracking-[1px] outline-none focus:border-foreground"
                    >
                      <option value="">— NONE —</option>
                      {state.teams.map(t => (
                        <option key={t.id} value={t.id}>{t.teamName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Launch room timer button */}
                  <button
                    onClick={() => navigate(`/room/${r.id}`)}
                    className={`w-full py-3 border font-display text-[11px] tracking-[3px] relative overflow-hidden group transition-all ${
                      isCompleted
                        ? 'border-foreground/30 text-foreground/50'
                        : `border-foreground text-foreground hover:text-background hover:shadow-[0_0_20px_hsl(var(--primary))]`
                    }`}
                  >
                    {!isCompleted && <span className="absolute inset-0 bg-foreground transform -translate-x-full group-hover:translate-x-0 transition-transform z-0" />}
                    <span className="relative z-10">
                      {isCompleted ? '✓ COMPLETED — OPEN ROOM' : '▶ LAUNCH ROOM TIMER'}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Team Rotation Flow */}
      {Object.keys(state.teamRotationFlow).length > 0 && (
        <section className="border border-border bg-card p-6 mb-6 panel-glow">
          <div className="font-display text-[11px] tracking-[4px] text-secondary-foreground mb-4">TEAM ROTATION FLOW</div>
          <div className="overflow-x-auto">
            <table className="w-full text-[9px] tracking-[1px]">
              <thead>
                <tr>
                  <th className="text-left text-muted-foreground p-1.5 border-b border-border">TEAM</th>
                  {[1,2,3,4,5].map(s => (
                    <th key={s} className="text-center text-muted-foreground p-1.5 border-b border-border">
                      SLOT {s}<br/><span className="text-[7px]">{(s-1)*6}-{s*6} MIN</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.teams.map(team => {
                  const flow = state.teamRotationFlow[team.id] || [];
                  return (
                    <tr key={team.id}>
                      <td className="text-foreground p-1.5 border-b border-border font-display">{team.teamName}</td>
                      {[0,1,2,3,4].map(i => {
                        const room = state.rooms.find(r => r.id === flow[i]);
                        const roomColorVal = flow[i] ? getRoomColor(flow[i]) : null;
                        return (
                          <td key={i} className={`text-center p-1.5 border-b border-border ${room ? roomColorVal?.base || 'text-foreground' : 'text-muted-foreground'}`}>
                            {room?.name || '—'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Point Adjustment */}
      <section className="border border-border bg-card p-6 mb-6 panel-glow">
        <div className="font-display text-[11px] tracking-[4px] text-secondary-foreground mb-4">ADJUST TEAM POINTS</div>
        <div className="text-[10px] text-muted-foreground tracking-[1px] mb-4 leading-[1.8]">
          Use positive numbers to add points, negative to deduct (e.g., -10 for rule breaking, +5 for bonus).
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">SELECT TEAM</label>
            <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] outline-none focus:border-foreground">
              <option value="">— SELECT —</option>
              {state.teams.map(t => (
                <option key={t.teamName} value={t.teamName}>{t.teamName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">POINTS (+/-)</label>
            <input type="number" value={pointsInput} onChange={e => setPointsInput(e.target.value)} placeholder="e.g. -10 or +5" className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] text-center outline-none focus:border-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:hidden" />
          </div>
          <div>
            <label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">REASON</label>
            <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. LATE ARRIVAL, RULE VIOLATION" className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] outline-none focus:border-foreground uppercase" />
          </div>
          <button onClick={handleAdjust} className="w-full py-3 border border-foreground text-foreground font-display text-[11px] tracking-[3px] hover:bg-foreground hover:text-background transition-all">SUBMIT ADJUSTMENT</button>
          {feedback && <div className="text-accent text-[10px] tracking-[2px] text-center">{feedback}</div>}
        </div>
      </section>
    </div>
  );
};

export default VolunteerPage;
