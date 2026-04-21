<?php
require_once __DIR__ . '/_auth.php';

corsHeaders();
jsonHeaders();

session_start();
session_destroy();
echo json_encode(['success' => true]);
