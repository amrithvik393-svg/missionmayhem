import { useEffect, useRef, useCallback } from 'react';

export function EkgStrip() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offsetRef = useRef(0);

  const ekgY = useCallback((x: number, cy: number) => {
    const p = x % 120;
    if (p < 10) return cy;
    if (p < 15) return cy - 4;
    if (p < 20) return cy;
    if (p < 25) return cy - 20;
    if (p < 28) return cy + 12;
    if (p < 33) return cy - 35;
    if (p < 38) return cy + 8;
    if (p < 42) return cy - 6;
    if (p < 47) return cy;
    return cy;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let animId: number;
    const draw = () => {
      const w = canvas.width, h = canvas.height, cy = h / 2;
      ctx.fillStyle = 'rgba(2,11,8,0.4)';
      ctx.fillRect(0, 0, w, h);
      ctx.beginPath();
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 8;
      for (let x = 0; x < w; x++) {
        const y = ekgY(x + offsetRef.current, cy);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      offsetRef.current += 2;
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [ekgY]);

  return (
    <div className="fixed top-0 left-0 right-0 h-12 border-b border-border bg-card z-50">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
