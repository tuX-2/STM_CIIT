<?php
session_start();
require_once __DIR__ . '/config/conexion.php';
header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $sql = "
        SELECT 
            p.nombre_producto,
            l.nombre_centro_trabajo AS nombre_localidad,
            p.tipo_de_mercancia,
            p.tipo_de_embalaje,
            p.peso,
            p.altura,
            p.peso_volumetrico,
            p.unidades_existencia
        FROM productos p
        INNER JOIN localidades l ON p.ubicacion_producto = l.id_localidad
        WHERE 1=1
    ";
    $params = [];

    // Helper para normalizar arrays
    function getArray($key) {
        if (!isset($_POST[$key])) return [];
        $val = $_POST[$key];
        return is_array($val)
            ? array_values(array_filter($val, fn($v) => trim($v) !== ''))
            : (trim($val) ? [trim($val)] : []);
    }

    // Filtros
    if (!empty($_POST['filtro_nombre'])) {
        $sql .= " AND LOWER(p.nombre_producto) LIKE :nombre";
        $params[':nombre'] = '%' . mb_strtolower($_POST['filtro_nombre'], 'UTF-8') . '%';
    }

    $ubic = getArray('filtro_ubicacion');
    if ($ubic) {
        $in = [];
        foreach ($ubic as $i => $id) {
            $ph = ":ub$i";
            $in[] = $ph;
            $params[$ph] = (int)$id;
        }
        $sql .= " AND p.ubicacion_producto IN (" . implode(',', $in) . ")";
    }

    $merc = getArray('filtro_tipo_mercancia');
    if ($merc) {
        $in = [];
        foreach ($merc as $i => $v) {
            $ph = ":merc$i";
            $in[] = $ph;
            $params[$ph] = $v;
        }
        $sql .= " AND p.tipo_de_mercancia IN (" . implode(',', $in) . ")";
    }

    $emb = getArray('filtro_tipo_embalaje');
    if ($emb) {
        $in = [];
        foreach ($emb as $i => $v) {
            $ph = ":emb$i";
            $in[] = $ph;
            $params[$ph] = $v;
        }
        $sql .= " AND p.tipo_de_embalaje IN (" . implode(',', $in) . ")";
    }

    $rangos = getArray('filtro_rango_peso');
    if ($rangos) {
        $cond = [];
        foreach ($rangos as $i => $r) {
            if (preg_match('/^(\d+)-(\d+)$/', $r, $m)) {
                $ph1 = ":min$i"; $ph2 = ":max$i";
                $params[$ph1] = (float)$m[1];
                $params[$ph2] = (float)$m[2];
                $cond[] = "(p.peso BETWEEN $ph1 AND $ph2)";
            } elseif (preg_match('/^>\s*(\d+)/', $r, $m)) {
                $ph = ":may$i"; $params[$ph] = (float)$m[1];
                $cond[] = "p.peso > $ph";
            } elseif (preg_match('/^<\s*(\d+)/', $r, $m)) {
                $ph = ":men$i"; $params[$ph] = (float)$m[1];
                $cond[] = "p.peso < $ph";
            }
        }
        if ($cond) $sql .= " AND (" . implode(' OR ', $cond) . ")";
    }

    $sql .= " ORDER BY p.nombre_producto ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'productos' => $productos], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
