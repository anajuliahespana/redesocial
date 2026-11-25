
<?php

// CREATE
function inserirUsuario($con, $dados){

    $stmt = $con->prepare(
        "INSERT INTO usuarios (nome, username, email, senha)
        VALUES (?, ?, ?, ?)"
    );

    $stmt->execute([
        $dados["nome"],
        $dados["username"],
        $dados["email"],
        password_hash($dados["senha"], PASSWORD_DEFAULT)
    ]);

    return $con->lastInsertId();
}

// READ
function listarUsuario($con){

    $stmt = $con->query(
        "SELECT id_usuario, nome, username, email FROM usuarios"
    );

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// LOGIN
function buscarUsuarioPorEmail($con, $email){

    $stmt = $con->prepare(
        "SELECT * FROM usuarios WHERE email = ?"
    );

    $stmt->execute([$email]);

    return $stmt->fetch(PDO::FETCH_ASSOC);
}

// UPDATE
function atualizarUsuario($con, $id, $dados){

    $stmt = $con->prepare(
        "UPDATE usuarios
        SET nome = ?, username = ?, email = ?
        WHERE id_usuario = ?"
    );

    $stmt->execute([
        $dados["nome"],
        $dados["username"],
        $dados["email"],
        $id
    ]);
}

// DELETE
function removerUsuario($con, $id){

    $stmt = $con->prepare(
        "DELETE FROM usuarios WHERE id_usuario = ?"
    );

    $stmt->execute([$id]);
}

