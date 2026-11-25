
const API = "http://localhost/redesocial/back/api.php";

// FOTOS DOS USUÁRIOS

const fotos = {
    anahespana: "img/anahespana.jpg",
    catherinebascoy: "img/catherinebascoy.jpg",
    mudias_: "img/mudias.jpg",
    bascoymalu: "img/bascoymalu.jpg"
};

// CADASTRO

const formCadastro = document.getElementById("formCadastro");

if (formCadastro) {
    formCadastro.addEventListener("submit", async function(event) {
        event.preventDefault();

        const dados = {
            nome: document.getElementById("nome").value,
            username: document.getElementById("username").value,
            email: document.getElementById("email").value,
            senha: document.getElementById("senha").value
        };

        try {
            const resposta = await fetch(`${API}?rota=usuario`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(dados)
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                alert("Conta criada com sucesso! 💙");
                formCadastro.reset();
            } else {
                alert(resultado.erro || "Erro ao criar conta.");
            }
        } catch (erro) {
            alert("Erro ao conectar com o servidor!");
            console.error(erro);
        }
    });
}

// LOGIN

const formLogin = document.getElementById("formLogin");

if (formLogin) {
    formLogin.addEventListener("submit", async function(event) {
        event.preventDefault();

        const dados = {
            email: document.getElementById("emailLogin").value,
            senha: document.getElementById("senhaLogin").value
        };

        try {
            const resposta = await fetch(`${API}?rota=login`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(dados)
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                localStorage.setItem("usuario", JSON.stringify(resultado.usuario));
                window.location.href = "index.html";
            } else {
                alert(resultado.erro || "Erro ao fazer login!");
            }
        } catch (erro) {
            alert("Erro ao conectar com o servidor!");
            console.error(erro);
        }
    });
}

// CARREGAR PUBLICAÇÕES DO FEED

async function carregarPublicacoes() {
    const lista = document.getElementById("listaPublicacoes");
    if (!lista) return;

    const usuarioSalvo = localStorage.getItem("usuario");
    const usuarioLogado = usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
    const idUsuario = usuarioLogado ? usuarioLogado.id_usuario : 0;

    try {
        const resposta = await fetch(
            `${API}?rota=publicacao&id_usuario=${idUsuario}`
        );

        const publicacoes = await resposta.json();

        if (!resposta.ok) {
            throw new Error("Erro ao carregar publicações.");
        }

        lista.innerHTML = "<h2>Publicações</h2>";

        publicacoes.forEach(function(publicacao) {
            const post = document.createElement("div");
            post.className = "post";

            const usuarioPost = document.createElement("div");
            usuarioPost.className = "post-usuario";

            const foto = document.createElement("img");
            foto.src = fotos[publicacao.username] || "img/logo.svg";
            foto.alt = publicacao.username;

            const informacoes = document.createElement("div");

            const nome = document.createElement("strong");
            nome.textContent = publicacao.username;

            const nomeCompleto = document.createElement("p");
            nomeCompleto.textContent = publicacao.nome;

            informacoes.appendChild(nome);
            informacoes.appendChild(nomeCompleto);
            usuarioPost.appendChild(foto);
            usuarioPost.appendChild(informacoes);

            const legenda = document.createElement("p");
            legenda.className = "legenda";
            legenda.textContent = publicacao.conteudo;

            const interacao = document.createElement("div");
            interacao.className = "post-interacao";

            const botaoCurtir = document.createElement("button");
            botaoCurtir.type = "button";

            const contador = document.createElement("span");
            contador.className = "curtidas";

            function atualizarBotao() {
                const curtiu = Number(publicacao.usuario_curtiu) === 1;

                botaoCurtir.textContent = curtiu ? "♥" : "♡";
                botaoCurtir.title = curtiu ? "Descurtir" : "Curtir";

                contador.textContent =
                    `${Number(publicacao.quantidade_curtidas)} curtidas`;
            }

            atualizarBotao();

            botaoCurtir.addEventListener("click", async function() {
                if (!usuarioLogado) {
                    alert("Faça login para curtir uma publicação!");
                    return;
                }

                botaoCurtir.disabled = true;

                try {
                    let resposta;

                    if (Number(publicacao.usuario_curtiu) === 1) {
                        resposta = await fetch(
                            `${API}?rota=curtida&id=${publicacao.id_curtida_usuario}`,
                            {method: "DELETE"}
                        );
                    } else {
                        resposta = await fetch(`${API}?rota=curtida`, {
                            method: "POST",
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify({
                                id_usuario: idUsuario,
                                id_publicacao: publicacao.id_publicacao
                            })
                        });
                    }

                    const resultado = await resposta.json();

                    if (!resposta.ok) {
                        alert(resultado.erro || "Erro ao atualizar curtida.");
                        return;
                    }

                    await carregarPublicacoes();

                } catch (erro) {
                    alert("Erro ao conectar com o servidor!");
                    console.error(erro);
                } finally {
                    botaoCurtir.disabled = false;
                }
            });

            interacao.appendChild(botaoCurtir);

            post.appendChild(usuarioPost);
            post.appendChild(legenda);
            post.appendChild(interacao);
            post.appendChild(contador);

            lista.appendChild(post);
        });

    } catch (erro) {
        console.error("Erro ao carregar publicações:", erro);
    }
}

// CRIAR PUBLICAÇÃO

const btnPublicar = document.getElementById("btnPublicar");

if (btnPublicar) {
    btnPublicar.addEventListener("click", async function() {
        const conteudo = document.getElementById("conteudoPost").value.trim();
        const usuarioSalvo = localStorage.getItem("usuario");

        if (!usuarioSalvo) {
            alert("Você precisa fazer login para publicar!");
            return;
        }

        if (!conteudo) {
            alert("Digite alguma coisa antes de publicar!");
            return;
        }

        const usuario = JSON.parse(usuarioSalvo);

        try {
            const resposta = await fetch(`${API}?rota=publicacao`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    id_usuario: usuario.id_usuario,
                    conteudo: conteudo
                })
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                alert("Publicação criada com sucesso! 💙");
                document.getElementById("conteudoPost").value = "";
                await carregarPublicacoes();
            } else {
                alert(resultado.erro || "Não foi possível publicar!");
            }
        } catch (erro) {
            alert("Erro ao conectar com o servidor!");
            console.error(erro);
        }
    });
}

// EXCLUIR PUBLICAÇÃO

async function excluirPublicacao(idPublicacao) {

    const confirmar = confirm(
        "Tem certeza que deseja excluir esta publicação?"
    );

    if (!confirmar) {
        return;
    }

    try {
        const resposta = await fetch(
            `${API}?rota=publicacao&id=${idPublicacao}`,
            {
                method: "DELETE"
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok) {
            alert(resultado.erro || "Não foi possível excluir a publicação.");
            return;
        }

        alert("Publicação excluída com sucesso! 💙");

        await carregarPerfil();
        await carregarPublicacoes();

    } catch (erro) {
        alert("Erro ao conectar com o servidor!");
        console.error(erro);
    }
}

// CARREGAR PERFIL

async function carregarPerfil() {
    const minhasPublicacoes = document.getElementById("minhasPublicacoes");

    if (!minhasPublicacoes) return;

    const usuarioSalvo = localStorage.getItem("usuario");

    if (!usuarioSalvo) {
        window.location.href = "login.html";
        return;
    }

    const usuario = JSON.parse(usuarioSalvo);

    document.getElementById("perfilUsername").textContent =
        usuario.username;

    document.getElementById("perfilNome").textContent =
        usuario.nome;

    document.getElementById("fotoPerfil").src =
        fotos[usuario.username] || "img/logo.svg";

    try {
        const resposta = await fetch(
            `${API}?rota=publicacao&id_usuario=${usuario.id_usuario}`
        );

        const publicacoes = await resposta.json();

        if (!resposta.ok) {
            throw new Error("Erro ao carregar perfil.");
        }

        const minhas = publicacoes.filter(function(publicacao) {
            return Number(publicacao.id_usuario) === Number(usuario.id_usuario);
        });

        document.getElementById("totalPublicacoes").textContent =
            `${minhas.length} publicações`;

        minhasPublicacoes.innerHTML = "";

        if (minhas.length === 0) {
            minhasPublicacoes.textContent =
                "Você ainda não tem publicações.";
            return;
        }

        minhas.forEach(function(publicacao) {
            const post = document.createElement("div");
            post.className = "post";

            const legenda = document.createElement("p");
            legenda.className = "legenda";
            legenda.textContent = publicacao.conteudo;

            // BOTÃO DE EXCLUIR

            const botaoExcluir = document.createElement("button");
            botaoExcluir.type = "button";
            botaoExcluir.className = "btn-excluir-publicacao";
            botaoExcluir.textContent = "Excluir publicação";

            botaoExcluir.addEventListener("click", async function() {
                botaoExcluir.disabled = true;

                await excluirPublicacao(publicacao.id_publicacao);

                botaoExcluir.disabled = false;
            });

            post.appendChild(legenda);
            post.appendChild(botaoExcluir);

            minhasPublicacoes.appendChild(post);
        });

    } catch (erro) {
        console.error("Erro ao carregar perfil:", erro);
        minhasPublicacoes.textContent =
            "Não foi possível carregar suas publicações.";
    }
}

// EDITAR PERFIL

const btnEditarPerfil = document.getElementById("btnEditarPerfil");
const modalEditarPerfil = document.getElementById("modalEditarPerfil");
const formEditarPerfil = document.getElementById("formEditarPerfil");
const btnCancelarEdicao = document.getElementById("btnCancelarEdicao");

if (btnEditarPerfil && modalEditarPerfil && formEditarPerfil) {

    btnEditarPerfil.addEventListener("click", function() {

        const usuarioSalvo = localStorage.getItem("usuario");

        if (!usuarioSalvo) {
            alert("Faça login para editar seu perfil!");
            window.location.href = "login.html";
            return;
        }

        const usuario = JSON.parse(usuarioSalvo);

        document.getElementById("editarNome").value = usuario.nome;
        document.getElementById("editarUsername").value = usuario.username;
        document.getElementById("editarEmail").value = usuario.email;

        modalEditarPerfil.classList.add("ativo");
    });

    btnCancelarEdicao.addEventListener("click", function() {
        modalEditarPerfil.classList.remove("ativo");
    });

    modalEditarPerfil.addEventListener("click", function(event) {
        if (event.target === modalEditarPerfil) {
            modalEditarPerfil.classList.remove("ativo");
        }
    });

    formEditarPerfil.addEventListener("submit", async function(event) {
        event.preventDefault();

        const usuarioSalvo = localStorage.getItem("usuario");

        if (!usuarioSalvo) {
            alert("Faça login novamente!");
            window.location.href = "login.html";
            return;
        }

        const usuario = JSON.parse(usuarioSalvo);

        const dados = {
            nome: document.getElementById("editarNome").value.trim(),
            username: document.getElementById("editarUsername").value.trim(),
            email: document.getElementById("editarEmail").value.trim()
        };

        if (!dados.nome || !dados.username || !dados.email) {
            alert("Preencha todos os campos!");
            return;
        }

        try {
            const resposta = await fetch(
                `${API}?rota=usuario&id=${usuario.id_usuario}`,
                {
                    method: "PUT",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(dados)
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok) {
                alert(resultado.erro || "Erro ao atualizar perfil!");
                return;
            }

            const fotoAtual = fotos[usuario.username];

            usuario.nome = dados.nome;
            usuario.username = dados.username;
            usuario.email = dados.email;

            localStorage.setItem("usuario", JSON.stringify(usuario));

            if (fotoAtual) {
                fotos[dados.username] = fotoAtual;
            }

            document.getElementById("perfilUsername").textContent =
                usuario.username;

            document.getElementById("perfilNome").textContent =
                usuario.nome;

            document.getElementById("fotoPerfil").src =
                fotos[usuario.username] || "img/logo.svg";

            modalEditarPerfil.classList.remove("ativo");

            alert("Perfil atualizado com sucesso! 💙");

            formEditarPerfil.reset();

        } catch (erro) {
            alert("Erro ao conectar com o servidor!");
            console.error(erro);
        }
    });
}

// SAIR DA CONTA

const btnSair = document.getElementById("btnSair");

if (btnSair) {
    btnSair.addEventListener("click", function(event) {
        event.preventDefault();

        localStorage.removeItem("usuario");

        alert("Você saiu da sua conta!");

        window.location.href = "login.html";
    });
}

// INICIAR PÁGINAS

carregarPublicacoes();
carregarPerfil();



