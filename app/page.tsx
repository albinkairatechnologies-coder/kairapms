'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from './utils/AuthContext';
import { useRouter } from 'next/navigation';

const ThreeScene = dynamic(() => import('./components/ThreeScene'), { ssr: false });

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);
  const { login, user }         = useAuth();
  const router                  = useRouter();
  const cardRef                 = useRef<HTMLDivElement>(null);
  const lightRef                = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Mouse ambient light follow
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (lightRef.current) {
        lightRef.current.style.left = `${e.clientX}px`;
        lightRef.current.style.top  = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Card 3D tilt on mouse move
  const handleCardMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-4px)`;
    card.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
    card.style.setProperty('--my', `${(y + 0.5) * 100}%`);
  };

  const handleCardLeave = () => {
    if (cardRef.current)
      cardRef.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
  };

  if (user) { router.push('/dashboard'); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse 100% 70% at 50% -5%, rgba(99,102,241,.2) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 90% 110%, rgba(245,200,66,.1) 0%, transparent 55%), #080B14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
    }}>

      {/* Three.js scene */}
      {mounted && <ThreeScene />}

      {/* Mouse ambient glow */}
      <div ref={lightRef} style={{
        position: 'fixed',
        width: 700, height: 700,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 1,
        transform: 'translate(-50%,-50%)',
        background: 'radial-gradient(circle, rgba(99,102,241,.07) 0%, rgba(245,200,66,.03) 40%, transparent 70%)',
        transition: 'left .08s linear, top .08s linear',
      }} />

      {/* Scan line overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.03) 2px, rgba(0,0,0,.03) 4px)',
      }} />

      {/* Login card */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 420, padding: '0 20px' }}>

        {/* Floating label above card */}
        <div style={{ textAlign: 'center', marginBottom: 28, opacity: mounted ? 1 : 0, transition: 'opacity .8s ease .2s' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 999,
            background: 'rgba(99,102,241,.12)',
            border: '1px solid rgba(99,102,241,.25)',
            fontSize: 12, color: 'rgba(165,180,252,.9)', letterSpacing: '0.08em',
            marginBottom: 16,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 8px #6366f1', display: 'inline-block' }} />
            KAIRA TECHNOLOGIES
          </div>
          <h1 style={{
            fontSize: 38, fontWeight: 900, margin: 0, lineHeight: 1.1,
            background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,.7) 40%, #F5C842 70%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>KairaFlow</h1>
          <p style={{ color: 'rgba(156,163,175,.6)', fontSize: 13, marginTop: 6 }}>
            Project Management System
          </p>
        </div>

        {/* Card */}
        <div
          ref={cardRef}
          onMouseMove={handleCardMove}
          onMouseLeave={handleCardLeave}
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(20,24,40,.95) 0%, rgba(10,12,20,.98) 100%)',
            border: '1px solid rgba(99,102,241,.2)',
            borderRadius: 24,
            padding: '36px 32px',
            boxShadow: '0 30px 80px -10px rgba(0,0,0,.8), 0 0 60px rgba(99,102,241,.08), inset 0 1px 0 rgba(255,255,255,.05)',
            transition: 'transform .25s ease, box-shadow .25s ease',
            overflow: 'hidden',
          }}
        >
          {/* Card inner glow on hover */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 24, pointerEvents: 'none',
            background: 'radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(99,102,241,.08) 0%, transparent 60%)',
          }} />

          {/* Top accent line */}
          <div style={{
            position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(99,102,241,.6), rgba(245,200,66,.4), transparent)',
          }} />

          {/* Logo icon */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 60, height: 60, borderRadius: 18,
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #F5C842 100%)',
              boxShadow: '0 0 30px rgba(99,102,241,.4), 0 0 60px rgba(245,200,66,.15)',
              fontSize: 26, fontWeight: 900, color: '#fff',
              animation: 'floatY 3s ease-in-out infinite',
            }}>K</div>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(156,163,175,.7)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: .4 }}>✉</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@kairatech.com"
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '12px 14px 12px 40px',
                    background: 'rgba(255,255,255,.04)',
                    border: '1px solid rgba(255,255,255,.08)',
                    borderRadius: 12, color: '#fff', fontSize: 14,
                    outline: 'none', transition: 'border-color .2s, box-shadow .2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.12)'; }}
                  onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,.08)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(156,163,175,.7)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: .4 }}>🔒</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '12px 44px 12px 40px',
                    background: 'rgba(255,255,255,.04)',
                    border: '1px solid rgba(255,255,255,.08)',
                    borderRadius: 12, color: '#fff', fontSize: 14,
                    outline: 'none', transition: 'border-color .2s, box-shadow .2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.12)'; }}
                  onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,.08)'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: .5, color: '#fff', padding: 0 }}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 10, marginBottom: 16,
                background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)',
                color: '#fca5a5', fontSize: 13,
              }}>
                ⚠ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                background: loading
                  ? 'rgba(99,102,241,.4)'
                  : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #a855f7 100%)',
                color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 0 30px rgba(99,102,241,.4), 0 4px 20px rgba(0,0,0,.3)',
                transition: 'all .2s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
              onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 50px rgba(99,102,241,.6), 0 4px 24px rgba(0,0,0,.4)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 30px rgba(99,102,241,.4), 0 4px 20px rgba(0,0,0,.3)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
            >
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  Authenticating...
                </>
              ) : (
                <>
                  <span>⚡</span> Sign In to Dashboard
                </>
              )}
            </button>

          </form>

          {/* Bottom accent */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: 'rgba(107,114,128,.5)', letterSpacing: '0.05em' }}>
              🔐 Secured · KairaFlow v2.0
            </p>
          </div>

          {/* Bottom accent line */}
          <div style={{
            position: 'absolute', bottom: 0, left: '30%', right: '30%', height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(245,200,66,.3), transparent)',
          }} />
        </div>
      </div>

      <style>{`
        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: rgba(156,163,175,.35); }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px rgba(20,24,40,.95) inset !important;
          -webkit-text-fill-color: #fff !important;
        }
      `}</style>
    </div>
  );
}
