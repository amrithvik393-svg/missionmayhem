import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function TopBar() {
  const location = useLocation();

  const getStatus = () => {
    if (location.pathname.startsWith('/room/')) return 'ROOM CONTROL';
    if (location.pathname === '/intelligence') return 'INTELLIGENCE ROOM';
    if (location.pathname === '/admin') return 'ADMIN CONTROL';
    if (location.pathname === '/scoreboard') return 'SCOREBOARD';
    if (location.pathname.startsWith('/boss')) return 'BOSS ROOM';
    if (location.pathname === '/volunteer') return 'VOLUNTEER';
    return 'MISSION CONTROL';
  };

  return (
    <div className="fixed top-12 left-0 right-0 flex justify-between items-center px-6 py-2 border-b border-border bg-card z-40 text-[10px] tracking-[3px] text-secondary-foreground">
      <Link to="/" className="font-display font-black text-[13px] text-foreground glow-green tracking-[4px]">ΣAGENCY</Link>
      <span>MISSION MAYHEM — {getStatus()}</span>
      <Clock />
    </div>
  );
}

function Clock() {
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 8));
  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toTimeString().slice(0, 8)), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tracking-[2px] text-[10px] text-muted-foreground">{time}</span>;
}
