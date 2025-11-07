<?php
require_once __DIR__ . '/config/conexion.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    try {
        // Recibir parámetros de búsqueda
        $idLocalidad = trim($_POST["id_localidad"] ?? '');
        $nombreCentro = trim($_POST["nombre_centro_trabajo"] ?? '');
        $localidad = trim($_POST["localidad"] ?? '');
        $poblacion = trim($_POST["poblacion"] ?? '');
        $estado = trim($_POST["estado"] ?? '');

        // Construir query dinámicamente
        $sql = "SELECT 
                    id_localidad,
                    nombre_centro_trabajo AS nombre_centro,
                    ubicacion_georeferenciada AS ubicacion,
                    poblacion,
                    localidad,
                    estado,
                    tipo_instalacion
                FROM localidades
                WHERE 1=1";
        $params = [];

        if ($idLocalidad !== '') {
            $sql .= " AND id_localidad = :id_localidad";
            $params[':id_localidad'] = $idLocalidad;
        }
        if ($nombreCentro !== '') {
            $sql .= " AND nombre_centro_trabajo ILIKE :nombre_centro";
            $params[':nombre_centro'] = "%$nombreCentro%";
        }
        if ($localidad !== '') {
            $sql .= " AND localidad ILIKE :localidad";
            $params[':localidad'] = "%$localidad%";
        }
        if ($poblacion !== '') {
            $sql .= " AND poblacion ILIKE :poblacion";
            $params[':poblacion'] = "%$poblacion%";
        }
        if ($estado !== '') {
            $sql .= " AND estado ILIKE :estado";
            $params[':estado'] = "%$estado%";
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$resultados || count($resultados) === 0) {
            echo json_encode(['error' => 'No se encontraron localidades con esos filtros']);
            exit;
        }

        // Devolver solo el primer resultado como objeto
        echo json_encode($resultados[0]);

    } catch (PDOException $e) {
        echo json_encode(['error' => 'Error en la consulta: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'Método no permitido']);
}
?>
