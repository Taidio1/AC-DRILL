<?php
// Konfiguracja panelu admina AC-Drill
// WAŻNE: Ten plik nie może być dostępny przez HTTP (chroniony przez .htaccess)

define('ADMIN_LOGIN', 'admin');
define('ADMIN_PASSWORD_HASH', '$2y$10$Lz/oX9p/r9G/Z0/Z0/Z0/Z0/Z0/Z0/Z0/Z0/Z0/Z0/Z0/Z0/Z0/Z0'); // Zastąp to hashem wygenerowanym na serwerze
define('TOTAL_GB', 100); // Pojemność dysku hostingu w GB

define('UPLOADS_DIR', __DIR__ . '/../uploads/gallery/');
define('THUMBS_DIR', __DIR__ . '/../uploads/gallery/thumbs/');
define('GALLERY_JSON', __DIR__ . '/gallery.json');
define('THUMB_MAX_W', 400);
define('THUMB_MAX_H', 300);
define('MAX_UPLOAD_MB', 20);
