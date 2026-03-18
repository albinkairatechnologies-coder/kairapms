'use client';

import { useRef, MouseEvent, ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  goldBorder?: boolean;
}

export default function GlowCard({ children, className = '', goldBorder = false }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mx', `${x}%`);
    card.style.setProperty('--my', `${y}%`);

    // Subtle 3D tilt
    const tiltX = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
    const tiltY = ((e.clientX - rect.left) / rect.width - 0.5) * -6;
    card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-2px)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`glow-card ${goldBorder ? 'animate-border-glow' : ''} ${className}`}
      style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease' }}
    >
      {children}
    </div>
  );
}
