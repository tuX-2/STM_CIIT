<?php
    require_once __DIR__ . '/config/conexion.php';

    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $curp = $_POST["curp_personal"] ?? '';

        try {
            if ($curp) {
            // Consulta filtrada por CURP con LIKE para búsqueda parcial
            $stmt = $pdo->prepare("
                SELECT nombre_personal, apellido_paterno, apellido_materno, afiliacion_laboral AS nombre_centro_trabajo, cargo, curp
                FROM personal
                WHERE curp LIKE :curp
            ");
            $stmt->execute([':curp' => $curp . '%']); // % permite que coincida cualquier cosa después del texto
        } else {
            // Consulta general (todos los registros)
            $stmt = $pdo->query("
                SELECT nombre_personal, apellido_paterno, apellido_materno, afiliacion_laboral AS nombre_centro_trabajo, cargo, curp
                FROM personal
            ");
        }


            $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($resultado);

        } catch (PDOException $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
    }