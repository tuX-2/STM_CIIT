<?php
$host = 'postgres';
$dbname = 'TMS-CIIT';
$user = 'admin';
$pass = 'password';

try {
    $pdo = new PDO("pgsql:host=$host;dbname=$dbname", $user, $pass);
    echo "Conexion exitosa a PostgreSQL!";
} catch (PDOException $e) {
    echo "Error de conexion: " . $e->getMessage();
}
?>
