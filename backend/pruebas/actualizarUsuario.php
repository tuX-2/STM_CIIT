<?php
// Configuración de errores para JSON
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Header JSON
header('Content-Type: application/json; charset=utf-8');

// Función para enviar respuesta JSON y terminar
function sendJsonResponse($success, $message, $data = null) {
    $response = array('success' => $success, 'message' => $message);
    if ($data !== null) {
        $response['data'] = $data;
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

// Incluir archivo de conexión - AJUSTA LA RUTA SEGÚN TU ESTRUCTURA
// Opción 1: Si el archivo está en backend/pruebas/
$rutaConexion = '../config/conexion.php';

// Opción 2: Si necesitas ruta absoluta
// $rutaConexion = __DIR__ . '/../config/conexion.php';

if (!file_exists($rutaConexion)) {
    sendJsonResponse(false, 'Archivo de conexión no encontrado en: ' . $rutaConexion);
}

require_once $rutaConexion;

// Verificar conexión PDO
if (!isset($pdo)) {
    sendJsonResponse(false, 'Error: No se pudo establecer la conexión a la base de datos');
}

// Configurar PDO para excepciones
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Determinar acción (compatible con PHP 5.x)
$accion = '';
if (isset($_GET['accion'])) {
    $accion = $_GET['accion'];
} elseif (isset($_POST['accion'])) {
    $accion = $_POST['accion'];
}

try {
    switch ($accion) {
        case 'obtenerUsuario':
            obtenerUsuario($pdo);
            break;
        
        case 'obtenerPersonal':
            obtenerPersonal($pdo);
            break;
        
        case 'actualizarUsuario':
            actualizarUsuario($pdo);
            break;
        
        default:
            sendJsonResponse(false, 'Acción no válida: ' . htmlspecialchars($accion));
            break;
    }
} catch (Exception $e) {
    error_log('Error en actualizarUsuario.php: ' . $e->getMessage());
    sendJsonResponse(false, 'Error del servidor: ' . $e->getMessage());
}

// ============================================
// FUNCIÓN: Obtener datos de usuario por nombre de usuario
// ============================================
function obtenerUsuario($pdo) {
    $nombreUsuario = isset($_GET['nombre_usuario']) ? trim($_GET['nombre_usuario']) : '';
    
    if (empty($nombreUsuario)) {
        sendJsonResponse(false, 'Nombre de usuario no proporcionado');
    }
    
    try {
        $query = "SELECT 
                    u.id_usuario, 
                    u.nombre_usuario, 
                    u.correo_electronico, 
                    u.identificador_de_rh, 
                    p.nombre_personal, 
                    p.apellido_paterno, 
                    p.apellido_materno
                  FROM usuarios u
                  LEFT JOIN personal p ON u.identificador_de_rh = p.id_personal
                  WHERE u.nombre_usuario = :nombre_usuario";
        
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':nombre_usuario', $nombreUsuario, PDO::PARAM_STR);
        $stmt->execute();
        
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($usuario) {
            sendJsonResponse(true, 'Usuario encontrado', $usuario);
        } else {
            sendJsonResponse(false, 'Usuario no encontrado: ' . htmlspecialchars($nombreUsuario));
        }
    } catch (PDOException $e) {
        error_log('Error en obtenerUsuario: ' . $e->getMessage());
        sendJsonResponse(false, 'Error al consultar usuario: ' . $e->getMessage());
    }
}

// ============================================
// FUNCIÓN: Obtener todo el personal disponible
// ============================================
function obtenerPersonal($pdo) {
    try {
        $query = "SELECT 
                    id_personal, 
                    CONCAT(
                        nombre_personal, ' ', 
                        apellido_paterno, 
                        CASE WHEN apellido_materno IS NOT NULL AND apellido_materno != '' 
                             THEN CONCAT(' ', apellido_materno) 
                             ELSE '' 
                        END
                    ) as nombre_completo
                  FROM personal 
                  ORDER BY nombre_personal, apellido_paterno";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        
        $personal = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($personal)) {
            sendJsonResponse(false, 'No hay personal registrado en el sistema');
        }
        
        sendJsonResponse(true, 'Personal obtenido correctamente', $personal);
    } catch (PDOException $e) {
        error_log('Error en obtenerPersonal: ' . $e->getMessage());
        sendJsonResponse(false, 'Error al consultar personal: ' . $e->getMessage());
    }
}

// ============================================
// FUNCIÓN: Actualizar datos del usuario
// ============================================
function actualizarUsuario($pdo) {
    // Obtener y limpiar datos del POST (compatible con PHP 5.x)
    $nombreUsuario = isset($_POST['nombre_usuario']) ? trim($_POST['nombre_usuario']) : '';
    $correoElectronico = isset($_POST['correo_electronico']) ? trim($_POST['correo_electronico']) : '';
    $identificadorRh = isset($_POST['identificador_de_rh']) ? trim($_POST['identificador_de_rh']) : '';
    $contrasena = isset($_POST['contrasena']) ? $_POST['contrasena'] : '';
    
    // Validar datos requeridos
    if (empty($nombreUsuario)) {
        sendJsonResponse(false, 'El nombre de usuario es obligatorio');
    }
    
    if (empty($correoElectronico)) {
        sendJsonResponse(false, 'El correo electrónico es obligatorio');
    }
    
    if (empty($identificadorRh)) {
        sendJsonResponse(false, 'Debe seleccionar un personal asociado');
    }
    
    // Validar formato de correo electrónico
    if (!filter_var($correoElectronico, FILTER_VALIDATE_EMAIL)) {
        sendJsonResponse(false, 'El correo electrónico no tiene un formato válido');
    }
    
    // Validar contraseña si se proporciona
    if (!empty($contrasena) && strlen($contrasena) < 6) {
        sendJsonResponse(false, 'La contraseña debe tener al menos 6 caracteres');
    }
    
    try {
        // Iniciar transacción
        $pdo->beginTransaction();
        
        // Verificar que el usuario existe
        $checkQuery = "SELECT id_usuario FROM usuarios WHERE nombre_usuario = :nombre_usuario";
        $checkStmt = $pdo->prepare($checkQuery);
        $checkStmt->bindParam(':nombre_usuario', $nombreUsuario, PDO::PARAM_STR);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() == 0) {
            $pdo->rollBack();
            sendJsonResponse(false, 'El usuario no existe en el sistema');
        }
        
        // Verificar que el personal existe
        $checkPersonalQuery = "SELECT id_personal FROM personal WHERE id_personal = :id_personal";
        $checkPersonalStmt = $pdo->prepare($checkPersonalQuery);
        $checkPersonalStmt->bindParam(':id_personal', $identificadorRh, PDO::PARAM_INT);
        $checkPersonalStmt->execute();
        
        if ($checkPersonalStmt->rowCount() == 0) {
            $pdo->rollBack();
            sendJsonResponse(false, 'El personal seleccionado no existe');
        }
        
        // Verificar si el correo ya está en uso por otro usuario
        $checkEmailQuery = "SELECT id_usuario FROM usuarios 
                           WHERE correo_electronico = :correo 
                           AND nombre_usuario != :nombre_usuario";
        $checkEmailStmt = $pdo->prepare($checkEmailQuery);
        $checkEmailStmt->bindParam(':correo', $correoElectronico, PDO::PARAM_STR);
        $checkEmailStmt->bindParam(':nombre_usuario', $nombreUsuario, PDO::PARAM_STR);
        $checkEmailStmt->execute();
        
        if ($checkEmailStmt->rowCount() > 0) {
            $pdo->rollBack();
            sendJsonResponse(false, 'El correo electrónico ya está siendo usado por otro usuario');
        }
        
        // Preparar query de actualización
        if (!empty($contrasena)) {
            $updateQuery = "UPDATE usuarios 
                           SET correo_electronico = :correo, 
                               identificador_de_rh = :identificador,
                               contrasena = :contrasena
                           WHERE nombre_usuario = :nombre_usuario";
        } else {
            $updateQuery = "UPDATE usuarios 
                           SET correo_electronico = :correo, 
                               identificador_de_rh = :identificador
                           WHERE nombre_usuario = :nombre_usuario";
        }
        
        $stmt = $pdo->prepare($updateQuery);
        $stmt->bindParam(':correo', $correoElectronico, PDO::PARAM_STR);
        $stmt->bindParam(':identificador', $identificadorRh, PDO::PARAM_INT);
        $stmt->bindParam(':nombre_usuario', $nombreUsuario, PDO::PARAM_STR);
        
        if (!empty($contrasena)) {
            // Hashear la contraseña antes de guardarla
            $contrasenaHash = password_hash($contrasena, PASSWORD_DEFAULT);
            $stmt->bindParam(':contrasena', $contrasenaHash, PDO::PARAM_STR);
        }
        
        $stmt->execute();
        
        // Verificar que se actualizó al menos un registro
        if ($stmt->rowCount() > 0) {
            $pdo->commit();
            sendJsonResponse(true, 'Usuario actualizado correctamente');
        } else {
            $pdo->rollBack();
            sendJsonResponse(false, 'No se realizaron cambios. Los datos son idénticos a los actuales');
        }
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('Error en actualizarUsuario: ' . $e->getMessage());
        sendJsonResponse(false, 'Error al actualizar usuario: ' . $e->getMessage());
    }
}
?>