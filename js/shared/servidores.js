/* ===== CATÁLOGO DE SERVIDORES E MEMBROS DO TRE-AC (BUSCA + GESTÃO + AUTO-CADASTRO) ===== */

const CHAVE_SERVIDORES_CATALOGO = 'normatic:servidores-catalogo:v1';
const CHAVE_SERVIDORES_EXTRAS_LEGADO = 'normatic:servidores-extras:v1';

// Base oficial: Resolução 102 CNJ - Anexo V (TRE-AC, Agosto/2026) — exceto Removidos
const SERVIDORES_TRE_SEED = [
  ['Adenilson Pontes Silva', 'AGEL', 'Técnico Judiciário'],
  ['Adriana Carvalho de Oliveira', '4ª ZE', 'Técnico Judiciário'],
  ['Agatha Pontes Silva Galgani', 'SEDES', 'Técnico Judiciário'],
  ['Aieza dos Santos Bandeira', 'CRIP', 'Analista Judiciário'],
  ['Almir de Araújo Lima', 'SEPAG', 'Técnico Judiciário'],
  ['Altamiro Lima da Silva', 'SGEC', 'Analista Judiciário'],
  ['Ana Cátia Andrade Galdino', 'EJE', 'Analista Judiciário'],
  ['Antônia Geanne Araújo de Sousa', 'ASPLAN', 'Analista Judiciário'],
  ['Antonio Carlos Ferreira da Silva', '5ª ZE', 'Analista Judiciário'],
  ['Antonio Teixeira Júnior', 'SEGLOF', 'Técnico Judiciário'],
  ['Auricélio Martins da Silva', 'NISIPJ', 'Técnico Judiciário'],
  ['Beatriz Pacífico de Assis', 'SCLC', 'Técnico Judiciário'],
  ['Benjamim Abecassis Júnior', 'ASJUIZ', 'Técnico Judiciário'],
  ['Benjamim Rodrigues Lima Neto', '3ª ZE', 'Analista Judiciário'],
  ['Bianka da Costa Cardoso', 'ASJUIZ', 'Técnico Judiciário'],
  ['Breno Bezerra de Souza', 'ASJUR', 'Técnico Judiciário'],
  ['Bruna Silva Brasil', 'ASJUIZ', 'Técnico Judiciário'],
  ['Carla Gomes Mendes Diniz', '5ª ZE', 'Técnico Judiciário'],
  ['Carlos Alberto Cidral', 'SLC', 'Técnico Judiciário'],
  ['Carlos Lara Santos', '3ª ZE', 'Técnico Judiciário'],
  ['Carlos Venícius Ferreira Ribeiro', 'SAOF', 'Analista Judiciário'],
  ['Cleiber Oliveira de Castro', 'SSU', 'Técnico Judiciário'],
  ['Cleilton de Nazaré Costa', 'SCPE', 'Técnico Judiciário'],
  ['Clícia Quintela Freitas', 'AGEL', 'Técnico Judiciário'],
  ['Cristiane Melo de Souza Firmino', 'COGEP', 'Técnico Judiciário'],
  ['Danilo Monteiro de Barros', 'SEDES', 'Técnico Judiciário'],
  ['Deborah Karen Cavalcante Costa', 'SRJAR', 'Técnico Judiciário'],
  ['Dulcileide Rebouças de Mesquita Dalacosta', 'SAREMI', 'Analista Judiciário'],
  ['Edcley da Silva Firmino', 'STI', 'Técnico Judiciário'],
  ['Edilson Duarte Lima Junior', '1ª ZE', 'Técnico Judiciário'],
  ['Ellen Cristina Silva de Oliveira', 'ASGOVSAOF', 'Técnico Judiciário'],
  ['Erismar Oliveira de Almeida', 'SECARF', 'Técnico Judiciário'],
  ['Eronilson Martins Cordeiro', 'SLDAG', 'Técnico Judiciário'],
  ['Everton Negreiros Lira', '2ª ZE', 'Analista Judiciário'],
  ['Fabíola Crisóstomo Jucá', 'GAJUD', 'Técnico Judiciário'],
  ['Fernando Jorge da Silva e Sousa', 'SEAD', 'Técnico Judiciário'],
  ['Felipe Bezerra Lima', 'SDBD', 'Técnico Judiciário'],
  ['Fernando José Santos Silva', 'SOC', 'Técnico Judiciário'],
  ['Francisca Rosicléia Oliveira da Silva', '9ª ZE', 'Técnico Judiciário'],
  ['Francisco Cláudio Barbosa Paes', 'SLDAG', 'Técnico Judiciário'],
  ['Francisco das Chagas Monteiro de Santana', 'AGECON', 'Técnico Judiciário'],
  ['Francisco Vital de Mascarenhas Filho', 'CIE', 'Técnico Judiciário'],
  ['Gabriel Lameira de Oliveira', '6ª ZE', 'Técnico Judiciário'],
  ['Gustavo Lima Niemeyer', 'SECEP', 'Analista Judiciário'],
  ['Helton Santiago Mâcedo', 'SECAP', 'Analista Judiciário'],
  ['Igor Chaves de Medeiros', 'SECON', 'Analista Judiciário'],
  ['Igor Guerra Gomes Rangel', '9ª ZE', 'Técnico Judiciário'],
  ['Ilis Sandro Antonio Areno Ambrozio', 'CSCOR', 'Técnico Judiciário'],
  ['Japhinis de Paiva Costa Albuquerque', 'OUVIDORIA', 'Analista Judiciário'],
  ['Jaqueline Bezerra de Albuquerque Assem', 'ASPLAN', 'Técnico Judiciário'],
  ['Jean Carlos Freire Lima', 'SPEO', 'Técnico Judiciário'],
  ['João Antonio Gularte Sena', '8ª ZE', 'Analista Judiciário'],
  ['João Batista Bento da Silva', 'COMAP', 'Técnico Judiciário'],
  ['João Carlos de Godoy', 'COSEG', 'Técnico Judiciário'],
  ['Jonathan Messias e Silva', 'SEREDE', 'Técnico Judiciário'],
  ['Jonathas Santos Almeida de Carvalho', 'COCRE', 'Analista Judiciário'],
  ['José Edson Vieira Paiva', 'NISIPJ', 'Técnico Judiciário'],
  ['José Eduardo dos Santos Bernardino', 'COFIN', 'Técnico Judiciário'],
  ['Jose Jair Cavalcante de Figueiredo', 'ASPLAN', 'Analista Judiciário'],
  ['José Francisco da Silva Galvão', 'ASPLAN', 'Técnico Judiciário'],
  ['Juliana Balizardo de Oliveira', 'SEANT', 'Técnico Judiciário'],
  ['Karen Mesquita da Silva Teixeira da Rocha', 'GAPRES', 'Técnico Judiciário'],
  ['Karina de Freitas Dotto Gondim', 'SPEO', 'Técnico Judiciário'],
  ['Keith Wilian Bandeira Macedo', 'SSEC', 'Técnico Judiciário'],
  ['Lais Estela Moreira Figueiredo', '6ª ZE', 'Analista Judiciário'],
  ['Leandro Oliveira de Queiroz', '2ª ZE', 'Técnico Judiciário'],
  ['Lidiane Castro Pires', 'NULAB', 'Técnico Judiciário'],
  ['Luciana de Arruda Macedo Santos', 'ASPRES', 'Analista Judiciário'],
  ['Luciane Socorro Ferreira Medeiros', 'GASAOF', 'Técnico Judiciário'],
  ['Lucir Rocio Vaz', 'SDBD', 'Analista Judiciário'],
  ['Luiz Antonio Barroso Valli', '1ª ZE', 'Analista Judiciário'],
  ['Manoel Raimundo de Souza', 'SGEC', 'Técnico Judiciário'],
  ['Marcus José Lima de Barros', 'SEGLOF', 'Técnico Judiciário'],
  ['Maria Clara Carlos Luna Silvério', 'ASCRE', 'Técnico Judiciário'],
  ['Maria de Fátima do Nascimento', 'SLDAG', 'Analista Judiciário'],
  ['Maria Goretti Hadad Farias', 'SRJAR', 'Analista Judiciário'],
  ['Maria Lúcia Gabriel Fontes da Silva', 'ASJUIZ', 'Técnico Judiciário'],
  ['Maria Verônica da Costa', 'DG', 'Analista Judiciário'],
  ['Marijone Pinheiro de Araújo', 'COSES', 'Analista Judiciário'],
  ['Messias Braga de Carvalho', '8ª ZE', 'Técnico Judiciário'],
  ['Michela Albuquerque Paes', 'SEUE', 'Técnico Judiciário'],
  ['Nathalia Andrade Silva Lima', 'SECON', 'Analista Judiciário'],
  ['Orfeu Bento Assem', 'SETRAN', 'Técnico Judiciário'],
  ['Pablo de Freitas Alves', '9ª ZE', 'Analista Judiciário'],
  ['Patrícia Tieme Imada', 'COAUDI', 'Analista Judiciário'],
  ['Paulo Roberto Pereira de Souza', 'SEPAG', 'Técnico Judiciário'],
  ['Raimundo Denis dos Anjos', 'SPEF', 'Técnico Judiciário'],
  ['Raimundo Francisco de Souza Junior', 'SEPAG', 'Técnico Judiciário'],
  ['Raimundo Ferreira Vital', 'SETRAN', 'Técnico Judiciário'],
  ['Reinaldo Colares Franco', 'ASJUIZ', 'Analista Judiciário'],
  ['Renata dos Santos Maia', 'SECAP', 'Técnico Judiciário'],
  ['Renata Nogueira Colaça Pires', 'ASPLAN', 'Técnico Judiciário'],
  ['Reniele Gomes Moreira', 'SEAPTIC', 'Técnico Judiciário'],
  ['Rinauro Souza Santos Júnior', 'SASBEN', 'Analista Judiciário'],
  ['Roberval Santos Cavalcante Neto', '7ª ZE', 'Técnico Judiciário'],
  ['Rogério Ferreira de Sousa', 'SRDP', 'Analista Judiciário'],
  ['Ronaldo Braga de Paula', 'SEAD', 'Técnico Judiciário'],
  ['Rosangela Rodrigues Cordeiro', '7ª ZE', 'Analista Judiciário'],
  ['Rosimar Rodrigues Lima', 'SEREDE', 'Técnico Judiciário'],
  ['Sander Samuel Nascimento Araripe', 'SECEP', 'Analista Judiciário'],
  ['Sandro Roberto de Oliveira Bezerra', 'SEJUD', 'Analista Judiciário'],
  ['Sérgio Luíz Mariano de Almeida', 'SEAPTIC', 'Analista Judiciário'],
  ['Sharlene Lira Sandra de Vasconcelos', 'SEDES', 'Técnico Judiciário'],
  ['Sidney Brandão Mendes', 'SCPE', 'Técnico Judiciário'],
  ['Silvio Forastiero Frazão', 'SCSEG', 'Técnico Judiciário'],
  ['Soliana Vieira e Silva', '1ª ZE', 'Técnico Judiciário'],
  ['Suellen da Costa Vieira Soler', 'ASGIM', 'Analista Judiciário'],
  ['Thallys Bandeira Roque Maia Pinto', 'SDBD', 'Técnico Judiciário'],
  ['Valéria Assis Lima', 'AGEL', 'Analista Judiciário'],
  ['Vinicius Coelho Araujo', '2ª ZE', 'Analista Judiciário'],
  ['Viviani Czarnecki Mayorquim', 'SEGLOF', 'Analista Judiciário'],
  ['Washington dos Reis Leite', 'SASBEN', 'Analista Judiciário'],
  ['Yasmim de Jesus Gaertner', 'SLDAG', 'Analista Judiciário'],
  ['Zanúbia Rodrigues Pereira', 'SEANT', 'Analista Judiciário'],
  ['Roselha Gondim dos Santos Pardo', 'TRF1', 'Técnico Judiciário'],
  ['Daniele Carlos de Oliveira Nunes', 'ASCOM', 'Assessor II'],
  ['Glayson Jean Moreno Dantas', 'NISIPJ', 'Assessor I'],
  ['Raphael Batista da Silva', 'ASPRES', 'Assessor I'],
  ['Valma Veloso', 'GACRE', 'Chefe de Gabinete'],
  ['Antonia Pereira da Costa', '5ª ZE', 'Recepcionista'],
  ['Aureni Pereira Feitosa', 'GSTI', 'Agente Administrativo'],
  ['Diego Cesar Ribeiro de Matos', 'SEMAP', 'Técnico Judiciário'],
  ['Ellen Cristina Enes Valentim da Silva', 'GAPRES', 'Técnico Judiciário'],
  ['Gleyson Menezes Moreira', 'SEMAP', 'Técnico Administrativo Educacional'],
  ['Irisnaila Lima Belém', 'SASBEN', 'Gestora de Políticas Públicas'],
  ['Janice Ribeiro Lima', 'DG', 'Técnico em Gestão Pública'],
  ['Laila Oliveira Barros', 'SPEF', 'Gestora de Políticas Públicas'],
  ['Marcio Venicius Santos de Oliveira', 'ASGIM', 'Engenheiro Civil'],
  ['Marco Aurélio Bortoli', 'SDBD', 'Analista de Sistemas Pleno'],
  ['Maria Francisca da Conceição Ferreira', 'SECEP', 'Agente Administrativo'],
  ['Maria Alessandra Pinto Dantas', 'SCLC', 'Técnico em Gestão Pública'],
  ['Maria Lucinda Aguiar Passos', '7ª ZE', 'Agente Administrativo'],
  ['Marivan Lima Nobre', 'SPEO', 'Gestor de Políticas Públicas'],
  ['Mayra Danieli Almeida de Oliveira', '4ª ZE', 'Contador'],
  ['Myria Greyce Mendes de Souza Castro', 'ASJUR', 'Técnico Judiciário'],
  ['Rodolfo Quiroga Elias', 'ASGIM', 'Arquiteto'],
  ['Rose Jocely Lopes dos Santos Moreira', 'GSTI', 'Agente Administrativo'],
  ['Sheila Maria dos Santos Carvalho', 'SDP', 'Escriturária'],
  ['Suzy Imaculada de Oliveira Lira Leal', 'SECARF', 'Especialista Executivo'],
  ['Wanderley Vasconcelos da Silva', 'SEUE', 'Auxiliar de Proc. de Dados'],
  ['Waldirene Oliveira da Cruz-Lima Cordeiro', 'CORTE', 'Desembargadora'],
  ['Lois Carlos Arruda', 'CORTE', 'Desembargador'],
  ['Denise Castelo Bonfim', 'CORTE', 'Desembargadora Substituta'],
  ['Roberto Barros dos Santos', 'CORTE', 'Desembargador Substituto'],
  ['Rogéria José Epaminondas Mesquita', 'CORTE', 'Juíza de Direito'],
  ['Lilian Deise Braga Paiva', 'CORTE', 'Juíza de Direito'],
  ['Luana Cláudia de Albuquerque Campos', 'CORTE', 'Juíza de Direito Substituta'],
  ['Leandro Leri Gross', 'CORTE', 'Juiz de Direito Substituto'],
  ['Jair Araújo Facundes', 'CORTE', 'Juiz Federal'],
  ['Luzia Farias da Silva Mendonça', 'CORTE', 'Juíza Federal Substituta'],
  ['Thalles Vinicius de Souza Sales', 'CORTE', 'Jurista'],
  ['Luciano Oliveira de Melo', 'CORTE', 'Jurista Substituto'],
  ['Emerson Silva Costa', 'CORTE', 'Jurista Substituto'],
  ['Vitor Hugo Caldeira Teodoro', 'MPE', 'Procurador Regional Eleitoral'],
  ['Fernando José Piazenski', 'MPE', 'Procurador Regional Eleitoral Substituto'],
  ['Isabelle Sacramento Torturela', 'GAPRES', 'Juíza Auxiliar da GAPRES'],
  ['Fábio Alexandre Costa de Farias', 'GACRE', 'Juiz Auxiliar da Corregedoria'],
  ['Luís Gustavo Alcalde Pinto', '2ª ZE', 'Juiz Eleitoral'],
  ['Caique Cirano Di Paula', '3ª ZE', 'Juiz Eleitoral'],
  ['Rosilene de Santana Souza', '4ª ZE', 'Juíza Eleitoral'],
  ['Stéphanie Winck Ribeiro de Moura', '5ª ZE', 'Juíza Eleitoral'],
  ['José Leite de Paula Neto', '6ª ZE', 'Juiz Eleitoral'],
  ['Gabriela Rodrigues Elleres', '7ª ZE', 'Juíza Eleitoral'],
  ['Romário Divino Farias', '8ª ZE', 'Juiz Eleitoral'],
  ['Gustavo Sirena', '9ª ZE', 'Juiz Eleitoral'],
  ['Dayan Moreira Albuquerque', '1ª ZE', 'Promotor Eleitoral'],
  ['Glaucio Ney Shiroma Oshiro', '1ª ZE', 'Promotor Eleitoral Substituto'],
  ['Renan Augusto Conçalves Batista', '2ª ZE', 'Promotor Eleitoral'],
  ['Wendelson Mendonça da Cunha', '2ª ZE', 'Promotor Eleitoral Substituto'],
  ['Júlia Fernandes de Brito', '3ª ZE', 'Promotora Eleitoral'],
  ['Rejane Mara dos Santos', '3ª ZE', 'Promotor Eleitoral Substituto'],
  ['Thiago Marques Salomão', '4ª ZE', 'Promotor Eleitoral'],
  ['Manuela Canuto de Santana Farhat', '4ª ZE', 'Promotor Eleitoral Substituto'],
  ['Lucas Ferreira Buno Iwakami de Mattos', '5ª ZE', 'Promotor Eleitoral'],
  ['Caroline Caldas Correia', '5ª ZE', 'Promotora Eleitoral Substituta'],
  ['Luã Brito Barbosa', '6ª ZE', 'Promotora Eleitoral'],
  ['Giovana Kahata de Toledo Postali Stachetti', '7ª ZE', 'Promotora Eleitoral'],
  ['Giselle Luiza Silva', '7ª ZE', 'Promotor Eleitoral Substituto'],
  ['Fernando Henrique Santos Terra', '8ª ZE', 'Promotora Eleitoral'],
  ['Vanderlei Batista Cerqueira', '8ª ZE', 'Promotor Eleitoral Substituto'],
  ['Nelma Araújo Melo de Siqueira', '9ª ZE', 'Promotor Eleitoral'],
  ['Marcela Cristina Ozório', '9ª ZE', 'Promotora Eleitoral Substituta']
];

function normalizarTextoBuscaServidor(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function normalizarSetorServidor(setor) {
  const s = String(setor || '').trim();
  if (!s) return '';
  const mZona = s.match(/^([1-9])ª?\s*zona\s*eleitoral$/i);
  if (mZona) return `${mZona[1]}ª ZE`;
  if (/^ouvidou?ria$/i.test(s)) return 'OUVIDORIA';
  if (/^corte\s*eleitoral$/i.test(s)) return 'CORTE';
  const upper = s.toUpperCase();
  if (typeof SETORES_CONVIDADOS === 'object' && SETORES_CONVIDADOS && SETORES_CONVIDADOS[upper]) return upper;
  return upper;
}

function normalizarItemServidor(item, indiceFallback = 0) {
  const idBruto = String(item?.id || '').trim();
  const idValido = /^[A-Za-z0-9][A-Za-z0-9:_ .-]{0,99}$/.test(idBruto)
    ? idBruto
    : `srv-tre-${String(indiceFallback + 1).padStart(3, '0')}`;
  return {
    id: idValido,
    nome: String(item?.nome || '').trim().slice(0, 120),
    setor: normalizarSetorServidor(item?.setor || item?.lotacao || item?.unidade || '').slice(0, 40),
    cargo: String(item?.cargo || '').trim().slice(0, 120),
    email: String(item?.email || '').trim().slice(0, 140),
    whatsapp: String(item?.whatsapp || item?.telefone || '').trim().slice(0, 40)
  };
}

function gerarListaSeedServidores() {
  const base = SERVIDORES_TRE_SEED.map(([nome, setor, cargo], idx) => normalizarItemServidor({
    id: `srv-tre-${String(idx + 1).padStart(3, '0')}`,
    nome,
    setor,
    cargo,
    email: '',
    whatsapp: ''
  }, idx));

  try {
    const legadoRaw = localStorage.getItem(CHAVE_SERVIDORES_EXTRAS_LEGADO);
    if (legadoRaw) {
      const legado = JSON.parse(legadoRaw);
      if (Array.isArray(legado)) {
        legado.forEach((ext, i) => {
          const nomeNorm = normalizarTextoBuscaServidor(ext?.nome);
          if (!nomeNorm) return;
          const existente = base.find(b => normalizarTextoBuscaServidor(b.nome) === nomeNorm);
          if (existente) {
            existente.setor = normalizarSetorServidor(ext.setor || existente.setor);
            existente.cargo = String(ext.cargo || existente.cargo || '').trim();
            existente.email = String(ext.email || existente.email || '').trim();
            existente.whatsapp = String(ext.whatsapp || existente.whatsapp || '').trim();
          } else {
            base.push(normalizarItemServidor({
              id: `srv-ext-${i + 1}`,
              ...ext
            }, base.length));
          }
        });
      }
    }
  } catch (_) {}

  return base;
}

function obterJanelaHospedeiraServidores() {
  try {
    if (window.parent && window.parent !== window && typeof window.parent.obterCatalogoServidores === 'function') {
      return window.parent;
    }
  } catch (_) {}
  return null;
}

function inicializarCacheServidoresLocal() {
  if (Array.isArray(window._servidoresTreCache)) return window._servidoresTreCache;
  try {
    const salvo = localStorage.getItem(CHAVE_SERVIDORES_CATALOGO);
    if (salvo !== null) {
      const parsed = JSON.parse(salvo);
      if (Array.isArray(parsed)) {
        window._servidoresTreCache = parsed
          .map((item, idx) => normalizarItemServidor(item, idx))
          .filter(item => item.nome);
        return window._servidoresTreCache;
      }
    }
  } catch (_) {}
  window._servidoresTreCache = gerarListaSeedServidores();
  return window._servidoresTreCache;
}

function persistirCacheServidoresLocal(lista) {
  window._servidoresTreCache = lista.map((item, idx) => normalizarItemServidor(item, idx)).filter(item => item.nome);
  try {
    localStorage.setItem(CHAVE_SERVIDORES_CATALOGO, JSON.stringify(window._servidoresTreCache));
  } catch (_) {}
}

function obterCatalogoServidores() {
  const hospedeira = obterJanelaHospedeiraServidores();
  if (hospedeira) return hospedeira.obterCatalogoServidores();
  const lista = inicializarCacheServidoresLocal();
  return [...lista].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

async function carregarServidoresSistema() {
  const hospedeira = obterJanelaHospedeiraServidores();
  if (hospedeira && typeof hospedeira.carregarServidoresSistema === 'function') {
    return hospedeira.carregarServidoresSistema();
  }
  inicializarCacheServidoresLocal();
  if (window.NormaticCloud?.enabled && window.NormaticCloud.ready && typeof window.NormaticCloud.readServidores === 'function') {
    try {
      const remoto = await window.NormaticCloud.readServidores();
      if (Array.isArray(remoto)) {
        persistirCacheServidoresLocal(remoto);
      }
    } catch (_) {
      /* Mantém cache local se a leitura em nuvem falhar temporariamente. */
    }
  }
  return obterCatalogoServidores();
}

function gerarNovoIdServidor() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `srv-${crypto.randomUUID()}`;
  }
  return `srv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function salvarServidorSistema(dados = {}) {
  const hospedeira = obterJanelaHospedeiraServidores();
  if (hospedeira && typeof hospedeira.salvarServidorSistema === 'function') {
    return hospedeira.salvarServidorSistema(dados);
  }
  const nomeBruto = String(dados.nome || '').trim();
  const nome = typeof formatarNomeProprio === 'function' ? formatarNomeProprio(nomeBruto) : nomeBruto;
  if (!nome || nome.length < 2) throw new Error('Informe o nome completo do servidor ou membro.');

  const atual = inicializarCacheServidoresLocal();
  const snapshotAnterior = atual.map(item => ({ ...item }));
  const idExistente = String(dados.id || '').trim();
  const idxPorId = idExistente ? atual.findIndex(item => item.id === idExistente) : -1;
  const chaveNome = normalizarTextoBuscaServidor(nome);
  const idxPorNome = idxPorId < 0 ? atual.findIndex(item => normalizarTextoBuscaServidor(item.nome) === chaveNome) : -1;
  const idxAlvo = idxPorId >= 0 ? idxPorId : idxPorNome;
  const baseAnterior = idxAlvo >= 0 ? atual[idxAlvo] : null;

  const registro = normalizarItemServidor({
    id: baseAnterior?.id || idExistente || gerarNovoIdServidor(),
    nome,
    setor: dados.setor !== undefined ? dados.setor : (baseAnterior?.setor || ''),
    cargo: dados.cargo !== undefined ? dados.cargo : (baseAnterior?.cargo || ''),
    email: dados.email !== undefined ? dados.email : (baseAnterior?.email || ''),
    whatsapp: dados.whatsapp !== undefined ? dados.whatsapp : (baseAnterior?.whatsapp || '')
  }, atual.length);

  const proximaLista = [...atual];
  if (idxAlvo >= 0) proximaLista[idxAlvo] = registro;
  else proximaLista.push(registro);
  persistirCacheServidoresLocal(proximaLista);

  if (window.NormaticCloud?.enabled && window.NormaticCloud.ready && typeof window.NormaticCloud.upsertServidor === 'function') {
    try {
      await window.NormaticCloud.upsertServidor(registro);
    } catch (error) {
      persistirCacheServidoresLocal(snapshotAnterior);
      throw error;
    }
  }
  return registro;
}

async function excluirServidorSistema(id) {
  const hospedeira = obterJanelaHospedeiraServidores();
  if (hospedeira && typeof hospedeira.excluirServidorSistema === 'function') {
    return hospedeira.excluirServidorSistema(id);
  }
  const alvoId = String(id || '').trim();
  if (!alvoId) return false;
  const atual = inicializarCacheServidoresLocal();
  const snapshotAnterior = atual.map(item => ({ ...item }));
  const proximaLista = atual.filter(item => item.id !== alvoId);
  if (proximaLista.length === atual.length) return false;
  persistirCacheServidoresLocal(proximaLista);

  if (window.NormaticCloud?.enabled && window.NormaticCloud.ready && typeof window.NormaticCloud.deleteServidor === 'function') {
    try {
      await window.NormaticCloud.deleteServidor(alvoId);
    } catch (error) {
      persistirCacheServidoresLocal(snapshotAnterior);
      throw error;
    }
  }
  return true;
}

async function registrarServidorNoSistema(dados = {}) {
  const hospedeira = obterJanelaHospedeiraServidores();
  if (hospedeira && typeof hospedeira.registrarServidorNoSistema === 'function') {
    return hospedeira.registrarServidorNoSistema(dados);
  }
  const nome = String(dados.nome || '').trim();
  if (!nome || nome.length < 2) return;
  const setor = normalizarSetorServidor(dados.setor || '');
  const cargo = String(dados.cargo || '').trim();
  const email = String(dados.email || '').trim();
  const whatsapp = String(dados.whatsapp || '').trim();
  const chave = normalizarTextoBuscaServidor(nome);

  const atual = inicializarCacheServidoresLocal();
  const existente = atual.find(item => normalizarTextoBuscaServidor(item.nome) === chave);

  if (existente) {
    const novoSetor = setor || existente.setor;
    const novoCargo = cargo || existente.cargo;
    const novoEmail = email || existente.email;
    const novoWhats = whatsapp || existente.whatsapp;
    const mudou = novoSetor !== existente.setor
      || novoCargo !== existente.cargo
      || novoEmail !== existente.email
      || novoWhats !== existente.whatsapp;
    if (!mudou) return;
    try {
      await salvarServidorSistema({
        id: existente.id,
        nome: existente.nome,
        setor: novoSetor,
        cargo: novoCargo,
        email: novoEmail,
        whatsapp: novoWhats
      });
    } catch (_) {}
    return;
  }

  try {
    await salvarServidorSistema({ nome, setor, cargo, email, whatsapp });
  } catch (_) {
    /* Mantém fluxo principal sem bloquear o salvamento de normativos ou reuniões. */
  }
}

function configurarBuscaServidor(campoNomeId, opcoes = {}) {
  const campo = typeof campoNomeId === 'string' ? document.getElementById(campoNomeId) : campoNomeId;
  if (!campo || campo._buscaServidorConfigurada || typeof campo.addEventListener !== 'function') return;
  campo._buscaServidorConfigurada = true;

  let wrap = campo.parentElement;
  if (!wrap || !wrap.classList.contains('servidor-busca-wrap')) {
    wrap = document.createElement('div');
    wrap.className = 'servidor-busca-wrap';
    campo.parentNode.insertBefore(wrap, campo);
    wrap.appendChild(campo);
  }
  campo.setAttribute('autocomplete', 'off');

  const sugestoes = document.createElement('div');
  sugestoes.className = 'setor-sugestoes servidor-sugestoes';
  sugestoes.setAttribute('role', 'listbox');
  sugestoes.hidden = true;
  wrap.appendChild(sugestoes);

  let itensVisiveis = [];
  const esconder = () => { sugestoes.hidden = true; };

  const atualizar = () => {
    const termoBruto = campo.value.trim();
    const termo = normalizarTextoBuscaServidor(termoBruto);
    const catalogo = obterCatalogoServidores();
    const filtrados = catalogo.filter(item => {
      if (!termo) return true;
      const nomeSetor = (typeof SETORES_CONVIDADOS === 'object' && SETORES_CONVIDADOS?.[item.setor]) || '';
      const alvo = normalizarTextoBuscaServidor(`${item.nome} ${item.setor} ${nomeSetor} ${item.cargo}`);
      return alvo.includes(termo);
    });

    itensVisiveis = filtrados.slice(0, 40);
    const temExato = termo && catalogo.some(i => normalizarTextoBuscaServidor(i.nome) === termo);

    const htmlItens = itensVisiveis.map((item, idx) => {
      const rotuloSetor = item.setor
        ? (typeof formatarRotuloSetor === 'function' ? formatarRotuloSetor(item.setor) : item.setor)
        : 'Sem setor informado';
      const detalhe = [rotuloSetor, item.cargo].filter(Boolean).join(' · ');
      return `<button type="button" role="option" data-servidor-idx="${idx}"><strong class="setor-sugestao-sigla">${escapeHtml(item.nome)}</strong><span class="setor-sugestao-nome">${escapeHtml(detalhe)}</span></button>`;
    }).join('');

    const htmlNovo = (termoBruto.length >= 2 && !temExato && !opcoes.apenasSelecao)
      ? `<div class="servidor-sugestao-novo">Novo nome: <strong>${escapeHtml(termoBruto)}</strong> — preencha o setor para registrar automaticamente no sistema.</div>`
      : '';

    if (!htmlItens && !htmlNovo) {
      esconder();
      return;
    }
    sugestoes.innerHTML = htmlItens + htmlNovo;
    sugestoes.hidden = false;
  };

  campo.addEventListener('input', atualizar);
  campo.addEventListener('focus', atualizar);
  campo.addEventListener('keydown', evento => {
    if (evento.key === 'Escape') esconder();
  });
  campo.addEventListener('blur', () => setTimeout(esconder, 150));

  sugestoes.addEventListener('mousedown', evento => {
    const botao = evento.target.closest('[data-servidor-idx]');
    if (!botao) return;
    evento.preventDefault();
    const item = itensVisiveis[Number(botao.dataset.servidorIdx)];
    if (!item) return;

    if (typeof opcoes.aoSelecionar === 'function') {
      opcoes.aoSelecionar(item);
    } else {
      campo.value = item.nome;
      campo.dispatchEvent(new Event('input', { bubbles: true }));
      campo.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (opcoes.limparAoSelecionar) {
      campo.value = '';
    }

    if (opcoes.campoSetorId && item.setor) {
      const campoSetor = document.getElementById(opcoes.campoSetorId);
      if (campoSetor) {
        campoSetor.value = item.setor;
        if (typeof limparErroCampo === 'function') limparErroCampo(campoSetor);
        campoSetor.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    if (opcoes.campoEmailId && item.email) {
      const campoEmail = document.getElementById(opcoes.campoEmailId);
      if (campoEmail && !campoEmail.value.trim()) {
        campoEmail.value = item.email;
        if (typeof limparErroCampo === 'function') limparErroCampo(campoEmail);
      }
    }
    if (opcoes.campoWhatsappId && item.whatsapp) {
      const campoWhats = document.getElementById(opcoes.campoWhatsappId);
      if (campoWhats && !campoWhats.value.trim()) {
        campoWhats.value = item.whatsapp;
        if (typeof limparErroCampo === 'function') limparErroCampo(campoWhats);
      }
    }

    esconder();
  });
}
