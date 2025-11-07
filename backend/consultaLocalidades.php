<?php
require_once __DIR__ . '/config/conexion.php'; // Ajusta la ruta si es necesario

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    try {
        // Recibimos los arrays de filtros y valores
        $filtros = $_POST["filtros"] ?? [];
        $valores = $_POST["valores"] ?? [];

        // Base de la consulta
        $sql = "
            SELECT 
                nombre_centro_trabajo,
                localidad,
                poblacion,
                estado,
                tipo_instalacion
            FROM localidades
        ";

        $condiciones = [];
        $parametros = [];

        // Construcción dinámica de filtros (solo si hay datos válidos)
        for ($i = 0; $i < count($filtros); $i++) {
            $campo = trim($filtros[$i] ?? '');
            $valor = trim($valores[$i] ?? '');
            if ($campo && $valor) {
                $condiciones[] = "$campo LIKE :valor$i";
                $parametros[":valor$i"] = "%$valor%";
            }
        }

        // Si hay filtros, los agregamos a la consulta
        if (count($condiciones) > 0) {
            $sql .= " WHERE " . implode(" AND ", $condiciones);
        }

        // Preparar y ejecutar
        $stmt = $pdo->prepare($sql);
        $stmt->execute($parametros);

        // Obtener resultados
        $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($resultado);
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Error en la consulta: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'Método no permitido']);
}
