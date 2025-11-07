<?php
    require_once __DIR__ . '/config/conexion.php';

    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $curp = $_POST["curp_personal"] ?? '';

        try {
            if ($curp) {
            // Consulta filtrada por CURP con LIKE para búsqueda parcial
            $stmt = $pdo->prepare("
                SELECT 
                    personal.nombre_personal, 
                    personal.apellido_paterno, 
                    personal.apellido_materno, 
                    localidades.nombre_centro_trabajo, 
                    personal.cargo, 
                    personal.curp
                FROM personal
                JOIN localidades
                    ON personal.afiliacion_laboral = localidades.id_localidad
                WHERE personal.curp LIKE :curp
            ");
            $stmt->execute([':curp' => $curp . '%']); // % permite que coincida cualquier cosa después del texto
        } else {
            // Consulta general (todos los registros)
            $stmt = $pdo->query("
                SELECT 
                    personal.nombre_personal, 
                    personal.apellido_paterno, 
                    personal.apellido_materno, 
                    localidades.nombre_centro_trabajo, 
                    personal.cargo, 
                    personal.curp
                FROM personal
                JOIN localidades
                    ON personal.afiliacion_laboral = localidades.id_localidad
            ");
        }


            $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($resultado);

        } catch (PDOException $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
    }