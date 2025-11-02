<?php
// ajax/guardar_producto.php
session_start();
header('Content-Type: application/json');

// Verificar que el usuario tenga permisos
$roles_permitidos = ['Autoridad', 'Administrador del TMS', 'Operador Logistico', 'Jefe de Almacén'];
if (!isset($_SESSION['rol']) || !in_array($_SESSION['rol'], $roles_permitidos)) {
    echo json_encode(['success' => false, 'error' => 'No tiene permisos para realizar esta acción']);
    exit;
}

// Incluir archivo de conexión
require_once 'config/conexion.php';

try {
    // Obtener y validar datos del formulario
    $nombre_producto = trim($_POST['nombre_producto']);
    $ubicacion_producto = $_POST['ubicacion_producto'];
    $peso = floatval($_POST['peso']);
    $altura = floatval($_POST['altura']);
    $largo = floatval($_POST['largo']);
    $ancho = floatval($_POST['ancho']);
    $cajas_por_cama = intval($_POST['cajas_por_cama']);
    $cajas_por_pallet = intval($_POST['cajas_por_pallet']);
    $peso_soportado = floatval($_POST['peso_soportado']);
    $peso_volumetrico = floatval($_POST['peso_volumetrico']);
    $unidades_existencia = intval($_POST['unidades_existencia']);
    $tipo_de_embalaje = $_POST['tipo_de_embalaje'];
    $tipo_de_mercancia = $_POST['tipo_de_mercancia'];
    
    // Validaciones del lado del servidor
    if (empty($nombre_producto)) {
        throw new Exception('El nombre del producto es obligatorio.');
    }
    
    if (!preg_match('/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]+$/', $nombre_producto)) {
        throw new Exception('Debe ingresar un nombre de producto válido.');
    }
    
    if (empty($ubicacion_producto)) {
        throw new Exception('Es obligatoria la selección de una localidad.');
    }
    
    if ($peso <= 0) {
        throw new Exception('El peso debe ser un número válido y mayor a 0 kilogramos');
    }
    
    if ($altura <= 0) {
        throw new Exception('La altura debe ser mayor a 0 metros.');
    }
    
    if ($largo <= 0) {
        throw new Exception('El largo debe ser mayor a 0 metros.');
    }
    
    if ($ancho <= 0) {
        throw new Exception('El ancho debe ser mayor a 0 metros.');
    }
    
    if ($cajas_por_cama <= 0) {
        throw new Exception('Ingrese un número válido de cajas por cama.');
    }
    
    if ($cajas_por_pallet <= 0) {
        throw new Exception('Ingrese un número válido de camas por pallet.');
    }
    
    if ($peso_soportado <= 0) {
        throw new Exception('El peso soportado debe ser positivo.');
    }
    
    if ($peso_volumetrico <= 0) {
        throw new Exception('No se pudo calcular el peso volumétrico. Verifique los campos de peso o dimensiones');
    }
    
    if ($unidades_existencia < 0) {
        throw new Exception('Ingrese un número válido para las unidades en existencia.');
    }
    
    if (empty($tipo_de_embalaje)) {
        throw new Exception('Seleccione un tipo de embalaje válido.');
    }
    
    if (empty($tipo_de_mercancia)) {
        throw new Exception('Seleccione un tipo de mercancía válida.');
    }
    
    // Verificar que no exista un producto con el mismo nombre en la misma ubicación
    $query_verificar = "SELECT COUNT(*) as total FROM productos 
                        WHERE nombre_producto = $1 AND ubicacion_producto = $2";
    $resultado = pg_query_params($conn, $query_verificar, array($nombre_producto, $ubicacion_producto));
    $row = pg_fetch_assoc($resultado);
    
    if ($row['total'] > 0) {
        throw new Exception('Ya existe un producto con ese nombre en la ubicación seleccionada');
    }
    
    // Iniciar transacción
    pg_query($conn, "BEGIN");
    
    // Insertar el producto
    $query_insertar = "INSERT INTO productos (
        nombre_producto, 
        ubicacion_producto, 
        peso, 
        altura, 
        largo, 
        ancho, 
        cajas_por_cama, 
        cajas_por_pallet, 
        peso_soportado, 
        peso_volumetrico, 
        unidades_existencia, 
        tipo_de_embalaje, 
        tipo_de_mercancia
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id_producto";
    
    $resultado_insertar = pg_query_params($conn, $query_insertar, array(
        $nombre_producto,
        $ubicacion_producto,
        $peso,
        $altura,
        $largo,
        $ancho,
        $cajas_por_cama,
        $cajas_por_pallet,
        $peso_soportado,
        $peso_volumetrico,
        $unidades_existencia,
        $tipo_de_embalaje,
        $tipo_de_mercancia
    ));
    
    if (!$resultado_insertar) {
        throw new Exception('Error al insertar el producto: ' . pg_last_error($conn));
    }
    
    $producto_insertado = pg_fetch_assoc($resultado_insertar);
    
    // Confirmar transacción
    pg_query($conn, "COMMIT");
    
    echo json_encode([
        'success' => true, 
        'message' => 'Producto ingresado correctamente.',
        'id_producto' => $producto_insertado['id_producto']
    ]);
    
} catch (Exception $e) {
    // Revertir transacción en caso de error
    if (isset($conn)) {
        pg_query($conn, "ROLLBACK");
    }
    
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