<?php
require_once __DIR__.'/../config/conexion.php';

try {
    echo "<h2>Localidades</h2>";
    $stmt = $pdo->query("SELECT * FROM localidades");
    $localidades = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($localidades as $loc) {
        echo "ID: {$loc['id_localidad']} | Centro: {$loc['nombre_centro_trabajo']} | Tipo: {$loc['tipo_instalacion']}<br>";
    }

    echo "<h2>Personal</h2>";
    $stmt = $pdo->query("SELECT * FROM personal");
    $personal = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($personal as $p) {
        echo "ID: {$p['id_personal']} | Nombre: {$p['nombre_personal']} {$p['apellido_paterno']} {$p['apellido_materno']} | Cargo: {$p['cargo']}<br> | CURP: {$p['curp']}<br> ";
    }

    echo "<h2>Usuarios</h2>";
    $stmt = $pdo->query("SELECT * FROM usuarios");
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($usuarios as $u) {
        echo "ID: {$u['id_usuario']} | Usuario: {$u['nombre_usuario']} | Correo: {$u['correo_electronico']}<br>";
    }

    echo "<h2>Productos</h2>";
    $stmt = $pdo->query("SELECT * FROM productos");
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($productos as $prod) {
        echo "ID: {$prod['id_producto']} | Nombre: {$prod['nombre_producto']} | Peso: {$prod['peso']} kg<br> | Peso: {$prod['tipo_de_embalaje']} kg<br>";
    }

} catch (PDOException $e) {
    echo "Error al leer registros: " . $e->getMessage();
}
?>
