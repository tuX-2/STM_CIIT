<?php
// ===============================
// INCLUIR ARCHIVO DE CONEXIÓN          AUN NO COMPILA PERO MAÑANA 03/11/2925 ya queda profe , lo prometo
// ===============================
require_once __DIR__ . '/../config/conexion.php';

// ===============================
// CONFIGURACIÓN DE ERRORES Y HEADERS
// ===============================
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');

// ===============================
// FUNCIÓN PARA ENVIAR RESPUESTAS JSON
// ===============================
function enviarRespuesta($success, $message, $data = null, $httpCode = 200) {
    http_response_code($httpCode);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ===============================
// FUNCIÓN PARA SANITIZAR ENTRADA
// ===============================
function sanitizarTexto($texto) {
    if (empty($texto)) {
        return null;
    }
    return trim(strip_tags($texto));
}

// ===============================
// VALIDAR CAMPOS OBLIGATORIOS
// ===============================
function validarCamposObligatorios($datos) {
    $errores = [];
    
    // Nombre Centro de Trabajo
    if (empty($datos['nombre_centro_trabajo']) || strlen(trim($datos['nombre_centro_trabajo'])) < 3) {
        $errores[] = 'El nombre del centro de trabajo es obligatorio y debe tener al menos 3 caracteres';
    }
    
    // Población
    if (empty($datos['poblacion']) || strlen(trim($datos['poblacion'])) < 3) {
        $errores[] = 'La población es obligatoria y debe tener al menos 3 caracteres';
    }
    
    // Localidad
    if (empty($datos['localidad']) || strlen(trim($datos['localidad'])) < 3) {
        $errores[] = 'La localidad es obligatoria y debe tener al menos 3 caracteres';
    }
    
    // Estado
    if (empty($datos['estado']) || strlen(trim($datos['estado'])) < 3) {
        $errores[] = 'El estado es obligatorio y debe tener al menos 3 caracteres';
    }
    
    // Tipo de Instalación
    $tiposValidos = ['Centro Productivo', 'Centro de Distribucion', 'PODEBI', 'Almacen'];
    if (empty($datos['tipo_instalacion']) || !in_array($datos['tipo_instalacion'], $tiposValidos)) {
        $errores[] = 'Debe seleccionar un tipo de instalación válido';
    }
    
    return $errores;
}

// ===============================
// BUSCAR LOCALIDAD
// ===============================
function buscarLocalidad($pdo) {
    try {
        $query = "SELECT * FROM localidades WHERE 1=1";
        $params = [];
        
        // Búsqueda por ID
        if (isset($_GET['id']) && !empty($_GET['id'])) {
            $query .= " AND id_localidad = :id";
            $params[':id'] = intval($_GET['id']);
        }
        
        // Búsqueda por nombre
        if (isset($_GET['nombre']) && !empty($_GET['nombre'])) {
            $query .= " AND LOWER(nombre_centro_trabajo) LIKE LOWER(:nombre)";
            $params[':nombre'] = '%' . sanitizarTexto($_GET['nombre']) . '%';
        }
        
        // Búsqueda por localidad
        if (isset($_GET['localidad']) && !empty($_GET['localidad'])) {
            $query .= " AND LOWER(localidad) LIKE LOWER(:localidad)";
            $params[':localidad'] = '%' . sanitizarTexto($_GET['localidad']) . '%';
        }
        
        // Búsqueda por población
        if (isset($_GET['poblacion']) && !empty($_GET['poblacion'])) {
            $query .= " AND LOWER(poblacion) LIKE LOWER(:poblacion)";
            $params[':poblacion'] = '%' . sanitizarTexto($_GET['poblacion']) . '%';
        }
        
        // Búsqueda por estado
        if (isset($_GET['estado']) && !empty($_GET['estado'])) {
            $query .= " AND LOWER(estado) LIKE LOWER(:estado)";
            $params[':estado'] = '%' . sanitizarTexto($_GET['estado']) . '%';
        }
        
        // Limitar a 1 resultado si se busca por ID
        if (isset($_GET['id'])) {
            $query .= " LIMIT 1";
        } else {
            // Si no es por ID, ordenar y limitar a 10 resultados
            $query .= " ORDER BY nombre_centro_trabajo ASC LIMIT 10";
        }
        
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($resultado) {
            // Si se busca por ID, devolver único resultado
            if (isset($_GET['id'])) {
                enviarRespuesta(true, 'Localidad encontrada', $resultado);
            } else {
                // Si hay múltiples resultados, devolver el primero
                enviarRespuesta(true, 'Localidad encontrada', $resultado);
            }
        } else {
            enviarRespuesta(false, 'No se encontró ninguna localidad con los criterios especificados', null, 404);
        }
        
    } catch (PDOException $e) {
        error_log("Error en buscarLocalidad: " . $e->getMessage());
        enviarRespuesta(false, 'Error al buscar la localidad', null, 500);
    }
}

// ===============================
// ACTUALIZAR LOCALIDAD
// ===============================
function actualizarLocalidad($pdo) {
    try {
        // Obtener datos JSON del cuerpo de la petición
        $json = file_get_contents('php://input');
        $datos = json_decode($json, true);
        
        if (!$datos) {
            enviarRespuesta(false, 'Datos inválidos', null, 400);
        }
        
        // Validar que existe el ID
        if (!isset($datos['id_localidad']) || empty($datos['id_localidad'])) {
            enviarRespuesta(false, 'ID de localidad no especificado', null, 400);
        }
        
        // Sanitizar datos
        $id = intval($datos['id_localidad']);
        $nombreCentro = sanitizarTexto($datos['nombre_centro_trabajo']);
        $ubicacionGeo = sanitizarTexto($datos['ubicacion_georeferenciada']);
        $poblacion = sanitizarTexto($datos['poblacion']);
        $localidad = sanitizarTexto($datos['localidad']);
        $estado = sanitizarTexto($datos['estado']);
        $tipoInstalacion = sanitizarTexto($datos['tipo_instalacion']);
        
        // Crear array con datos sanitizados
        $datosSanitizados = [
            'id_localidad' => $id,
            'nombre_centro_trabajo' => $nombreCentro,
            'ubicacion_georeferenciada' => $ubicacionGeo,
            'poblacion' => $poblacion,
            'localidad' => $localidad,
            'estado' => $estado,
            'tipo_instalacion' => $tipoInstalacion
        ];
        
        // Validar campos obligatorios
        $errores = validarCamposObligatorios($datosSanitizados);
        if (!empty($errores)) {
            enviarRespuesta(false, implode('. ', $errores), null, 400);
        }
        
        // Verificar que la localidad existe
        $stmtCheck = $pdo->prepare("SELECT id_localidad FROM localidades WHERE id_localidad = :id");
        $stmtCheck->execute([':id' => $id]);
        
        if (!$stmtCheck->fetch(PDO::FETCH_ASSOC)) {
            enviarRespuesta(false, 'La localidad especificada no existe', null, 404);
        }
        
        // Preparar query de actualización
        $query = "UPDATE localidades SET 
                    nombre_centro_trabajo = :nombre_centro_trabajo,
                    ubicacion_georeferenciada = :ubicacion_georeferenciada,
                    poblacion = :poblacion,
                    localidad = :localidad,
                    estado = :estado,
                    tipo_instalacion = :tipo_instalacion
                  WHERE id_localidad = :id_localidad";
        
        $stmt = $pdo->prepare($query);
        
        // Ejecutar actualización
        $resultado = $stmt->execute([
            ':nombre_centro_trabajo' => $nombreCentro,
            ':ubicacion_georeferenciada' => $ubicacionGeo,
            ':poblacion' => $poblacion,
            ':localidad' => $localidad,
            ':estado' => $estado,
            ':tipo_instalacion' => $tipoInstalacion,
            ':id_localidad' => $id
        ]);
        
        if ($resultado) {
            // Obtener datos actualizados
            $stmtSelect = $pdo->prepare("SELECT * FROM localidades WHERE id_localidad = :id");
            $stmtSelect->execute([':id' => $id]);
            $datosActualizados = $stmtSelect->fetch(PDO::FETCH_ASSOC);
            
            enviarRespuesta(true, 'Localidad actualizada correctamente', $datosActualizados);
        } else {
            enviarRespuesta(false, 'No se pudo actualizar la localidad', null, 500);
        }
        
    } catch (PDOException $e) {
        error_log("Error en actualizarLocalidad: " . $e->getMessage());
        enviarRespuesta(false, 'Error al actualizar la localidad', null, 500);
    }
}

// ===============================
// VERIFICAR CONEXIÓN
// ===============================
if (!isset($pdo) || !$pdo) {
    enviarRespuesta(false, 'Error de conexión a la base de datos', null, 500);
}

// ===============================
// ROUTER PRINCIPAL
// ===============================

// Verificar método HTTP
$metodo = $_SERVER['REQUEST_METHOD'];

// Obtener acción
$accion = isset($_GET['accion']) ? $_GET['accion'] : '';

switch ($accion) {
    case 'buscar':
        if ($metodo !== 'GET') {
            enviarRespuesta(false, 'Método no permitido. Use GET', null, 405);
        }
        buscarLocalidad($pdo);
        break;
        
    case 'actualizar':
        if ($metodo !== 'POST') {
            enviarRespuesta(false, 'Método no permitido. Use POST', null, 405);
        }
        actualizarLocalidad($pdo);
        break;
        
    default:
        enviarRespuesta(false, 'Acción no válida', null, 400);
        break;
}

// Cerrar conexión
$pdo = null;
?>