<?php
require_once __DIR__ . '/config/conexion.php'; // Ajusta la ruta según tu estructura

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $id_localidad = $_POST['id_localidad'] ?? '';

    if (empty($id_localidad)) {
        echo json_encode(['exito' => false, 'mensaje' => 'ID de localidad requerido']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // Eliminar directamente la localidad
        $sqlLocalidad = "DELETE FROM localidades WHERE id_localidad = :id_localidad";
        $stmtLoc = $pdo->prepare($sqlLocalidad);
        $stmtLoc->execute([':id_localidad' => $id_localidad]);

        $pdo->commit();

        if ($stmtLoc->rowCount() > 0) {
            echo json_encode(['exito' => true, 'mensaje' => 'Localidad eliminada correctamente']);
        } else {
            echo json_encode(['exito' => false, 'mensaje' => 'No se encontró la localidad']);
        }

    } catch (PDOException $e) {
        $pdo->rollBack();
        echo json_encode(['exito' => false, 'mensaje' => 'Error al eliminar: ' . $e->getMessage()]);
    }

} else {
    echo json_encode(['exito' => false, 'mensaje' => 'Método no permitido']);
}
?>
