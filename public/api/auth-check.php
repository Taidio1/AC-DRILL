<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/_auth.php';

corsHeaders();
jsonHeaders();

session_start();
echo json_encode(['authenticated' => !empty($_SESSION['admin'])]);
