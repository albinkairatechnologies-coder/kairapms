'use client';

import { useState } from 'react';
import { useAuth } from './utils/AuthContext';
import { useRouter } from 'next/navigation';
import ParticleBackground from './components/ParticleBackground';
import GlowCard from './components/GlowCard';
import MouseLight from './components/MouseLight';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login, user }         = useAuth();
  const router                  = useRouter();

  if (user) { router.push('/dashboard'); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,.15) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 110%, rgba(245,200,66,.08) 0%, transparent 60%), #0F1117' }}>

      {/* Particle background */}
      <ParticleBackground count={60} />

      {/* Mouse ambient light */}
      <MouseLight />

      {/* Ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,200,66,.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <GlowCard className="p-8" goldBorder>

          {/* Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 animate-float"
              style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #F5C842 100%)', boxShadow: '0 0 30px rgba(245,200,66,.3), 0 0 60px rgba(99,102,241,.2)' }}>
              <span className="text-white font-black text-2xl">K</span>
            </div>
            <h1 className="text-3xl font-black text-shimmer mb-1">KairaFlow</h1>
            <p className="text-gray-500 text-sm">Digital Marketing & Web Development</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input" placeholder="your@email.com" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="input" placeholder="••••••••" required />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm text-red-400 border border-red-500/30"
                style={{ background: 'rgba(239,68,68,.08)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-gold w-full py-3 text-base font-bold mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : '✦ Sign In'}
            </button>
          </form>

          {/* Employee portal link */}
          <div className="mt-6 text-center">
            <a href="/employee"
              className="text-sm font-medium transition-colors"
              style={{ color: 'rgba(245,200,66,.7)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#F5C842')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,200,66,.7)')}>
              👥 Employee Portal →
            </a>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 rounded-xl p-4" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
            <p className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Demo Credentials</p>
            <div className="space-y-1.5 text-xs">
              {[
                ['👑 Admin',          'admin@agency.com / admin123'],
                ['📊 Marketing Head', 'john@agency.com / password123'],
                ['💻 Developer',      'jane@agency.com / password123'],
                ['📱 Social Media',   'mike@agency.com / password123'],
                ['📞 CRM / Sales',    'sarah@agency.com / password123'],
              ].map(([role, cred]) => (
                <div key={role} className="flex justify-between items-center">
                  <span className="text-gray-500">{role}</span>
                  <span className="text-gray-400 font-mono">{cred}</span>
                </div>
              ))}
            </div>
          </div>

        </GlowCard>
      </div>
    </div>
  );
}
