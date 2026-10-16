import React, { useState, useEffect, useMemo } from 'react';
import { Album, SortOption, StorageStats } from '../types';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { useI18n } from '../utils/i18n';
import { Navbar } from '../components/layout/Navbar';
import { MetricsStrip } from '../components/dashboard/MetricsStrip';
import { AlbumCard } from '../components/dashboard/AlbumCard';
import { CreateAlbumModal } from '../components/dashboard/CreateAlbumModal';
import { ShareModal } from '../components/dashboard/ShareModal';
import {
  Search,
  Plus,
  ArrowUpDown,
  Filter,
  Layers,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const { t } = useI18n();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [photoCounts, setPhotoCounts] = useState<Record<string, number>>({});
  const [stats, setStats] = useState<StorageStats>({
    usedBytes: 0,
    quotaBytes: 524288000,
    photoCount: 0,
    albumCount: 0,
    contributorCount: 0,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused'>('all');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [sharingAlbum, setSharingAlbum] = useState<Album | null>(null);
  const [deletingAlbum, setDeletingAlbum] = useState<Album | null>(null);

  const loadData = async () => {
    const list = await storageService.getAlbums(user?.id);
    setAlbums(list);

    // Fetch photo counts for each album
    const counts: Record<string, number> = {};
    for (const a of list) {
      const photos = await storageService.getPhotosForAlbum(a.id);
      counts[a.id] = photos.length;
    }
    setPhotoCounts(counts);

    // Storage stats
    setStats(storageService.getStats(user?.id));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 4000);
    return () => clearInterval(interval);
  }, [user]);

  // Filtering and sorting
  const filteredAlbums = useMemo(() => {
    let result = [...albums];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.description && a.description.toLowerCase().includes(q)) ||
          (a.location && a.location.toLowerCase().includes(q))
      );
    }

    // Filter by status
    if (filterStatus === 'active') {
      result = result.filter((a) => a.uploadsEnabled);
    } else if (filterStatus === 'paused') {
      result = result.filter((a) => !a.uploadsEnabled);
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === 'most-photos') {
      result.sort((a, b) => (photoCounts[b.id] || 0) - (photoCounts[a.id] || 0));
    }

    return result;
  }, [albums, searchQuery, filterStatus, sortBy, photoCounts]);

  const handleCreateAlbum = async (data: {
    title: string;
    description: string;
    coverUrl: string;
    privacy: 'public' | 'code_protected';
    accessCode?: string;
    location?: string;
    eventDate?: string;
  }) => {
    if (editingAlbum) {
      await storageService.updateAlbum(editingAlbum.id, data);
      setEditingAlbum(null);
    } else {
      const newAlbum = await storageService.createAlbum({
        ...data,
        ownerId: user?.id || 'demo_user',
        uploadsEnabled: true,
      });
      // Immediately open sharing modal for instant delight!
      setSharingAlbum(newAlbum);
    }
    await loadData();
  };

  const handleDeleteAlbum = async () => {
    if (!deletingAlbum) return;
    await storageService.deleteAlbum(deletingAlbum.id);
    setDeletingAlbum(null);
    await loadData();
  };

  const handleToggleUploads = async (albumId: string) => {
    await storageService.toggleUploads(albumId);
    await loadData();
  };

  const handleDownloadZip = async (albumId: string) => {
    await storageService.downloadAlbumZip(albumId);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-24">
      <Navbar onCreateAlbum={() => setCreateModalOpen(true)} />

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Row with title and Create Album CTA */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {t.dashboard}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-neutral-400">
              Manage your event albums, monitor crowdsourced photos, and distribute scannable QR codes.
            </p>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-neutral-100 px-4 py-2.5 text-xs font-bold text-neutral-950 transition-all hover:bg-white active:scale-95 shadow-md self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>{t.createAlbum}</span>
          </button>
        </div>

        {/* 4-Column KPI Metrics Strip */}
        <MetricsStrip stats={stats} />

        {/* Search, Filter & Sort Toolbar */}
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-3 sm:flex-row sm:items-center">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 py-2 pl-9 pr-4 text-xs text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
            />
          </div>

          {/* Interactive Filter Tabs (functional segmented controls per anti-slop guidelines) */}
          <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterStatus === 'all'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterStatus === 'active'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t.active}
            </button>
            <button
              onClick={() => setFilterStatus('paused')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterStatus === 'paused'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t.paused}
            </button>
          </div>

          {/* Sorting Dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs font-medium text-neutral-200 focus:border-neutral-500 focus:outline-none"
            >
              <option value="newest">{t.sortNewest}</option>
              <option value="oldest">{t.sortOldest}</option>
              <option value="name-asc">{t.sortNameAsc}</option>
              <option value="name-desc">{t.sortNameDesc}</option>
              <option value="most-photos">{t.sortMostPhotos}</option>
            </select>
          </div>
        </div>

        {/* Albums Grid */}
        {filteredAlbums.length === 0 ? (
          /* Useful Empty State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/30 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900 text-neutral-400">
              <Layers className="h-8 w-8 text-neutral-500" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">
              {searchQuery ? t.noAlbumsFound : t.noAlbumsYet}
            </h3>
            <p className="mt-1 max-w-sm text-xs text-neutral-400">
              {searchQuery
                ? 'Try adjusting your search query or status filter.'
                : t.noAlbumsDescription}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setCreateModalOpen(true)}
                className="mt-6 flex items-center gap-2 rounded-xl bg-neutral-100 px-5 py-2.5 text-xs font-bold text-neutral-950 transition-all hover:bg-white active:scale-95 shadow-md"
              >
                <Plus className="h-4 w-4" />
                <span>{t.createAlbum}</span>
              </button>
            )}
          </div>
        ) : (
          /* Populated Albums Grid */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAlbums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                photoCount={photoCounts[album.id] || 0}
                onShare={(a) => setSharingAlbum(a)}
                onEdit={(a) => {
                  setEditingAlbum(a);
                  setCreateModalOpen(true);
                }}
                onDelete={(a) => setDeletingAlbum(a)}
                onToggleUploads={handleToggleUploads}
                onDownloadZip={handleDownloadZip}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create / Edit Album Modal */}
      <CreateAlbumModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingAlbum(null);
        }}
        onSave={handleCreateAlbum}
        editingAlbum={editingAlbum}
      />

      {/* Share / QR Code Modal */}
      <ShareModal
        album={sharingAlbum}
        isOpen={sharingAlbum !== null}
        onClose={() => setSharingAlbum(null)}
      />

      {/* Delete Confirmation Modal */}
      {deletingAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setDeletingAlbum(null)}
            className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-bold text-white">Delete Album?</h3>
            </div>
            <p className="mt-3 text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">"{deletingAlbum.title}"</strong>?
              This will permanently delete the album, its unique QR link, and all collected photos from storage.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingAlbum(null)}
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
    </div>
  );
};
