import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { useI18n } from '../utils/i18n';
import { Camera, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const AuthView: React.FC = () => {
  const { signIn, signUp, enableDemoMode } = useAuth();
  const { navigate } = useRouter();
  const { t } = useI18n();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        const ok = await signIn(email.trim(), password);
        if (ok) navigate('/dashboard');
        else setError('Failed to sign in. Please verify credentials.');
      } else {
        if (!displayName.trim()) {
          setError('Display name is required');
          setLoading(false);
          return;
        }
        const ok = await signUp(email.trim(), displayName.trim(), password);
        if (ok) navigate('/dashboard');
        else setError('Failed to create account.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    enableDemoMode();
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-neutral-950 px-4 py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div
          onClick={() => navigate('/')}
          className="mx-auto flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-neutral-700 bg-neutral-900 text-white shadow-md hover:opacity-90"
        >
          <Camera className="h-6 w-6 text-neutral-200" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {mode === 'signin' ? 'Sign in to Aperture Live' : 'Create your account'}
        </h2>
        <p className="mt-2 text-xs text-neutral-400">
          Collaborative event photo sharing platform with instant mobile QR codes.
        </p>
      </div>

      {/* Main Form Box */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8 shadow-xl">
          {/* Quick Demo Access Banner */}
          <div className="mb-6 rounded-xl border border-sky-900/60 bg-sky-950/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                <Sparkles className="h-4 w-4" />
                <span>Instant Demo Mode</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-neutral-400">
              Explore pre-seeded event albums, generate QR codes, and test guest uploads without signing up.
            </p>
            <button
              onClick={handleDemoAccess}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-sky-500 py-2 text-xs font-bold text-neutral-950 hover:bg-sky-400 active:scale-95 transition-all shadow-sm"
            >
              <span>Explore as Demo Organizer</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-neutral-900 px-3 text-neutral-500 font-semibold tracking-wider">
                Or Continue With Email
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-800/60 bg-red-950/40 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Full Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Jordan Reed"
                  className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-100 py-2.5 text-xs font-bold text-neutral-950 hover:bg-white active:scale-95 transition-all shadow-md disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent" />
              ) : mode === 'signin' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Toggle between Signin and Signup */}
          <div className="mt-6 text-center text-xs text-neutral-400">
            {mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
                  className="font-semibold text-white hover:underline"
                >
                  Sign up for free
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signin');
                    setError('');
                  }}
                  className="font-semibold text-white hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Security / Privacy reassurance */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-neutral-500">
          <ShieldCheck className="h-4 w-4 text-neutral-400" />
          <span>Private, encrypted album tokens & role separation</span>
        </div>
      </div>
    </div>
  );
};
