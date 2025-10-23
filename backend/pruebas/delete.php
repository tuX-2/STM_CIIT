<?php
require_once __DIR__.'/../config/conexion.php';

try {
    // Desactivar temporalmente las restricciones de integridad referencial
    $pdo->exec("SET session_replication_role = 'replica';");

    // Eliminar registros de tablas hijas primero (por dependencias)
    $pdo->exec("DELETE FROM usuarios;");
    $pdo->exec("DELETE FROM productos;");
    $pdo->exec("DELETE FROM personal;");
    $pdo->exec("DELETE FROM localidades;");

    // Reactivar las restricciones
    $pdo->exec("SET session_replication_role = 'origin';");

    echo "Registros eliminados correctamente!";
} catch (PDOException $e) {
    echo "Error al eliminar registros: " . $e->getMessage();
}
?>
