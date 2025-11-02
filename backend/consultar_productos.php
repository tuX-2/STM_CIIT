<?php
// ajax/consultar_productos.php
session_start();
header('Content-Type: application/json');

/*
// Verificar que el usuario tenga permisos
$roles_permitidos = ['Autoridad', 'Administrador del TMS', 'Operador Logistico', 'Jefe de Almacén', 'Cliente'];
if (!isset($_SESSION['rol']) || !in_array($_SESSION['rol'], $roles_permitidos)) {
    echo json_encode(['success' => false, 'error' => 'No tiene permisos para realizar esta acción']);
    exit;
}
*/
// Incluir archivo de conexión
require_once __DIR__ . '/config/conexion.php';

try {
    // Obtener filtros
    $filtro_nombre = isset($_POST['filtro_nombre']) ? trim($_POST['filtro_nombre']) : '';
    $filtro_ubicacion = isset($_POST['filtro_ubicacion']) ? $_POST['filtro_ubicacion'] : array();
    $filtro_tipo_mercancia = isset($_POST['filtro_tipo_mercancia']) ? $_POST['filtro_tipo_mercancia'] : array();
    $filtro_tipo_embalaje = isset($_POST['filtro_tipo_embalaje']) ? $_POST['filtro_tipo_embalaje'] : array();
    $filtro_rango_peso = isset($_POST['filtro_rango_peso']) ? $_POST['filtro_rango_peso'] : array();
    
    // Verificar que al menos un criterio esté presente
    $hay_criterios = !empty($filtro_nombre) || 
                     !empty($filtro_ubicacion) || 
                     !empty($filtro_tipo_mercancia) || 
                     !empty($filtro_tipo_embalaje) || 
                     !empty($filtro_rango_peso);
    
    if (!$hay_criterios) {
        throw new Exception('Debe especificar al menos un criterio de búsqueda.');
    }
    
    // Construir consulta SQL dinámicamente
    $query = "SELECT p.*, l.nombre_localidad 
              FROM productos p 
              INNER JOIN localidades l ON p.ubicacion_producto = l.id_localidad 
              WHERE 1=1";
    
    $params = array();
    $param_count = 1;
    
    // Filtro por nombre (búsqueda parcial)
    if (!empty($filtro_nombre)) {
        $query .= " AND LOWER(p.nombre_producto) LIKE LOWER($" . $param_count . ")";
        $params[] = '%' . $filtro_nombre . '%';
        $param_count++;
    }
    
    // Filtro por ubicación (múltiple)
    if (!empty($filtro_ubicacion)) {
        $placeholders = array();
        foreach ($filtro_ubicacion as $ubicacion) {
            $placeholders[] = "$" . $param_count;
            $params[] = $ubicacion;
            $param_count++;
        }
        $query .= " AND p.ubicacion_producto IN (" . implode(',', $placeholders) . ")";
    }
    
    // Filtro por tipo de mercancía (múltiple)
    if (!empty($filtro_tipo_mercancia)) {
        $placeholders = array();
        foreach ($filtro_tipo_mercancia as $tipo) {
            $placeholders[] = "$" . $param_count;
            $params[] = $tipo;
            $param_count++;
        }
        $query .= " AND p.tipo_de_mercancia IN (" . implode(',', $placeholders) . ")";
    }
    
    // Filtro por tipo de embalaje (múltiple)
    if (!empty($filtro_tipo_embalaje)) {
        $placeholders = array();
        foreach ($filtro_tipo_embalaje as $tipo) {
            $placeholders[] = "$" . $param_count;
            $params[] = $tipo;
            $param_count++;
        }
        $query .= " AND p.tipo_de_embalaje IN (" . implode(',', $placeholders) . ")";
    }
    
    // Filtro por rango de peso (múltiple)
    if (!empty($filtro_rango_peso)) {
        $condiciones_peso = array();
        foreach ($filtro_rango_peso as $rango) {
            switch ($rango) {
                case '0-10':
                    $condiciones_peso[] = "(p.peso >= 0 AND p.peso <= 10)";
                    break;
                case '10-50':
                    $condiciones_peso[] = "(p.peso > 10 AND p.peso <= 50)";
                    break;
                case '50-100':
                    $condiciones_peso[] = "(p.peso > 50 AND p.peso <= 100)";
                    break;
                case '100-500':
                    $condiciones_peso[] = "(p.peso > 100 AND p.peso <= 500)";
                    break;
                case '500+':
                    $condiciones_peso[] = "(p.peso > 500)";
                    break;
            }
        }
        if (!empty($condiciones_peso)) {
            $query .= " AND (" . implode(' OR ', $condiciones_peso) . ")";
        }
    }
    
    $query .= " ORDER BY p.nombre_producto ASC";
    
    // Ejecutar consulta
    if (empty($params)) {
        $resultado = pg_query($conn, $query);
    } else {
        $resultado = pg_query_params($conn, $query, $params);
    }
    
    if (!$resultado) {
        throw new Exception('Error al ejecutar la consulta: ' . pg_last_error($conn));
    }
    
    // Obtener resultados
    $productos = array();
    while ($row = pg_fetch_assoc($resultado)) {
        $productos[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'productos' => $productos,
        'total' => count($productos)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

// Cerrar conexión
if (isset($conn)) {
    pg_close($conn);
}
?>