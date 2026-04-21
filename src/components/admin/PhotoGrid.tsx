import { GalleryImage } from '@/lib/api';
import { Trash2 } from 'lucide-react';

interface PhotoGridProps {
  images: GalleryImage[];
  onDelete: (filename: string) => void;
}

export function PhotoGrid({ images, onDelete }: PhotoGridProps) {
  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        Brak zdjęć. Wgraj pierwsze zdjęcie powyżej.
      </div>
    );
  }

  function handleDelete(filename: string) {
    if (window.confirm(`Usunąć zdjęcie "${filename}"? Tej operacji nie można cofnąć.`)) {
      onDelete(filename);
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {images.map((image) => (
        <div key={image.filename} className="rounded-xl overflow-hidden border border-border bg-white shadow-sm">
          <div className="relative aspect-[4/3]">
            <img
              src={image.thumb}
              alt={image.filename}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <button
              onClick={() => handleDelete(image.filename)}
              className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-destructive/90 hover:bg-destructive text-white flex items-center justify-center transition-colors"
              aria-label="Usuń zdjęcie"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="px-3 py-2">
            <p className="text-xs text-foreground truncate">{image.filename}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {new Date(image.uploaded_at).toLocaleDateString('pl-PL')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
