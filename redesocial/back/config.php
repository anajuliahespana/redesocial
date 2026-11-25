
<?php

$host = "localhost";
$porta = "3306";
$banco = "redesocial";
$usuario = "root";
$senha = "";

try {
    $con = new PDO(
        "mysql:host=$host;port=$porta;dbname=$banco;charset=utf8mb4",
        $usuario,
        $senha
    );

    $con->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "erro" => "Erro na conexão com o banco de dados!"
    ]);
    exit;
}
