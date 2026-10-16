import React, { useEffect, useCallback } from 'react';
import { Photo } from '../../types';
import { storageService } from '../../services/storageService';
import { safeFormatDate } from '../../utils/dateUtils';
import { X, ChevronLeft, ChevronRight, Download, User, Calendar } from 'lucide-react';

interface LightboxProps {
  photos: Photo[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}) => {
  const currentPhoto = photos[currentIndex];

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    } else {
      onNavigate(photos.length - 1);
    }
  }, [currentIndex, photos.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      onNavigate(currentIndex + 1);
    } else {
      onNavigate(0);
    }
  }, [currentIndex, photos.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !currentPhoto) return null;

  const handleDownload = () => {
    storageService.downloadSinglePhoto(currentPhoto);
  };

  const formattedDate = safeFormatDate(currentPhoto.createdAt, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/95 backdrop-blur-md">
      {/* Top Bar with counter, contributor and actions */}
      <div className="absolute top-0 left-0 right-0 z-10 flex h-16 items-center justify-between px-6 bg-gradient-to-b from-neutral-950/80 to-transparent">
        <div className="flex items-center gap-4 text-xs text-neutral-300">
          <span className="font-mono tabular-nums text-white font-semibold">
            {currentIndex + 1} / {photos.length}
          </span>
          <span className="text-neutral-500">·</span>
          <span className="flex items-center gap-1.5 text-neutral-300">
            <User className="h-3.5 w-3.5 text-neutral-400" />
            <span className="font-medium text-white">{currentPhoto.contributorName}</span>
          </span>
          <span className="hidden sm:inline text-neutral-500">·</span>
          <span className="hidden sm:flex items-center gap-1.5 text-neutral-400">
            <Calendar className="h-3.5 w-3.5 text-neutral-500" />
            <span>{formattedDate}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900/90 px-3 py-1.5 text-xs font-medium text-neutral-200 transition-colors hover:bg-neutral-800 hover:text-white"
            title="Download this photo"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900/90 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
            title="Close Lightbox (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Navigation: Previous Arrow */}
      {photos.length > 1 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/80 text-white shadow-lg transition-all hover:bg-neutral-800 hover:scale-105"
          title="Previous Photo (Left Arrow)"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Main Image Frame */}
      <div className="relative flex h-full max-h-[85vh] w-full max-w-5xl items-center justify-center p-4">
        {currentPhoto.storagePath ? (
          <img
            src={currentPhoto.storagePath}
            alt={currentPhoto.originalFilename}
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl transition-opacity duration-200 select-none"
          />
        ) : (
          <div className="flex h-64 w-64 items-center justify-center rounded-lg bg-neutral-900 text-neutral-500">
            No image available
          </div>
        )}
      </div>

      {/* Navigation: Next Arrow */}
      {photos.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/80 text-white shadow-lg transition-all hover:bg-neutral-800 hover:scale-105"
          title="Next Photo (Right Arrow)"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Bottom caption footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-neutral-400">
        <span className="font-mono text-[11px] text-neutral-400">{currentPhoto.originalFilename}</span>
      </div>
    </div>
  );
};
