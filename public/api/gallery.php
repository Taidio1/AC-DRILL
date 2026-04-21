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
