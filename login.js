// CONFIG SUPABASE
const SUPABASE_URL = "https://imvsvbqmtlllnlevrund.supabase.co";
const SUPABASE_KEY = "sb_publishable_E3JKMKJnvVRbEbwn7SscZw_rE8id_ct";
const headers = { "apikey": SUPABASE_KEY, "Authorization": "Bearer "+SUPABASE_KEY, "Content-Type": "application/json", "Prefer": "return=representation" };

let mensagens = [
  {id:1, nome:"Professor André", assunto:"Parabéns pelo projeto", texto:"Ficou muito bom seu portfólio, continue assim!", data:"Hoje", lida:false},
  {id:2, nome:"Colega de turma", assunto:"Ajuda no CSS", texto:"Como você fez o menu ficar igual em todas as páginas?", data:"Ontem", lida:false},
  {id:3, nome:"Visitante", assunto:"Gostei da açaiteria", texto:"Quero um site igual para minha lanchonete!", data:"Ontem", lida:true},
  {id:4, nome:"Empresa", assunto:"Vaga de estágio", texto:"Vimos seu portfólio e queremos conversar.", data:"2 dias atrás", lida:false},
];
let filtroAtual = 'todas';

async function carregarMensagens(){
  try{
    const r = await fetch(SUPABASE_URL+"/messages?select=*&order=created_at.desc", {headers});
    if(r.ok){ const d = await r.json(); if(d.length>0){ mensagens = d.map(m=>({id:m.id, nome:m.nome, assunto:m.assunto, texto:m.texto, data:m.data||m.created_at, lida:m.lida})); } }
  }catch(e){ console.log("Usando mensagens locais"); }
  renderMsg();
}
function renderMsg(){
  const el = document.getElementById("listaMsg"); if(!el) return;
  const lista = mensagens.filter(m => filtroAtual==='todas' ? true : filtroAtual==='lidas' ? m.lida : !m.lida);
  const naoLidas = mensagens.filter(m=>!m.lida).length;
  const badge = document.getElementById("badgeMsg"); if(badge) badge.textContent = naoLidas;
  const cont = document.getElementById("contNaoLidas"); if(cont) cont.textContent = naoLidas>0 ? `(${naoLidas} não lidas)` : "(tudo lido)";
  el.innerHTML = lista.map(m=>`<div class="msg ${!m.lida?'unread':''}"><strong>${m.nome} ${!m.lida?'<span class="badge">Nova</span>':''}</strong><br><b>${m.assunto}</b><br><small>${m.data}</small><p>${m.texto}</p><button class="btn btn-light" onclick="alternarLida(${m.id})">${m.lida?'Marcar como não lida':'Marcar como lida'}</button> <button class="btn" onclick="apagarMsg(${m.id})">Apagar</button></div>`).join("") || "<p>Nenhuma mensagem aqui.</p>";
}
async function alternarLida(id){ const m=mensagens.find(x=>x.id==id); if(!m) return; m.lida=!m.lida; try{ await fetch(SUPABASE_URL+`/messages?id=eq.${id}`, {method:"PATCH", headers, body: JSON.stringify({lida:m.lida})}); }catch(e){} renderMsg(); }
async function apagarMsg(id){ if(!confirm("Apagar esta mensagem?")) return; mensagens=mensagens.filter(x=>x.id!=id); try{ await fetch(SUPABASE_URL+`/messages?id=eq.${id}`, {method:"DELETE", headers}); }catch(e){} renderMsg(); }
function filtrarMsg(f){ filtroAtual=f; renderMsg(); }
async function marcarTodas(){ mensagens.forEach(m=>m.lida=true); try{ await fetch(SUPABASE_URL+`/messages?lida=eq.false`, {method:"PATCH", headers, body: JSON.stringify({lida:true})}); }catch(e){} renderMsg(); }
async function apagarLidas(){ if(!confirm("Apagar todas as lidas?")) return; const ids=mensagens.filter(m=>m.lida).map(m=>m.id); mensagens=mensagens.filter(m=>!m.lida); for(const id of ids){ try{ await fetch(SUPABASE_URL+`/messages?id=eq.${id}`, {method:"DELETE", headers}); }catch(e){} } renderMsg(); }

// LOGIN PELO SUPABASE

const formLogin = document.getElementById("formLogin");

if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("usuario").value.trim();
        const senha = document.getElementById("senha").value;
        const erro = document.getElementById("erroLogin");
        const botao = document.getElementById("btnEntrar");

        erro.textContent = "";
        botao.disabled = true;
        botao.textContent = "Verificando...";

        try {
            const resposta = await fetch(
                SUPABASE_URL + "/auth/v1/token?grant_type=password",
                {
                    method: "POST",
                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password: senha })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.msg ||
                    dados.message ||
                    dados.error_description ||
                    "E-mail ou senha incorretos."
                );
            }

            localStorage.setItem("supabase_session", JSON.stringify(dados));
            localStorage.setItem("logado", "sim");

            window.location.href = "dashboard.html";

        } catch (erroLogin) {
            erro.textContent = erroLogin.message;
        } finally {
            botao.disabled = false;
            botao.textContent = "Entrar";
        }
    });
}
const formContato=document.getElementById("formContato");
if(formContato){ formContato.addEventListener("submit", async e=>{ e.preventDefault(); const nova={nome:document.getElementById("nome").value, assunto:document.getElementById("assunto").value, texto:document.getElementById("texto").value, data:new Date().toLocaleString("pt-BR"), lida:false}; try{ await fetch(SUPABASE_URL+"/messages", {method:"POST", headers, body: JSON.stringify(nova)}); }catch(err){} document.getElementById("msgContato").textContent="Mensagem enviada! Obrigado, vou responder em breve."; formContato.reset(); }); }

const formProj=document.getElementById("formProjeto");
if(formProj){ formProj.addEventListener("submit", e=>{ e.preventDefault(); document.getElementById("okProj").textContent="Projeto publicado no Portfólio!"; formProj.reset(); }); }

carregarMensagens();