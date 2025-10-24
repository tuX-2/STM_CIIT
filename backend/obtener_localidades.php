<?php
require_once __DIR__ . '/config/conexion.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // Consulta
    $stmt = $pdo->query("SELECT id_localidad, nombre_centro_trabajo FROM localidades ORDER BY nombre_centro_trabajo");
    
    // Fetch
    $localidades = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Devolver JSON
    echo json_encode($localidades, JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error en la consulta: " . $e->getMessage()]);
}