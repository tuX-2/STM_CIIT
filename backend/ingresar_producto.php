<?php
// ajax/ingresar_producto.php

// Configuración de errores
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

session_start();
header('Content-Type: application/json');

// --------------------------------------
// 1️⃣ Conexión con la base de datos (PDO)
// --------------------------------------
try {
    require_once __DIR__ . '/config/conexion.php'; // debe definir $pdo
    if (!$pdo) {
        throw new Exception('No se pudo establecer la conexión con la base de datos.');
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error de conexión: ' . $e->getMessage()]);
    exit;
}

// --------------------------------------
// 2️⃣ Captura y validación de datos
// --------------------------------------
try {
    // Obtener datos del formulario
    $nombre_producto = trim($_POST['nombre_producto'] ?? '');
    $ubicacion_producto = intval($_POST['ubicacion_producto'] ?? 0);
    $peso = floatval($_POST['peso'] ?? 0);
    $altura = floatval($_POST['altura'] ?? 0);
    $cajas_por_cama = intval($_POST['cajas_por_cama'] ?? 0);
    $camas_por_pallet = intval($_POST['camas_por_pallet'] ?? 0);
    $peso_soportado = floatval($_POST['peso_soportado'] ?? 0);
    $peso_volumetrico = floatval($_POST['peso_volumetrico'] ?? 0);
    $unidades_existencia = floatval($_POST['unidades_existencia'] ?? 0);
    $tipo_de_embalaje = trim($_POST['tipo_de_embalaje'] ?? '');
    $tipo_de_mercancia = trim($_POST['tipo_de_mercancia'] ?? '');

    // -------------------------
    // Validaciones del servidor
    // -------------------------
    if (empty($nombre_producto)) throw new Exception('El nombre del producto es obligatorio.');
    if (!preg_match('/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]+$/', $nombre_producto)) throw new Exception('Debe ingresar un nombre de producto válido.');
    if (empty($ubicacion_producto)) throw new Exception('Es obligatoria la selección de una localidad.');
    if ($peso <= 0) throw new Exception('El peso debe ser un número válido y mayor a 0 kg.');
    if ($altura <= 0) throw new Exception('La altura debe ser mayor a 0 metros.');
    if ($cajas_por_cama <= 0) throw new Exception('Ingrese un número válido de cajas por cama.');
    if ($camas_por_pallet <= 0) throw new Exception('Ingrese un número válido de camas por pallet.');
    if ($peso_soportado <= 0) throw new Exception('El peso soportado debe ser positivo.');
    if ($peso_volumetrico <= 0) throw new Exception('No se pudo calcular el peso volumétrico. Verifique los campos de peso o dimensiones.');
    if ($unidades_existencia < 0) throw new Exception('Ingrese un número válido para las unidades en existencia.');
    if (empty($tipo_de_embalaje)) throw new Exception('Seleccione un tipo de embalaje válido.');
    if (empty($tipo_de_mercancia)) throw new Exception('Seleccione un tipo de mercancía válida.');

    // --------------------------------------
    // 3️⃣ Verificar duplicados (nombre + ubicación)
    // --------------------------------------
    $query_verificar = "
        SELECT COUNT(*) AS total, l.nombre_centro_trabajo
        FROM productos p
        INNER JOIN localidades l ON p.ubicacion_producto = l.id_localidad
        WHERE p.nombre_producto = :nombre AND p.ubicacion_producto = :ubicacion
        GROUP BY l.nombre_centro_trabajo
    ";

    $stmt = $pdo->prepare($query_verificar);
    $stmt->execute([
        ':nombre' => $nombre_producto,
        ':ubicacion' => $ubicacion_producto
    ]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row && $row['total'] > 0) {
        $nombre_localidad = $row['nombre_centro_trabajo'];
        throw new Exception("Ya existe un producto con ese nombre en {$nombre_localidad}.");
    }

    // --------------------------------------
    // 4️⃣ Insertar producto (transacción)
    // --------------------------------------
    $pdo->beginTransaction();

    $query_insertar = "
        INSERT INTO productos (
            nombre_producto,
            ubicacion_producto,
            peso,
            altura,
            cajas_por_cama,
            camas_por_pallet,
            peso_soportado,
            peso_volumetrico,
            unidades_existencia,
            tipo_de_embalaje,
            tipo_de_mercancia
        ) VALUES (
            :nombre, :ubicacion, :peso, :altura, :cajas, :camas, :soportado, :volumetrico, :existencia, :embalaje, :mercancia
        ) RETURNING id_producto
    ";

    $stmt_insertar = $pdo->prepare($query_insertar);
    $stmt_insertar->execute([
        ':nombre' => $nombre_producto,
        ':ubicacion' => $ubicacion_producto,
        ':peso' => $peso,
        ':altura' => $altura,
        ':cajas' => $cajas_por_cama,
        ':camas' => $camas_por_pallet,
        ':soportado' => $peso_soportado,
        ':volumetrico' => $peso_volumetrico,
        ':existencia' => $unidades_existencia,
        ':embalaje' => $tipo_de_embalaje,
        ':mercancia' => $tipo_de_mercancia
    ]);

    $producto_insertado = $stmt_insertar->fetch(PDO::FETCH_ASSOC);
    $pdo->commit();

    // --------------------------------------
    // 5️⃣ Respuesta JSON de éxito
    // --------------------------------------
    echo json_encode([
        'success' => true,
        'message' => 'Producto ingresado correctamente.',
        'id_producto' => $producto_insertado['id_producto'] ?? null
    ]);
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
