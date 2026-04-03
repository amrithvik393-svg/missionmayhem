import { Link } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { getRoomColor } from '@/lib/roomColors';

const Index = () => {
  const { state } = useGame();

  if (!state.loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="font-display text-[13px] tracking-[5px] text-secondary-foreground animate-blink">LOADING MISSION DATA...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-24 pb-12 px-6 gap-8">
      <div className="font-display font-black text-3xl md:text-5xl tracking-[8px] text-foreground glow-green text-center">MISSION MAYHEM</div>
      <div className="text-[10px] tracking-[4px] text-secondary-foreground text-center">ΣAGENCY — OPERATION CONTROL HUB</div>

      {state.currentTeam && (
        <div className="border border-border bg-card px-6 py-3 text-center">
          <div className="text-[9px] tracking-[3px] text-muted-foreground">ACTIVE TEAM</div>
          <div className="font-display font-bold text-foreground text-lg tracking-[4px] mt-1">{state.currentTeam}</div>
        </div>
      )}

      {/* Room status overview (no links - rooms are accessed via volunteer page) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-3xl mt-4">
        {state.rooms.map((room, i) => {
          const roomColor = getRoomColor(room.id);
          const activeTeam = state.teams.find(t => t.id === room.activeTeamId);
          return (
            <div key={room.id} className="border border-border bg-card p-6 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="text-[9px] tracking-[4px] text-muted-foreground">ROOM {String(i + 1).padStart(2, '0')}</div>
                {activeTeam && (
                  <div className="text-[8px] tracking-[1px] text-accent">● {activeTeam.teamName}</div>
                )}
              </div>
              <div className={`font-display font-bold text-lg tracking-[4px] ${roomColor.base}`}>{room.name}</div>
              <div className="text-[10px] tracking-[2px] text-secondary-foreground">{room.points} PTS — {room.timeMinutes}:{String(room.timeSeconds).padStart(2, '0')}</div>
            </div>
          );
        })}

        {/* Boss Room */}
        <Link to="/boss/vitals" className="border border-destructive/30 bg-card p-6 flex flex-col gap-2 transition-all hover:border-destructive hover:shadow-[0_0_20px_hsla(348,100%,60%,0.15)] group">
          <div className="text-[9px] tracking-[4px] text-destructive/60">BOSS ROOM</div>
          <div className="font-display font-bold text-lg tracking-[4px] text-destructive group-hover:glow-red">BIOSYNC VITALS</div>
          <div className="text-[10px] tracking-[2px] text-secondary-foreground">{state.boss.points} PTS — {state.boss.timeMinutes}:{String(state.boss.timeSeconds).padStart(2, '0')}</div>
        </Link>
        <Link to="/boss/files" className="border border-warning/30 bg-card p-6 flex flex-col gap-2 transition-all hover:border-warning hover:shadow-[0_0_20px_hsla(30,100%,50%,0.15)] group" style={{ background: '#080600' }}>
          <div className="text-[9px] tracking-[4px]" style={{ color: '#7a5200' }}>BOSS ROOM</div>
          <div className="font-display font-bold text-lg tracking-[4px]" style={{ color: '#ffb000' }}>CLASSIFIED FILES</div>
          <div className="text-[10px] tracking-[2px] text-secondary-foreground">OPERATION GENESIS</div>
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        <Link to="/scoreboard" className="border border-border px-6 py-3 font-display text-[11px] tracking-[3px] text-secondary-foreground hover:border-foreground hover:text-foreground transition-all">SCOREBOARD</Link>
        <Link to="/volunteer" className="border border-border px-6 py-3 font-display text-[11px] tracking-[3px] text-secondary-foreground hover:border-foreground hover:text-foreground transition-all">VOLUNTEER</Link>
        <Link to="/admin" className="border border-muted-foreground px-6 py-3 font-display text-[11px] tracking-[3px] text-muted-foreground hover:border-foreground hover:text-foreground transition-all">ADMIN</Link>
      </div>
    </div>
  );
};

export default Index;
