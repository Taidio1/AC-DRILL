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
