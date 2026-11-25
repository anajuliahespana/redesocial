
<?php

require_once __DIR__ . "/../models/UsuarioModel.php";

// Receber dados de cadastro
function receberDadosUsuario(){
    $dados = json_decode(
        file_get_contents("php://input"), true
    );

    if(!is_array($dados)){
        http_response_code(400);
        echo json_encode([
            "erro" => "Envie um objeto JSON com dados!"
        ]);
        return null;
    }

    foreach(["nome", "username", "email"] as $campo){
        if(
            !isset($dados[$campo]) ||
            !is_string($dados[$campo]) ||
            trim($dados[$campo]) === ""
        ){
            http_response_code(400);
            echo json_encode([
                "erro" => "O campo $campo é obrigatório!"
            ]);
            return null;
        }
    }

    return $dados;
}

// Receber ID
function receberIdUsuario(){
    $id = filter_var(
        $_GET["id"] ?? null,
        FILTER_VALIDATE_INT,
        ["options" => ["min_range" => 1]]
    );

    if($id === false){
        http_response_code(400);
        echo json_encode([
            "erro" => "Informe um id de usuário válido!"
        ]);
        return null;
    }

    return $id;
}

// CREATE
function createUsuario($con){
    $dados = receberDadosUsuario();

    if($dados === null){
        return;
    }

    if(empty($dados["senha"])){
        http_response_code(400);
        echo json_encode([
            "erro" => "A senha é obrigatória!"
        ]);
        return;
    }

    $id = inserirUsuario($con, $dados);

    http_response_code(201);
    echo json_encode([
        "mensagem" => "Usuário criado com sucesso!",
        "id" => $id
    ]);
}

// READ
function readUsuario($con){
    echo json_encode(listarUsuario($con));
}

// UPDATE
function updateUsuario($con){
    $id = receberIdUsuario();

    if($id === null){
        return;
    }

    $dados = receberDadosUsuario();

    if($dados === null){
        return;
    }

    atualizarUsuario($con, $id, $dados);

    echo json_encode([
        "mensagem" => "Perfil atualizado com sucesso!"
    ]);
}

// DELETE
function deleteUsuario($con){
    $id = receberIdUsuario();

    if($id === null){
        return;
    }

    removerUsuario($con, $id);

    echo json_encode([
        "mensagem" => "Usuário removido com sucesso!"
    ]);
}

// LOGIN
function loginUsuario($con){

    $dados = json_decode(file_get_contents("php://input"), true);

    if(
        empty($dados["email"]) ||
        empty($dados["senha"])
    ){
        http_response_code(400);
        echo json_encode([
            "erro" => "Preencha o e-mail e a senha!"
        ]);
        return;
    }

    $usuario = buscarUsuarioPorEmail($con, $dados["email"]);

    if(
        !$usuario ||
        !password_verify($dados["senha"], $usuario["senha"])
    ){
        http_response_code(401);
        echo json_encode([
            "erro" => "E-mail ou senha incorretos!"
        ]);
        return;
    }

    unset($usuario["senha"]);

    echo json_encode([
        "mensagem" => "Login realizado com sucesso!",
        "usuario" => $usuario
    ]);
}
