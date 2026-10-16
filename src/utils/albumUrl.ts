import { Album } from '../types';
import { SAMPLE_COVERS } from './sampleImages';

/**
 * Generates a bulletproof, permanent QR/Guest URL that works across all devices,
 * even on static hosting like Vercel, Netlify, or Cloud Run without server latency.
 */
export function buildGuestUploadUrl(album: Album, baseUrl?: string): string {
  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  // Using root URL with query parameter '?upload=' is guaranteed to return 200 OK
  // on every web server, Vercel, Netlify, Cloud Run, CDN, or custom domain without any 404 errors forever.
  const url = new URL('/', origin || 'https://aperture.live');
  url.searchParams.set('upload', album.publicToken);
  url.searchParams.set('id', album.id);
  url.searchParams.set('t', album.title);
  if (album.description) url.searchParams.set('d', album.description);
  if (album.location) url.searchParams.set('l', album.location);
  if (album.eventDate) url.searchParams.set('dt', album.eventDate);
  if (album.privacy) url.searchParams.set('p', album.privacy);

  return url.toString();
}

export function buildPublicGalleryUrl(album: Album, baseUrl?: string): string {
  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const url = new URL('/', origin || 'https://aperture.live');
  url.searchParams.set('gallery', album.publicToken);
  url.searchParams.set('id', album.id);
  url.searchParams.set('t', album.title);
  if (album.location) url.searchParams.set('l', album.location);
  if (album.eventDate) url.searchParams.set('dt', album.eventDate);

  return url.toString();
}

/**
 * Reconstructs or enriches an album from URL query parameters if it's missing from local/server DB
 * (e.g. when a new phone scans a QR code for an album created on another computer).
 */
export function extractAlbumFromUrl(token: string): Album | null {
  if (typeof window === 'undefined') return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const title = params.get('t') || params.get('name') || params.get('title') || `Event (${token})`;
    const albumId = params.get('id') || `album_${token}`;
    const description = params.get('d') || params.get('desc') || undefined;
    const location = params.get('l') || params.get('loc') || undefined;
    const eventDate = params.get('dt') || params.get('date') || undefined;
    const privacy = (params.get('p') as 'public' | 'code_protected') || 'public';

    return {
      id: albumId,
      ownerId: 'external_guest',
      title: decodeURIComponent(title),
      description: description ? decodeURIComponent(description) : undefined,
      coverUrl: SAMPLE_COVERS.aiSummit,
      publicToken: token,
      privacy,
      uploadsEnabled: true,
      createdAt: new Date().toISOString(),
      location: location ? decodeURIComponent(location) : undefined,
      eventDate: eventDate || undefined,
    };
  } catch (err) {
    console.warn('Failed to parse album from URL', err);
    return null;
  }
}
