<?php

require_once __DIR__ . '/config/conexion.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    try {
        // Recibir el nombre de localidad 
        $nombreLocalidad = trim($_POST["buscar_nombre_localidad"] ?? '');

        if (!$nombreLocalidad) {
            echo json_encode(['error' => 'Debe proporcionar un nombre de localidad']);
            exit;
        }

        // Buscar por NOMBRE (usando LIKE para búsqueda flexible)
        // Pero retornar TODOS los datos incluyendo el ID
        $sql = "
            SELECT 
                id_localidad,
                nombre_centro_trabajo,
                ubicacion_georeferenciada,
                poblacion,
                localidad,
                estado,
                tipo_instalacion
            FROM localidades
            WHERE 
                localidad LIKE :nombreLocalidad
                OR nombre_centro_trabajo LIKE :nombreLocalidad
            LIMIT 1
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([':nombreLocalidad' => "%$nombreLocalidad%"]);

        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($resultado) {
            echo json_encode($resultado);
        } else {
            echo json_encode(['error' => 'No se encontró la localidad']);
        }
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Error en la consulta: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'Método no permitido']);
}
?>