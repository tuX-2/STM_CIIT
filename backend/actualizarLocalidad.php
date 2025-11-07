<?php
require_once __DIR__ . '/config/conexion.php'; // 


if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // Recibir datos del formulario desde $_POST (FormData)
    $id_localidad = $_POST["id_localidad"] ?? '';
    $nombreCentro = $_POST["nombre_centro_trabajo"] ?? '';
    $ubicacion = $_POST["ubicacion_georeferenciada"] ?? '';
    $poblacion = $_POST["poblacion"] ?? '';
    $localidad = $_POST["localidad"] ?? '';
    $estado = $_POST["estado"] ?? '';
    $tipoInstalacion = $_POST["tipo_instalacion"] ?? '';

    try {
        // Validar que venga el ID
        if (empty($id_localidad)) {
            echo json_encode(['exito' => false, 'mensaje' => 'ID de localidad requerido']);
            exit;
        }

        // Validar campos obligatorios
        if (
            empty(trim($nombreCentro)) ||
            empty(trim($ubicacion)) ||
            empty(trim($poblacion)) ||
            empty(trim($localidad)) ||
            empty($estado) ||
            empty($tipoInstalacion)
        ) {
            echo json_encode(['exito' => false, 'mensaje' => 'Todos los campos son obligatorios']);
            exit;
        }

        // UPDATE usando el ID
        $sql = "
            UPDATE localidades 
            SET 
                nombre_centro_trabajo = :nombre_centro_trabajo,
                ubicacion_georeferenciada = :ubicacion_georeferenciada,
                poblacion = :poblacion,
                localidad = :localidad,
                estado = :estado,
                tipo_instalacion = :tipo_instalacion
            WHERE id_localidad = :id_localidad
        ";

        $stmt = $pdo->prepare($sql);
        $resultado = $stmt->execute([
            ':id_localidad' => $id_localidad,
            ':nombre_centro_trabajo' => trim($nombreCentro),
            ':ubicacion_georeferenciada' => trim($ubicacion),
            ':poblacion' => trim($poblacion),
            ':localidad' => trim($localidad),
            ':estado' => $estado,
            ':tipo_instalacion' => $tipoInstalacion
        ]);

        if ($resultado && $stmt->rowCount() > 0) {
            echo json_encode(['exito' => true, 'mensaje' => 'Localidad actualizada correctamente']);
        } else {
            echo json_encode(['exito' => false, 'mensaje' => 'No se realizaron cambios']);
        }

    } catch (PDOException $e) {
        echo json_encode(['exito' => false, 'mensaje' => 'Error al actualizar: ' . $e->getMessage()]);
    }

} else {
    echo json_encode(['exito' => false, 'mensaje' => 'Método no permitido']);
}
?>
