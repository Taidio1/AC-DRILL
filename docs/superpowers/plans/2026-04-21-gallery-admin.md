# Galeria + Panel Admin — Plan Implementacji

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dodanie publicznej galerii zdjęć `/galeria` oraz chronionego panelu administracyjnego `/admin` umożliwiającego właścicielowi AC-Drill samodzielne wgrywanie i usuwanie zdjęć.

**Architecture:** Backend PHP (istniejący wzorzec z `contact.php`) obsługuje API: upload plików, sesję admina i serwowanie listy zdjęć. React (react-router-dom) dodaje dwie nowe trasy — publiczną `/galeria` i chroniony `/admin`. Metadane zdjęć trzymane w `gallery.json`, pliki na dysku serwera.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, shadcn/ui, react-router-dom v6, PHP 8+ z rozszerzeniem GD, Vite 5

**Spec:** `docs/superpowers/specs/2026-04-21-gallery-admin-design.md`

> **Ważne:** Nie twórz żadnych commitów git. Użytkownik zarządza historią commitów samodzielnie.

---

## Mapa plików

### Nowe pliki PHP
| Plik | Odpowiedzialność |
|------|-----------------|
| `public/api/config.php` | Login i zahashowane hasło admina, stała `TOTAL_GB` |
| `public/api/_auth.php` | Helper: sprawdza sesję, zwraca 401 jeśli brak |
| `public/api/gallery.php` | GET: lista zdjęć + statystyki dysku |
| `public/api/auth-check.php` | GET: `{authenticated: bool}` |
| `public/api/login.php` | POST: weryfikacja login/hasło, start sesji |
| `public/api/logout.php` | POST: zniszczenie sesji |
| `public/api/upload.php` | POST multipart: upload + thumbnail GD + aktualizacja gallery.json |
| `public/api/delete.php` | POST: usunięcie pliku + thumbnaila + wpisu z gallery.json |
| `public/api/.htaccess` | Blokuje dostęp HTTP do `config.php` i `_auth.php` |
| `public/uploads/gallery/.gitkeep` | Placeholder katalogu zdjęć |
| `public/uploads/gallery/thumbs/.gitkeep` | Placeholder katalogu miniatur |

### Modyfikowane pliki
| Plik | Zmiana |
|------|--------|
| `src/App.tsx` | Dodanie tras: `/galeria`, `/admin`, `/admin/login` |
| `src/components/landing/Header.tsx` | Dodanie linku "Galeria" do nawigacji |
| `vite.config.ts` | Proxy `/api/` → lokalny PHP server (dev only) |

### Nowe pliki React
| Plik | Odpowiedzialność |
|------|-----------------|
| `src/pages/Galeria.tsx` | Strona publicznej galerii — fetch + render |
| `src/pages/AdminLogin.tsx` | Strona logowania |
| `src/pages/Admin.tsx` | Panel admina — statystyki, upload, lista zdjęć |
| `src/components/gallery/GalleryGrid.tsx` | Siatka zdjęć 3→2→1 kol. z hover |
| `src/components/gallery/Lightbox.tsx` | Overlay pełnoekranowy z nawigacją |
| `src/components/admin/UploadZone.tsx` | Drag & drop + progress bar |
| `src/components/admin/PhotoGrid.tsx` | Siatka zdjęć admina z przyciskiem usuwania |
| `src/hooks/useAdminAuth.ts` | Sprawdzenie sesji + redirect |
| `src/lib/api.ts` | Stałe URL API i typy danych |

---

## Task 1: Struktura katalogów i konfiguracja PHP

**Files:**
- Create: `public/api/config.php`
- Create: `public/api/.htaccess`
- Create: `public/uploads/gallery/.gitkeep`
- Create: `public/uploads/gallery/thumbs/.gitkeep`

- [ ] **Krok 1: Utwórz katalogi**

```bash
mkdir -p public/uploads/gallery/thumbs
touch public/uploads/gallery/.gitkeep
touch public/uploads/gallery/thumbs/.gitkeep
```

- [ ] **Krok 2: Utwórz `public/api/config.php`**

Zmień `ADMIN_LOGIN` i `ADMIN_PASSWORD_HASH` na właściwe wartości. Hash generujesz przez: `php -r "echo password_hash('TwojeHaslo', PASSWORD_DEFAULT);"` w terminalu.

```php
<?php
// Konfiguracja panelu admina AC-Drill
// WAŻNE: Ten plik nie może być dostępny przez HTTP (chroniony przez .htaccess)

define('ADMIN_LOGIN', 'admin');
define('ADMIN_PASSWORD_HASH', '$2y$10$ZMIEN_NA_WLASCIWY_HASH_WYGENEROWANY_PHP');
define('TOTAL_GB', 100); // Pojemność dysku hostingu w GB

define('UPLOADS_DIR', __DIR__ . '/../uploads/gallery/');
define('THUMBS_DIR', __DIR__ . '/../uploads/gallery/thumbs/');
define('GALLERY_JSON', __DIR__ . '/gallery.json');
define('THUMB_MAX_W', 400);
define('THUMB_MAX_H', 300);
define('MAX_UPLOAD_MB', 20);
```

- [ ] **Krok 3: Utwórz `public/api/.htaccess`** — blokuje dostęp do plików pomocniczych

```apache
<Files "config.php">
    Order allow,deny
    Deny from all
</Files>
<Files "_auth.php">
    Order allow,deny
    Deny from all
</Files>
```

- [ ] **Krok 4: Inicjalizuj pusty `public/api/gallery.json`**

```bash
echo "[]" > public/api/gallery.json
```

- [ ] **Weryfikacja:** Upewnij się że katalogi istnieją: `ls public/uploads/gallery/thumbs`

---

## Task 2: PHP helper autoryzacji + gallery.php

**Files:**
- Create: `public/api/_auth.php`
- Create: `public/api/gallery.php`

- [ ] **Krok 1: Utwórz `public/api/_auth.php`** — współdzielony helper sesji

```php
<?php
require_once __DIR__ . '/config.php';

function requireAuth(): void {
    session_start();
    if (empty($_SESSION['admin'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }
}

function jsonHeaders(): void {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
}

function corsHeaders(): void {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Credentials: true');
}
```

- [ ] **Krok 2: Utwórz `public/api/gallery.php`**

```php
<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/_auth.php';

corsHeaders();
jsonHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit();
}

// Wczytaj listę zdjęć
$images = [];
if (file_exists(GALLERY_JSON)) {
    $json = file_get_contents(GALLERY_JSON);
    $images = json_decode($json, true) ?? [];
}

// Oblicz zajęte miejsce (tylko oryginały, bez thumbs)
$usedBytes = 0;
if (is_dir(UPLOADS_DIR)) {
    foreach (glob(UPLOADS_DIR . '*') as $file) {
        if (is_file($file)) {
            $usedBytes += filesize($file);
        }
    }
}
$usedMb = round($usedBytes / 1024 / 1024, 1);

echo json_encode([
    'images' => $images,
    'stats' => [
        'count'    => count($images),
        'used_mb'  => $usedMb,
        'total_gb' => TOTAL_GB,
    ],
]);
```

- [ ] **Weryfikacja:** Otwórz `http://localhost/api/gallery.php` w przeglądarce (po uruchomieniu lokalnego PHP serwera) — powinien zwrócić `{"images":[],"stats":{"count":0,"used_mb":0,"total_gb":100}}`.

---

## Task 3: Endpointy autoryzacji (auth-check, login, logout)

**Files:**
- Create: `public/api/auth-check.php`
- Create: `public/api/login.php`
- Create: `public/api/logout.php`

- [ ] **Krok 1: Utwórz `public/api/auth-check.php`**

```php
<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/_auth.php';

corsHeaders();
jsonHeaders();

session_start();
echo json_encode(['authenticated' => !empty($_SESSION['admin'])]);
```

- [ ] **Krok 2: Utwórz `public/api/login.php`**

```php
<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/_auth.php';

corsHeaders();
jsonHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$login    = trim($input['login'] ?? '');
$password = trim($input['password'] ?? '');

if ($login !== ADMIN_LOGIN || !password_verify($password, ADMIN_PASSWORD_HASH)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowy login lub hasło.']);
    exit();
}

session_start();
session_regenerate_id(true);
$_SESSION['admin'] = true;

echo json_encode(['success' => true]);
```

- [ ] **Krok 3: Utwórz `public/api/logout.php`**

```php
<?php
require_once __DIR__ . '/_auth.php';

corsHeaders();
jsonHeaders();

session_start();
session_destroy();
echo json_encode(['success' => true]);
```

- [ ] **Weryfikacja:** Przetestuj login przez curl lub Postman:
```bash
curl -X POST http://localhost/api/login.php \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","password":"TwojeHaslo"}' \
  -c cookies.txt
# Oczekiwany wynik: {"success":true}

curl http://localhost/api/auth-check.php -b cookies.txt
# Oczekiwany wynik: {"authenticated":true}
```

---

## Task 4: PHP upload z generowaniem miniatur

**Files:**
- Create: `public/api/upload.php`

- [ ] **Krok 1: Utwórz `public/api/upload.php`**

```php
<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/_auth.php';

corsHeaders();
jsonHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit();
}

if (empty($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Brak pliku.']);
    exit();
}

$file = $_FILES['image'];

// Walidacja rozmiaru
if ($file['size'] > MAX_UPLOAD_MB * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Plik jest za duży (max ' . MAX_UPLOAD_MB . ' MB).']);
    exit();
}

// Walidacja MIME po zawartości (nie po rozszerzeniu)
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime  = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
if (!in_array($mime, $allowedMimes, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Niedozwolony format pliku.']);
    exit();
}

// Sanityzacja nazwy pliku
$ext      = match($mime) {
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
};
$basename = preg_replace('/[^a-z0-9]+/', '-', strtolower(pathinfo($file['name'], PATHINFO_FILENAME)));
$basename = trim($basename, '-');
$filename = uniqid() . '-' . $basename . '.' . $ext;

// Zapisz oryginalny plik
$destPath = UPLOADS_DIR . $filename;
if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Błąd zapisu pliku.']);
    exit();
}

// Generuj miniaturę przez PHP GD
$thumbPath = THUMBS_DIR . $filename;
generateThumb($destPath, $thumbPath, $mime, THUMB_MAX_W, THUMB_MAX_H);

// Aktualizuj gallery.json
$images = [];
if (file_exists(GALLERY_JSON)) {
    $images = json_decode(file_get_contents(GALLERY_JSON), true) ?? [];
}

array_unshift($images, [
    'filename'    => $filename,
    'url'         => '/uploads/gallery/' . $filename,
    'thumb'       => '/uploads/gallery/thumbs/' . $filename,
    'uploaded_at' => date('c'),
]);

file_put_contents(GALLERY_JSON, json_encode($images, JSON_PRETTY_PRINT));

echo json_encode([
    'success'  => true,
    'filename' => $filename,
    'url'      => '/uploads/gallery/' . $filename,
    'thumb'    => '/uploads/gallery/thumbs/' . $filename,
]);

// ── Helper ──────────────────────────────────────────────────────────────
function generateThumb(string $src, string $dest, string $mime, int $maxW, int $maxH): void {
    $source = match($mime) {
        'image/jpeg' => imagecreatefromjpeg($src),
        'image/png'  => imagecreatefrompng($src),
        'image/webp' => imagecreatefromwebp($src),
        default      => null,
    };
    if (!$source) return;

    [$origW, $origH] = getimagesize($src);
    $ratio = min($maxW / $origW, $maxH / $origH, 1.0);
    $newW  = (int) round($origW * $ratio);
    $newH  = (int) round($origH * $ratio);

    $thumb = imagecreatetruecolor($newW, $newH);

    // Zachowaj przezroczystość PNG
    if ($mime === 'image/png') {
        imagealphablending($thumb, false);
        imagesavealpha($thumb, true);
    }

    imagecopyresampled($thumb, $source, 0, 0, 0, 0, $newW, $newH, $origW, $origH);

    match($mime) {
        'image/jpeg' => imagejpeg($thumb, $dest, 85),
        'image/png'  => imagepng($thumb, $dest),
        'image/webp' => imagewebp($thumb, $dest, 85),
    };

    imagedestroy($source);
    imagedestroy($thumb);
}
```

- [ ] **Weryfikacja:** Wgraj testowe zdjęcie przez curl (po zalogowaniu):
```bash
curl -X POST http://localhost/api/upload.php \
  -b cookies.txt \
  -F "image=@/sciezka/do/zdjecia.jpg"
# Oczekiwany wynik: {"success":true,"filename":"...","url":"...","thumb":"..."}
```
Sprawdź że plik pojawił się w `public/uploads/gallery/` i miniatura w `public/uploads/gallery/thumbs/`.

---

## Task 5: PHP endpoint usuwania zdjęć

**Files:**
- Create: `public/api/delete.php`

- [ ] **Krok 1: Utwórz `public/api/delete.php`**

```php
<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/_auth.php';

corsHeaders();
jsonHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit();
}

$input    = json_decode(file_get_contents('php://input'), true);
$filename = basename($input['filename'] ?? ''); // basename() zapobiega path traversal

if (empty($filename)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Brak nazwy pliku.']);
    exit();
}

// Usuń pliki z dysku
$origPath  = UPLOADS_DIR . $filename;
$thumbPath = THUMBS_DIR . $filename;

if (file_exists($origPath))  unlink($origPath);
if (file_exists($thumbPath)) unlink($thumbPath);

// Aktualizuj gallery.json
$images = [];
if (file_exists(GALLERY_JSON)) {
    $images = json_decode(file_get_contents(GALLERY_JSON), true) ?? [];
}

$images = array_values(array_filter($images, fn($img) => $img['filename'] !== $filename));
file_put_contents(GALLERY_JSON, json_encode($images, JSON_PRETTY_PRINT));

echo json_encode(['success' => true]);
```

- [ ] **Weryfikacja:**
```bash
curl -X POST http://localhost/api/delete.php \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"filename":"NAZWA_PLIKU.jpg"}'
# Oczekiwany wynik: {"success":true}
```
Sprawdź że plik zniknął z `public/uploads/gallery/` i z `gallery.json`.

---

## Task 6: Typy API + Vite proxy

**Files:**
- Create: `src/lib/api.ts`
- Modify: `vite.config.ts`

- [ ] **Krok 1: Utwórz `src/lib/api.ts`** — centralne typy i stałe

```typescript
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
```

- [ ] **Krok 2: Odczytaj aktualny `vite.config.ts`** i dodaj proxy na `/api/`

Aktualny plik prawdopodobnie wygląda tak:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Dodaj sekcję `server.proxy`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

> **Lokalne testowanie PHP:** Uruchom `php -S localhost:8080 -t public/` w osobnym terminalu. Vite dev server (port 5173) będzie proxy-ował żądania `/api/` i `/uploads/` do PHP serwera na porcie 8080.

---

## Task 7: Routing React + link Galeria w nawigacji

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/landing/Header.tsx`

- [ ] **Krok 1: Odczytaj `src/App.tsx`** i dodaj trasy

Zmień plik tak by wyglądał:
```typescript
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Galeria from "./pages/Galeria";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/galeria" element={<Galeria />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
```

- [ ] **Krok 2: Zaktualizuj `src/components/landing/Header.tsx`**

Zamień tablicę `navItems` (linia ~6) z anchor hash na obiekty z `href` i nowym polem `isRoute`:
```typescript
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Start',          href: '/#start',   isRoute: false },
  { label: 'Oferta',         href: '/#oferta',  isRoute: false },
  { label: 'Park Maszynowy', href: '/#maszyny', isRoute: false },
  { label: 'Galeria',        href: '/galeria',  isRoute: true  },
  { label: 'Kontakt',        href: '/#kontakt', isRoute: false },
];
```

Zaktualizuj renderowanie linków w nawigacji desktopowej (zastąp `<a>` odpowiednim elementem):
```tsx
{navItems.map((item) =>
  item.isRoute ? (
    <Link
      key={item.href}
      to={item.href}
      className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
    >
      {item.label}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
    </Link>
  ) : (
    <a
      key={item.href}
      href={item.href}
      onClick={(e) => {
        if (item.href.startsWith('/#')) {
          e.preventDefault();
          const id = item.href.slice(2);
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMobileMenuOpen(false);
      }}
      className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
    >
      {item.label}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
    </a>
  )
)}
```

Zastosuj identyczną logikę do menu mobilnego — zamień istniejące `<a>` na ten sam wzorzec warunkowy.

- [ ] **Weryfikacja:** Uruchom `npm run dev`, sprawdź że link "Galeria" pojawił się w nawigacji i kliknięcie przenosi na `/galeria` (strona 404 to OK na razie — trasa istnieje, page component jeszcze nie).

---

## Task 8: Komponent GalleryGrid

**Files:**
- Create: `src/components/gallery/GalleryGrid.tsx`

- [ ] **Krok 1: Utwórz `src/components/gallery/GalleryGrid.tsx`**

```tsx
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
```

---

## Task 9: Komponent Lightbox

**Files:**
- Create: `src/components/gallery/Lightbox.tsx`

- [ ] **Krok 1: Utwórz `src/components/gallery/Lightbox.tsx`**

```tsx
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
```

---

## Task 10: Strona /galeria

**Files:**
- Create: `src/pages/Galeria.tsx`

- [ ] **Krok 1: Utwórz `src/pages/Galeria.tsx`**

```tsx
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
```

- [ ] **Weryfikacja:** Otwórz `http://localhost:5173/galeria` — powinien być widoczny hero z tytułem i siatka (skeleton podczas ładowania lub "Brak zdjęć" gdy galeria pusta).

---

## Task 11: Hook useAdminAuth

**Files:**
- Create: `src/hooks/useAdminAuth.ts`

- [ ] **Krok 1: Utwórz `src/hooks/useAdminAuth.ts`**

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '@/lib/api';

interface AuthState {
  loading: boolean;
  authenticated: boolean;
}

export function useAdminAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ loading: true, authenticated: false });
  const navigate = useNavigate();

  useEffect(() => {
    fetch(API.authCheck, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated) {
          navigate('/admin/login', { replace: true });
        } else {
          setState({ loading: false, authenticated: true });
        }
      })
      .catch(() => navigate('/admin/login', { replace: true }));
  }, [navigate]);

  return state;
}
```

---

## Task 12: Strona /admin/login

**Files:**
- Create: `src/pages/AdminLogin.tsx`

- [ ] **Krok 1: Utwórz `src/pages/AdminLogin.tsx`**

```tsx
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API } from '@/lib/api';
import logo from '@/img/acdrilllogo.png';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [login, setLogin]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(API.login, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json();

      if (data.success) {
        navigate('/admin', { replace: true });
      } else {
        setError(data.message ?? 'Błąd logowania.');
      }
    } catch {
      setError('Błąd połączenia z serwerem.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-border rounded-2xl p-10 shadow-lg">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <img src={logo} alt="AC Drill" className="h-10 w-auto" />
            <span className="font-extrabold text-2xl text-foreground">Drill</span>
          </div>

          <h1 className="text-lg font-bold text-foreground text-center mb-1">
            Panel administracyjny
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Zaloguj się, aby zarządzać galerią
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Login
              </label>
              <Input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Hasło
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 font-bold shadow-md hover:shadow-lg"
            >
              {loading ? 'Logowanie...' : 'Zaloguj się →'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Weryfikacja:** Otwórz `http://localhost:5173/admin/login` — formularz logowania widoczny. Wpisz złe hasło — pojawia się komunikat błędu. Wpisz dobre dane — redirect do `/admin`.

---

## Task 13: Komponenty admina (UploadZone + PhotoGrid)

**Files:**
- Create: `src/components/admin/UploadZone.tsx`
- Create: `src/components/admin/PhotoGrid.tsx`

- [ ] **Krok 1: Utwórz `src/components/admin/UploadZone.tsx`**

```tsx
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

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
```

- [ ] **Krok 2: Utwórz `src/components/admin/PhotoGrid.tsx`**

```tsx
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
```

---

## Task 14: Strona /admin (panel główny)

**Files:**
- Create: `src/pages/Admin.tsx`

- [ ] **Krok 1: Utwórz `src/pages/Admin.tsx`**

```tsx
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
      // cicho — użytkownik musi odświeżyć
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
```

- [ ] **Weryfikacja końcowa:**
  1. Zaloguj się przez `/admin/login` → trafiasz na panel
  2. Wgraj zdjęcie przez strefę uploadu → pojawia się w siatce i galerii
  3. Kliknij ✕ przy zdjęciu → potwierdzenie → zdjęcie znika z panelu i galerii
  4. Otwórz `/galeria` → widać wgrane zdjęcie
  5. Kliknij zdjęcie w galerii → lightbox + nawigacja strzałkami + Escape zamyka
  6. Sprawdź RWD: zmniejsz okno → siatki przechodzą w 2, potem 1 kolumnę
  7. Wejdź bezpośrednio na `/admin` bez logowania → redirect do `/admin/login`

---

## Deployment na home.pl

Po zakończeniu implementacji:

1. Zbuduj React: `npm run build`
2. Wgraj zawartość `dist/` na serwer (bez nadpisywania katalogu `uploads/` jeśli już istnieje)
3. Wgraj pliki PHP z `public/api/` do katalogu `api/` na serwerze
4. Wgraj `public/uploads/` (puste katalogi) jeśli nie istnieją
5. Upewnij się że PHP ma uprawnienia do zapisu w `uploads/gallery/` i `api/gallery.json`
6. Wygeneruj hash hasła na serwerze: `php -r "echo password_hash('TwojeHaslo', PASSWORD_DEFAULT);"` i wklej do `config.php`
