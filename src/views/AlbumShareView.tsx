import React, { useState, useEffect } from 'react';
import { Album } from '../types';
import { storageService } from '../services/storageService';
import { useRouter } from '../context/RouterContext';
import { Navbar } from '../components/layout/Navbar';
import { generateQrDataUrl, downloadBrandedQrSign } from '../utils/qrCode';
import { buildGuestUploadUrl, buildPublicGalleryUrl } from '../utils/albumUrl';
import { useI18n } from '../utils/i18n';
import {
  ArrowLeft,
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  ShieldCheck,
  Share2
} from 'lucide-react';

interface AlbumShareViewProps {
  id: string;
}

export const AlbumShareView: React.FC<AlbumShareViewProps> = ({ id }) => {
  const { navigate } = useRouter();
  const { t } = useI18n();

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedType, setCopiedType] = useState<'upload' | 'gallery' | null>(null);

  useEffect(() => {
    let isMounted = true;
    storageService.getAlbumById(id).then((a) => {
      if (!isMounted) return;
      if (a) {
        setAlbum(a);
        const uploadUrl = buildGuestUploadUrl(a);
        generateQrDataUrl(uploadUrl, 600).then((url) => {
          if (isMounted) setQrDataUrl(url);
        });
      } else {
        setAlbum(null);
      }
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-white" />
          <span className="text-xs">Loading sharing controls...</span>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <Navbar />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <h2 className="text-lg font-bold text-white">Album Not Found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 rounded-lg bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-950 hover:bg-white"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const guestUploadUrl = album ? buildGuestUploadUrl(album) : '';
  const publicGalleryUrl = album ? buildPublicGalleryUrl(album) : '';

  const copyToClipboard = async (text: string, type: 'upload' | 'gallery') => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  const handleDownloadQrPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${album.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_QR.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrintSignage = () => {
    downloadBrandedQrSign(album.title, album.location, guestUploadUrl);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-20">
      <Navbar />

      {/* Breadcrumb */}
      <div className="border-b border-neutral-800 bg-neutral-900/40">
        <div className="mx-auto flex h-12 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => (window.history.length > 1 ? window.history.back() : navigate(`/albums/${album.id}`))}
            className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors"
            title="Назад на предыдущую страницу"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Назад</span>
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Album Distribution & Sharing
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {album.title}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-neutral-400">
            {t.shareSubtitle}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: QR Code & Print Actions (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Scannable Event QR Code
            </span>
            <p className="mt-1 text-xs text-neutral-400">
              Unique to this album: points directly to guest upload
            </p>

            <div className="my-6 flex h-64 w-64 items-center justify-center rounded-2xl bg-white p-4 shadow-xl">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={album.title}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent" />
              )}
            </div>

            {/* 24h+ Validity Guarantee Badge */}
            <div className="mb-4 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-800/60 bg-emerald-950/40 px-3 py-2 text-xs font-semibold text-emerald-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Срок действия QR: бессрочно (более 24 часов) · Активен всегда</span>
            </div>

            <div className="flex w-full flex-col gap-2.5">
              <button
                onClick={handlePrintSignage}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-100 py-2.5 text-xs font-bold text-neutral-950 hover:bg-white active:scale-95 transition-all shadow-md"
              >
                <Printer className="h-4 w-4" />
                <span>{t.printStandee}</span>
              </button>

              <button
                onClick={handleDownloadQrPng}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-950 py-2.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>{t.downloadQrPng}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Links & Guest Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Guest Upload Link Box */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  {t.guestUploadLink}
                </span>
                <span className="text-xs text-emerald-400 font-medium">
                  Zero Sign-up Required
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-400">
                Attendees scan this QR or click this link to instantly drop photos from their phone browser.
              </p>

              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={guestUploadUrl}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 font-mono text-xs text-neutral-200 focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(guestUploadUrl, 'upload')}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-neutral-800 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-700 transition-colors"
                >
                  {copiedType === 'upload' ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-3">
                <button
                  onClick={() => navigate(`/upload/${album.publicToken}`)}
                  className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Open guest upload page in test tab</span>
                </button>
              </div>
            </div>

            {/* Organizer Notice Box */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Управление альбомом (для вас / организаторов)
                </span>
                <span className="text-xs text-sky-400 font-medium">
                  Полный доступ
                </span>
              </div>
              <p className="mt-2 text-xs text-neutral-300 leading-relaxed">
                Гости, сканирующие QR-код, попадают на страницу <strong>только для загрузки</strong>. Они не могут просматривать чужие фото или удалять снимки.
              </p>
              <p className="mt-1.5 text-xs text-neutral-400 leading-relaxed">
                Только те, у кого есть доступ через сайт (вы), могут просматривать все фото, скачивать их по отдельности или архивом ZIP, и удалять любые фотографии.
              </p>

              <div className="mt-4">
                <button
                  onClick={() => navigate(`/albums/${album.id}`)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-neutral-700 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Перейти к просмотру и управлению фото в альбоме</span>
                </button>
              </div>
            </div>

            {/* Tips for Table Standees & Posters */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Event Organizer Best Practices
              </h4>
              <ul className="mt-2 space-y-2 text-xs text-neutral-400">
                <li className="flex items-start gap-2">
                  <span className="text-neutral-500 font-mono">01.</span>
                  <span>Print the QR signage using the button above and place it on registration desks, dinner tables, or keynote slides.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neutral-500 font-mono">02.</span>
                  <span>Remind attendees that no app installation or account signup is required — phone cameras scan directly to the upload page.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neutral-500 font-mono">03.</span>
                  <span>You can pause uploads anytime from the album management tab once the event concludes.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
