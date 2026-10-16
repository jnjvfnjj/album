import React, { useState, useEffect, useRef } from 'react';
import { Album, UploadItem } from '../types';
import { storageService } from '../services/storageService';
import { extractAlbumFromUrl } from '../utils/albumUrl';
import { useRouter } from '../context/RouterContext';
import { useI18n } from '../utils/i18n';
import {
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  PauseCircle,
  ShieldCheck,
  Plus,
  ArrowLeft,
  ImageIcon,
  Sparkles
} from 'lucide-react';

interface GuestUploadViewProps {
  token: string;
}

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB

export const GuestUploadView: React.FC<GuestUploadViewProps> = ({ token }) => {
  const { navigate } = useRouter();
  const { t } = useI18n();

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [contributorName, setContributorName] = useState('');
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<{ previewUrl: string; filename: string }[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    storageService.getAlbumByToken(token).then((found) => {
      if (!isMounted) return;
      if (found) {
        setAlbum(found);
      } else {
        const fromUrl = extractAlbumFromUrl(token);
        setAlbum(fromUrl || null);
      }
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [token]);

  // Handle files selected from camera or gallery
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage('');

    const newItems: UploadItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Relaxed mobile validation: accepts standard MIME types, empty types from iOS cameras, or image extensions
      const isImage =
        !file.type ||
        file.type.startsWith('image/') ||
        /\.(jpe?g|png|webp|heic|heif|gif|bmp)$/i.test(file.name);

      if (!isImage) {
        setErrorMessage('Пожалуйста, выберите файл изображения (JPG, PNG, HEIC, WEBP).');
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage(`Файл "${file.name}" превышает допустимый размер 30 МБ.`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      newItems.push({
        id: `upload_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
        file,
        previewUrl,
        contributorName: contributorName || 'Гость',
        progress: 0,
        status: 'pending',
        size: file.size,
        filename: file.name || `photo_${Date.now()}.jpg`,
      });
    }

    if (newItems.length > 0) {
      setQueue((prev) => [...prev, ...newItems]);
      setUploadSuccess(false);
    }
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

    const completedThumbnails: { previewUrl: string; filename: string }[] = [];

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];

      // Update item progress
      setQueue((prev) =>
        prev.map((q, idx) => (idx === i ? { ...q, status: 'uploading', progress: 40 } : q))
      );

      try {
        setQueue((prev) =>
          prev.map((q, idx) => (idx === i ? { ...q, progress: 80 } : q))
        );

        // Upload to server with automatic client-side compression and metadata forwarding
        await storageService.uploadPhoto(
          album.id,
          item.file,
          contributorName || 'Гость',
          {
            title: album.title,
            publicToken: album.publicToken,
            description: album.description,
          }
        );

        setQueue((prev) =>
          prev.map((q, idx) => (idx === i ? { ...q, status: 'completed', progress: 100 } : q))
        );

        completedThumbnails.push({
          previewUrl: item.previewUrl,
          filename: item.filename,
        });
      } catch (err: unknown) {
        console.error('Upload error', err);
        const errorMsg = err instanceof Error ? err.message : 'Ошибка при загрузке фото';
        setQueue((prev) =>
          prev.map((q, idx) =>
            idx === i ? { ...q, status: 'error', errorMessage: errorMsg } : q
          )
        );
      }
    }

    setIsUploading(false);

    if (completedThumbnails.length > 0) {
      setUploadedPhotos(completedThumbnails);
      setUploadSuccess(true);
      setQueue([]);
    }
  };

  const handleResetForMore = () => {
    setUploadSuccess(false);
    setUploadedPhotos([]);
    setQueue([]);
    setErrorMessage('');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-white" />
          <span className="text-xs">Загрузка альбома...</span>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 p-4">
        <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-neutral-500" />
          <h2 className="mt-4 text-lg font-bold text-white">Альбом не найден</h2>
          <p className="mt-2 text-xs text-neutral-400">
            Возможно, ссылка устарела или QR-код недействителен.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 inline-flex rounded-lg bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-950 hover:bg-white"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-16">
      {/* Hidden file inputs for direct camera and gallery triggers */}
      <input
        id="guest-camera-input"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
        className="hidden"
      />
      <input
        id="guest-gallery-input"
        type="file"
        accept="image/*,.heic,.heif,.jpg,.jpeg,.png,.webp"
        multiple
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
        className="hidden"
      />

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
        <div className="relative h-44 sm:h-52 w-full overflow-hidden">
          {album.coverUrl ? (
            <img
              src={album.coverUrl}
              alt={album.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent" />
        </div>

        <div className="mx-auto max-w-2xl px-4 sm:px-6 -mt-16 relative z-10 pb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <Camera className="h-3.5 w-3.5" />
            <span>Гостевая загрузка фото</span>
            <span aria-hidden="true">·</span>
            <span className="text-neutral-400 font-normal">Только отправка</span>
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
              <span>🗓️ {new Date(album.eventDate).toLocaleDateString('ru-RU')}</span>
            )}
            <span className="flex items-center gap-1 text-neutral-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Без регистрации · Прямая отправка в альбом</span>
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
              Прием фотографий приостановлен
            </h3>
            <p className="mt-2 text-xs text-neutral-400">
              Организатор мероприятия временно приостановил прием новых фотографий.
            </p>
          </div>
        ) : uploadSuccess ? (
          /* SUCCESS SCREEN: Specifically requested confirmation */
          <div className="rounded-2xl border border-emerald-900/50 bg-neutral-900 p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="h-10 w-10 animate-pulse" />
            </div>

            <h3 className="mt-4 text-xl sm:text-2xl font-bold text-white">
              Фотография успешно отправлена!
            </h3>

            <p className="mt-2 text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
              Спасибо за участие! Ваш снимок передан в альбом <span className="font-semibold text-white">«{album.title}»</span>.
            </p>

            <p className="mt-1 text-xs text-emerald-400/90 font-medium">
              ✓ Организатор уже получил фото и видит его на сайте.
            </p>

            {/* Thumbnails of what was sent */}
            {uploadedPhotos.length > 0 && (
              <div className="mt-6 border-t border-neutral-800 pt-5">
                <div className="text-xs text-neutral-400 mb-3 font-medium">
                  Отправлено фотографий: {uploadedPhotos.length}
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {uploadedPhotos.map((photo, i) => (
                    <div
                      key={i}
                      className="relative h-24 w-24 overflow-hidden rounded-xl border border-emerald-500/40 shadow-md group"
                    >
                      <img
                        src={photo.previewUrl}
                        alt={photo.filename}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute bottom-1 right-1 rounded-full bg-emerald-500 p-1 text-neutral-950 shadow">
                        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResetForMore}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-xs font-bold text-neutral-950 transition-all hover:bg-neutral-100 active:scale-95 shadow-lg"
              >
                <Plus className="h-4 w-4" />
                <span>Загрузить ещё фото</span>
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center text-xs text-neutral-400">
              <span className="text-neutral-300 font-medium">Гостевой режим:</span> вы можете только отправлять фото. Просмотр альбома и удаление снимков доступны только организатору на сайте.
            </div>
          </div>
        ) : (
          /* Upload Form */
          <div className="space-y-6">
            {/* Contributor Name Field */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Ваше имя (необязательно)
              </label>
              <input
                type="text"
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
                placeholder="Например: Анна или Анонимный гость"
                className="mt-1.5 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-neutral-400">
                Организатор увидит, кто загрузил снимок.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="rounded-xl border border-red-800/60 bg-red-950/40 p-3.5 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Mobile-Friendly Upload Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Native Camera Trigger */}
              <label
                htmlFor="guest-camera-input"
                className="flex items-center justify-center gap-2.5 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 hover:border-neutral-600 px-4 py-3.5 text-xs font-bold text-white cursor-pointer transition-all active:scale-95 shadow-sm"
              >
                <Camera className="h-4 w-4 text-emerald-400" />
                <span>Сделать фото на камеру</span>
              </label>

              {/* Native Gallery Trigger */}
              <label
                htmlFor="guest-gallery-input"
                className="flex items-center justify-center gap-2.5 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 hover:border-neutral-600 px-4 py-3.5 text-xs font-bold text-white cursor-pointer transition-all active:scale-95 shadow-sm"
              >
                <ImageIcon className="h-4 w-4 text-sky-400" />
                <span>Выбрать из галереи</span>
              </label>
            </div>

            {/* Drag and drop upload zone (also clickable) */}
            <label
              htmlFor="guest-gallery-input"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`block cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                isDragging
                  ? 'border-sky-400 bg-sky-950/20'
                  : 'border-neutral-700 bg-neutral-900/60 hover:border-neutral-600 hover:bg-neutral-900'
              }`}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-700 bg-neutral-950 text-neutral-300 shadow-inner">
                <UploadCloud className="h-7 w-7 text-neutral-400" />
              </div>

              <h4 className="mt-4 text-sm font-bold text-white sm:text-base">
                Нажмите для выбора фото или перетащите сюда
              </h4>
              <p className="mt-1 text-xs text-neutral-400">
                Поддерживаются JPG, PNG, HEIC с телефона (до 30 МБ)
              </p>
            </label>

            {/* Preview of pending files */}
            {queue.length > 0 && (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <span className="text-xs font-bold text-white">
                    Выбрано фото для отправки ({queue.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setQueue([])}
                    disabled={isUploading}
                    className="text-xs text-neutral-400 hover:text-white"
                  >
                    Очистить
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
                            e.preventDefault();
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
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950/80 p-2">
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
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-xs font-bold text-neutral-950 transition-all hover:bg-neutral-100 active:scale-95 shadow-md disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent" />
                        <span>Сжатие и отправка фото в альбом...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-4 w-4" />
                        <span>
                          Отправить фото в альбом ({queue.length})
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Role Notice */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-3.5 text-center text-xs text-neutral-400">
              <span className="text-neutral-300 font-medium">Гостевой доступ:</span> только загрузка фото. Просмотр всех снимков и управление альбомом доступны только организаторам через сайт.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
