<?php
// RF-GU-04: Eliminación de Usuarios (Modificado para búsqueda por CURP)
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

// Incluir archivo de conexión
$rutaConexion = '../config/conexion.php';

if (!file_exists($rutaConexion)) {
    sendJsonResponse(false, 'Archivo de conexión no encontrado');
}

require_once $rutaConexion;

// Verificar conexión PDO
if (!isset($pdo)) {
    sendJsonResponse(false, 'Error: No se pudo establecer la conexión a la base de datos');
}

// Configurar PDO para excepciones
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Determinar acción
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
        
        case 'eliminarUsuario':
            eliminarUsuario($pdo);
            break;
        
        default:
            sendJsonResponse(false, 'Acción no válida');
            break;
    }
} catch (Exception $e) {
    error_log('Error en eliminarUsuario.php: ' . $e->getMessage());
    sendJsonResponse(false, 'Error del servidor: ' . $e->getMessage());
}

// ============================================
// FUNCIÓN: Obtener datos de usuario por CURP
// ============================================
function obtenerUsuario($pdo) {
    $curp = isset($_GET['curp']) ? trim(strtoupper($_GET['curp'])) : '';
    
    if (empty($curp)) {
        sendJsonResponse(false, 'CURP no proporcionada');
    }
    
    // Validar formato de CURP (18 caracteres)
    if (strlen($curp) !== 18) {
        sendJsonResponse(false, 'La CURP debe tener 18 caracteres');
    }
    
    // Validar formato básico de CURP con regex
    if (!preg_match('/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/', $curp)) {
        sendJsonResponse(false, 'Formato de CURP no válido');
    }
    
    try {
        $query = "SELECT 
                    u.id_usuario, 
                    u.nombre_usuario, 
                    u.correo_electronico, 
                    u.identificador_de_rh, 
                    p.nombre_personal, 
                    p.apellido_paterno, 
                    p.apellido_materno,
                    p.curp
                  FROM usuarios u
                  LEFT JOIN personal p ON u.identificador_de_rh = p.id_personal
                  WHERE UPPER(p.curp) = :curp";
        
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':curp', $curp, PDO::PARAM_STR);
        $stmt->execute();
        
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($usuario) {
            sendJsonResponse(true, 'Usuario encontrado', $usuario);
        } else {
            sendJsonResponse(false, 'No se encontró ningún usuario con la CURP: ' . $curp);
        }
    } catch (PDOException $e) {
        error_log('Error en obtenerUsuario: ' . $e->getMessage());
        sendJsonResponse(false, 'Error al consultar usuario: ' . $e->getMessage());
    }
}

// ============================================
// FUNCIÓN: Eliminar usuario
// ============================================
function eliminarUsuario($pdo) {
    $idUsuario = isset($_POST['id_usuario']) ? intval($_POST['id_usuario']) : 0;
    
    if ($idUsuario <= 0) {
        sendJsonResponse(false, 'ID de usuario no válido');
    }
    
    try {
        // Iniciar transacción
        $pdo->beginTransaction();
        
        // Verificar que el usuario existe y obtener información
        $checkQuery = "SELECT u.id_usuario, u.nombre_usuario, p.curp 
                      FROM usuarios u
                      LEFT JOIN personal p ON u.identificador_de_rh = p.id_personal
                      WHERE u.id_usuario = :id_usuario";
        $checkStmt = $pdo->prepare($checkQuery);
        $checkStmt->bindParam(':id_usuario', $idUsuario, PDO::PARAM_INT);
        $checkStmt->execute();
        
        $usuario = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$usuario) {
            $pdo->rollBack();
            sendJsonResponse(false, 'El usuario no existe en el sistema');
        }
        
        // Eliminar el usuario
        $deleteQuery = "DELETE FROM usuarios WHERE id_usuario = :id_usuario";
        $deleteStmt = $pdo->prepare($deleteQuery);
        $deleteStmt->bindParam(':id_usuario', $idUsuario, PDO::PARAM_INT);
        $deleteStmt->execute();
        
        // Verificar que se eliminó
        if ($deleteStmt->rowCount() > 0) {
            $pdo->commit();
            $mensaje = 'Usuario "' . $usuario['nombre_usuario'] . '"';
            if (!empty($usuario['curp'])) {
                $mensaje .= ' (CURP: ' . $usuario['curp'] . ')';
            }
            $mensaje .= ' eliminado correctamente';
            sendJsonResponse(true, $mensaje);
        } else {
            $pdo->rollBack();
            sendJsonResponse(false, 'No se pudo eliminar el usuario');
        }
        
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        
        // Verificar si es error de constraint (foreign key)
        if ($e->getCode() == '23503' || strpos($e->getMessage(), 'foreign key') !== false) {
            sendJsonResponse(false, 'No se puede eliminar el usuario porque tiene registros asociados en otras tablas del sistema');
        }
        
        error_log('Error en eliminarUsuario: ' . $e->getMessage());
        sendJsonResponse(false, 'Error al eliminar usuario: ' . $e->getMessage());
    }
}
?>