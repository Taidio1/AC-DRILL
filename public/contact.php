<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight options request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    exit();
}

// Get the raw POST data
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

// Clean and validate input
$name = isset($input['name']) ? strip_tags(trim($input['name'])) : '';
$email = isset($input['email']) ? filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL) : '';
$phone = isset($input['phone']) ? strip_tags(trim($input['phone'])) : '';
$message = isset($input['message']) ? strip_tags(trim($input['message'])) : '';

// Basic validation
if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Proszę wypełnić wszystkie wymagane pola."]);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Nieprawidłowy adres email."]);
    exit();
}

// Email configuration
$to = "biuro@acdrill.pl";
$subject = "Nowa wiadomość ze strony AC Drill od: $name";

$email_content = "Otrzymano nową wiadomość z formularza kontaktowego.\n\n";
$email_content .= "Imię i nazwisko: $name\n";
$email_content .= "Email: $email\n";
$email_content .= "Telefon: $phone\n\n";
$email_content .= "Wiadomość:\n$message\n";

$headers = "From: noreply@acdrill.pl\r\n";
// Add Reply-To so the client can reply directly to the sender
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Send email
if (mail($to, $subject, $email_content, $headers)) {
    http_response_code(200);
    echo json_encode(["success" => true, "message" => "Wiadomość została wysłana."]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Wystąpił błąd podczas wysyłania wiadomości."]);
}
?>
