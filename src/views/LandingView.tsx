import React from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../utils/i18n';
import {
  Camera,
  QrCode,
  Smartphone,
  Download,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const { navigate } = useRouter();
  const { enableDemoMode } = useAuth();
  const { t } = useI18n();

  const handleDemo = () => {
    enableDemoMode();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-neutral-800">
      {/* Top Bar Contract (3 zones separated by gap-8) */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          {/* Zone 1: Single text element wordmark */}
          <div
            onClick={() => navigate('/dashboard')}
            className="flex cursor-pointer items-center gap-3 whitespace-nowrap shrink-0"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-100 shadow-sm">
              <Camera className="h-5 w-5 text-neutral-200" />
            </div>
            <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
              Aperture Live
            </span>
          </div>

          {/* Zone 2: 4 single-line nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
            <button
              onClick={() => navigate('/dashboard')}
              className="whitespace-nowrap shrink-0 transition-colors hover:text-white"
            >
              Platform Overview
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="whitespace-nowrap shrink-0 transition-colors hover:text-white"
            >
              Event Galleries
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="whitespace-nowrap shrink-0 transition-colors hover:text-white"
            >
              Enterprise & Storage
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleDemo}
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white whitespace-nowrap shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5 text-sky-400" />
              <span>Demo Account</span>
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 rounded-lg bg-neutral-100 px-4 py-2 text-xs font-bold text-neutral-950 transition-all hover:bg-white active:scale-95 shadow-sm whitespace-nowrap shrink-0"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs text-neutral-300">
                <Zap className="h-3.5 w-3.5 text-sky-400" />
                <span>Modern Collaborative Photo Sharing for Events</span>
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl text-balance">
                Every event photo in one real-time stream.
              </h1>

              <p className="max-w-xl text-base text-neutral-400 leading-relaxed">
                Generate a unique QR code for your conference, hackathon, or company offsite.
                Attendees scan with their phone camera and drop photos instantly — zero app downloads, zero registrations.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 rounded-xl bg-neutral-100 px-6 py-3.5 text-sm font-bold text-neutral-950 transition-all hover:bg-white active:scale-95 shadow-lg"
                >
                  <span>Launch Event Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={handleDemo}
                  className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-5 py-3.5 text-sm font-semibold text-neutral-200 transition-colors hover:border-neutral-700 hover:bg-neutral-800 hover:text-white"
                >
                  <Sparkles className="h-4 w-4 text-sky-400" />
                  <span>Test Pre-Seeded Events</span>
                </button>
              </div>

              {/* Trust markers */}
              <div className="pt-6 flex items-center gap-6 text-xs text-neutral-500">
                <span>✓ High-Resolution Original Photos</span>
                <span>✓ Bulk ZIP Archive Export</span>
                <span>✓ Private Passcode Protection</span>
              </div>
            </div>

            {/* Right Column: Hero Graphic / Interactive Preview */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-2xl backdrop-blur-xl">
                {/* Simulated Event Card */}
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 text-white font-mono text-xs font-bold">
                      AI26
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Global AI Summit 2026</h3>
                      <p className="text-xs text-neutral-400">Moscone West · 18 photos</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Uploads Open</span>
                  </span>
                </div>

                {/* QR Focus Box */}
                <div className="my-6 flex flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-950 p-6 text-center">
                  <div className="h-44 w-44 rounded-xl bg-white p-3 shadow-md flex items-center justify-center">
                    <QrCode className="h-36 w-36 text-neutral-950" />
                  </div>
                  <p className="mt-3 text-xs font-semibold text-neutral-200">
                    Scan with any phone camera
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-500">
                    Points attendees directly to mobile photo drop
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                    <span className="block font-mono text-lg font-bold text-white tabular-nums">72h</span>
                    <span className="text-[11px] text-neutral-400">Event Duration</span>
                  </div>
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                    <span className="block font-mono text-lg font-bold text-white tabular-nums">0s</span>
                    <span className="text-[11px] text-neutral-400">Guest Friction</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars of Architecture */}
      <section className="border-t border-neutral-800/80 bg-neutral-900/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Built for Scale & Simplicity
            </h2>
            <p className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Engineered for seamless guest participation.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Pillar 1 */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 text-neutral-200">
                  <QrCode className="h-5 w-5 text-neutral-300" />
                </div>
                <h3 className="mt-4 text-base font-bold text-white">Unique Scannable QR Codes</h3>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                  Every album generates a distinct public token and scannable code. Print high-res table standees or display on keynote presentation screens.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-800/60 text-xs text-neutral-400">
                Separate links for uploads & viewing
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 text-neutral-200">
                  <Smartphone className="h-5 w-5 text-neutral-300" />
                </div>
                <h3 className="mt-4 text-base font-bold text-white">Zero-Install Mobile Uploads</h3>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                  Guests open the page in Mobile Safari or Chrome directly from their native camera. Batch select photos with instant upload progress.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-800/60 text-xs text-neutral-400">
                JPEG, PNG, WEBP up to 20MB
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 text-neutral-200">
                  <Download className="h-5 w-5 text-neutral-300" />
                </div>
                <h3 className="mt-4 text-base font-bold text-white">One-Click Bulk ZIP Export</h3>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                  Download all crowdsourced event photography in a single compressed ZIP archive with original resolutions intact.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-800/60 text-xs text-neutral-400">
                Instant browser packaging with JSZip
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8 text-xs text-neutral-500">
          <div>
            © {new Date().getFullYear()} Aperture Live. Modern collaborative event photo platform.
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/dashboard')} className="hover:text-white">
              Dashboard
            </button>
            <button onClick={() => navigate('/settings')} className="hover:text-white">
              Database SQL
            </button>
            <button onClick={handleDemo} className="hover:text-white">
              Demo Mode
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
