import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// High limit for photo uploads (up to 50MB per batch)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure permanent data storage directory exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const ALBUMS_FILE = path.join(DATA_DIR, 'albums.json');
const PHOTOS_FILE = path.join(DATA_DIR, 'photos.json');

interface Album {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  coverUrl: string;
  publicToken: string;
  privacy: 'public' | 'code_protected';
  accessCode?: string;
  uploadsEnabled: boolean;
  createdAt: string;
  eventDate?: string;
  location?: string;
}

interface Photo {
  id: string;
  albumId: string;
  storagePath: string;
  originalFilename: string;
  contributorName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

function loadAlbums(): Album[] {
  try {
    if (fs.existsSync(ALBUMS_FILE)) {
      return JSON.parse(fs.readFileSync(ALBUMS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading albums file', err);
  }
  return [];
}

function saveAlbums(albums: Album[]) {
  try {
    fs.writeFileSync(ALBUMS_FILE, JSON.stringify(albums, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving albums file', err);
  }
}

function loadPhotos(): Photo[] {
  try {
    if (fs.existsSync(PHOTOS_FILE)) {
      return JSON.parse(fs.readFileSync(PHOTOS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading photos file', err);
  }
  return [];
}

function savePhotos(photos: Photo[]) {
  try {
    fs.writeFileSync(PHOTOS_FILE, JSON.stringify(photos, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving photos file', err);
  }
}

// ==========================================
// API ROUTES
// ==========================================

// Get all albums
app.get('/api/albums', (req, res) => {
  const albums = loadAlbums();
  res.json(albums);
});

// Get single album by public token (CRITICAL for QR codes from any device!)
app.get('/api/albums/by-token/:token', (req, res) => {
  const token = req.params.token.trim().toLowerCase();
  const albums = loadAlbums();
  const album = albums.find((a) => a.publicToken.toLowerCase() === token);
  if (!album) {
    return res.status(404).json({ error: 'Album not found' });
  }
  res.json(album);
});

// Get album by ID
app.get('/api/albums/:id', (req, res) => {
  const albums = loadAlbums();
  const album = albums.find((a) => a.id === req.params.id);
  if (!album) {
    return res.status(404).json({ error: 'Album not found' });
  }
  res.json(album);
});

// Create new album
app.post('/api/albums', (req, res) => {
  const { title, description, coverUrl, publicToken, privacy, accessCode, uploadsEnabled, location, eventDate, ownerId } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const albums = loadAlbums();
  const newAlbum: Album = {
    id: `album_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    ownerId: ownerId || 'user_demo_alex',
    title: title.trim(),
    description: description ? description.trim() : undefined,
    coverUrl: coverUrl || '',
    publicToken: (publicToken || Math.random().toString(36).substring(2, 12)).toLowerCase(),
    privacy: privacy || 'public',
    accessCode: accessCode ? accessCode.trim() : undefined,
    uploadsEnabled: uploadsEnabled !== false,
    createdAt: new Date().toISOString(),
    eventDate: eventDate || undefined,
    location: location ? location.trim() : undefined,
  };

  albums.unshift(newAlbum);
  saveAlbums(albums);
  res.status(201).json(newAlbum);
});

// Update album
app.put('/api/albums/:id', (req, res) => {
  const albums = loadAlbums();
  const index = albums.findIndex((a) => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Album not found' });
  }

  albums[index] = {
    ...albums[index],
    ...req.body,
    id: albums[index].id, // protect ID
  };

  saveAlbums(albums);
  res.json(albums[index]);
});

// Toggle uploads for album
app.post('/api/albums/:id/toggle-uploads', (req, res) => {
  const albums = loadAlbums();
  const album = albums.find((a) => a.id === req.params.id);
  if (!album) {
    return res.status(404).json({ error: 'Album not found' });
  }
  album.uploadsEnabled = !album.uploadsEnabled;
  saveAlbums(albums);
  res.json({ uploadsEnabled: album.uploadsEnabled });
});

// Delete album and its photos
app.delete('/api/albums/:id', (req, res) => {
  const albums = loadAlbums();
  const filteredAlbums = albums.filter((a) => a.id !== req.params.id);
  if (filteredAlbums.length === albums.length) {
    return res.status(404).json({ error: 'Album not found' });
  }
  saveAlbums(filteredAlbums);

  // Delete photos for this album
  const photos = loadPhotos();
  const filteredPhotos = photos.filter((p) => p.albumId !== req.params.id);
  savePhotos(filteredPhotos);

  res.json({ success: true });
});

// Get photos for album
app.get('/api/albums/:id/photos', (req, res) => {
  const photos = loadPhotos();
  const albumPhotos = photos.filter((p) => p.albumId === req.params.id);
  // Newest first
  albumPhotos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(albumPhotos);
});

// Upload photo to album
app.post('/api/albums/:id/photos', (req, res) => {
  const albumId = req.params.id;
  const albums = loadAlbums();
  const album = albums.find((a) => a.id === albumId);
  if (!album) {
    return res.status(404).json({ error: 'Album not found' });
  }

  if (!album.uploadsEnabled) {
    return res.status(403).json({ error: 'Uploads are currently paused for this album' });
  }

  const { storagePath, originalFilename, contributorName, fileSize, mimeType } = req.body;
  if (!storagePath) {
    return res.status(400).json({ error: 'Image data is required' });
  }

  const photos = loadPhotos();
  const newPhoto: Photo = {
    id: `photo_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    albumId,
    storagePath,
    originalFilename: originalFilename || 'photo.jpg',
    contributorName: contributorName || 'Guest',
    fileSize: fileSize || 1500000,
    mimeType: mimeType || 'image/jpeg',
    createdAt: new Date().toISOString(),
  };

  photos.unshift(newPhoto);
  savePhotos(photos);
  res.status(201).json(newPhoto);
});

// Delete photo
app.delete('/api/photos/:id', (req, res) => {
  const photos = loadPhotos();
  const filtered = photos.filter((p) => p.id !== req.params.id);
  savePhotos(filtered);
  res.json({ success: true });
});

// Reset / wipe all data (clean slate)
app.post('/api/reset', (req, res) => {
  saveAlbums([]);
  savePhotos([]);
  res.json({ success: true });
});

// ==========================================
// VITE SPA & STATIC SERVING
// ==========================================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Development mode with Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start', err);
});
