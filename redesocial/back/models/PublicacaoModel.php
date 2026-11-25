
<?php

// CREATE
function inserirPublicacao($con, $dados){

    $stmt = $con->prepare(
        "INSERT INTO publicacoes (id_usuario, conteudo)
        VALUES (?, ?)"
    );

    $stmt->execute([
        $dados["id_usuario"],
        $dados["conteudo"]
    ]);

    return $con->lastInsertId();
}

// READ
function listarPublicacoes($con){

    $idUsuario = $_GET["id_usuario"] ?? 0;

    $stmt = $con->prepare(
        "SELECT
            p.id_publicacao,
            p.id_usuario,
            p.conteudo,
            u.nome,
            u.username,
            COUNT(c.id_curtida) AS quantidade_curtidas,

            MAX(
                CASE
                    WHEN c.id_usuario = ? THEN 1
                    ELSE 0
                END
            ) AS usuario_curtiu,

            MAX(
                CASE
                    WHEN c.id_usuario = ? THEN c.id_curtida
                    ELSE NULL
                END
            ) AS id_curtida_usuario

        FROM publicacoes p

        INNER JOIN usuarios u
            ON p.id_usuario = u.id_usuario

        LEFT JOIN curtidas c
            ON p.id_publicacao = c.id_publicacao

        GROUP BY
            p.id_publicacao,
            p.id_usuario,
            p.conteudo,
            u.nome,
            u.username

        ORDER BY p.id_publicacao DESC"
    );

    $stmt->execute([
        $idUsuario,
        $idUsuario
    ]);

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// UPDATE
function atualizarPublicacao($con, $id, $dados){

    $stmt = $con->prepare(
        "UPDATE publicacoes
        SET conteudo = ?
        WHERE id_publicacao = ?"
    );

    $stmt->execute([
        $dados["conteudo"],
        $id
    ]);
}

// DELETE
function removerPublicacao($con, $id){

    try {

        $con->beginTransaction();

        // Remover curtidas da publicação
        $stmtCurtidas = $con->prepare(
            "DELETE FROM curtidas
            WHERE id_publicacao = ?"
        );

        $stmtCurtidas->execute([$id]);

        // Remover publicação
        $stmtPublicacao = $con->prepare(
            "DELETE FROM publicacoes
            WHERE id_publicacao = ?"
        );

        $stmtPublicacao->execute([$id]);

        $con->commit();

        return true;

    } catch (PDOException $erro) {

        if($con->inTransaction()){
            $con->rollBack();
        }

        throw $erro;
    }
}

