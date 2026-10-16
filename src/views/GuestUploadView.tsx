import React, { useState, useEffect, useRef } from 'react';
import { Album, UploadItem } from '../types';
import { storageService } from '../services/storageService';
import { useRouter } from '../context/RouterContext';
import { useI18n } from '../utils/i18n';
import {
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  PauseCircle,
  ShieldCheck,
  Plus,
  ArrowLeft
} from 'lucide-react';

interface GuestUploadViewProps {
  token: string;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export const GuestUploadView: React.FC<GuestUploadViewProps> = ({ token }) => {
  const { navigate } = useRouter();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [contributorName, setContributorName] = useState('');
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    storageService.getAlbumByToken(token).then((found) => {
      if (!isMounted) return;
      setAlbum(found || null);
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [token]);

  // Handle files selected
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage('');

    const newItems: UploadItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate type
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp|heic)$/i)) {
        setErrorMessage('Only JPG, JPEG, PNG, and WEBP image files are allowed.');
        continue;
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage(`File "${file.name}" exceeds the 20MB limit.`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      newItems.push({
        id: `upload_${Date.now()}_${i}`,
        file,
        previewUrl,
        contributorName: contributorName || 'Guest',
        progress: 0,
        status: 'pending',
        size: file.size,
        filename: file.name,
      });
    }

    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeQueueItem = (id: string) => {
    setQueue((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  // Upload Batch
  const startUpload = async () => {
    if (!album || queue.length === 0 || isUploading) return;
    setIsUploading(true);
    setErrorMessage('');

    let successCount = 0;

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];

      // Update item to uploading
      setQueue((prev) =>
        prev.map((q, idx) => (idx === i ? { ...q, status: 'uploading', progress: 30 } : q))
      );

      try {
        // Small delay for fluid UI feedback
        await new Promise((r) => setTimeout(r, 150));

        setQueue((prev) =>
          prev.map((q, idx) => (idx === i ? { ...q, progress: 75 } : q))
        );

        await storageService.uploadPhoto(album.id, item.file, contributorName || 'Guest');

        setQueue((prev) =>
          prev.map((q, idx) => (idx === i ? { ...q, status: 'completed', progress: 100 } : q))
        );
        successCount++;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Upload failed';
        setQueue((prev) =>
          prev.map((q, idx) =>
            idx === i ? { ...q, status: 'error', errorMessage: errorMsg } : q
          )
        );
      }
    }

    setIsUploading(false);
    setUploadedCount(successCount);
    if (successCount > 0) {
      setUploadSuccess(true);
    }
  };

  const handleResetForMore = () => {
    // Revoke all preview URLs
    queue.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setQueue([]);
    setUploadSuccess(false);
    setUploadedCount(0);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-white" />
          <span className="text-xs">Loading event album...</span>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 p-4">
        <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-neutral-500" />
          <h2 className="mt-4 text-lg font-bold text-white">Album Not Found</h2>
          <p className="mt-2 text-xs text-neutral-400">
            This photo album link may have expired or the token is incorrect.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 inline-flex rounded-lg bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-950 hover:bg-white"
          >
            Go to Aperture Live
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-16">
      {/* Top Navigation Bar with Back Button */}
      <div className="border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <button
            onClick={() => (window.history.length > 1 ? window.history.back() : navigate('/dashboard'))}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
            title="Назад на предыдущую страницу"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Назад</span>
          </button>
          <div
            onClick={() => navigate('/dashboard')}
            className="cursor-pointer text-xs font-bold text-white hover:opacity-80"
          >
            Aperture Live
          </div>
        </div>
      </div>

      {/* Top Banner / Event Header */}
      <div className="relative border-b border-neutral-800 bg-neutral-900">
        <div className="relative h-44 sm:h-56 w-full overflow-hidden">
          {album.coverUrl ? (
            <img
              src={album.coverUrl}
              alt={album.title}
              className="h-full w-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
        </div>

        <div className="mx-auto max-w-2xl px-4 sm:px-6 -mt-16 relative z-10 pb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider">
            <Camera className="h-3.5 w-3.5" />
            <span>Event Photo Upload</span>
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {album.title}
          </h1>

          {album.description && (
            <p className="mt-2 text-xs sm:text-sm text-neutral-400 leading-relaxed">
              {album.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
            {album.location && (
              <span>📍 {album.location}</span>
            )}
            {album.eventDate && (
              <span>🗓️ {new Date(album.eventDate).toLocaleDateString()}</span>
            )}
            <span className="flex items-center gap-1 text-neutral-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Zero-install · No account needed</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-2xl px-4 sm:px-6 pt-6">
        {/* Paused Notice */}
        {!album.uploadsEnabled ? (
          <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-8 text-center">
            <PauseCircle className="mx-auto h-12 w-12 text-amber-400" />
            <h3 className="mt-4 text-base font-bold text-white">
              {t.uploadsPausedTitle}
            </h3>
            <p className="mt-2 text-xs text-neutral-400">
              {t.uploadsPausedMessage}
            </p>
            <button
              onClick={() => navigate(`/gallery/${album.publicToken}`)}
              className="mt-6 inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>{t.viewEventGalleryBtn}</span>
            </button>
          </div>
        ) : uploadSuccess ? (
          /* Success Screen */
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 text-center shadow-xl">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
            <h3 className="mt-4 text-xl font-bold text-white">
              {t.uploadSuccessTitle}
            </h3>
            <p className="mt-2 text-xs text-neutral-400">
              {uploadedCount} photo{uploadedCount > 1 ? 's' : ''} added to the live gallery.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => navigate(`/gallery/${album.publicToken}`)}
                className="flex items-center justify-center gap-2 rounded-xl bg-neutral-100 px-5 py-3 text-xs font-bold text-neutral-950 transition-all hover:bg-white active:scale-95 shadow-md"
              >
                <ExternalLink className="h-4 w-4" />
                <span>{t.viewEventGalleryBtn}</span>
              </button>

              <button
                onClick={handleResetForMore}
                className="flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-950 px-5 py-3 text-xs font-semibold text-neutral-200 transition-colors hover:bg-neutral-800 hover:text-white"
              >
                <Plus className="h-4 w-4" />
                <span>{t.uploadMore}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Upload Form */
          <div className="space-y-6">
            {/* Contributor Name Field */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                {t.contributorNameLabel}
              </label>
              <input
                type="text"
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
                placeholder={t.contributorNamePlaceholder}
                className="mt-1.5 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-neutral-400">
                This name will be displayed alongside your photos in the live gallery.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="rounded-xl border border-red-800/60 bg-red-950/40 p-3.5 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Drag and drop upload zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                isDragging
                  ? 'border-sky-400 bg-sky-950/20'
                  : 'border-neutral-700 bg-neutral-900/60 hover:border-neutral-600 hover:bg-neutral-900'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-700 bg-neutral-950 text-neutral-300 shadow-inner">
                <UploadCloud className="h-7 w-7 text-neutral-400" />
              </div>

              <h4 className="mt-4 text-sm font-bold text-white sm:text-base">
                {t.dropPhotosHere}
              </h4>
              <p className="mt-1 text-xs text-neutral-400">
                {t.uploadLimitNotice}
              </p>

              {/* Mobile CTA */}
              <div className="mt-5 sm:hidden">
                <button
                  type="button"
                  className="w-full rounded-xl bg-neutral-100 py-3 text-xs font-bold text-neutral-950 shadow-md active:scale-95"
                >
                  {t.mobilePickerBtn}
                </button>
              </div>
            </div>

            {/* Preview of pending files */}
            {queue.length > 0 && (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <span className="text-xs font-bold text-white">
                    Selected Photos ({queue.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setQueue([])}
                    disabled={isUploading}
                    className="text-xs text-neutral-400 hover:text-white"
                  >
                    Clear All
                  </button>
                </div>

                {/* Thumbnails grid */}
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {queue.map((item) => (
                    <div
                      key={item.id}
                      className="group relative h-28 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950"
                    >
                      {item.previewUrl ? (
                        <img
                          src={item.previewUrl}
                          alt={item.filename}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-neutral-900" />
                      )}

                      {/* Remove item button */}
                      {!isUploading && item.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeQueueItem(item.id);
                          }}
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-950/80 text-neutral-400 backdrop-blur-sm transition-colors hover:text-white"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Status / Progress overlay */}
                      {item.status === 'uploading' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950/70 p-2">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span className="mt-1 font-mono text-[10px] text-white">
                            {item.progress}%
                          </span>
                        </div>
                      )}

                      {item.status === 'completed' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-emerald-950/80">
                          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                        </div>
                      )}

                      <div className="absolute bottom-0 inset-x-0 bg-neutral-950/80 px-1.5 py-0.5 text-[10px] text-neutral-300 truncate font-mono">
                        {item.filename}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit Batch Button */}
                <div className="mt-4 pt-3 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={startUpload}
                    disabled={isUploading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-100 py-3 text-xs font-bold text-neutral-950 transition-all hover:bg-white active:scale-95 shadow-md disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent" />
                        <span>{t.uploadingBatch}</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-4 w-4" />
                        <span>
                          {t.uploadSelectedPhotos} ({queue.length})
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Link to view public gallery */}
            <div className="text-center pt-2">
              <button
                onClick={() => navigate(`/gallery/${album.publicToken}`)}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>View current photos in live gallery &rarr;</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
