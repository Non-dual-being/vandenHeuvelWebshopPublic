<?php
session_start();
ini_set('display_errors', 1);
ini_set('log_errors', 1);
error_reporting(E_ALL);

require 'vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

// Laad de .env-variabelen
try {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();
    error_log("Environment-variabelen geladen.");
} catch (Exception $e) {
    error_log("Fout bij laden van .env: " . $e->getMessage());
    die(json_encode(['success' => false, 'serverError' => 'Er is iets fout gegaan in het verzenden']));
}

// Controleer en log de geladen environment-variabelen
$emailUser = $_ENV['GOOGLE_EMAIL'] ?? null;
$emailUserPass = $_ENV['GOOGLE_EMAIL_PASS'] ?? null;

if (empty($emailUser) || empty($emailUserPass)) {
    error_log("Fout: Environment-variabelen ontbreken.");
    error_log("GOOGLE_EMAIL: " . ($emailUser ?? 'NIET GEDEFINIEERD'));
    error_log("GOOGLE_EMAIL_PASS: " . ($emailUserPass ? 'INGEVULD' : 'NIET GEDEFINIEERD'));
    die(json_encode(['success' => false, 'serverError' => 'Er is iets fout gegaan in het verzenden.']));
}

error_log("Environment-variabelen succesvol geladen: GOOGLE_EMAIL: $emailUser");

// Databaseconfiguratie
$host = '127.0.0.1';
$dbname = 'vandenheuvel';
$user = 'root';
$pass = '';
$port = '3307';

// JSON-invoer ophalen
$jsonData = file_get_contents('php://input');
if (!$jsonData) {
    error_log("Lege JSON-invoer ontvangen.");
    die(json_encode(['success' => false, 'serverError' => 'Het bericht is onvolledig.']));
}

$data = json_decode($jsonData, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    error_log("JSON Decode Error: " . json_last_error_msg());
    die(json_encode(['success' => false, 'serverError' => 'Het bericht is niet correct verwerkt.']));
}


// Gegevens ophalen uit JSON
$voornaam = $data['inzender_persoonvoornaam'] ?? '';
$achternaam = $data['inzender_achternaam'] ?? '';
$email = $data['emailadres'] ?? '';
$vragenVerzoeken = $data['vragenVerzoeken'] ?? '';

// Functie om invoer te valideren en ontsmetten
function sanitize_input($data, $maxLength, &$errors, $fieldName)
{
    $sanitizedData = htmlspecialchars(strip_tags(trim($data)));
    if (strlen($sanitizedData) > $maxLength) {
        $errors[$fieldName] = ucfirst($fieldName) . " mag niet langer zijn dan " . $maxLength . " tekens.";
        return false;
    }
    return $sanitizedData;
}

try {
    // Databaseverbinding instellen
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->beginTransaction();

    // Validatie van invoer
    $errors = [];
    $voornaam = !empty($voornaam) && preg_match("/^[\p{L}\s.-]*$/u", $voornaam)
        ? sanitize_input($voornaam, 50, $errors, 'voornaam') // voornaam wordt de waarde die uit sanitize input als de bovestaande evaluatie waar is
        : $errors['voornaam'] = "Ongeldige voornaam.";

    $achternaam = !empty($achternaam) && preg_match("/^[\p{L}\s.-]*$/u", $achternaam)
        ? sanitize_input($achternaam, 50, $errors, 'achternaam')
        : $errors['achternaam'] = "Ongeldige achternaam.";

    $email = !empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)
        ? sanitize_input($email, 100, $errors, 'email')
        : $errors['email'] = "Ongeldig e-mailadres.";

    $message = empty(trim($vragenVerzoeken))
        ? null
        : (preg_match("/^[A-Za-z0-9\s.,:?!]+$/", $vragenVerzoeken)
            ? sanitize_input($vragenVerzoeken, 600, $errors, 'vragenVerzoeken')
            : ($errors['vragenVerzoeken'] = "Het bericht bevat ongeldige tekens.") && null); //de haakjes zijn na de : is voor leesbaarheid de $$null zet message op null als de regex niet voldoet
    

    // Controleer op validatiefouten
    if (!empty($errors)) {
        error_log("Validatiefouten: " . print_r($errors, true));
        die(json_encode(['success' => false, 'errors' => $errors]));
    }

    // Data opslaan in database
    $sql = "INSERT INTO contact_messages (first_name, last_name, email, message) VALUES (:voornaam, :achternaam, :email, :message)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':voornaam' => $voornaam,
        ':achternaam' => $achternaam,
        ':email' => $email,
        ':message' => $message,
    ]);
    $pdo->commit();
    error_log("Gegevens succesvol opgeslagen in database.");

    // E-mail verzenden

    if ($message ===  null) {
        $messageDisplay = "U heeft geen bericht voor ons achtergelaten.";
    } else {
        $messageDisplay = htmlspecialchars($message);
    }

    $currentYear = date('Y');
    
    $mail = new PHPMailer(true);

    // Serverinstellingen
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = $emailUser;
    $mail->Password = $emailUserPass;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    // E-mailinstellingen
    $mail->setFrom($emailUser, 'Van den Heuvel Webshop');
    $mail->addAddress($email, $voornaam . ' ' . $achternaam);
    $mail->addBCC('Joni.vanzee@hotmail.nl');

    $mail->isHTML(true);
    $mail->Subject = 'Van den Heuvel webshop vragen en verzoeken';
    $mail->Body = "
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f9f9f9;
                    padding: 20px;
                }
                .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: #ffffff;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                }
                .header {
                    background: #f7f7f7;
                    padding: 10px 20px;
                    border-bottom: 1px solid #ddd;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 20px;
                    color: #4CAF50;
                }
                .content {
                    padding: 20px;
                }
                .content p {
                    margin: 0 0 10px;
                }
                .footer {
                    text-align: center;
                    padding: 10px;
                    font-size: 12px;
                    color: #777;
                    border-top: 1px solid #ddd;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class='email-container'>
                <div class='header'>
                    <h1>Van den Heuvel Webshop</h1>
                </div>
                <div class='content'>
                    <p>Beste <strong>" . htmlspecialchars($voornaam) . "</strong>,</p>
                    <p>Bedankt voor uw interesse in onze webshop. Wij hebben uw vraag of verzoek succesvol ontvangen. Hieronder vindt u een overzicht van de door u ingediende gegevens:</p>
                    <ul>
                        <li><strong>Voornaam:</strong> " . htmlspecialchars($voornaam) . "</li>
                        <li><strong>Achternaam:</strong> " . htmlspecialchars($achternaam) . "</li>
                        <li><strong>Email:</strong> " . htmlspecialchars($email) . "</li>
                        <li><strong>Bericht:</strong> " . $messageDisplay . "</li>


                    </ul>
                    <p>Wij streven ernaar om binnen 2 werkdagen op uw bericht te reageren.</p>
                    <p>Mocht u vragen hebben of meer informatie nodig hebben, neem dan gerust contact met ons op via:</p>
                    <p><strong>Email:</strong> contact.vandenheuvel@gmail.com<br>
                    <strong>Telefoon:</strong> +31 6 12345678</p>
                    <p>Met vriendelijke groet,</p>
                    <p><strong>Joni & Gerald</strong></p>
                    <p><strong>Van den Heuvel<strong></p>
                </div>
                <div class='footer'>
                    <p>&copy; " . $currentYear . " Van den Heuvel Webshop. Alle rechten voorbehouden.</p>
                </div>
            </div>
        </body>
        </html>
    ";
    $mail->AltBody = strip_tags("
    Beste $voornaam,

    Bedankt voor uw interesse in onze webshop. Wij hebben uw vraag of verzoek succesvol ontvangen. Hieronder vindt u een overzicht van de door u ingediende gegevens:

    Voornaam: $voornaam
    Achternaam: $achternaam
    Email: $email
    Bericht: $messageDisplay

    Wij streven ernaar om binnen 2 werkdagen op uw bericht te reageren.

    Mocht u vragen hebben of meer informatie nodig hebben, neem dan gerust contact met ons op via:
    Email: contact.vandenheuvel@gmail.com
    Telefoon: +31 6 12345678

    Met vriendelijke groet,

    Joni & Gerald van den Heuvel
    ");

    // Verstuur e-mail
    $mail->send();
    error_log("E-mail succesvol verzonden naar: " . $email);
    echo json_encode(['success' => true, 'message' => 'Aanvraag succesvol ontvangen.']);
} catch (Exception $e) {
    $pdo->rollBack();
    error_log("Fout bij verzenden e-mail: " . $e->getMessage());
    die(json_encode(['success' => false, 'serverError' => 'E-mail verzenden mislukt.']));
} catch (PDOException $e) {
    error_log("Databasefout: " . $e->getMessage());
    die(json_encode(['success' => false, 'serverError' => 'Databasefout.']));
}
