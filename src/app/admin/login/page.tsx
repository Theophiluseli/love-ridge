'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import Logo from '@/components/Logo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@loveridge.com');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed.');

      localStorage.setItem('loveridge_user', JSON.stringify(data.user));
      localStorage.setItem('loveridge_token', data.token);

      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 p-8 sm:p-10 space-y-8 relative z-10 shadow-2xl">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo className="h-14" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Admin Portal</h1>
          <p className="text-xs text-slate-500 font-medium">
            Sign in with your assigned RBAC staff credentials
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="gradient-btn w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center space-y-2">
          <p className="text-[11px] text-slate-500 font-medium">Quick Test Credentials:</p>
          <div className="text-[10px] text-slate-600 space-y-1 font-mono font-semibold">
            <div>Super Admin: admin@loveridge.com (Password123!)</div>
            <div>Property Mgr: propmgr@loveridge.com (Password123!)</div>
            <div>Agent: agent.kwame@loveridge.com (Password123!)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
