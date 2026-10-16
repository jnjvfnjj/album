import React, { useState, useEffect } from 'react';
import { Album } from '../../types';
import { SAMPLE_COVERS } from '../../utils/sampleImages';
import { useI18n } from '../../utils/i18n';
import { X, Upload, Sparkles, Lock, Globe, Check } from 'lucide-react';

interface CreateAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (albumData: {
    title: string;
    description: string;
    coverUrl: string;
    privacy: 'public' | 'code_protected';
    accessCode?: string;
    location?: string;
    eventDate?: string;
  }) => void;
  editingAlbum?: Album | null;
}

const COVER_OPTIONS = [
  { label: 'Conference Stage', url: SAMPLE_COVERS.aiSummit },
  { label: 'Executive Retreat', url: SAMPLE_COVERS.foundersRetreat },
  { label: 'Builders Hackathon', url: SAMPLE_COVERS.hackathon },
  { label: 'Studio Showcase', url: SAMPLE_COVERS.designSprint },
];

export const CreateAlbumModal: React.FC<CreateAlbumModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAlbum,
}) => {
  const { t } = useI18n();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState(SAMPLE_COVERS.aiSummit);
  const [privacy, setPrivacy] = useState<'public' | 'code_protected'>('public');
  const [accessCode, setAccessCode] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [customCoverUploading, setCustomCoverUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingAlbum) {
      setTitle(editingAlbum.title);
      setDescription(editingAlbum.description || '');
      setCoverUrl(editingAlbum.coverUrl);
      setPrivacy(editingAlbum.privacy);
      setAccessCode(editingAlbum.accessCode || '');
      setLocation(editingAlbum.location || '');
      setEventDate(editingAlbum.eventDate || '');
    } else {
      setTitle('');
      setDescription('');
      setCoverUrl(SAMPLE_COVERS.aiSummit);
      setPrivacy('public');
      setAccessCode('');
      setLocation('');
      setEventDate(new Date().toISOString().slice(0, 10));
    }
    setError('');
  }, [editingAlbum, isOpen]);

  if (!isOpen) return null;

  const handleCustomCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    setCustomCoverUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setCoverUrl(reader.result as string);
      setCustomCoverUploading(false);
    };
    reader.onerror = () => {
      setError('Failed to read image file');
      setCustomCoverUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Album title is required');
      return;
    }

    if (privacy === 'code_protected' && !accessCode.trim()) {
      setError('Please specify an access passcode for code-protected albums');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      coverUrl,
      privacy,
      accessCode: accessCode.trim() || undefined,
      location: location.trim() || undefined,
      eventDate: eventDate || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-white">
              {editingAlbum ? t.updateAlbum : t.newAlbumTitle}
            </h2>
            <p className="text-xs text-neutral-400">
              Each album generates an independent link and QR code for guest uploads.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="rounded-lg border border-red-800/60 bg-red-950/40 px-3.5 py-2.5 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              {t.albumTitleLabel} *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.albumTitlePlaceholder}
              className="mt-1.5 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              {t.albumDescLabel}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.albumDescPlaceholder}
              className="mt-1.5 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
          </div>

          {/* Date & Venue split row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                {t.eventDateLabel}
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-sm text-white focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                {t.locationLabel}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t.locationPlaceholder}
                className="mt-1.5 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
              />
            </div>
          </div>

          {/* Cover Selection */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                {t.coverImageLabel}
              </label>
              <label className="flex cursor-pointer items-center gap-1 text-xs text-sky-400 hover:text-sky-300">
                <Upload className="h-3 w-3" />
                <span>Upload Custom</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomCoverFile}
                  className="hidden"
                />
              </label>
            </div>

            {/* Presets grid */}
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {COVER_OPTIONS.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => setCoverUrl(opt.url)}
                  className={`group relative h-20 cursor-pointer overflow-hidden rounded-lg border text-left transition-all ${
                    coverUrl === opt.url
                      ? 'border-neutral-200 ring-2 ring-neutral-400'
                      : 'border-neutral-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  {opt.url ? (
                    <img
                      src={opt.url}
                      alt={opt.label}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-neutral-950/40" />
                  <span className="absolute bottom-1 left-1 right-1 truncate text-[10px] font-medium text-white drop-shadow">
                    {opt.label}
                  </span>
                  {coverUrl === opt.url && (
                    <div className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-neutral-950">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Choice */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              {t.privacyLabel}
            </label>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div
                onClick={() => setPrivacy('public')}
                className={`cursor-pointer rounded-xl border p-3 transition-colors ${
                  privacy === 'public'
                    ? 'border-neutral-400 bg-neutral-800/70'
                    : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-neutral-200" />
                  <span className="text-xs font-bold text-white">{t.public}</span>
                </div>
                <p className="mt-1 text-[11px] text-neutral-400">
                  {t.privacyPublicDesc}
                </p>
              </div>

              <div
                onClick={() => setPrivacy('code_protected')}
                className={`cursor-pointer rounded-xl border p-3 transition-colors ${
                  privacy === 'code_protected'
                    ? 'border-neutral-400 bg-neutral-800/70'
                    : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-neutral-200" />
                  <span className="text-xs font-bold text-white">{t.protected}</span>
                </div>
                <p className="mt-1 text-[11px] text-neutral-400">
                  {t.privacyCodeDesc}
                </p>
              </div>
            </div>

            {privacy === 'code_protected' && (
              <div className="mt-3">
                <label className="block text-xs text-neutral-400">
                  {t.accessCodeLabel}
                </label>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder={t.accessCodePlaceholder}
                  className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:border-neutral-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-neutral-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-neutral-400 hover:bg-neutral-800 hover:text-white"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={customCoverUploading}
              className="rounded-lg bg-neutral-100 px-5 py-2 text-xs font-bold text-neutral-950 hover:bg-white active:scale-95 transition-all"
            >
              {editingAlbum ? t.updateAlbum : t.saveAlbum}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
