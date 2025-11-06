<?php
require_once __DIR__ . '/config/conexion.php'; // Archivo que crea la conexión $pdo
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // Recibir datos del formulario
    $nombreCentro = $_POST["nombre_centro_trabajo"] ?? '';
    $ubicacion = $_POST["ubicacion_georeferenciada"] ?? '';
    $poblacion = $_POST["poblacion"] ?? '';
    $localidad = $_POST["localidad"] ?? '';
    $estado = $_POST["estado"] ?? '';
    $tipoInstalacion = $_POST["tipo_instalacion"] ?? '';

    try {
        // Verificar si ya existe el centro de trabajo con el mismo nombre
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM localidades WHERE nombre_centro_trabajo = :nombre");
        $stmt->execute([':nombre' => $nombreCentro]);
        $existe = $stmt->fetchColumn();

        if ($existe > 0) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "error" => "El nombre del centro de trabajo ya está registrado."
            ]);
            exit;
        }

        // Insertar nueva localidad
        $stmt = $pdo->prepare("
            INSERT INTO localidades 
            (nombre_centro_trabajo, ubicacion_georeferenciada, poblacion, localidad, estado, tipo_instalacion)
            VALUES 
            (:nombre, :ubicacion, :poblacion, :localidad, :estado, :tipoInstalacion)
        ");

        $stmt->execute([
            ':nombre' => $nombreCentro,
            ':ubicacion' => $ubicacion,
            ':poblacion' => $poblacion,
            ':localidad' => $localidad,
            ':estado' => $estado,
            ':tipoInstalacion' => $tipoInstalacion
        ]);

        echo json_encode([
            "success" => true,
            "message" => "Localidad registrada correctamente."
        ]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "error" => $e->getMessage()
        ]);
    }

} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "No se recibieron datos."
    ]);
}
?>
