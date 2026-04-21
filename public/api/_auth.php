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
