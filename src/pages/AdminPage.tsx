import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

const AdminPage = () => {
  const { state, updateRoom, updateIntelligence, updateBoss, addTeam, removeTeam, updateTeamMembers, setCurrentTeam, resetTeamScores, setAdminPassword, addVolunteer, removeVolunteer, updateVolunteer, updateTeamRotationFlow, setBossActiveTeam } = useGame();
  const [authed, setAuthed] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState('');
  const [newTeam, setNewTeam] = useState('');
  const [newMembers, setNewMembers] = useState({ member1: '', member2: '', member3: '', member4: '' });
  const [newAdminPw, setNewAdminPw] = useState('');
  const [editingMembers, setEditingMembers] = useState<string | null>(null);
  const [editMembers, setEditMembers] = useState({ member1: '', member2: '', member3: '', member4: '' });
  const [newVolName, setNewVolName] = useState('');
  const [newVolPw, setNewVolPw] = useState('');
  const [editingVol, setEditingVol] = useState<string | null>(null);
  const [editVolPw, setEditVolPw] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleAdminLogin = async () => {
    if (loginLoading) return;
    setLoginLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-password', {
        body: { type: 'admin', password: pwInput },
      });
      if (error || !data?.valid) {
        setPwError('// ACCESS DENIED');
        setTimeout(() => setPwError(''), 1500);
        setPwInput('');
      } else {
        setAuthed(true);
      }
    } catch {
      setPwError('// ACCESS DENIED');
      setTimeout(() => setPwError(''), 1500);
      setPwInput('');
    } finally {
      setLoginLoading(false);
    }
  };

  if (!authed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-24 gap-6 px-6">
        <div className="font-display text-[13px] tracking-[5px] text-secondary-foreground">ADMIN ACCESS</div>
        <div className="border border-border bg-card p-8 w-full max-w-md flex flex-col gap-4 panel-glow">
          <label className="text-[9px] tracking-[3px] text-secondary-foreground">ADMIN PASSWORD</label>
          <input type="password" value={pwInput} onChange={e => setPwInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleAdminLogin(); }} className="w-full bg-background border border-muted-foreground text-foreground font-display text-xl p-3 tracking-[4px] text-center outline-none focus:border-foreground focus:shadow-[0_0_15px_hsla(152,100%,50%,0.15)]" />
          <button onClick={handleAdminLogin} className="w-full py-3 border border-foreground text-foreground font-display text-[12px] tracking-[4px] hover:bg-foreground hover:text-background transition-all">AUTHENTICATE</button>
          {pwError && <div className="text-destructive text-[10px] tracking-[2px] text-center">{pwError}</div>}
        </div>
        <Link to="/" className="text-muted-foreground text-[10px] tracking-[2px] hover:text-foreground">← BACK TO HUB</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-12 px-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="font-display text-[13px] tracking-[5px] text-secondary-foreground">ADMIN CONTROL PANEL</div>
        <Link to="/" className="text-muted-foreground text-[10px] tracking-[2px] hover:text-foreground border border-border px-4 py-2">← HUB</Link>
      </div>

      {/* Team Management */}
      <section className="border border-border bg-card p-6 mb-6 panel-glow">
        <div className="font-display text-[11px] tracking-[4px] text-secondary-foreground mb-4">TEAM MANAGEMENT — {state.teams.length} TEAM{state.teams.length !== 1 ? 'S' : ''} REGISTERED</div>
        <div className="space-y-3 mb-4">
          <div className="flex gap-3">
            <input type="text" value={newTeam} onChange={e => setNewTeam(e.target.value)} placeholder="TEAM NAME" className="flex-1 bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[3px] text-center outline-none focus:border-foreground uppercase" />
            <button onClick={() => { if (newTeam.trim()) { addTeam(newTeam.trim().toUpperCase(), newMembers); setNewTeam(''); setNewMembers({ member1: '', member2: '', member3: '', member4: '' }); } }} className="px-4 py-2 border border-foreground text-foreground font-display text-[10px] tracking-[2px] hover:bg-foreground hover:text-background transition-all">+ ADD</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['member1', 'member2', 'member3', 'member4'].map((m, i) => (
              <input key={m} type="text" value={(newMembers as any)[m]} onChange={e => setNewMembers(prev => ({ ...prev, [m]: e.target.value }))} placeholder={`MEMBER ${i + 1}`} className="bg-background border border-border text-foreground text-[10px] p-1.5 tracking-[2px] text-center outline-none focus:border-foreground" />
            ))}
          </div>
        </div>
        <div className="space-y-2 mb-4">
          {state.teams.map(t => {
            const activeInRooms = state.rooms.filter(r => r.activeTeamId === t.id);
            return (
              <div key={t.teamName} className={`border p-3 ${activeInRooms.length > 0 ? 'border-foreground' : 'border-border'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-[10px] tracking-[2px] text-foreground">{t.teamName}</span>
                  <div className="flex gap-2 items-center">
                    {activeInRooms.length > 0 && (
                      <span className="text-[8px] tracking-[1px] text-accent">● {activeInRooms.map(r => r.name).join(', ')}</span>
                    )}
                    <button onClick={() => { setEditingMembers(editingMembers === t.teamName ? null : t.teamName); setEditMembers(t.members); }} className="text-[8px] tracking-[1px] text-secondary-foreground hover:text-foreground px-2 py-1 border border-border">MEMBERS</button>
                    <button onClick={() => removeTeam(t.teamName)} className="text-destructive text-[10px] hover:text-destructive/80 px-2 py-1 border border-border">×</button>
                  </div>
                </div>
                {editingMembers === t.teamName && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {['member1', 'member2', 'member3', 'member4'].map((m, i) => (
                      <input key={m} type="text" value={(editMembers as any)[m]} onChange={e => setEditMembers(prev => ({ ...prev, [m]: e.target.value }))} placeholder={`MEMBER ${i + 1}`} className="bg-background border border-border text-foreground text-[10px] p-1.5 tracking-[2px] text-center outline-none focus:border-foreground" onBlur={() => updateTeamMembers(t.teamName, editMembers)} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {state.teams.length > 0 && (
          <button onClick={resetTeamScores} className="text-[10px] tracking-[2px] text-destructive border border-destructive/30 px-4 py-2 hover:bg-destructive hover:text-destructive-foreground transition-all">RESET ALL SCORES</button>
        )}
      </section>

      {/* Volunteer Management */}
      <section className="border border-border bg-card p-6 mb-6 panel-glow">
        <div className="font-display text-[11px] tracking-[4px] text-secondary-foreground mb-4">VOLUNTEER MANAGEMENT</div>
        <div className="flex gap-3 mb-4">
          <input type="text" value={newVolName} onChange={e => setNewVolName(e.target.value)} placeholder="VOLUNTEER NAME" className="flex-1 bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[3px] text-center outline-none focus:border-foreground uppercase" />
          <input type="text" value={newVolPw} onChange={e => setNewVolPw(e.target.value)} placeholder="PASSWORD" className="w-36 bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] text-center outline-none focus:border-foreground" />
          <button onClick={() => { if (newVolName.trim() && newVolPw.trim()) { addVolunteer(newVolName.trim(), newVolPw.trim()); setNewVolName(''); setNewVolPw(''); } }} className="px-4 py-2 border border-foreground text-foreground font-display text-[10px] tracking-[2px] hover:bg-foreground hover:text-background transition-all">+ ADD</button>
        </div>
        <div className="space-y-2">
          {state.volunteers.map(v => (
            <div key={v.id} className="border border-border p-3 flex items-center justify-between">
              <span className="font-display text-[10px] tracking-[2px] text-foreground">{v.name}</span>
              <div className="flex items-center gap-2">
                {editingVol === v.id ? (
                  <>
                    <input type="text" value={editVolPw} onChange={e => setEditVolPw(e.target.value)} placeholder="NEW PASSWORD" className="w-32 bg-background border border-border text-foreground text-[10px] p-1.5 tracking-[2px] text-center outline-none focus:border-foreground" />
                    <button onClick={() => { if (editVolPw.trim()) { updateVolunteer(v.id, { password: editVolPw.trim() }); setEditingVol(null); setEditVolPw(''); } }} className="text-[8px] tracking-[1px] text-accent hover:text-foreground px-2 py-1 border border-border">SAVE</button>
                    <button onClick={() => { setEditingVol(null); setEditVolPw(''); }} className="text-[8px] tracking-[1px] text-muted-foreground hover:text-foreground px-2 py-1 border border-border">CANCEL</button>
                  </>
                ) : (
                  <>
                    <span className="text-[9px] tracking-[1px] text-muted-foreground">PW: {v.password}</span>
                    <button onClick={() => { setEditingVol(v.id); setEditVolPw(v.password); }} className="text-[8px] tracking-[1px] text-secondary-foreground hover:text-foreground px-2 py-1 border border-border">EDIT</button>
                    <button onClick={() => removeVolunteer(v.id)} className="text-destructive text-[10px] hover:text-destructive/80 px-2 py-1 border border-border">×</button>
                  </>
                )}
              </div>
            </div>
          ))}
          {state.volunteers.length === 0 && (
            <div className="text-[10px] text-muted-foreground tracking-[2px]">NO VOLUNTEERS REGISTERED</div>
          )}
        </div>
      </section>

      {/* Room Configuration */}
      <section className="border border-border bg-card p-6 mb-6 panel-glow">
        <div className="font-display text-[11px] tracking-[4px] text-secondary-foreground mb-4">ROOM CONFIGURATION</div>
        <div className="space-y-4">
          {state.rooms.map(room => (
            <div key={room.id} className="border border-border p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="col-span-2 md:col-span-5"><div className="font-display text-sm tracking-[4px] text-foreground glow-green">{room.name}</div></div>
              <div><label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">PASSWORD</label><input type="text" value={room.password} onChange={e => updateRoom(room.id, { password: e.target.value.toUpperCase() })} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] text-center outline-none focus:border-foreground uppercase" /></div>
              <div><label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">POINTS</label><input type="number" value={room.points} onChange={e => updateRoom(room.id, { points: parseInt(e.target.value) || 0 })} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] text-center outline-none focus:border-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:hidden" /></div>
              <div><label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">MINUTES</label><input type="number" value={room.timeMinutes} onChange={e => updateRoom(room.id, { timeMinutes: parseInt(e.target.value) || 1 })} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] text-center outline-none focus:border-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:hidden" /></div>
              <div><label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">SECONDS</label><input type="number" value={room.timeSeconds} onChange={e => updateRoom(room.id, { timeSeconds: parseInt(e.target.value) || 0 })} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] text-center outline-none focus:border-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:hidden" /></div>
              <div>
                <label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">VOLUNTEER 1</label>
                <select value={room.volunteerName} onChange={e => updateRoom(room.id, { volunteerName: e.target.value })} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] outline-none focus:border-foreground">
                  <option value="">— NONE —</option>
                  {state.volunteers.map(v => (
                    <option key={v.id} value={v.name}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">VOLUNTEER 2</label>
                <select value={room.volunteerName2} onChange={e => updateRoom(room.id, { volunteerName2: e.target.value })} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] outline-none focus:border-foreground">
                  <option value="">— NONE —</option>
                  {state.volunteers.map(v => (
                    <option key={v.id} value={v.name}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">VOLUNTEER 3</label>
                <select value={room.volunteerName3} onChange={e => updateRoom(room.id, { volunteerName3: e.target.value })} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] outline-none focus:border-foreground">
                  <option value="">— NONE —</option>
                  {state.volunteers.map(v => (
                    <option key={v.id} value={v.name}>{v.name}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Intelligence Room */}
      <section className="border border-border bg-card p-6 mb-6 panel-glow">
        <div className="font-display text-[11px] tracking-[4px] text-secondary-foreground mb-4">INTELLIGENCE ROOM</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div><label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">GATE CODE</label><input type="text" value={state.intelligence.gateCode} onChange={e => updateIntelligence({ gateCode: e.target.value.toUpperCase() })} maxLength={4} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[4px] text-center outline-none focus:border-foreground uppercase" /></div>
          <div><label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">CORRECT PHONE #</label><input type="text" value={state.intelligence.correctNumber} onChange={e => updateIntelligence({ correctNumber: e.target.value })} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] text-center outline-none focus:border-foreground" /></div>
          <div><label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">ROOM PASSWORD</label><input type="text" value={state.intelligence.roomPassword} onChange={e => updateIntelligence({ roomPassword: e.target.value.toUpperCase() })} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] text-center outline-none focus:border-foreground uppercase" /></div>
          <div><label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">POINTS</label><input type="number" value={state.intelligence.points} onChange={e => updateIntelligence({ points: parseInt(e.target.value) || 0 })} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] text-center outline-none focus:border-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:hidden" /></div>
          <div><label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">TIMER MIN</label><input type="number" value={state.intelligence.timeMinutes} onChange={e => updateIntelligence({ timeMinutes: parseInt(e.target.value) || 1 })} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] text-center outline-none focus:border-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:hidden" /></div>
          <div><label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">TIMER SEC</label><input type="number" value={state.intelligence.timeSeconds} onChange={e => updateIntelligence({ timeSeconds: parseInt(e.target.value) || 0 })} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] text-center outline-none focus:border-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:hidden" /></div>
        </div>
      </section>

      {/* Boss Room */}
      <section className="border border-border bg-card p-6 mb-6 panel-glow">
        <div className="font-display text-[11px] tracking-[4px] text-secondary-foreground mb-4">BOSS ROOM — VITAL TARGETS</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div><label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">❤️ HR (BPM)</label><input type="number" value={state.boss.vitalHr} onChange={e => updateBoss({ vitalHr: parseInt(e.target.value) || 0 })} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] text-center outline-none focus:border-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:hidden" /></div>
          <div><label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">🫀 BP (mmHg)</label><input type="number" value={state.boss.vitalBp} onChange={e => updateBoss({ vitalBp: parseInt(e.target.value) || 0 })} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] text-center outline-none focus:border-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:hidden" /></div>
          <div><label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">🫁 O2 (SpO2%)</label><input type="number" value={state.boss.vitalO2} onChange={e => updateBoss({ vitalO2: parseInt(e.target.value) || 0 })} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] text-center outline-none focus:border-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:hidden" /></div>
          <div><label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">🧠 NR (Hz)</label><input type="number" value={state.boss.vitalNr} onChange={e => updateBoss({ vitalNr: parseInt(e.target.value) || 0 })} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] text-center outline-none focus:border-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:hidden" /></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div><label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">PASSWORD</label><input type="text" value={state.boss.password} onChange={e => updateBoss({ password: e.target.value.toUpperCase() })} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] text-center outline-none focus:border-foreground uppercase" /></div>
          <div><label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">POINTS</label><input type="number" value={state.boss.points} onChange={e => updateBoss({ points: parseInt(e.target.value) || 0 })} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] text-center outline-none focus:border-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:hidden" /></div>
          <div><label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">TIMER MIN</label><input type="number" value={state.boss.timeMinutes} onChange={e => updateBoss({ timeMinutes: parseInt(e.target.value) || 1 })} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] text-center outline-none focus:border-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:hidden" /></div>
          <div><label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">TIMER SEC</label><input type="number" value={state.boss.timeSeconds} onChange={e => updateBoss({ timeSeconds: parseInt(e.target.value) || 0 })} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] text-center outline-none focus:border-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:hidden" /></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <div>
            <label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">ACTIVE TEAM</label>
            <select value={state.bossActiveTeamId || ''} onChange={e => setBossActiveTeam(e.target.value || null)} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] outline-none focus:border-foreground">
              <option value="">— NONE —</option>
              {state.teams.map(t => (
                <option key={t.id} value={t.id}>{t.teamName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">VOLUNTEER 1</label>
            <select value={state.boss.volunteer1} onChange={e => updateBoss({ volunteer1: e.target.value })} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] outline-none focus:border-foreground">
              <option value="">— NONE —</option>
              {state.volunteers.map(v => (
                <option key={v.id} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">VOLUNTEER 2</label>
            <select value={state.boss.volunteer2} onChange={e => updateBoss({ volunteer2: e.target.value })} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] outline-none focus:border-foreground">
              <option value="">— NONE —</option>
              {state.volunteers.map(v => (
                <option key={v.id} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[8px] tracking-[2px] text-muted-foreground block mb-1">VOLUNTEER 3</label>
            <select value={state.boss.volunteer3} onChange={e => updateBoss({ volunteer3: e.target.value })} className="w-full bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[2px] outline-none focus:border-foreground">
              <option value="">— NONE —</option>
              {state.volunteers.map(v => (
                <option key={v.id} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Team Rotation Flow — 5 teams, 6 min slots, 30 min total */}
      <section className="border border-border bg-card p-6 mb-6 panel-glow">
        <div className="font-display text-[11px] tracking-[4px] text-secondary-foreground mb-2">TEAM ROTATION FLOW — SLOT CONFIGURATION</div>
        <div className="text-[9px] text-muted-foreground tracking-[1px] mb-4 leading-[1.8]">
          5 teams play simultaneously. Each team gets 6 minutes per room, rotating every slot (30 min total for 5 slots).
          Configure the order of rooms each team visits below.
        </div>
        {state.teams.length === 0 ? (
          <div className="text-[10px] text-muted-foreground tracking-[2px]">ADD TEAMS FIRST</div>
        ) : (
          <div className="space-y-4">
            {state.teams.map(team => {
              const flow = state.teamRotationFlow[team.id] || [];
              const allRoomIds = state.rooms.map(r => r.id);
              return (
                <div key={team.id} className="border border-border p-4">
                  <div className="font-display text-[10px] tracking-[3px] text-foreground mb-3">{team.teamName}</div>
                  <div className="grid grid-cols-5 gap-2">
                    {[0, 1, 2, 3, 4].map(slotIdx => (
                      <div key={slotIdx}>
                        <label className="text-[7px] tracking-[2px] text-muted-foreground block mb-1">SLOT {slotIdx + 1} ({slotIdx * 6}-{(slotIdx + 1) * 6} MIN)</label>
                        <select
                          value={flow[slotIdx] || ''}
                          onChange={e => {
                            const newFlow = [...flow];
                            while (newFlow.length <= slotIdx) newFlow.push('');
                            newFlow[slotIdx] = e.target.value;
                            const updated = { ...state.teamRotationFlow, [team.id]: newFlow };
                            updateTeamRotationFlow(updated);
                          }}
                          className="w-full bg-background border border-muted-foreground text-foreground font-display text-[9px] p-1.5 tracking-[1px] outline-none focus:border-foreground"
                        >
                          <option value="">— SELECT —</option>
                          {allRoomIds.map(rId => {
                            const room = state.rooms.find(r => r.id === rId);
                            return <option key={rId} value={rId}>{room?.name || rId}</option>;
                          })}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Visual schedule matrix */}
            {Object.keys(state.teamRotationFlow).length > 0 && (
              <div className="border border-foreground/20 p-4 mt-4">
                <div className="text-[9px] tracking-[3px] text-secondary-foreground mb-3">ROTATION SCHEDULE OVERVIEW</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[9px] tracking-[1px]">
                    <thead>
                      <tr>
                        <th className="text-left text-muted-foreground p-1 border-b border-border">TEAM</th>
                        {[1,2,3,4,5].map(s => (
                          <th key={s} className="text-center text-muted-foreground p-1 border-b border-border">SLOT {s}<br/><span className="text-[7px]">{(s-1)*6}-{s*6} MIN</span></th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {state.teams.map(team => {
                        const flow = state.teamRotationFlow[team.id] || [];
                        return (
                          <tr key={team.id}>
                            <td className="text-foreground p-1 border-b border-border font-display">{team.teamName}</td>
                            {[0,1,2,3,4].map(i => {
                              const room = state.rooms.find(r => r.id === flow[i]);
                              return (
                                <td key={i} className={`text-center p-1 border-b border-border ${room ? 'text-foreground' : 'text-muted-foreground'}`}>
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
              </div>
            )}
          </div>
        )}
      </section>

      {/* Admin Password */}
      <section className="border border-border bg-card p-6 panel-glow">
        <div className="font-display text-[11px] tracking-[4px] text-secondary-foreground mb-4">CHANGE ADMIN PASSWORD</div>
        <div className="flex gap-3">
          <input type="text" value={newAdminPw} onChange={e => setNewAdminPw(e.target.value)} placeholder="NEW PASSWORD" className="flex-1 bg-background border border-muted-foreground text-foreground font-display text-sm p-2 tracking-[3px] text-center outline-none focus:border-foreground" />
          <button onClick={() => { if (newAdminPw.trim()) { setAdminPassword(newAdminPw.trim()); setNewAdminPw(''); } }} className="px-4 py-2 border border-warning text-warning font-display text-[10px] tracking-[2px] hover:bg-warning hover:text-background transition-all">UPDATE</button>
        </div>
      </section>
    </div>
  );
};

export default AdminPage;
