import { useEffect, useCallback } from 'react';
import { GalleryImage } from '@/lib/api';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxProps {
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function Lightbox({ images, currentIndex, onClose, onPrev, onNext }: LightboxProps) {
  const image = images[currentIndex];

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape')     onClose();
    if (e.key === 'ArrowLeft')  onPrev();
    if (e.key === 'ArrowRight') onNext();
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Przyciski nawigacji */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        aria-label="Poprzednie zdjęcie"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        aria-label="Następne zdjęcie"
      >
        <ChevronRight size={24} />
      </button>

      {/* Zamknij */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        aria-label="Zamknij"
      >
        <X size={20} />
      </button>

      {/* Zdjęcie */}
      <img
        src={image.url}
        alt={image.filename}
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Licznik */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}
