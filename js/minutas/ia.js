/* ===== REVISÃO E INTEGRAÇÃO COM IA ===== */

function obterReuniaoMinutaAtual(){
  return reunioes.find(item => item.id === minutaReuniaoId) || minutaHistoricoReuniao;
}

async function obterTokenSessaoIA(){
  try {
    if(!window.NormaticCloud?.enabled) return '';
    const { data } = await window.NormaticCloud.database().auth.getSession();
    return data?.session?.access_token || '';
  } catch(_) {
    return '';
  }
}

async function solicitarDescricaoReuniaoIA(payload){
  if(typeof window.igovAI?.gerarDescricaoReuniao === 'function'){
    return window.igovAI.gerarDescricaoReuniao(payload);
  }
  const base = String(window.IGOV_CONFIG?.apiBaseUrl || '').replace(/\/$/, '');
  const endpoint = base
    ? `${base}/api/ia/reunioes/descricao`
    : (location.protocol === 'file:' ? '' : '/api/ia-reunioes-descricao');
  if(!endpoint) throw new Error('A edição com IA não está disponível em arquivo local. Use Prosseguir para revisar manualmente.');

  const headers = {'Content-Type':'application/json'};
  const token = await obterTokenSessaoIA();
  if(token) headers.Authorization = `Bearer ${token}`;

  const resposta = await fetch(endpoint, {
    method:'POST',
    credentials:'same-origin',
    headers,
    body:JSON.stringify(payload)
  });
  let dados = null;
  try { dados = await resposta.json(); } catch(_) { dados = null; }
  if(!resposta.ok){
    if(resposta.status === 404 || resposta.status === 405){
      throw new Error('O serviço de IA funciona no site publicado (Vercel). No servidor local, use Prosseguir para revisar manualmente.');
    }
    throw new Error(dados?.error || `Serviço de IA indisponível (${resposta.status}).`);
  }
  return dados;
}

function iniciarRevisaoManualMinuta(){
  const campoOrigem = document.getElementById('minuta-reuniao-transcricao');
  const conteudo = limitarTexto(campoOrigem?.value.trim(), 20000);
  if(!conteudo){
    mostrarErroCampo(campoOrigem, 'Insira a transcrição, as anotações ou um resumo da reunião.');
    campoOrigem?.focus();
    return;
  }
  limparErroCampo(campoOrigem);
  definirTextoEditorMinuta('minuta-reuniao-descricao', limitarTexto(conteudo, 5000));
  const aviso = document.getElementById('minuta-revisao-aviso');
  if(aviso){
    aviso.textContent = 'Conteúdo inserido sem IA. Revise a descrição e informe as providências antes de montar a ata.';
    aviso.classList.remove('modo-teste');
  }
  const status = document.getElementById('minuta-ia-status');
  if(status) status.textContent = 'Você prosseguiu sem IA. Nenhum conteúdo foi enviado para processamento.';
  passoMinutaLiberado = Math.max(passoMinutaLiberado, 2);
  atualizarNavegacaoMinuta();
  mostrarPassoMinuta(2);
  toast('Conteúdo pronto para revisão.', 'valido');
}

async function gerarDescricaoReuniaoComIA(){
  const reuniao = obterReuniaoMinutaAtual();
  const campoTranscricao = document.getElementById('minuta-reuniao-transcricao');
  const transcricao = limitarTexto(campoTranscricao?.value.trim(), 20000);
  if(!reuniao || !transcricao){
    mostrarErroCampo(campoTranscricao, 'Insira a transcrição, as anotações ou um resumo da reunião.');
    campoTranscricao?.focus();
    return;
  }
  limparErroCampo(campoTranscricao);
  const botao = document.getElementById('btn-gerar-descricao-ia');
  const status = document.getElementById('minuta-ia-status');
  botao.disabled = true;
  botao.textContent = 'Editando...';
  if(status) status.textContent = 'A IA está editando e organizando a transcrição...';
  try{
    const resultado = await solicitarDescricaoReuniaoIA({
      reuniao:{
        id:reuniao.id,
        colegiado:reuniao.frequencia,
        data:reuniao.data,
        horario:reuniao.horario,
        pauta:reuniao.pauta,
        membros:normalizarMembros(reuniao.membros, reuniao.frequencia),
        convidados:normalizarParticipantes(reuniao.convidados ?? reuniao.participantes)
      },
      transcricao,
      saidaEsperada:{
        descricao:'Descrição dos problemas, solicitações e deliberações em texto formal.',
        providencias:'Providências separadas, com responsáveis e prazos quando mencionados.'
      }
    });
    const descricao = limitarTexto(String(resultado?.descricao || '').trim(), 5000);
    if(!descricao) throw new Error('A IA não retornou uma descrição válida.');
    definirTextoEditorMinuta('minuta-reuniao-descricao', descricao);
    const providencias = limitarTexto(String(resultado?.providencias || 'Não foram registradas providências.').trim(), 3000);
    definirTextoEditorMinuta('minuta-reuniao-providencias', providencias);
    const avisoRevisao = document.getElementById('minuta-revisao-aviso');
    avisoRevisao.textContent = 'Conteúdo gerado pela IA. Revise antes de criar a ata.';
    avisoRevisao.classList.remove('modo-teste');
    if(status) status.textContent = 'Descrição e providências geradas. Revise os textos antes de criar a ata.';
    passoMinutaLiberado = Math.max(passoMinutaLiberado, 2);
    atualizarNavegacaoMinuta();
    mostrarPassoMinuta(2);
    toast('Conteúdo organizado para revisão.', 'valido');
  }catch(e){
    if(status) status.textContent = e.message || 'Não foi possível editar com IA. Use Prosseguir para revisar manualmente.';
    toast('A edição com IA não foi realizada. O texto original foi preservado; use Prosseguir.', 'alerta');
  }finally{
    botao.disabled = false;
    botao.textContent = 'Editar com IA';
  }
}
