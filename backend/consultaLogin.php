<?php
require_once __DIR__ . '/config/conexion.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    $nombre_usuario = $data->nombre_usuario;
    $email = $data->email;
    $password = $data->password;
    
    // Consulta SIN verificar contraseña aún
    $query = "SELECT id_usuario, nombre_usuario, correo_electronico, contrasena
              FROM usuarios 
              WHERE nombre_usuario = :nombre_usuario 
              AND correo_electronico = :email";
    
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':nombre_usuario', $nombre_usuario);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Verificar contraseña hasheada
        if (password_verify($password, $usuario['contrasena'])) {
            echo json_encode([
                'success' => true,
                'message' => 'Login exitoso',
                'data' => [
                    'id' => $usuario['id_usuario'],
                    'nombre_usuario' => $usuario['nombre_usuario'],
                    'correo' => $usuario['correo_electronico']
                ]
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Contraseña incorrecta'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Usuario o email no encontrado'
        ]);
    }
}
?>