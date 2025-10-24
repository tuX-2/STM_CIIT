<?php
    require_once __DIR__ . '/config/conexion.php';

    header('Content-Type: application/json; charset=utf-8');

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // Recibir datos del formulario
    $nombre = $_POST["nombre_persona"] ?? '';
    $apellidoPaterno = $_POST["apellido_paterno"] ?? '';
    $apellidoMaterno = $_POST["apellido_materno"] ?? '';
    $afiliacionLaboral = $_POST["afiliacion_laboral"] ?? '';
    $cargo = $_POST["cargo"] ?? '';
    $curp = $_POST["curp"] ?? '';

    try {
        // Preparar statement
        $stmt = $pdo->prepare("
            INSERT INTO personal (nombre_personal, apellido_paterno, apellido_materno, afiliacion_laboral, cargo, curp)
            VALUES (:nombre, :apellidoP, :apellidoM, :afiliacion, :cargo, :curp)
        ");

        // Ejecutar statement con parámetros
        $stmt->execute([
            ':nombre'    => $nombre,
            ':apellidoP' => $apellidoPaterno,
            ':apellidoM' => $apellidoMaterno,
            ':afiliacion'=> $afiliacionLaboral,
            ':cargo'     => $cargo,
            ':curp'      => $curp
        ]);

        // Respuesta exitosa
        echo json_encode(["success" => true, "message" => "Personal registrado correctamente."]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }

} else {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "No se recibieron datos."]);
}