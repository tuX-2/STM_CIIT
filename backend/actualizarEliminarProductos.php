<?php
// Evitar que se muestren errores HTML
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');

// Verificar que existe el archivo de conexión
$rutaConexion = __DIR__ . '/config/conexion.php';
if (!file_exists($rutaConexion)) {
    echo json_encode(['success' => false, 'message' => 'Archivo de conexión no encontrado']);
    exit;
}

require_once $rutaConexion;

// Verificar que la conexión PDO existe
if (!isset($pdo)) {
    echo json_encode(['success' => false, 'message' => 'Error: la variable $pdo no está definida']);
    exit;
}

// Obtener la acción solicitada
$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'obtener':
            // Obtener un producto específico por ID
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                echo json_encode(['success' => false, 'message' => 'ID no proporcionado']);
                exit;
            }
            
            $stmt = $pdo->prepare("SELECT * FROM productos WHERE id_producto = :id");
            $stmt->execute(['id' => $id]);
            $producto = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($producto) {
                echo json_encode(['success' => true, 'data' => $producto]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Producto no encontrado']);
            }
            break;
            
        case 'listar':
            // Listar todos los productos
            $stmt = $pdo->query("SELECT id_producto, nombre_producto FROM productos ORDER BY nombre_producto");
            $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $productos]);
            break;
            
        case 'actualizar':
            // Actualizar un producto
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id_producto'])) {
                echo json_encode(['success' => false, 'message' => 'ID del producto no proporcionado']);
                exit;
            }
            
            $sql = "UPDATE productos SET 
                    nombre_producto = :nombre_producto,
                    ubicacion_producto = :ubicacion_producto,
                    peso = :peso,
                    altura = :altura,
                    cajas_por_cama = :cajas_por_cama,
                    camas_por_pallet = :camas_por_pallet,
                    peso_soportado = :peso_soportado,
                    peso_volumetrico = :peso_volumetrico,
                    unidades_existencia = :unidades_existencia,
                    tipo_de_embalaje = :tipo_de_embalaje,
                    tipo_de_mercancia = :tipo_de_mercancia
                    WHERE id_producto = :id_producto";
            
            $stmt = $pdo->prepare($sql);
            $resultado = $stmt->execute([
                'id_producto' => $data['id_producto'],
                'nombre_producto' => $data['nombre_producto'],
                'ubicacion_producto' => $data['ubicacion_producto'],
                'peso' => $data['peso'],
                'altura' => $data['altura'],
                'cajas_por_cama' => $data['cajas_por_cama'],
                'camas_por_pallet' => $data['camas_por_pallet'],
                'peso_soportado' => $data['peso_soportado'],
                'peso_volumetrico' => $data['peso_volumetrico'],
                'unidades_existencia' => $data['unidades_existencia'],
                'tipo_de_embalaje' => $data['tipo_de_embalaje'],
                'tipo_de_mercancia' => $data['tipo_de_mercancia']
            ]);
            
            if ($resultado) {
                echo json_encode(['success' => true, 'message' => 'Producto actualizado correctamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Error al actualizar el producto']);
            }
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Acción no válida']);
            break;
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
?>