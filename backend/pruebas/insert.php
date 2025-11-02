<?php

require_once __DIR__ . '/../config/conexion.php';
try {
    $pdo->beginTransaction();

    // 1️⃣ Insertar localidades y guardar sus IDs
    $sql_localidades = "INSERT INTO localidades 
        (nombre_centro_trabajo, ubicacion_georeferenciada, poblacion, localidad, estado, tipo_instalacion)
        VALUES (:nombre_centro_trabajo, :ubicacion_georeferenciada, :poblacion, :localidad, :estado, :tipo_instalacion)
        RETURNING id_localidad";
    $stmt_localidades = $pdo->prepare($sql_localidades);

    $localidades = [
        ['Centro Productivo Oaxaca', '16.8531,-96.7712', 'Oaxaca de Juárez', 'Oaxaca', 'Oaxaca', 'Centro Productivo'],
        ['Centro de Distribución Istmo', '16.3236,-95.2406', 'Salina Cruz', 'Salina Cruz', 'Oaxaca', 'Centro de Distribucion'],
        ['PODEBI Huatulco', '15.7686,-96.1356', 'Santa María Huatulco', 'Huatulco', 'Oaxaca', 'PODEBI'],
        ['Almacén Central Puebla', '19.0433,-98.2019', 'Puebla', 'Puebla', 'Puebla', 'Almacen']
    ];

    $ids_localidades = [];

    foreach ($localidades as $loc) {
        $stmt_localidades->execute([
            ':nombre_centro_trabajo' => $loc[0],
            ':ubicacion_georeferenciada' => $loc[1],
            ':poblacion' => $loc[2],
            ':localidad' => $loc[3],
            ':estado' => $loc[4],
            ':tipo_instalacion' => $loc[5]
        ]);
        $ids_localidades[] = $stmt_localidades->fetchColumn();
    }

    // 2️⃣ Insertar personal
    $sql_personal = "INSERT INTO personal 
        (nombre_personal, apellido_paterno, apellido_materno, afiliacion_laboral, cargo, curp)
        VALUES (:nombre_personal, :apellido_paterno, :apellido_materno, :afiliacion_laboral, :cargo, :curp)
        RETURNING id_personal";
    $stmt_personal = $pdo->prepare($sql_personal);

    $personal = [
        ['María', 'González', 'Pérez',  $ids_localidades[0], 'Autoridad', 'GOPM800101MOCNRR02'],
        ['Juan', 'López', 'Martínez',   $ids_localidades[1], 'Administrador del TMS', 'LOMJ850210HOCRRN03'],
        ['Ana', 'Ramírez', 'Castillo',  $ids_localidades[2], 'Operador Logístico', 'RACA900415MOCSTS04'],
        ['Carlos', 'Hernández', 'Ortiz',$ids_localidades[3], 'Jefe de Almacén', 'HEOC820701HOCNRS05'],
        ['Fernanda', 'Vargas', 'Luna',  $ids_localidades[1], 'Cliente', 'VALF950812MOCNRN06']
    ];

    $ids_personal = [];

    foreach ($personal as $p) {
        $stmt_personal->execute([
            ':nombre_personal' => $p[0],
            ':apellido_paterno' => $p[1],
            ':apellido_materno' => $p[2],
            ':afiliacion_laboral' => $p[3],
            ':cargo' => $p[4],
            ':curp' => $p[5]
        ]);
        $ids_personal[] = $stmt_personal->fetchColumn();
    }

    // 3️⃣ Insertar usuarios
    $sql_usuarios = "INSERT INTO usuarios 
        (nombre_usuario, contrasena, correo_electronico, identificador_de_rh)
        VALUES (:nombre_usuario, :contrasena, :correo_electronico, :identificador_de_rh)";
    $stmt_usuarios = $pdo->prepare($sql_usuarios);

    $usuarios = [
        ['maria_gonzalez', 'admin123', 'maria.gonzalez@empresa.com', $ids_personal[0]],
        ['juan_lopez', 'tms2024', 'juan.lopez@empresa.com', $ids_personal[1]],
        ['ana_ramirez', 'logistica45', 'ana.ramirez@empresa.com', $ids_personal[2]],
        ['carlos_hernandez', 'almacen99', 'carlos.hernandez@empresa.com', $ids_personal[3]],
        ['fernanda_vargas', 'cliente789', 'fernanda.vargas@empresa.com', $ids_personal[4]]
    ];

    foreach ($usuarios as $u) {
        $stmt_usuarios->execute([
            ':nombre_usuario' => $u[0],
            ':contrasena' => password_hash($u[1], PASSWORD_DEFAULT),
            ':correo_electronico' => $u[2],
            ':identificador_de_rh' => $u[3]
        ]);
    }

    // 4️⃣ Insertar productos
    $sql_productos = "INSERT INTO productos 
        (nombre_producto, ubicacion_producto, peso, altura, cajas_por_cama, camas_por_pallet,
         peso_soportado, peso_volumetrico, unidades_existencia, tipo_de_embalaje, tipo_de_mercancia)
        VALUES (:nombre_producto, :ubicacion_producto, :peso, :altura, :cajas_por_cama, :camas_por_pallet,
         :peso_soportado, :peso_volumetrico, :unidades_existencia, :tipo_de_embalaje, :tipo_de_mercancia)";
    $stmt_productos = $pdo->prepare($sql_productos);

    $productos = [
        // En Centro Productivo Oaxaca
        ['Queso Oaxaca 1kg',          $ids_localidades[0], 1.0, 0.12, 12, 10, 500.0, 1.2, 240, 'Bolsa plástica', 'Lácteo'],
        ['Queso Panela 500g',         $ids_localidades[0], 0.5, 0.08, 20, 8, 320.0, 0.8, 500, 'Empaque al vacío', 'Lácteo'],

        // En Centro de Distribución Istmo
        ['Yogurt Natural 1L',         $ids_localidades[1], 1.1, 0.22, 15, 9, 600.0, 1.3, 300, 'Botella PET', 'Lácteo'],
        ['Yogurt con Frutas 500ml',   $ids_localidades[1], 0.55, 0.18, 24, 10, 400.0, 0.9, 450, 'Botella PET', 'Lácteo'],

        // En PODEBI Huatulco
        ['Caja de Empaque Vacía',     $ids_localidades[2], 0.3, 0.25, 40, 12, 200.0, 0.6, 120, 'Cartón corrugado', 'Material de embalaje'],

        // En Almacén Central Puebla
        ['Pallet Reutilizable',       $ids_localidades[3], 15.0, 0.15, 1, 1, 1500.0, 2.0, 50, 'Madera tratada', 'Equipo logístico'],
        ['Film Stretch',              $ids_localidades[3], 2.0, 0.10, 25, 6, 300.0, 0.5, 200, 'Rollo plástico', 'Material de embalaje']
    ];

    foreach ($productos as $prod) {
        $stmt_productos->execute([
            ':nombre_producto' => $prod[0],
            ':ubicacion_producto' => $prod[1],
            ':peso' => $prod[2],
            ':altura' => $prod[3],
            ':cajas_por_cama' => $prod[4],
            ':camas_por_pallet' => $prod[5],
            ':peso_soportado' => $prod[6],
            ':peso_volumetrico' => $prod[7],
            ':unidades_existencia' => $prod[8],
            ':tipo_de_embalaje' => $prod[9],
            ':tipo_de_mercancia' => $prod[10]
        ]);
    }

    $pdo->commit();
    echo "✅ Datos insertados correctamente (localidades, personal, usuarios y productos).";

} catch (Exception $e) {
    $pdo->rollBack();
    echo "❌ Error al insertar los datos: " . $e->getMessage();
}
