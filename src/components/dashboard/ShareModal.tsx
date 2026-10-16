import React, { useState, useEffect } from 'react';
import { Album } from '../../types';
import { generateQrDataUrl, downloadBrandedQrSign } from '../../utils/qrCode';
import { buildGuestUploadUrl, buildPublicGalleryUrl } from '../../utils/albumUrl';
import { useI18n } from '../../utils/i18n';
import { useRouter } from '../../context/RouterContext';
import {
  X,
  Copy,
  Check,
  Download,
  Printer,
  Share2,
  ExternalLink,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';

interface ShareModalProps {
  album: Album | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ album, isOpen, onClose }) => {
  const { t } = useI18n();
  const { navigate } = useRouter();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedType, setCopiedType] = useState<'upload' | 'gallery' | null>(null);
  const [activeTab, setActiveTab] = useState<'qr' | 'preview'>('qr');
  const [isGenerating, setIsGenerating] = useState(false);

  const guestUploadUrl = album ? buildGuestUploadUrl(album) : '';
  const publicGalleryUrl = album ? buildPublicGalleryUrl(album) : '';

  useEffect(() => {
    if (album && isOpen) {
      setIsGenerating(true);
      generateQrDataUrl(guestUploadUrl, 500)
        .then((url) => {
          setQrDataUrl(url);
          setIsGenerating(false);
        })
        .catch(() => setIsGenerating(false));
    }
  }, [album, isOpen, guestUploadUrl]);

  if (!isOpen || !album) return null;

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

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: album.title,
          text: `Upload your photos to "${album.title}" on Aperture Live:`,
          url: guestUploadUrl,
        });
      } catch {
        // User dismissed share
      }
    } else {
      copyToClipboard(guestUploadUrl, 'upload');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-neutral-300" />
            <div>
              <h2 className="text-base font-bold text-white">{album.title}</h2>
              <p className="text-xs text-neutral-400">{t.shareSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* View Switcher: QR & Links vs Mobile Guest Simulator */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60 px-6 pt-2">
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'qr'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>QR Code & Links</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'preview'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>{t.previewGuestView}</span>
          </button>
        </div>

        {activeTab === 'qr' ? (
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* QR Code Presentation Column */}
              <div className="flex flex-col items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950 p-5 text-center">
                <span className="text-xs font-medium text-neutral-400">
                  {t.qrCodeSubtitle}
                </span>

                {/* Scannable QR Frame */}
                <div className="my-4 relative flex h-52 w-52 items-center justify-center rounded-xl bg-white p-3 shadow-md">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`QR Code for ${album.title}`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-400 border-t-neutral-950" />
                  )}
                </div>

                <div className="flex w-full flex-col gap-2">
                  <button
                    onClick={handleDownloadQrPng}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 py-2 text-xs font-semibold text-neutral-200 transition-colors hover:bg-neutral-800 hover:text-white"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{t.downloadQrPng}</span>
                  </button>

                  <button
                    onClick={handlePrintSignage}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-neutral-100 py-2 text-xs font-bold text-neutral-950 transition-all hover:bg-white active:scale-95 shadow-sm"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>{t.printStandee}</span>
                  </button>
                </div>
              </div>

              {/* Links and sharing actions column */}
              <div className="flex flex-col justify-between space-y-4">
                {/* Guest Upload Link Box */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">
                      QR-код и ссылка для гостей (только загрузка)
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium">
                      Без регистрации
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={guestUploadUrl}
                      className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 font-mono text-xs text-neutral-300 focus:outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(guestUploadUrl, 'upload')}
                      className="flex shrink-0 items-center gap-1 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-700"
                    >
                      {copiedType === 'upload' ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Скопировано</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Копировать</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-neutral-400 leading-relaxed">
                    Гости сканируют QR-код и <strong>могут только загружать свои фото</strong>. Они не могут просматривать чужие снимки или удалять что-либо.
                  </p>
                </div>

                {/* Organizer Info Box */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">
                      Управление через сайт (Организаторы)
                    </span>
                    <span className="text-[10px] text-sky-400 font-medium">
                      Полный доступ
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-neutral-400 leading-relaxed">
                    Через панель сайта вы можете просматривать все собранные фотографии, скачивать их по отдельности или все сразу архивом ZIP, а также удалять любые снимки.
                  </p>
                </div>

                {/* Native Device Share */}
                <button
                  onClick={handleNativeShare}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-neutral-950 py-2.5 text-xs font-semibold text-neutral-200 transition-colors hover:border-neutral-600 hover:bg-neutral-800 hover:text-white"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Поделиться ссылкой для гостей</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Mobile Preview Frame */
          <div className="flex flex-col items-center justify-center p-6 bg-neutral-950">
            <div className="w-full max-w-sm rounded-[32px] border-4 border-neutral-800 bg-neutral-950 p-4 shadow-2xl">
              <div className="mx-auto mb-4 h-4 w-28 rounded-full bg-neutral-800" />
              <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                <div className="relative h-28 w-full bg-neutral-800">
                  {album.coverUrl ? (
                    <img
                      src={album.coverUrl}
                      alt={album.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-neutral-950/60" />
                  <div className="absolute bottom-2 left-3 right-3">
                    <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider">
                      Event Photo Upload
                    </span>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{album.title}</h4>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-[11px] text-neutral-400 line-clamp-2">
                    {album.description || 'Welcome! Drop your best photos from today.'}
                  </p>
                  <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-950 p-4 text-center">
                    <Smartphone className="mx-auto h-6 w-6 text-neutral-400" />
                    <p className="mt-2 text-xs font-bold text-white">Tap to Choose Photos</p>
                    <p className="text-[10px] text-neutral-500">Instant camera capture or gallery</p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-500">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      <span>Zero sign-up required</span>
                    </span>
                    <span>JPEG, PNG, WEBP</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/upload/${album.publicToken}`);
                  }}
                  className="text-xs font-semibold text-sky-400 hover:underline"
                >
                  Open Live Guest Page &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-800 px-6 py-3 text-xs text-neutral-500">
          <span>Unique Public Token: <span className="font-mono text-neutral-400">{album.publicToken}</span></span>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-neutral-400 hover:text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
