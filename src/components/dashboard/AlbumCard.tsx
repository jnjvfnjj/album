import React, { useState } from 'react';
import { Album } from '../../types';
import { useRouter } from '../../context/RouterContext';
import { useI18n } from '../../utils/i18n';
import { safeFormatDate } from '../../utils/dateUtils';
import {
  QrCode,
  Download,
  MoreVertical,
  ExternalLink,
  Trash2,
  Edit,
  Pause,
  Play,
  Calendar,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';

interface AlbumCardProps {
  album: Album;
  photoCount: number;
  onShare: (album: Album) => void;
  onEdit: (album: Album) => void;
  onDelete: (album: Album) => void;
  onToggleUploads: (albumId: string) => void;
  onDownloadZip: (albumId: string) => void;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({
  album,
  photoCount,
  onShare,
  onEdit,
  onDelete,
  onToggleUploads,
  onDownloadZip,
}) => {
  const { navigate } = useRouter();
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDownloading(true);
      await onDownloadZip(album.id);
    } finally {
      setDownloading(false);
    }
  };

  const formattedDate = safeFormatDate(album.eventDate, { month: 'short', day: 'numeric', year: 'numeric' })
    || safeFormatDate(album.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })
    || 'Активен';

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 transition-all duration-200 hover:border-neutral-700 hover:shadow-lg">
      {/* Top Cover Image Area */}
      <div
        onClick={() => navigate(`/albums/${album.id}`)}
        className="relative h-48 w-full cursor-pointer overflow-hidden bg-neutral-950"
      >
        {album.coverUrl ? (
          <img
            src={album.coverUrl}
            alt={album.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-neutral-900" />
        )}
        {/* Scrim overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

        {/* Top Badges (Functional status) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                album.uploadsEnabled ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span className="text-white text-[11px] font-semibold tracking-wide drop-shadow">
              {album.uploadsEnabled ? t.active : t.paused}
            </span>
            <span className="text-neutral-400 text-xs">·</span>
            <span className="text-neutral-300 text-[11px] capitalize drop-shadow">
              {album.privacy === 'public' ? t.public : t.protected}
            </span>
          </div>

          {/* Quick Menu Button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900/80 text-neutral-300 backdrop-blur-sm transition-colors hover:bg-neutral-800 hover:text-white"
              title="Album Options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-8 z-30 w-44 rounded-lg border border-neutral-800 bg-neutral-900 py-1 text-xs shadow-2xl"
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onShare(album);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-neutral-300 hover:bg-neutral-800 hover:text-white"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>{t.shareAlbum}</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(`/gallery/${album.publicToken}`);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-neutral-300 hover:bg-neutral-800 hover:text-white"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>{t.viewGallery}</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(album);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-neutral-300 hover:bg-neutral-800 hover:text-white"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>{t.editAlbum}</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onToggleUploads(album.id);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-neutral-300 hover:bg-neutral-800 hover:text-white"
                >
                  {album.uploadsEnabled ? (
                    <>
                      <Pause className="h-3.5 w-3.5 text-amber-400" />
                      <span>{t.pauseUploads}</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{t.resumeUploads}</span>
                    </>
                  )}
                </button>
                <div className="border-t border-neutral-800 my-1" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(album);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-400 hover:bg-neutral-800"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{t.deleteAlbum}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Floating Photo Count in bottom-left of image */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-neutral-200">
          <ImageIcon className="h-3.5 w-3.5 text-neutral-400" />
          <span className="font-mono font-medium tabular-nums text-white">{photoCount}</span>
          <span className="text-neutral-400">{t.photosCount}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          {/* Metadata line without pills */}
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-neutral-500" />
              <span>{formattedDate}</span>
            </span>
            {album.location && (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 truncate max-w-[140px]">
                  <MapPin className="h-3 w-3 text-neutral-500" />
                  <span className="truncate">{album.location}</span>
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h3
            onClick={() => navigate(`/albums/${album.id}`)}
            className="mt-2 text-base font-semibold text-white line-clamp-1 cursor-pointer hover:text-neutral-200"
          >
            {album.title}
          </h3>

          {/* Description */}
          {album.description && (
            <p className="mt-1 text-xs text-neutral-400 line-clamp-2">
              {album.description}
            </p>
          )}
        </div>

        {/* Card Action Row */}
        <div className="mt-4 flex items-center justify-between border-t border-neutral-800/80 pt-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onShare(album)}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-800/60 px-2.5 py-1.5 text-xs font-medium text-neutral-200 transition-colors hover:border-neutral-700 hover:bg-neutral-800 hover:text-white"
              title="View QR Code and Share Links"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>{t.shareAlbum}</span>
            </button>

            <button
              onClick={() => navigate(`/gallery/${album.publicToken}`)}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-800/60 px-2.5 py-1.5 text-xs font-medium text-neutral-200 transition-colors hover:border-neutral-700 hover:bg-neutral-800 hover:text-white"
              title="Open Public Viewing Gallery"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.viewGallery}</span>
            </button>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading || photoCount === 0}
            className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
              photoCount === 0
                ? 'cursor-not-allowed text-neutral-600'
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
            }`}
            title="Download all photos as ZIP archive"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">{downloading ? 'Zipping...' : 'ZIP'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
