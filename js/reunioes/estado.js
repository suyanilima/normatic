/* ===== NÚCLEO E ESTADO COMPARTILHADO DE REUNIÕES ===== */

/* ===== REUNIÕES: cadastro e histórico local ===== */

const REUNIOES_STORAGE_KEY = 'igov:reunioes';
const MINUTAS_STORAGE_KEY = 'igov:minutas';
const UNIDADES_STORAGE_KEY = 'igov:unidades-reuniao';
const FREQUENCIAS_REUNIAO = { CGOVTIC:'Bimestral', CGTIC:'Quinzenal' };
const CARGOS_FIXOS_REUNIAO = {
  CGTIC: [
    { cargo:'Secretaria de Tecnologia da Informação', nome:'Cleilton de Nazare Costa' },
    { cargo:'Coordenadoria de Soluções Corporativas', nome:'Ilis Sandro Antônio Areno Ambrózio' },
    { cargo:'Coordenadoria de Infraestrutura', nome:'Francisco Vital de Mascarenhas Filho' }
  ],
  CGOVTIC: [
    { cargo:'Diretoria-Geral', nome:'Lois Carlos Arruda' },
    { cargo:'Secretaria de Tecnologia da Informação', nome:'Cleilton de Nazare Costa' },
    { cargo:'Secretaria de Administração, Orçamento e Finanças', nome:'Carlos Venícius Ferreira Ribeiro' },
    { cargo:'Secretaria Judiciária', nome:'Sandro Roberto de Oliveira Bezerra' },
    { cargo:'Coordenadoria da Corregedoria Regional Eleitoral', nome:'Jonathas Santos Almeida de Carvalho' }
  ]
};
let unidadesPersonalizadas = [];
let membrosNovaUnidade = [];
let unidadeEditandoCodigo = null;
let unidadeExcluindoCodigo = null;
let reunioes = [];
let participantesReuniaoCadastro = [];
let participantesReuniaoEdicao = [];
let membrosReuniaoCadastro = [];
let membrosReuniaoEdicao = [];
let reuniaoEditandoId = null;
let excluindoReuniaoId = null;
let minutaReuniaoId = null;
let minutaHistoricoReuniao = null;
let minutaHistoricoIdAtivo = null;
let excluindoMinutaId = null;
let minutasHistorico = [];
let passoMinutaLiberado = 1;
let paginaReunioes = 1;
let itensPorPaginaReunioes = 10;
let paginaAtas = 1;
let itensPorPaginaAtas = 10;

function normalizarParticipantes(valor){
  const lista = Array.isArray(valor) ? valor : String(valor || '').split(/[\n,;]+/);
  return lista
    .map(nome => limitarTexto(String(nome).trim(), 180))
    .filter(Boolean)
    .slice(0, 30);
}

function normalizarFormatoReuniao(valor){
  return valor === 'Presencial' ? 'Presencial' : 'Online';
}

function rotuloFormatoReuniao(valor){
  return normalizarFormatoReuniao(valor) === 'Presencial' ? 'Presencial' : 'On-line';
}

function formatarConvidadoComSetor(valor, siglaSelecionada=''){
  const texto = limitarTexto(String(valor || '').trim(), 80);
  const sigla = String(siglaSelecionada || '').trim().toUpperCase();
  if(sigla && SETORES_CONVIDADOS[sigla]){
    return limitarTexto(`${formatarNomeProprio(texto)} (${sigla})`, 180);
  }
  const correspondencia = texto.match(/^(.*?)\s*\(([^()]*)\)\s*$/);
  if(!correspondencia) return formatarNomeProprio(texto);
  const nome = formatarNomeProprio(correspondencia[1].trim());
  const setor = correspondencia[2].trim().toUpperCase();
  return limitarTexto(`${nome} (${setor})`, 180);
}

function resumirConvidadoParaExibicao(valor){
  return String(valor || '').replace(/\s*\(([^()—]+?)\s+—\s+[^()]+\)\s*$/, ' ($1)');
}

function normalizarMembros(valor, tipo){
  const recebidos = Array.isArray(valor) ? valor : [];
  const padroes = CARGOS_FIXOS_REUNIAO[tipo];
  if(!padroes) return recebidos.slice(0, 30).map(item => ({ cargo:limitarTexto(String(item?.cargo || '').trim(), 50), nome:limitarTexto(String(item?.nome || '').trim(), 50) })).filter(item => item.cargo);
  return padroes.map((padrao, indice) => {
    const recebido = recebidos.find(item => item?.cargo === padrao.cargo) || recebidos[indice];
    return {
      cargo: padrao.cargo,
      nome: limitarTexto(String(recebido ? recebido.nome : padrao.nome).trim(), 50)
    };
  });
}
