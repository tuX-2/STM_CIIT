<?php

require_once __DIR__ . '/../config/conexion.php';
try {
    $pdo->beginTransaction();

    // 1️⃣ Insertar localidades y guardar sus IDs generados
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
        $ids_localidades[] = $stmt_localidades->fetchColumn(); // Guarda el id_localidad generado
    }

    // 2️⃣ Insertar personal usando los IDs obtenidos
    $sql_personal = "INSERT INTO personal 
        (nombre_personal, apellido_paterno, apellido_materno, afiliacion_laboral, cargo, curp)
        VALUES (:nombre_personal, :apellido_paterno, :apellido_materno, :afiliacion_laboral, :cargo, :curp)
        RETURNING id_personal";
    $stmt_personal = $pdo->prepare($sql_personal);

    $personal = [
        ['María', 'González', 'Pérez',  $ids_localidades[0], 'Autoridad', 'GOPM800101MOCNRR02'],
        ['Juan', 'López', 'Martínez',   $ids_localidades[1], 'Administrador del TMS', 'LOMJ850210HOCRRN03'],
        ['Ana', 'Ramírez', 'Castillo',  $ids_localidades[2], 'Operador Logístico', 'RACA900415MOCSTS04'],
        ['Carlos', 'Hernández', 'Ortiz', $ids_localidades[3], 'Jefe de Almacén', 'HEOC820701HOCNRS05'],
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
        $ids_personal[] = $stmt_personal->fetchColumn(); // Guarda id_personal generado
    }

    // 3️⃣ Insertar usuarios con los IDs del personal
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

    $pdo->commit();
    echo "✅ Datos insertados correctamente y relaciones establecidas.";
} catch (Exception $e) {
    $pdo->rollBack();
    echo "❌ Error al insertar los datos: " . $e->getMessage();
}
