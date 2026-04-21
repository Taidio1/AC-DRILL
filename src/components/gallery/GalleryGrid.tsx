import { GalleryImage } from '@/lib/api';

interface GalleryGridProps {
  images: GalleryImage[];
  onImageClick: (index: number) => void;
}

export function GalleryGrid({ images, onImageClick }: GalleryGridProps) {
  if (images.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Brak zdjęć w galerii.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {images.map((image, index) => (
        <button
          key={image.filename}
          onClick={() => onImageClick(index)}
          className="relative aspect-[4/3] overflow-hidden rounded-xl group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <img
            src={image.thumb}
            alt={image.filename}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/15 transition-colors duration-200 flex items-center justify-center">
            <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
