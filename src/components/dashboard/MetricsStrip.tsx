import React from 'react';
import { StorageStats } from '../../types';
import { useI18n } from '../../utils/i18n';
import { Layers, Image, Users, HardDrive } from 'lucide-react';

interface MetricsStripProps {
  stats: StorageStats;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export const MetricsStrip: React.FC<MetricsStripProps> = ({ stats }) => {
  const { t } = useI18n();

  const metrics = [
    {
      label: t.totalAlbums,
      value: stats.albumCount.toString(),
      icon: Layers,
      subtext: 'Organized events',
    },
    {
      label: t.photosCollected,
      value: stats.photoCount.toString(),
      icon: Image,
      subtext: 'Crowdsourced moments',
    },
    {
      label: t.contributors,
      value: stats.contributorCount.toString(),
      icon: Users,
      subtext: 'Unique guests uploaded',
    },
    {
      label: t.storageUsed,
      value: formatBytes(stats.usedBytes),
      icon: HardDrive,
      subtext: `of ${formatBytes(stats.quotaBytes)} quota`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m, i) => {
        const Icon = m.icon;
        return (
          <div
            key={i}
            className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 transition-all hover:border-neutral-700"
          >
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                {m.label}
              </span>
              <Icon className="h-4 w-4 text-neutral-500" />
            </div>
            <div className="mt-3">
              <div className="font-mono text-2xl font-bold tracking-tight text-white tabular-nums">
                {m.value}
              </div>
              <p className="mt-1 text-xs text-neutral-500">{m.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
