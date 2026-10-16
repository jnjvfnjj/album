import React, { useState, useEffect, useCallback } from 'react';
import { Album, Photo } from '../types';
import { storageService } from '../services/storageService';
import { useRouter } from '../context/RouterContext';
import { useI18n } from '../utils/i18n';
import { safeFormatDate } from '../utils/dateUtils';
import { Lightbox } from '../components/gallery/Lightbox';
import {
  Download,
  Upload,
  RefreshCw,
  QrCode,
  Image as ImageIcon,
  User,
  ExternalLink,
  Share2,
  ArrowLeft
} from 'lucide-react';

interface PublicGalleryViewProps {
  token: string;
}

export const PublicGalleryView: React.FC<PublicGalleryViewProps> = ({ token }) => {
  const { navigate } = useRouter();
  const { t } = useI18n();

  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zipping, setZipping] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const foundAlbum = await storageService.getAlbumByToken(token);
    if (foundAlbum) {
      setAlbum(foundAlbum);
      const list = await storageService.getPhotosForAlbum(foundAlbum.id);
      setPhotos(list);
    } else {
      setAlbum(null);
    }

    setLoading(false);
    setRefreshing(false);
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDownloadAllZip = async () => {
    if (!album || photos.length === 0 || zipping) return;
    try {
      setZipping(true);
      await storageService.downloadAlbumZip(album.id);
    } catch (err) {
      console.warn('ZIP download failed', err);
    } finally {
      setZipping(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-white" />
          <span className="text-xs">Loading event gallery...</span>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 p-4">
        <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-8 text-center">
          <h2 className="text-lg font-bold text-white">Gallery Not Found</h2>
          <p className="mt-2 text-xs text-neutral-400">
            The link you followed may be invalid or the album has been removed.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 rounded-lg bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-950 hover:bg-white"
          >
            Go to Aperture Live
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-20">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Zone 1: Back button to previous page & Brand title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => (window.history.length > 1 ? window.history.back() : navigate('/dashboard'))}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
              title="Назад на предыдущую страницу"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Назад</span>
            </button>
            <div
              onClick={() => navigate('/dashboard')}
              className="hidden sm:flex cursor-pointer items-center gap-2 text-sm font-bold text-white hover:opacity-80"
            >
              <span>Aperture Live</span>
              <span className="text-xs text-neutral-500">/ Gallery</span>
            </div>
          </div>

          {/* Zone 2 & 3: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
              title="Refresh photo feed"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{t.liveRefresh}</span>
            </button>

            <button
              onClick={handleDownloadAllZip}
              disabled={photos.length === 0 || zipping}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors disabled:opacity-40"
              title="Download all photos as a ZIP archive"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{zipping ? 'Compressing...' : t.downloadZip}</span>
            </button>

            {album.uploadsEnabled && (
              <button
                onClick={() => navigate(`/upload/${album.publicToken}`)}
                className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3.5 py-1.5 text-xs font-bold text-neutral-950 hover:bg-white active:scale-95 transition-all shadow-sm"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>{t.uploadPhotosAction}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Album Header Banner */}
      <div className="relative border-b border-neutral-800 bg-neutral-900/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span>{album.location || 'Live Event'}</span>
                {safeFormatDate(album.eventDate) && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{safeFormatDate(album.eventDate)}</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span className="font-mono text-neutral-300 tabular-nums font-semibold">
                  {photos.length} {t.photosCount}
                </span>
              </div>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {album.title}
              </h1>

              {album.description && (
                <p className="mt-1 max-w-2xl text-xs sm:text-sm text-neutral-400">
                  {album.description}
                </p>
              )}
            </div>

            {/* Quick Upload QR / Link helper */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/upload/${album.publicToken}`)}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-800 hover:text-white"
              >
                <QrCode className="h-3.5 w-3.5 text-neutral-400" />
                <span>Guest Upload Page</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {photos.length === 0 ? (
          /* Empty Gallery State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/30 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-700 bg-neutral-900 text-neutral-400">
              <ImageIcon className="h-8 w-8 text-neutral-500" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">
              {t.emptyGalleryTitle}
            </h3>
            <p className="mt-1 max-w-sm text-xs text-neutral-400">
              {t.emptyGalleryMessage}
            </p>
            {album.uploadsEnabled && (
              <button
                onClick={() => navigate(`/upload/${album.publicToken}`)}
                className="mt-6 flex items-center gap-2 rounded-xl bg-neutral-100 px-5 py-2.5 text-xs font-bold text-neutral-950 hover:bg-white active:scale-95 transition-all shadow-md"
              >
                <Upload className="h-4 w-4" />
                <span>Upload First Photo</span>
              </button>
            )}
          </div>
        ) : (
          /* Masonry/Grid of photos */
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => setLightboxIndex(index)}
                className="group relative h-60 sm:h-72 cursor-pointer overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 transition-all duration-200 hover:border-neutral-600 hover:shadow-xl"
              >
                {photo.storagePath ? (
                  <img
                    src={photo.storagePath}
                    alt={photo.originalFilename}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-neutral-900" />
                )}

                {/* Scrim Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

                {/* Bottom Contributor & Date Badge */}
                <div className="absolute bottom-0 inset-x-0 p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <div className="flex items-center justify-between text-xs text-white">
                    <span className="flex items-center gap-1 truncate font-medium">
                      <User className="h-3 w-3 text-neutral-400" />
                      <span className="truncate">{photo.contributorName}</span>
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

      {/* Lightbox Component */}
      <Lightbox
        photos={photos}
        currentIndex={lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(newIdx) => setLightboxIndex(newIdx)}
      />
    </div>
  );
};
