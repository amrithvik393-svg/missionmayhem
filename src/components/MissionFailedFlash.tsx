import { useEffect, useState } from 'react';

interface Props {
  show: boolean;
  onDone?: () => void;
}

export function MissionFailedFlash({ show, onDone }: Props) {
  const [visible, setVisible] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      // Flash red 3 times
      let count = 0;
      const interval = setInterval(() => {
        setFlash(prev => !prev);
        count++;
        if (count >= 6) {
          clearInterval(interval);
          setFlash(false);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-200 ${
        flash ? 'bg-destructive/40' : 'bg-transparent'
      }`}
      style={{ pointerEvents: 'none' }}
    >
      {flash && (
        <div className="font-display text-[80px] md:text-[120px] font-black text-destructive glow-red tracking-[8px] text-center animate-critical">
          MISSION FAILED
        </div>
      )}
    </div>
  );
}
