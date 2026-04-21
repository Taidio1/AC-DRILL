export interface GalleryImage {
  filename: string;
  url: string;
  thumb: string;
  uploaded_at: string;
}

export interface GalleryStats {
  count: number;
  used_mb: number;
  total_gb: number;
}

export interface GalleryResponse {
  images: GalleryImage[];
  stats: GalleryStats;
}

export const API = {
  gallery:   '/api/gallery.php',
  authCheck: '/api/auth-check.php',
  login:     '/api/login.php',
  logout:    '/api/logout.php',
  upload:    '/api/upload.php',
  delete:    '/api/delete.php',
} as const;
