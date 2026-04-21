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
