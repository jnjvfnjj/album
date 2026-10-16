import React, { useState, useEffect, useRef } from 'react';
import { Album, Photo } from '../types';
import { storageService } from '../services/storageService';
import { useRouter } from '../context/RouterContext';
import { useI18n } from '../utils/i18n';
import { safeFormatDate } from '../utils/dateUtils';
import { Navbar } from '../components/layout/Navbar';
import { ShareModal } from '../components/dashboard/ShareModal';
import { CreateAlbumModal } from '../components/dashboard/CreateAlbumModal';
import { Lightbox } from '../components/gallery/Lightbox';
import {
  ArrowLeft,
  QrCode,
  Download,
  Upload,
  Edit,
  Trash2,
  Pause,
  Play,
  ExternalLink,
  Image as ImageIcon,
  Calendar,
  MapPin,
  Lock,
  Globe,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface AlbumDetailViewProps {
  id: string;
}

export const AlbumDetailView: React.FC<AlbumDetailViewProps> = ({ id }) => {
  const { navigate } = useRouter();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const loadData = async () => {
    const a = await storageService.getAlbumById(id);
    if (a) {
      setAlbum(a);
      const list = await storageService.getPhotosForAlbum(a.id);
      setPhotos(list);
    } else {
      setAlbum(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // Auto-poll every 3 seconds for live guest uploads
    const interval = setInterval(async () => {
      if (id) {
        try {
          const list = await storageService.getPhotosForAlbum(id);
          setPhotos(list);
        } catch {
          // ignore
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleToggleUploads = async () => {
    if (!album) return;
    const newState = await storageService.toggleUploads(album.id);
    setAlbum({ ...album, uploadsEnabled: newState });
  };

  const handleDeleteAlbum = async () => {
    if (!album) return;
    await storageService.deleteAlbum(album.id);
    navigate('/dashboard');
  };

  const handleDeletePhoto = async (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Удалить эту фотографию из альбома?')) return;
    await storageService.deletePhoto(photoId);
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleOwnerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !album) return;

    setIsUploading(true);
    for (let i = 0; i < files.length; i++) {
      try {
        await storageService.uploadPhoto(album.id, files[i], 'Организатор', {
          title: album.title,
          publicToken: album.publicToken,
        });
      } catch (err) {
        console.warn('Upload error', err);
      }
    }
    await loadData();
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadZip = async () => {
    if (!album || photos.length === 0 || isZipping) return;
    try {
      setIsZipping(true);
      await storageService.downloadAlbumZip(album.id);
    } finally {
      setIsZipping(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-white" />
          <span className="text-xs">Loading album management...</span>
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
          <p className="mt-2 text-xs text-neutral-400">
            This album does not exist or has been deleted.
          </p>
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

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-20">
      <Navbar />

      {/* Breadcrumb & Navigation */}
      <div className="border-b border-neutral-800 bg-neutral-900/40">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => (window.history.length > 1 ? window.history.back() : navigate('/dashboard'))}
            className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors"
            title="Назад на предыдущую страницу"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Назад</span>
          </button>

          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                album.uploadsEnabled ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span className="text-xs font-medium text-neutral-300">
              {album.uploadsEnabled ? t.active : t.paused}
            </span>
          </div>
        </div>
      </div>

      {/* Album Hero Header */}
      <div className="relative border-b border-neutral-800 bg-neutral-900/70">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            {/* Left: Album Cover & Info */}
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-md">
                {album.coverUrl ? (
                  <img
                    src={album.coverUrl}
                    alt={album.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="flex items-center gap-1">
                    {album.privacy === 'public' ? (
                      <Globe className="h-3.5 w-3.5 text-neutral-500" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-neutral-500" />
                    )}
                    <span className="capitalize">{album.privacy}</span>
                  </span>
                  {album.location && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-neutral-500" />
                        <span>{album.location}</span>
                      </span>
                    </>
                  )}
                  {safeFormatDate(album.eventDate) && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-neutral-500" />
                        <span>{safeFormatDate(album.eventDate)}</span>
                      </span>
                    </>
                  )}
                </div>

                <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {album.title}
                </h1>

                {album.description && (
                  <p className="mt-1 max-w-xl text-xs sm:text-sm text-neutral-400">
                    {album.description}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-3 text-xs text-neutral-400">
                  <span>
                    Photos: <strong className="font-mono text-white tabular-nums">{photos.length}</strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Token: <span className="font-mono text-neutral-300">{album.publicToken}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions Cluster */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Share & QR Code */}
              <button
                onClick={() => setIsShareOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3.5 py-2 text-xs font-bold text-neutral-950 hover:bg-white active:scale-95 transition-all shadow-sm"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>{t.shareAlbum}</span>
              </button>

              {/* View Public Gallery */}
              <button
                onClick={() => navigate(`/gallery/${album.publicToken}`)}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>{t.viewGallery}</span>
              </button>

              {/* Pause/Resume Uploads */}
              <button
                onClick={handleToggleUploads}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors"
                title={album.uploadsEnabled ? 'Pause guest photo submissions' : 'Resume guest submissions'}
              >
                {album.uploadsEnabled ? (
                  <>
                    <Pause className="h-3.5 w-3.5 text-amber-400" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Resume</span>
                  </>
                )}
              </button>

              {/* Edit Details */}
              <button
                onClick={() => setIsEditOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit</span>
              </button>

              {/* Delete Album */}
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-950/40 hover:border-red-900 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Photos Grid & Controls */}
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-800 pb-4 gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-white">Фотографии альбома</h2>
            <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 font-mono text-xs text-neutral-300 font-semibold tabular-nums">
              {photos.length}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Автосинхронизация</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Manual Refresh */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
              title="Обновить список фото"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
              <span>Обновить</span>
            </button>

            {/* Download ZIP */}
            <button
              onClick={handleDownloadZip}
              disabled={photos.length === 0 || isZipping}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors disabled:opacity-50"
              title="Скачать все фотографии одним архивом"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isZipping ? 'Сборка архива...' : 'Скачать все разом (ZIP)'}</span>
            </button>

            {/* Direct Upload button with overlay file input */}
            <div className="relative overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5">
              <input
                type="file"
                multiple
                accept="image/*,.heic,.heif,.jpg,.jpeg,.png,.webp"
                onChange={handleOwnerFileUpload}
                disabled={isUploading}
                className="absolute inset-0 h-full w-full opacity-0 cursor-pointer z-10"
                aria-label="Добавить фото"
              />
              <Upload className="h-3.5 w-3.5" />
              <span>{isUploading ? 'Загрузка...' : 'Добавить фото'}</span>
            </div>
          </div>
        </div>

        {/* Photos Grid */}
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/30 py-16 text-center mt-6">
            <ImageIcon className="h-10 w-10 text-neutral-600" />
            <h4 className="mt-3 text-sm font-bold text-white">В этом альбоме пока нет фотографий</h4>
            <p className="mt-1 text-xs text-neutral-400 max-w-md mx-auto">
              Отсканируйте QR-код на телефоне или отправьте ссылку гостям, чтобы собрать фотографии события.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setIsShareOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-white"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>Показать QR-код</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Загрузить фото</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhotoIndex(index)}
                className="group relative h-56 cursor-pointer overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 transition-all duration-200 hover:border-neutral-600"
              >
                {photo.storagePath ? (
                  <img
                    src={photo.storagePath}
                    alt={photo.originalFilename}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-neutral-800" />
                )}

                <div className="absolute inset-0 bg-neutral-950/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex flex-col justify-between p-3">
                  <div className="flex items-center justify-between text-xs text-neutral-200">
                    <span className="truncate max-w-[120px] font-medium">
                      {photo.contributorName}
                    </span>
                    <button
                      onClick={(e) => handleDeletePhoto(photo.id, e)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-950/80 text-red-400 hover:bg-red-900 hover:text-white transition-colors"
                      title="Delete photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span className="font-mono">
                      {safeFormatDate(photo.createdAt)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        storageService.downloadSinglePhoto(photo);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900/90 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                      title="Download photo"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Share Modal */}
      <ShareModal
        album={album}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      {/* Edit Modal */}
      <CreateAlbumModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        editingAlbum={album}
        onSave={async (data) => {
          const updated = await storageService.updateAlbum(album.id, data);
          if (updated) setAlbum(updated);
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setDeleteConfirmOpen(false)}
            className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-bold text-white">Delete Album?</h3>
            </div>
            <p className="mt-3 text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">"{album.title}"</strong>?
              This action will permanently delete the album and all associated photos.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="rounded-lg px-4 py-2 text-xs font-medium text-neutral-400 hover:bg-neutral-800 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAlbum}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 transition-colors"
              >
                Delete Album & Photos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        photos={photos}
        currentIndex={selectedPhotoIndex ?? 0}
        isOpen={selectedPhotoIndex !== null}
        onClose={() => setSelectedPhotoIndex(null)}
        onNavigate={(newIdx) => setSelectedPhotoIndex(newIdx)}
      />
    </div>
  );
};
