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

// Determinar qué acción realizar
$accion = $_GET['accion'] ?? $_POST['accion'] ?? '';

switch ($accion) {
    case 'obtenerPersonal':
        obtenerPersonal($pdo);
        break;
    
    case 'obtenerLocalidades':
        obtenerLocalidades($pdo);
        break;
    
    case 'actualizarPersonal':
        actualizarPersonal($pdo);
        break;
    
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
        break;
}

// ============================================
// FUNCIÓN: Obtener datos de personal por CURP
// ============================================
function obtenerPersonal($pdo) {
    $curp = $_GET['curp'] ?? '';
    
    if (empty($curp)) {
        echo json_encode(['success' => false, 'message' => 'CURP no proporcionada']);
        return;
    }
    
    try {
        $query = "SELECT id_personal, nombre_personal, apellido_paterno, 
                  apellido_materno, afiliacion_laboral, cargo, curp
                  FROM personal
                  WHERE curp = :curp";
        
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':curp', $curp, PDO::PARAM_STR);
        $stmt->execute();
        
        $personal = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($personal) {
            echo json_encode(['success' => true, 'data' => $personal]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Personal no encontrado']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

// ============================================
// FUNCIÓN: Obtener todas las localidades
// ============================================
function obtenerLocalidades($pdo) {
    try {
        $query = "SELECT id_localidad, nombre_centro_trabajo 
                  FROM localidades 
                  ORDER BY nombre_centro_trabajo";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        
        $localidades = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'data' => $localidades]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

// ============================================
// FUNCIÓN: Actualizar datos del personal
// ============================================
function actualizarPersonal($pdo) {
    // Obtener datos del POST
    $id_personal = $_POST['id_personal'] ?? '';
    $curp = $_POST['curp'] ?? '';
    $nombre_personal = $_POST['nombre_personal'] ?? '';
    $apellido_paterno = $_POST['apellido_paterno'] ?? '';
    $apellido_materno = $_POST['apellido_materno'] ?? '';
    $afiliacion_laboral = $_POST['afiliacion_laboral'] ?? '';
    $cargo = $_POST['cargo'] ?? '';
    
    // Validar datos requeridos
    if (empty($id_personal) || empty($curp) || empty($nombre_personal) || 
        empty($apellido_paterno) || empty($afiliacion_laboral) || empty($cargo)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos obligatorios deben estar completos']);
        return;
    }
    
    try {
        // Verificar que el personal existe por ID
        $checkQuery = "SELECT id_personal FROM personal WHERE id_personal = :id";
        $checkStmt = $pdo->prepare($checkQuery);
        $checkStmt->bindParam(':id', $id_personal, PDO::PARAM_INT);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() == 0) {
            echo json_encode(['success' => false, 'message' => 'Personal no encontrado']);
            return;
        }
        
        // Verificar que la nueva CURP no exista en otro registro
        $curpCheckQuery = "SELECT id_personal FROM personal WHERE curp = :curp AND id_personal != :id";
        $curpCheckStmt = $pdo->prepare($curpCheckQuery);
        $curpCheckStmt->bindParam(':curp', $curp, PDO::PARAM_STR);
        $curpCheckStmt->bindParam(':id', $id_personal, PDO::PARAM_INT);
        $curpCheckStmt->execute();
        
        if ($curpCheckStmt->rowCount() > 0) {
            echo json_encode(['success' => false, 'message' => 'La CURP ya existe en otro registro']);
            return;
        }
        
        // Actualizar datos (ahora incluye CURP)
        $updateQuery = "UPDATE personal 
                        SET curp = :curp,
                            nombre_personal = :nombre, 
                            apellido_paterno = :paterno, 
                            apellido_materno = :materno, 
                            afiliacion_laboral = :afiliacion, 
                            cargo = :cargo 
                        WHERE id_personal = :id";
        
        $stmt = $pdo->prepare($updateQuery);
        $stmt->bindParam(':curp', $curp, PDO::PARAM_STR);
        $stmt->bindParam(':nombre', $nombre_personal, PDO::PARAM_STR);
        $stmt->bindParam(':paterno', $apellido_paterno, PDO::PARAM_STR);
        $stmt->bindParam(':materno', $apellido_materno, PDO::PARAM_STR);
        $stmt->bindParam(':afiliacion', $afiliacion_laboral, PDO::PARAM_INT);
        $stmt->bindParam(':cargo', $cargo, PDO::PARAM_STR);
        $stmt->bindParam(':id', $id_personal, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Datos actualizados correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al actualizar los datos']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}
?>