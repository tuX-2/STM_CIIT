<?php
require_once __DIR__ . '/../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = trim($_POST['nombre_usuario']);
    $correo = trim($_POST['correo']);
    $clave_personal = trim($_POST['clave_personal']);
    $password = trim($_POST['contrasena']);
    $confirmar = trim($_POST['confirmar_contrasena']);

    // Validar campos vacíos
    if (empty($nombre) || empty($correo) || empty($clave_personal) || empty($password) || empty($confirmar)) {
        echo "Por favor completa todos los campos.";
        exit;
    }

    // Validar contraseñas iguales
    if ($password !== $confirmar) {
        echo "Las contraseñas no coinciden.";
        exit;
    }

    try {
        // Verificar si la clave de personal existe
        $sql = "SELECT COUNT(*) FROM personal WHERE id_personal = :clave";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['clave' => $clave_personal]);
        $existe = $stmt->fetchColumn();

        if ($existe == 0) {
            echo "La clave de identificación ingresada no existe en la base de datos.";
            exit;
        }

        // Verificar si el usuario ya está registrado
        $sql = "SELECT COUNT(*) FROM usuarios WHERE correo_electronico = :correo";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['correo' => $correo]);
        if ($stmt->fetchColumn() > 0) {
            echo "Este correo ya está registrado.";
            exit;
        }

        // Registrar usuario (por ejemplo, tabla 'usuarios')
        $sql = "INSERT INTO usuarios (nombre_usuario, contrasena, correo_electronico, identificador_de_rh)
                VALUES (:nombre, :password, :correo, :clave)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'nombre' => $nombre,
            'password' => password_hash($password, PASSWORD_BCRYPT), 
            'correo' => $correo,
            'clave' => $clave_personal
            
        ]);

        echo "Usuario registrado exitosamente.";
    } catch (PDOException $e) {
        echo "Error al registrar: " . $e->getMessage();
    }
}
