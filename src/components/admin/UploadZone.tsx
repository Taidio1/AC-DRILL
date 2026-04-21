import { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { API, GalleryImage } from '@/lib/api';

interface UploadZoneProps {
  onUploaded: (image: GalleryImage) => void;
}

export function UploadZone({ onUploaded }: UploadZoneProps) {
  const inputRef       = useRef<HTMLInputElement>(null);
  const [dragging, setDragging]   = useState(false);
  const [progress, setProgress]   = useState<number | null>(null);
  const [error, setError]         = useState<string | null>(null);

  async function uploadFile(file: File) {
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', API.upload);
      xhr.withCredentials = true;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        setProgress(null);
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.success) {
            onUploaded({
              filename:    data.filename,
              url:         data.url,
              thumb:       data.thumb,
              uploaded_at: new Date().toISOString(),
            });
          } else {
            setError(data.message ?? 'Błąd uploadu.');
          }
        } catch {
          setError('Błąd serwera (nieprawidłowy JSON).');
        }
      };

      xhr.onerror = () => {
        setProgress(null);
        setError('Błąd połączenia z serwerem.');
      };

      xhr.send(formData);
    } catch {
      setProgress(null);
      setError('Błąd uploadu.');
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    Array.from(files).forEach(uploadFile);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
    e.target.value = '';
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${dragging ? 'border-primary bg-orange-50' : 'border-border hover:border-primary hover:bg-orange-50/50'}`}
      >
        <Upload className="mx-auto mb-3 text-muted-foreground" size={32} />
        <p className="font-semibold text-foreground mb-1">Przeciągnij zdjęcia tutaj lub kliknij</p>
        <p className="text-sm text-muted-foreground mb-4">Obsługiwane formaty — JPG, PNG, WebP. Maksymalnie 20 MB na zdjęcie.</p>
        <div className="flex gap-2 justify-center flex-wrap mb-4">
          {['JPG / JPEG', 'PNG', 'WebP', 'max 20 MB'].map((b) => (
            <span key={b} className="bg-muted border border-border rounded px-2.5 py-0.5 text-xs text-muted-foreground">{b}</span>
          ))}
        </div>
        <Button type="button" className="bg-primary hover:bg-primary/90 font-semibold pointer-events-none">
          Wybierz pliki
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={onInputChange}
      />

      {progress !== null && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Wysyłanie...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-destructive text-center">{error}</p>}
    </div>
  );
}
