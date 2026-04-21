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
