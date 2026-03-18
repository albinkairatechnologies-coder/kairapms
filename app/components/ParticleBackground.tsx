'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  r: number; alpha: number;
  color: string;
}

const DARK_COLORS  = ['rgba(245,200,66,', 'rgba(168,85,247,', 'rgba(99,102,241,', 'rgba(255,255,255,'];
const LIGHT_COLORS = ['rgba(99,102,241,',  'rgba(139,92,246,', 'rgba(168,85,247,', 'rgba(99,102,241,'];

export default function ParticleBackground({ count = 55 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const isDark = () => document.documentElement.classList.contains('dark');

    const particles: Particle[] = Array.from({ length: count }, () => {
      const palette = isDark() ? DARK_COLORS : LIGHT_COLORS;
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.8 + 0.4,
        alpha: Math.random() * 0.5 + 0.15,
        color: palette[Math.floor(Math.random() * palette.length)],
      };
    });

    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const dark = isDark();
      const lineColor = dark ? '245,200,66' : '99,102,241';
      const lineBaseAlpha = dark ? 0.06 : 0.025;
      const alphaScale = dark ? 1 : 0.45;

      // Connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${lineColor},${lineBaseAlpha * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Particles
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha * alphaScale})`;
        ctx.fill();

        // Glow only in dark mode
        if (dark) {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
          grad.addColorStop(0, `${p.color}${p.alpha * 0.35})`);
          grad.addColorStop(1, `${p.color}0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      });

      raf = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, [count]);

  return <canvas ref={canvasRef} className="particle-canvas" />;
}
