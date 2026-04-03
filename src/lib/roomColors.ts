// Room-specific color themes for timers
export const ROOM_COLORS: Record<string, { base: string; glow: string; glowLg: string; bar: string; hsl: string }> = {
  strength: {
    base: 'text-green-400',
    glow: 'text-shadow: 0 0 20px #4ade80',
    glowLg: 'text-shadow: 0 0 60px #4ade80, 0 0 120px rgba(74,222,128,0.3)',
    bar: 'bg-green-400 shadow-[0_0_10px_#4ade80]',
    hsl: '142 69% 58%',
  },
  intelligence: {
    base: 'text-blue-400',
    glow: 'text-shadow: 0 0 20px #60a5fa',
    glowLg: 'text-shadow: 0 0 60px #60a5fa, 0 0 120px rgba(96,165,250,0.3)',
    bar: 'bg-blue-400 shadow-[0_0_10px_#60a5fa]',
    hsl: '217 92% 68%',
  },
  memory: {
    base: 'text-yellow-400',
    glow: 'text-shadow: 0 0 20px #facc15',
    glowLg: 'text-shadow: 0 0 60px #facc15, 0 0 120px rgba(250,204,21,0.3)',
    bar: 'bg-yellow-400 shadow-[0_0_10px_#facc15]',
    hsl: '48 97% 53%',
  },
  strategy: {
    base: 'text-red-400',
    glow: 'text-shadow: 0 0 20px #f87171',
    glowLg: 'text-shadow: 0 0 60px #f87171, 0 0 120px rgba(248,113,113,0.3)',
    bar: 'bg-red-400 shadow-[0_0_10px_#f87171]',
    hsl: '0 94% 70%',
  },
  stealth: {
    base: 'text-cyan-400',
    glow: 'text-shadow: 0 0 20px #22d3ee',
    glowLg: 'text-shadow: 0 0 60px #22d3ee, 0 0 120px rgba(34,211,238,0.3)',
    bar: 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]',
    hsl: '188 94% 53%',
  },
};

export function getRoomColor(roomId: string) {
  return ROOM_COLORS[roomId] || {
    base: 'text-foreground',
    glow: '',
    glowLg: 'text-shadow: 0 0 60px hsl(var(--primary)), 0 0 120px hsla(152, 100%, 50%, 0.3)',
    bar: 'bg-foreground shadow-[0_0_10px_hsl(var(--primary))]',
    hsl: '152 100% 50%',
  };
}
