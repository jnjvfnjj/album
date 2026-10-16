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

function getDataDir(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpData = path.join('/tmp', 'aperture_data');
    try {
      if (!fs.existsSync(tmpData)) fs.mkdirSync(tmpData, { recursive: true });
      return tmpData;
    } catch {
      // fallback
    }
  }
  const localData = path.join(__dirname, 'data');
  try {
    if (!fs.existsSync(localData)) fs.mkdirSync(localData, { recursive: true });
    return localData;
  } catch {
    const tmpData = path.join('/tmp', 'aperture_data');
    if (!fs.existsSync(tmpData)) fs.mkdirSync(tmpData, { recursive: true });
    return tmpData;
  }
}

const DATA_DIR = getDataDir();
const ALBUMS_FILE = path.join(DATA_DIR, 'albums.json');
const PHOTOS_FILE = path.join(DATA_DIR, 'photos.json');
const SEED_ALBUMS_FILE = path.join(__dirname, 'data', 'albums.json');
const SEED_PHOTOS_FILE = path.join(__dirname, 'data', 'photos.json');

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
    if (fs.existsSync(SEED_ALBUMS_FILE)) {
      const data = fs.readFileSync(SEED_ALBUMS_FILE, 'utf-8');
      try {
        fs.writeFileSync(ALBUMS_FILE, data, 'utf-8');
      } catch {
        // ignore
      }
      return JSON.parse(data);
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
    if (fs.existsSync(SEED_PHOTOS_FILE)) {
      const data = fs.readFileSync(SEED_PHOTOS_FILE, 'utf-8');
      try {
        fs.writeFileSync(PHOTOS_FILE, data, 'utf-8');
      } catch {
        // ignore
      }
      return JSON.parse(data);
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

// Get album by ID or Token
app.get('/api/albums/:id', (req, res) => {
  const param = req.params.id.trim().toLowerCase();
  const albums = loadAlbums();
  const album = albums.find(
    (a) =>
      a.id.toLowerCase() === param ||
      a.publicToken.toLowerCase() === param ||
      a.id.toLowerCase() === `album_${param}`
  );
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
  const param = req.params.id.trim().toLowerCase();
  const albums = loadAlbums();
  const index = albums.findIndex(
    (a) =>
      a.id.toLowerCase() === param ||
      a.publicToken.toLowerCase() === param ||
      a.id.toLowerCase() === `album_${param}`
  );
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
  const param = req.params.id.trim().toLowerCase();
  const albums = loadAlbums();
  const album = albums.find(
    (a) =>
      a.id.toLowerCase() === param ||
      a.publicToken.toLowerCase() === param ||
      a.id.toLowerCase() === `album_${param}`
  );
  if (!album) {
    return res.status(404).json({ error: 'Album not found' });
  }
  album.uploadsEnabled = !album.uploadsEnabled;
  saveAlbums(albums);
  res.json({ uploadsEnabled: album.uploadsEnabled });
});

// Delete album and its photos
app.delete('/api/albums/:id', (req, res) => {
  const param = req.params.id.trim().toLowerCase();
  const albums = loadAlbums();
  const album = albums.find(
    (a) =>
      a.id.toLowerCase() === param ||
      a.publicToken.toLowerCase() === param ||
      a.id.toLowerCase() === `album_${param}`
  );
  if (!album) {
    return res.status(404).json({ error: 'Album not found' });
  }
  const realId = album.id;
  const filteredAlbums = albums.filter((a) => a.id !== realId);
  saveAlbums(filteredAlbums);

  // Delete photos for this album
  const photos = loadPhotos();
  const filteredPhotos = photos.filter((p) => p.albumId !== realId && p.albumId !== album.publicToken);
  savePhotos(filteredPhotos);

  res.json({ success: true });
});

// Get photos for album (searches by real album ID, publicToken, and variations)
app.get('/api/albums/:id/photos', (req, res) => {
  const param = req.params.id.trim().toLowerCase();
  const albums = loadAlbums();
  const album = albums.find(
    (a) =>
      a.id.toLowerCase() === param ||
      a.publicToken.toLowerCase() === param ||
      a.id.toLowerCase() === `album_${param}`
  );

  const realId = album ? album.id : req.params.id;
  const token = album ? album.publicToken : param;

  const photos = loadPhotos();
  const albumPhotos = photos.filter(
    (p) =>
      p.albumId === realId ||
      p.albumId === token ||
      p.albumId.toLowerCase() === param ||
      p.albumId.toLowerCase() === `album_${token}`
  );
  // Newest first
  albumPhotos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(albumPhotos);
});

// Upload photo to album (CRITICAL: never fails due to token vs ID mismatch)
app.post('/api/albums/:id/photos', (req, res) => {
  const param = req.params.id.trim().toLowerCase();
  const albums = loadAlbums();
  let album = albums.find(
    (a) =>
      a.id.toLowerCase() === param ||
      a.publicToken.toLowerCase() === param ||
      a.id.toLowerCase() === `album_${param}`
  );

  // Auto-register album if missing from server's albums.json but metadata sent from QR URL
  if (!album) {
    if (req.body.albumTitle) {
      album = {
        id: req.body.albumId || (param.startsWith('album_') ? param : `album_${param}`),
        ownerId: 'user_demo_alex',
        title: req.body.albumTitle.trim(),
        description: req.body.albumDescription || undefined,
        coverUrl: req.body.albumCoverUrl || '',
        publicToken: req.body.publicToken || param,
        privacy: 'public',
        uploadsEnabled: true,
        createdAt: new Date().toISOString(),
        eventDate: req.body.eventDate || undefined,
        location: req.body.location || undefined,
      };
      albums.unshift(album);
      saveAlbums(albums);
    } else if (albums.length === 1) {
      // If only one album exists in the database, attach to it
      album = albums[0];
    } else {
      album = {
        id: param.startsWith('album_') ? param : `album_${param}`,
        ownerId: 'user_demo_alex',
        title: 'Event Album',
        coverUrl: '',
        publicToken: param,
        privacy: 'public',
        uploadsEnabled: true,
        createdAt: new Date().toISOString(),
      };
      albums.unshift(album);
      saveAlbums(albums);
    }
  }

  if (album && !album.uploadsEnabled) {
    return res.status(403).json({ error: 'Загрузка фотографий временно приостановлена организатором' });
  }

  const { storagePath, originalFilename, contributorName, fileSize, mimeType } = req.body;
  if (!storagePath) {
    return res.status(400).json({ error: 'Image data is required' });
  }

  const photos = loadPhotos();
  const newPhoto: Photo = {
    id: `photo_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    albumId: album ? album.id : req.params.id,
    storagePath,
    originalFilename: originalFilename || 'photo.jpg',
    contributorName: contributorName || 'Гость',
    fileSize: fileSize || Math.round((storagePath.length * 3) / 4),
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

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Server failed to start', err);
  });
}

export default app;
