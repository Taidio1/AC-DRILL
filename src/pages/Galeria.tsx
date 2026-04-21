import { useState, useEffect } from 'react';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { Lightbox } from '@/components/gallery/Lightbox';
import { API, GalleryImage } from '@/lib/api';

export default function Galeria() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch(API.gallery)
      .then((r) => r.json())
      .then((data) => {
        setImages(data.images ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError('Nie udało się wczytać galerii.');
        setLoading(false);
      });
  }, []);

  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () => setLightboxIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
  const nextImage = () => setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : null));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-10 text-center px-4">
          <span className="inline-block bg-orange-50 text-primary border border-orange-200 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
            Portfolio
          </span>
          <h1 className="text-4xl font-extrabold text-foreground mb-3">
            Nasze <span className="text-primary">Realizacje</span>
          </h1>
          <div className="w-12 h-0.5 bg-primary rounded mx-auto mb-4" />
          <p className="text-muted-foreground text-base max-w-lg mx-auto leading-relaxed">
            Zdjęcia z wykonanych prac — wiercenia HDD, przeciski i inne roboty ziemne w terenie.
          </p>
        </section>

        {/* Galeria */}
        <section className="px-4 pb-20 max-w-6xl mx-auto">
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          )}
          {error && (
            <div className="text-center py-20 text-destructive">{error}</div>
          )}
          {!loading && !error && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Pokazuje <span className="text-primary font-semibold">{images.length}</span>{' '}
                {images.length === 1 ? 'zdjęcie' : 'zdjęć'}
              </p>
              <GalleryGrid images={images} onImageClick={setLightboxIndex} />
            </>
          )}
        </section>
      </main>
      <Footer />

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}
    </div>
  );
}
