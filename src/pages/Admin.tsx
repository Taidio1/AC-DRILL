import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { UploadZone } from '@/components/admin/UploadZone';
import { PhotoGrid } from '@/components/admin/PhotoGrid';
import { Button } from '@/components/ui/button';
import { API, GalleryImage, GalleryStats } from '@/lib/api';
import logo from '@/img/acdrilllogo.png';

export default function Admin() {
  const navigate = useNavigate();
  const { loading: authLoading } = useAdminAuth();

  const [images, setImages]   = useState<GalleryImage[]>([]);
  const [stats, setStats]     = useState<GalleryStats | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    fetch(API.gallery, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        setImages(data.images ?? []);
        setStats(data.stats ?? null);
        setDataLoading(false);
      })
      .catch(() => setDataLoading(false));
  }, [authLoading]);

  async function handleLogout() {
    await fetch(API.logout, { method: 'POST', credentials: 'include' });
    navigate('/admin/login', { replace: true });
  }

  function handleUploaded(image: GalleryImage) {
    setImages((prev) => [image, ...prev]);
    setStats((prev) => prev
      ? { ...prev, count: prev.count + 1 }
      : null
    );
  }

  async function handleDelete(filename: string) {
    try {
      const res = await fetch(API.delete, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
      const data = await res.json();
      if (data.success) {
        setImages((prev) => prev.filter((img) => img.filename !== filename));
        setStats((prev) => prev
          ? { ...prev, count: Math.max(0, prev.count - 1) }
          : null
        );
      }
    } catch {
      // ignore — user might need to refresh
    }
  }

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Ładowanie...</div>
      </div>
    );
  }

  const usedPct = stats ? Math.min((stats.used_mb / (stats.total_gb * 1024)) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar */}
      <header className="bg-white border-b border-border px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="AC Drill" className="h-9 w-auto" />
          <span className="font-extrabold text-xl text-foreground">Drill</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Wyloguj
        </Button>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Nagłówek */}
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Panel galerii</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Zarządzaj zdjęciami wyświetlanymi na stronie /galeria
          </p>
        </div>

        {/* Statystyki */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Zdjęcia w galerii', value: stats.count, unit: 'szt.' },
              { label: 'Zajęte miejsce',    value: stats.used_mb.toFixed(1), unit: 'MB' },
              { label: 'Dostępne miejsce',  value: stats.total_gb, unit: 'GB' },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-border rounded-xl p-5 shadow-sm">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">{s.label}</p>
                <p className="text-3xl font-extrabold text-foreground">
                  {s.value}{' '}
                  <span className="text-sm font-normal text-muted-foreground">{s.unit}</span>
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Upload */}
        <UploadZone onUploaded={handleUploaded} />

        {/* Pasek miejsca */}
        {stats && (
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Zajęte miejsce na serwerze</span>
              <span>{stats.used_mb.toFixed(1)} MB / {stats.total_gb} GB</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${usedPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Siatka zdjęć */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-foreground">Zdjęcia w galerii</h2>
            <span className="bg-muted border border-border rounded-lg px-2.5 py-1 text-xs text-muted-foreground">
              {images.length} {images.length === 1 ? 'zdjęcie' : 'zdjęć'}
            </span>
          </div>
          <PhotoGrid images={images} onDelete={handleDelete} />
        </div>
      </main>
    </div>
  );
}
