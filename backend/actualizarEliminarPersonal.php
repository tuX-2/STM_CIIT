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

    case 'eliminarPersonal':
        eliminarPersonal($pdo);
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

// ============================================
// FUNCIÓN: Eliminar personal por ID
// ============================================
function eliminarPersonal($pdo) {
    // Obtener ID del POST
    $id_personal = $_POST['id_personal'] ?? '';
    
    // Validar que se proporcione el ID
    if (empty($id_personal)) {
        echo json_encode(['success' => false, 'message' => 'ID de personal no proporcionado']);
        return;
    }
    
    try {
        // Verificar que el personal existe y obtener su cargo
        $checkQuery = "SELECT id_personal, nombre_personal, apellido_paterno, curp, cargo 
                       FROM personal 
                       WHERE id_personal = :id";
        $checkStmt = $pdo->prepare($checkQuery);
        $checkStmt->bindParam(':id', $id_personal, PDO::PARAM_INT);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() == 0) {
            echo json_encode(['success' => false, 'message' => 'Personal no encontrado']);
            return;
        }
        
        $personal = $checkStmt->fetch(PDO::FETCH_ASSOC);
        $esCliente = ($personal['cargo'] === 'Cliente');
        
        // Verificar cuántos usuarios tiene asociados
        $checkUsuarios = $pdo->prepare("SELECT COUNT(*) as total FROM usuarios WHERE identificador_de_rh = :id");
        $checkUsuarios->bindParam(':id', $id_personal, PDO::PARAM_INT);
        $checkUsuarios->execute();
        $totalUsuarios = $checkUsuarios->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Si NO es cliente, verificar referencias en tablas operativas
        if (!$esCliente) {
            $referencias = [];
            
            // Verificar en vehiculos (como chofer)
            $checkVehiculos = $pdo->prepare("SELECT COUNT(*) as total FROM vehiculos WHERE chofer_asignado = :id");
            $checkVehiculos->bindParam(':id', $id_personal, PDO::PARAM_INT);
            $checkVehiculos->execute();
            $totalVehiculos = $checkVehiculos->fetch(PDO::FETCH_ASSOC)['total'];
            if ($totalVehiculos > 0) {
                $referencias[] = "$totalVehiculos vehículo(s) como chofer";
            }
            
            // Verificar en carrocerias (como responsable)
            $checkCarrocerias = $pdo->prepare("SELECT COUNT(*) as total FROM carrocerias WHERE responsable_carroceria = :id");
            $checkCarrocerias->bindParam(':id', $id_personal, PDO::PARAM_INT);
            $checkCarrocerias->execute();
            $totalCarrocerias = $checkCarrocerias->fetch(PDO::FETCH_ASSOC)['total'];
            if ($totalCarrocerias > 0) {
                $referencias[] = "$totalCarrocerias carrocería(s) como responsable";
            }
            
            // Verificar en envios (como personal asignado)
            $checkEnviosAsignado = $pdo->prepare("SELECT COUNT(*) as total FROM envios WHERE personal_asignado = :id");
            $checkEnviosAsignado->bindParam(':id', $id_personal, PDO::PARAM_INT);
            $checkEnviosAsignado->execute();
            $totalEnviosAsignado = $checkEnviosAsignado->fetch(PDO::FETCH_ASSOC)['total'];
            if ($totalEnviosAsignado > 0) {
                $referencias[] = "$totalEnviosAsignado envío(s) como personal asignado";
            }
            
            // Verificar en envios (como personal verifica)
            $checkEnviosVerifica = $pdo->prepare("SELECT COUNT(*) as total FROM envios WHERE personal_verifica = :id");
            $checkEnviosVerifica->bindParam(':id', $id_personal, PDO::PARAM_INT);
            $checkEnviosVerifica->execute();
            $totalEnviosVerifica = $checkEnviosVerifica->fetch(PDO::FETCH_ASSOC)['total'];
            if ($totalEnviosVerifica > 0) {
                $referencias[] = "$totalEnviosVerifica envío(s) como personal verificador";
            }
            
            // Si tiene referencias operativas, no permitir eliminar
            if (!empty($referencias)) {
                $mensaje = "No se puede eliminar este personal porque tiene los siguientes registros operativos asociados:\n\n";
                $mensaje .= "• " . implode("\n• ", $referencias);
                $mensaje .= "\n\nDebe eliminar o reasignar estos registros primero.";
                
                echo json_encode([
                    'success' => false, 
                    'message' => $mensaje,
                    'referencias' => $referencias
                ]);
                return;
            }
        }
        
        // Iniciar transacción para eliminar
        $pdo->beginTransaction();
        
        try {
            // Si es cliente, eliminar usuarios manualmente (para asegurar que se eliminen)
            if ($esCliente && $totalUsuarios > 0) {
                $deleteUsuarios = $pdo->prepare("DELETE FROM usuarios WHERE identificador_de_rh = :id");
                $deleteUsuarios->bindParam(':id', $id_personal, PDO::PARAM_INT);
                $deleteUsuarios->execute();
            }
            
            // Eliminar el personal
            $deleteQuery = "DELETE FROM personal WHERE id_personal = :id";
            $deleteStmt = $pdo->prepare($deleteQuery);
            $deleteStmt->bindParam(':id', $id_personal, PDO::PARAM_INT);
            $deleteStmt->execute();
            
            // Confirmar transacción
            $pdo->commit();
            
            // Mensaje de éxito
            $mensaje = 'Registro de personal eliminado correctamente';
            if ($totalUsuarios > 0) {
                $mensaje .= ". También se eliminó(aron) $totalUsuarios usuario(s) asociado(s)";
            }
            
            echo json_encode([
                'success' => true, 
                'message' => $mensaje,
                'data' => [
                    'nombre' => $personal['nombre_personal'],
                    'apellido' => $personal['apellido_paterno'],
                    'curp' => $personal['curp'],
                    'cargo' => $personal['cargo'],
                    'usuarios_eliminados' => $totalUsuarios
                ]
            ]);
            
        } catch (Exception $e) {
            // Revertir si hay error
            $pdo->rollBack();
            throw $e;
        }
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}
?>