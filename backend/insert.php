<?php
require_once __DIR__ . '/config/conexion.php';

try {
    // Insertar localidades
    $pdo->exec("
        INSERT INTO localidades (nombre_centro_trabajo, ubicacion_georeferenciada, poblacion, localidad, estado, tipo_instalacion)
        VALUES
        ('Centro CIIT', '19.2000,-96.1400', 'Puebla', 'Puebla', 'Puebla', 'Centro Productivo'),
        ('Almacen Principal', '19.2010,-96.1410', 'Puebla', 'Puebla', 'Puebla', 'Almacen')
    ");

    // Insertar personal
    $pdo->exec("
        INSERT INTO personal (nombre_personal, apellido_paterno, apellido_materno, afiliacion_laboral, cargo, curp)
        VALUES
        ('Jose', 'Perez', 'Sanchez', 1, 'Administrador del TMS', 'PESJ920101HDFRZN09'),
        ('Ana', 'Lopez', 'Ramirez', 2, 'Operador Logístico', 'LORA930202MDFTRN02')
    ");

    // Insertar usuarios
    $pdo->exec("
        INSERT INTO usuarios (nombre_usuario, contrasena, correo_electronico, identificador_de_rh)
        VALUES
        ('admin', 'admin123', 'admin@ciit.com', 1),
        ('operador', 'pass123', 'ana@ciit.com', 2)
    ");

    // Insertar productos
    $pdo->exec("
        INSERT INTO productos (nombre_producto, ubicacion_producto, peso, altura, cajas_por_cama, camas_por_pallet, peso_soportado, peso_volumetrico, unidades_existencia, tipo_de_embalaje, tipo_de_mercancia)
        VALUES
        ('Producto A', 1, 10.5, 15.2, 5, 10, 200, 250, 100, 'Caja', 'General'),
        ('Producto B', 2, 5.3, 10.0, 3, 8, 150, 180, 50, 'Bolsa', 'Perecedero')
    ");

    echo "Registros insertados correctamente!";
} catch (PDOException $e) {
    echo "Error al insertar registros: " . $e->getMessage();
}
?>
