import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { useI18n } from '../utils/i18n';
import { storageService } from '../services/storageService';
import { Navbar } from '../components/layout/Navbar';
import {
  User,
  Shield,
  HardDrive,
  Database,
  Copy,
  Check,
  LogOut,
  Sparkles,
  Sliders,
  ArrowLeft
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, signOut, updateProfile, isDemoMode, enableDemoMode } = useAuth();
  const { navigate } = useRouter();
  const { t } = useI18n();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [profileSaved, setProfileSaved] = useState(false);
  const [defaultPrivacy, setDefaultPrivacy] = useState<'public' | 'code_protected'>('public');
  const [maxPhotoSizeMb, setMaxPhotoSizeMb] = useState('20');
  const [copiedSql, setCopiedSql] = useState(false);

  const stats = storageService.getStats(user?.id);
  const percentUsed = Math.min(100, Math.round((stats.usedBytes / stats.quotaBytes) * 100));
  const schemaSql = storageService.getSupabaseSchemaSql();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim()) {
      updateProfile(displayName.trim());
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(schemaSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-24">
      <Navbar />

      {/* Breadcrumb with Back button to previous page */}
      <div className="border-b border-neutral-800 bg-neutral-900/40">
        <div className="mx-auto flex h-12 max-w-4xl items-center px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => (window.history.length > 1 ? window.history.back() : navigate('/dashboard'))}
            className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors"
            title="Назад на предыдущую страницу"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Назад</span>
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {t.settingsTitle}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-400">
            Manage your account credentials, storage quotas, and database integrations.
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 text-white">
              <User className="h-5 w-5 text-neutral-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Account Profile</h2>
              <p className="text-xs text-neutral-400">{user?.email}</p>
            </div>
            {isDemoMode && (
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Demo Account</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1.5 w-full max-w-md rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-xs text-white focus:border-neutral-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="rounded-xl bg-neutral-100 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-white active:scale-95 transition-all shadow-sm"
              >
                Save Profile
              </button>
              {profileSaved && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                  <Check className="h-3.5 w-3.5" />
                  <span>Saved successfully</span>
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Storage Quota Card */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 text-white">
              <HardDrive className="h-5 w-5 text-neutral-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{t.storageQuota}</h2>
              <p className="text-xs text-neutral-400">
                Local IndexedDB binary capacity & cloud storage utilization
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-300">
              <span>Used Storage</span>
              <span className="font-mono tabular-nums font-semibold text-white">
                {(stats.usedBytes / (1024 * 1024)).toFixed(1)} MB / 500 MB ({percentUsed}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
              <div
                className="h-full bg-neutral-200 transition-all duration-300"
                style={{ width: `${Math.max(4, percentUsed)}%` }}
              />
            </div>

            <div className="flex items-center justify-between pt-2 text-[11px] text-neutral-500">
              <span>{stats.albumCount} active albums</span>
              <span>{stats.photoCount} stored photos</span>
              <span>{stats.contributorCount} unique contributors</span>
            </div>
          </div>
        </div>

        {/* Defaults & Upload Configuration */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 text-white">
              <Sliders className="h-5 w-5 text-neutral-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Upload Limits & Privacy Defaults</h2>
              <p className="text-xs text-neutral-400">
                Default behavior for newly created albums and visitor submissions
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                {t.defaultPrivacyPref}
              </label>
              <select
                value={defaultPrivacy}
                onChange={(e) => setDefaultPrivacy(e.target.value as 'public' | 'code_protected')}
                className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-xs text-neutral-200 focus:border-neutral-500 focus:outline-none"
              >
                <option value="public">Public (Anyone with QR/link can upload)</option>
                <option value="code_protected">Passcode Protected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                {t.fileSizeLimit}
              </label>
              <select
                value={maxPhotoSizeMb}
                onChange={(e) => setMaxPhotoSizeMb(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-xs text-neutral-200 focus:border-neutral-500 focus:outline-none"
              >
                <option value="10">10 MB per photo</option>
                <option value="20">20 MB per photo (Recommended)</option>
                <option value="50">50 MB per photo (High-res RAW/JPEG)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Database & Supabase Integration (Required technical requirement) */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 text-white">
                <Database className="h-5 w-5 text-neutral-300" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">{t.databaseIntegration}</h2>
                <p className="text-xs text-neutral-400">
                  Ready-to-deploy PostgreSQL tables and Row Level Security policies
                </p>
              </div>
            </div>

            <button
              onClick={handleCopySql}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 transition-colors"
            >
              {copiedSql ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied SQL</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy SQL Schema</span>
                </>
              )}
            </button>
          </div>

          <p className="mt-4 text-xs text-neutral-400 leading-relaxed">
            {t.supabaseInstructions}
          </p>

          {/* Code block with tabular/monospace discipline */}
          <div className="mt-4 relative rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-[11px] text-neutral-300 overflow-x-auto max-h-64 leading-normal">
            <pre>{schemaSql}</pre>
          </div>
        </div>

        {/* Session Management */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Sign Out</h3>
              <p className="text-xs text-neutral-400">
                End your session on this browser device.
              </p>
            </div>
            <button
              onClick={() => {
                signOut();
                navigate('/auth');
              }}
              className="flex items-center gap-2 rounded-xl border border-red-900/60 bg-red-950/20 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-900/40 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>{t.signOut}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
