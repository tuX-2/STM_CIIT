<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/config/conexion.php';
header('Content-Type: application/json');

try {
    // Si hay una clave enviada
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['clave_usuario'])) {
        $clave = trim($_POST['clave_usuario']);

        // Buscar datos en la tabla personal
        $sql_personal = "SELECT id_personal, nombre_personal, apellido_paterno, apellido_materno 
                         FROM personal 
                         WHERE curp = :clave";

        $stmt = $pdo->prepare($sql_personal);
        $stmt->execute(['clave' => $clave]);
        $personal = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$personal) {
            echo json_encode(['success' => false, 'message' => 'No se encontró ningún registro en la tabla Personal con esa clave.']);
            exit;
        }

        $id_personal = $personal['id_personal'];
        $nombre_completo = trim($personal['nombre_personal'] . ' ' . $personal['apellido_paterno'] . ' ' . $personal['apellido_materno']);

        // Buscar datos del usuario
        $sql_usuario = "SELECT nombre_usuario, correo_electronico 
                        FROM usuarios 
                        WHERE identificador_de_rh = :id_personal";

        $stmt = $pdo->prepare($sql_usuario);
        $stmt->execute(['id_personal' => $id_personal]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$usuario) {
            echo json_encode(['success' => false, 'message' => 'No se encontró ningún usuario asociado a esa clave.']);
            exit;
        }

        $resultado = [
            'nombre_usuario' => $usuario['nombre_usuario'],
            'correo' => $usuario['correo_electronico'],
            'nombre_completo' => $nombre_completo,
            'clave_identificacion' => $clave
        ];

        echo json_encode(['success' => true, 'data' => [$resultado]]);
    } 
    // Si no hay clave → devolver todos los usuarios
    else {
        $sql = "SELECT 
                    u.nombre_usuario,
                    u.correo_electronico AS correo,
                    CONCAT(p.nombre_personal, ' ', p.apellido_paterno, ' ', p.apellido_materno) AS nombre_completo,
                    p.curp AS clave_identificacion
                FROM usuarios u
                JOIN personal p ON u.identificador_de_rh = p.id_personal
                ORDER BY p.nombre_personal";

        $stmt = $pdo->query($sql);
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => $usuarios]);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error en la consulta: ' . $e->getMessage()]);
}
