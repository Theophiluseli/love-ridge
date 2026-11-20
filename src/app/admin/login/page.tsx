'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import Logo from '@/components/Logo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'LOGIN' | 'RESET'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

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
      <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 p-8 sm:p-10 space-y-6 relative z-10 shadow-2xl">
        <div className="text-center space-y-3">
          <div className="flex justify-center items-center">
            <Logo className="h-12" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-4">
            {mode === 'LOGIN' ? 'Admin Portal Sign In' : 'Reset Admin Password'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {mode === 'LOGIN'
              ? 'Sign in with your admin email and password credentials'
              : 'Enter your admin email and set your new password'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {mode === 'LOGIN' ? (
          <form onSubmit={handleLogin} className="space-y-4">
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setSuccess('');
                    setMode('RESET');
                  }}
                  className="text-xs text-emerald-800 font-bold hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
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
              className="gradient-btn w-full py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold leading-relaxed">
              For security, passwords can no longer be reset from this page. Please ask a Loveridge Super Admin to
              reset your password from <strong>Admin → Users</strong>. Once signed in, you can change your own password in
              Settings.
            </div>
            <button
              type="button"
              onClick={() => {
                setError('');
                setSuccess('');
                setMode('LOGIN');
              }}
              className="w-full py-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              Back to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
