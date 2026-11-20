'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, Smartphone, KeyRound, Loader2, ExternalLink } from 'lucide-react';

type Stage = 'loading' | 'off' | 'setup' | 'on' | 'unavailable';

async function call2fa(body?: Record<string, unknown>) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('loveridge_token') : null;
  const res = await fetch('/api/auth/2fa', {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed.'), { status: res.status });
  return data;
}

/** Settings card for turning authenticator-app 2-step login on and off. */
export default function TwoFactorCard() {
  const [stage, setStage] = useState<Stage>('loading');
  const [secret, setSecret] = useState('');
  const [link, setLink] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    call2fa()
      .then((d) => setStage(d.enabled ? 'on' : 'off'))
      .catch(() => setStage('unavailable'));
  }, []);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setErr('');
    setMsg('');
    try {
      await fn();
    } catch (e: any) {
      setErr(e.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  const startSetup = () =>
    run(async () => {
      const d = await call2fa({ action: 'setup' });
      setSecret(d.secret);
      setLink(d.otpauthUrl);
      setCode('');
      setStage('setup');
    });

  const confirm = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      await call2fa({ action: 'enable', code });
      setStage('on');
      setCode('');
      setSecret('');
      setLink('');
      setMsg('2-step login is ON. From now on you will be asked for a code from your phone when you sign in.');
    });
  };

  const turnOff = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      await call2fa({ action: 'disable', code, password });
      setStage('off');
      setCode('');
      setPassword('');
      setMsg('2-step login has been turned off for your account.');
    });
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-5">
      <div className="border-b border-slate-100 pb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" /> 2-Step Login (Authenticator App)
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Protects the admin portal even if your password is stolen. Works with Google Authenticator, Microsoft
            Authenticator or Authy.
          </p>
        </div>
        {stage === 'on' && (
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold border border-emerald-200 shrink-0">
            ON
          </span>
        )}
        {stage === 'off' && (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-200 shrink-0">
            OFF
          </span>
        )}
      </div>

      {msg && <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl font-bold">{msg}</div>}
      {err && <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-bold">{err}</div>}

      {stage === 'loading' && (
        <p className="text-xs text-slate-500 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Checking…
        </p>
      )}

      {stage === 'unavailable' && (
        <p className="text-xs text-slate-600">Sign out and sign in again with your own account to manage 2-step login.</p>
      )}

      {stage === 'off' && (
        <button
          type="button"
          onClick={startSetup}
          disabled={busy}
          className="gradient-btn px-5 py-3 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-md disabled:opacity-60"
        >
          <Smartphone className="w-4 h-4" /> {busy ? 'Starting…' : 'Turn on 2-step login'}
        </button>
      )}

      {stage === 'setup' && (
        <form onSubmit={confirm} className="space-y-4">
          <ol className="text-xs text-slate-700 font-medium space-y-2 list-decimal pl-4">
            <li>Install <strong>Google Authenticator</strong> (or Microsoft Authenticator / Authy) on your phone.</li>
            <li>
              In the app tap <strong>+</strong> → <strong>Enter a setup key</strong>. Account: <em>Loveridge Admin</em>. Key:
              <div className="mt-2 p-3 bg-slate-900 text-emerald-300 font-mono text-sm tracking-wider rounded-xl select-all break-all">
                {secret}
              </div>
              <span className="block mt-1 text-[11px] text-slate-500">
                On this phone? <a href={link} className="text-emerald-800 font-bold underline inline-flex items-center gap-1">Open in authenticator app <ExternalLink className="w-3 h-3" /></a>
              </span>
            </li>
            <li>Type the 6-digit code the app shows to confirm.</li>
          </ol>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-semibold">
            Keep a copy of the key above somewhere safe (e.g. a password manager). If you lose your phone you can add it
            to a new phone, or another Super Admin can turn 2-step login off for you.
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">6-digit code</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={7}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9 ]/g, ''))}
                placeholder="123 456"
                className="admin-input tracking-[0.3em] font-bold"
              />
            </div>
            <button type="submit" disabled={busy} className="gradient-btn px-5 py-3 rounded-xl text-xs font-bold shadow-md disabled:opacity-60">
              {busy ? 'Checking…' : 'Confirm & turn on'}
            </button>
          </div>
        </form>
      )}

      {stage === 'on' && (
        <form onSubmit={turnOff} className="space-y-3">
          <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-slate-500" /> To turn it off (or move to a new phone) enter your password and a current code.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Current password"
              className="admin-input"
            />
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={7}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9 ]/g, ''))}
              placeholder="6-digit code"
              className="admin-input"
            />
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-3 rounded-xl border-2 border-rose-300 text-rose-800 hover:bg-rose-50 text-xs font-bold disabled:opacity-60"
            >
              {busy ? 'Working…' : 'Turn off 2-step login'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
