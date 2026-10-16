export type PrivacyType = 'public' | 'code_protected';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface Album {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  coverUrl: string;
  publicToken: string;
  accessCode?: string; // Optional passcode if code_protected
  privacy: PrivacyType;
  uploadsEnabled: boolean;
  createdAt: string;
  eventDate?: string;
  location?: string;
  maxPhotosLimit?: number;
  tags?: string[];
}

export interface Photo {
  id: string;
  albumId: string;
  storagePath: string; // Data URL or storage path
  originalFilename: string;
  contributorName: string;
  fileSize: number; // in bytes
  mimeType: string;
  width?: number;
  height?: number;
  createdAt: string;
  isFavorite?: boolean;
}

export interface StorageStats {
  usedBytes: number;
  quotaBytes: number;
  photoCount: number;
  albumCount: number;
  contributorCount: number;
}

export interface UploadItem {
  id: string;
  file: File;
  previewUrl: string;
  contributorName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
  size: number;
  filename: string;
}

export type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'most-photos';
